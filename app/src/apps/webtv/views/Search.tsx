import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import MovieCard from '../components/MovieCard'
import { useSources } from '../components/SourcesProvider'
import { searchAllSites } from '../lib/api'
import type { VodItem } from '../lib/types'
import type { WebTVNav } from '../nav'

/**
 * 搜索页：跨站并发搜索 + 站点分组筛选（等价上游 SearchPage 的 doSearch +
 * searchSiteGroups）。上游由 /search?kw= 路由参数驱动，窗口版改为
 * shell 传入的初始关键词 + 页内输入。
 *
 * 结果缓存：shell 只渲染页面栈顶，进详情页时本组件整体卸载 —— 按关键词把
 * 已完成的搜索结果存进组件外快照，返回/重进搜索页时整份恢复（含滚动位置），
 * 不再重新搜索；结果一直保留到下一次搜索（显式重搜总是拉取最新，
 * 未搜完就离开的不缓存 —— 恢复一份冻结的半成品还不如重搜）。
 * 只存内存，会话内有效。
 */

interface SearchSnapshot {
  keyword: string
  results: VodItem[]
  siteFilter: string | number
  progress: { completed: number; total: number }
  scrollTop: number
}

const SEARCH_CACHE_MAX = 5
const searchCache = new Map<string, SearchSnapshot>()

export default function Search({ nav, initialKw = '' }: { nav: WebTVNav; initialKw?: string }) {
  const { sites } = useSources()

  const [keyword, setKeyword] = useState(initialKw)
  const [results, setResults] = useState<VodItem[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [siteFilter, setSiteFilter] = useState<string | number>('__all')
  const [progress, setProgress] = useState({ completed: 0, total: 0 })

  const contentRef = useRef<HTMLElement>(null)
  const pendingScrollRef = useRef(0)
  // 卸载清理时 ref 已被 React 摘除（StrictMode 下更是必然），不能在 cleanup 里读 DOM；
  // 用滚动事件持续记录当前位置，清理时只读这个 ref
  const scrollTopRef = useRef(0)

  // 离开搜索页（进详情等，组件整体卸载）时留存已完成的搜索现场
  const stateRef = useRef({
    keyword: '',
    results: [] as VodItem[],
    done: false,
    siteFilter: '__all' as string | number,
    progress: { completed: 0, total: 0 },
  })
  stateRef.current = { keyword, results, done, siteFilter, progress }

  useEffect(() => {
    return () => {
      const s = stateRef.current
      const kw = s.keyword.trim()
      // 未搜完的半成品不缓存：恢复一份冻结的中间态不如重搜
      if (!kw || !s.done) return
      searchCache.delete(kw)
      searchCache.set(kw, {
        keyword: kw,
        results: s.results,
        siteFilter: s.siteFilter,
        progress: s.progress,
        scrollTop: scrollTopRef.current,
      })
      while (searchCache.size > SEARCH_CACHE_MAX) {
        const oldest = searchCache.keys().next().value
        if (oldest === undefined) break
        searchCache.delete(oldest)
      }
    }
  }, [])

  const restoreSnapshot = (snap: SearchSnapshot) => {
    setKeyword(snap.keyword)
    setResults(snap.results)
    setSiteFilter(snap.siteFilter)
    setProgress(snap.progress)
    setDone(true)
    setLoading(false)
    pendingScrollRef.current = snap.scrollTop
  }

  const doSearch = useCallback(
    async (kw: string) => {
      const trimmed = kw.trim()
      if (!trimmed) return
      setLoading(true)
      setDone(false)
      setResults([])
      setSiteFilter('__all')
      setProgress({ completed: 0, total: 0 })
      try {
        const searchableSites = sites.filter((s) => s.searchable === 1)
        const targetSites = searchableSites.length > 0 ? searchableSites : sites
        const siteMap = new Map(targetSites.map((s) => [s.id, s]))
        const seen = new Set<string>()

        // 流式渐进：每到一个站点的结果立即合并上屏（按 站点+vod_id 去重）
        // 注意：去重计算必须在 updater 外完成 —— StrictMode 下 updater 会被调用两次，
        // 带副作用的 updater 会因第二次调用时 key 已存在而把结果全部丢掉
        await searchAllSites(targetSites, trimmed, (siteId, list, completed, total) => {
          setProgress({ completed, total })
          const site = siteMap.get(siteId)
          if (!site || list.length === 0) return
          const fresh = list
            .map((m) => ({ ...m, __siteId: site.id, __siteName: site.name }))
            .filter((m) => {
              if (!m.vod_name) return false
              const key = `${m.__siteId}_${m.vod_id}`
              if (seen.has(key)) return false
              seen.add(key)
              return true
            })
          if (fresh.length > 0) {
            setResults((prev) => [...prev, ...fresh])
          }
        })
      } finally {
        setLoading(false)
        setDone(true)
      }
    },
    [sites]
  )

  // 挂载决策：带关键词且缓存里有已完成的同词搜索 → 整份恢复；
  // 否则带词搜索；不带词打开搜索页 → 恢复上一次的搜索结果（直到下次搜索）
  useEffect(() => {
    const kw = initialKw.trim()
    if (kw) {
      const snap = searchCache.get(kw)
      if (snap) {
        restoreSnapshot(snap)
        return
      }
      doSearch(kw)
      return
    }
    const snaps = [...searchCache.values()]
    const last = snaps[snaps.length - 1]
    if (last) restoreSnapshot(last)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKw])

  // 恢复的结果渲染完成后回到离开时的滚动位置。图片解码/字体就绪会让内容高度
  // 持续变化，直接赋一次会被后续回流冲掉 —— 持续校正到「高度稳定且到达目标」
  // 或超时（2.5s）为止。
  useLayoutEffect(() => {
    if (pendingScrollRef.current > 0 && contentRef.current) {
      const target = pendingScrollRef.current
      const el = contentRef.current
      pendingScrollRef.current = 0
      const deadline = Date.now() + 2500
      let lastH = -1
      const attempt = () => {
        if (!contentRef.current || Date.now() > deadline) return
        const stable = el.scrollHeight === lastH
        lastH = el.scrollHeight
        el.scrollTop = target
        if (stable && Math.abs(el.scrollTop - target) <= 60) return
        requestAnimationFrame(attempt)
      }
      attempt()
    }
  })

  const siteGroups = (() => {
    const map = new Map<string, { id: string; name: string; count: number }>()
    results.forEach((m) => {
      const id = m.__siteId as string
      if (!map.has(id)) map.set(id, { id, name: (m.__siteName as string) || id, count: 0 })
      map.get(id)!.count++
    })
    return Array.from(map.values())
  })()

  const filtered = siteFilter === '__all' ? results : results.filter((m) => String(m.__siteId) === String(siteFilter))
  const stats = loading
    ? `已搜索 ${progress.completed}/${progress.total} 站 · 已找到 ${results.length} 个`
    : done
      ? `找到 ${results.length} 个结果`
      : ''

  return (
    <section
      className="content-area search-page"
      ref={contentRef}
      onScroll={(e) => { scrollTopRef.current = e.currentTarget.scrollTop }}
    >
      <div className="search-header">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="输入影片名称搜索..."
          onKeyDown={(e) => { if (e.key === 'Enter') doSearch(keyword); }}
        />
        <button className="btn-search" onClick={() => doSearch(keyword)}>搜索</button>
        {stats && <span className="search-stats">{stats}</span>}
      </div>
      {loading && results.length === 0 ? (
        <div className="loading-state">
          <span className="spinner" />
          {progress.total > 0 ? `正在搜索 ${progress.total} 个站点...` : '搜索中...'}
        </div>
      ) : results.length === 0 && done ? (
        <div className="empty-state">
          <div className="icon">🔍</div>
          <div className="text">未找到相关影片</div>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔍</div>
          <div className="text">输入关键词开始搜索（默认搜索所有启用站点）</div>
        </div>
      ) : (
        <div className="search-body">
          <aside className="search-sidebar">
            <div className="search-sidebar-title">站点</div>
            <div
              className={`search-site-item${siteFilter === '__all' ? ' active' : ''}`}
              onClick={() => setSiteFilter('__all')}
            >
              <span className="site-name">全部站点</span>
              <span className="site-count">{results.length}</span>
            </div>
            {siteGroups.map((g) => (
              <div
                key={g.id}
                className={`search-site-item${String(siteFilter) === g.id ? ' active' : ''}`}
                onClick={() => setSiteFilter(g.id)}
              >
                <span className="site-name" title={g.name}>{g.name}</span>
                <span className="site-count">{g.count}</span>
              </div>
            ))}
          </aside>
          <div className="movie-grid search-grid">
            {filtered.map((m) => (
              <MovieCard
                key={`${m.__siteId}_${m.vod_id}`}
                movie={m}
                siteName={m.__siteName}
                onClick={() => nav.open({ page: 'detail', siteId: String(m.__siteId), movieId: String(m.vod_id), from: 'search', kw: keyword })}
              />
            ))}
          </div>
          {loading && (
            <div className="load-more">
              <div>
                <span className="spinner" />
                正在搜索更多站点（{progress.completed}/{progress.total}）...
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useSources } from '../components/SourcesProvider'
import MovieCard from '../components/MovieCard'
import { fetchSiteData, isAbortError } from '../lib/api'
import { extractCategories, extractVodList, isSiteUnreachable } from '../lib/maccms'
import type { Category, VodItem } from '../lib/types'
import type { WebTVNav } from '../nav'

/**
 * 首页：分类侧栏 + 影片网格（无限滚动）+ 站点容错切换。
 * 逻辑等价移植自上游 webtv 的 HomePage；窗口版差异：
 * 跳详情改为窗口内导航，无限滚动监听 content-area 自身（窗口内容自滚动）。
 */

const ALL_SITES_UNREACHABLE_TIP =
  '所有站点均不可达。TVBox 配置中大部分源为客户端爬虫源（csp_/py_/.js），网页端仅支持苹果CMS标准HTTP API站点，请到设置页添加可用的订阅源。'

/**
 * 返回首页时的现场快照：分类/列表/翻页/滚动位置。
 * shell 只渲染页面栈顶，进详情页时 Home 会整体卸载，状态必须存在组件外；
 * 返回（重新挂载）且是同一站点时整份恢复，不再回到「全部」分类重新拉取。
 * 只存内存 —— 会话内有效，刷新页面后走正常加载（列表由 IDB 缓存兜底速度）。
 */
interface HomeSnapshot {
  siteId: string
  categoryId: string | number | null
  categories: Category[]
  movieList: VodItem[]
  currentPage: number
  totalPages: number
  totalCount: number
  scrollTop: number
}

let homeSnapshot: HomeSnapshot | null = null

export default function Home({ nav }: { nav: WebTVNav }) {
  const { sites, currentSiteId, setCurrentSiteId, failSite, succeedSite } = useSources()

  const [categories, setCategories] = useState<Category[]>([])
  const [currentCategoryId, setCurrentCategoryId] = useState<string | number | null>(null)
  const [movieList, setMovieList] = useState<VodItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [listLoading, setListLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [siteError, setSiteError] = useState('')

  const contentRef = useRef<HTMLElement>(null)
  const currentSite = sites.find((s) => s.id === currentSiteId) || null
  const triedIdsRef = useRef<Set<string>>(new Set())
  const switchingRef = useRef(false)
  const autoSwitchRef = useRef(false)
  // 请求序号：后到的请求使先到的失效，避免连点分类时按完成顺序把旧数据渲染上屏
  const catSeqRef = useRef(0)
  const listSeqRef = useRef(0)
  // 现场恢复：mountedForSiteRef 记录本组件实例已为哪个站点做过初始加载/恢复
  const mountedForSiteRef = useRef<string | null>(null)
  const pendingScrollRef = useRef(0)

  // 离开首页（进详情/搜索等，组件整体卸载）时留存现场
  const stateRef = useRef({
    siteId: '',
    categoryId: null as string | number | null,
    categories: [] as Category[],
    movieList: [] as VodItem[],
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  })
  stateRef.current = {
    siteId: currentSiteId ?? '',
    categoryId: currentCategoryId,
    categories,
    movieList,
    currentPage,
    totalPages,
    totalCount,
  }

  useEffect(() => {
    return () => {
      const s = stateRef.current
      // 站点未知或初始加载还没出结果（分类和列表都为空）时不留存：
      // 否则快速离开再返回会恢复成空现场并跳过加载，首页卡死在空状态
      if (!s.siteId || (s.categories.length === 0 && s.movieList.length === 0)) return
      homeSnapshot = {
        siteId: s.siteId,
        categoryId: s.categoryId,
        categories: s.categories,
        movieList: s.movieList,
        currentPage: s.currentPage,
        totalPages: s.totalPages,
        totalCount: s.totalCount,
        scrollTop: contentRef.current?.scrollTop ?? 0,
      }
    }
  }, [])

  /** 恢复同一站点的现场；快照不存在或站点不匹配时返回 false（走正常加载） */
  const restoreSnapshot = (siteId: string): boolean => {
    const snap = homeSnapshot
    homeSnapshot = null
    if (!snap || snap.siteId !== siteId) return false
    setCategories(snap.categories)
    setCurrentCategoryId(snap.categoryId)
    setMovieList(snap.movieList)
    setCurrentPage(snap.currentPage)
    setTotalPages(snap.totalPages)
    setTotalCount(snap.totalCount)
    pendingScrollRef.current = snap.scrollTop
    return true
  }

  // ===== 站点切换 =====

  /** 自动切换到下一个未尝试过的站点（上游 trySwitchToNextSite） */
  const trySwitchToNextSite = useCallback(
    (failedSiteId: string) => {
      if (switchingRef.current) return
      if (sites.length <= 1) {
        switchingRef.current = false
        return
      }
      switchingRef.current = true
      try {
        if (triedIdsRef.current.size >= sites.length) {
          setSiteError(ALL_SITES_UNREACHABLE_TIP)
          setMovieList([])
          setTotalPages(1)
          setTotalCount(0)
          switchingRef.current = false
          return
        }
        const curIdx = sites.findIndex((s) => s.id === failedSiteId)
        let nextIdx = curIdx === -1 ? 0 : (curIdx + 1) % sites.length
        let nextSite: (typeof sites)[number] | null = null
        for (let i = 0; i < sites.length; i++) {
          const candidate = sites[nextIdx]
          if (candidate && !triedIdsRef.current.has(candidate.id)) {
            nextSite = candidate
            break
          }
          nextIdx = (nextIdx + 1) % sites.length
        }
        if (nextSite && nextSite.id !== failedSiteId) {
          autoSwitchRef.current = true
          setCurrentSiteId(nextSite.id)
          setTimeout(() => {
            switchingRef.current = false
          }, 0)
        } else {
          switchingRef.current = false
        }
      } catch (e) {
        switchingRef.current = false
        console.error('切换站点失败', e)
      }
    },
    [sites, setCurrentSiteId]
  )

  const handleSiteFailure = useCallback(
    (siteId: string, msg: string) => {
      setSiteError(msg || '当前站点不可达')
      failSite(siteId)
      trySwitchToNextSite(siteId)
    },
    [failSite, trySwitchToNextSite]
  )

  // ===== 数据加载 =====

  const loadCategories = useCallback(
    async (siteId: string) => {
      const site = sites.find((s) => s.id === siteId)
      if (!site) return
      const seq = ++catSeqRef.current
      const ctrl = new AbortController()
      setCategories([])
      setCurrentCategoryId(null)
      triedIdsRef.current.add(siteId)
      try {
        let staleHit = false
        const data = await fetchSiteData(site, { ac: 'type' }, {
          signal: ctrl.signal,
          onStale: () => { staleHit = true },
          onUpdate: (raw) => {
            if (seq !== catSeqRef.current) return // 已被更新的分类请求取代
            const fresh = raw as Record<string, unknown>
            if (isSiteUnreachable(fresh)) {
              // 刷新失败：保留已上屏的缓存分类，只做提示，不清空也不切换
              setSiteError('源暂时无响应，当前显示的是缓存内容')
              return
            }
            setSiteError('')
            setCategories(extractCategories(fresh))
          },
        })
        if (seq !== catSeqRef.current) return // 已有更新的分类请求
        if (isSiteUnreachable(data)) {
          handleSiteFailure(siteId, (data.msg as string) || '当前站点不可达')
          return
        }
        setSiteError('')
        // 命中的是缓存：本次没有真实请求，不算站点存活证据，别清失败计数
        if (!staleHit) succeedSite(siteId)
        setCategories(extractCategories(data))
        triedIdsRef.current.clear()
        triedIdsRef.current.add(siteId)
      } catch (e) {
        if (seq !== catSeqRef.current || isAbortError(e)) return // 已被取代，静默
        console.error('加载分类失败', e)
        setSiteError('加载分类失败，请稍后重试')
      }
    },
    [sites, handleSiteFailure, succeedSite]
  )

  const loadMovieList = useCallback(
    async (siteId: string, categoryId: string | number | null, page: number, isLoadMore: boolean) => {
      const site = sites.find((s) => s.id === siteId)
      if (!site) return
      const seq = ++listSeqRef.current
      const ctrl = new AbortController()
      if (isLoadMore) {
        if (loadingMore) return
        setLoadingMore(true)
      } else {
        setListLoading(true)
        setMovieList([])
      }
      try {
        const data = await fetchSiteData(site, {
          ac: 'detail',
          pg: page,
          t: categoryId ?? undefined,
        }, {
          signal: ctrl.signal,
          // 追加页的刷新不回调：后台新数据只进缓存，下一页再取，不打乱已累积的列表
          onUpdate: isLoadMore ? undefined : (raw) => {
            if (seq !== listSeqRef.current) return // 已被更新的列表请求取代
            const fresh = raw as Record<string, unknown>
            if (isSiteUnreachable(fresh)) {
              setSiteError('源暂时无响应，当前显示的是缓存内容')
              return
            }
            setSiteError('')
            const { list, pagecount, total } = extractVodList(fresh)
            setMovieList(list)
            setCurrentPage(page)
            setTotalPages(pagecount)
            setTotalCount(total)
          },
        })
        if (seq !== listSeqRef.current) return // 已有更新的列表请求
        if (isSiteUnreachable(data)) {
          if (!isLoadMore) {
            setMovieList([])
            setTotalPages(1)
            setTotalCount(0)
          }
          // 站点切换由 loadCategories 触发，这里只提示
          return
        }
        setSiteError('')
        const { list, pagecount, total } = extractVodList(data)
        if (isLoadMore) {
          setMovieList((prev) => {
            const existIds = new Set(prev.map((m) => m.vod_id))
            return [...prev, ...list.filter((m) => !existIds.has(m.vod_id))]
          })
        } else {
          setMovieList(list)
        }
        setCurrentPage(page)
        setTotalPages(pagecount)
        setTotalCount(total)
      } catch (e) {
        if (seq !== listSeqRef.current) return
        if (isAbortError(e)) return // 被更新的请求取代，静默
        console.error('加载影视列表失败', e)
        if (!isLoadMore) setMovieList([])
      } finally {
        if (seq === listSeqRef.current) {
          setListLoading(false)
          setLoadingMore(false)
        }
      }
    },
    // loadingMore 通过 ref 判断会造成过期闭包，这里直接依赖 state（滚动触发频率低）
    [sites, loadingMore]
  )

  // 站点变化（手动选择 / 自动切换）→ 重新加载分类和列表
  useEffect(() => {
    if (!currentSiteId) return
    // 同一站点的二次执行不重复恢复/加载（防御 StrictMode 双执行；当前宿主未开启）
    if (mountedForSiteRef.current === currentSiteId) return
    const isRemount = mountedForSiteRef.current === null
    mountedForSiteRef.current = currentSiteId
    // 首次挂载且留有同一站点的现场 → 整份恢复，不回「全部」重新拉取
    if (isRemount && restoreSnapshot(currentSiteId)) return
    if (autoSwitchRef.current) {
      autoSwitchRef.current = false // 自动切换：保留 triedIds 追踪
    } else {
      // 手动切换：清空追踪，允许重新尝试所有站点
      triedIdsRef.current.clear()
      triedIdsRef.current.add(currentSiteId)
      setSiteError('')
    }
    loadCategories(currentSiteId)
    loadMovieList(currentSiteId, null, 1, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSiteId])

  // 恢复的列表渲染完成后回到离开时的滚动位置（海报有 aspect-ratio 占位，首帧列高即确定）
  useLayoutEffect(() => {
    if (pendingScrollRef.current > 0 && contentRef.current) {
      contentRef.current.scrollTop = pendingScrollRef.current
      pendingScrollRef.current = 0
    }
  })

  const selectCategory = (catId: string | number | null) => {
    setCurrentCategoryId(catId)
    if (currentSiteId) loadMovieList(currentSiteId, catId, 1, false)
  }

  // ===== 无限滚动（滚动容器为 content-area，等价原版 window 滚动判定） =====

  const onScroll = () => {
    const el = contentRef.current
    if (!el || loadingMore || listLoading) return
    if (currentPage >= totalPages) return
    if (movieList.length === 0) return
    if (!currentSiteId) return
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 300) {
      loadMovieList(currentSiteId, currentCategoryId, currentPage + 1, true)
    }
  }

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-title">分类</div>
        <div
          className={`cat-item${currentCategoryId === null ? ' active' : ''}`}
          onClick={() => selectCategory(null)}
        >
          全部
        </div>
        {categories.map((cat) => (
          <div
            key={cat.type_id}
            className={`cat-item${currentCategoryId === cat.type_id ? ' active' : ''}`}
            onClick={() => selectCategory(cat.type_id)}
          >
            {cat.type_name}
          </div>
        ))}
        {categories.length === 0 && currentSite ? <div className="cat-empty">暂无分类</div> : null}
      </aside>

      <section className="content-area" ref={contentRef} onScroll={onScroll}>
        <div className="page-title">
          <span>{currentSite ? currentSite.name : 'TVBox'}</span>
          {totalCount > 0 && <span style={{ color: '#666', fontSize: 13 }}>共 {totalCount} 部</span>}
        </div>
        {siteError && (
          <div className="site-error-tip">
            <span>⚠ {siteError}</span>
          </div>
        )}
        {listLoading ? (
          <div className="loading-state">
            <span className="spinner" />
            加载中...
          </div>
        ) : movieList.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🎬</div>
            <div className="text">暂无影片数据</div>
          </div>
        ) : (
          <div className="movie-grid">
            {movieList.map((m) => (
              <MovieCard
                key={`${currentSiteId}_${m.vod_id}`}
                movie={m}
                onClick={() => currentSiteId && nav.open({ page: 'detail', siteId: currentSiteId, movieId: String(m.vod_id), from: 'home' })}
              />
            ))}
          </div>
        )}
        {movieList.length > 0 && (
          <div className="load-more">
            {loadingMore ? (
              <div>
                <span className="spinner" />
                正在加载更多...
              </div>
            ) : currentPage >= totalPages ? (
              <div className="no-more">已加载全部 {totalCount} 部影片</div>
            ) : (
              <button
                className="load-more-btn"
                onClick={() => currentSiteId && loadMovieList(currentSiteId, currentCategoryId, currentPage + 1, true)}
              >
                加载更多
              </button>
            )}
          </div>
        )}
      </section>
    </>
  )
}

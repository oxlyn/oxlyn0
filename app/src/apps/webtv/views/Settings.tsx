import { useCallback, useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import MovieCard from '../components/MovieCard'
import { useSources } from '../components/SourcesProvider'
import { addSubscription, enableSitePersist, getDisabledSites, removeSubscription } from '../lib/sources'
import {
  loadFavorites,
  loadFrozenParseIds,
  loadSubscriptions,
  removeFavorite,
  unfreezeParse,
  type FavoriteEntry,
  type SubscriptionEntry,
} from '../lib/localStats'
import { showToast } from '../lib/toast'
import type { TvSite, VodItem } from '../lib/types'
import type { WebTVNav } from '../nav'

/**
 * 设置页（上游为纯本地实现）：标签页分「收藏」与「订阅与源」。
 * 收藏以整部剧为粒度（siteId + vod_id），条目是收藏时的快照 —— 源挂掉或被
 * 移除后仍能完整展示；点击回到详情页可从任意一集继续看。
 * 订阅与源：订阅管理（添加/移除 TVBox 配置 URL）、已禁用站点恢复、已冻结解析线路恢复。
 */
export default function Settings({ nav }: { nav: WebTVNav }) {
  const { reload } = useSources()
  const [tab, setTab] = useState<'favorites' | 'sources'>('favorites')
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([])
  const [subs, setSubs] = useState<SubscriptionEntry[]>([])
  const [disabledSites, setDisabledSites] = useState<TvSite[]>([])
  const [frozenParses, setFrozenParses] = useState<string[]>([])
  const [url, setUrl] = useState('')
  const [adding, setAdding] = useState(false)

  const refresh = useCallback(() => {
    setFavorites(loadFavorites())
    setSubs(loadSubscriptions())
    setDisabledSites(getDisabledSites())
    setFrozenParses(loadFrozenParseIds())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleRemoveFavorite = (f: FavoriteEntry) => {
    removeFavorite(f.siteId, f.movieId)
    refresh()
    showToast('已取消收藏', 'ok')
  }

  const handleAdd = async () => {
    const trimmed = url.trim()
    if (!trimmed) return
    setAdding(true)
    try {
      const result = await addSubscription(trimmed)
      showToast(`订阅成功：${result.name}（${result.added} 条源）`, 'ok')
      setUrl('')
      reload()
      refresh()
    } catch (e) {
      showToast(e instanceof Error ? e.message : '订阅失败', 'error')
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = (id: string) => {
    removeSubscription(id)
    reload()
    refresh()
    showToast('订阅已移除', 'ok')
  }

  const handleRestoreSite = (id: string) => {
    enableSitePersist(id)
    reload()
    refresh()
    showToast('站点已恢复', 'ok')
  }

  const handleUnfreezeParse = (id: string) => {
    unfreezeParse(id)
    reload()
    refresh()
    showToast('线路已恢复', 'ok')
  }

  const itemStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' } as const

  return (
    <section className="content-area" style={{ maxWidth: 860 }}>
      <div className="page-title"><span>设置</span></div>

      {/* 复用线路 tab 的样式，两个标签页：收藏 / 订阅与源 */}
      <div className="line-tabs" style={{ marginBottom: 20 }}>
        <button className={`line-tab${tab === 'favorites' ? ' active' : ''}`} onClick={() => setTab('favorites')}>
          收藏{favorites.length > 0 ? ` (${favorites.length})` : ''}
        </button>
        <button className={`line-tab${tab === 'sources' ? ' active' : ''}`} onClick={() => setTab('sources')}>
          订阅与源
        </button>
      </div>

      {tab === 'favorites' ? (
        favorites.length === 0 ? (
          <div className="empty-state">
            <div className="icon">♡</div>
            <div className="text">暂无收藏：打开一部影片，点标题旁的心形即可收藏整部剧</div>
          </div>
        ) : (
          <div className="movie-grid">
            {favorites.map((f) => (
              <div className="fav-item" key={`${f.siteId}_${f.movieId}`}>
                <MovieCard
                  movie={{ vod_id: f.movieId, vod_name: f.name, vod_pic: f.pic, vod_remarks: f.remarks } as VodItem}
                  siteName={f.siteName}
                  onClick={() => nav.open({ page: 'detail', siteId: f.siteId, movieId: f.movieId, from: 'favorites' })}
                />
                <button
                  className="fav-remove"
                  title="取消收藏"
                  onClick={(e) => { e.stopPropagation(); handleRemoveFavorite(f) }}
                >
                  <Heart size={13} strokeWidth={2} fill="currentColor" />
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        <>
          {/* 订阅管理 */}
          <div style={{ background: '#16213e', borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>TVBox 订阅</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                className="search-box"
                style={{ flex: 1 }}
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="输入 TVBox 配置订阅地址（如 https://.../4k.json）"
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
              />
              <button className="btn-search" onClick={handleAdd} disabled={adding || !url.trim()}>
                {adding ? '添加中...' : '添加订阅'}
              </button>
            </div>
            {subs.length === 0 ? (
              <div style={{ color: '#666', fontSize: 13 }}>暂无订阅（内置预置源已可用）</div>
            ) : (
              subs.map((sub) => (
                <div key={sub.id} style={itemStyle}>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: 14 }}>{sub.name}</div>
                    <div style={{ color: '#666', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.url}</div>
                  </div>
                  <button className="text-btn" onClick={() => handleRemove(sub.id)}>移除</button>
                </div>
              ))
            )}
          </div>

          {/* 已禁用站点 */}
          <div style={{ background: '#16213e', borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>已禁用站点（连续失败自动禁用）</div>
            {disabledSites.length === 0 ? (
              <div style={{ color: '#666', fontSize: 13 }}>无</div>
            ) : (
              disabledSites.map((s) => (
                <div key={s.id} style={itemStyle}>
                  <span style={{ fontSize: 14 }}>{s.name}</span>
                  <button className="text-btn" onClick={() => handleRestoreSite(s.id)}>恢复</button>
                </div>
              ))
            )}
          </div>

          {/* 已冻结解析线路 */}
          <div style={{ background: '#16213e', borderRadius: 10, padding: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>已冻结解析线路（报错达到阈值）</div>
            {frozenParses.length === 0 ? (
              <div style={{ color: '#666', fontSize: 13 }}>无</div>
            ) : (
              frozenParses.map((id) => (
                <div key={id} style={itemStyle}>
                  <span style={{ fontSize: 14 }}>{id}</span>
                  <button className="text-btn" onClick={() => handleUnfreezeParse(id)}>恢复</button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </section>
  )
}

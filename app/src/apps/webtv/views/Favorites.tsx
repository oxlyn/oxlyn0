import { useCallback, useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import MovieCard from '../components/MovieCard'
import { loadFavorites, removeFavorite, type FavoriteEntry } from '../lib/localStats'
import { showToast } from '../lib/toast'
import type { VodItem } from '../lib/types'
import type { WebTVNav } from '../nav'

/**
 * 收藏页：收藏的全部剧集，全宽瀑布流。条目是收藏时的快照（剧名/海报/备注/
 * 来源站点），源挂掉也能展示；点击回到详情页，从任意一集继续看。
 * 取消收藏既可以用卡片右上角的实心心形，也可以在详情页再点一次心形。
 */
export default function Favorites({ nav }: { nav: WebTVNav }) {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([])

  const refresh = useCallback(() => setFavorites(loadFavorites()), [])
  useEffect(() => {
    refresh()
  }, [refresh])

  const handleRemove = (f: FavoriteEntry) => {
    removeFavorite(f.siteId, f.movieId)
    refresh()
    showToast('已取消收藏', 'ok')
  }

  return (
    <section className="content-area favorites-page">
      <div className="page-title">
        <span>收藏</span>
        {favorites.length > 0 && <span style={{ color: '#666', fontSize: 13 }}>共 {favorites.length} 部</span>}
      </div>

      {favorites.length === 0 ? (
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
                onClick={(e) => { e.stopPropagation(); handleRemove(f) }}
              >
                <Heart size={13} strokeWidth={2} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

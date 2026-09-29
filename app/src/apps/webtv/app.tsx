import { useMemo, useState } from 'react'
import { Clapperboard } from 'lucide-react'
import { AppWindowProps } from '@/system/types'
import type { AppDefinition } from '@/system/types'
import { SourcesProvider, useSources } from './components/SourcesProvider'
import Toast from './components/Toast'
import Home from './views/Home'
import Search from './views/Search'
import Detail from './views/Detail'
import Live from './views/Live'
import Parse from './views/Parse'
import Settings from './views/Settings'
import type { WebTVNav, WebTVView } from './nav'
import './webtv.css'

/**
 * WebTV — TVBox 影视/直播播放器（移植自仓库内独立的 Next.js 项目 webtv/，
 * 上游为「TVBox 网页播放器」纯前端复刻版）。
 *
 * 桌面系统集成版差异：
 * - Next.js 路由 → 窗口内页面栈（首页/搜索/解析/直播/设置 + 详情）；
 * - 数据层复用上游同构 lib/：静态部署下同源代理不可用，自动走公共 CORS 代理
 *   + 浏览器端 XML/GBK 转码（见 lib/api.ts）；
 * - 播放器为 artplayer + hls.js（m3u8 软解），样式整体收进 .webtv-root 作用域。
 */

function Shell({ initialView }: { initialView: WebTVView }) {
  const { sites, currentSiteId, setCurrentSiteId } = useSources()
  const [stack, setStack] = useState<WebTVView[]>([initialView])
  const [keyword, setKeyword] = useState('')

  const view = stack[stack.length - 1]

  const nav = useMemo<WebTVNav>(
    () => ({
      open: (next) => setStack((s) => [...s, next]),
      back: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    }),
    []
  )

  const submitSearch = () => {
    const kw = keyword.trim()
    if (!kw) return
    setKeyword('')
    nav.open({ page: 'search', kw })
  }

  const onHome = view.page === 'home'
  const navLink = (label: string, target: WebTVView) => (
    <button
      className={`nav-link${view.page === target.page ? ' active' : ''}`}
      onClick={() => nav.open(target)}
    >
      {label}
    </button>
  )

  return (
    <div className="webtv-root">
      <header className="app-header">
        <span className="logo" onClick={() => nav.open({ page: 'home' })} role="button">
          <span className="logo-icon">▶</span>
          <span>WebTV</span>
        </span>
        <div className="nav-bar">
          {onHome && (
            <>
              <select
                className="site-select"
                value={currentSiteId ?? ''}
                onChange={(e) => setCurrentSiteId(e.target.value)}
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <input
                className="search-box"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索影片..."
                onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); }}
              />
              <button className="btn-search" onClick={submitSearch}>搜索</button>
            </>
          )}
        </div>
        <div className="nav-actions">
          {navLink('首页', { page: 'home' })}
          {navLink('搜索', { page: 'search' })}
          {navLink('解析', { page: 'parse' })}
          {navLink('直播', { page: 'live' })}
          {navLink('设置', { page: 'settings' })}
        </div>
      </header>

      <main className="app-main">
        {view.page === 'home' && <Home nav={nav} />}
        {view.page === 'search' && <Search key={view.kw ?? ''} nav={nav} initialKw={view.kw ?? ''} />}
        {view.page === 'detail' && (
          <Detail key={`${view.siteId}_${view.movieId}`} nav={nav} siteId={view.siteId} movieId={view.movieId} />
        )}
        {view.page === 'live' && <Live />}
        {view.page === 'parse' && <Parse key={view.url ?? ''} initialUrl={view.url ?? ''} />}
        {view.page === 'settings' && <Settings nav={nav} />}
      </main>

      <Toast />
    </div>
  )
}

function WebTV({ payload }: AppWindowProps) {
  // 跨应用联动：open('webtv', { search: '关键词' }) 直达搜索，{ parseUrl } 直达解析。
  const search = typeof payload?.search === 'string' ? payload.search : undefined
  const parseUrl = typeof payload?.parseUrl === 'string' ? payload.parseUrl : undefined
  const initialView: WebTVView = parseUrl
    ? { page: 'parse', url: parseUrl }
    : search
      ? { page: 'search', kw: search }
      : { page: 'home' }
  return (
    <SourcesProvider>
      <Shell initialView={initialView} />
    </SourcesProvider>
  )
}

export default {
  id: 'webtv',
  name: 'WebTV',
  icon: { from: '#FF5A7A', to: '#E94560', Icon: Clapperboard },
  component: WebTV,
  defaultSize: { w: 1180, h: 760 },
  minSize: { w: 720, h: 480 },
  category: 'Entertainment',
  keywords: ['webtv', 'tvbox', '影视', '电影', '电视剧', '直播', 'iptv', '电视', 'movie', 'video'],
  singleton: true,
  inDock: true,
  onDesktop: true,
} satisfies AppDefinition

import { useCallback, useEffect, useRef, useState } from 'react'
import Player from '../components/Player'
import { useSources } from '../components/SourcesProvider'
import { fetchSiteData, resolveParseUrl } from '../lib/api'
import { isDirectPlayable, parsePlayData } from '../lib/maccms'
import { getSiteById } from '../lib/sources'
import type { PlayLine, VodItem } from '../lib/types'
import type { WebTVNav } from '../nav'

/**
 * 详情页：影片信息 + ArtPlayer 播放器 + 线路/集数。
 * 容错链等价移植上游 DetailPage：换线路同集 → iframe 打开原视频页 → 新标签兜底。
 * 窗口版差异：路由参数改为 props；.player-wrapper 高度/网页全屏以应用窗口为参照。
 */
export default function Detail({
  nav,
  siteId,
  movieId,
}: {
  nav: WebTVNav
  siteId: string
  movieId: string
}) {
  const { parses } = useSources()

  const [movie, setMovie] = useState<VodItem | null>(null)
  const [detailLoading, setDetailLoading] = useState(true)
  const [playLines, setPlayLines] = useState<PlayLine[]>([])
  const [currentLineIdx, setCurrentLineIdx] = useState(0)
  const [currentEpIdx, setCurrentEpIdx] = useState(0)

  const [playerUrl, setPlayerUrl] = useState('')
  const [playerVisible, setPlayerVisible] = useState(false)
  const [playerLoading, setPlayerLoading] = useState(false)
  const [playerFailed, setPlayerFailed] = useState(false)
  const [browserFullscreen, setBrowserFullscreen] = useState(false)
  const [iframeFallback, setIframeFallback] = useState<{ visible: boolean; url: string; tip: boolean }>({
    visible: false,
    url: '',
    tip: true,
  })

  const areaRef = useRef<HTMLElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const switchLineTrackerRef = useRef<Set<number>>(new Set())
  const originalPlayUrlRef = useRef('')
  // 播放链路全部读 ref，避免 setState 后立刻调用的过期闭包（首次自动播放场景）
  const stateRef = useRef({ movie, playLines, currentLineIdx, currentEpIdx, parses, iframeFallbackVisible: iframeFallback.visible })
  stateRef.current = { movie, playLines, currentLineIdx, currentEpIdx, parses, iframeFallbackVisible: iframeFallback.visible }

  // ===== 播放 =====

  const playEpisode = useCallback((lineIdx: number, epIdx: number, fromSwitch = false) => {
    const { playLines: lines, parses: parseList, movie: currentMovie } = stateRef.current
    const line = lines[lineIdx]
    const ep = line?.episodes[epIdx]
    if (!line || !ep || !currentMovie) return

    setCurrentLineIdx(lineIdx)
    setCurrentEpIdx(epIdx)
    if (!fromSwitch) switchLineTrackerRef.current.clear()

    setPlayerVisible(true)
    setPlayerFailed(false)
    setIframeFallback({ visible: false, url: '', tip: true })
    originalPlayUrlRef.current = ep.url

    if (isDirectPlayable(ep.url)) {
      setPlayerLoading(true)
      setPlayerUrl(ep.url)
      return
    }
    // 非直连地址走第一条解析线路
    const parse = parseList[0]
    if (parse) {
      setPlayerLoading(true)
      resolveParseUrl(parse, ep.url).then((realUrl) => {
        if (realUrl) {
          setPlayerUrl(realUrl)
        } else {
          handlePlayFailureRef.current()
        }
      })
    } else {
      setPlayerLoading(true)
      setPlayerUrl(ep.url)
    }
  }, [])

  const trySwitchLine = useCallback((): boolean => {
    const { playLines: lines, currentLineIdx: curLine, currentEpIdx: curEp } = stateRef.current
    if (!lines || lines.length <= 1) return false
    switchLineTrackerRef.current.add(curLine)
    for (let i = curLine + 1; i < lines.length; i++) {
      if (switchLineTrackerRef.current.has(i)) continue
      if (lines[i].episodes[curEp]) {
        playEpisode(i, curEp, true)
        return true
      }
    }
    return false
  }, [playEpisode])

  const handlePlayFailure = useCallback(() => {
    setPlayerLoading(false)
    if (trySwitchLine()) return
    const original = originalPlayUrlRef.current
    if (original && !stateRef.current.iframeFallbackVisible) {
      setIframeFallback({ visible: true, url: original, tip: true })
      setPlayerVisible(false)
      return
    }
    setPlayerFailed(true)
  }, [trySwitchLine])

  const handlePlayFailureRef = useRef(handlePlayFailure)
  handlePlayFailureRef.current = handlePlayFailure

  // ===== 详情加载 =====

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const site = getSiteById(siteId)
      if (!site) {
        if (!cancelled) setDetailLoading(false)
        return
      }
      setDetailLoading(true)
      try {
        const data = await fetchSiteData(site, { ac: 'detail', ids: movieId })
        if (cancelled) return
        if ((data.code === 1 || data.code === 0) && Array.isArray(data.list) && data.list.length > 0) {
          const item = data.list[0] as VodItem
          item.__siteId = siteId
          const lines = parsePlayData(item.vod_play_from, item.vod_play_url)
          setMovie(item)
          setPlayLines(lines)
          setCurrentLineIdx(0)
          setCurrentEpIdx(0)
          if (lines.length > 0 && lines[0].episodes.length > 0) {
            // 立即同步 ref（setState 后要等重渲染才更新），保证首次自动播放拿到最新数据
            stateRef.current = { ...stateRef.current, movie: item, playLines: lines, currentLineIdx: 0, currentEpIdx: 0 }
            playEpisode(0, 0)
          }
        }
      } catch (e) {
        console.error('加载影视详情失败', e)
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId, movieId])

  // ===== 上下集（跨线路衔接） =====

  const hasPrevEp = (() => {
    if (currentEpIdx > 0) return true
    for (let i = currentLineIdx - 1; i >= 0; i--) {
      if (playLines[i]?.episodes.length) return true
    }
    return false
  })()

  const hasNextEp = (() => {
    const curLineEps = playLines[currentLineIdx]?.episodes || []
    if (currentEpIdx < curLineEps.length - 1) return true
    for (let i = currentLineIdx + 1; i < playLines.length; i++) {
      if (playLines[i]?.episodes.length) return true
    }
    return false
  })()

  const switchEpisode = (dir: 1 | -1) => {
    const curLineEps = playLines[currentLineIdx]?.episodes || []
    const nextEp = currentEpIdx + dir
    if (nextEp >= 0 && nextEp < curLineEps.length) {
      playEpisode(currentLineIdx, nextEp)
      return
    }
    if (dir > 0) {
      for (let i = currentLineIdx + 1; i < playLines.length; i++) {
        if (playLines[i].episodes.length > 0) {
          playEpisode(i, 0)
          return
        }
      }
    } else {
      for (let i = currentLineIdx - 1; i >= 0; i--) {
        const eps = playLines[i].episodes
        if (eps.length > 0) {
          playEpisode(i, eps.length - 1)
          return
        }
      }
    }
  }

  // ===== 全屏 =====

  const toggleOSFullscreen = () => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      wrapper.requestFullscreen?.()
    }
  }

  // 播放器容器高度（上游按视口高度计算，窗口版按窗口内容区计算）
  useEffect(() => {
    if (!playerVisible) return
    const wrapper = wrapperRef.current
    const area = areaRef.current
    if (wrapper && area) {
      const h = Math.min(Math.max(area.clientHeight - 260, 240), 700)
      wrapper.style.height = `${h}px`
    }
  }, [playerVisible, playerUrl])

  const currentLineEpisodes = playLines[currentLineIdx]?.episodes || []
  const openInNewTab = () => {
    const url = originalPlayUrlRef.current
    if (url) window.open(url, '_blank')
  }

  return (
    <section className="content-area" ref={areaRef}>
      {detailLoading && !movie ? (
        <div className="loading-state">
          <span className="spinner" />
          加载详情中...
        </div>
      ) : !movie ? (
        <div className="empty-state">
          <div className="icon">😕</div>
          <div className="text">未找到影片信息</div>
          <button className="back-btn" style={{ marginTop: 12, display: 'inline-block' }} onClick={nav.back}>
            返回
          </button>
        </div>
      ) : (
        <div className="detail-page">
          <aside className="detail-left">
            <div className="detail-info">
              <button className="back-btn" onClick={nav.back}>← 返回</button>
              <div className="detail-poster-wrap">
                {movie.vod_pic && (
                  <img
                    className="detail-poster"
                    src={movie.vod_pic}
                    alt={movie.vod_name}
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </div>
              <div className="detail-meta">
                <div className="detail-title">{movie.vod_name}</div>
                {movie.vod_year && <div className="detail-row"><span className="label">年份：</span>{movie.vod_year}</div>}
                {movie.vod_area && <div className="detail-row"><span className="label">地区：</span>{movie.vod_area}</div>}
                {movie.vod_class && <div className="detail-row"><span className="label">类型：</span>{movie.vod_class}</div>}
                {movie.vod_director && <div className="detail-row"><span className="label">导演：</span>{movie.vod_director}</div>}
                {movie.vod_actor && <div className="detail-row"><span className="label">演员：</span>{movie.vod_actor}</div>}
                {movie.vod_remarks && <div className="detail-row"><span className="label">备注：</span>{movie.vod_remarks}</div>}
                {movie.vod_content && <div className="detail-desc">{movie.vod_content}</div>}
              </div>
            </div>
          </aside>

          <main className="detail-right">
            {playerVisible && (
              <div className={`player-section${browserFullscreen ? ' browser-fullscreen' : ''}`}>
                <div className="player-wrapper" ref={wrapperRef}>
                  {playerUrl && (
                    <Player
                      url={playerUrl}
                      onReady={() => setPlayerLoading(false)}
                      onError={() => handlePlayFailureRef.current()}
                    />
                  )}
                </div>
                {playerLoading && playerUrl && (
                  <div className="loading-state" style={{ padding: '18px 20px' }}>
                    <span className="spinner" />
                    正在加载播放器...
                  </div>
                )}
                {playerFailed && (
                  <div className="player-fail-tip">
                    <span>⚠ 解析失败，可尝试新标签打开观看！</span>
                    <button className="open-tab" onClick={openInNewTab}>新标签页打开</button>
                    <button className="close-tip" onClick={() => setPlayerFailed(false)} title="关闭">×</button>
                  </div>
                )}
                <div className="player-bar">
                  <div className="player-title">
                    <div className="main-title">{movie.vod_name}</div>
                    <div className="sub-title">
                      {playLines[currentLineIdx]?.name} - {currentLineEpisodes[currentEpIdx]?.title}
                    </div>
                  </div>
                  <div className="player-actions">
                    <button className="text-btn" disabled={!hasPrevEp} onClick={() => switchEpisode(-1)}>上一集</button>
                    <button className="text-btn" disabled={!hasNextEp} onClick={() => switchEpisode(1)}>下一集</button>
                    <button className="icon-btn" onClick={() => setBrowserFullscreen((v) => !v)} title="网页全屏">⛶</button>
                    <button className="icon-btn" onClick={toggleOSFullscreen} title="全屏">⤢</button>
                    <button
                      className="icon-btn"
                      title="关闭"
                      onClick={() => {
                        setPlayerVisible(false)
                        setPlayerUrl('')
                        setIframeFallback({ visible: false, url: '', tip: true })
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            )}

            {iframeFallback.visible && (
              <div className="player-section iframe-fallback">
                <div className="iframe-fallback-header">
                  <span>正在尝试直接打开视频页面...</span>
                  <button
                    className="close-tip"
                    title="关闭"
                    onClick={(e) => ((e.currentTarget.parentElement as HTMLElement).style.display = 'none')}
                  >
                    ×
                  </button>
                </div>
                <iframe
                  src={iframeFallback.url}
                  className="iframe-fallback-player"
                  allowFullScreen
                  allow="autoplay; fullscreen"
                />
                {iframeFallback.tip && (
                  <div className="player-fail-tip">
                    <span>⚠ 当前视频无法播放时，请尝试点击新标签页打开观看！已经可以播放忽略即可！</span>
                    <button className="open-tab" onClick={openInNewTab}>新标签页打开</button>
                    <button className="close-tip" onClick={() => setIframeFallback((s) => ({ ...s, tip: false }))} title="关闭">×</button>
                  </div>
                )}
              </div>
            )}

            {playLines.length > 0 ? (
              <div className="episodes-section">
                {playLines.length > 1 ? (
                  <div className="line-tabs">
                    {playLines.map((line, idx) => (
                      <button
                        key={idx}
                        className={`line-tab${currentLineIdx === idx ? ' active' : ''}`}
                        onClick={() => playEpisode(idx, 0)}
                      >
                        {line.name} ({line.episodes.length})
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: '#888', marginBottom: 10 }}>
                    共 {playLines[0].episodes.length} 集
                  </div>
                )}
                {currentLineEpisodes.length > 0 ? (
                  <div className="episode-list">
                    {currentLineEpisodes.map((ep, idx) => (
                      <button
                        key={idx}
                        className={`ep-item${currentEpIdx === idx ? ' active' : ''}`}
                        onClick={() => playEpisode(currentLineIdx, idx)}
                      >
                        {ep.title}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="episode-list">
                    <div className="empty">当前线路暂无剧集</div>
                  </div>
                )}
              </div>
            ) : (
              !detailLoading && (
                <div className="episodes-section">
                  <div className="episode-list">
                    <div className="empty">暂无播放数据</div>
                  </div>
                </div>
              )
            )}
          </main>
        </div>
      )}
    </section>
  )
}

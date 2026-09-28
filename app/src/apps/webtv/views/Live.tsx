import { useCallback, useEffect, useRef, useState } from 'react'
import LazyPlayer from '../components/LazyPlayer'
import { useSources } from '../components/SourcesProvider'
import { fetchLiveText } from '../lib/api'
import { parsePlaylist } from '../lib/iptv'
import type { M3UChannel } from '../lib/types'

/**
 * 直播页：直播源列表 / 频道列表+搜索 / 播放器 三栏。
 * 播放失败降级链等价上游 LivePage：iframe 打开频道地址 → 新标签兜底。
 */
export default function Live() {
  const { lives } = useSources()
  const [currentLiveId, setCurrentLiveId] = useState<string | null>(null)
  const [channels, setChannels] = useState<M3UChannel[]>([])
  const [searchKey, setSearchKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentChannel, setCurrentChannel] = useState<M3UChannel | null>(null)
  const [playerUrl, setPlayerUrl] = useState('')
  const [playerFailed, setPlayerFailed] = useState(false)
  const [iframeFallback, setIframeFallback] = useState<{ visible: boolean; url: string }>({ visible: false, url: '' })
  const failureHandledRef = useRef(false)

  const loadChannels = useCallback(async (liveId: string) => {
    setLoading(true)
    setChannels([])
    setCurrentChannel(null)
    setPlayerUrl('')
    setPlayerFailed(false)
    setIframeFallback({ visible: false, url: '' })
    setSearchKey('')
    try {
      const live = lives.find((l) => l.id === liveId)
      if (!live) return
      const text = await fetchLiveText(live)
      setChannels(parsePlaylist(text))
    } catch (e) {
      console.error('加载直播频道失败', e)
    } finally {
      setLoading(false)
    }
  }, [lives])

  // 默认加载第一个直播源
  useEffect(() => {
    if (lives.length > 0 && !currentLiveId) {
      setCurrentLiveId(lives[0].id)
      loadChannels(lives[0].id)
    }
  }, [lives, currentLiveId, loadChannels])

  const playChannel = (ch: M3UChannel) => {
    setCurrentChannel(ch)
    setPlayerUrl(ch.url)
    setPlayerFailed(false)
    setIframeFallback({ visible: false, url: '' })
    failureHandledRef.current = false
  }

  const handlePlayFailure = () => {
    if (failureHandledRef.current) return
    failureHandledRef.current = true
    setPlayerUrl('')
    setIframeFallback({ visible: true, url: currentChannel?.url || '' })
  }

  const filtered = (() => {
    const kw = searchKey.trim().toLowerCase()
    if (!kw) return channels
    return channels.filter((ch) => (ch.name || '').toLowerCase().includes(kw))
  })()

  return (
    <section className="content-area live-page">
      <div className="live-source-panel">
        <div className="panel-header">直播源</div>
        <div className="panel-list">
          {lives.map((live) => (
            <div
              key={live.id}
              className={`source-item${currentLiveId === live.id ? ' active' : ''}`}
              onClick={() => {
                setCurrentLiveId(live.id)
                loadChannels(live.id)
              }}
            >
              {live.name}
            </div>
          ))}
          {lives.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: '#555', fontSize: 12 }}>暂无直播源</div>
          )}
        </div>
      </div>

      <div className="live-channel-panel">
        <div className="panel-header">
          频道列表 ({filtered.length}/{channels.length})
        </div>
        <div className="live-search-box">
          <input
            type="text"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            placeholder="搜索频道..."
          />
        </div>
        <div className="panel-list">
          {loading && (
            <div className="loading-state" style={{ padding: 30 }}>
              <span className="spinner" />
              加载中...
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{ padding: 30, textAlign: 'center', color: '#555', fontSize: 12 }}>暂无频道</div>
          )}
          {filtered.map((ch, idx) => (
            <div
              key={idx}
              className={`channel-item${currentChannel?.url === ch.url ? ' active' : ''}`}
              onClick={() => playChannel(ch)}
            >
              {ch.logo && (
                <img
                  className="ch-logo"
                  src={ch.logo}
                  alt={ch.name}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              )}
              <span className="ch-name">{ch.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="live-player-panel">
        {playerUrl && !iframeFallback.visible && (
          <LazyPlayer
            url={playerUrl}
            isLive
            onError={handlePlayFailure}
          />
        )}
        {!iframeFallback.visible && !playerUrl && !playerFailed && (
          <div className="live-placeholder">请选择频道开始播放</div>
        )}

        {iframeFallback.visible && (
          <div className="player-section iframe-fallback" style={{ flex: 1 }}>
            <div className="iframe-fallback-header live-iframe-fallback-header">
              <span>正在尝试直接打开直播页面...</span>
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
            {playerFailed && (
              <div className="player-fail-tip">
                <span>⚠ 当前直播无法播放时，请尝试点击新标签页打开观看！已经可以播放忽略即可！</span>
                <button
                  className="open-tab"
                  onClick={() => window.open(iframeFallback.url || currentChannel?.url || '', '_blank')}
                >
                  新标签页打开
                </button>
                <button className="close-tip" onClick={() => setPlayerFailed(false)} title="关闭">×</button>
              </div>
            )}
          </div>
        )}

        {currentChannel && !iframeFallback.visible && (
          <div className="live-channel-info">正在播放：{currentChannel.name}</div>
        )}
      </div>
    </section>
  )
}

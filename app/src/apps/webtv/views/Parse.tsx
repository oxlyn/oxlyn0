import { useCallback, useEffect, useRef, useState } from 'react'
import { useSources } from '../components/SourcesProvider'
import { composeParseUrl } from '../lib/api'
import { showToast } from '../lib/toast'
import { reportParseError as persistReportParseError } from '../lib/localStats'

/**
 * 解析工具：粘贴优酷/腾讯等视频页地址 → 选线路 → iframe 播放。
 * 10 秒未加载自动切下一条线路；报错走本地计数冻结（替代服务端 report-error）。
 * 嵌在设置页的「解析」标签里（不再是独立导航页）：根元素是 div，
 * 播放区高度由 .settings-parse 覆盖规则给定，不再独占视口。
 */
export default function Parse({ initialUrl = '' }: { initialUrl?: string }) {
  const { parses } = useSources()

  const [selectedId, setSelectedId] = useState('')
  const [targetUrl, setTargetUrl] = useState('')
  const [playUrl, setPlayUrl] = useState('')
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reportShow, setReportShow] = useState(false)
  const retryCountRef = useRef(0)
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stateRef = useRef({ parses, selectedId, iframeLoaded })
  stateRef.current = { parses, selectedId, iframeLoaded }

  const startParsePlay = useCallback(() => {
    const { parses: list, selectedId: id } = stateRef.current
    const parse = list.find((p) => p.id === id)
    if (!parse || !targetUrl) return
    const url = composeParseUrl(parse, targetUrl)
    setPlayUrl(url)
    setIframeLoaded(false)
    setLoading(true)
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current)
    // 10 秒内未加载成功则尝试下一个线路
    loadTimerRef.current = setTimeout(() => {
      if (!stateRef.current.iframeLoaded) tryNextParseRef.current()
    }, 10000)
  }, [targetUrl])

  const tryNextParse = useCallback(() => {
    const { parses: list, selectedId: id } = stateRef.current
    if (retryCountRef.current >= list.length - 1) return
    const idx = list.findIndex((p) => p.id === id)
    if (idx < 0 || idx >= list.length - 1) return
    retryCountRef.current++
    setSelectedId(list[idx + 1].id)
    // selectedId 变化后由 effect 触发重新播放
  }, [])
  const tryNextParseRef = useRef(tryNextParse)
  tryNextParseRef.current = tryNextParse

  // 线路变化且存在目标地址 → 自动播放（含 tryNextParse 的切换）
  useEffect(() => {
    if (selectedId && targetUrl && /^https?:\/\//i.test(targetUrl)) {
      startParsePlay()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  // 初始地址（payload 传入）自动填充并解析
  useEffect(() => {
    if (initialUrl && parses.length > 0) {
      setTargetUrl(initialUrl)
      setSelectedId(parses[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl, parses.length])

  const onParseIframeLoad = () => {
    setIframeLoaded(true)
    setLoading(false)
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current)
    retryCountRef.current = 0
  }

  const reportError = (type: 'play' | 'parse') => {
    setReportShow(false)
    if (!selectedId) return
    showToast('正在提交反馈...', 'warn')
    const result = persistReportParseError(selectedId, type)
    if (result.frozen) {
      showToast('该线路已被禁用，正在切换...', 'warn')
      tryNextParseRef.current()
    } else {
      showToast('已收到反馈', 'ok')
    }
  }

  const selectedName = parses.find((p) => p.id === selectedId)?.name || '--'

  return (
    <div className="parse-page">
      <div className="parse-page-player">
        <iframe
          style={{ height: '100%', display: playUrl ? undefined : 'none' }}
          src={playUrl || undefined}
          frameBorder={0}
          allowFullScreen
          onLoad={onParseIframeLoad}
        />
        {!playUrl && !loading && (
          <div className="parse-page-player-placeholder">选择线路并输入地址后点击播放</div>
        )}
        {loading && (
          <div className="parse-page-player-placeholder">
            正在使用 <strong>{selectedName}</strong> 线路加载，请稍等...
          </div>
        )}
        <div className="parse-report-area">
          {playUrl && (
            <button
              className={`parse-report-btn${reportShow ? ' active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                setReportShow((v) => !v)
              }}
            >
              报错
            </button>
          )}
          {reportShow && (
            <div className="parse-report-menu" onClick={(e) => e.stopPropagation()}>
              <div className="parse-report-menu-item" onClick={() => reportError('play')}>无法播放</div>
              <div className="parse-report-menu-item" onClick={() => reportError('parse')}>解析失败</div>
            </div>
          )}
        </div>
      </div>
      <div className="parse-page-box">
        <div className="parse-page-row-inline">
          <span className="parse-page-label-inline">线路</span>
          <select
            className="parse-page-select-inline"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">-- 请选择 --</option>
            {parses.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input
            className="parse-page-input-inline"
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="输入视频页面地址（优酷、腾讯、B站等）"
            onKeyDown={(e) => { if (e.key === 'Enter') startParsePlay(); }}
          />
          <button className="btn-play-inline" onClick={startParsePlay} disabled={!selectedId || !targetUrl}>
            播放
          </button>
          <button className="btn-open-inline" onClick={() => playUrl && window.open(playUrl, '_blank')} disabled={!playUrl}>
            新标签打开
          </button>
        </div>
      </div>
    </div>
  )
}

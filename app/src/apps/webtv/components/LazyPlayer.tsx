
import { Suspense, lazy } from 'react'

/**
 * 播放器懒加载：artplayer + hls.js 合起来 720KB，拆成独立 chunk。
 * chunk 只下载一次（之后走模块缓存），Suspense 挂在 LazyPlayer 这一层，
 * 内部 Player 仍是同一个挂载实例，换源不触发重新加载。
 */

const Player = lazy(() => import('./Player'))

export type LazyPlayerProps = {
  url: string
  isLive?: boolean
  onReady?: () => void
  onError?: () => void
}

export default function LazyPlayer({ url, isLive, onReady, onError }: LazyPlayerProps) {
  return (
    <Suspense fallback={<div className="player-loading"><span className="spinner" /></div>}>
      <Player url={url} isLive={isLive} onReady={onReady} onError={onError} />
    </Suspense>
  )
}

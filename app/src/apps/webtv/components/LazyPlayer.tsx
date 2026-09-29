
import { Suspense, lazy } from 'react'

/**
 * 播放器懒加载：artplayer + hls.js 合起来 720KB，拆成独立 chunk。
 * chunk 只下载一次（之后走模块缓存），Suspense 挂在 LazyPlayer 这一层，
 * 内部 Player 仍是同一个挂载实例，换源不触发重新加载。
 *
 * 提示文案放在 Suspense fallback 里，而不是外面用状态驱动：fallback 的生命周期
 * 正好等于 chunk 下载期。之前 Detail 用 onReady/restart 清一个 playerLoading 状态，
 * 而 restart 要等新地址 canplay 才触发——那段缓冲时间被算成「正在加载播放器」，
 * 于是每换一集都显示一次。
 */

const Player = lazy(() => import('./Player'))

/** 预热 chunk：让 720KB 的下载与详情/解析接口请求重叠，而不是排在它们后面 */
export function preloadPlayer(): Promise<unknown> {
  return import('./Player')
}

export type LazyPlayerProps = {
  url: string
  isLive?: boolean
  onReady?: () => void
  onError?: () => void
}

export default function LazyPlayer({ url, isLive, onReady, onError }: LazyPlayerProps) {
  return (
    <Suspense
      fallback={
        <div className="player-loading">
          <span className="spinner" />
          <span className="player-loading-text">正在加载播放器...</span>
        </div>
      }
    >
      <Player url={url} isLive={isLive} onReady={onReady} onError={onError} />
    </Suspense>
  )
}

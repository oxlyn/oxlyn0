
import { useEffect, useRef } from 'react'
import Artplayer from 'artplayer'
import Hls from 'hls.js'
import { getTheme } from '../lib/theme'

/**
 * ArtPlayer 封装：npm 引入 artplayer + hls.js（原版为 CDN 全局变量），
 * 并补上原版缺失的 hls.js 接线（customType.m3u8），桌面 Chrome 才能播 m3u8。
 *
 * 生命周期：一个挂载周期只建一个实例，换源走 `art.url` 赋值（不销毁重建）。
 *
 * 必须自己收尾的两件事，artplayer 都不做：
 * 1. artplayer 的 destroy() 完全不碰 art.hls —— 残留的 MediaSourceController
 *    会继续往 <video> 喂分段；
 * 2. destroy()/reset() 只 removeAttribute('src') + load()，不会 pause ——
 *    已缓冲的内容还会播完，表现为「页面走了声音还在」「再开一个两路声音叠加」。
 *
 * 收尾必须放在 effect 闭包里（不能放组件级 ref）：m3u8 的 customType 回调是
 * 异步执行的（artplayer 的 url setter 里 await sleep(0)），React 的 cleanup 可能
 * 先跑完——那时 hls/video 还没挂上来，组件级 ref 还会被下一次挂载覆盖，
 * 结果是这个 <video> 彻底没人管，一直播下去。
 */

interface PlayerProps {
  url: string;
  isLive?: boolean;
  onReady?: () => void;
  onError?: () => void;
}

export default function Player({ url, isLive = false, onReady, onError }: PlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const currentUrlRef = useRef('')
  const loadRef = useRef<(mediaUrl: string) => void>(() => {})
  const onReadyRef = useRef(onReady)
  const onErrorRef = useRef(onError)
  onReadyRef.current = onReady
  onErrorRef.current = onError

  // 建实例：整个挂载周期只建一次（容器/直播属性变化才重建）
  useEffect(() => {
    const container = containerRef.current
    if (!container || !url) return

    let cancelled = false
    let art: Artplayer | null = null
    let hls: Hls | null = null
    let video: HTMLVideoElement | null = null

    // 拆掉 hls.js 的数据源。换源时也要拆，否则旧 MediaSource 会压住新源
    const dropHls = () => {
      if (!hls) return
      const done = hls
      hls = null
      try { done.destroy() } catch { /* 忽略 */ }
    }

    // 彻底收尾：拆 hls + 停掉 video。卸载时用
    const stopAll = () => {
      dropHls()
      if (!video) return
      const done = video
      video = null
      try { done.pause() } catch { /* 忽略 */ }
      try { done.removeAttribute('src'); done.load() } catch { /* 忽略 */ }
    }

    try {
      art = new Artplayer({
        container,
        url,
        volume: 0.7,
        isLive,
        muted: false,
        autoplay: true,
        autoOrientation: true,
        playsInline: true,
        setting: true,
        flip: true,
        playbackRate: true,
        aspectRatio: true,
        fullscreen: true,
        miniProgressBar: true,
        // 播放器强调色跟随主题：经典保持 artplayer 默认视觉，现代用主题紫
        ...(getTheme() === 'modern' ? { theme: '#a78bfa' } : {}),
        // 不写死类型：artplayer 按 URL 扩展名判定，m3u8 命中 customType 走 hls.js，
        // 其余交给浏览器原生解码 —— 换源时源类型变化（m3u8↔mp4）不会被旧 type 绑住
        type: '',
        customType: {
          m3u8: (nextVideo: HTMLVideoElement, mediaUrl: string) => {
            // 回调是异步的：走到这里时本实例可能已经卸载了，
            // 直接丢弃，别把 hls 挂到一个没人收尾的元素上
            if (cancelled) return
            video = nextVideo
            dropHls()
            if (Hls.isSupported()) {
              const nextHls = new Hls()
              hls = nextHls
              nextHls.loadSource(mediaUrl)
              nextHls.attachMedia(nextVideo)
              nextHls.on(Hls.Events.ERROR, (_event, data) => {
                if (data.fatal && !cancelled) onErrorRef.current?.()
              })
            } else if (nextVideo.canPlayType('application/vnd.apple.mpegurl')) {
              nextVideo.src = mediaUrl // Safari 原生 HLS
            } else {
              onErrorRef.current?.()
            }
          },
        },
      })
      currentUrlRef.current = url
      loadRef.current = (mediaUrl: string) => {
        if (cancelled || !mediaUrl || mediaUrl === currentUrlRef.current) return
        currentUrlRef.current = mediaUrl
        art!.url = mediaUrl
      }
      art.on('ready', () => { if (!cancelled) onReadyRef.current?.() })
      art.on('restart', () => { if (!cancelled) onReadyRef.current?.() })
      art.on('error', () => { if (!cancelled) onErrorRef.current?.() })
    } catch (e) {
      console.error('ArtPlayer 创建失败', e)
      onErrorRef.current?.()
    }

    return () => {
      cancelled = true
      loadRef.current = () => {}
      currentUrlRef.current = ''
      stopAll()
      if (art) {
        try { art.destroy() } catch { /* 忽略 */ }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive])

  // 换源：复用同一实例
  useEffect(() => {
    if (url) loadRef.current(url)
  }, [url])

  return <div ref={containerRef} className="detail-artplayer-container" style={{ width: '100%', height: '100%' }} />
}

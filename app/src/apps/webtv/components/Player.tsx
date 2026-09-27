
import { useEffect, useRef } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { isM3U8 } from '../lib/maccms';

/**
 * ArtPlayer 封装：npm 引入 artplayer + hls.js（原版为 CDN 全局变量），
 * 并补上原版缺失的 hls.js 接线（customType.m3u8），桌面 Chrome 才能播 m3u8。
 * 每次换 URL 销毁重建实例（与原版 loadVideoSource/playLiveChannel 行为一致）。
 */

interface PlayerProps {
  url: string;
  isLive?: boolean;
  onReady?: () => void;
  onError?: () => void;
}

export default function Player({ url, isLive = false, onReady, onError }: PlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<Artplayer | null>(null);
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  onReadyRef.current = onReady;
  onErrorRef.current = onError;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !url) return;

    let cancelled = false;
    let art: Artplayer | null = null;

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
        // 非 m3u8 传 ''：artplayer 只接受 string（undefined 会抛 [Type Error]），
        // 空串则回落到按 URL 扩展名推断类型
        type: isM3U8(url) ? 'm3u8' : '',
        customType: {
          m3u8: (video: HTMLVideoElement, mediaUrl: string) => {
            if (!art) return;
            if (Hls.isSupported()) {
              if (art.hls) (art.hls as Hls).destroy();
              const hls = new Hls();
              hls.loadSource(mediaUrl);
              hls.attachMedia(video);
              // ArtPlayer 约定：挂到 art.hls 后 destroy() 会自动清理
              art.hls = hls;
              hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data.fatal) onErrorRef.current?.();
              });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
              video.src = mediaUrl; // Safari 原生 HLS
            } else {
              onErrorRef.current?.();
            }
          },
        },
      });
      artRef.current = art;
      art.on('ready', () => { if (!cancelled) onReadyRef.current?.(); });
      art.on('error', () => { if (!cancelled) onErrorRef.current?.(); });
    } catch (e) {
      console.error('ArtPlayer 创建失败', e);
      onErrorRef.current?.();
    }

    return () => {
      cancelled = true;
      if (artRef.current) {
        try { artRef.current.destroy(); } catch { /* 忽略 */ }
        artRef.current = null;
      }
    };
  }, [url, isLive]);

  return <div ref={containerRef} className="detail-artplayer-container" style={{ width: '100%', height: '100%' }} />;
}

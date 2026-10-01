import { useEffect, useState } from 'react'
import { Check, Copy, ExternalLink, Loader2, X } from 'lucide-react'
import { AppIcon } from './AppIcon'
import type { AppDefinition, AppIconSpec } from './types'

/**
 * 网站即 app —— 在线网站的集成框架。集成一个网站只需在 `src/webapps.ts`
 * 清单里加一个对象；本文件是框架本体，日常不需要改动：
 *
 * - `WebAppSite` — 清单条目的类型；
 * - `WebEmbedFrame` — 把站点装进窗口：`direct` 直接 iframe；`none` 渲染降级
 *   卡片（站点通过 X-Frame-Options / CSP frame-ancestors 拒绝被嵌是浏览器
 *   层面的硬限制，跨域脚本探测不到也无法绕过，只能引导去浏览器打开）；
 * - `webappToDefinition()` — 把清单对象合成为 AppDefinition，交给 registry
 *   与目录 app 同等对待（Dock / Launchpad / Spotlight / 窗口管理）。
 *
 * 站点默认 singleton + keepAlive：网站是一个「标签页」，重复打开聚焦已有
 * 窗口，关窗后 iframe 挂起、重开零重载（复用窗口管理的 keepAlive 常驻池）。
 */

export interface WebAppSite {
  /** 唯一 id（窗口系统、Spotlight、?app=<id> 深链都用它） */
  id: string
  /** 显示名 */
  name: string
  /** 站点地址（也是标题栏弹出新标签页的目标） */
  url: string
  /** 渐变 + lucide 图标，与原生 app 同一套视觉 */
  icon: AppIconSpec
  /**
   * `'direct'`（默认）：直接 iframe。要求目标站不发 X-Frame-Options /
   * CSP frame-ancestors 拒嵌头——先 `curl -sI <url> | grep -i frame` 验一下。
   * `'none'`：站点拒绝被嵌，窗口渲染降级卡片，引导「在浏览器中打开」。
   */
  embed?: 'direct' | 'none'
  /** 拒嵌卡片上的说明文字（embed: 'none' 时建议写明原因） */
  note?: string
  defaultSize?: { w: number; h: number }
  minSize?: { w: number; h: number }
  category?: string
  keywords?: string[]
  /** 显示在 Dock（默认 false —— 只进 Launchpad / Spotlight） */
  inDock?: boolean
  /** 桌面快捷方式（默认 false） */
  onDesktop?: boolean
  /** 关窗挂起 iframe、重开秒回（默认 true） */
  keepAlive?: boolean
}

const WEB_DEFAULT_SIZE = { w: 1080, h: 720 }
const WEB_MIN_SIZE = { w: 480, h: 320 }

export function webappToDefinition(site: WebAppSite): AppDefinition {
  const WebAppWindow = () => <WebEmbedFrame site={site} />
  WebAppWindow.displayName = `WebApp(${site.id})`
  return {
    id: site.id,
    name: site.name,
    icon: site.icon,
    component: WebAppWindow,
    defaultSize: site.defaultSize ?? WEB_DEFAULT_SIZE,
    minSize: site.minSize ?? WEB_MIN_SIZE,
    category: site.category ?? 'Web',
    keywords: site.keywords,
    singleton: true,
    inDock: site.inDock,
    onDesktop: site.onDesktop,
    keepAlive: site.keepAlive ?? true,
    popOutUrl: () => site.url,
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

/** 拒嵌降级卡片：站点不允许被 iframe，引导在浏览器里打开。 */
function BlockedCard({ site, host }: { site: WebAppSite; host: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // 剪贴板不可用（权限/非安全上下文）时静默失败
    }
  }
  return (
    <div className="grid h-full place-items-center bg-neutral-100 dark:bg-neutral-900">
      <div className="flex w-72 flex-col items-center gap-3 rounded-2xl bg-white/90 p-7 text-center shadow-xl ring-1 ring-black/10 dark:bg-neutral-800/90 dark:ring-white/10">
        <AppIcon icon={site.icon} size={64} />
        <div>
          <div className="font-semibold text-neutral-800 dark:text-neutral-100">{site.name}</div>
          <div className="mt-0.5 text-[12px] text-neutral-500">{host}</div>
        </div>
        <p className="text-[12px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          {site.note ?? '该网站禁止被嵌入其他页面（X-Frame-Options），无法在窗口内打开。'}
        </p>
        <button
          onClick={() => window.open(site.url, '_blank', 'noopener')}
          className="mt-1 flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-[13px] font-semibold text-white shadow-md transition-transform hover:scale-105"
        >
          <ExternalLink size={13} /> 在浏览器中打开
        </button>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-[12px] text-neutral-500 transition-colors hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? '已复制链接' : '复制链接'}
        </button>
      </div>
    </div>
  )
}

/** 超时多久后放弃沉默，浮现「去浏览器打开」的出口提示。 */
const SLOW_MS = 15000

function DirectFrame({ site, host }: { site: WebAppSite; host: string }) {
  // load 只表示文档级加载完成：跨域下探测不到 XFO 拒绝（那时 load 照样触发，
  // 内容是浏览器错误页），所以超时提示只是提供一个出口，不猜测成败。
  const [loaded, setLoaded] = useState(false)
  const [slow, setSlow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setSlow(true), SLOW_MS)
    return () => window.clearTimeout(t)
  }, [])
  return (
    <div className="relative h-full bg-white">
      <iframe
        src={site.url}
        title={site.name}
        className="h-full w-full border-0"
        allow="fullscreen; clipboard-read; clipboard-write"
        onLoad={() => setLoaded(true)}
      />
      {!loaded && (
        <div className="absolute inset-0 grid place-items-center bg-white">
          <div className="flex items-center gap-2 text-[13px] text-neutral-400">
            <Loader2 size={16} className="animate-spin" /> 正在加载 {host}…
          </div>
        </div>
      )}
      {slow && !loaded && !dismissed && (
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-white/92 py-1.5 pl-3.5 pr-1.5 text-[12px] font-medium text-black/70 shadow-lg ring-1 ring-black/10 backdrop-blur">
          <span>加载较慢或被拒绝嵌入</span>
          <button
            onClick={() => window.open(site.url, '_blank', 'noopener')}
            className="flex items-center gap-1 rounded-full bg-black/8 px-2 py-0.5 transition-colors hover:bg-black/15"
            title="在新标签页打开"
          >
            浏览器打开 <ExternalLink size={11} />
          </button>
          <button onClick={() => setDismissed(true)} className="rounded-full p-1 hover:bg-black/5" title="关闭提示">
            <X size={11} />
          </button>
        </div>
      )}
    </div>
  )
}

export function WebEmbedFrame({ site }: { site: WebAppSite }) {
  const host = hostOf(site.url)
  if (site.embed === 'none') return <BlockedCard site={site} host={host} />
  return <DirectFrame site={site} host={host} />
}

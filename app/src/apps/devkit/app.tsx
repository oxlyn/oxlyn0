import { useRef } from 'react'
import { Wrench } from 'lucide-react'
import { useIframeDark } from '@/system/useIframeDark'
import type { AppDefinition } from '@/system/types'

const DEVKIT_URL = `${import.meta.env.BASE_URL}devkit/index.html`

/**
 * DevKit · 开发者工具箱 — self-contained dev-tools site (Base64/URL 编码、
 * JSON 格式化校验 + TypeScript 类型生成、图片/文本处理等), embedded verbatim
 * from devkit/ at the repo root. Same-origin iframe. Follows the desktop
 * appearance via the site's own data-theme engine, but a theme picked inside
 * DevKit (localStorage 'dk-theme') sticks.
 */
function DevKitApp() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  // No per-window cache-buster: a stable URL lets the browser serve the site
  // from HTTP cache on every reopen.
  const src = DEVKIT_URL
  useIframeDark(iframeRef, (f, dark) => {
    const w = f.contentWindow as (Window & { applyTheme?: (t: 'light' | 'dark') => void }) | null
    if (!w?.document.documentElement) return
    // The site persists its last theme into localStorage on every apply, so
    // drive it through its own applyTheme(): one call keeps the DOM, the
    // ☀️/🌙 button glyph and the stored value in sync. An in-page toggle then
    // sticks until the desktop appearance changes again.
    const t = dark ? 'dark' : 'light'
    if (typeof w.applyTheme === 'function') w.applyTheme(t)
    else w.document.documentElement.dataset.theme = t
  })
  return (
    <div className="flex h-full flex-col bg-[#f5f6f8] dark:bg-[#0d1017]">
      <iframe
        ref={iframeRef}
        src={src}
        title="DevKit · 开发者工具箱"
        className="min-h-0 w-full flex-1 border-0"
      />
    </div>
  )
}

export default {
  id: 'devkit',
  name: 'DevKit',
  icon: { from: '#6366F1', to: '#4F46E5', Icon: Wrench },
  component: DevKitApp,
  defaultSize: { w: 1180, h: 760 },
  minSize: { w: 640, h: 460 },
  category: 'Utilities',
  keywords: ['devkit', '工具箱', '工具', '开发者', 'developer', 'tools', 'json', 'base64'],
  inDock: true,
  // Self-contained site: closing parks the iframe (dormant) instead of
  // destroying it, and the title-bar pop-out opens the site directly.
  keepAlive: true,
  popOutUrl: () => DEVKIT_URL,
} satisfies AppDefinition

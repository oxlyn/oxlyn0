import { useEffect, useRef, useState } from 'react'
import { GraduationCap, Palette } from 'lucide-react'
import { useSystem } from '@/system/stores/system'
import type { AppDefinition } from '@/system/types'

const STUDY_URL = `${import.meta.env.BASE_URL}study/index.html`

const LX_THEMES = [
  { id: 'dark', name: '深色', icon: '🌙' },
  { id: 'spring', name: '春', icon: '🌸' },
  { id: 'summer', name: '夏', icon: '☀️' },
  { id: 'autumn', name: '秋', icon: '🍂' },
  { id: 'winter', name: '冬', icon: '❄️' },
] as const

const LX_BG: Record<string, string> = {
  dark: '#14121d', spring: '#fdf5f8', summer: '#effaf8', autumn: '#faf4e8', winter: '#f0f4fa',
}

/**
 * 乐学二年级 — full 2nd-grade practice app (语文数学同步练习), embedded verbatim
 * from study/index.html. Ships a 5-theme engine (深色/春夏秋冬) applied via
 * html[data-lx]; the floating switcher bottom-left picks the theme and it
 * persists. Until the visitor picks manually, the theme follows the desktop
 * appearance (dark → 深色, light → 春).
 */
function StudyApp() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  // No per-window cache-buster: a stable URL lets the browser serve the
  // (large) document from HTTP cache on every reopen.
  const src = STUDY_URL
  const [lx, setLx] = useState<string>(() => localStorage.getItem('lx-theme') ?? (useSystem.getState().theme === 'dark' ? 'dark' : 'spring'))
  const manual = useRef(localStorage.getItem('lx-theme-manual') === '1')
  const [pickerOpen, setPickerOpen] = useState(false)
  const systemDark = useSystem((s) => s.theme === 'dark')

  // apply to the iframe document (on change and after every iframe reload)
  useEffect(() => {
    const run = () => {
      const doc = iframeRef.current?.contentDocument
      if (doc?.documentElement) doc.documentElement.dataset.lx = lx
    }
    run()
    const f = iframeRef.current
    f?.addEventListener('load', run)
    return () => f?.removeEventListener('load', run)
  }, [lx])

  // follow the desktop appearance until a manual choice is made
  useEffect(() => {
    if (!manual.current) setLx(systemDark ? 'dark' : 'spring')
  }, [systemDark])

  const pick = (id: string) => {
    manual.current = true
    localStorage.setItem('lx-theme', id)
    localStorage.setItem('lx-theme-manual', '1')
    setLx(id)
    setPickerOpen(false)
  }

  const current = LX_THEMES.find((t) => t.id === lx) ?? LX_THEMES[0]

  return (
    <div className="relative flex h-full flex-col" style={{ background: LX_BG[lx] }}>
      <iframe
        ref={iframeRef}
        src={src}
        title="乐学二年级"
        className="min-h-0 w-full flex-1 border-0"
      />
      {/* floating theme switcher — bottom-left */}
      <div className="absolute bottom-3 left-3 z-10 text-[12px]">
        {pickerOpen ? (
          <div className="overflow-hidden rounded-xl bg-white/97 shadow-xl ring-1 ring-black/10 backdrop-blur">
            <div className="flex items-center justify-between px-3 py-1.5 text-black/40">
              <span className="font-semibold">主题</span>
              <button className="rounded px-1 hover:bg-black/5" onClick={() => setPickerOpen(false)}>×</button>
            </div>
            {LX_THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => pick(t.id)}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-black/80 ${
                  lx === t.id ? 'bg-black/8 font-semibold' : 'hover:bg-black/5'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-1.5 font-semibold text-black/70 shadow-lg ring-1 ring-black/10 backdrop-blur transition-transform hover:scale-105"
            title="切换主题"
          >
            <Palette size={13} />
            {current.icon} {current.name}
          </button>
        )}
      </div>
    </div>
  )
}

export default {
  id: 'study',
  name: 'Study',
  icon: { from: '#FFB35C', to: '#FF8A3D', Icon: GraduationCap },
  component: StudyApp,
  defaultSize: { w: 980, h: 700 },
  minSize: { w: 560, h: 420 },
  category: 'Education',
  keywords: ['learn', 'study', 'math', 'chinese', '练习', '学习', '语文', '数学', '乐学'],
  inDock: true,
  // Self-contained site: closing parks the iframe (dormant) instead of
  // destroying it, and the title-bar pop-out opens the site directly.
  keepAlive: true,
  popOutUrl: () => STUDY_URL,
} satisfies AppDefinition

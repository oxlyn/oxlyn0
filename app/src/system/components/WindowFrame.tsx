import { useRef } from 'react'
import { AppWindow } from 'lucide-react'
import type { Win } from '../stores/windows'
import { useWindows } from '../stores/windows'
import { useSystem } from '../stores/system'
import { appById } from '../registry'
import { popOutApp } from '../popout'

const MENUBAR = 28
const DOCK = 88

type Edge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

const HANDLES: { edge: Edge; className: string }[] = [
  { edge: 'n', className: 'top-0 left-2 right-2 h-1 cursor-ns-resize' },
  { edge: 's', className: 'bottom-0 left-2 right-2 h-1.5 cursor-ns-resize' },
  { edge: 'e', className: 'right-0 top-2 bottom-2 w-1 cursor-ew-resize' },
  { edge: 'w', className: 'left-0 top-2 bottom-2 w-1 cursor-ew-resize' },
  { edge: 'ne', className: 'top-0 right-0 w-3 h-3 cursor-nesw-resize' },
  { edge: 'nw', className: 'top-0 left-0 w-3 h-3 cursor-nwse-resize' },
  { edge: 'se', className: 'bottom-0 right-0 w-3.5 h-3.5 cursor-nwse-resize' },
  { edge: 'sw', className: 'bottom-0 left-0 w-3 h-3 cursor-nesw-resize' },
]

export function WindowFrame({ win }: { win: Win }) {
  const app = appById.get(win.appId)
  const { focus, close, minimize, toggleMaximize, toggleFocusMode, setRect } = useWindows()
  const drag = useRef<{ dx: number; dy: number } | null>(null)
  const resize = useRef<{ edge: Edge; sx: number; sy: number; r: Win } | null>(null)
  if (!app) return null

  const inFocus = useWindows((s) => s.focusId) === win.id
  const standalone = useSystem((s) => s.standalone)
  // Standalone single-app tabs (?app=) show pure app content — no title bar.
  const showTitleBar = !inFocus || !standalone

  const startDrag = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-nodrag]')) return
    if (win.maximized || inFocus) return
    focus(win.id)
    drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onDragMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    setRect(win.id, {
      x: Math.min(Math.max(e.clientX - drag.current.dx, -win.w + 90), window.innerWidth - 90),
      y: Math.min(Math.max(e.clientY - drag.current.dy, MENUBAR), window.innerHeight - 40),
    })
  }
  const endDrag = () => (drag.current = null)

  const startResize = (e: React.PointerEvent, edge: Edge) => {
    e.stopPropagation()
    focus(win.id)
    resize.current = { edge, sx: e.clientX, sy: e.clientY, r: { ...win } }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onResizeMove = (e: React.PointerEvent) => {
    const r = resize.current
    if (!r) return
    const minW = app.minSize?.w ?? 420
    const minH = app.minSize?.h ?? 300
    const dx = e.clientX - r.sx
    const dy = e.clientY - r.sy
    let { x, y, w, h } = r.r
    if (r.edge.includes('e')) w = Math.max(minW, r.r.w + dx)
    if (r.edge.includes('s')) h = Math.max(minH, r.r.h + dy)
    if (r.edge.includes('w')) { w = Math.max(minW, r.r.w - dx); x = r.r.x + (r.r.w - w) }
    if (r.edge.includes('n')) { h = Math.max(minH, r.r.h - dy); y = Math.max(MENUBAR, r.r.y + (r.r.h - h)) }
    setRect(win.id, { x, y, w, h })
  }

  const style: React.CSSProperties = inFocus
    ? { left: 0, top: 0, width: '100%', height: '100%', zIndex: win.z }
    : win.maximized
      ? { left: 0, top: MENUBAR, width: '100%', height: `calc(100% - ${MENUBAR + DOCK}px)`, zIndex: win.z }
      : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }

  const focused = useWindows((s) => s.focusedId) === win.id

  return (
    <div
      className={`${inFocus ? 'focus-in' : 'win-in'} pointer-events-auto absolute flex flex-col overflow-hidden ${
        inFocus
          ? '' // full-bleed: no rounding, ring or shadow in focus mode
          : `rounded-xl ring-1 shadow-2xl ${focused ? 'ring-black/25 dark:ring-white/20' : 'ring-black/15 dark:ring-white/10'}`
      } ${win.minimized ? 'hidden' : ''}`}
      style={{ ...style, boxShadow: !inFocus && focused ? '0 24px 60px rgba(0,0,0,0.34)' : !inFocus ? '0 12px 34px rgba(0,0,0,0.22)' : undefined }}
      onPointerDown={() => focus(win.id)}
    >
      {/* title bar (hidden in standalone single-app tabs) */}
      {showTitleBar && (
        <div
          className="glass relative flex h-9 shrink-0 items-center px-3 select-none"
          onPointerDown={startDrag}
          onPointerMove={onDragMove}
          onPointerUp={endDrag}
          onDoubleClick={() => toggleMaximize(win.id)}
        >
          <div className="flex items-center gap-2" data-nodrag>
            <TrafficLight color="#FF5F57" border="#E0443E" onClick={() => close(win.id)} glyph="✕" active={focused} />
            <TrafficLight color="#FEBC2E" border="#D89E24" onClick={() => minimize(win.id)} glyph="–" active={focused} />
            <TrafficLight color="#28C840" border="#1AAB29" onClick={() => toggleFocusMode(win.id)} glyph={inFocus ? '⤡' : '⤢'} active={focused} title={inFocus ? '退出专注模式 (Esc)' : '专注模式（只显示此应用）'} />
            {/* pop out into a standalone browser tab showing only this app */}
            <button
              onClick={() => popOutApp(app.id)}
              title="在新标签页打开此应用"
              aria-label="在新标签页打开此应用"
              className="ml-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-md bg-black/8 text-black/55 transition-colors hover:bg-black/15 hover:text-black dark:bg-white/12 dark:text-white/60 dark:hover:bg-white/20 dark:hover:text-white"
              style={{ width: 18, height: 18 }}
            >
              <AppWindow size={11} strokeWidth={2.2} />
            </button>
          </div>
          <div className="pointer-events-none absolute inset-x-0 text-center text-[13px] font-semibold text-black/70 dark:text-white/75">
            {app.name}
          </div>
        </div>
      )}
      {/* content */}
      <div className="relative min-h-0 flex-1 bg-white/92 text-black dark:bg-[#1e1e20]/92 dark:text-white">
        <app.component winId={win.id} payload={win.payload} />
      </div>
      {/* resize handles */}
      {!win.maximized && !inFocus &&
        HANDLES.map(({ edge, className }) => (
          <div
            key={edge}
            className={`absolute ${className}`}
            onPointerDown={(e) => startResize(e, edge)}
            onPointerMove={onResizeMove}
            onPointerUp={() => (resize.current = null)}
          />
        ))}
    </div>
  )
}

function TrafficLight({ color, border, onClick, glyph, active, title }: { color: string; border: string; onClick: () => void; glyph: string; active: boolean; title?: string }) {
  return (
    <button
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      className="group relative h-3 w-3 rounded-full ring-1"
      title={title}
      aria-label={title ?? glyph}
      style={{ background: active ? color : '#c8c8ca', borderColor: border, boxShadow: `inset 0 0 0 0.5px ${active ? border : 'rgba(0,0,0,0.12)'}` }}
    >
      <span className="absolute inset-0 flex items-center justify-center text-[8px] leading-none font-bold text-black/55 opacity-0 group-hover:opacity-100">
        {glyph}
      </span>
    </button>
  )
}

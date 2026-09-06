import { useEffect, useRef, useState } from 'react'
import { Wifi, BatteryMedium, Search } from 'lucide-react'
import { useWindows } from '../stores/windows'
import { useSystem } from '../stores/system'
import { appById } from '../registry'

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10_000)
    return () => clearInterval(t)
  }, [])
  return now
}

const fmtClock = (d: Date) =>
  d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
  '  ' +
  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

function Menu({ label, bold, items }: { label: React.ReactNode; bold?: boolean; items: { label: string; action?: () => void; sep?: boolean; disabled?: boolean }[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])
  return (
    <div className="relative" ref={ref}>
      <button
        className={`rounded px-2 py-0.5 text-[13px] ${bold ? 'font-bold' : ''} ${open ? 'bg-black/10 dark:bg-white/15' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
      </button>
      {open && (
        <div className="glass absolute top-full left-0 mt-1.5 min-w-52 rounded-lg p-1 text-[13px] shadow-xl ring-1 ring-black/10 dark:ring-white/15">
          {items.map((it, i) =>
            it.sep ? (
              <div key={i} className="mx-2 my-1 border-t border-black/10 dark:border-white/15" />
            ) : (
              <button
                key={i}
                disabled={it.disabled}
                className={`block w-full rounded px-2.5 py-1 text-left ${it.disabled ? 'text-black/30 dark:text-white/30' : 'hover:bg-blue-500 hover:text-white'}`}
                onClick={() => { setOpen(false); it.action?.() }}
              >
                {it.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}

const AppleLogo = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-black dark:fill-white" aria-hidden>
    <path d="M17.05 12.54c-.03-2.55 2.08-3.77 2.17-3.83-1.18-1.73-3.02-1.97-3.68-2-1.57-.16-3.06.92-3.85.92-.79 0-2.02-.9-3.32-.87-1.71.03-3.29 1-4.17 2.53-1.78 3.09-.45 7.66 1.28 10.16.85 1.22 1.86 2.6 3.18 2.55 1.28-.05 1.76-.83 3.3-.83 1.54 0 1.98.83 3.33.8 1.38-.02 2.25-1.24 3.09-2.47.97-1.42 1.37-2.8 1.39-2.87-.03-.01-2.69-1.03-2.72-4.09zM14.53 4.96c.7-.85 1.17-2.03 1.04-3.21-1.01.04-2.23.67-2.95 1.52-.65.75-1.22 1.95-1.07 3.1 1.13.09 2.28-.57 2.98-1.41z" />
  </svg>
)

export function MenuBar({ onSpotlight }: { onSpotlight: () => void }) {
  const wins = useWindows((s) => s.wins)
  const focusedId = useWindows((s) => s.focusedId)
  const open = useWindows((s) => s.open)
  const lock = useSystem((s) => s.lock)
  const now = useClock()
  const focusedWin = wins.find((w) => w.id === focusedId && !w.minimized)
  const activeApp = focusedWin ? appById.get(focusedWin.appId) : null

  return (
    <div className="glass glass-refract fixed inset-x-0 top-0 z-40 flex h-7 items-center justify-between px-3 text-black/85 dark:text-white/90">
      <div className="flex items-center gap-0.5">
        <Menu
          label={<AppleLogo />}
          items={[
            { label: 'About This Mac', action: () => open('settings', { pane: 'about' }) },
            { sep: true, label: '' },
            { label: 'System Settings…', action: () => open('settings') },
            { sep: true, label: '' },
            { label: 'Lock Screen', action: () => lock() },
            { label: 'Restart…', action: () => window.location.reload() },
          ]}
        />
        {activeApp && (
          <Menu
            label={activeApp.name}
            bold
            items={[
              { label: `About ${activeApp.name}`, disabled: true },
              { sep: true, label: '' },
              { label: `Quit ${activeApp.name}`, action: () => useWindows.getState().close(focusedWin!.id) },
            ]}
          />
        )}
        <Menu label="File" items={[{ label: 'New Window', disabled: true }, { label: 'Open…', disabled: true }, { label: 'Close', disabled: true }]} />
        <Menu label="Edit" items={[{ label: 'Undo', disabled: true }, { label: 'Cut', disabled: true }, { label: 'Copy', disabled: true }, { label: 'Paste', disabled: true }]} />
        <Menu label="View" items={[{ label: 'as Icons', disabled: true }, { label: 'as List', disabled: true }]} />
        <Menu label="Window" items={[{ label: 'Minimize', disabled: true }, { label: 'Zoom', disabled: true }]} />
        <Menu label="Help" items={[{ label: 'macOS 27 Help', disabled: true }]} />
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onSpotlight} className="rounded p-0.5 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Spotlight">
          <Search size={14} />
        </button>
        <BatteryMedium size={17} className="hidden sm:block" />
        <Wifi size={15} />
        <span className="text-[13px] tabular-nums">{fmtClock(now)}</span>
      </div>
    </div>
  )
}

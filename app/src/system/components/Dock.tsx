import { Trash2 } from 'lucide-react'
import { dockApps } from '../registry'
import { useWindows } from '../stores/windows'
import { AppIcon } from '../AppIcon'

export function Dock() {
  const wins = useWindows((s) => s.wins)
  const open = useWindows((s) => s.open)
  const running = new Map<string, number>()
  for (const w of wins) running.set(w.appId, (running.get(w.appId) ?? 0) + 1)

  const click = (id: string) => {
    const { focusedId, focus, minimize } = useWindows.getState()
    const appWins = wins.filter((w) => w.appId === id)
    if (appWins.length === 0) return open(id)
    const top = appWins.slice().sort((a, b) => b.z - a.z)[0]
    // Frontmost & visible → minimize the whole app; background or minimized → restore + bring to front.
    if (!top.minimized && focusedId === top.id) {
      appWins.forEach((w) => minimize(w.id))
    } else {
      appWins.forEach((w) => { if (w.minimized) focus(w.id) })
      focus(top.id)
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-1.5 z-50 flex justify-center">
      <div className="glass glass-refract flex items-end gap-1.5 rounded-[22px] px-2 py-1.5 ring-1 ring-white/25 shadow-2xl dark:ring-white/15">
        {dockApps.map((app) => (
          <DockItem
            key={app.id}
            label={app.name}
            running={running.has(app.id)}
            onClick={() => click(app.id)}
            icon={<AppIcon icon={app.icon} size={46} />}
          />
        ))}
        <div className="mx-1 h-11 w-px self-center bg-black/15 dark:bg-white/20" />
        <DockItem
          label="Trash"
          running={false}
          onClick={() => open('finder', { folder: 'trash' })}
          icon={
            <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[11px] bg-white/25 ring-1 ring-white/30 dark:bg-white/10">
              <Trash2 size={26} className="text-black/70 dark:text-white/80" strokeWidth={1.6} />
            </div>
          }
        />
      </div>
    </div>
  )
}

function DockItem({ label, icon, running, onClick }: { label: string; icon: React.ReactNode; running: boolean; onClick: () => void }) {
  return (
    <button className="group relative flex flex-col items-center" onClick={onClick} aria-label={label}>
      <span className="glass pointer-events-none absolute -top-10 hidden rounded-md px-2 py-0.5 text-xs whitespace-nowrap text-black/85 ring-1 ring-black/10 group-hover:block dark:text-white/90 dark:ring-white/15">
        {label}
      </span>
      <span className="block origin-bottom transition-transform duration-150 group-hover:-translate-y-1.5 group-hover:scale-115 group-active:scale-100">
        {icon}
      </span>
      <span className={`mt-0.5 h-1 w-1 rounded-full ${running ? 'bg-black/55 dark:bg-white/70' : 'bg-transparent'}`} />
    </button>
  )
}

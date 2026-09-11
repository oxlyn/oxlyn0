import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { launchpadApps, useAppsReady } from '../registry'
import { useWindows } from '../stores/windows'
import { AppIcon } from '../AppIcon'

export function Launchpad({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('')
  const open = useWindows((s) => s.open)
  const ready = useAppsReady((s) => s.ready)
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!ready || !needle) return ready ? launchpadApps : []
    return launchpadApps.filter(
      (a) => a.name.toLowerCase().includes(needle) || a.keywords?.some((k) => k.includes(needle)) || a.category?.toLowerCase().includes(needle),
    )
  }, [q, ready])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-60 bg-black/30 backdrop-blur-3xl" onClick={onClose}>
      <div className="mx-auto mt-10 flex w-72 items-center gap-2 rounded-lg bg-white/20 px-3 py-1.5 text-white ring-1 ring-white/30" onClick={(e) => e.stopPropagation()}>
        <Search size={14} className="opacity-70" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search Apps"
          className="w-full bg-transparent text-sm outline-none placeholder:text-white/60"
        />
      </div>
      <div className="mx-auto mt-12 grid max-w-4xl grid-cols-4 gap-x-4 gap-y-7 px-10 sm:grid-cols-6 md:grid-cols-7" onClick={(e) => e.stopPropagation()}>
        {results.map((app) => (
          <button
            key={app.id}
            className="group flex flex-col items-center gap-1.5"
            onClick={() => { open(app.id); onClose() }}
          >
            <span className="transition-transform group-hover:scale-110 group-active:scale-95">
              <AppIcon icon={app.icon} size={62} />
            </span>
            <span className="max-w-20 truncate text-xs font-medium text-white drop-shadow">{app.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

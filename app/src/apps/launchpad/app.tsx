import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { launchpadApps } from '@/system/registry'
import { useWindows } from '@/system/stores/windows'
import { AppIcon } from '@/system/AppIcon'
import type { AppDefinition } from '@/system/types'
import { LayoutGrid } from 'lucide-react'

function Launchpad() {
  const [q, setQ] = useState('')
  const open = useWindows((s) => s.open)

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const hits = launchpadApps.filter(
      (a) => !needle || a.name.toLowerCase().includes(needle) || a.keywords?.some((k) => k.includes(needle)),
    )
    const byCat = new Map<string, typeof launchpadApps>()
    for (const a of hits) {
      const cat = a.category ?? 'Other'
      if (!byCat.has(cat)) byCat.set(cat, [])
      byCat.get(cat)!.push(a)
    }
    return [...byCat.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [q])

  return (
    <div className="flex h-full flex-col bg-white/60 dark:bg-black/40">
      <div className="mx-auto mt-4 flex w-64 items-center gap-2 rounded-lg bg-black/5 px-3 py-1.5 dark:bg-white/10">
        <Search size={13} className="opacity-50" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search"
          className="w-full bg-transparent text-[13px] outline-none select-text"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-6">
        {groups.map(([cat, list]) => (
          <div key={cat}>
            <div className="mt-5 mb-2 text-[11px] font-semibold text-black/40 dark:text-white/40">{cat}</div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-y-4">
              {list.map((app) => (
                <button key={app.id} className="group flex flex-col items-center gap-1.5" onClick={() => open(app.id)}>
                  <span className="transition-transform group-hover:scale-110 group-active:scale-95">
                    <AppIcon icon={app.icon} size={56} />
                  </span>
                  <span className="max-w-20 truncate text-[11.5px] font-medium">{app.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default {
  id: 'launchpad',
  name: 'Apps',
  icon: { from: '#8E8E93', to: '#48484A', Icon: LayoutGrid },
  component: Launchpad,
  defaultSize: { w: 1024, h: 700 },
  minSize: { w: 640, h: 480 },
  category: 'Utilities',
  keywords: ['apps', 'launch', 'grid', 'all'],
  singleton: true,
} satisfies AppDefinition

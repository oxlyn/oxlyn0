import { useMemo, useState } from 'react'
import { Search, Download, Check } from 'lucide-react'
import { apps } from '@/system/registry'
import { useWindows } from '@/system/stores/windows'
import { AppIcon } from '@/system/AppIcon'
import type { AppDefinition } from '@/system/types'
import { Store } from 'lucide-react'

const TABS = ['Discover', 'Create', 'Work', 'Play', 'Develop', 'Updates'] as const

const TAB_CAT: Record<(typeof TABS)[number], string[]> = {
  Discover: [],
  Create: ['Creativity'],
  Work: ['Productivity & Finance'],
  Play: ['Entertainment', 'Games'],
  Develop: ['Utilities', 'Developer'],
  Updates: [],
}

function AppStore() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Discover')
  const [q, setQ] = useState('')
  const wins = useWindows((s) => s.wins)
  const open = useWindows((s) => s.open)
  const running = new Set(wins.map((w) => w.appId))

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const cats = TAB_CAT[tab]
    return apps
      .filter((a) => a.id !== 'appstore')
      .filter((a) => cats.length === 0 || (a.category && cats.includes(a.category)))
      .filter((a) => !needle || a.name.toLowerCase().includes(needle) || a.category?.toLowerCase().includes(needle))
  }, [tab, q])

  return (
    <div className="flex h-full text-[13px]">
      <div className="glass-thin w-44 shrink-0 border-r border-black/10 p-2 dark:border-white/10">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left ${tab === t ? 'bg-blue-500 text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
            <span className={`h-2 w-2 rounded-full ${tab === t ? 'bg-white/70' : 'bg-blue-400/60'}`} />
            {t}
          </button>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-11 items-center gap-3 border-b border-black/10 px-4 dark:border-white/10">
          <span className="text-[15px] font-bold">{tab}</span>
          <label className="ml-auto flex w-52 items-center gap-2 rounded-md bg-black/5 px-2 py-1 dark:bg-white/10">
            <Search size={13} className="opacity-50" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Apps" className="w-full bg-transparent text-[12.5px] outline-none select-text" />
          </label>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {tab === 'Discover' && (
            <div
              className="mb-5 flex items-center gap-5 overflow-hidden rounded-2xl p-6 text-white"
              style={{ background: 'linear-gradient(120deg,#0a5cff,#32ADE6 55%,#7d2ae8)' }}
            >
              <div className="min-w-0">
                <div className="text-[11px] font-semibold tracking-wide uppercase opacity-80">Featured</div>
                <div className="text-xl font-bold">macOS 27 — Golden Gate</div>
                <p className="mt-1 max-w-sm text-[12.5px] opacity-90">
                  Explore the apps that ship with this desktop. Every one is a self-registering module in src/apps/.
                </p>
              </div>
              <div className="ml-auto text-6xl font-black tracking-tighter opacity-30">27</div>
            </div>
          )}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
            {list.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl border border-black/8 p-3 dark:border-white/10">
                <AppIcon icon={a.icon} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{a.name}</div>
                  <div className="truncate text-[11.5px] text-black/45 dark:text-white/45">{a.category ?? 'App'}</div>
                </div>
                <button
                  onClick={() => open(a.id)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold text-white ${
                    running.has(a.id) ? 'bg-black/25 dark:bg-white/25' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {running.has(a.id) ? <><Check size={12} /> Open</> : <><Download size={12} /> Get</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default {
  id: 'appstore',
  name: 'App Store',
  icon: { from: '#32ADE6', to: '#0A5CFF', Icon: Store },
  component: AppStore,
  defaultSize: { w: 1060, h: 700 },
  minSize: { w: 720, h: 520 },
  category: 'Utilities',
  keywords: ['install', 'apps', 'get'],
  singleton: true,
} satisfies AppDefinition

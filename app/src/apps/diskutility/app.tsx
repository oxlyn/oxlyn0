import { useState } from 'react'
import { disksSeed } from './data'
import type { AppDefinition, AppWindowProps } from '@/system/types'
import { HardDrive } from 'lucide-react'

interface Disk { id: string; name: string; device: string; kind: string; parent: string | null; capacityGB: number; usedGB: number; role: string; color: string }
const seed = disksSeed as Disk[]
const gb = (n: number) => `${Math.round(n * 10) / 10} GB`

function DiskUtility({ payload }: AppWindowProps) {
  const [selectedId, setSelectedId] = useState<string>((payload?.diskId as string) ?? 'disk1s1')
  const [mounted, setMounted] = useState<Set<string>>(new Set(seed.filter((d) => d.kind === 'media').map((d) => d.id)))
  const [aid, setAid] = useState<{ running: boolean; log: string[] }>({ running: false, log: [] })
  const selected = seed.find((d) => d.id === selectedId) ?? seed[0]

  const runFirstAid = () => {
    setAid({ running: true, log: ['Running First Aid on "' + selected.name + '"…'] })
    const steps = [
      'Checking storage system…',
      'Verifying volume ' + selected.device + '…',
      'Checking the container superblock…',
      'Checking the object map…',
      'Checking the snapshot metadata tree…',
      'Verifying allocated space…',
    ]
    steps.forEach((s, i) =>
      setTimeout(() => {
        setAid((a) => ({ running: true, log: [...a.log, s] }))
        if (i === steps.length - 1)
          setTimeout(() => setAid((a) => ({ running: false, log: [...a.log, 'The volume ' + selected.device + ' appears to be OK.'] })), 600)
      }, 350 * (i + 1)),
    )
  }

  const byParent = (id: string) => seed.filter((d) => d.parent === id)

  const row = (d: Disk, depth = 0) => (
    <div key={d.id}>
      <button
        onClick={() => setSelectedId(d.id)}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[12.5px] ${
          selectedId === d.id ? 'bg-blue-500 text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'
        } ${d.kind === 'media' && !mounted.has(d.id) ? 'opacity-40' : ''}`}
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
        <span className="min-w-0 flex-1 truncate">{d.name}</span>
        {d.kind === 'media' && (
          <span
            onClick={(e) => { e.stopPropagation(); setMounted((m) => { const n = new Set(m); if (n.has(d.id)) n.delete(d.id); else n.add(d.id); return n }) }}
            className={`rounded px-1 text-[10px] ${selectedId === d.id ? 'text-white/80' : 'text-black/40 dark:text-white/40'}`}
          >
            {mounted.has(d.id) ? 'Eject' : 'Mount'}
          </span>
        )}
      </button>
      {byParent(d.id).map((c) => row(c, depth + 1))}
    </div>
  )

  const usedPct = Math.min(100, (selected.usedGB / selected.capacityGB) * 100)

  return (
    <div className="flex h-full text-[13px]">
      <div className="glass-thin w-56 shrink-0 border-r border-black/10 p-2 dark:border-white/10">
        <div className="px-2 pt-1 pb-1 text-[11px] font-semibold text-black/40 dark:text-white/40">Internal</div>
        {seed.filter((d) => !d.parent).map((d) => row(d))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-11 items-center justify-end gap-2 border-b border-black/10 px-3 dark:border-white/10">
          <button
            onClick={runFirstAid}
            disabled={aid.running}
            className="rounded-md border border-black/15 px-2.5 py-1 text-[12px] hover:bg-black/5 disabled:opacity-40 dark:border-white/20 dark:hover:bg-white/10"
          >
            First Aid
          </button>
          <button className="rounded-md border border-black/15 px-2.5 py-1 text-[12px] opacity-40 dark:border-white/20" disabled title="Requires a real Mac">
            Partition
          </button>
          <button className="rounded-md border border-black/15 px-2.5 py-1 text-[12px] opacity-40 dark:border-white/20" disabled title="Requires a real Mac">
            Erase
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ background: `linear-gradient(160deg, ${selected.color}, #1c1c1e)` }}>
              <HardDrive size={22} />
            </span>
            <div>
              <div className="text-[15px] font-bold">{selected.name}</div>
              <div className="text-[12px] text-black/45 dark:text-white/45">{selected.device} · {selected.role}</div>
            </div>
          </div>
          <div className="mt-5 h-5 w-full overflow-hidden rounded-md bg-black/10 dark:bg-white/10" title={`${Math.round(usedPct)}% used`}>
            <div className="h-full rounded-md transition-all" style={{ width: `${usedPct}%`, background: `linear-gradient(90deg, ${selected.color}aa, ${selected.color})` }} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {(
              [
                ['Capacity', gb(selected.capacityGB)],
                ['Used', gb(selected.usedGB)],
                ['Available', gb(selected.capacityGB - selected.usedGB)],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="rounded-lg bg-black/4 p-3 dark:bg-white/8">
                <div className="text-[15px] font-bold tabular-nums">{v}</div>
                <div className="text-[11px] text-black/45 dark:text-white/45">{k}</div>
              </div>
            ))}
          </div>
          {aid.log.length > 0 && (
            <div className="mt-4 rounded-lg bg-[#141416] p-3 font-mono text-[11.5px] leading-relaxed text-[#7ee787] select-text">
              {aid.log.map((l, i) => <div key={i}>{l}</div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default {
  id: 'diskutility',
  name: 'Disk Utility',
  icon: { from: '#636366', to: '#2C2C2E', Icon: HardDrive },
  component: DiskUtility,
  defaultSize: { w: 820, h: 560 },
  minSize: { w: 560, h: 400 },
  category: 'Utilities',
  keywords: ['disk', 'apfs', 'volume', 'erase'],
} satisfies AppDefinition

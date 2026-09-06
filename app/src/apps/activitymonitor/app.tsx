import { useEffect, useMemo, useRef, useState } from 'react'
import { appById } from '@/system/registry'
import { useWindows } from '@/system/stores/windows'
import type { AppDefinition } from '@/system/types'
import { Activity } from 'lucide-react'

const SYS_PROCS = ['WindowServer', 'kernel_task', 'Spotlight', 'mds_stores', 'bluetoothd']

function sparkline(data: number[], w: number, h: number, color: string) {
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 2) - 1}`).join(' ')
  return (
    <svg width={w} height={h} className="inline-block">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

function ActivityMonitor() {
  const wins = useWindows((s) => s.wins)
  const [tab, setTab] = useState<'CPU' | 'Memory' | 'Energy' | 'Disk' | 'Network'>('CPU')
  const [cpu, setCpu] = useState<number[]>(() => Array.from({ length: 60 }, () => 8 + Math.random() * 10))
  const [mem, setMem] = useState<number[]>(() => Array.from({ length: 60 }, () => 62 + Math.random() * 6))
  const seedRef = useRef(Math.random())

  useEffect(() => {
    const t = setInterval(() => {
      setCpu((c) => [...c.slice(1), Math.max(3, Math.min(95, c[c.length - 1] + (Math.random() - 0.5) * 14 + (wins.length ? 6 : 0)))])
      setMem((m) => [...m.slice(1), Math.max(40, Math.min(92, m[m.length - 1] + (Math.random() - 0.5) * 3))])
    }, 1000)
    return () => clearInterval(t)
  }, [wins.length])

  const jitter = useMemo(() => Array.from({ length: 40 }, () => seedRef.current++), [wins.length])

  const rows = useMemo(() => {
    const appRows = wins.map((w, i) => ({
      name: appById.get(w.appId)?.name ?? w.appId,
      cpu: Math.max(0.1, ((jitter[i * 3 % jitter.length] * 7) % 9) + (w.id === useWindows.getState().focusedId ? 4.2 : 0.4)),
      mem: 80 + ((i * 137) % 420),
      threads: 4 + ((i * 7) % 12),
      pid: 1200 + i * 37,
    }))
    const sysRows = SYS_PROCS.map((name, i) => ({
      name,
      cpu: ((jitter[(i + 5) % jitter.length] * 11) % 6) + 0.3,
      mem: 120 + ((i * 311) % 900),
      threads: 8 + i * 5,
      pid: 300 + i * 17,
    }))
    return [...appRows, ...sysRows].sort((a, b) => b.cpu - a.cpu)
  }, [wins, jitter])

  const cpuNow = cpu[cpu.length - 1]
  const memNow = mem[mem.length - 1]

  return (
    <div className="flex h-full flex-col bg-[#1c1c1e] text-[12.5px] text-white">
      <div className="grid shrink-0 grid-cols-4 gap-3 p-3">
        {(
          [
            ['CPU', `${cpuNow.toFixed(1)}%`, cpu, '#30D158'],
            ['Memory', `${memNow.toFixed(0)}%`, mem, '#0A84FF'],
            ['Energy', `${(cpuNow * 0.6).toFixed(1)}`, cpu.map((c) => c * 0.6), '#FFD60A'],
            ['Disk', `${(memNow / 10).toFixed(1)} MB/s`, mem.map((m) => m / 4), '#BF5AF2'],
          ] as const
        ).map(([label, value, data, color]) => (
          <div key={label} className="rounded-xl bg-white/6 p-3">
            <div className="text-[11px] text-white/50">{label}</div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold tabular-nums">{value}</span>
              {sparkline([...data].slice(-30), 70, 26, color)}
            </div>
          </div>
        ))}
      </div>
      <div className="flex shrink-0 gap-1 px-3">
        {(['CPU', 'Memory', 'Energy', 'Disk', 'Network'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-2.5 py-1 ${tab === t ? 'bg-white/15 font-semibold' : 'text-white/60 hover:bg-white/8'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        <table className="w-full">
          <thead className="sticky top-0 bg-[#1c1c1e] text-left text-[11px] text-white/40">
            <tr>
              <th className="py-1.5 font-medium">Process Name</th>
              <th className="py-1.5 font-medium">% CPU</th>
              <th className="py-1.5 font-medium">Memory</th>
              <th className="py-1.5 font-medium">Threads</th>
              <th className="py-1.5 font-medium">PID</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.pid + r.name} className="border-t border-white/6">
                <td className="py-1">{r.name}</td>
                <td className="py-1 tabular-nums text-emerald-400">{r.cpu.toFixed(1)}</td>
                <td className="py-1 tabular-nums text-sky-400">{r.mem} MB</td>
                <td className="py-1 tabular-nums opacity-70">{r.threads}</td>
                <td className="py-1 tabular-nums opacity-70">{r.pid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="shrink-0 border-t border-white/10 px-3 py-1.5 text-[11px] text-white/40">
        {rows.length} processes · System OK · uptime {Math.floor(performance.now() / 60000)} min
      </div>
    </div>
  )
}

export default {
  id: 'activitymonitor',
  name: 'Activity Monitor',
  icon: { from: '#1C1C1E', to: '#000000', Icon: Activity, glyphColor: '#30D158' },
  component: ActivityMonitor,
  defaultSize: { w: 860, h: 600 },
  minSize: { w: 560, h: 420 },
  category: 'Utilities',
  keywords: ['cpu', 'memory', 'processes', 'performance'],
} satisfies AppDefinition

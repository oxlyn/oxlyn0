import { useEffect, useMemo, useRef, useState } from 'react'
import type { AppDefinition } from '@/system/types'
import { Bomb } from 'lucide-react'

/**
 * 扫雷 — 原生实现。三档难度，首点保证安全（落雷避开首点及其邻域），
 * 左键翻开 / 右键插旗，翻开所有非雷格即胜；每档难度记录本地最短用时。
 */
const LEVELS = {
  easy: { label: '初级', rows: 9, cols: 9, mines: 10 },
  mid: { label: '中级', rows: 16, cols: 16, mines: 40 },
  hard: { label: '高级', rows: 16, cols: 30, mines: 99 },
} as const
type LevelKey = keyof typeof LEVELS

interface Cell { mine: boolean; open: boolean; flag: boolean; adj: number }
const NUM_COLORS = ['', '#2563eb', '#15803d', '#dc2626', '#6d28d9', '#b45309', '#0e7490', '#111827', '#6b7280']

function blank(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ mine: false, open: false, flag: false, adj: 0 })))
}
function neighbors(r: number, c: number, rows: number, cols: number): [number, number][] {
  const out: [number, number][] = []
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    if (!dr && !dc) continue
    const [nr, nc] = [r + dr, c + dc]
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.push([nr, nc])
  }
  return out
}

export default function Minesweeper() {
  const [level, setLevel] = useState<LevelKey>('easy')
  const { rows, cols, mines } = LEVELS[level]
  const [cells, setCells] = useState<Cell[][]>(() => blank(rows, cols))
  const [phase, setPhase] = useState<'ready' | 'playing' | 'won' | 'lost'>('ready')
  const [time, setTime] = useState(0)
  const bestKey = `oxlyn-mines-best-${level}`
  const [best, setBest] = useState(() => Number(localStorage.getItem(bestKey) ?? 0) || null)
  const bestRef = useRef(best)
  bestRef.current = best

  const reset = (lv: LevelKey = level) => {
    const l = LEVELS[lv]
    setCells(blank(l.rows, l.cols))
    setPhase('ready')
    setTime(0)
    setBest(Number(localStorage.getItem(`oxlyn-mines-best-${lv}`) ?? 0) || null)
  }

  useEffect(() => {
    if (phase !== 'playing') return
    const t = setInterval(() => setTime((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [phase])

  const flags = useMemo(() => cells.flat().filter((c) => c.flag).length, [cells])

  const plant = (grid: Cell[][], sr: number, sc: number) => {
    let placed = 0
    const safe = new Set([`${sr},${sc}`, ...neighbors(sr, sc, rows, cols).map(([r, c]) => `${r},${c}`)])
    while (placed < mines) {
      const r = Math.floor(Math.random() * rows), c = Math.floor(Math.random() * cols)
      if (grid[r][c].mine || safe.has(`${r},${c}`)) continue
      grid[r][c].mine = true
      placed++
    }
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
      grid[r][c].adj = neighbors(r, c, rows, cols).filter(([nr, nc]) => grid[nr][nc].mine).length
  }

  const openCell = (sr: number, sc: number) => {
    if (phase === 'won' || phase === 'lost') return
    const grid = cells.map((row) => row.map((c) => ({ ...c })))
    if (phase === 'ready') { plant(grid, sr, sc); setPhase('playing') }
    if (grid[sr][sc].flag || grid[sr][sc].open) return
    if (grid[sr][sc].mine) {
      grid.forEach((row) => row.forEach((c) => { if (c.mine) c.open = true }))
      setCells(grid); setPhase('lost')
      return
    }
    const queue: [number, number][] = [[sr, sc]]
    while (queue.length) {
      const [r, c] = queue.pop()!
      const cell = grid[r][c]
      if (cell.open || cell.flag) continue
      cell.open = true
      if (cell.adj === 0) for (const [nr, nc] of neighbors(r, c, rows, cols)) if (!grid[nr][nc].open) queue.push([nr, nc])
    }
    const left = grid.flat().filter((c) => !c.open && !c.mine).length
    if (left === 0) {
      grid.forEach((row) => row.forEach((c) => { if (c.mine) c.flag = true }))
      setPhase('won')
      const t = time
      if (!bestRef.current || t < bestRef.current) {
        localStorage.setItem(bestKey, String(t))
        setBest(t)
      }
    }
    setCells(grid)
  }

  const toggleFlag = (r: number, c: number) => {
    if (phase === 'won' || phase === 'lost') return
    setCells(cells.map((row, ri) => row.map((cell, ci) => (ri === r && ci === c && !cell.open ? { ...cell, flag: !cell.flag } : cell))))
  }

  return (
    <div className="flex h-full flex-col items-center gap-3 overflow-auto bg-gradient-to-b from-slate-100 to-white p-4 dark:from-[#1c1f26] dark:to-[#14161a]">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {(Object.keys(LEVELS) as LevelKey[]).map((k) => (
            <button key={k} onClick={() => { setLevel(k); reset(k) }}
              className={`rounded-md px-2.5 py-1 text-[12px] font-medium ${level === k ? 'bg-slate-700 text-white' : 'bg-black/8 text-black/60 hover:bg-black/15 dark:bg-white/10 dark:text-white/60'}`}>
              {LEVELS[k].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[12.5px] tabular-nums text-black/60 dark:text-white/60">
          <span>🚩 {mines - flags}</span>
          <span>⏱ {time}s</span>
          {best != null && <span>最快 {best}s</span>}
          <button onClick={() => reset()} className="rounded-md bg-black/8 px-2.5 py-1 font-medium hover:bg-black/15 dark:bg-white/10 dark:hover:bg-white/20">
            重开
          </button>
        </div>
      </div>
      <div className="relative">
        <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${cols}, 24px)` }}>
          {cells.map((row, r) => row.map((cell, c) => (
            <button
              key={`${r},${c}`}
              onClick={() => openCell(r, c)}
              onContextMenu={(e) => { e.preventDefault(); toggleFlag(r, c) }}
              className={`flex h-6 w-6 items-center justify-center text-[12px] font-bold tabular-nums ${
                cell.open
                  ? cell.mine ? 'bg-red-500 text-white' : 'bg-black/6 dark:bg-white/12'
                  : 'bg-slate-300 shadow-[inset_0_-2px_0_rgba(0,0,0,0.15),inset_0_2px_0_rgba(255,255,255,0.5)] hover:bg-slate-200 dark:bg-slate-600'
              }`}
              style={{ color: cell.open && !cell.mine && cell.adj ? NUM_COLORS[cell.adj] : undefined }}
            >
              {cell.open ? (cell.mine ? '💥' : cell.adj || '') : cell.flag ? '🚩' : ''}
            </button>
          )))}
        </div>
        {(phase === 'won' || phase === 'lost') && (
          <div className="absolute inset-0 -m-2 flex flex-col items-center justify-center gap-2 rounded-lg bg-black/55 text-white backdrop-blur-[2px]">
            <div className="text-xl font-bold">{phase === 'won' ? '扫雷成功！' : '踩雷了'}</div>
            <div className="text-[13px]">{phase === 'won' ? `用时 ${time}s` : '再接再厉'}</div>
            <button onClick={() => reset()} className="mt-1 rounded-md bg-white/90 px-4 py-1.5 text-[13px] font-semibold text-black hover:bg-white">
              再来一局
            </button>
          </div>
        )}
      </div>
      <div className="text-[11.5px] text-black/40 dark:text-white/40">左键翻开 · 右键插旗 · 首点必安全</div>
    </div>
  )
}

export default {
  id: 'minesweeper',
  name: '扫雷',
  icon: { from: '#8E8E93', to: '#48484A', Icon: Bomb },
  component: Minesweeper,
  defaultSize: { w: 620, h: 680 },
  minSize: { w: 420, h: 520 },
  category: 'Entertainment',
  keywords: ['minesweeper', '扫雷', 'puzzle', '经典'],
} satisfies AppDefinition

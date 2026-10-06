import { useEffect, useRef, useState } from 'react'
import { useWindows } from '@/system/stores/windows'
import type { AppDefinition, AppWindowProps } from '@/system/types'
import { LayoutGrid } from 'lucide-react'

/**
 * 2048 — 原生实现（4×4 网格、方向键滑动合并、localStorage 最高分）。
 * 替代合集里 play2048.co 的降级卡片：官方站 CSP 拒嵌，原生版窗口内即玩。
 * 键盘事件只在窗口持焦时生效，避免方向键滚动桌面其他内容。
 */
const N = 4
type Grid = number[][]

const TILE_COLORS: Record<number, [string, string]> = {
  2: ['#eee4da', '#776e65'], 4: ['#ede0c8', '#776e65'], 8: ['#f2b179', '#f9f6f2'],
  16: ['#f59563', '#f9f6f2'], 32: ['#f67c5f', '#f9f6f2'], 64: ['#f65e3b', '#f9f6f2'],
  128: ['#edcf72', '#f9f6f2'], 256: ['#edcc61', '#f9f6f2'], 512: ['#edc850', '#f9f6f2'],
  1024: ['#edc53f', '#f9f6f2'], 2048: ['#edc22e', '#f9f6f2'],
}

function emptyGrid(): Grid {
  return Array.from({ length: N }, () => Array<number>(N).fill(0))
}
function spawn(g: Grid): Grid {
  const empties: [number, number][] = []
  g.forEach((row, r) => row.forEach((v, c) => { if (!v) empties.push([r, c]) }))
  if (!empties.length) return g
  const [r, c] = empties[Math.floor(Math.random() * empties.length)]
  const ng = g.map((row) => [...row])
  ng[r][c] = Math.random() < 0.9 ? 2 : 4
  return ng
}
function newGame(): Grid {
  return spawn(spawn(emptyGrid()))
}
function slideLine(line: number[]): [number[], number] {
  const vals = line.filter(Boolean)
  const out: number[] = []
  let gained = 0
  for (let i = 0; i < vals.length; i++) {
    if (vals[i] === vals[i + 1]) { out.push(vals[i] * 2); gained += vals[i] * 2; i++ }
    else out.push(vals[i])
  }
  while (out.length < N) out.push(0)
  return [out, gained]
}
function move(g: Grid, dir: 'left' | 'right' | 'up' | 'down'): { grid: Grid; gained: number; moved: boolean } {
  const ng = emptyGrid()
  let gained = 0
  for (let i = 0; i < N; i++) {
    const extract = (): number[] => {
      if (dir === 'left') return g[i]
      if (dir === 'right') return [...g[i]].reverse()
      if (dir === 'up') return g.map((row) => row[i])
      return g.map((row) => row[i]).reverse()
    }
    const writeBack = (line: number[]) => {
      const l = dir === 'right' || dir === 'down' ? [...line].reverse() : line
      if (dir === 'left' || dir === 'right') ng[i] = l
      else l.forEach((v, r) => { ng[r][i] = v })
    }
    const [line, gain] = slideLine(extract())
    gained += gain
    writeBack(line)
  }
  const moved = JSON.stringify(ng) !== JSON.stringify(g)
  return { grid: ng, gained, moved }
}
function stuck(g: Grid): boolean {
  return (['left', 'right', 'up', 'down'] as const).every((d) => !move(g, d).moved)
}

function Game2048({ winId }: AppWindowProps) {
  const [grid, setGrid] = useState<Grid>(newGame)
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)
  const [won, setWon] = useState(false)
  const [best, setBest] = useState(() => Number(localStorage.getItem('oxlyn-2048-best') ?? 0))
  const wonRef = useRef(false)

  useEffect(() => {
    if (score > best) {
      setBest(score)
      localStorage.setItem('oxlyn-2048-best', String(score))
    }
  }, [score, best])

  const restart = () => { setGrid(newGame()); setScore(0); setOver(false); wonRef.current = false; setWon(false) }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (useWindows.getState().focusedId !== winId) return
      const map: Record<string, 'left' | 'right' | 'up' | 'down'> = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
      }
      const dir = map[e.key]
      if (!dir) return
      e.preventDefault()
      setGrid((g) => {
        const { grid: ng, gained, moved } = move(g, dir)
        if (!moved) return g
        setScore((s) => s + gained)
        if (ng.flat().includes(2048) && !wonRef.current) { wonRef.current = true; setWon(true) }
        const withSpawn = spawn(ng)
        if (stuck(withSpawn)) setOver(true)
        return withSpawn
      })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [winId])

  return (
    <div className="flex h-full flex-col items-center gap-3 overflow-y-auto bg-[#faf8ef] p-5 dark:bg-[#2a2620]">
      <div className="flex w-full max-w-[420px] items-center justify-between">
        <div className="text-lg font-bold text-[#776e65] dark:text-[#e8dfd0]">2048</div>
        <div className="flex items-center gap-2 text-center">
          <div className="rounded-md bg-[#bbada0] px-3 py-1 text-white">
            <div className="text-[10px] uppercase">Score</div>
            <div className="text-base font-bold">{score}</div>
          </div>
          <div className="rounded-md bg-[#bbada0] px-3 py-1 text-white">
            <div className="text-[10px] uppercase">Best</div>
            <div className="text-base font-bold">{best}</div>
          </div>
          <button onClick={restart} className="rounded-md bg-[#8f7a66] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#7d6a58]">
            新局
          </button>
        </div>
      </div>
      <div className="relative rounded-lg bg-[#bbada0] p-2">
        <div className="grid grid-cols-4 gap-2">
          {grid.flat().map((v, i) => (
            <div
              key={i}
              className="flex h-[92px] w-[92px] items-center justify-center rounded-md text-3xl font-bold tabular-nums"
              style={v ? { background: TILE_COLORS[v]?.[0] ?? '#3c3a32', color: TILE_COLORS[v]?.[1] ?? '#f9f6f2' } : { background: 'rgba(238,228,218,0.35)' }}
            >
              {v || ''}
            </div>
          ))}
        </div>
        {(over || won) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-[#faf8ef]/80 text-[#776e65]">
            <div className="text-2xl font-bold">{won ? '达成 2048！' : '游戏结束'}</div>
            <div className="text-[13px]">Score {score}</div>
            <button onClick={restart} className="mt-1 rounded-md bg-[#8f7a66] px-4 py-1.5 text-[13px] font-semibold text-white hover:bg-[#7d6a58]">
              再来一局
            </button>
          </div>
        )}
      </div>
      <div className="text-[11.5px] text-black/40 dark:text-white/40">方向键滑动合并 · 合出 2048</div>
    </div>
  )
}

export default {
  id: '2048',
  name: '2048',
  icon: { from: '#FFD60A', to: '#FF9F0A', Icon: LayoutGrid },
  component: Game2048,
  defaultSize: { w: 500, h: 660 },
  minSize: { w: 440, h: 560 },
  category: 'Entertainment',
  keywords: ['2048', 'merge', '数字合并', '滑动'],
} satisfies AppDefinition

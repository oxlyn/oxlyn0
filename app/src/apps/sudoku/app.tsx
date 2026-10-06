import { useEffect, useRef, useState } from 'react'
import type { AppDefinition } from '@/system/types'
import { Hash } from 'lucide-react'

/**
 * 数独 — 原生实现。随机回溯生成终局，再按唯一解约束挖洞（不同难度对应
 * 不同提示数）；同区冲突高亮，数字键盘/键盘输入，每档难度记录最快用时。
 */
const LEVELS = { easy: 40, mid: 32, hard: 26 } as const
type LevelKey = keyof typeof LEVELS
type Grid = number[][]

const zeros = (): Grid => Array.from({ length: 9 }, () => Array<number>(9).fill(0))
const clone = (g: Grid): Grid => g.map((r) => [...r])
const boxOf = (r: number, c: number): [number, number] => [Math.floor(r / 3) * 3, Math.floor(c / 3) * 3]

function ok(g: Grid, r: number, c: number, v: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (i !== c && g[r][i] === v) return false
    if (i !== r && g[i][c] === v) return false
  }
  const [br, bc] = boxOf(r, c)
  for (let i = br; i < br + 3; i++) for (let j = bc; j < bc + 3; j++)
    if ((i !== r || j !== c) && g[i][j] === v) return false
  return true
}
function fill(g: Grid): boolean {
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
    if (g[r][c]) continue
    const vals = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5)
    for (const v of vals) {
      if (!ok(g, r, c, v)) continue
      g[r][c] = v
      if (fill(g)) return true
      g[r][c] = 0
    }
    return false
  }
  return true
}
function countSolutions(g: Grid, limit = 2): number {
  let count = 0
  const walk = (): void => {
    if (count >= limit) return
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
      if (g[r][c]) continue
      for (let v = 1; v <= 9; v++) {
        if (!ok(g, r, c, v)) continue
        g[r][c] = v
        walk()
        g[r][c] = 0
        if (count >= limit) return
      }
      return
    }
    count++
  }
  walk()
  return count
}
function generate(clues: number): Grid {
  const solution = zeros()
  fill(solution)
  const puzzle = clone(solution)
  const cells: [number, number][] = []
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) cells.push([r, c])
  cells.sort(() => Math.random() - 0.5)
  let removed = 0
  const target = 81 - clues
  for (const [r, c] of cells) {
    if (removed >= target) break
    const backup = puzzle[r][c]
    puzzle[r][c] = 0
    if (countSolutions(clone(puzzle)) === 1) removed++
    else puzzle[r][c] = backup
  }
  return puzzle
}

function Sudoku() {
  const [level, setLevel] = useState<LevelKey>('easy')
  const [given, setGiven] = useState<Grid>(() => generate(LEVELS.easy))
  const [board, setBoard] = useState<Grid>(() => clone(given))
  const [sel, setSel] = useState<[number, number] | null>(null)
  const [time, setTime] = useState(0)
  const [done, setDone] = useState(false)
  const bestKey = `oxlyn-sudoku-best-${level}`
  const [best, setBest] = useState(() => Number(localStorage.getItem(bestKey) ?? 0) || null)
  const timer = useRef<number | undefined>(undefined)

  const started = board.some((row) => row.some((v, i) => v && v !== given[Math.floor(i / 9)][i % 9]))
  useEffect(() => {
    if (!started || done) return
    timer.current = window.setInterval(() => setTime((s) => s + 1), 1000)
    return () => clearInterval(timer.current)
  }, [started, done])

  const newGame = (lv: LevelKey = level) => {
    const p = generate(LEVELS[lv])
    setGiven(p); setBoard(clone(p)); setSel(null); setTime(0); setDone(false)
    setBest(Number(localStorage.getItem(`oxlyn-sudoku-best-${lv}`) ?? 0) || null)
  }

  const setCell = (v: number) => {
    if (!sel || done) return
    const [r, c] = sel
    if (given[r][c]) return
    const nb = clone(board)
    nb[r][c] = v
    setBoard(nb)
    if (nb.flat().every((x) => x > 0) && nb.every((row, r) => row.every((_, c) => ok(nb, r, c, nb[r][c])))) {
      setDone(true)
      if (!best || time < best) { localStorage.setItem(bestKey, String(time)); setBest(time) }
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!sel) return
      if (/^[1-9]$/.test(e.key)) setCell(Number(e.key))
      if (e.key === 'Backspace' || e.key === '0') setCell(0)
      if (e.key === 'Escape') setSel(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const conflict = (r: number, c: number): boolean => {
    const v = board[r][c]
    return v > 0 && !ok(board, r, c, v)
  }

  return (
    <div className="flex h-full flex-col items-center gap-3 overflow-auto bg-gradient-to-b from-sky-50 to-white p-4 dark:from-[#101c26] dark:to-[#12161a]">
      <div className="flex w-full max-w-[480px] flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {(Object.keys(LEVELS) as LevelKey[]).map((k) => (
            <button key={k} onClick={() => { setLevel(k); newGame(k) }}
              className={`rounded-md px-2.5 py-1 text-[12px] font-medium ${level === k ? 'bg-sky-700 text-white' : 'bg-black/8 text-black/60 hover:bg-black/15 dark:bg-white/10 dark:text-white/60'}`}>
              {{ easy: '简单', mid: '中等', hard: '困难' }[k]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[12.5px] tabular-nums text-black/60 dark:text-white/60">
          <span>⏱ {time}s</span>
          {best != null && <span>最快 {best}s</span>}
          <button onClick={() => newGame()} className="rounded-md bg-black/8 px-2.5 py-1 font-medium hover:bg-black/15 dark:bg-white/10 dark:hover:bg-white/20">新局</button>
        </div>
      </div>
      <div className="relative">
        <div className="grid grid-cols-9 overflow-hidden rounded-lg bg-sky-900/20 p-[2px]">
          {board.map((row, r) => row.map((v, c) => {
            const fixed = given[r][c] > 0
            const thickR = c % 3 === 2 && c !== 8 ? 'border-r-2 border-r-sky-900/50' : 'border-r border-r-black/10 dark:border-r-white/10'
            const thickB = r % 3 === 2 && r !== 8 ? 'border-b-2 border-b-sky-900/50' : 'border-b border-b-black/10 dark:border-b-white/10'
            return (
              <button
                key={`${r},${c}`}
                onClick={() => setSel([r, c])}
                className={`flex h-[44px] w-[44px] items-center justify-center border-l border-t border-l-black/10 border-t-black/10 text-lg font-semibold tabular-nums dark:border-l-white/10 dark:border-t-white/10 ${thickR} ${thickB} ${
                  conflict(r, c) ? 'bg-red-200 text-red-600 dark:bg-red-900/40' : sel && sel[0] === r && sel[1] === c ? 'bg-sky-200 dark:bg-sky-800/60' : 'bg-white dark:bg-[#1e2530]'
                } ${fixed ? 'text-black/80 dark:text-white/85' : 'text-sky-700 dark:text-sky-300'}`}
              >
                {v || ''}
              </button>
            )
          }))}
        </div>
        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-black/55 text-white backdrop-blur-[2px]">
            <div className="text-2xl font-bold">完成！</div>
            <div className="text-[13px]">用时 {time}s{best === time ? ' · 新纪录' : ''}</div>
            <button onClick={() => newGame()} className="mt-1 rounded-md bg-white/90 px-4 py-1.5 text-[13px] font-semibold text-black hover:bg-white">再来一局</button>
          </div>
        )}
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((v) => (
          <button key={v} onClick={() => setCell(v)}
            className="h-9 w-9 rounded-md bg-black/8 text-[14px] font-bold text-black/70 hover:bg-black/15 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20">
            {v || '×'}
          </button>
        ))}
      </div>
      <div className="text-[11.5px] text-black/40 dark:text-white/40">点选格子后用数字键盘或键盘填入</div>
    </div>
  )
}

export default {
  id: 'sudoku',
  name: '数独',
  icon: { from: '#64D2FF', to: '#1E5FD6', Icon: Hash },
  component: Sudoku,
  defaultSize: { w: 560, h: 780 },
  minSize: { w: 480, h: 660 },
  category: 'Entertainment',
  keywords: ['sudoku', '数独', 'puzzle', 'logic'],
} satisfies AppDefinition

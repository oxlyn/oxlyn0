import { useEffect, useState } from 'react'
import type { AppDefinition } from '@/system/types'
import { Contrast } from 'lucide-react'

/**
 * 黑白棋（Reversi）— 8×8 标准规则。人执黑、AI 执白（角/边位置加权 + 翻转
 * 数的贪心策略）；无子可下自动过手，双方均无棋可走时按子数判胜负。
 */
type Cell = 0 | 1 | 2
type Board = Cell[][]
const N = 8
const DIRS: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]

const WEIGHTS = [
  [100, -20, 10, 5, 5, 10, -20, 100],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [10, -2, 3, 1, 1, 3, -2, 10],
  [5, -2, 1, 1, 1, 1, -2, 5],
  [5, -2, 1, 1, 1, 1, -2, 5],
  [10, -2, 3, 1, 1, 3, -2, 10],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [100, -20, 10, 5, 5, 10, -20, 100],
]

function initial(): Board {
  const b: Board = Array.from({ length: N }, () => Array<Cell>(N).fill(0))
  b[3][3] = 2; b[3][4] = 1; b[4][3] = 1; b[4][4] = 2
  return b
}
function flipsFor(b: Board, r: number, c: number, p: Cell): [number, number][] {
  if (b[r][c]) return []
  const opp = (3 - p) as Cell
  const out: [number, number][] = []
  for (const [dr, dc] of DIRS) {
    const line: [number, number][] = []
    let nr = r + dr, nc = c + dc
    while (nr >= 0 && nr < N && nc >= 0 && nc < N && b[nr][nc] === opp) {
      line.push([nr, nc]); nr += dr; nc += dc
    }
    if (line.length && nr >= 0 && nr < N && nc >= 0 && nc < N && b[nr][nc] === p) out.push(...line)
  }
  return out
}
function legalMoves(b: Board, p: Cell): [number, number][] {
  const out: [number, number][] = []
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (flipsFor(b, r, c, p).length) out.push([r, c])
  return out
}
function apply(b: Board, r: number, c: number, p: Cell): Board {
  const nb = b.map((row) => [...row]) as Board
  for (const [fr, fc] of flipsFor(nb, r, c, p)) nb[fr][fc] = p
  nb[r][c] = p
  return nb
}
function pick(b: Board, p: Cell): [number, number] {
  let best = legalMoves(b, p)[0], bestScore = -Infinity
  for (const [r, c] of legalMoves(b, p)) {
    const s = WEIGHTS[r][c] + flipsFor(b, r, c, p).length * 2
    if (s > bestScore) { bestScore = s; best = [r, c] }
  }
  return best
}
function counts(b: Board): [number, number] {
  let black = 0, white = 0
  b.forEach((row) => row.forEach((v) => { if (v === 1) black++; if (v === 2) white++ }))
  return [black, white]
}

function Reversi() {
  const [board, setBoard] = useState<Board>(initial)
  const [turn, setTurn] = useState<Cell>(1)
  const [over, setOver] = useState<string | null>(null)
  const [pass, setPass] = useState('')
  const [last, setLast] = useState<[number, number] | null>(null)

  const doMove = (r: number, c: number, p: Cell) => {
    const nb = apply(board, r, c, p)
    setBoard(nb)
    setLast([r, c])
    setPass('')
    const opp = (3 - p) as Cell
    if (legalMoves(nb, opp).length) { setTurn(opp); return }
    if (legalMoves(nb, p).length) { setPass(`${opp === 1 ? '黑' : '白'}方无棋可走，${p === 1 ? '黑' : '白'}方继续`); setTurn(p); return }
    const [black, white] = counts(nb)
    setOver(black === white ? '平局' : black > white ? '⚫ 黑胜' : '⚪ 白胜')
  }

  useEffect(() => {
    if (over || turn !== 2) return
    if (!legalMoves(board, 2).length) return
    const t = setTimeout(() => {
      const [r, c] = pick(board, 2)
      doMove(r, c, 2)
    }, 400)
    return () => clearTimeout(t)
  }) // 每次渲染后检查 AI 回合（board/turn 变化都会触发）

  const hints = over ? [] : legalMoves(board, turn)
  const [black, white] = counts(board)

  return (
    <div className="flex h-full flex-col items-center gap-3 overflow-auto bg-gradient-to-b from-violet-50 to-white p-4 dark:from-[#1a1226] dark:to-[#14121a]">
      <div className="flex w-full max-w-[520px] flex-wrap items-center justify-between gap-2 text-[12.5px] text-black/60 dark:text-white/60">
        <div className="flex items-center gap-3">
          <span>⚫ {black}</span>
          <span>⚪ {white}</span>
          <span>{over ? over : turn === 1 ? '轮到你（黑）' : 'AI 思考中…'}</span>
        </div>
        <div className="flex items-center gap-2">
          {pass && <span className="text-amber-600 dark:text-amber-400">{pass}</span>}
          <button onClick={() => { setBoard(initial()); setTurn(1); setOver(null); setPass(''); setLast(null) }}
            className="rounded-md bg-black/8 px-2.5 py-1 font-medium hover:bg-black/15 dark:bg-white/10 dark:hover:bg-white/20">重开</button>
        </div>
      </div>
      <div className="relative rounded-xl bg-emerald-800/85 p-2 shadow-inner">
        <div className="grid grid-cols-8 gap-[2px]">
          {board.map((row, r) => row.map((v, c) => {
            const hint = hints.some(([hr, hc]) => hr === r && hc === c)
            return (
              <button
                key={`${r},${c}`}
                onClick={() => { if (!over && turn === 1 && hint) doMove(r, c, 1) }}
                className={`flex h-[44px] w-[44px] items-center justify-center rounded-[3px] bg-emerald-600/90 hover:bg-emerald-500/90 ${last && last[0] === r && last[1] === c ? 'ring-2 ring-amber-300' : ''}`}
              >
                {v ? (
                  <span className={`h-[32px] w-[32px] rounded-full shadow ${v === 1 ? 'bg-gradient-to-br from-neutral-700 to-black' : 'bg-gradient-to-br from-white to-neutral-300'}`} />
                ) : hint ? (
                  <span className="h-3 w-3 rounded-full bg-emerald-200/80" />
                ) : null}
              </button>
            )
          }))}
        </div>
      </div>
      <div className="text-[11.5px] text-black/40 dark:text-white/40">夹住对方棋子即翻转 · 绿点为可落子处</div>
    </div>
  )
}

export default {
  id: 'reversi',
  name: '黑白棋',
  icon: { from: '#BF5AF2', to: '#5E2FB8', Icon: Contrast },
  component: Reversi,
  defaultSize: { w: 560, h: 700 },
  minSize: { w: 480, h: 620 },
  category: 'Entertainment',
  keywords: ['reversi', 'othello', '黑白棋', '翻转', '棋类'],
} satisfies AppDefinition

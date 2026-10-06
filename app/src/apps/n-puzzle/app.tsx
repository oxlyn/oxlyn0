import { useEffect, useState } from 'react'
import { useWindows } from '@/system/stores/windows'
import type { AppDefinition, AppWindowProps } from '@/system/types'
import { Puzzle } from 'lucide-react'

/**
 * 数字华容道（15-puzzle）— 原生实现。打乱方式是从终局随机走合法步，
 * 天然保证有解；方向键或点击滑块移动，计步并记录本地最少步数。
 * 键盘事件只在窗口持焦时生效。
 */
const N = 4
type Board = number[][]

function solved(): Board {
  return Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r === N - 1 && c === N - 1 ? 0 : r * N + c + 1)))
}
function findZero(b: Board): [number, number] {
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (b[r][c] === 0) return [r, c]
  return [N - 1, N - 1]
}
function isSolved(b: Board): boolean {
  return b.flat().every((v, i) => (i === N * N - 1 ? v === 0 : v === i + 1))
}
/** 从终局随机走合法步打乱 —— 必然可解 */
function shuffle(): Board {
  const b = solved()
  let [zr, zc] = [N - 1, N - 1]
  let last = ''
  for (let i = 0; i < 200; i++) {
    const cand: [number, number, string][] = [
      [zr - 1, zc, 'up'], [zr + 1, zc, 'down'], [zr, zc - 1, 'left'], [zr, zc + 1, 'right'],
    ]
    const moves = cand.filter(([r, c, d]) => r >= 0 && r < N && c >= 0 && c < N && d !== last)
    const [r, c, d] = moves[Math.floor(Math.random() * moves.length)]
    b[zr][zc] = b[r][c]
    b[r][c] = 0
    ;[zr, zc] = [r, c]
    last = d === 'up' ? 'down' : d === 'down' ? 'up' : d === 'left' ? 'right' : 'left'
  }
  return b
}
/** 方向键语义：滑块朝该方向滑入空位 */
const DELTA: Record<string, [number, number]> = {
  ArrowUp: [1, 0], ArrowDown: [-1, 0], ArrowLeft: [0, 1], ArrowRight: [0, -1],
}

function NPuzzle({ winId }: AppWindowProps) {
  const [board, setBoard] = useState<Board>(shuffle)
  const [moves, setMoves] = useState(0)
  const [done, setDone] = useState(false)
  const [best, setBest] = useState(() => Number(localStorage.getItem('oxlyn-npuzzle-best') ?? 0) || null)

  const slide = (r: number, c: number) => {
    if (done) return
    const [zr, zc] = findZero(board)
    if (Math.abs(zr - r) + Math.abs(zc - c) !== 1) return
    const nb = board.map((row) => [...row])
    nb[zr][zc] = nb[r][c]
    nb[r][c] = 0
    setBoard(nb)
    const count = moves + 1
    setMoves(count)
    if (isSolved(nb)) {
      setDone(true)
      if (!best || count < best) {
        localStorage.setItem('oxlyn-npuzzle-best', String(count))
        setBest(count)
      }
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (useWindows.getState().focusedId !== winId) return
      const d = DELTA[e.key]
      if (!d) return
      e.preventDefault()
      const [zr, zc] = findZero(board)
      slide(zr + d[0], zc + d[1])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const restart = () => { setBoard(shuffle()); setMoves(0); setDone(false) }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-teal-50 to-white p-5 dark:from-[#0f2124] dark:to-[#121618]">
      <div className="flex w-full max-w-[400px] items-center justify-between text-[12.5px] text-black/60 dark:text-white/60">
        <span>步数 <b className="tabular-nums">{moves}</b></span>
        {best != null && <span>最少 <b className="tabular-nums">{best}</b> 步</span>}
        <button onClick={restart} className="rounded-md bg-black/8 px-2.5 py-1 font-medium hover:bg-black/15 dark:bg-white/10 dark:hover:bg-white/20">重排</button>
      </div>
      <div className="relative rounded-xl bg-teal-900/80 p-2 shadow-inner">
        <div className="grid grid-cols-4 gap-2">
          {board.flat().map((v, i) => (
            <button
              key={i}
              onClick={() => slide(Math.floor(i / N), i % N)}
              className={`flex h-[84px] w-[84px] items-center justify-center rounded-lg text-2xl font-bold tabular-nums transition-transform ${
                v ? 'bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow hover:brightness-110' : 'cursor-default bg-transparent'
              }`}
            >
              {v || ''}
            </button>
          ))}
        </div>
        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-black/60 text-white">
            <div className="text-2xl font-bold">完成！</div>
            <div className="text-[13px]">共 {moves} 步{best === moves ? ' · 新纪录' : ''}</div>
            <button onClick={restart} className="mt-1 rounded-md bg-teal-500 px-4 py-1.5 text-[13px] font-semibold hover:bg-teal-400">再来一局</button>
          </div>
        )}
      </div>
      <div className="text-[11.5px] text-black/40 dark:text-white/40">方向键或点击滑块 · 排成 1→15</div>
    </div>
  )
}

export default {
  id: 'n-puzzle',
  name: '数字华容道',
  icon: { from: '#00C7BE', to: '#0A5C5C', Icon: Puzzle },
  component: NPuzzle,
  defaultSize: { w: 480, h: 660 },
  minSize: { w: 420, h: 560 },
  category: 'Entertainment',
  keywords: ['puzzle', '华容道', '15', '滑块', 'sliding'],
} satisfies AppDefinition

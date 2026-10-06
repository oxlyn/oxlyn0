import { useEffect, useRef, useState } from 'react'
import type { AppDefinition } from '@/system/types'
import { CircleDot } from 'lucide-react'

/**
 * 五子棋 — 15 路棋盘。人机模式 AI 用启发式评分（活四/冲四/活三等棋型
 * 攻防加权取最优点），双人模式轮流落子。连成五子即胜。
 */
const N = 15
type Stone = 0 | 1 | 2 // 0 空 1 黑 2 白
const DIRS: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]]
const PATTERN = (cnt: number, open: number): number => {
  if (cnt >= 5) return 1e6
  if (cnt === 4) return open === 2 ? 1e5 : open === 1 ? 1e4 : 0
  if (cnt === 3) return open === 2 ? 5e3 : open === 1 ? 500 : 0
  if (cnt === 2) return open === 2 ? 200 : open === 1 ? 50 : 0
  return 10
}

function checkWin(b: Stone[][], r: number, c: number): boolean {
  const p = b[r][c]
  if (!p) return false
  for (const [dr, dc] of DIRS) {
    let cnt = 1
    for (const s of [1, -1]) {
      let i = 1
      while (true) {
        const nr = r + dr * i * s, nc = c + dc * i * s
        if (nr < 0 || nr >= N || nc < 0 || nc >= N || b[nr][nc] !== p) break
        cnt++; i++
      }
    }
    if (cnt >= 5) return true
  }
  return false
}

function lineScore(b: Stone[][], r: number, c: number, p: Stone): number {
  let total = 0
  for (const [dr, dc] of DIRS) {
    let cnt = 1, open = 0
    for (const s of [1, -1]) {
      let i = 1
      while (true) {
        const nr = r + dr * i * s, nc = c + dc * i * s
        if (nr < 0 || nr >= N || nc < 0 || nc >= N) break
        if (b[nr][nc] === p) { cnt++; i++; continue }
        if (b[nr][nc] === 0) open++
        break
      }
    }
    total += PATTERN(cnt, open)
  }
  return total
}

function aiMove(b: Stone[][]): [number, number] | null {
  const cand: [number, number][] = []
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (b[r][c]) continue
    let near = false
    for (let dr = -2; dr <= 2 && !near; dr++) for (let dc = -2; dc <= 2; dc++) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nr < N && nc >= 0 && nc < N && b[nr][nc]) { near = true; break }
    }
    if (near) cand.push([r, c])
  }
  if (!cand.length) return [Math.floor(N / 2), Math.floor(N / 2)]
  let best = cand[0], bestScore = -1
  for (const [r, c] of cand) {
    // 进攻分 + 防守分（略低于同型进攻，优先自己成五）
    const s = lineScore(b, r, c, 2) + lineScore(b, r, c, 1) * 0.9
    if (s > bestScore) { bestScore = s; best = [r, c] }
  }
  return best
}

function Gomoku() {
  const [board, setBoard] = useState<Stone[][]>(() => Array.from({ length: N }, () => Array<Stone>(N).fill(0)))
  const [vsAI, setVsAI] = useState(true)
  const [turn, setTurn] = useState<Stone>(1)
  const [over, setOver] = useState<{ winner: Stone } | null>(null)
  const [last, setLast] = useState<[number, number] | null>(null)
  const busy = useRef(false)

  const restart = (keepMode = true) => {
    setBoard(Array.from({ length: N }, () => Array<Stone>(N).fill(0)))
    setTurn(1); setOver(null); setLast(null); busy.current = false
    if (!keepMode) setVsAI(true)
  }

  const place = (r: number, c: number, p: Stone) => {
    const nb = board.map((row) => [...row])
    nb[r][c] = p
    setBoard(nb)
    setLast([r, c])
    if (checkWin(nb, r, c)) { setOver({ winner: p }); busy.current = false; return }
    setTurn(p === 1 ? 2 : 1)
  }

  const humanClick = (r: number, c: number) => {
    if (over || board[r][c] || busy.current) return
    if (vsAI && turn === 2) return
    place(r, c, turn)
  }

  useEffect(() => {
    if (vsAI && turn === 2 && !over) {
      busy.current = true
      const t = setTimeout(() => {
        setBoard((b) => {
          const mv = aiMove(b)
          if (!mv) { busy.current = false; return b }
          const [r, c] = mv
          const nb = b.map((row) => [...row])
          nb[r][c] = 2
          setLast([r, c])
          if (checkWin(nb, r, c)) setOver({ winner: 2 })
          else setTurn(1)
          busy.current = false
          return nb
        })
      }, 250)
      return () => clearTimeout(t)
    }
  }, [turn, vsAI, over])

  const result = over ? (over.winner === 1 ? '⚫ 黑胜' : '⚪ 白胜') : null

  return (
    <div className="flex h-full flex-col items-center gap-3 overflow-auto bg-gradient-to-b from-amber-50 to-white p-4 dark:from-[#221c12] dark:to-[#161618]">
      <div className="flex w-full max-w-[560px] flex-wrap items-center justify-between gap-2 text-[12.5px] text-black/60 dark:text-white/60">
        <div className="flex items-center gap-1">
          <button onClick={() => { setVsAI(true); restart() }} className={`rounded-md px-2.5 py-1 font-medium ${vsAI ? 'bg-amber-700 text-white' : 'bg-black/8 hover:bg-black/15 dark:bg-white/10'}`}>人机对弈</button>
          <button onClick={() => { setVsAI(false); restart() }} className={`rounded-md px-2.5 py-1 font-medium ${!vsAI ? 'bg-amber-700 text-white' : 'bg-black/8 hover:bg-black/15 dark:bg-white/10'}`}>双人对战</button>
        </div>
        <div className="flex items-center gap-2">
          <span>{over ? result : vsAI ? '你执黑先行' : `轮到 ${turn === 1 ? '⚫ 黑' : '⚪ 白'}`}</span>
          <button onClick={() => restart()} className="rounded-md bg-black/8 px-2.5 py-1 font-medium hover:bg-black/15 dark:bg-white/10 dark:hover:bg-white/20">重开</button>
        </div>
      </div>
      <div className="relative rounded-lg bg-[#d9b375] p-2 shadow-inner dark:bg-[#8a6d3b]">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${N}, 30px)` }}>
          {board.map((row, r) => row.map((v, c) => (
            <button
              key={`${r},${c}`}
              onClick={() => humanClick(r, c)}
              className="flex h-[30px] w-[30px] items-center justify-center border-[0.5px] border-amber-900/25 hover:bg-amber-900/10"
            >
              {v ? (
                <span className={`h-[22px] w-[22px] rounded-full shadow ${v === 1 ? 'bg-gradient-to-br from-neutral-700 to-black' : 'bg-gradient-to-br from-white to-neutral-300'} ${last && last[0] === r && last[1] === c ? 'ring-2 ring-red-500' : ''}`} />
              ) : null}
            </button>
          )))}
        </div>
        {over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-black/55 text-white backdrop-blur-[2px]">
            <div className="text-2xl font-bold">{result}</div>
            <button onClick={() => restart()} className="mt-1 rounded-md bg-white/90 px-4 py-1.5 text-[13px] font-semibold text-black hover:bg-white">再来一局</button>
          </div>
        )}
      </div>
      <div className="text-[11.5px] text-black/40 dark:text-white/40">连成五子即胜{vsAI ? ' · AI 执白' : ''}</div>
    </div>
  )
}

export default {
  id: 'gomoku',
  name: '五子棋',
  icon: { from: '#C7A47A', to: '#5C3D1E', Icon: CircleDot },
  component: Gomoku,
  defaultSize: { w: 600, h: 700 },
  minSize: { w: 540, h: 600 },
  category: 'Entertainment',
  keywords: ['gomoku', '五子棋', '五连珠', '棋类', 'ai'],
} satisfies AppDefinition

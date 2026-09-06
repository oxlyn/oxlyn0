import { useMemo, useState } from 'react'
import type { AppDefinition } from '@/system/types'
import { Crown, RotateCcw } from 'lucide-react'

// Piece codes: uppercase = white. '' = empty.
type Board = string[]
const START = 'RNBQKBNR/PPPPPPPP/8/8/8/8/pppppppp/rnbqkbnr'
const GLYPH: Record<string, string> = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
}

const parse = (s: string): Board => {
  const b: Board = []
  for (const row of s.split('/')) {
    for (const ch of row) {
      if (/\d/.test(ch)) for (let i = 0; i < +ch; i++) b.push('')
      else b.push(ch)
    }
  }
  return b
}

const idx = (r: number, c: number) => r * 8 + c
const inside = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8
const isWhite = (p: string) => p !== '' && p === p.toUpperCase()

function movesFor(b: Board, r: number, c: number): [number, number][] {
  const p = b[idx(r, c)]
  if (!p) return []
  const mine = (tr: number, tc: number) => inside(tr, tc) && (b[idx(tr, tc)] === '' || isWhite(b[idx(tr, tc)]) !== isWhite(p))
  const ray = (dr: number, dc: number): [number, number][] => {
    const out: [number, number][] = []
    let tr = r + dr, tc = c + dc
    while (inside(tr, tc)) {
      if (b[idx(tr, tc)] === '') out.push([tr, tc])
      else { if (isWhite(b[idx(tr, tc)]) !== isWhite(p)) out.push([tr, tc]); break }
      tr += dr; tc += dc
    }
    return out
  }
  const isN = p.toLowerCase() === 'n'
  const isK = p.toLowerCase() === 'k'
  const isR = p.toLowerCase() === 'r'
  const isP = p.toLowerCase() === 'p'
  if (isN)
    return [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]
      .filter(([dr, dc]) => mine(r + dr, c + dc))
      .map(([dr, dc]) => [r + dr, c + dc] as [number, number])
  if (isK)
    return [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
      .filter(([dr, dc]) => mine(r + dr, c + dc))
      .map(([dr, dc]) => [r + dr, c + dc] as [number, number])
  if (isP) {
    const dir = isWhite(p) ? -1 : 1
    const startRow = isWhite(p) ? 6 : 1
    const out: [number, number][] = []
    if (inside(r + dir, c) && b[idx(r + dir, c)] === '') {
      out.push([r + dir, c])
      if (r === startRow && b[idx(r + 2 * dir, c)] === '') out.push([r + 2 * dir, c])
    }
    for (const dc of [-1, 1]) {
      const tr = r + dir, tc = c + dc
      if (inside(tr, tc) && b[idx(tr, tc)] !== '' && isWhite(b[idx(tr, tc)]) !== isWhite(p)) out.push([tr, tc])
    }
    return out
  }
  const diag = [[1, 1], [1, -1], [-1, 1], [-1, -1]].flatMap(([dr, dc]) => ray(dr, dc))
  const orth = [[1, 0], [-1, 0], [0, 1], [0, -1]].flatMap(([dr, dc]) => ray(dr, dc))
  return isR ? orth : [...diag, ...orth]
}

const alg = (r: number, c: number) => 'abcdefgh'[c] + (8 - r)

function Chess() {
  const [board, setBoard] = useState<Board>(() => parse(START))
  const [whiteTurn, setWhiteTurn] = useState(true)
  const [selected, setSelected] = useState<number | null>(null)
  const [log, setLog] = useState<string[]>([])
  const [captured, setCaptured] = useState<{ w: string[]; b: string[] }>({ w: [], b: [] })

  const legal = useMemo(() => {
    if (selected === null) return []
    const r = Math.floor(selected / 8), c = selected % 8
    return movesFor(board, r, c).map(([tr, tc]) => idx(tr, tc))
  }, [board, selected])

  const click = (i: number) => {
    if (selected !== null && legal.includes(i)) {
      const from = selected
      const piece = board[from]
      const target = board[i]
      const nb = [...board]
      // pawn promotion → queen
      const lastRow = piece === 'P' ? 0 : piece === 'p' ? 7 : -1
      nb[i] = Math.floor(i / 8) === lastRow ? (piece === 'P' ? 'Q' : 'q') : piece
      nb[from] = ''
      setBoard(nb)
      setWhiteTurn((t) => !t)
      setLog((l) => [...l, `${GLYPH[piece]} ${alg(Math.floor(from / 8), from % 8)}${target ? '×' : '–'}${alg(Math.floor(i / 8), i % 8)}`])
      if (target) setCaptured((c) => (isWhite(target) ? { ...c, w: [...c.w, target] } : { ...c, b: [...c.b, target] }))
      setSelected(null)
      return
    }
    const p = board[i]
    if (p && isWhite(p) === whiteTurn) setSelected(i)
    else setSelected(null)
  }

  const restart = () => { setBoard(parse(START)); setWhiteTurn(true); setSelected(null); setLog([]); setCaptured({ w: [], b: [] }) }

  return (
    <div className="flex h-full flex-col bg-[#2a211b] p-3 text-white">
      <div className="mb-2 flex items-center justify-between text-[13px]">
        <span className="font-semibold">{whiteTurn ? 'White' : 'Black'} to move</span>
        <button onClick={restart} className="flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-[12px] hover:bg-white/20">
          <RotateCcw size={12} /> New Game
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center gap-3">
        <div className="grid aspect-square h-full max-h-[calc(100%-0px)] grid-cols-8 overflow-hidden rounded-md ring-1 ring-black/40" style={{ maxWidth: '100%' }}>
          {board.map((p, i) => {
            const dark = (Math.floor(i / 8) + (i % 8)) % 2 === 1
            const isLegal = legal.includes(i)
            const isSel = selected === i
            return (
              <button
                key={i}
                onClick={() => click(i)}
                className={`flex items-center justify-center text-[min(4.5vh,4.5vw)] leading-none ${dark ? 'bg-[#7d5238]' : 'bg-[#e8cba0]'} ${isSel ? 'outline outline-2 -outline-offset-2 outline-amber-300' : ''}`}
              >
                <span className={p && !isWhite(p) ? 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]' : ''} style={{ color: p && !isWhite(p) ? '#1c1c1e' : '#fff' }}>
                  {GLYPH[p] ?? ''}
                </span>
                {isLegal && <span className="absolute h-3 w-3 rounded-full bg-emerald-400/60" />}
              </button>
            )
          })}
        </div>
        <div className="hidden w-32 shrink-0 flex-col gap-2 md:flex">
          <div className="rounded-lg bg-black/30 p-2 text-[12px]">
            <div className="mb-1 font-semibold text-white/60">Moves</div>
            <div className="max-h-40 overflow-y-auto leading-relaxed select-text">
              {log.map((m, i) => <div key={i}>{i + 1}. {m}</div>)}
              {log.length === 0 && <span className="opacity-40">—</span>}
            </div>
          </div>
          <div className="rounded-lg bg-black/30 p-2 text-[15px] leading-snug">
            <div className="mb-1 text-[12px] font-semibold text-white/60">Captured</div>
            <div className="break-words">{captured.w.join(' ')}</div>
            <div className="break-words">{captured.b.join(' ')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default {
  id: 'chess',
  name: 'Chess',
  icon: { from: '#C7A47A', to: '#7A5230', Icon: Crown },
  component: Chess,
  defaultSize: { w: 720, h: 640 },
  minSize: { w: 520, h: 520 },
  category: 'Entertainment',
  keywords: ['board', 'game', 'checkmate'],
} satisfies AppDefinition

import { useEffect, useRef, useState } from 'react'
import { useWindows } from '@/system/stores/windows'
import { AppIcon } from '@/system/AppIcon'
import type { AppDefinition } from '@/system/types'
import { Gamepad2 } from 'lucide-react'

function Snake({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [over, setOver] = useState(false)
  const state = useRef({
    snake: [[8, 8]] as [number, number][],
    dir: [1, 0] as [number, number],
    nextDir: [1, 0] as [number, number],
    food: [12, 8] as [number, number],
    alive: true,
  })

  useEffect(() => {
    const s = state.current
    s.snake = [[8, 8]]
    s.dir = [1, 0]
    s.nextDir = [1, 0]
    s.alive = true
    setScore(0)
    setOver(false)

    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, [number, number]> = {
        ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
      }
      const d = map[e.key]
      if (!d) return
      e.preventDefault()
      if (d[0] !== -s.dir[0] || d[1] !== -s.dir[1]) s.nextDir = d
    }
    window.addEventListener('keydown', onKey)

    const cell = 18
    const ctx = canvasRef.current?.getContext('2d')
    const timer = setInterval(() => {
      if (!s.alive || !ctx) return
      s.dir = s.nextDir
      const head: [number, number] = [s.snake[0][0] + s.dir[0], s.snake[0][1] + s.dir[1]]
      const N = 20
      if (head[0] < 0 || head[1] < 0 || head[0] >= N || head[1] >= N || s.snake.some(([x, y]) => x === head[0] && y === head[1])) {
        s.alive = false
        setOver(true)
        setBest((b) => Math.max(b, score))
        return
      }
      s.snake.unshift(head)
      if (head[0] === s.food[0] && head[1] === s.food[1]) {
        setScore((v) => v + 1)
        do {
          s.food = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)] as [number, number]
        } while (s.snake.some(([x, y]) => x === s.food[0] && y === s.food[1]))
      } else s.snake.pop()

      ctx.fillStyle = '#0d1117'
      ctx.fillRect(0, 0, N * cell, N * cell)
      ctx.fillStyle = '#f74f9e'
      ctx.beginPath()
      ctx.arc(s.food[0] * cell + cell / 2, s.food[1] * cell + cell / 2, cell * 0.32, 0, Math.PI * 2)
      ctx.fill()
      s.snake.forEach(([x, y], i) => {
        const t = 1 - i / (s.snake.length + 4)
        ctx.fillStyle = `rgba(48, 209, 88, ${0.45 + t * 0.55})`
        ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2)
      })
    }, 110)
    return () => { clearInterval(timer); window.removeEventListener('keydown', onKey) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#0d1117] p-4">
      <div className="flex w-full max-w-[360px] items-center justify-between text-[12.5px] text-white/70">
        <button className="rounded-md bg-white/10 px-2.5 py-1 hover:bg-white/20" onClick={onBack}>← Games</button>
        <span>Score <b className="text-emerald-400">{score}</b> · Best <b>{best}</b></span>
      </div>
      <div className="relative">
        <canvas ref={canvasRef} width={360} height={360} className="rounded-lg ring-1 ring-white/15" />
        {over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-black/70 text-white">
            <div className="text-lg font-bold">Game Over</div>
            <div className="text-[13px] text-white/70">Score {score}</div>
            <button
              className="mt-1 rounded-md bg-emerald-500 px-4 py-1.5 text-[13px] font-semibold hover:bg-emerald-400"
              onClick={() => { const s = state.current; s.snake = [[8, 8]]; s.dir = [1, 0]; s.nextDir = [1, 0]; s.alive = true; setScore(0); setOver(false) }}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      <div className="text-[11.5px] text-white/40">Arrow keys to steer</div>
    </div>
  )
}

function Games() {
  const [view, setView] = useState<'hub' | 'snake'>('hub')
  const open = useWindows((s) => s.open)
  if (view === 'snake') return <Snake onBack={() => setView('hub')} />

  const cards = [
    { title: 'Snake', desc: 'The classic — arrow keys, neon green.', playable: true, play: () => setView('snake'), gradient: 'linear-gradient(140deg,#30D158,#0a5c2e)', glyph: '🐍' },
    { title: 'Chess', desc: 'Full board with move rules and capture log.', playable: true, play: () => open('chess'), gradient: 'linear-gradient(140deg,#C7A47A,#7A5230)', glyph: '♛' },
    { title: '2048', desc: 'Merge the tiles.', playable: false, play: () => {}, gradient: 'linear-gradient(140deg,#FFD60A,#FF9F0A)', glyph: '2⁴⁸' },
    { title: 'Minesweeper', desc: 'Classic deduction.', playable: false, play: () => {}, gradient: 'linear-gradient(140deg,#8E8E93,#48484A)', glyph: '💣' },
  ]

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-orange-50 to-white p-6 dark:from-[#241b10] dark:to-[#161618]">
      <div className="mb-5 flex items-center gap-3">
        <Gamepad2 size={26} className="text-orange-500" />
        <div>
          <h1 className="text-xl font-bold">Games</h1>
          <p className="text-[12.5px] text-black/50 dark:text-white/50">Small, playable, no downloads.</p>
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
        {cards.map((c) => (
          <button
            key={c.title}
            onClick={c.playable ? c.play : undefined}
            disabled={!c.playable}
            className={`overflow-hidden rounded-2xl text-left ring-1 ring-black/8 dark:ring-white/10 ${c.playable ? 'transition-transform hover:-translate-y-0.5 hover:shadow-lg' : 'opacity-55'}`}
          >
            <div className="flex h-24 items-center justify-center text-4xl" style={{ background: c.gradient }}>
              <span className="drop-shadow">{c.glyph}</span>
            </div>
            <div className="bg-white p-3 dark:bg-[#232325]">
              <div className="flex items-center justify-between font-semibold">
                {c.title}
                {!c.playable && <span className="rounded bg-black/8 px-1.5 text-[10px] text-black/45 dark:bg-white/10 dark:text-white/45">Soon</span>}
              </div>
              <div className="text-[12px] text-black/50 dark:text-white/50">{c.desc}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-6 rounded-xl bg-black/4 p-4 text-[12.5px] text-black/55 dark:bg-white/6 dark:text-white/55">
        Want another game? Create <code className="rounded bg-black/8 px-1 dark:bg-white/10">src/apps/games/</code> modules — or a whole new app directory; the system picks it up automatically.
      </div>
    </div>
  )
}

export default {
  id: 'games',
  name: 'Games',
  icon: { from: '#FF9F0A', to: '#F74F9E', Icon: Gamepad2 },
  component: Games,
  defaultSize: { w: 1020, h: 680 },
  minSize: { w: 640, h: 460 },
  category: 'Entertainment',
  keywords: ['snake', 'chess', 'arcade', 'play'],
} satisfies AppDefinition

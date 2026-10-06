import { useEffect, useRef, useState } from 'react'
import { useWindows } from '@/system/stores/windows'
import type { AppDefinition, AppWindowProps } from '@/system/types'
import { Gamepad2 } from 'lucide-react'

/**
 * 贪吃蛇 — canvas 原生实现，从 Games 合集升格而来的独立应用（与俄罗斯方块/
 * Chess 同级）。键盘事件只在窗口持焦时生效，避免方向键滚动桌面其他内容。
 */
function Snake({ winId }: AppWindowProps) {
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
    // Mirror of the `score` state — the game loop's interval closure would
    // otherwise read a stale 0 when recording the best score.
    score: 0,
  })

  useEffect(() => {
    const s = state.current
    s.snake = [[8, 8]]
    s.dir = [1, 0]
    s.nextDir = [1, 0]
    s.alive = true
    s.score = 0
    setScore(0)
    setOver(false)

    const onKey = (e: KeyboardEvent) => {
      if (useWindows.getState().focusedId !== winId) return
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
        setBest((b) => Math.max(b, s.score))
        return
      }
      s.snake.unshift(head)
      if (head[0] === s.food[0] && head[1] === s.food[1]) {
        s.score += 1
        setScore(s.score)
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
      <div className="text-[12.5px] text-white/70">
        Score <b className="text-emerald-400">{score}</b> · Best <b>{best}</b>
      </div>
      <div className="relative">
        <canvas ref={canvasRef} width={360} height={360} className="rounded-lg ring-1 ring-white/15" />
        {over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-black/70 text-white">
            <div className="text-lg font-bold">Game Over</div>
            <div className="text-[13px] text-white/70">Score {score}</div>
            <button
              className="mt-1 rounded-md bg-emerald-500 px-4 py-1.5 text-[13px] font-semibold hover:bg-emerald-400"
              onClick={() => { const s = state.current; s.snake = [[8, 8]]; s.dir = [1, 0]; s.nextDir = [1, 0]; s.alive = true; s.score = 0; setScore(0); setOver(false) }}
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

export default {
  id: 'snake',
  name: '贪吃蛇',
  icon: { from: '#30D158', to: '#0a5c2e', Icon: Gamepad2 },
  component: Snake,
  defaultSize: { w: 560, h: 640 },
  minSize: { w: 460, h: 560 },
  category: 'Entertainment',
  keywords: ['snake', '贪吃蛇', 'arcade', 'neon'],
} satisfies AppDefinition

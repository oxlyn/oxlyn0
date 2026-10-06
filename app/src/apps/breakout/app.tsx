import { useEffect, useRef, useState } from 'react'
import { useWindows } from '@/system/stores/windows'
import type { AppDefinition, AppWindowProps } from '@/system/types'
import { BrickWall } from 'lucide-react'

/**
 * 打砖块 — canvas + requestAnimationFrame 原生实现。鼠标/方向键控制挡板，
 * 空格发射；音效用 Web Audio 振荡器即时合成（与俄罗斯方块同一套路）。
 * 键盘事件只在窗口持焦时生效。
 */
const W = 480, H = 360
const COLS = 8, ROWS = 5, BW = W / COLS, BH = 18
const ROW_COLORS = ['#FF6482', '#FF9F0A', '#FFD60A', '#30D158', '#64D2FF']
const BRICK_TOP = 34

interface Brick { x: number; y: number; alive: boolean; color: string }

function buildBricks(): Brick[] {
  const out: Brick[] = []
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++)
    out.push({ x: c * BW, y: BRICK_TOP + r * BH, alive: true, color: ROW_COLORS[r] })
  return out
}
let audioCtx: AudioContext | null = null
function beep(freq: number, dur = 0.06) {
  try {
    audioCtx ??= new AudioContext()
    const o = audioCtx.createOscillator(), g = audioCtx.createGain()
    o.frequency.value = freq
    g.gain.setValueAtTime(0.08, audioCtx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur)
    o.connect(g).connect(audioCtx.destination)
    o.start(); o.stop(audioCtx.currentTime + dur)
  } catch { /* 无声环境下忽略 */ }
}

function Breakout({ winId }: AppWindowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [over, setOver] = useState(false)
  const [best, setBest] = useState(() => Number(localStorage.getItem('oxlyn-breakout-best') ?? 0))
  const g = useRef({
    px: W / 2 - 34, ball: { x: W / 2, y: H - 40, dx: 3, dy: -3, stuck: true },
    bricks: buildBricks(), keys: { left: false, right: false },
  })

  const addScore = (n: number) => setScore((s) => {
    const ns = s + n
    if (ns > best) { setBest(ns); localStorage.setItem('oxlyn-breakout-best', String(ns)) }
    return ns
  })

  const restart = () => {
    g.current = { px: W / 2 - 34, ball: { x: W / 2, y: H - 40, dx: 3, dy: -3, stuck: true }, bricks: buildBricks(), keys: { left: false, right: false } }
    setScore(0); setLives(3); setLevel(1); setOver(false)
  }

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')!

    const onKey = (e: KeyboardEvent, down = true) => {
      if (useWindows.getState().focusedId !== winId) return
      if (e.key === 'ArrowLeft') { g.current.keys.left = down; e.preventDefault() }
      if (e.key === 'ArrowRight') { g.current.keys.right = down; e.preventDefault() }
      if (e.key === ' ' && down) { g.current.ball.stuck = false; e.preventDefault() }
    }
    const kd = (e: KeyboardEvent) => onKey(e, true), ku = (e: KeyboardEvent) => onKey(e, false)
    window.addEventListener('keydown', kd)
    window.addEventListener('keyup', ku)

    const onMouse = (e: MouseEvent) => {
      const rect = cv.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * W
      g.current.px = Math.min(Math.max(x - 34, 0), W - 68)
    }
    cv.addEventListener('mousemove', onMouse)
    cv.addEventListener('click', () => { g.current.ball.stuck = false })

    const speed = () => 3 + (level - 1) * 0.6
    let raf = 0
    const tick = () => {
      const s = g.current
      const sp = speed()
      if (s.keys.left) s.px = Math.max(s.px - 6, 0)
      if (s.keys.right) s.px = Math.min(s.px + 6, W - 68)
      const b = s.ball
      if (b.stuck) { b.x = s.px + 34; b.y = H - 40 }
      else {
        b.x += b.dx; b.y += b.dy
        if (b.x < 6 || b.x > W - 6) { b.dx = -b.dx; beep(220) }
        if (b.y < 6) { b.dy = -b.dy; beep(220) }
        // 挡板反弹：按命中位置改变水平角度
        if (b.dy > 0 && b.y > H - 26 && b.x > s.px && b.x < s.px + 68) {
          const hit = (b.x - (s.px + 34)) / 34
          b.dx = hit * Math.abs(sp)
          b.dy = -Math.sqrt(Math.max(sp * sp - b.dx * b.dx, sp * sp * 0.35))
          beep(330)
        }
        // 砖块碰撞
        for (const br of s.bricks) {
          if (!br.alive) continue
          if (b.x > br.x && b.x < br.x + BW && b.y > br.y && b.y < br.y + BH) {
            br.alive = false
            b.dy = -b.dy
            beep(440 + ROW_COLORS.indexOf(br.color) * 60)
            addScore(10)
            break
          }
        }
        if (b.y > H) {
          setLives((l) => {
            const nl = l - 1
            if (nl <= 0) setOver(true)
            return Math.max(nl, 0)
          })
          b.x = s.px + 34; b.y = H - 40; b.dx = 3; b.dy = -3; b.stuck = true
          beep(110, 0.2)
        }
        if (s.bricks.every((br) => !br.alive)) {
          setLevel((l) => l + 1)
          s.bricks = buildBricks()
          b.x = s.px + 34; b.y = H - 40; b.dx = 3; b.dy = -3; b.stuck = true
        }
      }

      ctx.fillStyle = '#0d1117'
      ctx.fillRect(0, 0, W, H)
      for (const br of s.bricks) {
        if (!br.alive) continue
        ctx.fillStyle = br.color
        ctx.fillRect(br.x + 1, br.y + 1, BW - 2, BH - 2)
      }
      ctx.fillStyle = '#e8e8ed'
      ctx.fillRect(s.px, H - 18, 68, 8)
      ctx.beginPath()
      ctx.arc(b.x, b.y, 6, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', kd)
      window.removeEventListener('keyup', ku)
      cv.removeEventListener('mousemove', onMouse)
    }
  }, [winId, level, best])

  return (
    <div className="flex h-full flex-col items-center gap-3 overflow-auto bg-[#0d1117] p-4">
      <div className="flex w-full max-w-[480px] items-center justify-between text-[12.5px] text-white/70">
        <span>Score <b className="tabular-nums text-pink-300">{score}</b> · Best <b className="tabular-nums">{best}</b></span>
        <span>♥ {lives} · Lv {level}</span>
        <button onClick={restart} className="rounded-md bg-white/10 px-2.5 py-1 font-medium hover:bg-white/20">重开</button>
      </div>
      <div className="relative">
        <canvas ref={canvasRef} width={W} height={H} className="w-full max-w-[480px] rounded-lg ring-1 ring-white/15" />
        {over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-black/70 text-white">
            <div className="text-2xl font-bold">Game Over</div>
            <div className="text-[13px]">Score {score}</div>
            <button onClick={restart} className="mt-1 rounded-md bg-pink-500 px-4 py-1.5 text-[13px] font-semibold hover:bg-pink-400">再来一局</button>
          </div>
        )}
      </div>
      <div className="text-[11.5px] text-white/40">鼠标或方向键移动 · 空格/点击发射</div>
    </div>
  )
}

export default {
  id: 'breakout',
  name: '打砖块',
  icon: { from: '#FF6482', to: '#B8125B', Icon: BrickWall },
  component: Breakout,
  defaultSize: { w: 560, h: 640 },
  minSize: { w: 500, h: 560 },
  category: 'Entertainment',
  keywords: ['breakout', '打砖块', 'arcade', 'ball'],
} satisfies AppDefinition

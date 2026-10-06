import { useEffect, useRef, useState } from 'react'
import type { AppDefinition } from '@/system/types'
import type { ReactNode } from 'react'
import {
  ArrowDown, ArrowDownToLine, ArrowLeft, ArrowLeftRight, ArrowRight,
  Blocks, ListOrdered, Pause, Play, RotateCcw, RotateCw, Trophy, Volume2, VolumeX,
} from 'lucide-react'

/* ---------- 基本常量 ---------- */

const COLS = 10
const ROWS = 20

/** 方块 id：1=I 2=J 3=L 4=O 5=S 6=T 7=Z（0 = 空格）。 */
const COLORS: Record<number, string> = {
  1: '#22d3ee', 2: '#3b82f6', 3: '#f97316', 4: '#eab308',
  5: '#22c55e', 6: '#a855f7', 7: '#ef4444',
}

/** SRS 出生朝向的矩阵。 */
const BASE: Record<number, number[][]> = {
  1: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  2: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
  3: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
  4: [[1, 1], [1, 1]],
  5: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
  6: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
  7: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
}

const rotCW = (m: number[][]): number[][] =>
  m.map((_, r) => m.map((__, c) => m[m.length - 1 - c][r]))

const ROT: Record<number, number[][][]> = {}
for (const id of [1, 2, 3, 4, 5, 6, 7]) {
  const m0 = BASE[id]
  const m1 = rotCW(m0)
  const m2 = rotCW(m1)
  ROT[id] = [m0, m1, m2, rotCW(m2)]
}

/**
 * SRS 踢墙表，键 `from>to`，坐标 (x, y↑)——y 轴向上，使用时取 -y 换算到
 * 行向下的棋盘坐标。O 不旋转。
 */
const KICKS_JLSTZ: Record<string, [number, number][]> = {
  '0>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '1>0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '1>2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '2>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '2>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '3>2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '3>0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '0>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
}
const KICKS_I: Record<string, [number, number][]> = {
  '0>1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '1>0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '1>2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '2>1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '2>3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '3>2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '3>0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '0>3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
}

/* ---------- 难度 ---------- */

type DiffId = 'easy' | 'normal' | 'hard' | 'hell'

const DIFFS: Record<DiffId, { label: string; desc: string; factor: number; perLevel: number; start: number }> = {
  easy: { label: '简单', desc: '下落较慢 · 12 行升一级', factor: 1.4, perLevel: 12, start: 1 },
  normal: { label: '普通', desc: '经典节奏 · 10 行升一级', factor: 1.0, perLevel: 10, start: 1 },
  hard: { label: '困难', desc: '速度飞快 · 8 行升一级', factor: 0.7, perLevel: 8, start: 2 },
  hell: { label: '地狱', desc: '极限反应 · 6 行升一级', factor: 0.48, perLevel: 6, start: 4 },
}
const DIFF_IDS: DiffId[] = ['easy', 'normal', 'hard', 'hell']

/** 现代俄罗斯方块官方重力公式 ×难度系数，下限 28ms/行。 */
const gravityMs = (level: number, diff: DiffId): number => {
  const l = Math.max(1, level)
  return Math.max(28, Math.pow(0.8 - (l - 1) * 0.007, l - 1) * 1000 * DIFFS[diff].factor)
}

/* ---------- 音效（Web Audio 合成，无音频资源） ---------- */

class Sfx {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  enabled = true

  /** 必须在用户手势里调用一次，之后才能出声。 */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return
      this.ctx = new AC()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.4
      this.master.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
  }

  private tone(f0: number, f1: number, dur: number, type: OscillatorType, vol: number, delay = 0) {
    if (!this.enabled || !this.ctx || !this.master) return
    const t = this.ctx.currentTime + delay
    const o = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    o.type = type
    o.frequency.setValueAtTime(f0, t)
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(vol, t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(g)
    g.connect(this.master)
    o.start(t)
    o.stop(t + dur + 0.02)
  }

  private noise(dur: number, vol: number, delay = 0) {
    if (!this.enabled || !this.ctx || !this.master) return
    const t = this.ctx.currentTime + delay
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur))
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len)
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    const g = this.ctx.createGain()
    g.gain.value = vol
    src.connect(g)
    g.connect(this.master)
    src.start(t)
  }

  move() { this.tone(190, 160, 0.035, 'square', 0.1) }
  rotate() { this.tone(300, 420, 0.05, 'square', 0.13) }
  hold() { this.tone(250, 320, 0.05, 'triangle', 0.16) }
  deny() { this.tone(110, 90, 0.06, 'square', 0.1) }
  lock() { this.tone(140, 110, 0.06, 'triangle', 0.28); this.noise(0.035, 0.12) }
  drop() { this.noise(0.07, 0.3); this.tone(95, 40, 0.09, 'sine', 0.4) }
  ui() { this.tone(660, 660, 0.04, 'sine', 0.12) }
  clear(n: number) {
    const notes = [523, 659, 784, 1047, 1319]
    for (let i = 0; i < Math.min(n + 1, notes.length); i++)
      this.tone(notes[i], notes[i], 0.09, 'square', 0.2, i * 0.055)
    if (n >= 4) this.tone(1568, 1568, 0.25, 'square', 0.2, 4 * 0.055)
  }
  levelUp() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, f, 0.08, 'sine', 0.22, i * 0.07)) }
  over() { [392, 311, 262, 196].forEach((f, i) => this.tone(f, f * 0.97, 0.22, 'sine', 0.25, i * 0.16)) }
}

const sfx = new Sfx()

/* ---------- 本地存储：设置 + 分数排行 ---------- */

interface ScoreEntry { name: string; score: number; lines: number; level: number; at: number }
interface Settings { sfx: boolean; name: string; diff: DiffId }
type ScoreBook = Record<DiffId, ScoreEntry[]>

const LS_SCORES = 'tetris.scores.v1'
const LS_SET = 'tetris.settings.v1'

const readLS = (key: string): unknown => {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null } catch { return null }
}
const loadScores = (): ScoreBook => {
  const d = readLS(LS_SCORES) as Partial<ScoreBook> | null
  return { easy: d?.easy ?? [], normal: d?.normal ?? [], hard: d?.hard ?? [], hell: d?.hell ?? [] }
}
const saveScores = (all: ScoreBook) => { try { localStorage.setItem(LS_SCORES, JSON.stringify(all)) } catch { /* 隐私模式等 */ } }
const loadSettings = (): Settings => {
  const d = readLS(LS_SET) as Partial<Settings> | null
  const dd = d?.diff
  const diff: DiffId = dd && DIFFS[dd] ? dd : 'normal'
  return { sfx: d?.sfx ?? true, name: d?.name ?? '', diff }
}
const saveSettings = (p: Partial<Settings>) => {
  try { localStorage.setItem(LS_SET, JSON.stringify({ ...loadSettings(), ...p })) } catch { /* 隐私模式等 */ }
}
const qualifiesScore = (diff: DiffId, score: number): boolean => {
  const list = loadScores()[diff]
  return list.length < 10 || score > list[list.length - 1].score
}

sfx.enabled = loadSettings().sfx

/* ---------- 引擎 ---------- */

type Grid = number[][]
type Status = 'menu' | 'playing' | 'paused' | 'over'
interface Piece { id: number; rot: number; x: number; y: number }
interface OverInfo { score: number; lines: number; level: number; diff: DiffId; qualifies: boolean; saved: boolean; rank: number | null }

interface Engine {
  board: Grid
  cur: Piece | null
  queue: number[]
  hold: number | null
  holdLocked: boolean
  score: number
  lines: number
  level: number
  /** 连消计数：-1 为基线，每次消行 +1，不消行的锁定重置。 */
  combo: number
  soft: boolean
  dropAcc: number
  lockTimer: number
  lockResets: number
  clearing: number[] | null
  clearTimer: number
  status: Status
  diff: DiffId
  overInfo: OverInfo | null
  das: { dir: number; das: number; arr: number }
}

const CLEAR_MS = 220
const LOCK_MS = 500
const MAX_LOCK_RESETS = 15
const DAS_MS = 160
const ARR_MS = 40
const SOFT_FACTOR = 20

const emptyBoard = (): Grid => Array.from({ length: ROWS }, () => Array<number>(COLS).fill(0))
const makeEngine = (): Engine => ({
  board: emptyBoard(), cur: null, queue: [], hold: null, holdLocked: false,
  score: 0, lines: 0, level: 1, combo: -1, soft: false, dropAcc: 0,
  lockTimer: 0, lockResets: 0, clearing: null, clearTimer: 0,
  status: 'menu', diff: 'normal', overInfo: null, das: { dir: 0, das: 0, arr: 0 },
})

const collide = (g: Grid, m: number[][], px: number, py: number): boolean => {
  for (let r = 0; r < m.length; r++)
    for (let c = 0; c < m[r].length; c++) {
      if (!m[r][c]) continue
      const x = px + c, y = py + r
      if (x < 0 || x >= COLS || y >= ROWS) return true
      if (y >= 0 && g[y][x]) return true
    }
  return false
}

const refillQueue = (e: Engine) => {
  while (e.queue.length < 6) {
    const bag = [1, 2, 3, 4, 5, 6, 7]
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[bag[i], bag[j]] = [bag[j], bag[i]]
    }
    e.queue.push(...bag)
  }
}

/** 摆放一块到出生点（先试 y=-1 半露出，顶到东西再退到 y=0，还不行就结束）。 */
const place = (e: Engine, id: number) => {
  const x = id === 4 ? 4 : 3
  e.cur = { id, rot: 0, x, y: -1 }
  e.dropAcc = 0
  e.lockTimer = 0
  e.lockResets = 0
  e.holdLocked = false
  if (collide(e.board, ROT[id][0], x, -1)) {
    if (!collide(e.board, ROT[id][0], x, 0)) e.cur.y = 0
    else gameOver(e)
  }
}

const spawnNext = (e: Engine) => {
  refillQueue(e)
  place(e, e.queue.shift()!)
}

const gameOver = (e: Engine) => {
  e.cur = null
  e.status = 'over'
  e.soft = false
  e.das.dir = 0
  sfx.over()
  e.overInfo = {
    score: e.score, lines: e.lines, level: e.level, diff: e.diff,
    qualifies: e.score > 0 && qualifiesScore(e.diff, e.score),
    saved: false, rank: null,
  }
}

const resetGame = (e: Engine) => {
  e.board = emptyBoard()
  e.queue = []
  e.hold = null
  e.holdLocked = false
  e.score = 0
  e.lines = 0
  e.level = DIFFS[e.diff].start
  e.combo = -1
  e.soft = false
  e.dropAcc = 0
  e.lockTimer = 0
  e.lockResets = 0
  e.clearing = null
  e.clearTimer = 0
  e.overInfo = null
  e.das = { dir: 0, das: 0, arr: 0 }
  refillQueue(e)
  place(e, e.queue.shift()!)
}

const lockPiece = (e: Engine) => {
  if (!e.cur) return
  const m = ROT[e.cur.id][e.cur.rot]
  let above = false
  for (let r = 0; r < m.length; r++)
    for (let c = 0; c < m[r].length; c++) {
      if (!m[r][c]) continue
      const y = e.cur.y + r, x = e.cur.x + c
      if (y < 0) above = true
      else e.board[y][x] = e.cur.id
    }
  e.cur = null
  if (above) { gameOver(e); return }
  const rows: number[] = []
  for (let r = 0; r < ROWS; r++) if (e.board[r].every((v) => v !== 0)) rows.push(r)
  if (rows.length) {
    e.combo++
    e.score += [0, 100, 300, 500, 800][rows.length] * e.level + (e.combo > 0 ? 50 * e.combo * e.level : 0)
    e.clearing = rows
    e.clearTimer = 0
    sfx.clear(rows.length)
  } else {
    e.combo = -1
    sfx.lock()
    spawnNext(e)
  }
}

/** 消行动画结束：收行、计分、升级、出下一块。 */
const collapse = (e: Engine) => {
  const rows = e.clearing!
  e.clearing = null
  for (const r of rows) {
    e.board.splice(r, 1)
    e.board.unshift(Array<number>(COLS).fill(0))
  }
  e.lines += rows.length
  const lv = DIFFS[e.diff].start + Math.floor(e.lines / DIFFS[e.diff].perLevel)
  if (lv > e.level) { e.level = lv; sfx.levelUp() }
  spawnNext(e)
}

const tryMove = (e: Engine, dx: number, sound = true): boolean => {
  if (e.status !== 'playing' || !e.cur || e.clearing) return false
  const m = ROT[e.cur.id][e.cur.rot]
  if (collide(e.board, m, e.cur.x + dx, e.cur.y)) return false
  e.cur.x += dx
  if (sound) sfx.move()
  if (collide(e.board, m, e.cur.x, e.cur.y + 1)) { e.lockTimer = 0; e.lockResets++ }
  return true
}

const tryRotate = (e: Engine, dir: 1 | -1): boolean => {
  if (e.status !== 'playing' || !e.cur || e.clearing) return false
  const id = e.cur.id
  if (id === 4) return false
  const from = e.cur.rot
  const to = (from + dir + 4) % 4
  const m = ROT[id][to]
  const table = id === 1 ? KICKS_I : KICKS_JLSTZ
  for (const [kx, ky] of table[`${from}>${to}`]) {
    const nx = e.cur.x + kx, ny = e.cur.y - ky
    if (collide(e.board, m, nx, ny)) continue
    e.cur.rot = to
    e.cur.x = nx
    e.cur.y = ny
    sfx.rotate()
    if (collide(e.board, m, nx, ny + 1)) { e.lockTimer = 0; e.lockResets++ }
    return true
  }
  sfx.deny()
  return false
}

const hardDrop = (e: Engine) => {
  if (e.status !== 'playing' || !e.cur || e.clearing) return
  const m = ROT[e.cur.id][e.cur.rot]
  let d = 0
  while (!collide(e.board, m, e.cur.x, e.cur.y + d + 1)) d++
  e.cur.y += d
  if (d > 0) e.score += 2 * d
  sfx.drop()
  lockPiece(e)
}

const softStep = (e: Engine) => {
  if (e.status !== 'playing' || !e.cur || e.clearing) return
  const m = ROT[e.cur.id][e.cur.rot]
  if (!collide(e.board, m, e.cur.x, e.cur.y + 1)) {
    e.cur.y++
    e.score++
    e.dropAcc = 0
  }
}

const doHold = (e: Engine) => {
  if (e.status !== 'playing' || !e.cur || e.clearing) return
  if (e.holdLocked) { sfx.deny(); return }
  const prev = e.hold
  e.hold = e.cur.id
  if (prev != null) place(e, prev)
  else spawnNext(e)
  e.holdLocked = true
  sfx.hold()
}

/** 每帧推进（仅在 playing 状态调用）。 */
const stepGame = (e: Engine, dt: number) => {
  if (e.clearing) {
    e.clearTimer += dt
    if (e.clearTimer >= CLEAR_MS) collapse(e)
    return
  }
  if (!e.cur) return
  // 按住左右的方向连发（DAS/ARR）
  const das = e.das
  if (das.dir !== 0) {
    das.das += dt
    if (das.das >= DAS_MS) {
      das.arr += dt
      while (das.arr >= ARR_MS) {
        das.arr -= ARR_MS
        if (!tryMove(e, das.dir)) break
      }
    }
  }
  const m = ROT[e.cur.id][e.cur.rot]
  if (!collide(e.board, m, e.cur.x, e.cur.y + 1)) {
    const g = gravityMs(e.level, e.diff)
    const interval = e.soft ? Math.max(g / SOFT_FACTOR, 16) : g
    e.dropAcc += dt
    while (e.dropAcc >= interval && !collide(e.board, m, e.cur.x, e.cur.y + 1)) {
      e.dropAcc -= interval
      e.cur.y++
      if (e.soft) e.score++
    }
  } else {
    // 落地后进入锁定延迟；移动/旋转可重置（有次数上限）
    e.dropAcc = 0
    e.lockTimer += dt
    if (e.lockTimer >= LOCK_MS || e.lockResets > MAX_LOCK_RESETS) lockPiece(e)
  }
}

/* ---------- 渲染 ---------- */

const cellRect = (ctx: CanvasRenderingContext2D, x: number, y: number, cs: number) => {
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(x + 1, y + 1, cs - 2, cs - 2, Math.max(2, cs * 0.14))
  else ctx.rect(x + 1, y + 1, cs - 2, cs - 2)
}

const drawCell = (ctx: CanvasRenderingContext2D, x: number, y: number, cs: number, color: string, alpha: number) => {
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  cellRect(ctx, x, y, cs)
  ctx.fill()
  const edge = Math.max(1.5, cs * 0.09)
  ctx.fillStyle = 'rgba(255,255,255,0.22)'
  ctx.fillRect(x + 3, y + 3, cs - 6, edge)
  ctx.fillStyle = 'rgba(0,0,0,0.28)'
  ctx.fillRect(x + 3, y + cs - 3 - edge, cs - 6, edge)
  ctx.globalAlpha = 1
}

const drawGhostCell = (ctx: CanvasRenderingContext2D, x: number, y: number, cs: number, color: string) => {
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  ctx.globalAlpha = 0.4
  cellRect(ctx, x + 1, y + 1, cs - 2)
  ctx.stroke()
  ctx.globalAlpha = 0.07
  ctx.fillStyle = color
  ctx.fill()
  ctx.globalAlpha = 1
}

const prepareCanvas = (cv: HTMLCanvasElement): { ctx: CanvasRenderingContext2D; w: number; h: number } | null => {
  const w = cv.clientWidth, h = cv.clientHeight
  if (!w || !h) return null
  const dpr = window.devicePixelRatio || 1
  const W = Math.round(w * dpr), H = Math.round(h * dpr)
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H }
  const ctx = cv.getContext('2d')
  if (!ctx) return null
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return { ctx, w, h }
}

const drawBoard = (cv: HTMLCanvasElement | null, e: Engine) => {
  if (!cv) return
  const p = prepareCanvas(cv)
  if (!p) return
  const { ctx, w, h } = p
  const cs = w / COLS
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#0a0e17'
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = 'rgba(255,255,255,0.045)'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let c = 1; c < COLS; c++) { ctx.moveTo(c * cs, 0); ctx.lineTo(c * cs, h) }
  for (let r = 1; r < ROWS; r++) { ctx.moveTo(0, r * cs); ctx.lineTo(w, r * cs) }
  ctx.stroke()
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (e.board[r][c]) drawCell(ctx, c * cs, r * cs, cs, COLORS[e.board[r][c]], 1)
  if (e.cur && (e.status === 'playing' || e.status === 'paused')) {
    const m = ROT[e.cur.id][e.cur.rot]
    let gy = e.cur.y
    while (!collide(e.board, m, e.cur.x, gy + 1)) gy++
    if (gy !== e.cur.y)
      for (let r = 0; r < m.length; r++)
        for (let c = 0; c < m[r].length; c++)
          if (m[r][c] && gy + r >= 0) drawGhostCell(ctx, (e.cur.x + c) * cs, (gy + r) * cs, cs, COLORS[e.cur.id])
    for (let r = 0; r < m.length; r++)
      for (let c = 0; c < m[r].length; c++)
        if (m[r][c] && e.cur.y + r >= 0) drawCell(ctx, (e.cur.x + c) * cs, (e.cur.y + r) * cs, cs, COLORS[e.cur.id], 1)
  }
  if (e.clearing) {
    const a = 0.3 + 0.45 * Math.abs(Math.sin(e.clearTimer / 35))
    ctx.fillStyle = `rgba(255,255,255,${a})`
    for (const r of e.clearing) ctx.fillRect(0, r * cs, w, cs)
  }
}

/** 侧栏小画布：按 slot 数均分高度，逐个居中画出生朝向。 */
const drawMini = (cv: HTMLCanvasElement | null, items: number[], alpha = 1) => {
  if (!cv) return
  const p = prepareCanvas(cv)
  if (!p) return
  const { ctx, w, h } = p
  const cs = 13
  const slotH = h / Math.max(items.length, 1)
  ctx.clearRect(0, 0, w, h)
  items.forEach((id, i) => {
    if (!id) return
    const m = ROT[id][0]
    let minR = 9, maxR = -1, minC = 9, maxC = -1
    for (let r = 0; r < m.length; r++)
      for (let c = 0; c < m[r].length; c++)
        if (m[r][c]) { minR = Math.min(minR, r); maxR = Math.max(maxR, r); minC = Math.min(minC, c); maxC = Math.max(maxC, c) }
    const ox = (w - (maxC - minC + 1) * cs) / 2 - minC * cs
    const oy = i * slotH + (slotH - (maxR - minR + 1) * cs) / 2 - minR * cs
    for (let r = 0; r < m.length; r++)
      for (let c = 0; c < m[r].length; c++)
        if (m[r][c]) drawCell(ctx, ox + c * cs, oy + r * cs, cs, COLORS[id], alpha)
  })
}

/* ---------- UI 小件 ---------- */

const Card = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="rounded-lg bg-white/5 p-2">
    <div className="mb-1 text-[10px] font-semibold tracking-wide text-white/40">{title}</div>
    {children}
  </div>
)

const HeaderBtn = ({ title, onClick, children }: { title: string; onClick: () => void; children: ReactNode }) => (
  <button
    title={title}
    onClick={onClick}
    className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white/5 text-white/70 transition hover:bg-white/15 hover:text-white"
  >
    {children}
  </button>
)

const PadBtn = ({ title, onClick, children }: { title: string; onClick: () => void; children: ReactNode }) => (
  <button
    title={title}
    onClick={onClick}
    className="grid h-8 place-items-center rounded-md bg-white/10 text-white/70 transition hover:bg-white/20 active:bg-cyan-500/40 active:text-white"
  >
    {children}
  </button>
)

const Overlay = ({ children }: { children: ReactNode }) => (
  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 px-4 backdrop-blur-[2px]">
    {children}
  </div>
)

/* ---------- 主组件 ---------- */

interface Hud { score: number; lines: number; level: number; status: Status }

function Tetris() {
  const engRef = useRef<Engine | null>(null)
  if (!engRef.current) engRef.current = makeEngine()
  const eng = engRef.current
  const rootRef = useRef<HTMLDivElement | null>(null)
  const boardRef = useRef<HTMLCanvasElement | null>(null)
  const nextRef = useRef<HTMLCanvasElement | null>(null)
  const holdRef = useRef<HTMLCanvasElement | null>(null)
  const hudRef = useRef<Hud>({ score: 0, lines: 0, level: 1, status: 'menu' })

  const [hud, setHud] = useState<Hud>(hudRef.current)
  const [diff, setDiff] = useState<DiffId>(() => loadSettings().diff)
  const [sfxOn, setSfxOn] = useState(() => sfx.enabled)
  const [over, setOver] = useState<OverInfo | null>(null)
  const [scoresOpen, setScoresOpen] = useState(false)
  const [scoresTab, setScoresTab] = useState<DiffId>('normal')
  const [scores, setScores] = useState<ScoreBook>(() => loadScores())
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [name, setName] = useState(() => loadSettings().name)

  const syncHud = (e: Engine) => {
    const s: Hud = { score: e.score, lines: e.lines, level: e.level, status: e.status }
    const p = hudRef.current
    if (s.score === p.score && s.lines === p.lines && s.level === p.level && s.status === p.status) return
    hudRef.current = s
    setHud(s)
    if (s.status === 'over') setOver(e.overInfo)
    else if (p.status === 'over') setOver(null)
  }

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const step = (t: number) => {
      raf = requestAnimationFrame(step)
      const dt = Math.min(t - last, 100)
      last = t
      if (eng.status === 'playing') stepGame(eng, dt)
      drawBoard(boardRef.current, eng)
      drawMini(holdRef.current, eng.hold ? [eng.hold] : [], eng.holdLocked ? 0.35 : 1)
      drawMini(nextRef.current, eng.queue.slice(0, 3), 1)
      syncHud(eng)
    }
    raf = requestAnimationFrame(step)
    const onBlur = () => { if (eng.status === 'playing') eng.status = 'paused' }
    window.addEventListener('blur', onBlur)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('blur', onBlur)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const start = (d: DiffId) => {
    sfx.unlock()
    sfx.ui()
    setDiff(d)
    saveSettings({ diff: d })
    eng.diff = d
    resetGame(eng)
    eng.status = 'playing'
    rootRef.current?.focus()
  }

  const toMenu = () => {
    sfx.ui()
    eng.status = 'menu'
    eng.board = emptyBoard()
    eng.cur = null
    eng.clearing = null
    eng.hold = null
    eng.queue = []
    eng.score = 0
    eng.lines = 0
    eng.level = 1
    eng.overInfo = null
    setOver(null)
  }

  const togglePause = () => {
    if (eng.status === 'playing') eng.status = 'paused'
    else if (eng.status === 'paused') eng.status = 'playing'
    else return
    sfx.ui()
  }

  const toggleSfx = () => {
    sfx.unlock()
    sfx.enabled = !sfx.enabled
    saveSettings({ sfx: sfx.enabled })
    setSfxOn(sfx.enabled)
    if (sfx.enabled) sfx.ui()
  }

  const openScores = (tab?: DiffId) => {
    if (eng.status === 'playing') eng.status = 'paused'
    setScores(loadScores())
    setScoresTab(tab ?? eng.diff)
    setScoresOpen(true)
    sfx.ui()
  }

  const saveScore = () => {
    const o = eng.overInfo
    if (!o || o.saved || !o.qualifies) return
    const all = loadScores()
    const entry: ScoreEntry = {
      name: (name.trim() || '无名氏').slice(0, 12),
      score: o.score, lines: o.lines, level: o.level, at: Date.now(),
    }
    const list = [...all[o.diff], entry].sort((a, b) => b.score - a.score).slice(0, 10)
    all[o.diff] = list
    saveScores(all)
    setScores(all)
    setSavedAt(entry.at)
    const updated: OverInfo = { ...o, saved: true, rank: list.indexOf(entry) + 1 }
    eng.overInfo = updated
    setOver(updated)
    saveSettings({ name: entry.name })
    sfx.ui()
  }

  const onKeyDown = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    const tgt = ev.target as HTMLElement
    if (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA') return
    if (scoresOpen) {
      if (ev.code === 'Escape') { ev.preventDefault(); setScoresOpen(false) }
      return
    }
    sfx.unlock()
    const e = eng
    switch (ev.code) {
      case 'ArrowLeft':
        ev.preventDefault()
        if (!ev.repeat && e.das.dir !== -1) { e.das = { dir: -1, das: 0, arr: 0 }; tryMove(e, -1) }
        break
      case 'ArrowRight':
        ev.preventDefault()
        if (!ev.repeat && e.das.dir !== 1) { e.das = { dir: 1, das: 0, arr: 0 }; tryMove(e, 1) }
        break
      case 'ArrowDown':
        ev.preventDefault()
        if (!ev.repeat) { e.soft = true; softStep(e) }
        break
      case 'ArrowUp':
      case 'KeyX':
        ev.preventDefault()
        if (!ev.repeat) tryRotate(e, 1)
        break
      case 'KeyZ':
        ev.preventDefault()
        if (!ev.repeat) tryRotate(e, -1)
        break
      case 'Space':
        ev.preventDefault()
        if (!ev.repeat) hardDrop(e)
        break
      case 'KeyC':
      case 'ShiftLeft':
      case 'ShiftRight':
        ev.preventDefault()
        if (!ev.repeat) doHold(e)
        break
      case 'KeyP':
      case 'Escape':
        ev.preventDefault()
        if (!ev.repeat) togglePause()
        break
      case 'KeyR':
        ev.preventDefault()
        if (!ev.repeat && e.status !== 'menu') start(e.diff)
        break
      case 'Enter': {
        ev.preventDefault()
        if (ev.repeat) break
        if (e.status === 'menu') start(diff)
        else if (e.status === 'over' && over && (over.saved || !over.qualifies)) start(over.diff)
        break
      }
    }
  }

  const onKeyUp = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    if (ev.code === 'ArrowLeft' && eng.das.dir === -1) eng.das.dir = 0
    if (ev.code === 'ArrowRight' && eng.das.dir === 1) eng.das.dir = 0
    if (ev.code === 'ArrowDown') eng.soft = false
  }

  const pad = (fn: (e: Engine) => void) => () => { sfx.unlock(); fn(eng) }
  const rows = scores[scoresTab]

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      autoFocus
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onPointerDown={() => sfx.unlock()}
      className="flex h-full flex-col gap-2 bg-[#0b0f19] p-3 text-zinc-200 outline-none select-none"
    >
      {/* 标题栏 */}
      <div className="flex items-center gap-2">
        <Blocks size={16} className="text-cyan-400" />
        <span className="text-[13px] font-semibold">俄罗斯方块</span>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">{DIFFS[diff].label}</span>
        <div className="flex-1" />
        <HeaderBtn title={sfxOn ? '关闭音效' : '开启音效'} onClick={toggleSfx}>
          {sfxOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </HeaderBtn>
        <HeaderBtn title="排行榜" onClick={() => openScores()}>
          <ListOrdered size={14} />
        </HeaderBtn>
        {(hud.status === 'playing' || hud.status === 'paused') && (
          <HeaderBtn title={hud.status === 'playing' ? '暂停 (P)' : '继续 (P)'} onClick={togglePause}>
            {hud.status === 'playing' ? <Pause size={14} /> : <Play size={14} />}
          </HeaderBtn>
        )}
        {hud.status !== 'menu' && (
          <HeaderBtn title="重新开始 (R)" onClick={() => start(eng.diff)}>
            <RotateCcw size={14} />
          </HeaderBtn>
        )}
      </div>

      <div className="flex min-h-0 flex-1 gap-2">
        {/* 左栏：暂存 + 计分 + 触控按钮 */}
        <div className="flex w-[104px] shrink-0 flex-col gap-2">
          <Card title="暂存 (C)">
            <canvas ref={holdRef} className="h-12 w-full" />
          </Card>
          <Card title="分数">
            <div className="text-lg leading-none font-bold tabular-nums">{hud.score}</div>
          </Card>
          <div className="grid grid-cols-2 gap-2">
            <Card title="等级">
              <div className="text-[15px] leading-none font-bold tabular-nums">{hud.level}</div>
            </Card>
            <Card title="行数">
              <div className="text-[15px] leading-none font-bold tabular-nums">{hud.lines}</div>
            </Card>
          </div>
          <div className="mt-auto grid grid-cols-3 gap-1.5">
            <PadBtn title="左移" onClick={pad((e) => tryMove(e, -1))}><ArrowLeft size={15} /></PadBtn>
            <PadBtn title="旋转" onClick={pad((e) => tryRotate(e, 1))}><RotateCw size={15} /></PadBtn>
            <PadBtn title="右移" onClick={pad((e) => tryMove(e, 1))}><ArrowRight size={15} /></PadBtn>
            <PadBtn title="软降" onClick={pad(softStep)}><ArrowDown size={15} /></PadBtn>
            <PadBtn title="硬降" onClick={pad(hardDrop)}><ArrowDownToLine size={15} /></PadBtn>
            <PadBtn title="暂存" onClick={pad(doHold)}><ArrowLeftRight size={15} /></PadBtn>
          </div>
        </div>

        {/* 棋盘 */}
        <div className="relative grid min-w-0 flex-1 place-items-center [container-type:size]">
          <div className="relative aspect-[1/2] w-[min(100cqw,50cqh)] overflow-hidden rounded-lg ring-1 ring-white/15">
            <canvas ref={boardRef} className="absolute inset-0 h-full w-full" />

            {hud.status === 'menu' && (
              <Overlay>
                <div className="text-[26px] font-bold tracking-[0.2em]">俄罗斯方块</div>
                <div className="mb-3 mt-1 text-[10px] tracking-widest text-white/35">TETRIS · 难度 / 排行 / 音效</div>
                <div className="grid w-60 grid-cols-2 gap-2">
                  {DIFF_IDS.map((d) => (
                    <button
                      key={d}
                      onClick={() => { setDiff(d); saveSettings({ diff: d }); sfx.unlock(); sfx.ui() }}
                      className={`rounded-lg border px-2 py-2 text-left transition ${
                        diff === d ? 'border-cyan-400/70 bg-cyan-400/15' : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-[13px] font-semibold">{DIFFS[d].label}</div>
                      <div className="text-[9px] leading-tight text-white/45">{DIFFS[d].desc}</div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => start(diff)}
                  className="mt-4 w-60 rounded-lg bg-cyan-500 py-2 text-[14px] font-semibold text-zinc-950 transition hover:bg-cyan-400"
                >
                  开始游戏
                </button>
                <button
                  onClick={() => openScores()}
                  className="mt-2 flex w-60 items-center justify-center gap-1.5 rounded-lg bg-white/10 py-1.5 text-[12px] transition hover:bg-white/20"
                >
                  <Trophy size={13} /> 排行榜
                </button>
                <div className="mt-3 text-center text-[10px] leading-relaxed text-white/35">
                  ← → 移动 · ↑/X 旋转 · Z 反转<br />↓ 软降 · 空格 硬降 · C 暂存 · P 暂停
                </div>
              </Overlay>
            )}

            {hud.status === 'paused' && (
              <Overlay>
                <div className="text-[20px] font-bold tracking-widest">已暂停</div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={togglePause}
                    className="rounded-lg bg-cyan-500 px-4 py-1.5 text-[12px] font-semibold text-zinc-950 transition hover:bg-cyan-400"
                  >
                    继续 (P)
                  </button>
                  <button
                    onClick={toMenu}
                    className="rounded-lg bg-white/10 px-4 py-1.5 text-[12px] transition hover:bg-white/20"
                  >
                    主菜单
                  </button>
                </div>
              </Overlay>
            )}

            {hud.status === 'over' && over && (
              <Overlay>
                <div className="text-[22px] font-bold text-red-400">游戏结束</div>
                <div className="mt-1 flex gap-4 text-[12px] text-white/60">
                  <span>分数 <b className="text-white tabular-nums">{over.score}</b></span>
                  <span>行数 <b className="text-white tabular-nums">{over.lines}</b></span>
                  <span>等级 <b className="text-white tabular-nums">{over.level}</b></span>
                </div>
                {over.qualifies && !over.saved ? (
                  <form
                    className="mt-3 flex gap-1.5"
                    onSubmit={(ev) => { ev.preventDefault(); saveScore() }}
                  >
                    <input
                      autoFocus
                      value={name}
                      onChange={(ev) => setName(ev.target.value)}
                      maxLength={12}
                      placeholder="输入昵称"
                      onKeyDown={(ev) => ev.stopPropagation()}
                      className="w-32 rounded-md bg-white/10 px-2 py-1.5 text-[12px] select-text outline-none placeholder:text-white/30 focus:bg-white/15"
                    />
                    <button
                      type="submit"
                      className="rounded-md bg-cyan-500 px-3 text-[12px] font-semibold text-zinc-950 transition hover:bg-cyan-400"
                    >
                      上榜
                    </button>
                  </form>
                ) : over.saved ? (
                  <div className="mt-3 text-[12px] text-emerald-400">已保存 · 第 {over.rank} 名</div>
                ) : (
                  <div className="mt-3 text-[11px] text-white/40">差一点进前 10，再试试！</div>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => start(over.diff)}
                    className="rounded-lg bg-cyan-500 px-3 py-1.5 text-[12px] font-semibold text-zinc-950 transition hover:bg-cyan-400"
                  >
                    再来一局
                  </button>
                  <button
                    onClick={() => openScores(over.diff)}
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-[12px] transition hover:bg-white/20"
                  >
                    排行榜
                  </button>
                  <button
                    onClick={toMenu}
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-[12px] transition hover:bg-white/20"
                  >
                    主菜单
                  </button>
                </div>
              </Overlay>
            )}

            {scoresOpen && (
              <Overlay>
                <div className="flex items-center gap-1.5 text-[14px] font-semibold">
                  <Trophy size={15} className="text-amber-300" /> 分数排行
                </div>
                <div className="mt-2 flex gap-1">
                  {DIFF_IDS.map((d) => (
                    <button
                      key={d}
                      onClick={() => { setScoresTab(d); sfx.ui() }}
                      className={`rounded-md px-2.5 py-1 text-[11px] transition ${
                        scoresTab === d ? 'bg-cyan-500 font-semibold text-zinc-950' : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {DIFFS[d].label}
                    </button>
                  ))}
                </div>
                <div className="mt-2 w-64 overflow-hidden rounded-lg border border-white/10">
                  {rows.length ? (
                    rows.map((s, i) => (
                      <div
                        key={s.at}
                        className={`flex items-center gap-2 px-2.5 py-1.5 text-[11px] ${
                          s.at === savedAt ? 'bg-cyan-500/25' : i % 2 ? 'bg-white/[0.03]' : ''
                        }`}
                      >
                        <span className={`w-5 text-right font-bold ${
                          i === 0 ? 'text-amber-300' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-orange-400' : 'text-white/35'
                        }`}>
                          {i + 1}
                        </span>
                        <span className="flex-1 truncate">{s.name}</span>
                        <span className="tabular-nums text-white/85">{s.score}</span>
                        <span className="w-16 text-right text-[9px] text-white/35">{s.lines}行 Lv{s.level}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-6 text-center text-[11px] text-white/35">暂无记录，来创造第一个！</div>
                  )}
                </div>
                <button
                  onClick={() => { setScoresOpen(false); sfx.ui() }}
                  className="mt-3 rounded-lg bg-white/10 px-4 py-1.5 text-[12px] transition hover:bg-white/20"
                >
                  返回
                </button>
              </Overlay>
            )}
          </div>
        </div>

        {/* 右栏：预览 + 操作说明 */}
        <div className="flex w-[104px] shrink-0 flex-col gap-2">
          <Card title="下一个">
            <canvas ref={nextRef} className="h-44 w-full" />
          </Card>
          <Card title="操作">
            <div className="space-y-1 text-[10px] leading-tight text-white/50">
              <div className="flex justify-between"><span>移动</span><span className="text-white/75">← →</span></div>
              <div className="flex justify-between"><span>旋转</span><span className="text-white/75">↑ / Z</span></div>
              <div className="flex justify-between"><span>软降</span><span className="text-white/75">↓</span></div>
              <div className="flex justify-between"><span>硬降</span><span className="text-white/75">空格</span></div>
              <div className="flex justify-between"><span>暂存</span><span className="text-white/75">C</span></div>
              <div className="flex justify-between"><span>暂停</span><span className="text-white/75">P</span></div>
              <div className="flex justify-between"><span>重开</span><span className="text-white/75">R</span></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default {
  id: 'tetris',
  name: '俄罗斯方块',
  icon: { from: '#22d3ee', to: '#2563eb', Icon: Blocks },
  component: Tetris,
  defaultSize: { w: 820, h: 660 },
  minSize: { w: 560, h: 480 },
  category: 'Entertainment',
  keywords: ['tetris', '俄罗斯方块', '方块', 'falling blocks'],
} satisfies AppDefinition

import { useState } from 'react'
import type { AppDefinition } from '@/system/types'
import { Calculator } from 'lucide-react'

/**
 * 24 点 — 发四张 1~13 的牌（先跑求解器保证有解），点击数字与运算符拼
 * 表达式凑 24，四张牌必须全部用上；算式经白名单校验后求值。
 * 表达式按 token 数组维护，退格/清空直接回退占用标记。
 */
interface Item { v: number; expr: string }
interface Token { t: string; numIdx?: number }
const EPS = 1e-6

function solve(items: Item[]): string | null {
  if (items.length === 1) return Math.abs(items[0].v - 24) < EPS ? items[0].expr : null
  for (let i = 0; i < items.length; i++) for (let j = 0; j < items.length; j++) {
    if (i === j) continue
    const a = items[i], b = items[j]
    const rest = items.filter((_, k) => k !== i && k !== j)
    const combos: Item[] = [
      { v: a.v + b.v, expr: `(${a.expr}+${b.expr})` },
      { v: a.v * b.v, expr: `(${a.expr}*${b.expr})` },
      { v: a.v - b.v, expr: `(${a.expr}-${b.expr})` },
      ...(Math.abs(b.v) > EPS ? [{ v: a.v / b.v, expr: `(${a.expr}/${b.expr})` }] : []),
    ]
    for (const c of combos) {
      const r = solve([...rest, c])
      if (r) return r
    }
  }
  return null
}
function deal(): { nums: number[]; solution: string } {
  for (;;) {
    const nums = Array.from({ length: 4 }, () => Math.floor(Math.random() * 13) + 1)
    const solution = solve(nums.map((n) => ({ v: n, expr: String(n) })))
    if (solution) return { nums, solution }
  }
}

function Game24() {
  const [{ nums, solution }, setDeal] = useState(() => deal())
  const [tokens, setTokens] = useState<Token[]>([])
  const [msg, setMsg] = useState('')
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => Number(localStorage.getItem('oxlyn-24-best') ?? 0))

  const used = nums.map((_, i) => tokens.some((t) => t.numIdx === i))
  const expr = tokens.map((t) => t.t).join('')

  const nextRound = () => { setDeal(deal()); setTokens([]); setMsg('') }
  const push = (token: Token) => { setMsg(''); setTokens((ts) => [...ts, token]) }
  const useNum = (i: number) => { if (!used[i]) push({ t: String(nums[i]), numIdx: i }) }
  const backspace = () => {
    setMsg('')
    setTokens((ts) => ts.slice(0, -1))
  }

  const submit = () => {
    if (used.some((u) => !u)) { setMsg('四张牌都要用上'); return }
    if (!/^[\d+\-*/()]+$/.test(expr)) { setMsg('算式不合法'); return }
    let result: number
    try {
      result = new Function(`return ${expr}`)() as number
    } catch { setMsg('算式不合法'); return }
    if (!Number.isFinite(result)) { setMsg('不能除以零'); return }
    if (Math.abs(result - 24) < EPS) {
      const s = score + 1
      setScore(s)
      if (s > best) { setBest(s); localStorage.setItem('oxlyn-24-best', String(s)) }
      setMsg(`✓ ${expr} = 24`)
      setTimeout(nextRound, 700)
    } else {
      setMsg(`✗ ${expr} = ${Number(result.toFixed(4))} ≠ 24`)
    }
  }

  const reveal = () => { setMsg(`参考解：${solution} = 24`); setTimeout(nextRound, 1400) }

  return (
    <div className="flex h-full flex-col items-center gap-4 overflow-auto bg-gradient-to-b from-orange-50 to-white p-5 dark:from-[#241b10] dark:to-[#161618]">
      <div className="flex w-full max-w-[420px] items-center justify-between text-[12.5px] text-black/60 dark:text-white/60">
        <span>连对 <b className="tabular-nums text-orange-500">{score}</b> · 最高 <b className="tabular-nums">{best}</b></span>
        <div className="flex gap-1">
          <button onClick={reveal} className="rounded-md bg-black/8 px-2.5 py-1 font-medium hover:bg-black/15 dark:bg-white/10 dark:hover:bg-white/20">看答案</button>
          <button onClick={nextRound} className="rounded-md bg-black/8 px-2.5 py-1 font-medium hover:bg-black/15 dark:bg-white/10 dark:hover:bg-white/20">换一题</button>
        </div>
      </div>
      <div className="flex gap-3">
        {nums.map((n, i) => (
          <button key={i} onClick={() => useNum(i)} disabled={used[i]}
            className={`flex h-20 w-16 items-center justify-center rounded-xl text-3xl font-bold shadow-md transition-transform ${used[i] ? 'scale-90 bg-black/10 text-black/25 dark:bg-white/5' : 'bg-white text-[#d97706] ring-1 ring-black/8 hover:-translate-y-1 dark:bg-[#2a2620] dark:text-amber-400 dark:ring-white/10'}`}>
            {n}
          </button>
        ))}
      </div>
      <div className="flex min-h-[44px] w-full max-w-[420px] items-center justify-center rounded-lg bg-black/5 px-3 py-2 text-center font-mono text-lg font-bold text-black/80 dark:bg-white/8 dark:text-white/85">
        {expr || <span className="text-black/30 dark:text-white/30">拼一个等于 24 的算式</span>}
      </div>
      <div className="grid w-full max-w-[300px] grid-cols-5 gap-1.5">
        {['+', '-', '*', '/', '(', ')'].map((op) => (
          <button key={op} onClick={() => push({ t: op })}
            className="h-10 rounded-md bg-black/8 font-mono text-[15px] font-bold hover:bg-black/15 dark:bg-white/10 dark:hover:bg-white/20">
            {op === '*' ? '×' : op === '/' ? '÷' : op}
          </button>
        ))}
        <button onClick={backspace} className="col-span-2 h-10 rounded-md bg-amber-200/70 text-[13px] font-semibold text-amber-900 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-200">退格</button>
        <button onClick={() => { setTokens([]); setMsg('') }}
          className="h-10 rounded-md bg-amber-200/70 text-[13px] font-semibold text-amber-900 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-200">清空</button>
        <button onClick={submit} className="col-span-2 h-10 rounded-md bg-orange-500 text-[13px] font-semibold text-white hover:bg-orange-400">＝ 24</button>
      </div>
      <div className={`min-h-[18px] text-[12.5px] ${msg.startsWith('✓') ? 'text-emerald-600 dark:text-emerald-400' : msg.startsWith('✗') ? 'text-red-500' : 'text-black/45 dark:text-white/45'}`}>{msg}</div>
      <div className="text-[11.5px] text-black/40 dark:text-white/40">四张牌都要用上 · 点击牌和运算符拼算式</div>
    </div>
  )
}

export default {
  id: 'game24',
  name: '24 点',
  icon: { from: '#FF9F0A', to: '#E2571B', Icon: Calculator },
  component: Game24,
  defaultSize: { w: 520, h: 680 },
  minSize: { w: 460, h: 580 },
  category: 'Entertainment',
  keywords: ['24', '24点', '扑克', '算术', 'math'],
} satisfies AppDefinition

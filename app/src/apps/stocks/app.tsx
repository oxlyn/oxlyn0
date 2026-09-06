import { useMemo, useState } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { stocksSeed } from './data'
import type { AppDefinition } from '@/system/types'
import { TrendingUp } from 'lucide-react'

interface Stock { symbol: string; name: string; price: number | null; change: number | null }
const seed = stocksSeed as Stock[]

// deterministic pseudo-market data from the symbol hash
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
const seriesFor = (symbol: string, points: number) => {
  let h = hash(symbol)
  const rnd = () => { h = (h * 1664525 + 1013904223) >>> 0; return h / 0xffffffff }
  const base = 20 + (hash(symbol) % 480)
  const vol = 0.012 + (hash(symbol + 'v') % 25) / 1000
  const out: number[] = []
  let p = base
  for (let i = 0; i < points; i++) {
    p = Math.max(1, p * (1 + (rnd() - 0.485) * vol * 3))
    out.push(p)
  }
  return out
}
const stats = (symbol: string) => {
  const s = seriesFor(symbol, 130)
  const price = s[s.length - 1]
  const prev = s[s.length - 2]
  return {
    series: s,
    price,
    change: price - prev,
    changePct: ((price - prev) / prev) * 100,
    open: s[s.length - 26] ?? s[0],
    high: Math.max(...s.slice(-26)),
    low: Math.min(...s.slice(-26)),
    vol: 12 + (hash(symbol + 'vol') % 80),
    mcap: (2 + (hash(symbol + 'm') % 2900)),
  }
}

const sparkline = (data: number[], w: number, h: number, color: string) => {
  const min = Math.min(...data), max = Math.max(...data)
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / Math.max(0.0001, max - min)) * (h - 4) - 2}`).join(' ')
  return <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
}

const HEADLINES = [
  ['Markets steady as rate hopes firm', 'Reuters'],
  ['Chip names lead the tape into the close', 'Bloomberg'],
  ['Restaurant tech M&A warms up — analysts weigh in', 'WSJ'],
]

function Stocks() {
  const [active, setActive] = useState(seed[0]?.symbol ?? 'AAPL')
  const [range, setRange] = useState(130)
  const s = useMemo(() => stats(active), [active])
  const series = useMemo(() => s.series.slice(-range), [s, range])
  const up = s.change >= 0
  const color = up ? '#30D158' : '#FF453A'
  const min = Math.min(...series), max = Math.max(...series)
  const pts = series.map((v, i) => `${(i / (series.length - 1)) * 100},${34 - ((v - min) / Math.max(0.0001, max - min)) * 30}`).join(' ')

  return (
    <div className="flex h-full bg-[#0d0d0f] text-white">
      <div className="w-56 shrink-0 overflow-y-auto border-r border-white/10">
        {seed.map((st) => {
          const d = stats(st.symbol)
          const c = d.change >= 0 ? '#30D158' : '#FF453A'
          return (
            <button
              key={st.symbol}
              onClick={() => setActive(st.symbol)}
              className={`flex w-full items-center gap-2 border-b border-white/6 px-3 py-2 text-left ${active === st.symbol ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold">{st.symbol}</span>
                <span className="block truncate text-[11px] text-white/45">{st.name}</span>
              </span>
              <svg width="56" height="22">{sparkline(d.series.slice(-40), 56, 22, c)}</svg>
              <span className="w-16 text-right">
                <span className="block text-[12.5px] tabular-nums">{d.price.toFixed(2)}</span>
                <span className="rounded px-1 text-[10.5px] font-medium tabular-nums" style={{ background: `${c}25`, color: c }}>
                  {d.change >= 0 ? '+' : ''}{d.changePct.toFixed(2)}%
                </span>
              </span>
            </button>
          )
        })}
      </div>
      <div className="min-w-0 flex-1 overflow-y-auto p-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-lg font-bold">{active}</div>
            <div className="text-[12.5px] text-white/45">{seed.find((x) => x.symbol === active)?.name}</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-light tabular-nums">{s.price.toFixed(2)}</div>
            <div className="flex items-center justify-end gap-1 text-[13px] tabular-nums" style={{ color }}>
              {up ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
              {up ? '+' : ''}{s.change.toFixed(2)} ({s.changePct.toFixed(2)}%)
            </div>
          </div>
        </div>
        <svg viewBox="0 0 100 36" className="mt-4 h-36 w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`0,36 ${pts} 100,36`} fill="url(#sg)" />
          <polyline points={pts} fill="none" stroke={color} strokeWidth="0.7" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="mt-1 flex gap-1">
          {([['1D', 26], ['1W', 60], ['1M', 130], ['6M', 130]] as const).map(([label, pts2]) => (
            <button
              key={label}
              onClick={() => setRange(pts2)}
              className={`rounded px-2 py-0.5 text-[11.5px] ${range === pts2 ? 'bg-white/15 font-semibold' : 'text-white/50 hover:bg-white/8'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-[12.5px] sm:grid-cols-6">
          {(
            [
              ['Open', s.open.toFixed(2)],
              ['High', s.high.toFixed(2)],
              ['Low', s.low.toFixed(2)],
              ['Vol', `${s.vol}M`],
              ['Mkt Cap', `${s.mcap}B`],
              ['P/E', (12 + (hash(active) % 30)).toString()],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="rounded-lg bg-white/6 p-2 text-center">
              <div className="text-[10px] text-white/45">{k}</div>
              <div className="font-medium tabular-nums">{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-white/6 p-3">
          <div className="mb-2 text-[11px] tracking-wide text-white/45 uppercase">Business</div>
          {HEADLINES.map(([t, src]) => (
            <div key={t} className="border-b border-white/6 py-1.5 text-[12.5px] last:border-0 select-text">
              {t} <span className="text-white/40">· {src}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[10.5px] text-white/35">Simulated market data for demo purposes — not investment advice.</div>
      </div>
    </div>
  )
}

export default {
  id: 'stocks',
  name: 'Stocks',
  icon: { from: '#3A3A3C', to: '#000000', Icon: TrendingUp },
  component: Stocks,
  defaultSize: { w: 900, h: 620 },
  minSize: { w: 520, h: 400 },
  category: 'Productivity & Finance',
  keywords: ['market', 'investing', 'portfolio', 'chart'],
  singleton: true,
} satisfies AppDefinition

import { useEffect, useState } from 'react'
import type { AppDefinition } from '@/system/types'
import { Calculator as CalcIcon } from 'lucide-react'

type Op = '+' | '−' | '×' | '÷' | null

function Calculator() {
  const [display, setDisplay] = useState('0')
  const [acc, setAcc] = useState<number | null>(null)
  const [op, setOp] = useState<Op>(null)
  const [fresh, setFresh] = useState(true)

  const digit = (d: string) => {
    setDisplay((cur) => (fresh || cur === '0' ? (d === '.' ? '0.' : d) : cur.length < 12 ? cur + d : cur))
    setFresh(false)
  }
  const compute = (a: number, b: number, o: Op) =>
    o === '+' ? a + b : o === '−' ? a - b : o === '×' ? a * b : o === '÷' ? (b === 0 ? NaN : a / b) : b
  const fmt = (v: number) => {
    if (!isFinite(v)) return 'Error'
    const s = Number(v.toPrecision(12)).toString()
    return s.length > 12 ? v.toExponential(6) : s
  }
  const setOperator = (o: Op) => {
    const v = parseFloat(display)
    if (acc !== null && op && !fresh) {
      const r = compute(acc, v, op)
      setAcc(r)
      setDisplay(fmt(r))
    } else setAcc(v)
    setOp(o)
    setFresh(true)
  }
  const equals = () => {
    const v = parseFloat(display)
    if (acc !== null && op) {
      const r = compute(acc, v, op)
      setDisplay(fmt(r))
      setAcc(null)
      setOp(null)
      setFresh(true)
    }
  }
  const clear = () => { setDisplay('0'); setAcc(null); setOp(null); setFresh(true) }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9.]$/.test(e.key)) digit(e.key)
      else if (e.key === '+') setOperator('+')
      else if (e.key === '-') setOperator('−')
      else if (e.key === '*') setOperator('×')
      else if (e.key === '/') setOperator('÷')
      else if (e.key === 'Enter' || e.key === '=') equals()
      else if (e.key === 'Escape') clear()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const Btn = ({ label, onClick, variant = 'num', wide }: { label: string; onClick: () => void; variant?: 'num' | 'fn' | 'op'; wide?: boolean }) => (
    <button
      onClick={onClick}
      className={`rounded-[10px] text-[17px] font-medium transition-colors ${
        wide ? 'col-span-2' : ''
      } ${
        variant === 'num'
          ? 'bg-[#696969]/90 text-white hover:bg-[#777]/90'
          : variant === 'fn'
            ? 'bg-[#414146] text-white hover:bg-[#4d4d52]'
            : 'bg-[#FF9F0A] text-white hover:bg-[#ffb03d]'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="flex h-full flex-col bg-[#2b2b2e] p-2 pt-0 select-none">
      <div className="flex h-20 items-end justify-end px-3 pb-2 text-[44px] font-light text-white tabular-nums">
        <span className="truncate">{display}</span>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-4 gap-1.5">
        <Btn label="AC" variant="fn" onClick={clear} />
        <Btn label="±" variant="fn" onClick={() => setDisplay((d) => (d.startsWith('-') ? d.slice(1) : '-' + d))} />
        <Btn label="%" variant="fn" onClick={() => setDisplay((d) => fmt(parseFloat(d) / 100))} />
        <Btn label="÷" variant="op" onClick={() => setOperator('÷')} />
        {['7', '8', '9'].map((d) => <Btn key={d} label={d} onClick={() => digit(d)} />)}
        <Btn label="×" variant="op" onClick={() => setOperator('×')} />
        {['4', '5', '6'].map((d) => <Btn key={d} label={d} onClick={() => digit(d)} />)}
        <Btn label="−" variant="op" onClick={() => setOperator('−')} />
        {['1', '2', '3'].map((d) => <Btn key={d} label={d} onClick={() => digit(d)} />)}
        <Btn label="+" variant="op" onClick={() => setOperator('+')} />
        <Btn label="0" wide onClick={() => digit('0')} />
        <Btn label="." onClick={() => digit('.')} />
        <Btn label="=" variant="op" onClick={equals} />
      </div>
    </div>
  )
}

export default {
  id: 'calculator',
  name: 'Calculator',
  icon: { from: '#FF9F0A', to: '#F7821B', Icon: CalcIcon },
  component: Calculator,
  defaultSize: { w: 340, h: 540 },
  minSize: { w: 320, h: 480 },
  category: 'Utilities',
  keywords: ['math', 'calc'],
} satisfies AppDefinition

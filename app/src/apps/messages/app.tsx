import { useEffect, useMemo, useRef, useState } from 'react'
import { conversationsSeed } from './data'
import type { AppDefinition, AppWindowProps } from '@/system/types'
import { MessagesSquare } from 'lucide-react'

interface Msg { id: string; sender: string; text: string; at: number; tapbacks?: string[] }
interface Conv { id: string; members: string[]; pinned: boolean; unread: number; hideAlerts: boolean; messages: Msg[] }

const seed = conversationsSeed as Conv[]

const HUES: Record<string, number> = {
  maya: 340, mom: 20, dad: 210, devon: 95, snappy: 42, dubbs: 262, union: 150, me: 210,
}
const hueOf = (name: string) => HUES[name.toLowerCase()] ?? ([...name].reduce((h, c) => h + c.charCodeAt(0), 0) % 360)
const avatar = (name: string, size = 32) => (
  <span
    className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
    style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(160deg, hsl(${hueOf(name)} 78% 62%), hsl(${(hueOf(name) + 40) % 360} 70% 42%))` }}
  >
    {name.slice(0, 1).toUpperCase()}
  </span>
)
const timeOf = (at: number) => {
  const d = new Date(Date.now() + at)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const REPLIES = ['Got it 👍', 'On it — give me an hour.', 'Ha! Love that.', 'Let\'s ship it.', 'Confirmed ✅', 'Can we sync at 3?']

function Messages({ payload }: AppWindowProps) {
  const [convs, setConvs] = useState<Conv[]>(() => seed.map((c) => ({ ...c, messages: [...c.messages] })))
  const [activeId, setActiveId] = useState<string | null>((payload?.convId as string) ?? seed[0]?.id ?? null)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])

  const active = convs.find((c) => c.id === activeId) ?? convs[0] ?? null
  const partner = active?.members[0] ?? 'maya'
  const sorted = useMemo(() => [...convs].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    const la = a.messages[a.messages.length - 1]?.at ?? 0
    const lb = b.messages[b.messages.length - 1]?.at ?? 0
    return lb - la
  }), [convs])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [active?.messages.length, activeId])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const openConv = (id: string) => {
    setActiveId(id)
    setConvs((all) => all.map((c) => (c.id === id ? { ...c, unread: 0 } : c)))
  }

  const send = () => {
    const text = input.trim()
    if (!text || !active) return
    const mine: Msg = { id: `m-${Date.now().toString(36)}`, sender: 'me', text, at: 0 }
    setConvs((all) => all.map((c) => (c.id === active.id ? { ...c, messages: [...c.messages, mine] } : c)))
    setInput('')
    const t = window.setTimeout(() => {
      const reply: Msg = { id: `r-${Date.now().toString(36)}`, sender: partner, text: REPLIES[Math.floor(Math.random() * REPLIES.length)], at: 0 }
      setConvs((all) => all.map((c) => (c.id === active.id ? { ...c, messages: [...c.messages, reply] } : c)))
    }, 1200)
    timers.current.push(t)
  }

  return (
    <div className="flex h-full text-[13px]">
      <div className="w-60 shrink-0 border-r border-black/10 bg-black/[0.015] dark:border-white/10 dark:bg-white/[0.02]">
        <div className="flex h-11 items-center border-b border-black/10 px-3 text-[15px] font-bold dark:border-white/10">Messages</div>
        <div className="overflow-y-auto">
          {sorted.map((c) => {
            const last = c.messages[c.messages.length - 1]
            const name = c.members[0]
            return (
              <button
                key={c.id}
                onClick={() => openConv(c.id)}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left ${active?.id === c.id ? 'bg-blue-500 text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                {avatar(name)}
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 font-semibold">
                    <span className="truncate capitalize">{name}</span>
                    <span className={`ml-auto shrink-0 text-[11px] ${active?.id === c.id ? 'text-white/70' : 'text-black/40 dark:text-white/40'}`}>
                      {last ? timeOf(last.at) : ''}
                    </span>
                  </span>
                  <span className={`block truncate text-[12px] ${active?.id === c.id ? 'text-white/85' : 'text-black/50 dark:text-white/50'}`}>
                    {last ? `${last.sender === 'me' ? 'You: ' : ''}${last.text}` : ''}
                  </span>
                </span>
                {c.unread > 0 && active?.id !== c.id && (
                  <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white" style={{ width: 18, height: 18 }}>
                    {c.unread}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
      {active ? (
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-11 items-center justify-center gap-2 border-b border-black/10 dark:border-white/10">
            {avatar(partner, 24)}
            <span className="font-semibold capitalize">{partner}</span>
          </div>
          <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col justify-end gap-1.5 overflow-y-auto p-4">
            {active.messages.map((m) => {
              const mine = m.sender === 'me'
              return (
                <div key={m.id} className={`flex items-end gap-2 ${mine ? 'justify-end' : ''}`}>
                  {!mine && avatar(m.sender, 22)}
                  <div className="max-w-[68%]">
                    <div
                      className={`rounded-2xl px-3 py-1.5 select-text ${mine
                        ? 'rounded-br-md bg-gradient-to-b from-[#3d9dff] to-[#0a7cff] text-white'
                        : 'rounded-bl-md bg-black/8 text-black dark:bg-white/12 dark:text-white'}`}
                    >
                      {m.text}
                    </div>
                    {m.tapbacks && m.tapbacks.length > 0 && (
                      <div className={`mt-0.5 flex gap-1 text-[13px] ${mine ? 'justify-end' : ''}`}>
                        {m.tapbacks.map((t, i) => <span key={i} className="rounded-full bg-black/8 px-1.5 dark:bg-white/12">{t}</span>)}
                      </div>
                    )}
                    <div className={`mt-0.5 text-[10px] text-black/30 dark:text-white/30 ${mine ? 'text-right' : ''}`}>{timeOf(m.at)}</div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-2 border-t border-black/10 p-2.5 dark:border-white/10">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="iMessage"
              className="flex-1 rounded-full border border-black/15 bg-transparent px-3.5 py-1.5 outline-none dark:border-white/20 select-text"
            />
            <button
              onClick={send}
              disabled={!input.trim()}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white disabled:opacity-30"
              aria-label="Send"
            >
              ↑
            </button>
          </div>
        </div>
      ) : (
        <div className="grid flex-1 place-items-center text-black/25 dark:text-white/25">
          <MessagesSquare size={44} strokeWidth={1} />
        </div>
      )}
    </div>
  )
}

export default {
  id: 'messages',
  name: 'Messages',
  icon: { from: '#7BF87B', to: '#0FD130', Icon: MessagesSquare },
  component: Messages,
  defaultSize: { w: 900, h: 620 },
  minSize: { w: 560, h: 420 },
  category: 'Social',
  keywords: ['chat', 'imessage', 'sms'],
} satisfies AppDefinition

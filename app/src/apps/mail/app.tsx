import { useMemo, useState } from 'react'
import { Flag, Reply, Trash2, Star, Folder } from 'lucide-react'
import { mailSeed } from './data'
import type { AppDefinition, AppWindowProps } from '@/system/types'
import { Mail as MailGlyph } from 'lucide-react'

interface Msg {
  id: string
  account: string
  to: { name: string; email: string }[]
  flagged: boolean
  mailbox: string
  read: boolean
  from: { name: string; email: string }
  subject: string
  at: number
  body: string
}

const MAILBOXES = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'sent', label: 'Sent' },
  { id: 'junk', label: 'Junk' },
  { id: 'archive', label: 'Archive' },
]

const since = (negOffsetMs: number) => {
  const d = new Date(Date.now() + negOffsetMs)
  const today = new Date()
  if (d.toDateString() === today.toDateString())
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function MailApp({ payload }: AppWindowProps) {
  const [messages, setMessages] = useState<Msg[]>(() => mailSeed.map((m) => ({ ...m }) as Msg))
  const [mailbox, setMailbox] = useState<string>((payload?.mailbox as string) ?? 'inbox')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [composing, setComposing] = useState(false)
  const [draft, setDraft] = useState({ to: '', subject: '', body: '' })

  const visible = useMemo(() => {
    const list = messages.filter((m) => (mailbox === 'inbox' ? m.mailbox === 'inbox' : m.mailbox === mailbox))
    return [...list].sort((a, b) => b.at - a.at)
  }, [messages, mailbox])

  const active = messages.find((m) => m.id === activeId) ?? null
  const unread = (id: string) => messages.filter((m) => m.mailbox === id && !m.read).length

  const openMsg = (m: Msg) => {
    setActiveId(m.id)
    setComposing(false)
    if (!m.read) setMessages((all) => all.map((x) => (x.id === m.id ? { ...x, read: true } : x)))
  }
  const toggleFlag = (id: string) =>
    setMessages((all) => all.map((x) => (x.id === id ? { ...x, flagged: !x.flagged } : x)))
  const trashMsg = (id: string) => {
    setMessages((all) => all.map((x) => (x.id === id ? { ...x, mailbox: 'archive' } : x)))
    setActiveId(null)
  }
  const send = () => {
    const id = `sent-${Date.now().toString(36)}`
    setMessages((all) => [
      {
        id, account: 'icloud', to: [{ name: draft.to, email: draft.to }], flagged: false, mailbox: 'sent',
        read: true, from: { name: 'wilson', email: 'wilson1.wu@gmail.com' }, subject: draft.subject || '(no subject)',
        at: Date.now() - Date.now(), body: draft.body,
      },
      ...all,
    ])
    setComposing(false)
    setDraft({ to: '', subject: '', body: '' })
    setMailbox('sent')
    setActiveId(id)
  }

  return (
    <div className="flex h-full text-[13px]">
      {/* mailboxes */}
      <div className="glass-thin w-44 shrink-0 border-r border-black/10 p-2 dark:border-white/10">
        <div className="flex items-center justify-between px-2 pt-1 pb-1">
          <span className="text-[11px] font-semibold text-black/40 dark:text-white/40">iCloud</span>
          <button
            className="rounded p-0.5 text-blue-500 hover:bg-blue-500/10"
            title="New Message"
            onClick={() => { setComposing(true); setActiveId(null) }}
          >
            <PenNew />
          </button>
        </div>
        <button
          onClick={() => { setMailbox('flagged'); setActiveId(null) }}
          className={`flex w-full items-center gap-2 rounded-md px-2 py-1 ${mailbox === 'flagged' ? 'bg-blue-500 text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
        >
          <Star size={14} /> Flagged
        </button>
        {MAILBOXES.map((b) => {
          const n = unread(b.id)
          return (
            <button
              key={b.id}
              onClick={() => { setMailbox(b.id); setActiveId(null) }}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1 ${mailbox === b.id ? 'bg-blue-500 text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
            >
              <span className="flex items-center gap-2"><Folder size={14} /> {b.label}</span>
              {n > 0 && <span className={`text-[11px] ${mailbox === b.id ? 'text-white/80' : 'text-black/40 dark:text-white/40'}`}>{n}</span>}
            </button>
          )
        })}
      </div>
      {/* list */}
      <div className="w-64 shrink-0 border-r border-black/10 bg-black/[0.015] dark:border-white/10 dark:bg-white/[0.02]">
        <div className="flex h-10 items-center border-b border-black/10 px-3 font-semibold dark:border-white/10">
          {mailbox === 'flagged' ? 'Flagged' : MAILBOXES.find((b) => b.id === mailbox)?.label}
        </div>
        <div className="h-[calc(100%-2.5rem)] overflow-y-auto">
          {(mailbox === 'flagged' ? messages.filter((m) => m.flagged) : visible).map((m) => (
            <button
              key={m.id}
              onClick={() => openMsg(m)}
              className={`block w-full border-b border-black/5 px-3 py-2 text-left dark:border-white/5 ${
                activeId === m.id ? 'bg-blue-500/15 dark:bg-blue-400/15' : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {m.flagged && <Flag size={11} className="shrink-0 fill-orange-400 text-orange-400" />}
                {!m.read && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                <span className={`truncate ${m.read ? '' : 'font-semibold'}`}>{mailbox === 'sent' ? m.to[0]?.name : m.from.name}</span>
                <span className="ml-auto shrink-0 text-[11px] text-black/40 dark:text-white/40">{since(m.at)}</span>
              </div>
              <div className={`truncate text-[12.5px] ${m.read ? 'text-black/60 dark:text-white/60' : 'font-medium'}`}>{m.subject}</div>
              <div className="truncate text-[11.5px] text-black/40 dark:text-white/40">{m.body.slice(0, 70)}</div>
            </button>
          ))}
          {visible.length === 0 && mailbox !== 'flagged' && (
            <div className="p-6 text-center text-black/35 dark:text-white/35">No Mail</div>
          )}
        </div>
      </div>
      {/* reader / composer */}
      <div className="flex min-w-0 flex-1 flex-col">
        {composing ? (
          <div className="flex h-full flex-col">
            <div className="flex h-10 items-center justify-between border-b border-black/10 px-3 dark:border-white/10">
              <span className="font-semibold">New Message</span>
              <button className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600" onClick={send}>Send</button>
            </div>
            {(['to', 'subject'] as const).map((f) => (
              <label key={f} className="flex items-center gap-2 border-b border-black/10 px-3 py-2 dark:border-white/10">
                <span className="w-14 capitalize text-black/40 dark:text-white/40">{f}:</span>
                <input
                  value={draft[f]}
                  onChange={(e) => setDraft((d) => ({ ...d, [f]: e.target.value }))}
                  className="w-full bg-transparent outline-none select-text"
                />
              </label>
            ))}
            <textarea
              value={draft.body}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              placeholder="Write your message…"
              className="min-h-0 flex-1 resize-none bg-transparent p-4 outline-none select-text"
            />
          </div>
        ) : active ? (
          <>
            <div className="flex h-10 items-center gap-2 border-b border-black/10 px-3 dark:border-white/10">
              <button className="rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/10" title="Reply" onClick={() => { setComposing(true); setDraft({ to: active.from.email, subject: `Re: ${active.subject}`, body: '' }) }}>
                <Reply size={15} />
              </button>
              <button className="rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/10" title="Flag" onClick={() => toggleFlag(active.id)}>
                <Flag size={15} className={active.flagged ? 'fill-orange-400 text-orange-400' : ''} />
              </button>
              <button className="rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/10" title="Archive" onClick={() => trashMsg(active.id)}>
                <Trash2 size={15} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5 select-text">
              <h1 className="text-lg font-bold">{active.subject}</h1>
              <div className="mt-1 flex items-center gap-2 text-[12px] text-black/50 dark:text-white/50">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-[10px] font-bold text-white">
                  {active.from.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="font-medium text-black/70 dark:text-white/70">{active.from.name}</span>
                <span>&lt;{active.from.email}&gt;</span>
                <span className="ml-auto">{since(active.at)}</span>
              </div>
              <pre className="mt-4 font-sans text-[13px] leading-relaxed whitespace-pre-wrap">{active.body}</pre>
            </div>
          </>
        ) : (
          <div className="grid h-full place-items-center text-black/25 dark:text-white/25">
            <MailGlyph size={44} strokeWidth={1} />
          </div>
        )}
      </div>
    </div>
  )
}

const PenNew = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
)

export default {
  id: 'mail',
  name: 'Mail',
  icon: { from: '#5EC9F8', to: '#1463E8', Icon: MailGlyph },
  component: MailApp,
  defaultSize: { w: 1060, h: 680 },
  minSize: { w: 640, h: 460 },
  category: 'Productivity & Finance',
  keywords: ['email', 'inbox', 'send', 'compose', 'letter'],
} satisfies AppDefinition

import { useMemo, useState } from 'react'
import { Star, Phone, Mail as MailGlyph, MapPin, Cake, Link2, UserPlus } from 'lucide-react'
import { contactsSeed } from './data'
import type { AppDefinition, AppWindowProps } from '@/system/types'
import { ContactRound } from 'lucide-react'

interface Contact {
  id: string
  first: string
  last: string
  company: string
  phone: string
  email: string
  address: string
  birthday: string
  url: string
  note: string
  favorite: boolean
  gradient: number
  myCard?: boolean
}

const HUES = [205, 262, 340, 20, 42, 95, 150, 175, 285, 320, 0, 55, 120]
const avatarBg = (i: number) => `linear-gradient(160deg, hsl(${HUES[i % HUES.length]} 78% 62%), hsl(${(HUES[i % HUES.length] + 40) % 360} 70% 42%))`

function Contacts({ payload }: AppWindowProps) {
  const [people, setPeople] = useState<Contact[]>(() => contactsSeed.map((c) => ({ ...c }) as Contact))
  const [q, setQ] = useState('')
  const [activeId, setActiveId] = useState<string | null>((payload?.contactId as string) ?? null)
  const [adding, setAdding] = useState(false)

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const filtered = people.filter((c) =>
      !needle || `${c.first} ${c.last} ${c.company}`.toLowerCase().includes(needle),
    )
    return [...filtered].sort((a, b) => Number(b.myCard ?? false) - Number(a.myCard ?? false) || `${a.first}`.localeCompare(`${b.first}`))
  }, [people, q])

  const active = people.find((c) => c.id === activeId) ?? list[0] ?? null
  const toggleFav = (id: string) =>
    setPeople((all) => all.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c)))

  return (
    <div className="flex h-full text-[13px]">
      <div className="flex w-60 shrink-0 flex-col border-r border-black/10 bg-black/[0.015] dark:border-white/10 dark:bg-white/[0.02]">
        <div className="flex h-11 items-center gap-2 border-b border-black/10 px-3 dark:border-white/10">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="w-full rounded-md bg-black/5 px-2 py-1 outline-none dark:bg-white/10 select-text"
          />
          <button className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10" title="Add Contact" onClick={() => setAdding(true)}>
            <UserPlus size={15} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto py-1">
          {list.map((c) => (
            <button
              key={c.id}
              onClick={() => { setActiveId(c.id); setAdding(false) }}
              className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left ${
                active?.id === c.id && !adding ? 'bg-blue-500 text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ background: avatarBg(c.gradient) }}
              >
                {c.first[0]}{c.last[0]}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 truncate font-medium">
                  {c.first} {c.last}
                  {c.myCard && <span className="rounded bg-amber-400/80 px-1 text-[9px] font-bold text-amber-950">ME</span>}
                </span>
                {c.company && <span className="block truncate text-[11px] opacity-60">{c.company}</span>}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="min-w-0 flex-1 overflow-y-auto">
        {adding ? (
          <AddContactForm onCancel={() => setAdding(false)} onAdd={(c) => { setPeople((all) => [c, ...all]); setAdding(false); setActiveId(c.id) }} />
        ) : active ? (
          <div className="mx-auto max-w-md p-8 select-text">
            <div className="flex items-center gap-4">
              <span
                className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white"
                style={{ background: avatarBg(active.gradient) }}
              >
                {active.first[0]}{active.last[0]}
              </span>
              <div>
                <h1 className="text-xl font-bold">
                  {active.first} {active.last}
                  {active.myCard && <span className="ml-2 rounded bg-amber-400/80 px-1.5 py-0.5 align-middle text-[10px] font-bold text-amber-950">MY CARD</span>}
                </h1>
                {active.company && <p className="text-black/50 dark:text-white/50">{active.company}</p>}
              </div>
              <button
                onClick={() => toggleFav(active.id)}
                className={`ml-auto rounded-full p-2 ${active.favorite ? 'text-amber-400' : 'text-black/25 dark:text-white/25'} hover:bg-black/5 dark:hover:bg-white/10`}
                title="Favorite"
              >
                <Star size={18} className={active.favorite ? 'fill-current' : ''} />
              </button>
            </div>
            <div className="mt-6 space-y-1 text-[13px]">
              {(
                [
                  [Phone, 'mobile', active.phone, `tel:${active.phone}`],
                  [MailGlyph, 'email', active.email, `mailto:${active.email}`],
                  [Link2, 'url', active.url, active.url],
                  [MapPin, 'address', active.address, ''],
                  [Cake, 'birthday', active.birthday, ''],
                ] as const
              )
                .filter(([, , v]) => v)
                .map(([Icon, label, v, href], i) => (
                  <div key={i} className="flex items-center gap-3 border-b border-black/5 py-2 dark:border-white/5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-black/5 dark:bg-white/10">
                      <Icon size={14} className="text-black/50 dark:text-white/50" />
                    </span>
                    <span className="w-16 text-black/40 dark:text-white/40 capitalize">{label}</span>
                    {href ? (
                      <a href={href} className="text-blue-500 hover:underline">{v}</a>
                    ) : (
                      <span>{v}</span>
                    )}
                  </div>
                ))}
              {active.note && (
                <div className="mt-3 rounded-lg bg-amber-100/70 p-3 text-[12.5px] text-amber-950 dark:bg-amber-400/10 dark:text-amber-200">
                  {active.note}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid h-full place-items-center text-black/25 dark:text-white/25">
            <ContactRound size={44} strokeWidth={1} />
          </div>
        )}
      </div>
    </div>
  )
}

function AddContactForm({ onAdd, onCancel }: { onAdd: (c: Contact) => void; onCancel: () => void }) {
  const [f, setF] = useState({ first: '', last: '', company: '', phone: '', email: '' })
  const field = (k: keyof typeof f, label: string) => (
    <label className="flex items-center gap-2 border-b border-black/10 px-3 py-2 dark:border-white/10">
      <span className="w-20 text-black/40 dark:text-white/40">{label}</span>
      <input value={f[k]} onChange={(e) => setF((d) => ({ ...d, [k]: e.target.value }))} className="w-full bg-transparent outline-none select-text" />
    </label>
  )
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-11 items-center justify-between border-b border-black/10 px-3 dark:border-white/10">
        <span className="font-semibold">New Contact</span>
        <div className="flex gap-2">
          <button className="rounded px-3 py-1 hover:bg-black/5 dark:hover:bg-white/10" onClick={onCancel}>Cancel</button>
          <button
            className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600 disabled:opacity-40"
            disabled={!f.first}
            onClick={() => onAdd({ id: `ct-${Date.now().toString(36)}`, ...f, address: '', birthday: '', url: '', note: '', favorite: false, gradient: Math.floor(Math.random() * 13) })}
          >
            Done
          </button>
        </div>
      </div>
      <div className="p-2">
        {field('first', 'First')}
        {field('last', 'Last')}
        {field('company', 'Company')}
        {field('phone', 'Phone')}
        {field('email', 'Email')}
      </div>
    </div>
  )
}

export default {
  id: 'contacts',
  name: 'Contacts',
  icon: { from: '#A5988C', to: '#6E6259', Icon: ContactRound },
  component: Contacts,
  defaultSize: { w: 860, h: 580 },
  minSize: { w: 480, h: 360 },
  category: 'Productivity & Finance',
  keywords: ['people', 'address', 'phone', 'email', 'card'],
} satisfies AppDefinition

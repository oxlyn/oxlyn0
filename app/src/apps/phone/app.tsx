import { useState } from 'react'
import { Delete, PhoneOff, Phone as PhoneGlyph, Mic, Voicemail } from 'lucide-react'
import { contactsSeed } from '@/apps/contacts/data'
import type { AppDefinition } from '@/system/types'

interface Contact { id: string; first: string; last: string; company: string; phone: string; email: string; gradient: number }
const people = contactsSeed as Contact[]
const KEYS = [
  ['1', ''], ['2', 'ABC'], ['3', 'DEF'],
  ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
  ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'],
  ['*', ''], ['0', '+'], ['#', ''],
]

type Tab = 'keypad' | 'recents' | 'contacts' | 'voicemail'

function Phone() {
  const [tab, setTab] = useState<Tab>('keypad')
  const [digits, setDigits] = useState('')
  const [calling, setCalling] = useState<string | null>(null)

  const call = (who: string) => {
    setCalling(who)
    setTimeout(() => setCalling(null), 2200)
  }

  return (
    <div className="relative flex h-full flex-col text-[13px]">
      {tab === 'keypad' && (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
          <div className="min-h-10 text-center text-3xl font-light tabular-nums">{digits || <span className="opacity-25">Number</span>}</div>
          <div className="grid grid-cols-3 gap-x-5 gap-y-3">
            {KEYS.map(([k, sub]) => (
              <button
                key={k}
                onClick={() => setDigits((d) => (d.length < 16 ? d + k : d))}
                className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-black/6 hover:bg-black/12 dark:bg-white/10 dark:hover:bg-white/20"
              >
                <span className="text-[22px] font-medium leading-none">{k}</span>
                {sub && <span className="text-[9px] tracking-widest opacity-50">{sub}</span>}
              </button>
            ))}
          </div>
          <div className="flex w-64 items-center justify-between">
            <span className="w-16" />
            <button
              onClick={() => digits && call(digits)}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-400"
            >
              <PhoneGlyph size={24} fill="currentColor" />
            </button>
            {digits && (
              <button onClick={() => setDigits((d) => d.slice(0, -1))} className="w-16 text-black/45 hover:text-black dark:text-white/45 dark:hover:text-white">
                <Delete size={20} className="mx-auto" />
              </button>
            )}
            {!digits && <span className="w-16" />}
          </div>
        </div>
      )}
      {tab === 'recents' && (
        <div className="h-full overflow-y-auto p-3">
          {people.slice(0, 8).map((c, i) => (
            <button key={c.id} onClick={() => call(c.first)} className="flex w-full items-center gap-3 border-b border-black/5 py-2.5 text-left hover:bg-black/4 dark:border-white/5 dark:hover:bg-white/5">
              <span className={`text-[11px] font-semibold ${i % 3 === 2 ? 'text-red-500' : 'text-black/40 dark:text-white/40'}`}>
                {i % 3 === 2 ? 'Missed' : i % 3 === 1 ? 'Outgoing' : 'Incoming'}
              </span>
              <span className="font-medium">{c.first} {c.last}</span>
              <span className="ml-auto text-[12px] text-black/40 dark:text-white/40">{['9:41 AM', 'Yesterday', 'Tuesday', 'Monday'][i % 4]}</span>
            </button>
          ))}
        </div>
      )}
      {tab === 'contacts' && (
        <div className="h-full overflow-y-auto p-3">
          {people.map((c) => (
            <button key={c.id} onClick={() => call(c.first)} className="flex w-full items-center gap-2 border-b border-black/5 py-2 text-left hover:bg-black/4 dark:border-white/5 dark:hover:bg-white/5">
              <span className="font-medium">{c.first} {c.last}</span>
              <span className="ml-auto text-[12px] text-black/40 dark:text-white/40">{c.phone}</span>
            </button>
          ))}
        </div>
      )}
      {tab === 'voicemail' && (
        <div className="h-full overflow-y-auto p-3">
          {[
            ['Dentist', 'Reminder about your Friday cleaning…', 'Yesterday'],
            ['Union Made — warehouse', 'Your order shipped. Tracking in the…', 'Monday'],
            ['Unknown', '(no voicemail)', 'Aug 28'],
          ].map(([from, preview, when], i) => (
            <div key={i} className="flex items-center gap-3 border-b border-black/5 py-2.5 dark:border-white/5">
              <button onClick={() => call('voicemail')} className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/15 text-blue-500" title="Play">
                <Voicemail size={15} />
              </button>
              <div className="min-w-0">
                <div className="truncate font-medium">{from}</div>
                <div className="truncate text-[12px] text-black/45 dark:text-white/45">{preview}</div>
              </div>
              <span className="ml-auto text-[11.5px] text-black/40 dark:text-white/40">{when}</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex h-11 shrink-0 items-stretch border-t border-black/10 dark:border-white/10">
        {(
          [
            ['keypad', 'Keypad'],
            ['recents', 'Recents'],
            ['contacts', 'Contacts'],
            ['voicemail', 'Voicemail'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 text-[12px] font-medium ${tab === id ? 'text-blue-500' : 'text-black/45 dark:text-white/45'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {calling && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/80 text-white">
          <Mic size={28} className="opacity-70" />
          <div className="text-lg font-semibold">Calling {calling}…</div>
          <div className="text-[12px] text-white/50">simulated</div>
          <button onClick={() => setCalling(null)} className="mt-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500 hover:bg-red-400">
            <PhoneOff size={20} />
          </button>
        </div>
      )}
    </div>
  )
}

export default {
  id: 'phone',
  name: 'Phone',
  icon: { from: '#7BF87B', to: '#0FD130', Icon: PhoneGlyph },
  component: Phone,
  defaultSize: { w: 760, h: 600 },
  minSize: { w: 480, h: 420 },
  category: 'Social',
  keywords: ['call', 'dial', 'voicemail'],
} satisfies AppDefinition

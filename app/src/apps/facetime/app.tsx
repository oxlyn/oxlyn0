import { useEffect, useState } from 'react'
import { PhoneOff, Mic, MicOff, Video, VideoOff, Plus } from 'lucide-react'
import { contactsSeed } from '@/apps/contacts/data'
import type { AppDefinition } from '@/system/types'
import { Video as VideoGlyph } from 'lucide-react'

interface Contact { id: string; first: string; last: string; company: string; gradient: number }
const people = contactsSeed as Contact[]
const HUES = [205, 262, 340, 20, 42, 95, 150, 175, 285, 320, 0, 55, 120]
const avatarBg = (i: number) => `linear-gradient(160deg, hsl(${HUES[i % HUES.length]} 78% 62%), hsl(${(HUES[i % HUES.length] + 40) % 360} 70% 42%))`

function FaceTime() {
  const [call, setCall] = useState<Contact | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [muted, setMuted] = useState(false)
  const [camOff, setCamOff] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    if (!call) return
    setSeconds(0)
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [call])

  const mmss = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

  if (call) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-white" style={{ background: 'linear-gradient(160deg,#0b3b2e,#0a1a2e 60%,#1a0a2e)' }}>
        <span className="flex h-28 w-28 items-center justify-center rounded-full text-3xl font-bold" style={{ background: avatarBg(call.gradient) }}>
          {call.first[0]}{call.last[0]}
        </span>
        <div className="text-center">
          <div className="text-xl font-semibold">{call.first} {call.last}</div>
          <div className="text-[13px] text-white/60 tabular-nums">{mmss}</div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={() => setMuted((v) => !v)} className={`flex h-11 w-11 items-center justify-center rounded-full ${muted ? 'bg-white text-black' : 'bg-white/15 hover:bg-white/25'}`}>
            {muted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button onClick={() => setCamOff((v) => !v)} className={`flex h-11 w-11 items-center justify-center rounded-full ${camOff ? 'bg-white text-black' : 'bg-white/15 hover:bg-white/25'}`}>
            {camOff ? <VideoOff size={18} /> : <Video size={18} />}
          </button>
          <button onClick={() => setCall(null)} className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 hover:bg-red-400">
            <PhoneOff size={20} />
          </button>
        </div>
        <div className="text-[11px] text-white/35">Simulated call — camera and microphone are not used.</div>
      </div>
    )
  }

  return (
    <div className="flex h-full text-[13px]">
      <div className="glass-thin w-40 shrink-0 border-r border-black/10 p-2 dark:border-white/10">
        <button className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-green-500 px-2 py-1.5 font-medium text-white hover:bg-green-400">
          <Plus size={14} /> New FaceTime
        </button>
        <div className="px-2 pt-1 pb-1 text-[11px] font-semibold text-black/40 dark:text-white/40">Recents</div>
        {people.slice(0, 4).map((c) => (
          <button key={c.id} onClick={() => setCall(c)} className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left hover:bg-black/5 dark:hover:bg-white/10">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            <span className="truncate">{c.first}</span>
          </button>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-4 p-8">
        <div className="w-full max-w-sm rounded-2xl border border-black/10 p-4 dark:border-white/10">
          <div className="mb-2 font-semibold">New FaceTime</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name or number"
            className="w-full rounded-lg bg-black/5 px-3 py-2 outline-none dark:bg-white/10 select-text"
          />
          <button
            disabled={!name.trim()}
            onClick={() => {
              const hit = people.find((c) => `${c.first} ${c.last}`.toLowerCase().includes(name.trim().toLowerCase()))
              setCall(hit ?? { id: 'anon', first: name.trim(), last: '', company: '', gradient: 4 })
            }}
            className="mt-3 w-full rounded-lg bg-green-500 py-2 font-medium text-white hover:bg-green-400 disabled:opacity-40"
          >
            FaceTime
          </button>
        </div>
        <div className="w-full max-w-sm">
          <div className="mb-2 text-[11px] font-semibold text-black/40 dark:text-white/40">Contacts</div>
          <div className="grid grid-cols-2 gap-2">
            {people.slice(0, 8).map((c) => (
              <button key={c.id} onClick={() => setCall(c)} className="flex items-center gap-2 rounded-lg border border-black/8 p-2 text-left hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10">
                <span className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: avatarBg(c.gradient) }}>
                  {c.first[0]}{c.last[0]}
                </span>
                <span className="truncate">{c.first} {c.last}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default {
  id: 'facetime',
  name: 'FaceTime',
  icon: { from: '#7BF87B', to: '#0FD130', Icon: VideoGlyph },
  component: FaceTime,
  defaultSize: { w: 900, h: 640 },
  minSize: { w: 560, h: 440 },
  category: 'Social',
  keywords: ['call', 'video', 'chat'],
} satisfies AppDefinition

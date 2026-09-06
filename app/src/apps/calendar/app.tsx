import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { calendarSeed } from './data'
import type { AppDefinition, AppWindowProps } from '@/system/types'
import { Calendar as CalendarGlyph } from 'lucide-react'

interface Ev { id: string; calId: string; title: string; location: string; start: number; end: number; allDay: boolean; notes: string }
interface Cal { id: string; name: string; color: string; visible: boolean }

const seed = calendarSeed as { calendars: Cal[]; events: Ev[] }
const DAY = 86_400_000

function CalendarApp({ payload }: AppWindowProps) {
  const [cursor, setCursor] = useState(() => new Date())
  const [selected, setSelected] = useState<Date>(() => new Date())
  const [hidden, setHidden] = useState<Set<string>>(new Set())

  const events = useMemo(
    () => seed.events.filter((e) => !hidden.has(e.calId)),
    [hidden],
  )

  const y = cursor.getFullYear()
  const m = cursor.getMonth()
  const first = new Date(y, m, 1)
  const startOffset = (first.getDay() + 6) % 7 // week starts Monday
  const gridStart = new Date(y, m, 1 - startOffset)
  const days = useMemo(
    () => Array.from({ length: 42 }, (_, i) => new Date(gridStart.getTime() + i * DAY)),
    [y, m],
  )
  const eventsByDay = useMemo(() => {
    const map = new Map<string, Ev[]>()
    for (const e of events) {
      const k = new Date(e.start).toDateString()
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(e)
    }
    return map
  }, [events])

  const prev = () => setCursor(new Date(y, m - 1, 1))
  const next = () => setCursor(new Date(y, m + 1, 1))
  const goToday = () => { setCursor(new Date()); setSelected(new Date()) }

  const selectedEvents = events
    .filter((e) => new Date(e.start).toDateString() === selected.toDateString())
    .sort((a, b) => a.start - b.start)

  return (
    <div className="flex h-full text-[13px]">
      <div className="glass-thin w-40 shrink-0 border-r border-black/10 p-2 dark:border-white/10">
        <div className="px-2 pt-1 pb-1 text-[11px] font-semibold text-black/40 dark:text-white/40">iCloud</div>
        {seed.calendars.map((c) => (
          <label key={c.id} className="flex w-full items-center gap-2 rounded-md px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">
            <input
              type="checkbox"
              checked={!hidden.has(c.id)}
              onChange={() =>
                setHidden((h) => {
                  const n = new Set(h)
                  if (n.has(c.id)) n.delete(c.id)
                  else n.add(c.id)
                  return n
                })
              }
              className="accent-current"
              style={{ accentColor: c.color }}
            />
            <span className="truncate">{c.name}</span>
          </label>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-11 items-center gap-2 border-b border-black/10 px-3 dark:border-white/10">
          <button className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10" onClick={prev}><ChevronLeft size={17} /></button>
          <button className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10" onClick={next}><ChevronRight size={17} /></button>
          <button className="rounded px-2 py-0.5 text-[12px] hover:bg-black/5 dark:hover:bg-white/10" onClick={goToday}>Today</button>
          <span className="ml-2 text-[15px] font-bold">
            {cursor.toLocaleDateString('en-US', { month: 'long' })} <span className="font-normal opacity-60">{y}</span>
          </span>
        </div>
        <div className="grid grid-cols-7 border-b border-black/10 text-center text-[11px] font-semibold text-black/40 dark:border-white/10 dark:text-white/40">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6">
          {days.map((d, i) => {
            const inMonth = d.getMonth() === m
            const isToday = d.toDateString() === new Date().toDateString()
            const isSel = d.toDateString() === selected.toDateString()
            const evs = eventsByDay.get(d.toDateString()) ?? []
            return (
              <button
                key={i}
                onClick={() => setSelected(d)}
                className={`flex flex-col items-stretch gap-0.5 overflow-hidden border-b border-r border-black/5 p-1 text-left align-top dark:border-white/5 ${inMonth ? '' : 'opacity-35'} ${isSel ? 'bg-blue-500/10 dark:bg-blue-400/10' : ''}`}
              >
                <span className="mx-auto flex h-5 w-5 items-center justify-center rounded-full text-[11.5px] font-semibold">
                  {isToday ? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white">{d.getDate()}</span> : d.getDate()}
                </span>
                {evs.slice(0, 3).map((e) => {
                  const color = seed.calendars.find((c) => c.id === e.calId)?.color ?? '#0A84FF'
                  return (
                    <span key={e.id} className="truncate rounded px-1 text-[10px] font-medium text-white" style={{ background: color }}>
                      {e.allDay ? '' : `${new Date(e.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/, '')} `}
                      {e.title}
                    </span>
                  )
                })}
                {evs.length > 3 && <span className="text-[10px] text-black/40 dark:text-white/40">+{evs.length - 3} more</span>}
              </button>
            )
          })}
        </div>
        <div className="max-h-32 shrink-0 overflow-y-auto border-t border-black/10 p-2 dark:border-white/10">
          <div className="mb-1 text-[11px] font-semibold text-black/40 dark:text-white/40">
            {selected.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          {selectedEvents.length === 0 && <div className="text-black/35 dark:text-white/35">No events</div>}
          {selectedEvents.map((e) => {
            const color = seed.calendars.find((c) => c.id === e.calId)?.color ?? '#0A84FF'
            return (
              <div key={e.id} className="flex items-center gap-2 py-0.5 select-text">
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                <span className="w-28 shrink-0 tabular-nums opacity-60">
                  {e.allDay ? 'all-day' : `${fmt(e.start)} – ${fmt(e.end)}`}
                </span>
                <span className="truncate font-medium">{e.title}</span>
                {e.location && <span className="truncate opacity-50">· {e.location}</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const fmt = (t: number) => new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

export default {
  id: 'calendar',
  name: 'Calendar',
  icon: { from: '#FFFFFF', to: '#E5E5EA', Icon: CalendarGlyph, glyphColor: '#FF3B30' },
  component: CalendarApp,
  defaultSize: { w: 1020, h: 660 },
  minSize: { w: 640, h: 440 },
  category: 'Productivity & Finance',
  keywords: ['events', 'schedule', 'month'],
  singleton: true,
} satisfies AppDefinition

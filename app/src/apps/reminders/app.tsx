import { useMemo, useState } from 'react'
import { Check, Flag, Plus, Circle } from 'lucide-react'
import { remindersSeed } from './data'
import type { AppDefinition, AppWindowProps } from '@/system/types'
import { ListChecks } from 'lucide-react'

interface Rem { id: string; listId: string; title: string; notes: string; due: number; flagged: boolean; completed: boolean }
interface List { id: string; name: string; color: string; glyph: string }

const seed = remindersSeed as { lists: List[]; reminders: Rem[] }
const DAY = 86_400_000

const dayLabel = (due: number) => {
  const d = new Date(due)
  const today = new Date()
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = Math.round((startOfDay(d) - startOfDay(today)) / DAY)
  if (diff < 0) return { text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), overdue: true }
  if (diff === 0) return { text: 'Today', overdue: false }
  if (diff === 1) return { text: 'Tomorrow', overdue: false }
  return { text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), overdue: false }
}

function Reminders({ payload }: AppWindowProps) {
  const [reminders, setReminders] = useState<Rem[]>(() => seed.reminders.map((r) => ({ ...r }) as Rem))
  const [view, setView] = useState<string>((payload?.listId as string) ?? seed.lists[0]?.id ?? 'personal')
  const [draft, setDraft] = useState('')

  const lists = seed.lists
  const activeList = lists.find((l) => l.id === view)
  const visible = useMemo(() => {
    if (view === 'today') return reminders.filter((r) => !r.completed && r.due < Date.now() + DAY)
    if (view === 'flagged') return reminders.filter((r) => r.flagged)
    if (view === 'done') return reminders.filter((r) => r.completed)
    return reminders.filter((r) => r.listId === view)
  }, [reminders, view])

  const toggle = (id: string) =>
    setReminders((all) => all.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)))
  const toggleFlag = (id: string) =>
    setReminders((all) => all.map((r) => (r.id === id ? { ...r, flagged: !r.flagged } : r)))
  const add = () => {
    const title = draft.trim()
    if (!title || !activeList) return
    setReminders((all) => [
      { id: `rem-${Date.now().toString(36)}`, listId: activeList.id, title, notes: '', due: Date.now() + DAY, flagged: false, completed: false },
      ...all,
    ])
    setDraft('')
  }

  const countOpen = (id: string) => reminders.filter((r) => r.listId === id && !r.completed).length

  return (
    <div className="flex h-full text-[13px]">
      <div className="glass-thin w-44 shrink-0 border-r border-black/10 p-2 dark:border-white/10">
        <div className="space-y-0.5">
          <SmartList id="today" label="Today" icon={<Circle size={14} className="fill-sky-500 text-sky-500" />} count={reminders.filter((r) => !r.completed && r.due < Date.now() + DAY).length} view={view} setView={setView} />
          <SmartList id="flagged" label="Flagged" icon={<Flag size={13} className="fill-orange-400 text-orange-400" />} count={reminders.filter((r) => r.flagged && !r.completed).length} view={view} setView={setView} />
          <SmartList id="done" label="Completed" icon={<Check size={14} className="text-black/40 dark:text-white/40" />} count={reminders.filter((r) => r.completed).length} view={view} setView={setView} />
        </div>
        <div className="mt-3 mb-1 px-2 text-[11px] font-semibold text-black/40 dark:text-white/40">My Lists</div>
        <div className="space-y-0.5">
          {lists.map((l) => (
            <SmartList key={l.id} id={l.id} label={l.name} icon={<Circle size={14} className="fill-current" style={{}} />} color={l.color} count={countOpen(l.id)} view={view} setView={setView} />
          ))}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 items-center justify-between border-b border-black/10 px-4 dark:border-white/10">
          <span className="text-lg font-bold" style={{ color: activeList?.color }}>{activeList?.name ?? (view === 'today' ? 'Today' : view === 'flagged' ? 'Flagged' : 'Completed')}</span>
          <span className="text-black/40 dark:text-white/40">{visible.filter((r) => !r.completed).length}</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
          {visible.map((r) => {
            const due = dayLabel(r.due)
            return (
              <div key={r.id} className="group flex items-start gap-3 border-b border-black/5 py-2.5 dark:border-white/5">
                <button
                  onClick={() => toggle(r.id)}
                  className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                    r.completed ? 'border-transparent' : 'border-black/25 dark:border-white/30'
                  }`}
                  style={r.completed ? { background: activeList?.color ?? '#0A84FF' } : undefined}
                >
                  {r.completed && <Check size={11} className="text-white" strokeWidth={3.5} />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className={`${r.completed ? 'line-through opacity-40' : ''}`}>{r.title}</div>
                  {r.notes && <div className="text-[12px] text-black/45 dark:text-white/45">{r.notes}</div>}
                  {r.due ? (
                    <div className={`text-[11.5px] ${due.overdue && !r.completed ? 'font-medium text-red-500' : 'text-black/40 dark:text-white/40'}`}>
                      {due.overdue && 'Overdue · '}{due.text}
                    </div>
                  ) : null}
                </div>
                <button
                  onClick={() => toggleFlag(r.id)}
                  className={`rounded p-1 opacity-0 group-hover:opacity-100 ${r.flagged ? 'opacity-100' : ''}`}
                  title="Flag"
                >
                  <Flag size={14} className={r.flagged ? 'fill-orange-400 text-orange-400' : 'text-black/35 dark:text-white/35'} />
                </button>
              </div>
            )
          })}
          {visible.length === 0 && <div className="grid h-40 place-items-center text-black/30 dark:text-white/30">No Reminders</div>}
        </div>
        {activeList && (
          <div className="flex items-center gap-2 border-t border-black/10 px-4 py-2.5 dark:border-white/10">
            <Plus size={16} className="text-black/35 dark:text-white/35" />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
              placeholder={`Add a reminder to ${activeList.name}…`}
              className="w-full bg-transparent outline-none select-text"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function SmartList({ id, label, icon, color, count, view, setView }: {
  id: string; label: string; icon: React.ReactNode; color?: string; count: number; view: string; setView: (v: string) => void
}) {
  return (
    <button
      onClick={() => setView(id)}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1 ${view === id ? 'bg-black/10 dark:bg-white/15' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
    >
      <span style={color ? { color } : undefined}>{icon}</span>
      <span className="flex-1 truncate text-left">{label}</span>
      <span className="text-[11px] text-black/35 dark:text-white/35">{count}</span>
    </button>
  )
}

export default {
  id: 'reminders',
  name: 'Reminders',
  icon: { from: '#FF9F6B', to: '#F74F9E', Icon: ListChecks },
  component: Reminders,
  defaultSize: { w: 860, h: 600 },
  minSize: { w: 480, h: 360 },
  category: 'Productivity & Finance',
  keywords: ['todo', 'tasks', 'checklist'],
} satisfies AppDefinition

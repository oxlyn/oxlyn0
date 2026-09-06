import { useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { AppDefinition, AppWindowProps } from '@/system/types'
import { StickyNote } from 'lucide-react'

const COLORS = ['#FFF3A3', '#C8F7C5', '#FFD3E0', '#CDE4FF', '#E8D8FF']
type Note = { id: string; text: string; color: string; x: number; y: number }

function Stickies({ payload }: AppWindowProps) {
  const [notes, setNotes] = useState<Note[]>(() => [
    { id: 'n1', text: (payload?.text as string) ?? 'Ideas land here.\n\n— W', color: COLORS[0], x: 24, y: 16 },
    { id: 'n2', text: 'Ship the eval harness this week.', color: COLORS[1], x: 190, y: 120 },
  ])
  const [zCounter, setZ] = useState(10)
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null)

  const add = () => {
    const id = `n-${Date.now().toString(36)}`
    setNotes((all) => [...all, { id, text: '', color: COLORS[all.length % COLORS.length], x: 20 + all.length * 18, y: 16 + all.length * 14 }])
    setZ((z) => z + 1)
  }
  const remove = (id: string) => setNotes((all) => all.filter((n) => n.id !== id))
  const update = (id: string, patch: Partial<Note>) => setNotes((all) => all.map((n) => (n.id === id ? { ...n, ...patch } : n)))

  return (
    <div className="relative h-full overflow-hidden bg-[#c9c9ce]/40 dark:bg-black/25">
      {notes.map((n) => (
        <div
          key={n.id}
          className="absolute flex h-44 w-44 flex-col rounded-md text-[12.5px] shadow-lg ring-1 ring-black/10"
          style={{ background: n.color, left: n.x, top: n.y, zIndex: n.id === drag.current?.id ? zCounter : 1 }}
          onPointerDown={() => setZ((z) => z + 1)}
        >
          <div
            className="flex h-6 shrink-0 cursor-move items-center justify-end gap-1 px-1.5 opacity-40"
            onPointerDown={(e) => {
              drag.current = { id: n.id, dx: e.clientX - n.x, dy: e.clientY - n.y }
              ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => {
              const d = drag.current
              if (d && d.id === n.id)
                update(n.id, { x: Math.max(0, e.clientX - d.dx), y: Math.max(0, e.clientY - d.dy) })
            }}
            onPointerUp={() => (drag.current = null)}
          >
            <button onClick={() => remove(n.id)} className="rounded p-0.5 hover:bg-black/10" title="Delete">
              <X size={11} />
            </button>
          </div>
          <textarea
            value={n.text}
            onChange={(e) => update(n.id, { text: e.target.value })}
            placeholder="…"
            className="min-h-0 flex-1 resize-none bg-transparent px-2.5 pb-2 outline-none select-text"
            style={{ color: '#3a3200' }}
          />
        </div>
      ))}
      <button
        onClick={add}
        className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-black/60 shadow ring-1 ring-black/10 hover:bg-white dark:bg-white/15 dark:text-white/80"
        title="New Sticky"
      >
        <Plus size={15} />
      </button>
    </div>
  )
}

export default {
  id: 'stickies',
  name: 'Stickies',
  icon: { from: '#FFF39A', to: '#FFD60A', Icon: StickyNote, glyphColor: '#6B5E00' },
  component: Stickies,
  defaultSize: { w: 420, h: 380 },
  minSize: { w: 340, h: 300 },
  category: 'Utilities',
  keywords: ['notes', 'sticky', 'memo'],
} satisfies AppDefinition

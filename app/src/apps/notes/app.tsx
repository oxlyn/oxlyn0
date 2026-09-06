import { useEffect, useMemo, useRef, useState } from 'react'
import { Pin, PinOff, SquarePen, Trash2, Tag } from 'lucide-react'
import { NOTE_FOLDERS, notePreview, noteTitle, useNotes, type NoteFolder } from '@/system/stores/notes'
import type { AppDefinition, AppWindowProps } from '@/system/types'
import { NotebookPen } from 'lucide-react'

const TAGS = ['work', 'personal'] as const

function Notes({ payload }: AppWindowProps) {
  const notes = useNotes((s) => s.notes)
  const create = useNotes((s) => s.create)
  const setHtml = useNotes((s) => s.setHtml)
  const togglePin = useNotes((s) => s.togglePin)
  const toggleTag = useNotes((s) => s.toggleTag)
  const softDelete = useNotes((s) => s.softDelete)
  const [folder, setFolder] = useState<NoteFolder | 'all'>((payload?.folder as NoteFolder) ?? 'notes')
  const [tag, setTag] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>((payload?.noteId as string) ?? null)
  const editorRef = useRef<HTMLDivElement>(null)

  const visible = useMemo(() => {
    const list = notes.filter((n) => !n.deleted && (folder === 'all' || n.folder === folder) && (!tag || n.tags.includes(tag)))
    return [...list.filter((n) => n.pinned), ...list.filter((n) => !n.pinned)].sort((a, b) => b.modified - a.modified)
  }, [notes, folder, tag])

  const active = notes.find((n) => n.id === activeId && !n.deleted) ?? visible[0] ?? null

  useEffect(() => {
    if (active && editorRef.current && editorRef.current.innerHTML !== active.html) {
      editorRef.current.innerHTML = active.html
    }
  }, [active?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const saveTimer = useRef<number | undefined>(undefined)
  const onInput = () => {
    if (!active || !editorRef.current) return
    const html = editorRef.current.innerHTML
    window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => setHtml(active.id, html), 300)
  }

  const newNote = () => {
    const id = create(folder === 'all' ? 'notes' : folder)
    setActiveId(id)
  }

  return (
    <div className="flex h-full text-[13px]">
      {/* folders */}
      <div className="glass-thin w-40 shrink-0 border-r border-black/10 p-2 dark:border-white/10">
        <div className="px-2 pt-1 pb-1 text-[11px] font-semibold text-black/40 dark:text-white/40">iCloud</div>
        {NOTE_FOLDERS.map((f) => {
          const count = notes.filter((n) => !n.deleted && n.folder === f.id).length
          return (
            <button
              key={f.id}
              onClick={() => { setFolder(f.id); setTag(null) }}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-left ${
                folder === f.id ? 'bg-yellow-300/50 dark:bg-yellow-500/25' : 'hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <span className="truncate">{f.name}</span>
              <span className="text-black/35 dark:text-white/35">{count}</span>
            </button>
          )
        })}
        <div className="mt-3 px-2 pb-1 text-[11px] font-semibold text-black/40 dark:text-white/40">Tags</div>
        {TAGS.map((t) => (
          <button
            key={t}
            onClick={() => setTag(tag === t ? null : t)}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left ${
              tag === t ? 'bg-black/10 dark:bg-white/15' : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <Tag size={13} className={t === 'work' ? 'text-blue-500' : 'text-pink-500'} />
            {t}
          </button>
        ))}
      </div>
      {/* list */}
      <div className="w-60 shrink-0 border-r border-black/10 bg-black/[0.015] dark:border-white/10 dark:bg-white/[0.02]">
        <div className="flex h-11 items-center justify-between border-b border-black/10 px-3 dark:border-white/10">
          <span className="font-semibold">{NOTE_FOLDERS.find((f) => f.id === folder)?.name ?? 'All Notes'}</span>
          <button className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10" onClick={newNote} title="New Note">
            <SquarePen size={16} />
          </button>
        </div>
        <div className="h-[calc(100%-2.75rem)] overflow-y-auto">
          {visible.map((n) => (
            <button
              key={n.id}
              onClick={() => setActiveId(n.id)}
              className={`block w-full border-b border-black/5 px-3 py-2 text-left dark:border-white/5 ${
                active?.id === n.id ? 'bg-yellow-300/40 dark:bg-yellow-500/20' : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-1 font-semibold">
                {n.pinned && <Pin size={11} className="shrink-0 fill-current" />}
                <span className="truncate">{noteTitle(n)}</span>
              </div>
              <div className="mt-0.5 flex gap-2 text-[11px] text-black/45 dark:text-white/45">
                <span className="truncate">
                  {new Date(n.modified).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {notePreview(n) || 'No additional text'}
                </span>
              </div>
            </button>
          ))}
          {visible.length === 0 && <div className="p-6 text-center text-black/35 dark:text-white/35">No Notes</div>}
        </div>
      </div>
      {/* editor */}
      <div className="flex min-w-0 flex-1 flex-col">
        {active ? (
          <>
            <div className="flex h-11 items-center justify-end gap-1 border-b border-black/10 px-3 dark:border-white/10">
              <button className="rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/10" onClick={() => togglePin(active.id)} title="Pin">
                {active.pinned ? <PinOff size={15} /> : <Pin size={15} />}
              </button>
              <button className="rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/10" onClick={() => { softDelete(active.id); setActiveId(null) }} title="Delete">
                <Trash2 size={15} />
              </button>
              {TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTag(active.id, t)}
                  className={`rounded-full px-2 py-0.5 text-[11px] ring-1 ${
                    active.tags.includes(t)
                      ? 'bg-black/10 ring-black/20 dark:bg-white/15 dark:ring-white/25'
                      : 'ring-black/15 hover:bg-black/5 dark:ring-white/20 dark:hover:bg-white/10'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={onInput}
              className="rich min-h-0 flex-1 overflow-y-auto px-6 py-4 outline-none select-text"
              spellCheck={false}
            />
          </>
        ) : (
          <div className="grid h-full place-items-center text-black/30 dark:text-white/30">
            <SquarePen size={40} strokeWidth={1.2} />
          </div>
        )}
      </div>
    </div>
  )
}

export default {
  id: 'notes',
  name: 'Notes',
  icon: { from: '#FFE57A', to: '#FFC600', Icon: NotebookPen },
  component: Notes,
  defaultSize: { w: 960, h: 620 },
  minSize: { w: 520, h: 360 },
  category: 'Productivity & Finance',
  keywords: ['note', 'write', 'memo'],
} satisfies AppDefinition

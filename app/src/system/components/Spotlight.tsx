import { useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { apps } from '../registry'
import { useWindows } from '../stores/windows'
import { useNotes, noteTitle } from '../stores/notes'
import { AppIcon } from '../AppIcon'

type Result =
  | { kind: 'app'; id: string; name: string; sub: string; appId: string }
  | { kind: 'note'; id: string; name: string; sub: string }

export function Spotlight({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const open = useWindows((s) => s.open)
  const notes = useNotes((s) => s.notes)

  const results = useMemo<Result[]>(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return []
    const appHits: Result[] = apps
      .filter((a) => a.name.toLowerCase().includes(needle) || a.keywords?.some((k) => k.startsWith(needle)))
      .slice(0, 6)
      .map((a) => ({ kind: 'app', id: `a-${a.id}`, name: a.name, sub: a.category ?? 'Application', appId: a.id }))
    const noteHits: Result[] = notes
      .filter((n) => !n.deleted && (noteTitle(n).toLowerCase().includes(needle) || n.html.toLowerCase().includes(needle)))
      .slice(0, 4)
      .map((n) => ({ kind: 'note', id: `n-${n.id}`, name: noteTitle(n), sub: 'Notes' }))
    return [...appHits, ...noteHits]
  }, [q, notes])

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => { setSel(0) }, [q])

  const activate = (r: Result) => {
    if (r.kind === 'app') open(r.appId)
    else open('notes', { noteId: r.id.slice(2) })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-70" onPointerDown={onClose}>
      <div
        className="glass mx-auto mt-[18vh] w-[560px] max-w-[92vw] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/15 dark:ring-white/15"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <Search size={20} className="shrink-0 text-black/45 dark:text-white/50" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose()
              if (e.key === 'Enter' && results[sel]) activate(results[sel])
              if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)) }
              if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
            }}
            placeholder="Spotlight Search"
            className="w-full bg-transparent text-xl outline-none placeholder:text-black/35 dark:placeholder:text-white/35"
          />
        </div>
        {results.length > 0 && (
          <div className="border-t border-black/10 p-1.5 dark:border-white/10">
            {results.map((r, i) => (
              <button
                key={r.id}
                className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left ${i === sel ? 'bg-blue-500 text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                onMouseEnter={() => setSel(i)}
                onClick={() => activate(r)}
              >
                {r.kind === 'app' ? (
                  <AppIcon icon={apps.find((a) => a.id === r.appId)!.icon} size={26} />
                ) : (
                  <div className="h-[26px] w-[26px]" />
                )}
                <span className="flex-1 truncate text-sm font-medium">{r.name}</span>
                <span className={`text-xs ${i === sel ? 'text-white/80' : 'text-black/40 dark:text-white/40'}`}>{r.sub}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

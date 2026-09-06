import { useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Folder, LayoutGrid, List, FolderPlus } from 'lucide-react'
import { childrenOf, pathOf, useFs } from '@/system/stores/fs'
import { useWindows } from '@/system/stores/windows'
import type { AppDefinition, AppWindowProps } from '@/system/types'
import { Smile } from 'lucide-react'

const FAVORITES: { id: string; label: string }[] = [
  { id: 'desktop', label: 'Desktop' },
  { id: 'documents', label: 'Documents' },
  { id: 'downloads', label: 'Downloads' },
  { id: 'pictures', label: 'Pictures' },
  { id: 'music', label: 'Music' },
  { id: 'applications', label: 'Applications' },
]

function Finder({ winId, payload }: AppWindowProps) {
  const initial = (payload?.folder as string) ?? 'desktop'
  const [history, setHistory] = useState<string[]>([initial])
  const [cursor, setCursor] = useState(0)
  const [view, setView] = useState<'icons' | 'list'>('icons')
  const [selected, setSelected] = useState<string | null>(null)
  const open = useWindows((s) => s.open)
  const nodes = useFs((s) => s.nodes)
  const create = useFs((s) => s.create)
  const children = useMemo(() => childrenOf(nodes, history[cursor]), [nodes, history, cursor])
  const path = useMemo(() => pathOf(nodes, history[cursor]), [nodes, history, cursor])
  const navSeq = useRef(0)

  const navigate = (id: string) => {
    setHistory((h) => [...h.slice(0, cursor + 1), id])
    setCursor((c) => c + 1)
    setSelected(null)
  }

  const activate = (node: { id: string; kind: 'folder' | 'file' }) => {
    if (node.kind === 'folder') navigate(node.id)
    else open('preview', { nodeId: node.id })
  }

  const newFolder = () => {
    const id = create({ parentId: history[cursor], name: 'untitled folder', kind: 'folder' })
    setSelected(id)
    navSeq.current++
  }

  const title = path[path.length - 1]?.name ?? 'Finder'

  const rows = useMemo(() => children, [children])

  return (
    <div className="flex h-full">
      {/* sidebar */}
      <div className="glass-thin w-44 shrink-0 border-r border-black/10 p-2 text-[13px] dark:border-white/10">
        <div className="px-2 pt-1 pb-1 text-[11px] font-semibold text-black/40 dark:text-white/40">Favorites</div>
        {FAVORITES.map((f) => (
          <button
            key={f.id}
            onClick={() => navigate(f.id)}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left ${
              history[cursor] === f.id ? 'bg-black/10 dark:bg-white/15' : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <Folder size={15} className="fill-sky-400 text-sky-500" strokeWidth={1} />
            <span className="truncate">{f.label}</span>
          </button>
        ))}
      </div>
      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-black/10 px-3 dark:border-white/10">
          <button
            disabled={cursor === 0}
            className="rounded p-1 disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/10"
            onClick={() => setCursor((c) => Math.max(0, c - 1))}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            disabled={cursor >= history.length - 1}
            className="rounded p-1 disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/10"
            onClick={() => setCursor((c) => Math.min(history.length - 1, c + 1))}
          >
            <ChevronRight size={18} />
          </button>
          <div className="ml-1 flex-1 truncate text-[13px] font-semibold">{title}</div>
          <button className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10" onClick={newFolder} title="New Folder">
            <FolderPlus size={16} />
          </button>
          <button
            className={`rounded p-1 ${view === 'icons' ? 'bg-black/10 dark:bg-white/15' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
            onClick={() => setView('icons')}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={`rounded p-1 ${view === 'list' ? 'bg-black/10 dark:bg-white/15' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
            onClick={() => setView('list')}
          >
            <List size={16} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3" onPointerDown={() => setSelected(null)}>
          {rows.length === 0 && <div className="grid h-full place-items-center text-sm text-black/35 dark:text-white/35">Empty folder</div>}
          {view === 'icons' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-1">
              {rows.map((node) => (
                <button
                  key={node.id}
                  className={`flex flex-col items-center gap-1 rounded-lg p-2 ${selected === node.id ? 'bg-blue-500/15 ring-1 ring-blue-400/50' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                  onPointerDown={(e) => { e.stopPropagation(); setSelected(node.id) }}
                  onDoubleClick={() => activate(node)}
                >
                  {node.kind === 'folder' ? (
                    <Folder size={44} className="fill-sky-400 text-sky-500" strokeWidth={1} />
                  ) : (
                    <FileThumb mime={node.mime} name={node.name} />
                  )}
                  <span className="line-clamp-2 text-center text-[11.5px] leading-tight">{node.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-black/40 dark:text-white/40">
                  <th className="py-1 font-medium">Name</th>
                  <th className="py-1 font-medium">Kind</th>
                  <th className="py-1 font-medium">Size</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((node) => (
                  <tr
                    key={node.id}
                    className={`cursor-default ${selected === node.id ? 'bg-blue-500 text-white' : ''}`}
                    onPointerDown={(e) => { e.stopPropagation(); setSelected(node.id) }}
                    onDoubleClick={() => activate(node)}
                  >
                    <td className="py-0.5">{node.name}</td>
                    <td className="py-0.5 opacity-60">{node.kind === 'folder' ? 'Folder' : node.mime ?? 'File'}</td>
                    <td className="py-0.5 opacity-60">{node.content ? `${Math.max(1, Math.round(node.content.length / 102.4) / 10)} KB` : '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function FileThumb({ mime, name }: { mime?: string; name: string }) {
  if (mime === 'application/pdf')
    return (
      <div className="flex h-12 w-10 flex-col overflow-hidden rounded-sm bg-white shadow ring-1 ring-black/15 dark:bg-neutral-200">
        <div className="h-1.5 w-full shrink-0 bg-red-500" />
        <div className="space-y-0.5 p-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-0.5 rounded bg-black/20" />
          ))}
        </div>
      </div>
    )
  if (name.endsWith('.jpg') || name.endsWith('.png') || name.endsWith('.svg'))
    return <img src={`${import.meta.env.BASE_URL}${name}`} alt="" className="h-11 w-11 rounded object-cover ring-1 ring-black/10" />
  return (
    <div className="flex h-12 w-10 flex-col overflow-hidden rounded-sm bg-white shadow ring-1 ring-black/15 dark:bg-neutral-200">
      <div className="space-y-0.5 p-1.5 pt-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-0.5 rounded bg-black/15" />
        ))}
      </div>
    </div>
  )
}

export default {
  id: 'finder',
  name: 'Finder',
  icon: { from: '#5EC9F8', to: '#1463E8', Icon: Smile },
  component: Finder,
  defaultSize: { w: 980, h: 620 },
  minSize: { w: 560, h: 360 },
  category: 'Utilities',
  keywords: ['files', 'folders', 'documents', 'downloads'],
} satisfies AppDefinition

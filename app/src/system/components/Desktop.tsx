import { useMemo, useState } from 'react'
import { Folder, FileText, FileArchive, File } from 'lucide-react'
import { childrenOf, useFs } from '../stores/fs'
import { useWindows } from '../stores/windows'
import { useSystem, currentWallpaper } from '../stores/system'
import { apps, useAppsReady } from '../registry'
import { AppIcon } from '../AppIcon'

function FileGlyph({ mime, kind }: { mime?: string; kind: 'folder' | 'file' }) {
  if (kind === 'folder')
    return (
      <span className="relative inline-block">
        <Folder size={52} className="fill-sky-400 text-sky-500 drop-shadow" strokeWidth={1} />
      </span>
    )
  const cls = 'text-white drop-shadow'
  if (mime === 'application/zip') return <FileArchive size={46} className={cls} strokeWidth={1.2} />
  if (mime?.startsWith('text/')) return <FileText size={46} className={cls} strokeWidth={1.2} />
  return <File size={46} className={cls} strokeWidth={1.2} />
}

export function Desktop() {
  // Subscribe so a wallpaper switch re-renders the desktop — currentWallpaper() is not reactive.
  useSystem((s) => s.wallpaper)
  const wp = currentWallpaper()
  const nodes = useFs((s) => s.nodes)
  const children = useMemo(() => childrenOf(nodes, 'desktop'), [nodes])
  const open = useWindows((s) => s.open)
  const focusId = useWindows((s) => s.focusId)
  const ready = useAppsReady((s) => s.ready)
  // App shortcuts opt in via `onDesktop: true` on their AppDefinition.
  const shortcuts = useMemo(() => (ready ? apps.filter((a) => a.onDesktop) : []), [ready])
  const [selected, setSelected] = useState<string | null>(null)

  const activate = (id: string, kind: 'folder' | 'file') => {
    if (kind === 'folder') open('finder', { folder: id })
    else open('preview', { nodeId: id })
  }

  return (
    <div className="fixed inset-0 overflow-hidden" onPointerDown={() => setSelected(null)}>
      <img key={wp.url} src={wp.url} alt="" className="fade-in absolute inset-0 h-full w-full object-cover" draggable={false} />
      {/* desktop icons — top-right column, macOS style (hidden during focus mode).
          App shortcuts (`onDesktop: true`) come first, then desktop files. */}
      {!focusId && (
        <div className="absolute top-10 right-3 flex flex-col items-end gap-2">
          {shortcuts.map((app) => (
            <button
              key={app.id}
              className={`group flex w-24 flex-col items-center gap-0.5 rounded-lg p-1.5 ${selected === `app:${app.id}` ? 'bg-white/20 ring-1 ring-white/40' : ''}`}
              onPointerDown={(e) => { e.stopPropagation(); setSelected(`app:${app.id}`) }}
              onDoubleClick={() => open(app.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(app.id) }
              }}
              aria-label={`App: ${app.name}`}
            >
              <AppIcon icon={app.icon} size={46} />
              <span className="max-w-full truncate rounded px-1 text-[12px] font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                {app.name}
              </span>
            </button>
          ))}
          {children.map((node) => (
            <button
              key={node.id}
              className={`group flex w-24 flex-col items-center gap-0.5 rounded-lg p-1.5 ${selected === node.id ? 'bg-white/20 ring-1 ring-white/40' : ''}`}
              onPointerDown={(e) => { e.stopPropagation(); setSelected(node.id) }}
              onDoubleClick={() => activate(node.id, node.kind)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(node.id, node.kind) }
              }}
              aria-label={`${node.kind === 'folder' ? 'Folder' : 'File'}: ${node.name}`}
            >
              <FileGlyph mime={node.mime} kind={node.kind} />
              <span className="max-w-full truncate rounded px-1 text-[12px] font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                {node.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

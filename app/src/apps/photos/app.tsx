import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Heart, Grid2x2, Info, Minus, Plus, X } from 'lucide-react'
import { photosSeed } from './data'
import type { AppDefinition } from '@/system/types'
import { Flower2 } from 'lucide-react'

interface Photo { id: string; fsId: string; name: string; url: string; takenAt: string; favorite: boolean; deleted: boolean; w: number; h: number }
const seed = photosSeed as Photo[]

function Photos() {
  const [photos, setPhotos] = useState<Photo[]>(() => seed.map((p) => ({ ...p }) as Photo))
  const [album, setAlbum] = useState<'library' | 'favorites'>('library')
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const [zoom, setZoom] = useState(3)

  const list = useMemo(
    () => (album === 'favorites' ? photos.filter((p) => p.favorite) : photos),
    [photos, album],
  )
  const open = openIdx !== null ? list[openIdx] : null
  const toggleFav = (id: string) => setPhotos((all) => all.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p)))

  const cols = ['grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5'][zoom]

  return (
    <div className="flex h-full text-[13px]">
      <div className="glass-thin w-44 shrink-0 border-r border-black/10 p-2 dark:border-white/10">
        <div className="px-2 pt-1 pb-1 text-[11px] font-semibold text-black/40 dark:text-white/40">iCloud</div>
        {(
          [
            ['library', 'Library', photos.length],
            ['favorites', 'Favorites', photos.filter((p) => p.favorite).length],
          ] as const
        ).map(([id, label, n]) => (
          <button
            key={id}
            onClick={() => { setAlbum(id); setOpenIdx(null) }}
            className={`flex w-full items-center justify-between rounded-md px-2 py-1 ${album === id ? 'bg-blue-500 text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
            <span className="flex items-center gap-2">
              {id === 'favorites' ? <Heart size={13} /> : <Grid2x2 size={13} />} {label}
            </span>
            <span className="text-[11px] opacity-60">{n}</span>
          </button>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        {open ? (
          <>
            <div className="flex h-11 shrink-0 items-center gap-2 border-b border-black/10 px-3 dark:border-white/10">
              <button className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setOpenIdx(null)}><ChevronLeft size={18} /></button>
              <span className="truncate font-medium">{open.name}</span>
              <span className="text-black/40 dark:text-white/40">
                {new Date(open.takenAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <button className="rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/10" onClick={() => toggleFav(open.id)}>
                  <Heart size={15} className={open.favorite ? 'fill-red-500 text-red-500' : ''} />
                </button>
                <button className="rounded p-1.5 opacity-40" title="Info"><Info size={15} /></button>
              </div>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black/85 p-4">
              <button
                className="absolute left-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30"
                onClick={() => setOpenIdx((i) => ((i ?? 0) - 1 + list.length) % list.length)}
              >
                <ChevronLeft size={18} />
              </button>
              <img src={open.url} alt={open.name} className="max-h-full max-w-full rounded shadow-2xl select-text" />
              <button
                className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30"
                onClick={() => setOpenIdx((i) => ((i ?? 0) + 1) % list.length)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-black/10 px-3 dark:border-white/10">
              <span className="font-semibold">{album === 'favorites' ? 'Favorites' : 'Library'}</span>
              <div className="flex items-center gap-1">
                <button className="rounded p-1 hover:bg-black/5 disabled:opacity-30 dark:hover:bg-white/10" disabled={zoom === 0} onClick={() => setZoom((z) => Math.max(0, z - 1))}><Minus size={14} /></button>
                <button className="rounded p-1 hover:bg-black/5 disabled:opacity-30 dark:hover:bg-white/10" disabled={zoom === 3} onClick={() => setZoom((z) => Math.min(3, z + 1))}><Plus size={14} /></button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              <div className={`grid ${cols} gap-1.5`}>
                {list.map((p, i) => (
                  <button key={p.id} onClick={() => setOpenIdx(i)} className="group relative overflow-hidden rounded-md">
                    <img src={p.url} alt={p.name} className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-[1.02]" loading="lazy" />
                    {p.favorite && <Heart size={13} className="absolute right-1.5 top-1.5 fill-red-500 text-red-500 drop-shadow" />}
                  </button>
                ))}
              </div>
              {list.length === 0 && (
                <div className="grid h-40 place-items-center text-black/30 dark:text-white/30">
                  <Flower2 size={36} strokeWidth={1.2} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default {
  id: 'photos',
  name: 'Photos',
  icon: { from: '#FFFFFF', to: '#E5E5EA', Icon: Flower2, glyphColor: '#FF5FA2' },
  component: Photos,
  defaultSize: { w: 1060, h: 680 },
  minSize: { w: 640, h: 440 },
  category: 'Creativity',
  keywords: ['pictures', 'skylar', 'album', 'gallery'],
} satisfies AppDefinition

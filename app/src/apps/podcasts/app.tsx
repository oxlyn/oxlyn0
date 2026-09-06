import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, Pause, Play } from 'lucide-react'
import { podcastsSeed } from './data'
import type { AppDefinition } from '@/system/types'
import { Podcast as PodcastGlyph } from 'lucide-react'

interface Show { id: string; title: string; host: string; desc: string; artwork: string; genre: string }
interface Episode { id: string; showId: string; title: string; desc: string; src: string; date: string; duration: number }
const seed = podcastsSeed as { shows: Show[]; episodes: Episode[] }

const fmt = (s: number) => (isFinite(s) && s > 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '--:--')
const dstr = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

function Podcasts() {
  const [showId, setShowId] = useState<string | null>(null)
  const [playing, setPlaying] = useState<{ epId: string; show: Show } | null>(null)
  const [paused, setPaused] = useState(false)
  const [pos, setPos] = useState(0)
  const [dur, setDur] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const show = useMemo(() => seed.shows.find((s) => s.id === showId) ?? null, [showId])
  const episodes = useMemo(() => seed.episodes.filter((e) => (show ? e.showId === show.id : true)), [show])

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onTime = () => setPos(a.currentTime)
    const onMeta = () => setDur(a.duration)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onMeta)
    return () => { a.removeEventListener('timeupdate', onTime); a.removeEventListener('loadedmetadata', onMeta) }
  }, [playing])

  const play = (ep: Episode, show: Show) => {
    if (playing?.epId === ep.id) {
      const a = audioRef.current!
      if (a.paused) { a.play(); setPaused(false) } else { a.pause(); setPaused(true) }
      return
    }
    setPlaying({ epId: ep.id, show })
    setPaused(false)
    setPos(0)
    setDur(0)
    setTimeout(() => audioRef.current?.play().catch(() => {}), 50)
  }

  return (
    <div className="flex h-full flex-col text-[13px]">
      <div className="flex min-h-0 flex-1">
        <div className="glass-thin w-40 shrink-0 border-r border-black/10 p-2 dark:border-white/10">
          <div className="px-2 pt-1 pb-1 text-[11px] font-semibold text-black/40 dark:text-white/40">Shows</div>
          <button
            onClick={() => setShowId(null)}
            className={`w-full rounded-md px-2 py-1 text-left ${!showId ? 'bg-purple-500/20 font-medium' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
            All Shows
          </button>
          {seed.shows.map((s) => (
            <button
              key={s.id}
              onClick={() => setShowId(s.id)}
              className={`w-full rounded-md px-2 py-1 text-left ${showId === s.id ? 'bg-purple-500/20 font-medium' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
            >
              <span className="block truncate">{s.title}</span>
              <span className="block truncate text-[11px] text-black/40 dark:text-white/40">{s.host}</span>
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {!show ? (
            <>
              <h1 className="mb-3 text-lg font-bold">Discover</h1>
              <div className="grid grid-cols-2 gap-4">
                {seed.shows.map((s) => (
                  <button key={s.id} onClick={() => setShowId(s.id)} className="group overflow-hidden rounded-xl text-left ring-1 ring-black/8 dark:ring-white/10">
                    <img src={s.artwork} alt={s.title} className="aspect-square w-full object-cover transition-transform group-hover:scale-[1.03]" />
                    <div className="p-3">
                      <div className="font-semibold">{s.title}</div>
                      <div className="text-[12px] text-black/50 dark:text-white/50">{s.host} · {s.genre}</div>
                      <div className="mt-1 line-clamp-2 text-[12px] text-black/45 dark:text-white/45">{s.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => setShowId(null)} className="mb-3 flex items-center gap-1 text-[12.5px] text-blue-500 hover:underline">
                <ChevronLeft size={14} /> All Shows
              </button>
              <div className="mb-4 flex items-center gap-4">
                <img src={show.artwork} alt={show.title} className="h-24 w-24 rounded-lg object-cover shadow" />
                <div>
                  <h1 className="text-lg font-bold">{show.title}</h1>
                  <div className="text-black/50 dark:text-white/50">{show.host}</div>
                  <p className="mt-1 max-w-md text-[12px] text-black/45 dark:text-white/45">{show.desc}</p>
                </div>
              </div>
              <div className="space-y-1">
                {episodes.map((ep) => (
                  <div key={ep.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-black/4 dark:hover:bg-white/5">
                    <button
                      onClick={() => play(ep, show)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-500 text-white hover:bg-purple-400"
                    >
                      {playing?.epId === ep.id && !paused ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
                    </button>
                    <div className="min-w-0 flex-1 select-text">
                      <div className="truncate font-medium">{ep.title}</div>
                      <div className="truncate text-[12px] text-black/50 dark:text-white/50">{ep.desc}</div>
                    </div>
                    <span className="shrink-0 text-[11.5px] text-black/40 dark:text-white/40">{dstr(ep.date)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      {playing && (
        <div className="flex h-14 shrink-0 items-center gap-3 border-t border-black/10 bg-black/[0.03] px-4 dark:border-white/10 dark:bg-white/[0.04]">
          <button onClick={() => playing && play(seed.episodes.find((e) => e.id === playing.epId)!, playing.show)} className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500 text-white">
            {paused ? <Play size={15} className="ml-0.5" /> : <Pause size={15} />}
          </button>
          <img src={playing.show.artwork} alt="" className="h-9 w-9 rounded object-cover" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-medium">{seed.episodes.find((e) => e.id === playing.epId)?.title}</div>
            <input
              type="range"
              min={0}
              max={dur || 100}
              value={pos}
              onChange={(e) => { const v = +e.target.value; if (audioRef.current) audioRef.current.currentTime = v; setPos(v) }}
              className="w-full accent-purple-500"
            />
          </div>
          <span className="text-[11px] tabular-nums text-black/45 dark:text-white/45">{fmt(pos)} / {fmt(dur)}</span>
        </div>
      )}
      <audio ref={audioRef} src={playing ? seed.episodes.find((e) => e.id === playing.epId)?.src : undefined} />
    </div>
  )
}

export default {
  id: 'podcasts',
  name: 'Podcasts',
  icon: { from: '#B150E2', to: '#7D2AE8', Icon: PodcastGlyph },
  component: Podcasts,
  defaultSize: { w: 980, h: 640 },
  minSize: { w: 560, h: 420 },
  category: 'Entertainment',
  keywords: ['shows', 'episodes', 'audio', 'listen'],
} satisfies AppDefinition

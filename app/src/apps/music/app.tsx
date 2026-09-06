import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronLeft,
  Disc3,
  ListMusic,
  Music2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react'
import type { AppDefinition, AppWindowProps } from '@/system/types'
import { tracksSeed } from './data'

type Track = (typeof tracksSeed)[number]

const ACCENT = '#FA2D55'

const PLAYLISTS = [
  { id: 'night-drive', name: 'Night Drive', trackIds: ['t1', 't4', 't2'] },
  { id: 'slow-mornings', name: 'Slow Mornings', trackIds: ['t2', 't3', 't4'] },
]

function fmtTime(s: number) {
  if (!isFinite(s) || s < 0) return '--:--'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

/** Animated equalizer glyph shown next to the row that is currently playing. */
function Eq({ active }: { active: boolean }) {
  return (
    <span className="flex h-3.5 w-3.5 items-end justify-center gap-[2px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="eq-bar w-[2.5px] rounded-full bg-current"
          style={{ height: '100%', animationDelay: `${i * 0.18}s`, animationPlayState: active ? 'running' : 'paused' }}
        />
      ))}
    </span>
  )
}

/** Title that scrolls like the macOS Music "now playing" marquee when live. */
function Marquee({ text, active }: { text: string; active: boolean }) {
  const long = text.length > 20
  if (!long || !active) return <div className="truncate font-semibold">{text}</div>
  return (
    <div className="overflow-hidden font-semibold">
      <div className="marquee-x whitespace-nowrap">{`${text}   ·   ${text}   ·   `}</div>
    </div>
  )
}

function TrackTable({
  tracks,
  durations,
  currentId,
  playing,
  onPlay,
  showAlbum = true,
}: {
  tracks: Track[]
  durations: Record<string, number>
  currentId: string | null
  playing: boolean
  onPlay: (id: string) => void
  showAlbum?: boolean
}) {
  return (
    <div>
      <div
        className={`grid items-center gap-2 border-b border-black/10 px-2 pb-1.5 text-[11px] font-medium text-black/40 dark:border-white/10 dark:text-white/40 ${
          showAlbum ? 'grid-cols-[2.25rem_minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.4fr)_2.75rem]' : 'grid-cols-[2.25rem_minmax(0,2fr)_minmax(0,1.4fr)_2.75rem]'
        }`}
      >
        <span className="text-center">#</span>
        <span>Title</span>
        <span>Artist</span>
        {showAlbum && <span>Album</span>}
        <span className="text-right">Time</span>
      </div>
      {tracks.map((t, i) => {
        const isCurrent = currentId === t.id
        return (
          <button
            key={t.id}
            onClick={() => onPlay(t.id)}
            className={`grid w-full items-center gap-2 rounded-md px-2 py-1.5 text-left ${
              showAlbum ? 'grid-cols-[2.25rem_minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.4fr)_2.75rem]' : 'grid-cols-[2.25rem_minmax(0,2fr)_minmax(0,1.4fr)_2.75rem]'
            } ${isCurrent ? 'bg-black/[0.06] dark:bg-white/[0.09]' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <span className="grid h-3.5 place-items-center text-[11px] tabular-nums text-black/40 dark:text-white/40">
              {isCurrent ? <Eq active={playing} /> : i + 1}
            </span>
            <span className="flex min-w-0 items-center gap-2.5">
              <img src={t.artwork} alt="" className="h-8 w-8 shrink-0 rounded-[5px] shadow-sm" />
              <span className={`truncate font-medium ${isCurrent ? 'text-[#FA2D55] dark:text-[#FF6482]' : ''}`}>{t.title}</span>
            </span>
            <span className="truncate text-black/55 dark:text-white/55">{t.artist}</span>
            {showAlbum && <span className="truncate text-black/55 dark:text-white/55">{t.album}</span>}
            <span className="text-right text-[11px] tabular-nums text-black/40 dark:text-white/40">
              {fmtTime(durations[t.id] ?? 0)}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function Music({ payload }: AppWindowProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [nav, setNav] = useState<string>('listen') // 'listen' | 'albums' | 'songs' | 'pl-<id>'
  const [openAlbum, setOpenAlbum] = useState<string | null>(null)
  const [currentId, setCurrentId] = useState<string | null>((payload?.trackId as string) ?? null)
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [volume, setVolume] = useState(0.75)
  const [durations, setDurations] = useState<Record<string, number>>({})

  const current = tracksSeed.find((t) => t.id === currentId) ?? null
  const dur = current ? durations[current.id] ?? 0 : 0

  // Read real durations from audio metadata (preload only, one throwaway element per track).
  useEffect(() => {
    const probes: HTMLAudioElement[] = []
    tracksSeed.forEach((t) => {
      const a = new Audio()
      a.preload = 'metadata'
      a.src = t.src
      a.addEventListener('loadedmetadata', () => {
        if (isFinite(a.duration)) setDurations((d) => ({ ...d, [t.id]: a.duration }))
      })
      probes.push(a)
    })
    return () => probes.forEach((a) => a.removeAttribute('src'))
  }, [])

  // Drive the single <audio> element from state.
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    if (playing && current) a.play().catch(() => setPlaying(false))
    else a.pause()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, currentId])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  const albums = useMemo(() => {
    const map = new Map<string, { name: string; artist: string; genre: string; artwork: string; tracks: Track[] }>()
    tracksSeed.forEach((t) => {
      const a = map.get(t.album)
      if (a) a.tracks.push(t)
      else map.set(t.album, { name: t.album, artist: t.artist, genre: t.genre, artwork: t.artwork, tracks: [t] })
    })
    return [...map.values()]
  }, [])

  const playTrack = (id: string) => {
    if (id === currentId) setPlaying((p) => !p)
    else {
      setCurrentId(id)
      setElapsed(0)
      setPlaying(true)
    }
  }

  const step = (dir: 1 | -1) => {
    const idx = tracksSeed.findIndex((t) => t.id === currentId)
    const next = tracksSeed[(idx + dir + tracksSeed.length) % tracksSeed.length]
    setCurrentId(next.id)
    setElapsed(0)
    setPlaying(true)
  }

  const seek = (v: number) => {
    setElapsed(v)
    if (audioRef.current) audioRef.current.currentTime = v
  }

  const playlist = PLAYLISTS.find((p) => p.id === nav.slice(3))
  const playlistTracks = playlist
    ? playlist.trackIds.map((id) => tracksSeed.find((t) => t.id === id)).filter((t): t is Track => Boolean(t))
    : []
  const album = albums.find((a) => a.name === openAlbum)

  const title = album ? album.name : playlist ? playlist.name : nav === 'albums' ? 'Albums' : nav === 'songs' ? 'Songs' : 'Listen Now'

  return (
    <div className="flex h-full text-[13px]">
      <style>{`
        @keyframes music-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .marquee-x { animation: music-marquee 12s linear infinite }
        @keyframes music-eq { 0%,100% { transform: scaleY(.3) } 50% { transform: scaleY(1) } }
        .eq-bar { transform-origin: bottom; animation: music-eq .9s ease-in-out infinite }
      `}</style>

      {/* sidebar */}
      <div className="glass-thin w-44 shrink-0 border-r border-black/10 p-2 dark:border-white/10">
        <div className="px-2 pt-1 pb-1 text-[11px] font-semibold text-black/40 dark:text-white/40">Library</div>
        {(
          [
            ['listen', 'Listen Now', Play],
            ['albums', 'Albums', Disc3],
            ['songs', 'Songs', ListMusic],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => {
              setNav(id)
              setOpenAlbum(null)
            }}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left ${
              nav === id && !openAlbum ? 'bg-black/[0.08] dark:bg-white/[0.14]' : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <Icon size={14} style={{ color: ACCENT }} />
            {label}
          </button>
        ))}
        <div className="mt-3 px-2 pb-1 text-[11px] font-semibold text-black/40 dark:text-white/40">Playlists</div>
        {PLAYLISTS.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setNav(`pl-${p.id}`)
              setOpenAlbum(null)
            }}
            className={`flex w-full items-center rounded-md px-2 py-1 text-left ${
              nav === `pl-${p.id}` && !openAlbum ? 'bg-black/[0.08] dark:bg-white/[0.14]' : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <span className="truncate">{p.name}</span>
          </button>
        ))}
      </div>

      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-black/10 px-4 dark:border-white/10">
          {album && (
            <button
              onClick={() => setOpenAlbum(null)}
              className="flex items-center gap-0.5 rounded px-1 py-0.5 text-black/50 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/10"
            >
              <ChevronLeft size={15} /> Albums
            </button>
          )}
          <span className="truncate font-semibold">{title}</span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {album ? (
            <div>
              <div className="flex items-end gap-5">
                <img src={album.artwork} alt="" className="h-36 w-36 rounded-lg shadow-lg" />
                <div className="min-w-0 pb-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-white/40">{album.genre}</div>
                  <div className="truncate text-2xl font-bold">{album.name}</div>
                  <div className="text-black/50 dark:text-white/50">{album.artist} · {album.tracks.length} song{album.tracks.length === 1 ? '' : 's'}</div>
                  <button
                    onClick={() => playTrack(album.tracks[0].id)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-medium text-white shadow-sm"
                    style={{ background: ACCENT }}
                  >
                    <Play size={12} fill="currentColor" /> Play
                  </button>
                </div>
              </div>
              <div className="mt-5">
                <TrackTable tracks={album.tracks} durations={durations} currentId={currentId} playing={playing} onPlay={playTrack} showAlbum={false} />
              </div>
            </div>
          ) : nav === 'listen' ? (
            <div>
              <div className="flex items-center gap-5 rounded-2xl border border-black/10 p-5 dark:border-white/10" style={{ background: 'linear-gradient(100deg, rgba(252,92,125,.14), rgba(122,44,232,.10))' }}>
                <img src={tracksSeed[0].artwork} alt="" className="h-28 w-28 rounded-xl shadow-lg" />
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-[#FA2D55]">Featured</div>
                  <div className="truncate text-xl font-bold">{tracksSeed[0].title}</div>
                  <div className="truncate text-black/50 dark:text-white/50">{tracksSeed[0].artist} · {tracksSeed[0].genre}</div>
                  <button
                    onClick={() => playTrack(tracksSeed[0].id)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-medium text-white shadow-sm"
                    style={{ background: ACCENT }}
                  >
                    <Play size={12} fill="currentColor" /> Play
                  </button>
                </div>
              </div>
              <h3 className="mt-6 font-semibold">Recently Added</h3>
              <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-4">
                {tracksSeed.map((t) => (
                  <button key={t.id} onClick={() => playTrack(t.id)} className="group text-left">
                    <div className="relative">
                      <img src={t.artwork} alt={t.title} className="aspect-square w-full rounded-lg object-cover shadow-md" />
                      <span className="absolute right-1.5 bottom-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                        {currentId === t.id && playing ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
                      </span>
                    </div>
                    <div className="mt-1.5 truncate font-medium">{t.title}</div>
                    <div className="truncate text-[11px] text-black/45 dark:text-white/45">{t.artist}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : nav === 'albums' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-5">
              {albums.map((a) => (
                <button key={a.name} onClick={() => setOpenAlbum(a.name)} className="group text-left">
                  <img src={a.artwork} alt={a.name} className="aspect-square w-full rounded-lg object-cover shadow-md transition-transform group-hover:scale-[1.02]" />
                  <div className="mt-1.5 truncate font-medium">{a.name}</div>
                  <div className="truncate text-[11px] text-black/45 dark:text-white/45">{a.artist}</div>
                </button>
              ))}
            </div>
          ) : nav === 'songs' ? (
            <TrackTable tracks={tracksSeed} durations={durations} currentId={currentId} playing={playing} onPlay={playTrack} />
          ) : (
            playlist && <TrackTable tracks={playlistTracks} durations={durations} currentId={currentId} playing={playing} onPlay={playTrack} />
          )}
        </div>

        {/* playback bar */}
        <div className="flex h-[84px] shrink-0 items-center gap-4 border-t border-black/10 bg-black/[0.03] px-4 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex w-48 min-w-0 shrink-0 items-center gap-3">
            {current ? (
              <img src={current.artwork} alt="" className="h-12 w-12 rounded-md shadow" />
            ) : (
              <div className="grid h-12 w-12 place-items-center rounded-md bg-black/5 dark:bg-white/10">
                <Music2 size={18} className="text-black/30 dark:text-white/30" />
              </div>
            )}
            <div className="min-w-0 text-[12px]">
              <Marquee text={current?.title ?? 'Not Playing'} active={playing} />
              <div className="truncate text-black/45 dark:text-white/45">{current?.artist ?? 'Pick a song to begin'}</div>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5">
            <div className="flex items-center gap-6 text-black/70 dark:text-white/70">
              <button onClick={() => step(-1)} className="rounded p-1 hover:text-black dark:hover:text-white" title="Previous">
                <SkipBack size={17} fill="currentColor" />
              </button>
              <button
                onClick={() => (current ? setPlaying((p) => !p) : playTrack(tracksSeed[0].id))}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                title={playing ? 'Pause' : 'Play'}
              >
                {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
              </button>
              <button onClick={() => step(1)} className="rounded p-1 hover:text-black dark:hover:text-white" title="Next">
                <SkipForward size={17} fill="currentColor" />
              </button>
            </div>
            <div className="flex w-full max-w-xl items-center gap-2 text-[10px] tabular-nums text-black/45 dark:text-white/45">
              <span className="w-8 text-right">{fmtTime(elapsed)}</span>
              <input
                type="range"
                min={0}
                max={dur || 1}
                step={0.1}
                value={Math.min(elapsed, dur || 1)}
                onChange={(e) => seek(Number(e.target.value))}
                disabled={!current}
                className="h-1 flex-1 accent-[#FA2D55] disabled:opacity-40"
                aria-label="Seek"
              />
              <span className="w-8">{fmtTime(dur)}</span>
            </div>
          </div>
          <div className="hidden w-40 shrink-0 items-center justify-end gap-2 md:flex">
            <Volume2 size={14} className="shrink-0 text-black/50 dark:text-white/50" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1 w-full accent-[#FA2D55]"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>

      {/* the one and only audio element for this window */}
      <audio
        ref={audioRef}
        src={current?.src}
        onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          if (current && isFinite(e.currentTarget.duration)) setDurations((d) => ({ ...d, [current.id]: e.currentTarget.duration }))
        }}
        onEnded={() => step(1)}
        className="hidden"
      />
    </div>
  )
}

export default {
  id: 'music',
  name: 'Music',
  icon: { from: '#FC5C7D', to: '#FA2D55', Icon: Music2 },
  component: Music,
  defaultSize: { w: 1020, h: 660 },
  minSize: { w: 600, h: 440 },
  category: 'Entertainment',
  keywords: ['songs', 'playlist', 'audio'],
} satisfies AppDefinition

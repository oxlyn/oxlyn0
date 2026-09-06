import { useState } from 'react'
import { ChevronLeft, Play } from 'lucide-react'
import { videosSeed } from './data'
import type { AppDefinition, AppWindowProps } from '@/system/types'
import { Tv as TvGlyph } from 'lucide-react'

interface Vid { name: string; url: string; desc: string }
const seed = videosSeed as Vid[]

function TV({ payload }: AppWindowProps) {
  const initial = payload?.url ? seed.findIndex((v) => v.url === payload.url) : -1
  const [playing, setPlaying] = useState<number>(initial >= 0 ? initial : -1)

  if (playing >= 0) {
    const v = seed[playing]
    return (
      <div className="flex h-full flex-col bg-black text-white">
        <div className="flex h-11 shrink-0 items-center gap-2 px-3">
          <button className="flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 text-[12.5px] hover:bg-white/20" onClick={() => setPlaying(-1)}>
            <ChevronLeft size={14} /> Up Next
          </button>
          <span className="ml-2 truncate text-[13px] font-medium">{v.name}</span>
        </div>
        <video key={v.url} src={v.url} controls autoPlay className="min-h-0 w-full flex-1 bg-black object-contain" />
        <div className="shrink-0 p-3 text-[12px] text-white/50 select-text">{v.desc}</div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-[#0d0d0f] p-6 text-white">
      <h1 className="mb-1 text-xl font-bold">Up Next</h1>
      <p className="mb-5 text-[12.5px] text-white/45">Sample streams — they load from the network.</p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {seed.map((v, i) => (
          <button key={v.name} onClick={() => setPlaying(i)} className="group overflow-hidden rounded-xl text-left ring-1 ring-white/10">
            <div className="relative flex aspect-video items-center justify-center" style={{ background: `linear-gradient(140deg, hsl(${(i * 70 + 200) % 360} 45% 22%), #0d0d0f)` }}>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-transform group-hover:scale-110">
                <Play size={18} className="ml-0.5" />
              </span>
            </div>
            <div className="p-3">
              <div className="truncate font-medium">{v.name}</div>
              <div className="truncate text-[12px] text-white/45">{v.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default {
  id: 'tv',
  name: 'TV',
  icon: { from: '#3A3A3C', to: '#000000', Icon: TvGlyph },
  component: TV,
  defaultSize: { w: 1060, h: 680 },
  minSize: { w: 640, h: 440 },
  category: 'Entertainment',
  keywords: ['shows', 'video', 'watch', 'stream'],
} satisfies AppDefinition

import { useState } from 'react'
import { FolderOpen, Play } from 'lucide-react'
import { videosSeed } from '@/apps/tv/data'
import type { AppDefinition, AppWindowProps } from '@/system/types'
import { CirclePlay } from 'lucide-react'

interface Vid { name: string; url: string; desc: string }
const seed = videosSeed as Vid[]

function QuickTime({ payload }: AppWindowProps) {
  const initial = payload?.url ? seed.findIndex((v) => v.url === payload.url) : -1
  const [playing, setPlaying] = useState<number>(initial)

  if (playing >= 0) {
    const v = seed[playing]
    return (
      <div className="flex h-full flex-col bg-[#1c1c1e] text-white">
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/10 px-3">
          <span className="truncate text-[12.5px] font-medium">{v.name}</span>
          <button className="rounded px-2 py-0.5 text-[12px] text-white/60 hover:bg-white/10" onClick={() => setPlaying(-1)}>Close</button>
        </div>
        <video key={v.url} src={v.url} controls autoPlay className="min-h-0 w-full flex-1 bg-black object-contain" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#1c1c1e] p-6 text-white">
      <div className="text-[13px] text-white/50">Open a movie</div>
      <div className="w-full max-w-sm space-y-1.5">
        {seed.map((v, i) => (
          <button key={v.name} onClick={() => setPlaying(i)} className="flex w-full items-center gap-3 rounded-lg bg-white/6 p-3 text-left hover:bg-white/12">
            <FolderOpen size={16} className="opacity-60" />
            <span className="min-w-0 flex-1 truncate text-[13px]">{v.name}</span>
            <Play size={14} className="opacity-60" />
          </button>
        ))}
      </div>
    </div>
  )
}

export default {
  id: 'quicktime',
  name: 'QuickTime Player',
  icon: { from: '#5EB3F8', to: '#1463E8', Icon: CirclePlay },
  component: QuickTime,
  defaultSize: { w: 880, h: 600 },
  minSize: { w: 480, h: 360 },
  category: 'Entertainment',
  keywords: ['movie', 'video', 'player'],
} satisfies AppDefinition

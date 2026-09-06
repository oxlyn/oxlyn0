import { useMemo, useState } from 'react'
import { AArrowDown, AArrowUp, Bookmark, Star } from 'lucide-react'
import { articlesSeed } from './data'
import type { AppDefinition, AppWindowProps } from '@/system/types'
import { Newspaper as NewsGlyph } from 'lucide-react'

interface Article { id: string; title: string; source: string; dateline: string; paragraphs: string[] }
const seed = articlesSeed as Article[]

const SECTIONS = ['Today', 'News+', 'Sports', 'Politics', 'Business', 'Food', 'Technology', 'Following', 'Saved'] as const
type Section = (typeof SECTIONS)[number]

function News({ payload }: AppWindowProps) {
  const [section, setSection] = useState<Section>('Today')
  const [openId, setOpenId] = useState<string | null>((payload?.article as string) ?? null)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [scale, setScale] = useState(16)

  const open = useMemo(() => seed.find((a) => a.id === openId) ?? null, [openId])
  const feed = useMemo(() => {
    if (section === 'Saved') return seed.filter((a) => saved.has(a.id))
    if (section === 'News+') return seed
    if (section === 'Today') return seed
    return []
  }, [section, saved])

  if (open) {
    return (
      <div className="flex h-full flex-col bg-white dark:bg-[#1e1e20]">
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-black/10 px-3 dark:border-white/10">
          <button className="rounded px-2 py-0.5 text-[12.5px] hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setOpenId(null)}>
            ← Back
          </button>
          <span className="text-[12px] text-black/45 dark:text-white/45">{open.source}</span>
          <div className="ml-auto flex items-center gap-1">
            <button className="rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/10" title="Smaller text" onClick={() => setScale((s) => Math.max(13, s - 1))}><AArrowDown size={15} /></button>
            <button className="rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/10" title="Larger text" onClick={() => setScale((s) => Math.min(22, s + 1))}><AArrowUp size={15} /></button>
            <button
              className={`rounded p-1.5 hover:bg-black/5 dark:hover:bg-white/10 ${saved.has(open.id) ? 'text-amber-500' : ''}`}
              title="Save story"
              onClick={() => setSaved((s) => { const n = new Set(s); if (n.has(open.id)) n.delete(open.id); else n.add(open.id); return n })}
            >
              <Star size={15} className={saved.has(open.id) ? 'fill-current' : ''} />
            </button>
          </div>
        </div>
        <article className="mx-auto min-h-0 max-w-xl flex-1 overflow-y-auto px-6 py-8 select-text">
          <div className="text-[12px] font-semibold tracking-wide text-red-500 uppercase">{open.source}</div>
          <h1 className="mt-1 font-serif text-[1.9em] leading-tight font-bold" style={{ fontSize: scale * 1.9 }}>{open.title}</h1>
          <div className="mt-1 text-[12px] text-black/45 dark:text-white/45">{open.dateline}</div>
          <div className="mt-5 space-y-4" style={{ fontSize: scale, lineHeight: 1.65 }}>
            {open.paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? 'first-letter:float-left first-letter:mr-1.5 first-letter:font-serif first-letter:text-5xl first-letter:leading-[0.85] first-letter:font-bold' : ''}>
                {p}
              </p>
            ))}
          </div>
        </article>
      </div>
    )
  }

  return (
    <div className="flex h-full text-[13px]">
      <div className="glass-thin w-40 shrink-0 border-r border-black/10 p-2 dark:border-white/10">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setSection(s); setOpenId(null) }}
            className={`w-full rounded-md px-2 py-1 text-left ${section === s ? 'bg-red-500 text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
            {s === 'Saved' ? 'Saved Stories' : s}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {feed.length === 0 ? (
          <div className="grid h-full place-items-center text-black/30 dark:text-white/30">
            <div className="text-center">
              <Bookmark size={32} strokeWidth={1.2} />
              <div className="mt-2 text-[13px]">No {section} stories yet — save one from Today.</div>
            </div>
          </div>
        ) : (
          <>
            {feed[0] && (
              <button onClick={() => setOpenId(feed[0].id)} className="group mb-4 block w-full overflow-hidden rounded-2xl text-left ring-1 ring-black/8 dark:ring-white/10">
                <div className="relative flex h-36 items-end p-4" style={{ background: 'linear-gradient(130deg,#FF6B6B,#FA2D55 60%,#7d2ae8)' }}>
                  <span className="text-[11px] font-semibold tracking-wide text-white/80 uppercase">{feed[0].source}</span>
                  <span className="absolute right-4 top-3 font-serif text-6xl font-bold text-white/20">“</span>
                </div>
                <div className="bg-white p-4 dark:bg-[#232325]">
                  <h2 className="font-serif text-xl font-bold group-hover:underline">{feed[0].title}</h2>
                  <p className="mt-1 line-clamp-2 text-[12.5px] text-black/55 dark:text-white/55">{feed[0].paragraphs[0]}</p>
                  <div className="mt-1.5 text-[11.5px] text-black/40 dark:text-white/40">{feed[0].dateline}</div>
                </div>
              </button>
            )}
            <div className="grid grid-cols-2 gap-3">
              {feed.slice(1).map((a) => (
                <button key={a.id} onClick={() => setOpenId(a.id)} className="group rounded-xl p-4 text-left ring-1 ring-black/8 hover:bg-black/[0.02] dark:ring-white/10 dark:hover:bg-white/[0.03]">
                  <div className="text-[10.5px] font-semibold tracking-wide text-red-500 uppercase">{a.source}</div>
                  <h3 className="mt-0.5 font-serif text-[15px] leading-snug font-bold group-hover:underline">{a.title}</h3>
                  <p className="mt-1 line-clamp-3 text-[12px] text-black/55 dark:text-white/55">{a.paragraphs[0]}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default {
  id: 'news',
  name: 'News',
  icon: { from: '#FF6B6B', to: '#FA2D55', Icon: NewsGlyph },
  component: News,
  defaultSize: { w: 1060, h: 680 },
  minSize: { w: 720, h: 440 },
  category: 'Information & Reading',
  keywords: ['articles', 'reading', 'magazine', 'stories'],
  singleton: true,
} satisfies AppDefinition

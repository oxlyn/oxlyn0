import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Search } from 'lucide-react'
import { wordsSeed } from './data'
import type { AppDefinition } from '@/system/types'

interface Word { w: string; ph: string; pos: string; def: string; ex: string; syn: string[]; origin: string }

type ApiEntry = { word: string; phonetic?: string; meanings: { partOfSpeech: string; definitions: { definition: string; example?: string }[]; synonyms?: string[] }[] }

function Dictionary() {
  const [q, setQ] = useState('')
  const [api, setApi] = useState<{ word: string; data: ApiEntry[] | 'none' } | null>(null)
  const [loading, setLoading] = useState(false)

  const local = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const hits = wordsSeed.filter((x) => !needle || x.w.toLowerCase().includes(needle))
    return [...hits].sort((a, b) => a.w.localeCompare(b.w)) as Word[]
  }, [q])

  // fetch from dictionaryapi.dev when the local dictionary has nothing
  useEffect(() => {
    const needle = q.trim().toLowerCase()
    if (!needle || local.length > 0) { setApi(null); return }
    let dead = false
    setLoading(true)
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(needle)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('http'))))
      .then((data: ApiEntry[]) => { if (!dead) setApi({ word: needle, data }) })
      .catch(() => { if (!dead) setApi({ word: needle, data: 'none' }) })
      .finally(() => { if (!dead) setLoading(false) })
    return () => { dead = true }
  }, [q, local.length])

  return (
    <div className="flex h-full flex-col bg-[#f7f4ee] text-[#2c2418] dark:bg-[#1f1d18] dark:text-[#e8e0d0]">
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-black/8 px-4 dark:border-white/10">
        <BookOpen size={17} className="text-[#8E5A2A]" />
        <label className="flex flex-1 items-center gap-2 rounded-lg bg-black/5 px-3 py-1.5 dark:bg-white/10">
          <Search size={14} className="opacity-40" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Look up a word"
            className="w-full bg-transparent outline-none select-text"
          />
        </label>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {local.map((x) => (
          <div key={x.w} className="mx-auto max-w-xl border-b border-black/8 pb-4 mb-4 last:border-0 select-text">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-2xl font-bold">{x.w}</span>
              <span className="font-mono text-[12.5px] opacity-60">{x.ph}</span>
              <span className="text-[12.5px] italic opacity-60">{x.pos}</span>
            </div>
            <p className="mt-1 text-[13.5px] leading-relaxed">{x.def}</p>
            <p className="mt-1 text-[13px] italic opacity-70">“{x.ex}”</p>
            {x.syn.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {x.syn.map((s) => <span key={s} className="rounded-full bg-black/6 px-2 py-0.5 text-[11.5px] dark:bg-white/10">{s}</span>)}
              </div>
            )}
            {x.origin && <p className="mt-1.5 text-[12px] opacity-55">Origin: {x.origin}</p>}
          </div>
        ))}
        {local.length === 0 && (
          <div className="mx-auto max-w-xl">
            {loading && <div className="opacity-50">Looking up “{q}” online…</div>}
            {!loading && api?.data === 'none' && <div className="opacity-50">No definitions found for “{q}”.</div>}
            {!loading && Array.isArray(api?.data) && api.data.length === 0 && <div className="opacity-50">No definitions found.</div>}
            {!loading && Array.isArray(api?.data) && (api.data as ApiEntry[]).length > 0 && (
              (api.data as ApiEntry[]).slice(0, 2).map((entry) => (
                <div key={entry.word} className="mb-4">
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif text-2xl font-bold">{entry.word}</span>
                    {entry.phonetic && <span className="font-mono text-[12.5px] opacity-60">{entry.phonetic}</span>}
                  </div>
                  {entry.meanings.slice(0, 3).map((m, i) => (
                    <div key={i} className="mt-2">
                      <span className="text-[12.5px] italic opacity-60">{m.partOfSpeech}</span>
                      <p className="text-[13.5px] leading-relaxed">{m.definitions[0]?.definition}</p>
                      {m.definitions[0]?.example && <p className="text-[13px] italic opacity-70">“{m.definitions[0].example}”</p>}
                      {m.synonyms && m.synonyms.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {m.synonyms.slice(0, 6).map((s) => <span key={s} className="rounded-full bg-black/6 px-2 py-0.5 text-[11.5px] dark:bg-white/10">{s}</span>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <div className="shrink-0 border-t border-black/8 px-4 py-1.5 text-[11px] opacity-45 dark:border-white/10">
        {wordsSeed.length} curated entries · online lookup via dictionaryapi.dev
      </div>
    </div>
  )
}

export default {
  id: 'dictionary',
  name: 'Dictionary',
  icon: { from: '#FFFFFF', to: '#E5E5EA', Icon: BookOpen, glyphColor: '#8E5A2A' },
  component: Dictionary,
  defaultSize: { w: 800, h: 560 },
  minSize: { w: 480, h: 380 },
  category: 'Reference',
  keywords: ['words', 'definition', 'thesaurus', 'lookup'],
} satisfies AppDefinition

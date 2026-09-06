import { useEffect, useRef, useState } from 'react'
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  ExternalLink,
  PanelLeft,
  Plus,
  Shield,
  Share,
  Clock as ClockIcon,
  Trash2,
} from 'lucide-react'
import { bookmarksSeed } from './data'
import type { AppDefinition, AppWindowProps } from '@/system/types'
import { useWindows } from '@/system/stores/windows'

interface Page {
  url: string
  title: string
}
interface HistoryEntry {
  id: number
  url: string
  title: string
  at: number
}

const searchUrl = (q: string) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}&kae=d`

const looksLikeUrl = (t: string) => /^https?:\/\//i.test(t) || /^[\w-]+(\.[\w-]+)+(\/[^\s]*)?$/.test(t)

function normalizeInput(raw: string): Page {
  const t = raw.trim()
  if (!t) return { url: '', title: '' }
  if (/^https?:\/\//i.test(t)) return { url: t, title: hostOf(t) }
  if (looksLikeUrl(t)) return { url: `https://${t}`, title: hostOf(t) }
  return { url: searchUrl(t), title: `“${t}” — DuckDuckGo` }
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

const TILE_GRADIENTS = [
  ['#34AADC', '#0A5FD7'],
  ['#AF6CF5', '#7B34D8'],
  ['#3ED0A8', '#149E75'],
  ['#FF9F0A', '#E86A17'],
  ['#FF6482', '#E22C56'],
  ['#8E8E93', '#55555A'],
]

function ToolButton({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick?: () => void
  disabled?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="rounded-md p-1.5 text-black/70 transition-colors hover:bg-black/[0.06] disabled:opacity-30 dark:text-white/75 dark:hover:bg-white/10"
    >
      {children}
    </button>
  )
}

function Safari({ payload }: AppWindowProps) {
  const openApp = useWindows((s) => s.open)
  const [stack, setStack] = useState<Page[]>([])
  const [idx, setIdx] = useState(-1)
  const [input, setInput] = useState('')
  const [sidebar, setSidebar] = useState(true)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [frameState, setFrameState] = useState<'ok' | 'pending' | 'blocked'>('ok')
  const [shared, setShared] = useState(false)
  const histSeq = useRef(0)
  const timerRef = useRef<number | undefined>(undefined)

  const page: Page | null = stack[idx] ?? null
  const isReader = !!page && page.url.startsWith('reader:')

  // Sync address bar with the current page.
  useEffect(() => {
    setInput(page && !isReader ? page.url : '')
  }, [page?.url, isReader]) // eslint-disable-line react-hooks/exhaustive-deps

  // Frame-block detection: if onLoad never fires within 2.5s the site refuses framing.
  useEffect(() => {
    window.clearTimeout(timerRef.current)
    if (!page || isReader) {
      setFrameState('ok')
      return
    }
    setFrameState('pending')
    timerRef.current = window.setTimeout(() => {
      setFrameState((s) => (s === 'pending' ? 'blocked' : s))
    }, 2500)
    return () => window.clearTimeout(timerRef.current)
  }, [page?.url, isReader]) // eslint-disable-line react-hooks/exhaustive-deps

  const go = (p: Page) => {
    if (!p.url) return
    if (stack[idx]?.url === p.url) return
    setStack((s) => [...s.slice(0, idx + 1), p])
    setIdx((i) => i + 1)
    const id = ++histSeq.current
    setHistory((h) => (h[0]?.url === p.url ? h : [{ id, url: p.url, title: p.title, at: Date.now() }, ...h].slice(0, 60)))
  }

  const navigateInput = () => {
    const p = normalizeInput(input)
    if (p.url) go(p)
  }

  const openBookmark = (url: string, title: string) => {
    if (url.startsWith('reader:')) {
      openApp('news', { article: url.slice('reader:'.length) })
      return
    }
    go({ url, title })
  }

  const newTab = () => {
    setStack([])
    setIdx(-1)
    setInput('')
    setFrameState('ok')
  }

  const share = () => {
    if (!page) return
    try {
      void navigator.clipboard?.writeText(page.url)
    } catch {
      /* clipboard unavailable */
    }
    setShared(true)
    window.setTimeout(() => setShared(false), 1200)
  }

  const favorites = bookmarksSeed.filter((b) => b.folder === 'favorites')
  const menuBookmarks = bookmarksSeed.filter((b) => b.folder !== 'favorites')
  const recent = history.filter((h, i, arr) => arr.findIndex((x) => x.url === h.url) === i).slice(0, 4)

  return (
    <div className="flex h-full text-[13px]">
      <style>{`@keyframes safari-progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }`}</style>
      {sidebar && (
        <div className="glass-thin flex w-52 shrink-0 flex-col border-r border-black/10 dark:border-white/10">
          <div className="flex-1 overflow-y-auto p-2">
            <div className="px-2 pt-1 pb-1 text-[11px] font-semibold text-black/40 dark:text-white/40">Bookmarks</div>
            {menuBookmarks.map((b) => (
              <button
                key={b.id}
                onClick={() => openBookmark(b.url, b.title)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left hover:bg-black/5 dark:hover:bg-white/10"
              >
                <BookOpen size={13} className="shrink-0 text-blue-500" />
                <span className="truncate">{b.title}</span>
              </button>
            ))}
            <div className="mt-3 flex items-center justify-between px-2 pt-1 pb-1">
              <span className="text-[11px] font-semibold text-black/40 dark:text-white/40">History</span>
              {history.length > 0 && (
                <button
                  title="Clear History"
                  onClick={() => setHistory([])}
                  className="rounded p-0.5 text-black/35 hover:bg-black/5 hover:text-black/70 dark:text-white/35 dark:hover:bg-white/10 dark:hover:text-white/70"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
            {history.length === 0 && <div className="px-2 py-2 text-[12px] text-black/30 dark:text-white/30">No history yet</div>}
            {history.map((h) => (
              <button
                key={h.id}
                onClick={() => go({ url: h.url, title: h.title })}
                className="block w-full rounded-md px-2 py-1 text-left hover:bg-black/5 dark:hover:bg-white/10"
              >
                <div className="truncate">{h.title}</div>
                <div className="truncate text-[11px] text-black/35 dark:text-white/35">{hostOf(h.url)}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* unified toolbar */}
        <div className="flex h-11 shrink-0 items-center gap-0.5 border-b border-black/10 px-2 dark:border-white/10">
          <ToolButton title="Sidebar" onClick={() => setSidebar((v) => !v)}>
            <PanelLeft size={15} />
          </ToolButton>
          <ToolButton title="Back" disabled={idx <= 0} onClick={() => setIdx((i) => Math.max(0, i - 1))}>
            <ChevronLeft size={16} />
          </ToolButton>
          <ToolButton title="Forward" disabled={idx >= stack.length - 1} onClick={() => setIdx((i) => Math.min(stack.length - 1, i + 1))}>
            <ChevronRight size={16} />
          </ToolButton>
          <form
            className="mx-auto w-full max-w-xl min-w-0 flex-1 px-2"
            onSubmit={(e) => {
              e.preventDefault()
              navigateInput()
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search or enter website name"
              spellCheck={false}
              className="h-7 w-full rounded-md bg-black/[0.06] px-3 text-[12.5px] text-black/85 outline-none ring-blue-400/60 focus:ring-2 placeholder:text-black/35 dark:bg-white/10 dark:text-white/90 dark:placeholder:text-white/35"
            />
          </form>
          <ToolButton title="Share" onClick={share}>
            {shared ? <Check size={15} className="text-green-600" /> : <Share size={14} />}
          </ToolButton>
          <ToolButton title="New Tab" onClick={newTab}>
            <Plus size={16} />
          </ToolButton>
        </div>

        {/* content */}
        {page ? (
          isReader ? (
            <div className="h-full overflow-y-auto bg-white dark:bg-[#1c1c1e]">
              <div className="mx-auto max-w-xl px-8 py-10 select-text">
                <div className="text-[11px] font-semibold tracking-wide text-orange-600 uppercase dark:text-orange-400">Apple Developer</div>
                <h1 className="mt-2 font-serif text-2xl font-bold">Liquid Glass</h1>
                <p className="mt-4 leading-relaxed text-black/70 dark:text-white/70">
                  This article opens in News. Safari renders it in the dedicated reader for a distraction-free layout.
                </p>
                <button
                  onClick={() => openApp('news', { article: page.url.slice('reader:'.length) })}
                  className="mt-5 rounded-lg bg-blue-500 px-3.5 py-1.5 font-medium text-white hover:bg-blue-600"
                >
                  Open in News
                </button>
              </div>
            </div>
          ) : (
            <div className="relative min-h-0 flex-1">
              <iframe
                key={page.url}
                src={page.url}
                title={page.title}
                onLoad={() => setFrameState('ok')}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                className="h-full w-full border-0 bg-white"
              />
              {frameState === 'pending' && (
                <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 overflow-hidden">
                  <div className="h-full w-1/3 animate-[safari-progress_1.2s_ease-in-out_infinite] bg-blue-500" />
                </div>
              )}
              {frameState === 'blocked' && (
                <div className="absolute inset-0 grid place-items-center bg-white p-8 dark:bg-[#1c1c1e]">
                  <div className="max-w-sm text-center">
                    <Shield size={44} strokeWidth={1.3} className="mx-auto text-black/25 dark:text-white/30" />
                    <h2 className="mt-4 text-[15px] font-semibold">This site can’t be displayed in a frame</h2>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-black/50 dark:text-white/50">
                      <span className="font-medium">{hostOf(page.url)}</span> does not allow itself to be embedded. You can open it in its own tab
                      instead.
                    </p>
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-3.5 py-1.5 font-medium text-white hover:bg-blue-600"
                    >
                      <ExternalLink size={13} />
                      Open in New Tab
                    </a>
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-2xl px-8 py-10">
              <section>
                <h2 className="mb-3 text-[13px] font-semibold text-black/45 dark:text-white/45">Favorites</h2>
                <div className="flex flex-wrap gap-4">
                  {favorites.map((b, i) => {
                    const [from, to] = TILE_GRADIENTS[i % TILE_GRADIENTS.length]
                    return (
                      <button key={b.id} onClick={() => openBookmark(b.url, b.title)} className="w-20 text-center">
                        <div
                          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-[22px] font-semibold text-white shadow-md ring-1 ring-black/10 dark:ring-white/15"
                          style={{ background: `linear-gradient(160deg, ${from}, ${to})` }}
                        >
                          {b.title.charAt(0)}
                        </div>
                        <div className="mt-1.5 truncate text-[12px] text-black/70 dark:text-white/70">{b.title}</div>
                      </button>
                    )
                  })}
                </div>
              </section>

              {recent.length > 0 && (
                <section className="mt-8">
                  <h2 className="mb-3 text-[13px] font-semibold text-black/45 dark:text-white/45">Recently Visited</h2>
                  <div className="flex flex-wrap gap-4">
                    {recent.map((h) => (
                      <button key={h.id} onClick={() => go({ url: h.url, title: h.title })} className="w-20 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black/[0.06] ring-1 ring-black/10 dark:bg-white/10 dark:ring-white/15">
                          <ClockIcon size={22} className="text-black/40 dark:text-white/40" />
                        </div>
                        <div className="mt-1.5 truncate text-[12px] text-black/70 dark:text-white/70">{h.title}</div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <section className="mt-8">
                <h2 className="mb-3 text-[13px] font-semibold text-black/45 dark:text-white/45">Privacy Report</h2>
                <button
                  onClick={() => setSidebar(true)}
                  className="flex w-full items-center gap-4 rounded-xl border border-black/10 bg-white/70 p-4 text-left dark:border-white/10 dark:bg-white/[0.06]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/15">
                    <Shield size={20} className="text-blue-500" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium">Safari prevented 27 trackers from profiling you</span>
                    <span className="mt-0.5 block text-[12px] text-black/45 dark:text-white/45">In the last seven days · Intelligent Tracking Prevention</span>
                  </span>
                </button>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default {
  id: 'safari',
  name: 'Safari',
  icon: { from: '#5EE0F8', to: '#1A6CF0', Icon: Compass },
  component: Safari,
  defaultSize: { w: 1100, h: 720 },
  minSize: { w: 560, h: 400 },
  category: 'Productivity & Finance',
  keywords: ['browser', 'web'],
} satisfies AppDefinition

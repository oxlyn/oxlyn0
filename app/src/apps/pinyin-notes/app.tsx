import { useEffect, useMemo, useState } from 'react'
import { Languages, PencilLine, Plus, Settings2, Trash2 } from 'lucide-react'
import type { AppDefinition } from '@/system/types'

/**
 * 拼音笔记 — 中文笔记 + 注音显示。编辑态是纯文本框；注音态把每个汉字渲染
 * 成 <ruby>字<rt>拼音</rt></ruby>（浏览器原生支持字上方注音），拼音由
 * pinyin-pro 提供（带声调符号、词库处理多音字，英文/数字原样跳过）。
 * 字典约几百 KB，首次切到注音态才动态 import，不拖慢桌面首屏。
 */
interface Note { id: string; body: string; created: number; modified: number }
const STORE_KEY = 'oxlyn-pinyin-notes'
const SETTINGS_KEY = 'oxlyn-pinyin-notes-settings'

// 排版设置：汉字与拼音的字体、字号分开配置；行格高度随两者动态计算，
// 分割线周期始终与行格对齐。注音组下移量 = 拼音字号的一半（上下留白均分）。
interface PnSettings { hanFont: string; hanSize: number; pyFont: string; pySize: number }
const HAN_FONTS = [
  { label: '楷体', value: "'Kaiti SC','STKaiti','KaiTi',serif" },
  { label: '宋体', value: "'Songti SC','STSong','SimSun',serif" },
  { label: '黑体', value: "-apple-system,'PingFang SC','Helvetica Neue',sans-serif" },
]
const PY_FONTS = [
  { label: '无衬线', value: "-apple-system,'PingFang SC',system-ui,sans-serif" },
  { label: '衬线', value: "Georgia,'Times New Roman',serif" },
  { label: '等宽', value: "'SF Mono',Menlo,Consolas,monospace" },
]
const PN_DEFAULTS: PnSettings = { hanFont: HAN_FONTS[0].value, hanSize: 24, pyFont: PY_FONTS[0].value, pySize: 12 }
const loadSettings = (): PnSettings => {
  try { return { ...PN_DEFAULTS, ...(JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') as Partial<PnSettings>) } } catch { return PN_DEFAULTS }
}
const lineHeightOf = (s: PnSettings): number => s.hanSize + s.pySize + 20

type PinyinModule = typeof import('pinyin-pro')
let pinyinMod: PinyinModule | null = null

const load = (): Note[] => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]') as Note[] } catch { return [] }
}
const titleOf = (body: string): string => body.split('\n')[0].trim().slice(0, 24) || '无标题'

/** 逐字注音：返回与字符数组对齐的拼音数组，失败/不对齐时返回 null 走纯文本 */
function annotate(line: string): string[] | null {
  if (!pinyinMod || !/\p{Script=Han}/u.test(line)) return null
  try {
    const out = pinyinMod.pinyin(line, { toneType: 'symbol', type: 'array', nonZh: 'spaced' }) as string[]
    return out.length === Array.from(line).length ? out : null
  } catch { return null }
}

function RubyView({ body, settings }: { body: string; settings: PnSettings }) {
  // 课本排版：拼音在字上方、段首缩进两格；分割线铺在容器背景上（随内容
  // 滚动的重复渐变），周期 = 动态行格高度；注音组下移 pySize/2 使上下留白均分。
  const lh = lineHeightOf(settings)
  return (
    <div className="h-full overflow-y-auto px-8 py-6" style={{ fontFamily: settings.hanFont }}>
      <div className="pn-lines" style={{ '--pn-lh': `${lh}px` } as React.CSSProperties}>
        {body.split('\n').map((line, li) => {
          const chars = Array.from(line)
          const pys = annotate(line)
          return (
            <p
              key={li}
              className="whitespace-pre-wrap break-words [text-indent:2em] text-black/85 dark:text-white/88"
              style={{ minHeight: lh, fontSize: settings.hanSize, lineHeight: `${lh}px` }}
            >
              {/* 拼音+汉字作为一组，整体下移使上下分割线留白一致 */}
              <span className="relative" style={{ top: settings.pySize / 2 }}>
                {pys
                  ? chars.map((ch, i) => {
                      const py = pys[i]
                      if (!py || !/\p{Script=Han}/u.test(ch)) return <span key={i}>{ch}</span>
                      return (
                        <ruby key={i} style={{ rubyAlign: 'center', rubyPosition: 'over' }}>
                          {ch}
                          <rt className="select-none font-normal leading-none text-slate-400 dark:text-slate-200" style={{ fontFamily: settings.pyFont, fontSize: settings.pySize }}>{py}</rt>
                        </ruby>
                      )
                    })
                  : line || '　'}
              </span>
            </p>
          )
        })}
      </div>
    </div>
  )
}

function PinyinNotes() {
  const [notes, setNotes] = useState<Note[]>(load)
  const [activeId, setActiveId] = useState<string | null>(() => load().sort((a, b) => b.modified - a.modified)[0]?.id ?? null)
  const [mode, setMode] = useState<'edit' | 'ruby'>('ruby')
  const [dictReady, setDictReady] = useState(!!pinyinMod)
  const [settings, setSettings] = useState<PnSettings>(loadSettings)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const lh = lineHeightOf(settings)

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(notes))
  }, [notes])

  // 首次进入注音态才加载拼音字典（独立 chunk，按需下载）
  useEffect(() => {
    if (mode !== 'ruby' || pinyinMod) {
      if (pinyinMod) setDictReady(true)
      return
    }
    let alive = true
    import('pinyin-pro').then((m) => {
      pinyinMod = m
      if (alive) setDictReady(true)
    }).catch(() => { if (alive) setDictReady(false) })
    return () => { alive = false }
  }, [mode])

  const sorted = useMemo(() => [...notes].sort((a, b) => b.modified - a.modified), [notes])
  const active = sorted.find((n) => n.id === activeId) ?? sorted[0] ?? null

  const create = () => {
    const now = Date.now()
    const note: Note = { id: `pn-${now}`, body: '', created: now, modified: now }
    setNotes((ns) => [note, ...ns])
    setActiveId(note.id)
    setMode('edit')
  }
  const update = (id: string, body: string) => {
    setNotes((ns) => ns.map((n) => (n.id === id ? { ...n, body, modified: Date.now() } : n)))
  }
  const remove = (id: string) => {
    setNotes((ns) => {
      const rest = ns.filter((n) => n.id !== id)
      if (activeId === id) setActiveId(rest.sort((a, b) => b.modified - a.modified)[0]?.id ?? null)
      return rest
    })
  }

  return (
    <div className="flex h-full">
      {/* 列表 */}
      <div className="flex w-56 shrink-0 flex-col border-r border-black/8 bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-black/60 dark:text-white/60">
            <Languages size={14} /> 拼音笔记
          </span>
          <button onClick={create} title="新建笔记" className="rounded-md p-1 text-black/50 hover:bg-black/8 dark:text-white/50 dark:hover:bg-white/10">
            <Plus size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {sorted.map((n) => (
            <button
              key={n.id}
              onClick={() => setActiveId(n.id)}
              className={`group mb-1 flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left ${active?.id === n.id ? 'bg-emerald-500/15 ring-1 ring-emerald-500/30' : 'hover:bg-black/6 dark:hover:bg-white/8'}`}
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-black/80 dark:text-white/85">{titleOf(n.body)}</span>
                <span className="block text-[10.5px] text-black/40 dark:text-white/40">{new Date(n.modified).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); if (window.confirm('删除这篇笔记？')) remove(n.id) }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); if (window.confirm('删除这篇笔记？')) remove(n.id) } }}
                className="ml-1 hidden rounded p-1 text-black/35 hover:text-red-500 group-hover:block dark:text-white/35"
              >
                <Trash2 size={13} />
              </span>
            </button>
          ))}
          {!sorted.length && <p className="px-2 py-6 text-center text-[12px] text-black/35 dark:text-white/35">还没有笔记<br />点右上角 + 新建</p>}
        </div>
      </div>
      {/* 编辑/注音区 */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        <style>{`.pn-lines{background-image:repeating-linear-gradient(to bottom,transparent 0px,transparent calc(var(--pn-lh) - 2px),var(--pn-line-color) calc(var(--pn-lh) - 2px),var(--pn-line-color) var(--pn-lh));background-attachment:local;--pn-line-color:rgba(0,0,0,0.08)}.dark .pn-lines{--pn-line-color:rgba(255,255,255,0.12)}`}</style>
        <div className="flex items-center justify-between border-b border-black/8 px-4 py-2 dark:border-white/10">
          <div className="flex items-center gap-1">
            <button onClick={() => setMode('edit')} className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-medium ${mode === 'edit' ? 'bg-emerald-600 text-white' : 'text-black/55 hover:bg-black/8 dark:text-white/55 dark:hover:bg-white/10'}`}>
              <PencilLine size={12.5} /> 编辑
            </button>
            <button onClick={() => setMode('ruby')} className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-medium ${mode === 'ruby' ? 'bg-emerald-600 text-white' : 'text-black/55 hover:bg-black/8 dark:text-white/55 dark:hover:bg-white/10'}`}>
              <Languages size={12.5} /> 注音
            </button>
          </div>
          <div className="flex items-center gap-2">
            {mode === 'ruby' && (
              <span className="text-[11px] text-black/40 dark:text-white/40">拼音由 pinyin-pro · 多音字按词识别</span>
            )}
            <button
              onClick={() => setSettingsOpen((o) => !o)}
              title="排版设置"
              className={`rounded-md p-1.5 ${settingsOpen ? 'bg-emerald-600 text-white' : 'text-black/50 hover:bg-black/8 dark:text-white/50 dark:hover:bg-white/10'}`}
            >
              <Settings2 size={14} />
            </button>
          </div>
        </div>
        {settingsOpen && (
          <div className="absolute right-3 top-12 z-10 w-64 overflow-hidden rounded-xl bg-white/97 shadow-xl ring-1 ring-black/10 backdrop-blur dark:bg-[#26282e]/97 dark:ring-white/10">
            <div className="space-y-3 px-3 py-3">
              {([
                { title: '汉字', fontKey: 'hanFont' as const, sizeKey: 'hanSize' as const, fonts: HAN_FONTS, min: 16, max: 40 },
                { title: '拼音', fontKey: 'pyFont' as const, sizeKey: 'pySize' as const, fonts: PY_FONTS, min: 8, max: 20 },
              ]).map((g) => (
                <div key={g.title} className="space-y-1.5">
                  <div className="text-black/45 dark:text-white/45">{g.title}</div>
                  <select
                    value={settings[g.fontKey]}
                    onChange={(e) => setSettings((s) => ({ ...s, [g.fontKey]: e.target.value }))}
                    className="w-full rounded-md bg-black/5 px-2 py-1 text-[12.5px] outline-none dark:bg-white/10"
                  >
                    {g.fonts.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
                  </select>
                  <div className="flex items-center gap-2">
                    <input
                      type="range" min={g.min} max={g.max} value={settings[g.sizeKey]}
                      onChange={(e) => setSettings((s) => ({ ...s, [g.sizeKey]: Number(e.target.value) }))}
                      className="w-full accent-emerald-600"
                    />
                    <b className="w-11 text-right tabular-nums text-black/60 dark:text-white/60">{settings[g.sizeKey]}px</b>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <button onClick={() => setSettings(PN_DEFAULTS)} className="text-black/40 underline-offset-2 hover:text-black/70 hover:underline dark:text-white/40 dark:hover:text-white/70">
                  恢复默认
                </button>
                <button onClick={() => setSettingsOpen(false)} className="rounded-md bg-emerald-600 px-3 py-1 text-[12px] font-medium text-white hover:bg-emerald-500">
                  完成
                </button>
              </div>
            </div>
          </div>
        )}
        {active ? (
          mode === 'edit' ? (
            <textarea
              value={active.body}
              onChange={(e) => update(active.id, e.target.value)}
              placeholder="输入中文，切到「注音」即可在字上方看到带调拼音…"
              className="pn-lines flex-1 resize-none bg-transparent px-6 py-4 text-black/85 outline-none placeholder:text-black/30 dark:text-white/85 dark:placeholder:text-white/25"
              style={{ fontFamily: settings.hanFont, fontSize: settings.hanSize, lineHeight: `${lh}px`, backgroundPosition: `0 16px` }}
            />
          ) : dictReady ? (
            <RubyView body={active.body} settings={settings} />
          ) : (
            <div className="flex flex-1 items-center justify-center text-[12.5px] text-black/40 dark:text-white/40">拼音词典加载中…</div>
          )
        ) : (
          <div className="flex flex-1 items-center justify-center text-[12.5px] text-black/40 dark:text-white/40">新建或选择一篇笔记</div>
        )}
      </div>
    </div>
  )
}

export default {
  id: 'pinyin-notes',
  name: '拼音笔记',
  icon: { from: '#34C759', to: '#1a7f34', Icon: Languages },
  component: PinyinNotes,
  defaultSize: { w: 920, h: 640 },
  minSize: { w: 680, h: 480 },
  category: 'Productivity',
  onDesktop: true,
  keywords: ['pinyin', '拼音', '注音', '拼音笔记', '笔记', 'notes', 'ruby'],
} satisfies AppDefinition

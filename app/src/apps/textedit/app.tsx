import { useEffect, useRef, useState } from 'react'
import { useFs } from '@/system/stores/fs'
import type { AppDefinition, AppWindowProps } from '@/system/types'
import { PenLine } from 'lucide-react'

function TextEdit({ payload }: AppWindowProps) {
  const nodeId = payload?.nodeId as string | undefined
  const node = useFs((s) => (nodeId ? s.nodes[nodeId] : undefined))
  const [text, setText] = useState(() => node?.content ?? '')
  const [mono, setMono] = useState(false)
  const [status, setStatus] = useState<'saved' | 'editing'>('saved')
  const timer = useRef<number | undefined>(undefined)
  const initialId = useRef(nodeId)

  useEffect(() => {
    if (node && initialId.current === nodeId && node.content !== text) {
      setStatus('editing')
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => {
        useFs.getState().setContent(node.id, text)
        setStatus('saved')
      }, 400)
    }
  }, [text]) // eslint-disable-line react-hooks/exhaustive-deps

  const saveNew = () => {
    useFs.getState().create({
      parentId: 'documents',
      name: text ? `${text.trim().split('\n')[0].slice(0, 24) || 'Untitled'}.txt` : 'Untitled.txt',
      kind: 'file',
      mime: 'text/plain',
      content: text,
    })
    setStatus('saved')
  }

  const words = text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <div className="flex h-full flex-col bg-white dark:bg-[#232325]">
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-black/10 px-3 text-[12px] dark:border-white/10">
        <span className="font-semibold">{node?.name ?? 'Untitled'}</span>
        <span className="text-black/40 dark:text-white/40">
          {node ? (status === 'saved' ? 'Saved' : 'Editing…') : ''}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setMono((v) => !v)}
            className={`rounded px-2 py-0.5 ${mono ? 'bg-black/10 dark:bg-white/15' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
            Monospace
          </button>
          {!node && (
            <button className="rounded bg-blue-500 px-2.5 py-0.5 text-white hover:bg-blue-600" onClick={saveNew}>
              Save to Documents
            </button>
          )}
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        className={`min-h-0 flex-1 resize-none bg-transparent p-5 leading-relaxed outline-none select-text ${mono ? 'font-mono text-[12.5px]' : 'text-[13.5px]'}`}
      />
      <div className="flex h-7 shrink-0 items-center justify-end gap-4 border-t border-black/10 px-3 text-[11px] text-black/40 dark:border-white/10 dark:text-white/40">
        <span>{words} words</span>
        <span>{text.length} chars</span>
      </div>
    </div>
  )
}

export default {
  id: 'textedit',
  name: 'TextEdit',
  icon: { from: '#F8F8F8', to: '#D8D8DC', Icon: PenLine, glyphColor: '#1A6CF0' },
  component: TextEdit,
  defaultSize: { w: 760, h: 560 },
  minSize: { w: 480, h: 380 },
  category: 'Productivity & Finance',
  keywords: ['text', 'write', 'edit'],
} satisfies AppDefinition

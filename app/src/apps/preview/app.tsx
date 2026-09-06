import { useFs } from '@/system/stores/fs'
import type { AppDefinition, AppWindowProps } from '@/system/types'
import { ScanSearch } from 'lucide-react'

/**
 * Views files opened from Finder / Desktop: text, "PDF" (styled paper) and images.
 */
function Preview({ payload }: AppWindowProps) {
  const node = useFs((s) => (payload?.nodeId ? s.nodes[payload.nodeId as string] : undefined))

  if (!node) return <div className="grid h-full place-items-center text-sm text-black/35 dark:text-white/35">No file selected</div>

  if (node.mime === 'application/pdf') {
    return (
      <div className="h-full overflow-y-auto bg-neutral-300/60 p-6 dark:bg-black/40">
        <div className="rich mx-auto max-w-[640px] rounded-sm bg-white px-10 py-12 font-serif text-[13.5px] leading-relaxed text-black shadow-lg select-text">
          {node.content?.split('\n\n').map((block, i) => (
            <p key={i} className="whitespace-pre-wrap">
              {block}
            </p>
          ))}
        </div>
      </div>
    )
  }

  if (node.mime?.startsWith('image/')) {
    return (
      <div className="grid h-full place-items-center bg-neutral-200/50 p-4 dark:bg-black/40">
        <img src={`${import.meta.env.BASE_URL}${node.name}`} alt={node.name} className="max-h-full max-w-full rounded shadow-lg" />
      </div>
    )
  }

  if (node.mime === 'application/zip') {
    return (
      <div className="grid h-full place-items-center text-black/40 dark:text-white/40">
        <div className="text-center text-sm">
          <div className="text-5xl">📦</div>
          <p className="mt-3">“{node.name}” cannot be opened — archives have no preview.</p>
        </div>
      </div>
    )
  }

  // plain text
  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-[#1e1e20]">
      <pre className="px-8 py-6 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap select-text">{node.content}</pre>
    </div>
  )
}

export default {
  id: 'preview',
  name: 'Preview',
  icon: { from: '#5EB3F8', to: '#1463E8', Icon: ScanSearch },
  component: Preview,
  defaultSize: { w: 900, h: 640 },
  minSize: { w: 480, h: 360 },
  category: 'Utilities',
  keywords: ['pdf', 'view', 'image', 'text'],
} satisfies AppDefinition

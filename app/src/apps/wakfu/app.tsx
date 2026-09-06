import { useMemo, useRef } from 'react'
import { Swords } from 'lucide-react'
import { useIframeDark } from '@/system/useIframeDark'
import type { AppDefinition, AppWindowProps } from '@/system/types'

const WAKFU_URL = `${import.meta.env.BASE_URL}wakfu/index.html`

/**
 * Wakfu 攻略站「万象之扉」— full multi-page fan site (副本/职业/任务/生活/图鉴/
 * 装备攻略 + 战斗日志分析), embedded verbatim from wakfu/ at the repo root.
 * Same-origin iframe; internal navigation stays inside the window. Follows the
 * desktop appearance via the site's own theme engine (0=暗夜, 1-4=四季).
 */
function WakfuApp({ winId }: AppWindowProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const src = useMemo(() => `${WAKFU_URL}?w=${winId}`, [])
  useIframeDark(iframeRef, (f, dark) => {
    const w = f.contentWindow as (Window & { setTheme?: (i: number) => void }) | null
    if (!w?.setTheme) return
    if (dark) {
      w.setTheme(0) // 暗夜
    } else {
      // light: keep whichever season the visitor picked, but never the dark one
      const saved = Number(w.localStorage.getItem('wakfu-theme') ?? '1')
      w.setTheme(!Number.isInteger(saved) || saved === 0 ? 1 : saved)
    }
  })
  return (
    <div className="flex h-full flex-col bg-[#0b1020]">
      <iframe
        ref={iframeRef}
        src={src}
        title="Wakfu 攻略站 · 万象之扉"
        className="min-h-0 w-full flex-1 border-0 bg-[#0b1020]"
      />
    </div>
  )
}

export default {
  id: 'wakfu',
  name: 'Wakfu Guide',
  icon: { from: '#8E9BFF', to: '#5A48E8', Icon: Swords },
  component: WakfuApp,
  defaultSize: { w: 1180, h: 760 },
  minSize: { w: 620, h: 440 },
  category: 'Games',
  keywords: ['wakfu', '沃土', '攻略', '副本', '职业', '日志分析', 'dungeon', 'guide'],
  inDock: true,
} satisfies AppDefinition

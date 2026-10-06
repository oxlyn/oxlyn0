import { useRef } from 'react'
import { Flame } from 'lucide-react'
import type { AppDefinition } from '@/system/types'

const YLCS3_URL = `${import.meta.env.BASE_URL}app/src/apps/ylcs3/site/index.html`

/**
 * 炎龙传说（炎龙传说3双燕）— Flash 动作游戏，用开源模拟器 Ruffle 同源本地
 * 回放。站点捆绑在本应用目录 site/（构建时按同路径镜像进产物），同源 iframe。
 * 从 Games 合集的卡片或 Dock/Launchpad 打开的都是这个窗口；keepAlive 保证
 * 关窗再开还是同一局，标题栏弹出新标签页也可直接玩。
 */
function Ylcs3App() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  return (
    <div className="flex h-full flex-col bg-[#14161e]">
      <iframe
        ref={iframeRef}
        src={YLCS3_URL}
        title="炎龙传说"
        className="min-h-0 w-full flex-1 border-0"
      />
    </div>
  )
}

export default {
  id: 'ylcs3',
  name: '炎龙传说',
  icon: { from: '#FF6B4A', to: '#B22222', Icon: Flame },
  component: Ylcs3App,
  defaultSize: { w: 960, h: 720 },
  minSize: { w: 640, h: 480 },
  category: 'Games',
  keywords: ['flash', 'ruffle', '炎龙传说', '炎龙', '双燕', '动作游戏', 'arcade'],
  inDock: true,
  onDesktop: true,
  keepAlive: true,
  popOutUrl: () => YLCS3_URL,
} satisfies AppDefinition

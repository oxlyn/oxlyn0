import { Github, Image, PenTool } from 'lucide-react'
import type { WebAppSite } from './system/webapp'

/**
 * 在线网站清单 —— 集成一个网站 = 在下面加一个对象，重新构建即可。
 * 框架（WebAppSite 的全部字段、渲染与降级逻辑）见 src/system/webapp.tsx。
 *
 * embed 怎么选：先 `curl -sI <url> | grep -i frame` 看目标站有没有发
 * X-Frame-Options / CSP frame-ancestors 拒嵌头——没有就能 'direct' 直接
 * iframe；发了就 'none'，窗口里给「在浏览器中打开」的降级卡片。
 */
export const webapps: WebAppSite[] = [
  {
    id: 'excalidraw',
    name: 'Excalidraw',
    url: 'https://excalidraw.com',
    icon: { from: '#6965DB', to: '#3B36B3', Icon: PenTool },
    defaultSize: { w: 1120, h: 740 },
    category: 'Creativity',
    keywords: ['whiteboard', '白板', '画图', 'diagram', '手绘'],
  },
  {
    id: 'photopea',
    name: 'Photopea',
    url: 'https://www.photopea.com',
    icon: { from: '#2AA8F5', to: '#0B6BB7', Icon: Image },
    defaultSize: { w: 1180, h: 760 },
    category: 'Creativity',
    keywords: ['photoshop', 'ps', '修图', '图片编辑', 'image editor'],
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com',
    icon: { from: '#3A4750', to: '#12181F', Icon: Github },
    // GitHub 发送 CSP frame-ancestors 'none' —— 走降级卡片的样例。
    embed: 'none',
    note: 'GitHub 禁止被嵌入其他页面（CSP frame-ancestors），点击下方按钮在浏览器中打开。',
    defaultSize: { w: 1180, h: 760 },
    category: 'Developer Tools',
    keywords: ['git', '代码', '仓库', 'code', 'repo'],
  },
]

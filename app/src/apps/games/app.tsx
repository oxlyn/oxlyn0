import { useState } from 'react'
import { useWindows } from '@/system/stores/windows'
import { WebEmbedFrame, type WebAppSite } from '@/system/webapp'
import type { AppDefinition, AppIconSpec } from '@/system/types'
import { Gamepad2 } from 'lucide-react'

/** 泡泡坦克（bubble-tank.zackwill.space）— Flash 经典 1/2/3 的 HTML5 重制版。 */
const BUBBLE_TANKS: WebAppSite = {
  id: 'bubble-tanks',
  name: 'Bubble Tanks',
  url: 'https://bubble-tank.zackwill.space/',
  icon: { from: '#64D2FF', to: '#0A84FF', Icon: Gamepad2 } satisfies AppIconSpec,
}

/** 红色警戒2（gonghui.k0s.cn，平台名「王二火大」）— 红警 2 网页重制（ra2web）的联机对战平台。 */
const RA2_GONGHUI: WebAppSite = {
  id: 'ra2-gonghui',
  name: '红色警戒2',
  url: 'https://gonghui.k0s.cn/',
  icon: { from: '#FF453A', to: '#8E1C14', Icon: Gamepad2 } satisfies AppIconSpec,
}

/** 葫芦娃（cgb.ipyaoguai.com/hlw，hlw = 葫芦娃）— Egret 引擎 H5 游戏。 */
const HLW: WebAppSite = {
  id: 'hlw-demo',
  name: '葫芦娃',
  url: 'https://cgb.ipyaoguai.com/hlw/hlw_demo/index.html',
  icon: { from: '#BF5AF2', to: '#5E2FB8', Icon: Gamepad2 } satisfies AppIconSpec,
}

/** 我的世界 H5（bloxd.io）— 类 Minecraft 方块沙盒多人游戏。 */
const BLOXD: WebAppSite = {
  id: 'bloxd',
  name: '我的世界 H5',
  url: 'https://bloxd.io/',
  icon: { from: '#7CBD56', to: '#4A7A2A', Icon: Gamepad2 } satisfies AppIconSpec,
}

/** MCJS（mcjs.link）— 网页版 MC 中文版。 */
const MCJS: WebAppSite = {
  id: 'mcjs',
  name: 'MCJS',
  url: 'https://mcjs.link/',
  icon: { from: '#4DA3FF', to: '#1E5FD6', Icon: Gamepad2 } satisfies AppIconSpec,
}

/**
 * 三国（sg.wanqukongjian.cn，Cocos chessTower）。站点 HTTPS 证书只覆盖
 * www.wanqukongjian.cn、不含 sg 子域，浏览器在 iframe 里无法跳过证书错误，
 * 只能走 embed: 'none' 降级卡片；站方修复证书后把 embed 改成 'direct' 即可。
 */
const SANGUO: WebAppSite = {
  id: 'sanguo-chess-tower',
  name: '三国',
  url: 'https://sg.wanqukongjian.cn/',
  icon: { from: '#FFD60A', to: '#B25000', Icon: Gamepad2 } satisfies AppIconSpec,
  embed: 'none',
  note: '该站点的 HTTPS 证书只覆盖 www.wanqukongjian.cn，未包含 sg 子域，浏览器拒绝在窗口内加载。点击下方按钮在新标签页打开（首次需在浏览器中手动信任证书）；站点修复证书后本窗口即可直接游玩。',
}

/** 老游戏合集（zaixianwan.app）— 30000+ 中文老游戏在线玩（FC/SFC/N64/GBA/NDS/PS 等）。 */
const RETRO: WebAppSite = {
  id: 'zaixianwan-retro',
  name: '老游戏合集',
  url: 'https://zaixianwan.app/',
  icon: { from: '#FFC24B', to: '#E2571B', Icon: Gamepad2 } satisfies AppIconSpec,
}

/** 小黑屋（adarkroom.doublespeakgames.com）— A Dark Room 中文版，极简文字放置生存游戏。 */
const A_DARK_ROOM: WebAppSite = {
  id: 'a-dark-room',
  name: '小黑屋',
  url: 'https://adarkroom.doublespeakgames.com/?lang=zh_cn',
  icon: { from: '#48484A', to: '#1C1C1E', Icon: Gamepad2 } satisfies AppIconSpec,
}

/** Threej（threej.in）— 开源浏览器小游戏合集索引（街机/解谜/竞速/策略/棋牌），即点即玩。 */
const THREEJ: WebAppSite = {
  id: 'threej',
  name: 'Threej',
  url: 'https://threej.in/',
  icon: { from: '#00C7BE', to: '#0A5C5C', Icon: Gamepad2 } satisfies AppIconSpec,
}

/** 星团大作战（wangzifan396-wzf.github.io/mini-browser-games）— 球球大作战类中文网页对战。 */
const BALL_ARENA: WebAppSite = {
  id: 'ball-arena',
  name: '星团大作战',
  url: 'https://wangzifan396-wzf.github.io/mini-browser-games/ball-arena.html',
  icon: { from: '#7D7AFF', to: '#3423A6', Icon: Gamepad2 } satisfies AppIconSpec,
}

/** 迷你游戏合集（wangzifan396-wzf.github.io/mini-browser-games）— 115 款单文件开源浏览器小游戏在线试玩。 */
const MINI_GAMES: WebAppSite = {
  id: 'mini-browser-games',
  name: '迷你游戏合集',
  url: 'https://wangzifan396-wzf.github.io/mini-browser-games/',
  icon: { from: '#FF6482', to: '#B8125B', Icon: Gamepad2 } satisfies AppIconSpec,
}

/**
 * 2048（play2048.co，Gabriele Cirulli 原版）。站点通过 CSP frame-ancestors 只允许
 * 自身及官方域（next.play2048.co 等）嵌入，浏览器层面拒绝 iframe，同三国一样只能
 * 走降级卡片；站方放开限制后把 embed 改成 'direct' 即可。
 */
/** 网页游戏视图：站点 iframe + 悬浮返回键（游戏是全屏画布，返回键不占画布）。 */
function WebGameView({ site, onBack }: { site: WebAppSite; onBack: () => void }) {
  return (
    <div className="relative h-full">
      <WebEmbedFrame site={site} />
      <button
        onClick={onBack}
        className="absolute left-3 top-3 z-10 rounded-full bg-white/92 px-3 py-1.5 text-[12.5px] font-medium text-black/70 shadow-lg ring-1 ring-black/10 backdrop-blur transition-transform hover:scale-105"
      >
        ← Games
      </button>
    </div>
  )
}

function Games() {
  const [webGame, setWebGame] = useState<WebAppSite | null>(null)
  const open = useWindows((s) => s.open)
  if (webGame) return <WebGameView site={webGame} onBack={() => setWebGame(null)} />

  const cards = [
    { title: 'Snake', desc: 'The classic — arrow keys, neon green · 独立应用。', playable: true, play: () => open('snake'), gradient: 'linear-gradient(140deg,#30D158,#0a5c2e)', glyph: '🐍' },
    { title: '俄罗斯方块', desc: '原生 Tetris · 四档难度 · 本地分数排行。', playable: true, play: () => open('tetris'), gradient: 'linear-gradient(140deg,#22d3ee,#2563eb)', glyph: '🧩' },
    { title: 'Bubble Tanks', desc: '泡泡坦克 HTML5 重制版 — collect, grow, evolve.', playable: true, play: () => setWebGame(BUBBLE_TANKS), gradient: 'linear-gradient(140deg,#64D2FF,#0A84FF)', glyph: '🫧' },
    { title: '红色警戒2', desc: '红警 2 网页重制 · 联机对战平台。', playable: true, play: () => setWebGame(RA2_GONGHUI), gradient: 'linear-gradient(140deg,#FF453A,#8E1C14)', glyph: '☢️' },
    { title: '葫芦娃', desc: '葫芦娃 H5 网页游戏（Egret 引擎）。', playable: true, play: () => setWebGame(HLW), gradient: 'linear-gradient(140deg,#BF5AF2,#5E2FB8)', glyph: '🎮' },
    { title: '我的世界 H5', desc: 'bloxd.io · 类 Minecraft 方块沙盒。', playable: true, play: () => setWebGame(BLOXD), gradient: 'linear-gradient(140deg,#7CBD56,#4A7A2A)', glyph: '⛏️' },
    { title: 'MCJS', desc: '网页版 MC 中文版。', playable: true, play: () => setWebGame(MCJS), gradient: 'linear-gradient(140deg,#4DA3FF,#1E5FD6)', glyph: '🧱' },
    { title: '三国', desc: '三国主题 H5 游戏。', playable: true, play: () => setWebGame(SANGUO), gradient: 'linear-gradient(140deg,#FFD60A,#B25000)', glyph: '⚔️' },
    { title: '老游戏合集', desc: '30000+ 中文老游戏在线玩（FC/GBA/NDS/PS…）。', playable: true, play: () => setWebGame(RETRO), gradient: 'linear-gradient(140deg,#FFC24B,#E2571B)', glyph: '🕹️' },
    { title: '炎龙传说', desc: 'Flash 动作游戏 · Ruffle 本地回放 · 独立应用。', playable: true, play: () => open('ylcs3'), gradient: 'linear-gradient(140deg,#FF6B4A,#B22222)', glyph: '🐉' },
    { title: '小黑屋', desc: 'A Dark Room 中文 · 极简文字放置生存。', playable: true, play: () => setWebGame(A_DARK_ROOM), gradient: 'linear-gradient(140deg,#48484A,#1C1C1E)', glyph: '🔥' },
    { title: 'Threej', desc: '开源浏览器小游戏合集（街机/解谜/竞速/棋牌）。', playable: true, play: () => setWebGame(THREEJ), gradient: 'linear-gradient(140deg,#00C7BE,#0A5C5C)', glyph: '🎲' },
    { title: '星团大作战', desc: '球球大作战类网页对战 · 大逃杀/团队战等多模式。', playable: true, play: () => setWebGame(BALL_ARENA), gradient: 'linear-gradient(140deg,#7D7AFF,#3423A6)', glyph: '🌌' },
    { title: '迷你游戏合集', desc: '115 款单文件开源小游戏 · 在线试玩。', playable: true, play: () => setWebGame(MINI_GAMES), gradient: 'linear-gradient(140deg,#FF6482,#B8125B)', glyph: '👾' },
    { title: 'Chess', desc: 'Full board with move rules and capture log.', playable: true, play: () => open('chess'), gradient: 'linear-gradient(140deg,#C7A47A,#7A5230)', glyph: '♛' },
    { title: '2048', desc: '原生实现 · 方向键合并 · 本地最高分。', playable: true, play: () => open('2048'), gradient: 'linear-gradient(140deg,#FFD60A,#FF9F0A)', glyph: '2⁴⁸' },
    { title: 'Minesweeper', desc: '原生扫雷 · 三档难度 · 首点必安全 · 最快纪录。', playable: true, play: () => open('minesweeper'), gradient: 'linear-gradient(140deg,#8E8E93,#48484A)', glyph: '💣' },
    { title: '数字华容道', desc: '原生 15-puzzle · 随机走步保可解 · 最少步纪录。', playable: true, play: () => open('n-puzzle'), gradient: 'linear-gradient(140deg,#00C7BE,#0A5C5C)', glyph: '🔢' },
    { title: '五子棋', desc: '原生 Gomoku · 人机 AI / 双人对战。', playable: true, play: () => open('gomoku'), gradient: 'linear-gradient(140deg,#C7A47A,#5C3D1E)', glyph: '⚫' },
    { title: '数独', desc: '原生 Sudoku · 唯一解挖洞 · 三档难度 · 计时。', playable: true, play: () => open('sudoku'), gradient: 'linear-gradient(140deg,#64D2FF,#1E5FD6)', glyph: '🧮' },
    { title: '黑白棋', desc: '原生 Reversi · 位置加权 AI · 自动过手判定。', playable: true, play: () => open('reversi'), gradient: 'linear-gradient(140deg,#BF5AF2,#5E2FB8)', glyph: '⚪' },
    { title: '打砖块', desc: '原生 Breakout · 鼠标/键盘 · Web Audio 音效。', playable: true, play: () => open('breakout'), gradient: 'linear-gradient(140deg,#FF6482,#B8125B)', glyph: '💥' },
  ]

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-orange-50 to-white p-6 dark:from-[#241b10] dark:to-[#161618]">
      <div className="mb-5 flex items-center gap-3">
        <Gamepad2 size={26} className="text-orange-500" />
        <div>
          <h1 className="text-xl font-bold">Games</h1>
          <p className="text-[12.5px] text-black/50 dark:text-white/50">Small, playable, no downloads.</p>
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
        {cards.map((c) => (
          <button
            key={c.title}
            onClick={c.playable ? c.play : undefined}
            disabled={!c.playable}
            className={`overflow-hidden rounded-2xl text-left ring-1 ring-black/8 dark:ring-white/10 ${c.playable ? 'transition-transform hover:-translate-y-0.5 hover:shadow-lg' : 'opacity-55'}`}
          >
            <div className="flex h-24 items-center justify-center text-4xl" style={{ background: c.gradient }}>
              <span className="drop-shadow">{c.glyph}</span>
            </div>
            <div className="bg-white p-3 dark:bg-[#232325]">
              <div className="flex items-center justify-between font-semibold">
                {c.title}
                {!c.playable && <span className="rounded bg-black/8 px-1.5 text-[10px] text-black/45 dark:bg-white/10 dark:text-white/45">Soon</span>}
              </div>
              <div className="text-[12px] text-black/50 dark:text-white/50">{c.desc}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-6 rounded-xl bg-black/4 p-4 text-[12.5px] text-black/55 dark:bg-white/6 dark:text-white/55">
        Want another game? Create <code className="rounded bg-black/8 px-1 dark:bg-white/10">src/apps/games/</code> modules — or a whole new app directory; the system picks it up automatically.
      </div>
    </div>
  )
}

export default {
  id: 'games',
  name: 'Games',
  icon: { from: '#FF9F0A', to: '#F74F9E', Icon: Gamepad2 },
  component: Games,
  defaultSize: { w: 1020, h: 680 },
  minSize: { w: 640, h: 460 },
  category: 'Entertainment',
  keywords: ['snake', 'chess', 'bubble tank', '泡泡坦克', 'ra2', '红警', '红色警戒', '联机对战', '葫芦娃', 'hlw', 'bloxd', 'minecraft', '我的世界', '方块', '沙盒', 'mcjs', '网页版mc', '老游戏', '怀旧', '模拟器', 'fc', '红白机', '炎龙传说', '炎龙', 'ylcs3', 'flash', 'ruffle', '双燕', '小黑屋', 'a dark room', 'adarkroom', '放置', '文字游戏', 'threej', '浏览器游戏', '小游戏', '开源游戏', '星团大作战', '球球大作战', 'ball arena', '大逃杀', '迷你游戏合集', '单文件游戏', 'mini games', '2048', 'play2048', '数字', '合并', 'arcade', 'play'],
} satisfies AppDefinition

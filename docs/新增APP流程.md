# 新增 App 流程

本文总结在这个 macOS 27 桌面模拟项目里新增一个应用的完整流程。
详细的英文契约文档见 [app/src/apps/README.md](../app/src/apps/README.md)。

## 机制总览：自动发现，零注册

系统在启动时通过 `app/src/system/registry.ts:11` 的
`import.meta.glob('../apps/*/app.tsx', { eager: true })` 扫描 `app/src/apps/` 下
**所有包含 `app.tsx` 的目录**。每个目录默认导出一个 `AppDefinition`（契约定义在
`app/src/system/types.ts`），即自动成为系统应用，出现在 Dock、Launchpad、
Spotlight 和桌面上——**不需要在任何地方手动注册**。

项目里的应用有两种形态：

| 形态 | 现有例子 | 说明 |
|---|---|---|
| A. 标准 React 应用 | finder、notes、settings 等约 37 个 | 纯 React 组件，是默认方式 |
| B. 静态站点 + iframe 壳 | study（乐学二年级）、wakfu（攻略站） | 独立 HTML 站点放仓库根，React 壳只负责嵌入 |

---

## 流程 A：新增标准 React 应用

### 第 1 步：创建应用目录

```
app/src/apps/<id>/app.tsx     ← 必须，默认导出 AppDefinition
app/src/apps/<id>/data.ts     ← 可选，应用内容数据
app/src/apps/<id>/Foo.tsx     ← 可选，拆分的子组件
```

`<id>` 必须全局唯一（kebab-case），且与目录名一致——`registry.ts` 用它建
`appById` Map，重名的应用会互相覆盖。

### 第 2 步：编写 app.tsx

最小模板：

```tsx
// app/src/apps/hello/app.tsx
import { AppWindowProps } from '@/system/types'
import { Sparkles } from 'lucide-react'

function Hello({ winId, payload }: AppWindowProps) {
  return <div className="grid h-full place-items-center">Hello, {String(payload?.who ?? 'world')}</div>
}

export default {
  id: 'hello',              // 唯一，kebab-case，与目录名一致
  name: 'Hello',            // Dock / 菜单栏 / Launchpad 显示名
  icon: { from: '#7BF87B', to: '#0FD130', Icon: Sparkles },  // 渐变 + lucide 图标
  component: Hello,
  defaultSize: { w: 600, h: 400 },
  minSize: { w: 360, h: 240 },
  category: 'Utilities',
  keywords: ['demo', 'sample'],
} satisfies AppDefinition
```

### 第 3 步：AppDefinition 字段速查

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | ✓ | 稳定 id，等于目录名，`open('id')` 用它 |
| `name` | ✓ | 显示名 |
| `icon` | ✓ | `{ from, to, Icon, glyphColor? }` 渐变色 + lucide 图标，由 `AppIcon.tsx` 渲染 |
| `component` | ✓ | 窗口内容组件，props 为 `AppWindowProps` |
| `defaultSize` | ✓ | 初始窗口尺寸 |
| `minSize` | | 缩放下限（默认 420×300） |
| `category` | | Launchpad / Spotlight 分类 |
| `keywords` | | Spotlight 匹配关键词 |
| `singleton` | | 只允许一个窗口实例（如 Settings） |
| `inDock` | | **不在** `DOCK_ORDER` 里的应用要显示到 Dock 必须设 `true` |
| `keepAlive` | | 关闭后窗口原地隐藏而非卸载，重开秒恢复且保留运行状态。给 iframe 站点用（移动/卸载 iframe 会强制重载）；全局上限 2 个休眠窗口，按关闭顺序淘汰 |
| `popOutUrl` | | 标题栏“新标签页打开”按钮直接打开该 URL，而不是重启桌面（`?app=<id>`）。自包含站点（study/wakfu）用它做到弹出即开 |

### 第 4 步：窗口行为与 payload

组件收到的 props：

- `winId` — 窗口实例 id
- `payload` — 打开时传入的上下文对象

打开其他应用：`const { open } = useWindows()`（`@/system/stores/windows`），
调 `open('appId', payload)`。开窗逻辑自带去重：singleton 或无 payload 的打开
只聚焦已有窗口；payload 相同的重复打开也只聚焦（`windows.ts:62-74`）。

系统级 payload 约定（新应用可自行设计自己的 key）：

- Finder 打开文件 → `open('preview', { nodeId })`
- 桌面/文件夹打开 → `open('finder', { folder: folderId })`
- 设置面板 → `open('settings', { pane: 'wallpaper' })`

### 第 5 步：可复用的系统 store（zustand）

- `@/system/stores/windows` — `useWindows().open(appId, payload?)`
- `@/system/stores/system` — 主题（light/dark）、壁纸等系统设置
- `@/system/stores/fs` — 虚拟文件系统（Finder/Desktop/Preview 的数据源）
- `@/system/stores/notes` — 备忘录（文件夹/标签/置顶）

### 第 6 步：显示位置控制

- **Dock**：`registry.ts` 的 `DOCK_ORDER` 数组按顺序列出内置应用；不在名单里
  的应用需要 `inDock: true` 才会追加到 Dock 尾部，否则只进 Launchpad
- **Launchpad**：全部应用，按 `name` 字母排序
- **Spotlight**：按 `name`（包含匹配）和 `keywords`（前缀匹配）搜索，
  `category` 仅作为结果副标题显示（`Spotlight.tsx:23-25`）

### 第 7 步：样式与资源约定

- 用 Tailwind 写样式，暗色模式用 `dark:` 类（`dark` 类挂在 `<html>` 上，
  由 设置 → 外观 切换）
- 窗口内容自己滚动（根节点加 `overflow-y-auto`）
- 应用自己的状态、数据、资源**全部收在应用目录内**，只有上述系统 store 例外
- 引用仓库根的静态媒体（图片/音频等）时 URL 必须带
  `` `${import.meta.env.BASE_URL}` `` 前缀（如 `BASE_URL + 'photo-1.jpg'`），
  否则部署到 `/macos27/` 子路径时会 404

窗口装饰（红绿灯、拖拽、8 向缩放、最小化、最大化、焦点/z 序）由系统
`WindowFrame` 组件提供，应用无需实现。

---

## 流程 B：新增静态站点嵌入应用（Study 模式）

适用于已有独立 HTML 应用（自有主题引擎、无构建依赖），如 `study/index.html`、
`wakfu/`。

### 第 1 步：静态站点放仓库根

站点目录放在仓库根（如 `study/index.html`），保持原样不做打包。

### 第 2 步：在 vite.config.ts 登记两处

`app/vite.config.ts`：

1. `STATIC_SITES` 数组（第 18 行）加入 `'/macos27/<site>/'` —— dev 服务器的
   `rootStatic` 中间件会按原样服务这个路径
2. `copyRootStatic` 插件的 `for (const site of ['study', 'wakfu'])` 循环
   （第 56 行）加入 `'<site>'` —— build 后整目录拷贝进 `dist/<site>/`

### 第 3 步：写 React 壳

在 `app/src/apps/<id>/app.tsx` 用 iframe 嵌入（参考
`app/src/apps/study/app.tsx`）：

```tsx
const SITE_URL = `${import.meta.env.BASE_URL}study/index.html`

function StudyApp({ winId }: AppWindowProps) {
  const src = useMemo(() => `${SITE_URL}?w=${winId}`, [])
  return <iframe ref={iframeRef} src={src} title="…" className="min-h-0 w-full flex-1 border-0" />
}
```

`AppDefinition` 的导出方式与流程 A 完全相同。

### 第 4 步（可选）：与桌面主题联动

Study 壳演示了联动方式：监听 `useSystem` 的主题变化，写入 iframe 文档的
`documentElement.dataset.lx`（`study/app.tsx:36-50`）；用户手动选择的主题存
localStorage，手动选择后不再跟随桌面。

### 嵌入站点的性能约定

- iframe 的 src 用**固定 URL**，不要拼 per-window 参数（如 `?w=${winId}`）——
  URL 一变 HTTP 缓存就完全失效，每次开窗都重新下载整个站点
- 站点的大块 CSS/JS 拆成外链文件（study 已拆为 `study/app.css`、
  `study/app.js`），浏览器才能跨次打开复用编译产物；全内联的单文件每次都要
  重新解析执行
- 需要“关窗再开还是原来那个页面”的话设 `keepAlive: true`：系统会把窗口原地
  隐藏而不卸载（iframe 一旦离开 DOM 或重新挂载就会重载），重开时直接恢复
- 弹出新标签页用 `popOutUrl` 指到站点本身，跳过桌面启动
- Service Worker / manifest 等路径一律用相对路径，站点在 `/macos27/wakfu/`
  这类子路径下，绝对路径会指向站点根（wakfu 已修）

---

## 验证与发布

1. `npm run dev` — 打开 http://localhost:5173/macos27/ （本地默认 BASE 为
   `/macos27/`；`CF_PAGES`/`WORKERS_CI` 环境下为 `/`）。检查：
   Dock 图标 → Launchpad → Spotlight 搜索 → 打开窗口 → 拖拽/缩放/最小化 →
   带 payload 的打开路径
2. `npm run typecheck` — TS 检查
3. `npm run build` — 产物输出到 `dist/`；流程 B 的静态站点会整目录拷入
   `dist/<site>/`，根目录媒体文件也会镜像进 dist
4. 发布：
   - **GitHub Pages**：`scripts/deploy-root.sh` 把 `dist/index.html` 和
     hash 资源同步回仓库根，commit + push 即发布（静态站点本身就在仓库根，
     由 Pages 直接服务）
   - **Cloudflare Pages/Workers**：直接部署 `dist/`，已是完整站点

## 常见坑

- `id` 重名会静默覆盖（`appById` 是 Map，后加载的覆盖先加载的）
- 静态资源/站点 URL 漏掉 `${import.meta.env.BASE_URL}` 前缀 → 部署到
  `/macos27/` 子路径后 404
- 想让应用进 Dock 却只看到它在 Launchpad → 非 `DOCK_ORDER` 应用要显式
  `inDock: true`
- 期望每次点击都开新窗口 → 无 payload 或 singleton 的打开只聚焦已有窗口，
  这是系统约定行为（`windows.ts:62-74`）
- 应用需要持久化状态时自行用 localStorage（参考 study 的 `lx-theme`），
  不要写进系统 store

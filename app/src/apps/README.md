# Building an app for this system

Every directory under `src/apps/` that contains an `app.tsx` **is** an app.
The system auto-discovers them at load time (`src/system/registry.ts` uses
`import.meta.glob('../apps/*/app.tsx')`) and lists them in the Dock,
Launchpad, Spotlight and desktop — you never register anything by hand.

## Minimal app

```tsx
// src/apps/hello/app.tsx
import { AppWindowProps } from '@/system/types'
import { Sparkles } from 'lucide-react'

function Hello({ winId, payload }: AppWindowProps) {
  return <div className="grid h-full place-items-center">Hello, {String(payload?.who ?? 'world')}</div>
}

export default {
  id: 'hello',              // unique, kebab-case — same as the directory name
  name: 'Hello',            // shown in Dock / menu bar / Launchpad
  icon: { from: '#7BF87B', to: '#0FD130', Icon: Sparkles },  // gradient + lucide glyph
  component: Hello,
  defaultSize: { w: 600, h: 400 },
  minSize: { w: 360, h: 240 },
  category: 'Utilities',
  keywords: ['demo', 'sample'],
} satisfies AppDefinition
```

That's it — a new directory with this file and the app appears everywhere.

## AppDefinition fields

| field | required | meaning |
|---|---|---|
| `id` | ✓ | stable id; matches directory name; used in `open('id')` |
| `name` | ✓ | display name |
| `icon` | ✓ | `{ from, to, Icon, glyphColor? }` — gradient stops + lucide icon |
| `component` | ✓ | `React.Component<AppWindowProps>` — the window content |
| `defaultSize` | ✓ | initial window size |
| `minSize` | | resize floor (default 420×300) |
| `category` | | shown in Launchpad/Spotlight |
| `keywords` | | Spotlight matching |
| `singleton` | | only one window allowed (Settings uses this) |
| `inDock` | | force into Dock even if not in `DOCK_ORDER` (registry.ts) |

## What you get for free

- **Window chrome**: traffic lights, drag, 8-direction resize, minimize,
  maximize, focus/z-order — from `WindowFrame`.
- **`payload`**: whatever the opener passed. System-wide conventions:
  - Finder opens files → `open('preview', { nodeId })`
  - Desktop/folder opens → `open('finder', { folder: folderId })`
  - Settings panes → `open('settings', { pane: 'wallpaper' })`
  - Any app can `open('yourapp', { ... })` — design your own payload keys.
- **Stores** you can reuse (zustand):
  - `@/system/stores/windows` — `useWindows().open(appId, payload?)`
  - `@/system/stores/system` — theme (`light/dark`), wallpaper
  - `@/system/stores/fs` — virtual file system (Finder/Desktop/Preview data)
  - `@/system/stores/notes` — notes with folders/tags/pins

## Conventions

- Style with Tailwind; honor dark mode via `dark:` classes (the `dark`
  class lives on `<html>`, switched by System Settings → Appearance).
- Window content scrolls itself (`overflow-y-auto` on your root).
- Keep all app state, assets and data **inside your app directory**
  (`app.tsx`, `Foo.tsx`, `data.ts`). Reach for shared stores only through
  the system modules listed above.
- Files/media served from the repo root: prefix URLs with
  `` `${import.meta.env.BASE_URL}` `` (e.g. `BASE_URL + 'photo-1.jpg'`).

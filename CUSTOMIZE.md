# Customization guide

The desktop is now **real source code** (v2 rebuild) — no more editing the minified
bundle. Layers, easiest first:

## 1. Swap media (zero code)

Every media file currently in the repo is a **generated gradient placeholder**
(see `scripts/gen-media.mjs`) — that's why they're `.svg` and ~545 bytes each,
not the original JPGs.

Drop in your own files under the **same filenames** at the repo root:

- **Wallpapers** — `wallpaper-graphite.svg` (default), `wallpaper-glass-dark.svg`,
  `wallpaper-glass-light.svg`, `wallpaper-aurora.svg`, `wallpaper-sunset.svg`,
  `wallpaper-mint.svg` (2560×1600-ish). The list lives in
  `src/system/stores/system.ts` (`WALLPAPERS`).
- **Photos app** — `photo-1.svg` … `photo-8.svg`
- **Music/Podcasts** — `cover-1.svg` … `cover-4.svg`, `podcast-cover.svg`,
  `track-1.mp3` … `track-4.mp3`
- **Login avatar / favicon** — `avatar.svg`

⚠️ **Watch the extension.** The paths are hardcoded, so `photo-1.svg` is
referenced as `photo-1.svg` in `src/apps/photos/data.ts`. If you supply
`photo-1.jpg` instead, **nothing changes and nothing errors** — you must also
update the reference. Either keep the `.svg` extension, or edit the matching
data file in the same commit:

| Media | Reference to update |
|---|---|
| Wallpapers | `src/system/stores/system.ts` (`WALLPAPERS`) |
| Photos | `src/apps/photos/data.ts` |
| Music | `src/apps/music/data.ts` |
| Podcasts | `src/apps/podcasts/data.ts` |

`avatar-lotus.jpg` is an unused leftover — nothing references it.

## 2. Edit content (per-app data files)

Every app keeps its content in its own directory — usually `src/apps/<id>/data.ts`:

| Want to change | Edit |
|---|---|
| Résumé PDF, Welcome.txt, Documents files, Ventures folder | `src/system/fs-seed.ts` (generated — see below) |
| Notes | `src/system/notes-seed.ts` |
| Mail stories | `src/apps/mail/data.ts` |
| Contacts (real card) | `src/apps/contacts/data.ts` |
| Music/Podcast tracks | `src/apps/music/data.ts`, `src/apps/podcasts/data.ts` |
| Photos captions/dates | `src/apps/photos/data.ts` |
| Stocks watchlist | `src/apps/stocks/data.ts` |
| Dictionary words | `src/apps/dictionary/data.ts` |

`fs-seed.ts` and `notes-seed.ts` were **generated once** from the original bundle
and are now ordinary source files — **edit them directly.**

⚠️ **Do not re-run `scripts/sync-extracted.mjs` casually.** It overwrites all 14
per-app `data.ts` files plus `fs-seed.ts` and `notes-seed.ts` wholesale, with no
merge — every hand edit is lost. It's also no longer runnable: it reads
`/tmp/extracted/*.json`, which no longer exists (the repo's `extracted/` is
empty and the extraction JSON was never committed). Treat the committed
`data.ts` files as the source of truth; the file-header banners saying
"edit `/tmp/extracted/*.json` instead" are stale.

## 3. Add a whole new app

Create `src/apps/<your-app>/app.tsx`:

```tsx
import { Rocket } from 'lucide-react'
import type { AppDefinition } from '@/system/types'

function RocketApp() {
  return <div className="grid h-full place-items-center">🚀</div>
}

export default {
  id: 'rocket',
  name: 'Rocket',
  icon: { from: '#FF6B6B', to: '#FA2D55', Icon: Rocket },
  component: RocketApp,
  defaultSize: { w: 600, h: 400 },
  minSize: { w: 360, h: 240 },
  category: 'Utilities',
} satisfies AppDefinition
```

That's it — the system auto-discovers it at load time and shows it in the Dock,
Launchpad, Spotlight. Full contract + available stores: [src/apps/README.md](src/apps/README.md).

## 4. System-level knobs

- **Default theme / wallpaper** — `src/system/stores/system.ts`
- **Dock order** — `DOCK_ORDER` in `src/system/registry.ts`
- **Window chrome, traffic lights, resize** — `src/system/components/WindowFrame.tsx`
- **Glass look** — `.glass` / `.glass-refract` in `src/index.css`; the refraction
  distortion is the inline `<filter id="lg-refraction">` in `index.html`
  (tweak `baseFrequency` / `scale`).
- **Fonts** — intentionally system-stack only (`--font-ui` in `src/index.css`).
  The original Google Fonts link was removed after it measured as a multi-second
  first-paint blocker on networks where Google is unreachable.

## Hosting-path note

`vite.config.ts` picks the base by host: Cloudflare build CI (`CF_PAGES` on
Pages, `WORKERS_CI` on Workers Builds) serves at `/`, GitHub Pages and local
builds at `/macos27/`. App code
should reference media through `import.meta.env.BASE_URL`; the music/podcast/
photo data files predate that and hardcode `/macos27/…`, so the build mirrors
the repo-root media into `dist/macos27/` (`copyRootStatic` plugin) to cover
them. New code should stick to `BASE_URL`.

## Re-fetching the original media (if you ever want them)

The origin (`macos27.kimi.page`) was blocked by this network's SafeBrowse filter
at clone time. From an unfiltered network you can try:

```
https://macos27.kimi.page/wallpaper-aurora.jpg   (+ glass-dark, glass-light)
https://macos27.kimi.page/photo-1.jpg … photo-8.jpg, import.jpg
https://macos27.kimi.page/cover-2.jpg … cover-4.jpg, podcast-cover.jpg
https://macos27.kimi.page/track-1.mp3 … track-4.mp3
```

## History

The original site was a minified Vite bundle (an AI-generated "macOS 27" Kimi
share demo, rebranded + redeployed). v2 reconstructed the full source tree:
system shell in `src/system`, 34 apps in `src/apps`, all content extracted from
the old bundle into per-app data files. The old artifact is preserved as
`index.legacy.html` + the git history.

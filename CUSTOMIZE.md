# Customization guide

The desktop is now **real source code** (v2 rebuild) — no more editing the minified
bundle. Layers, easiest first:

## 1. Swap media (zero code)

Drop in your own files under the **same filenames** at the repo root:

- **Wallpapers** — `wallpaper-tahoe-day.jpg` (default), `wallpaper-aurora.jpg`,
  `wallpaper-bigsur.jpg`, `wallpaper-glass-dark.jpg`, `wallpaper-glass-light.jpg`
  (2560×1600-ish). The list lives in `src/system/stores/system.ts` (`WALLPAPERS`).
- **Photos app** — `photo-1.jpg` … `photo-8.jpg`, `import.jpg`
- **Music/Podcasts** — `cover-1.jpg` … `cover-4.jpg`, `podcast-cover.jpg`,
  `track-1.mp3` … `track-4.mp3`

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

`fs-seed.ts` and `notes-seed.ts` were **generated** from the original bundle
(`scripts/sync-extracted.mjs` + the extraction JSON). They're plain source files
now — edit them directly. To regenerate from scratch, re-run the extraction
against `assets/index-Bfk0NWYJ.js` (kept in git history) and re-run the script.

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

`vite.config.ts` picks the base by host: Cloudflare Pages builds (set via
`CF_PAGES=1` in its env) serve at `/`, GitHub Pages at `/macos27/`. App code
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
system shell in `src/system`, 37 apps in `src/apps`, all content extracted from
the old bundle into per-app data files. The old artifact is preserved as
`index.legacy.html` + the git history.

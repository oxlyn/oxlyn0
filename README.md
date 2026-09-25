# Oxlyn — a macOS 27 desktop simulation in your browser

A full macOS desktop simulation running in the browser — window manager, Dock,
Spotlight, Launchpad, a virtual file system, and 30+ working apps. Log in and
explore: every app works.

- **Finder** — a real virtual file system: create/rename/move to Trash, persists
- **Notes / Mail / Contacts / Calendar / Reminders** — self-contained demo data
- **DevKit** — a 21-tool developer toolbox (all local, nothing uploaded)
- **Terminal** — a small working shell over the same virtual file system
- **Study / Wakfu Guide** — embedded external sites (kept alive across window close)

## Keyboard

| Key | Action |
|---|---|
| `F4` | Full-screen Launchpad (the Dock's **Apps** icon opens the windowed one) |
| `⌘K` / `Ctrl+Space` | Spotlight |
| `Esc` | Close Spotlight/Launchpad, or leave focus mode |

In Finder: select a file, then **Move to Trash** / **Rename** from the toolbar
(Enter commits a rename, Esc cancels). Inside the Trash the button becomes
**Empty Trash**.

## Architecture (v2 rebuild)

TypeScript + JSX + [rolldown-vite] (the Rolldown app bundler — same core as tsdown,
with the dev server/HTML entry an SPA needs) + Tailwind 4 + zustand.
The Vite project lives in `app/` (source entry `app/index.html`); the repo root
keeps static media + the deployed artifact so GitHub Pages serves `/macos27/*` directly.

```
app/
  index.html         ← Vite source entry (deploy never touches it)
  src/
    system/          ← the "OS": window manager, menu bar, Dock, desktop,
      stores/          login, Launchpad, Spotlight, virtual file system
      components/
      registry.ts    ← AUTO-DISCOVERS all apps (import.meta.glob)
    apps/            ← every app, one directory each, fully self-contained
      <id>/
        app.tsx      ← exports AppDefinition { id, name, icon, component, size }
        data.ts      ← app content
study/index.html     ← 乐学二年级 practice app, embedded verbatim by the Study app
wakfu/               ← Wakfu 攻略站「万象之扉」, embedded verbatim by the Wakfu Guide app
```

**Adding an app = creating one directory.** Drop `app/src/apps/<id>/app.tsx` that
default-exports an `AppDefinition` (see [app/src/apps/README.md](app/src/apps/README.md))
and the system shows it on the Dock, Launchpad, Spotlight and desktop automatically
at load time — nothing else to wire.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173/macos27/
```

## Deploy

**GitHub Pages** (deploy-from-root, current):

```bash
scripts/deploy-root.sh   # build → inject modulepreload → copy dist/index.html + dist/assets/ into the repo root
```

Media (wallpapers/photos/tracks) lives at the repo root so GitHub Pages serves it
at `/macos27/*`; `vite.config.ts` sets the matching `base` and a dev middleware
serves it locally. A service worker (`sw.js`) caches hashed bundles and refreshes
un-hashed files in the background, so repeat visits and offline boots work.

**Cloudflare Pages** (auto-deploy from the GitHub mirror): connect the repo in
the Pages dashboard — build command `npm run build`, output dir `dist`, env
`NODE_VERSION=22`. Cloudflare's build CI (`CF_PAGES` on Pages, `WORKERS_CI` on
Workers Builds) flips `base` to `/`; `copyRootStatic` mirrors repo-root media +
`study/` + `wakfu/` into `dist` so every runtime path resolves without the
GitHub-root layout. `wrangler.jsonc` points the deploy step at `dist`.

---

### Provenance & tech

Built on the open "macOS 27" Liquid Glass browser simulation (an AI-generated Kimi share demo, recovered via the Wayback Machine when the origin was network-blocked), then rebuilt end-to-end. v2 reconstructed the shipped bundle into a typed source tree: the system shell in `src/system`, all 34 apps as self-registering modules in `src/apps`. Weather (Open-Meteo) and Dictionary (dictionaryapi.dev) are live keyless APIs. Fonts are system-stack only — the Google Fonts link was removed after it was measured blocking first paint for seconds where Google is unreachable.

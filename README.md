# Oxlyn — Interactive Resume

**Live: https://wilsonwu-ai.github.io/macos27/**

My resume, running as a full macOS desktop simulation in the browser. Log in and explore — every app works:

- **Notes** — who I am, how I think about AI engineering and GTM strategy
- **Mail** — project stories (real engineering war stories, my training system, how Snappy sells)
- **Documents** — AI engineering field notes, reading list, 2026 focus
- **Desktop → Ventures** — Dubbs Capital thesis, Snappy GTM
- **Downloads → Resume — Oxlyn.pdf** — opens in Preview
- **Contacts** — my card (real contact info)
- **Photos** — Skylar 🐾

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
        data.ts      ← app content (extracted from the original bundle)
study/index.html     ← 乐学二年级 practice app, embedded verbatim by the Study app
wakfu/               ← Wakfu 攻略站「万象之扉」, embedded verbatim by the Wakfu Guide app
```

**Adding an app = creating one directory.** Drop `app/src/apps/<id>/app.tsx` that
default-exports an `AppDefinition` (see [app/src/apps/README.md](app/src/apps/README.md))
and the system shows it on the Dock, Launchpad, Spotlight automatically at load
time — nothing else to wire. The Study app was added this way in minutes.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173/macos27/
```

## Deploy

**GitHub Pages** (deploy-from-root, current):

```bash
scripts/deploy-root.sh   # build → copy dist/index.html + dist/assets/ into the repo root
```

Media (wallpapers/photos/tracks) lives at the repo root so GitHub Pages serves it
at `/macos27/*`; `vite.config.ts` sets the matching `base` and a dev middleware
serves it locally.

**Cloudflare Pages** (auto-deploy from the GitHub mirror): connect the repo in
the Pages dashboard — build command `npm run build`, output dir `dist`, env
`NODE_VERSION=22`. Cloudflare's build CI (`CF_PAGES` on Pages, `WORKERS_CI` on
Workers Builds) flips `base` to `/`; `copyRootStatic` mirrors repo-root media +
`study/` + `wakfu/` into `dist` so every runtime path resolves without the
GitHub-root layout. `wrangler.jsonc` points the deploy step at `dist`.

## Who

Operator of three ventures, deliberately building toward AI engineering:

| Venture | Role | Since |
|---|---|---|
| **Dubbs Capital** | Founder & CEO — acquire/build highly predictable B2B technology companies | 2020 |
| **Snappy** | CRO & minority investor — presentation studio serving restaurants (founded 2016); own revenue + GTM | 2022 |
| **Union Made Apparel** | Owner-operator — physical product, e-commerce | 2022 |

M.S. Computer Science — Georgia Tech (OMSCS), in progress · M.B.A. — Duke University, 2019. Focus: agents, RAG, evaluation, GTM for B2B, restaurant tech.

## Public work

- [macos27](https://github.com/wilsonwu-ai/macos27) — this site
- [basenotes](https://github.com/wilsonwu-ai/basenotes) — Shopify storefront engineering (Cloudflare Workers, HMAC-signed App Proxy, metafields)
- [allfish](https://github.com/wilsonwu-ai/allfish) — "AllTrails for anglers," React + MapLibre

## Contact

**wilson1.wu@gmail.com · (416) 412-1927 · [LinkedIn](https://www.linkedin.com/in/wilson1wu/) · [github.com/wilsonwu-ai](https://github.com/wilsonwu-ai)**

---

### Provenance & tech

Built on the open "macOS 27" Liquid Glass browser simulation (an AI-generated Kimi share demo, recovered via the Wayback Machine when the origin was network-blocked), then customized end-to-end. v2 rebuilt the shipped bundle into a typed source tree: the system shell in `src/system`, all 37 apps as self-registering modules in `src/apps`, content extracted from the original bundle into per-app data files (`scripts/sync-extracted.mjs`). Weather (Open-Meteo) and Maps (OpenStreetMap) are live keyless APIs. Fonts are system-stack only — the Google Fonts link was removed after it was measured blocking first paint for seconds where Google is unreachable.

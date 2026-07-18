# Customization guide

The app is a minified Vite bundle (`assets/index-Bfk0NWYJ.js`) — there's no original source. Three safe customization layers, easiest first.

## 1. Swap media (zero code)

Drop in your own files under the **same filenames**:

- **Wallpapers** — `wallpaper-tahoe-day.jpg` (default), `wallpaper-aurora.jpg`, `wallpaper-bigsur.jpg`, `wallpaper-glass-dark.jpg`, `wallpaper-glass-light.jpg` (2560×1600-ish)
- **Photos app** — `photo-1.jpg` … `photo-8.jpg`, `import.jpg`
- **Music/Podcasts** — `cover-1.jpg` … `cover-4.jpg`, `podcast-cover.jpg`, `track-1.mp3` … `track-4.mp3`

## 2. Rebrand the user identity (string edits in the bundle)

> **✅ Applied 2026-07-18:** kimi→wilson executed across all 64+ surfaces — login/lock screen ("wilson", W avatar), `/Users/wilson`, Apple ID `wilson1.wu@gmail.com`, "Wilson's MacBook Pro", Terminal prompt `wilson@macbook`, Activity Monitor process owners, sudoers easter egg, Mail bodies ("Dear Wilson,"), HomeKit "Wilson's Home", fake GitHub `owner:"wilsonwu-ai"`. Contacts card uses a fictional (416) 555-0100 — deliberately NOT the real cell (public repo). The table below remains as the map of identity surfaces.

All identity strings live as quoted literals in `assets/index-Bfk0NWYJ.js` (~64 hits for `kimi`). Key anchors, greppable verbatim:

| Anchor | Controls |
|---|---|
| `user:{name:"kimi"}` | Global user config (boot/login name) |
| `"/Users/kimi/` (many) | Finder paths — home dir, Documents, Downloads, Music, Pictures, Movies |
| `kimi@icloud.com` | Apple-ID identity in System Settings / Mail |
| `kimi’s MacBook Pro` | Device name (Settings, Bluetooth) — note the curly apostrophe `’` |
| `parentId:"users",name:"kimi"` | Finder /Users folder entry |
| `author:"kimi"` / `owner:"kimi"` | Fake Hacker News / GitHub content inside Safari |
| `(415) 555-0100` / `Oakland, CA 94607` | Contacts card sample data |

Safe bulk edit (careful, case-sensitive, review after):

```bash
# macOS sed; keep the quotes in the pattern so code identifiers are untouched
sed -i '' 's/"kimi"/"wilson"/g; s|/Users/kimi|/Users/wilson|g; s/kimi@icloud.com/you@example.com/g; s/kimi’s MacBook Pro/Wilson’s MacBook Pro/g' assets/index-Bfk0NWYJ.js
```

Do **not** blind-replace bare `kimi` — it also appears in non-UI contexts.

## 3. Style overrides (CSS)

Add a `<link rel="stylesheet" href="./custom.css">` in `index.html` **after** the bundle CSS and override freely — the UI uses ordinary DOM/Tailwind classes. The liquid-glass refraction filter is the inline `<svg><filter id="lg-refraction">` block in `index.html`; tweak `baseFrequency`/`scale` there to change the glass distortion.

## Finding any component: `code-path` attributes

The build instruments every DOM node with a `code-path` attribute pointing at its original source location (e.g. `code-path="src/main.tsx:5:53"`, `src/apps/Music/...`). Workflow: right-click → Inspect any UI element in the browser → read its `code-path` → grep the bundle for that exact string to land on the component that renders it. This makes targeted edits in the minified bundle practical.

## Hosting-path note

All media references were rewritten from root-absolute (`"/wallpaper-…"`) to `"/macos27/…"` to work under GitHub Pages subpath hosting. If you ever move this to a domain root (custom domain or a `wilsonwu-ai.github.io` root repo), reverse that: `sed -i '' 's|"/macos27/|"/|g' assets/index-Bfk0NWYJ.js`.

## Other knobs spotted in the bundle

- `skipBoot:!1` — flip `!1`→`!0` to skip the boot animation.
- `showBatteryPercent:!1` — menu bar battery percent default.
- Default theme: `data-theme="light"` on `<html>` in `index.html`.

## Re-fetching the original media (if you ever want them)

The origin (`macos27.kimi.page`) was blocked by this network's SafeBrowse filter at clone time and only 7 URLs exist in the Wayback Machine. From an unfiltered network (e.g., phone hotspot) you can try:

```
https://macos27.kimi.page/wallpaper-aurora.jpg   (+ glass-dark, glass-light)
https://macos27.kimi.page/photo-1.jpg … photo-8.jpg, import.jpg
https://macos27.kimi.page/cover-2.jpg … cover-4.jpg, podcast-cover.jpg
https://macos27.kimi.page/track-1.mp3 … track-4.mp3
```

## Long-term option

For deep customization (new apps, real content), ask Claude to de-minify/reconstruct specific app components out of the bundle into editable source, or rebuild the shell from scratch using this as the visual reference.

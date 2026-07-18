# macOS 27 — in-browser desktop

A pixel-faithful "Liquid Glass" macOS desktop simulation that runs entirely in the browser. React + Zustand SPA (Vite build), Tailwind CSS, no backend.

Cloned 2026-07-17 from the public demo `macos27.kimi.page` (an AI-generated Kimi share page) as a base for personal customization. Recovered via the Wayback Machine snapshot of 2026-07-16/17 because the origin was unreachable at clone time. The Kimi analytics tag (`sdk-seed.js`) has been removed.

## What's inside the simulation

Boot sequence → desktop with menu bar, Dock, Control Center, Spotlight, Mission Control, and working app windows: Finder, Safari, Music, Photos, Maps (live OpenStreetMap), Weather (live Open-Meteo), Terminal, Notes, Calculator, Calendar, Mail, Messages, FaceTime, Podcasts, TV, News, App Store, System Settings, TextEdit, Preview, Photo Booth, Trash.

## File map

| Path | What it is |
|---|---|
| `index.html` | Shell: fonts, liquid-glass SVG filter, mounts `#root` |
| `assets/index-Bfk0NWYJ.js` | The entire app — minified React bundle (~2.3 MB) |
| `assets/index-BqrKPhU7.css` | Tailwind CSS build (~82 KB) |
| `wallpaper-*.jpg` (×5) | Desktop wallpapers (`tahoe-day` is the default) |
| `photo-*.jpg` (×8) | Photos app library |
| `cover-*.jpg`, `podcast-cover.jpg` | Music/Podcasts artwork |
| `track-*.mp3` (×4) | Music app tracks |
| `import.jpg` | Photos import sample |

**Provenance:** `index.html`, both `assets/` files, `wallpaper-tahoe-day.jpg`, `wallpaper-bigsur.jpg`, and `cover-1.jpg` are original (Wayback-recovered). All other media are locally generated placeholders — the archive never captured them. Replace them with your own content (same filenames = zero code changes).

## External runtime dependencies (all keyless/public — fine on GitHub Pages)

- Google Fonts (Inter)
- Open-Meteo API (Weather app)
- OpenStreetMap tiles + Nominatim + OSRM (Maps app)
- Sample videos from Google's public bucket and MDN (TV app)

## Customizing (see CUSTOMIZE.md)

The bundle is minified build output (no source map), so customization is: swap media files, override CSS, or edit quoted strings in the bundle. `CUSTOMIZE.md` documents the exact anchors.

## Run locally

Any static server, e.g.: `python3 -m http.server 8000` → http://localhost:8000

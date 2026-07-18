# Wilson Wu — Interactive Resume

**Live: https://wilsonwu-ai.github.io/macos27/**

My resume, running as a full macOS desktop simulation in the browser. Log in and explore — every app works:

- **Notes** — who I am, how I think about AI engineering and GTM strategy
- **Mail** — project stories (real engineering war stories, my training system, how Snappy sells)
- **Documents** — AI engineering field notes, reading list, 2026 focus
- **Desktop → Ventures** — Dubbs Capital thesis, Snappy GTM
- **Downloads → Resume — Wilson Wu.pdf** — opens in Preview
- **Contacts** — my card (real contact info)
- **Photos** — Skylar 🐾

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

Built on the open "macOS 27" Liquid Glass browser simulation (an AI-generated Kimi share demo, recovered via the Wayback Machine when the origin was network-blocked), then customized end-to-end: identity, all content surfaces, media, and GitHub Pages deployment. React + Zustand SPA, Tailwind CSS, no backend. Weather (Open-Meteo) and Maps (OpenStreetMap) are live keyless APIs. See `CUSTOMIZE.md` for the full customization map.

Run locally: media paths are prefixed `/macos27/`, so serve the parent directory — from `~/Desktop`: `python3 -m http.server 8000` → http://localhost:8000/macos27/

/* macos27 shell service worker — runtime caching, no build coupling.
 *
 * Strategy per request class (same-origin GET only):
 *   navigations (HTML)        network-first, cached offline fallback
 *   /assets/*.js|css          cache-first — hashed file names, immutable
 *   everything else (media,   stale-while-revalidate — instant hit, freshened
 *   study/, devkit/ sites)    in the background
 *
 * Bump VERSION when un-hashed files change and staleness matters (hashed
 * bundles never need it). Cross-origin requests (weather/dictionary APIs)
 * and Range requests (audio seeking) pass through untouched.
 */
const VERSION = 'v1'
const SHELL_CACHE = `macos27-shell-${VERSION}`
const PAGES_CACHE = `macos27-pages-${VERSION}`

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      // Warm the shell cache from the document's own asset list —
      // deploy-root.sh injects a modulepreload link for every hashed chunk,
      // so the full shell precaches in one pass and the second visit is
      // entirely cache-served. The document itself seeds the offline fallback.
      try {
        const doc = await fetch(self.registration.scope, { cache: 'no-cache' })
        if (doc.ok) {
          // Seed the offline fallback BEFORE reading the body — cache.put
          // consumes the response it is given.
          await (await caches.open(PAGES_CACHE)).put(self.registration.scope, doc.clone())
          // Capture the FULL attribute value (/base/assets/x.js), not a tail
          // starting at /assets/ — an absolute path fed to new URL() would
          // resolve against the origin root and drop the deployment prefix.
          const urls = [...(await doc.text()).matchAll(/(?:href|src)="([^"]+\/assets\/[A-Za-z0-9_-]+\.(?:js|css))"/g)].map(
            (m) => new URL(m[1], self.registration.scope).href,
          )
          const cache = await caches.open(SHELL_CACHE)
          await Promise.all([...new Set(urls)].map((u) => cache.add(u).catch(() => {})))
        }
      } catch {
        /* first run offline — runtime caching still fills on later loads */
      }
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys())
        if (name.startsWith('macos27-') && name !== SHELL_CACHE && name !== PAGES_CACHE) await caches.delete(name)
      // Trim hashed entries the current document no longer references, so
      // old-deploy bundles don't accumulate across releases.
      try {
        const doc = await fetch(self.registration.scope, { cache: 'no-cache' })
        const live = new Set(
          [...(await doc.text()).matchAll(/(?:href|src)="([^"]+\/assets\/[A-Za-z0-9_-]+\.(?:js|css))"/g)].map(
            (m) => new URL(m[1], self.registration.scope).href,
          ),
        )
        const cache = await caches.open(SHELL_CACHE)
        for (const req of await cache.keys()) if (!live.has(req.url)) await cache.delete(req)
      } catch {
        /* offline — keep the existing cache untouched */
      }
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return
  // Audio/video seeking issues Range requests — never cache partial content.
  if (event.request.headers.has('range')) return

  // Navigations: always try the network so updates ship immediately; the
  // cached page keeps the site bootable offline. ?app= shares the document.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(event.request)
          const cache = await caches.open(PAGES_CACHE)
          cache.put(event.request, fresh.clone())
          return fresh
        } catch {
          return (await caches.match(event.request, { ignoreSearch: true })) ?? Response.error()
        }
      })(),
    )
    return
  }

  // Hashed bundles: cache-first — a URL is only ever one version of a file.
  if (/\/assets\/[A-Za-z0-9_-]+\.(?:js|css)$/.test(url.pathname)) {
    event.respondWith(
      (async () => {
        const hit = await caches.match(event.request)
        if (hit) return hit
        const fresh = await fetch(event.request)
        const cache = await caches.open(SHELL_CACHE)
        cache.put(event.request, fresh.clone())
        return fresh
      })(),
    )
    return
  }

  // Un-hashed same-origin files: serve the hit instantly, refresh in the
  // background. waitUntil keeps the worker alive for that refresh. The
  // refresh revalidates (cache: 'no-cache') so deploys land on the next
  // visit instead of stalling in heuristic HTTP caches.
  event.respondWith(
    (async () => {
      const cache = await caches.open(PAGES_CACHE)
      const hit = await cache.match(event.request)
      const refresh = fetch(event.request, { cache: 'no-cache' })
        .then((res) => {
          if (res.ok) cache.put(event.request, res.clone())
          return res
        })
        .catch(() => hit)
      event.waitUntil(refresh.then(() => {}, () => {}))
      return hit ?? refresh
    })(),
  )
})

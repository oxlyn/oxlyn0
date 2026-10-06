import { defineConfig } from 'rolldown-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'rolldown-vite'
import { webtvDevProxy } from './dev-proxy'

// Vite root is this app/ directory; the repo root above it holds static media
// (images/, audio/) and the bundled study app, so GitHub Pages keeps
// serving them at /macos27/*. In dev, serve those from root under the base path.
const REPO_ROOT = resolve(import.meta.dirname, '..')
const MEDIA_RE = /\.(jpg|jpeg|png|gif|webp|svg|mp3|mp4|zip|pdf|woff2?)$/
// Cloudflare build CI serves the site at the domain root (CF_PAGES=1 on
// Pages, WORKERS_CI=1 on Workers Builds); GitHub Pages serves the repo under
// /macos27/. Local builds keep the /macos27/ default.
const BASE = process.env.CF_PAGES || process.env.WORKERS_CI ? '/' : '/macos27/'
// Bundled static sites live inside their app module (app/src/apps/<id>/site);
// the URL mirrors the repo path because GitHub Pages serves the repo as-is.
const STATIC_SITES = [
  '/macos27/app/src/apps/study/site/',
  '/macos27/app/src/apps/wakfu/site/',
  '/macos27/app/src/apps/devkit/site/',
  '/macos27/app/src/apps/games/ylcs3/',
]
function rootStatic(): Plugin {
  return {
    name: 'root-static-media',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '').split('?')[0]
        if (!url.startsWith('/macos27/') || !(MEDIA_RE.test(url) || url.endsWith('/sw.js') || STATIC_SITES.some((p) => url.startsWith(p)))) return next()
        const file = resolve(REPO_ROOT, url.slice('/macos27/'.length))
        if (!existsSync(file) || !statSync(file).isFile()) return next()
        const ext = file.split('.').pop()!
        const types: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', svg: 'image/svg+xml', mp3: 'audio/mpeg', mp4: 'video/mp4', zip: 'application/zip', pdf: 'application/pdf', webp: 'image/webp', gif: 'image/gif', html: 'text/html; charset=utf-8', woff: 'font/woff', woff2: 'font/woff2', js: 'text/javascript', css: 'text/css', wasm: 'application/wasm' }
        res.setHeader('Content-Type', types[ext] ?? 'application/octet-stream')
        // Bundled sites are immutable-ish assets in dev too: without validators
        // browsers would re-read them on every iframe load.
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Last-Modified', statSync(file).mtime.toUTCString())
        res.end(readFileSync(file))
      })
    },
  }
}

// dist-only hosts (Cloudflare Pages) never see the repo root, so mirror the
// static media into dist after every build. Two destinations are needed: the
// dist root for BASE_URL-relative refs (images/, audio/, apps/ embeds,
// finder/preview) and dist/macos27/ for the /macos27/… paths hardcoded in the
// music/podcast/photo data files. GitHub Pages serves the repo root and never
// deploys these copies (deploy-root.sh takes only index.html + hashed assets).
function copyRootStatic(): Plugin {
  return {
    name: 'copy-root-static',
    closeBundle() {
      const dist = resolve(REPO_ROOT, 'dist')
      const at = (...p: string[]) => resolve(dist, ...p)
      mkdirSync(at('macos27'), { recursive: true })
      for (const name of readdirSync(REPO_ROOT)) {
        const file = resolve(REPO_ROOT, name)
        if (!statSync(file).isFile() || !(MEDIA_RE.test(name) || name === 'sw.js')) continue
        cpSync(file, at(name))
        cpSync(file, at('macos27', name))
      }
      for (const dir of ['images', 'audio']) {
        cpSync(resolve(REPO_ROOT, dir), at(dir), { recursive: true })
        cpSync(resolve(REPO_ROOT, dir), at('macos27', dir), { recursive: true })
      }
      // Bundled app sites: mirror each into dist at its repo-relative path so
      // BASE_URL-relative iframe URLs resolve on dist-only hosts (Cloudflare
      // Pages). GitHub Pages serves the repo root directly and needs no copy.
      const appSites: [string, string][] = [
        ['study', 'site'],
        ['wakfu', 'site'],
        ['devkit', 'site'],
        ['games', 'ylcs3'],
      ]
      for (const [id, sub] of appSites) {
        mkdirSync(at('app/src/apps', id), { recursive: true })
        cpSync(resolve(REPO_ROOT, 'app/src/apps', id, sub), at('app/src/apps', id, sub), { recursive: true })
      }
    },
  }
}

export default defineConfig({
  root: import.meta.dirname,
  base: BASE,
  server: { host: true, port: 5173 },
  resolve: { alias: { '@': resolve(import.meta.dirname, 'src') } },
  plugins: [react(), tailwindcss(), rootStatic(), copyRootStatic(), webtvDevProxy()],
  build: {
    outDir: resolve(REPO_ROOT, 'dist'),
    emptyOutDir: true,
    // #3 vendor 拆包暂缓：rolldown 的 advancedChunks / manualChunks 两种方式
    // 都会让应用启动崩溃（模块初始化顺序问题），待引擎修复后启用：
    // rollupOptions: { output: { manualChunks(id) { if (id.includes('node_modules')) return 'vendor' } } },
  },
})

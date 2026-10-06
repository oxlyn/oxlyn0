import { defineConfig } from 'rolldown-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cpSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'rolldown-vite'
import { webtvDevProxy } from './dev-proxy'

// Vite root is this app/ directory; the repo root above it holds the image
// media (images/) and the bundled app sites. In dev, serve repo-root paths
// under the /macos27/ base path.
const REPO_ROOT = resolve(import.meta.dirname, '..')
const MEDIA_RE = /\.(jpg|jpeg|png|gif|webp|svg|mp3|mp4|zip|pdf|woff2?)$/
// Cloudflare Pages build CI serves the site at the domain root (CF_PAGES=1);
// local builds keep the /macos27/ default.
const BASE = process.env.CF_PAGES ? '/' : '/macos27/'
// Bundled static sites live inside their app module (app/src/apps/<id>/site);
// embed URLs mirror the repo path, shared verbatim by dev and builds.
const STATIC_SITES = [
  '/macos27/app/src/apps/study/site/',
  '/macos27/app/src/apps/wakfu/site/',
  '/macos27/app/src/apps/devkit/site/',
  '/macos27/app/src/apps/ylcs3/site/',
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

// The Pages build only publishes dist/, so mirror the runtime assets into it
// after every build: dist/sw.js (registered at the site root), dist/images/
// (wallpaper/photo/cover refs) and the bundled app sites + music audio at
// their repo-relative paths. All runtime URLs are BASE_URL-relative — one
// style across dev and builds, no hardcoded deployment prefix anywhere.
function copyRootStatic(): Plugin {
  return {
    name: 'copy-root-static',
    closeBundle() {
      const dist = resolve(REPO_ROOT, 'dist')
      const at = (...p: string[]) => resolve(dist, ...p)
      cpSync(resolve(REPO_ROOT, 'sw.js'), at('sw.js'))
      cpSync(resolve(REPO_ROOT, 'images'), at('images'), { recursive: true })
      cpSync(resolve(REPO_ROOT, 'app/src/apps/music/audio'), at('app/src/apps/music/audio'), { recursive: true })
      // Bundled app sites: mirror each into dist at its repo-relative path so
      // BASE_URL-relative iframe URLs resolve in the Pages build.
      const appSites: [string, string][] = [
        ['study', 'site'],
        ['wakfu', 'site'],
        ['devkit', 'site'],
        ['ylcs3', 'site'],
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

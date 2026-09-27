// Cloudflare Workers entry for the WebTV same-origin proxy (wrangler.jsonc
// `main`). `run_worker_first: ["/api/proxy/*"]` routes only proxy requests to
// this script; everything else is served straight from the static assets, so
// the fallback below only matters if that setting is ever dropped.
// Handler shared with the dev plugin and Pages Functions adapter.
import { handleProxyRequest } from './app/src/apps/webtv/lib/proxyCore'

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/api/proxy/')) {
      const route = url.pathname.slice('/api/proxy/'.length)
      return handleProxyRequest(route, url.searchParams, request)
    }
    return env.ASSETS.fetch(request)
  },
}

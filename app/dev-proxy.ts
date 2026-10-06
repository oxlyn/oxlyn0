// Vite dev plugin: serve /api/proxy/* for the WebTV app in `npm run dev`.
// Thin Node (connect) adapter over the shared fetch-API core in
// app/src/apps/webtv/lib/proxyCore.ts — same handler as the Cloudflare
// Pages Functions adapter, so dev matches production exactly.
import { Readable } from 'node:stream'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'rolldown-vite'
import { handleProxyRequest } from './src/apps/webtv/lib/proxyCore'

async function readBody(req: IncomingMessage): Promise<string | undefined> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const text = Buffer.concat(chunks).toString('utf-8')
  return text.length > 0 ? text : undefined
}

export function webtvDevProxy(): Plugin {
  return {
    name: 'webtv-dev-proxy',
    // Dev server only — production static deploys have no server-side proxy
    // (lib/api.ts self-disables the channel on the first 404/HTML response).
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const raw = req.url ?? ''
        if (!raw.startsWith('/api/proxy/')) return next()
        const url = new URL(raw, 'http://localhost')
        const route = url.pathname.slice('/api/proxy/'.length)
        void (async () => {
          const body = req.method === 'POST' || req.method === 'PUT' ? await readBody(req) : undefined
          const headers = new Headers()
          for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === 'string') headers.set(key, value)
          }
          const request = new Request(url.href, {
            method: req.method,
            headers: headers,
            body,
          })
          const resp = await handleProxyRequest(route, url.searchParams, request)
          res.writeHead(resp.status, Object.fromEntries(resp.headers))
          if (resp.body) {
            Readable.fromWeb(resp.body as Parameters<typeof Readable.fromWeb>[0]).pipe(res)
          } else {
            res.end()
          }
        })().catch(() => {
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
            res.end(JSON.stringify({ code: 0, msg: '代理内部错误', error_type: 'proxy_error' }))
          } else {
            res.end()
          }
        })
      })
    },
  }
}

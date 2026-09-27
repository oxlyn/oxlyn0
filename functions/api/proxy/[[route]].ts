// Cloudflare Pages Functions adapter: /api/proxy/<route> for classic Pages
// deploys (functions/ directory convention). Same shared core as the dev
// plugin and worker.ts.
import { handleProxyRequest } from '../../../app/src/apps/webtv/lib/proxyCore'

interface FunctionContext {
  params: { route?: string | string[] }
  request: Request
}

export async function onRequest(context: FunctionContext): Promise<Response> {
  const url = new URL(context.request.url)
  const route = Array.isArray(context.params.route) ? context.params.route.join('/') : (context.params.route ?? '')
  return handleProxyRequest(route, url.searchParams, context.request)
}

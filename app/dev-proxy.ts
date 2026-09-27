/**
 * Dev-only same-origin proxy for the WebTV app (`npm run dev`).
 *
 * Mirrors webtv/'s Next.js Route Handlers (app/api/proxy/*): the local Node
 * server fetches source sites directly — UA spoofing, GBK/XML conversion,
 * streaming aggregate search — which is why the upstream Next app feels much
 * faster than the static fallback chain of public CORS proxies. Reuses the
 * app's own isomorphic lib (maccms/maccmsXml) for byte-identical behavior.
 *
 * In production static deploys there is no server: lib/api.ts tries
 * /api/proxy/* once, gets a 404, and permanently falls back to
 * direct-fetch + public CORS proxies for the session.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'rolldown-vite'
import { buildMacCmsUrl } from './src/apps/webtv/lib/maccms'
import { convertMacCmsXml, decodeXmlBytes, detectXmlCharset } from './src/apps/webtv/lib/maccmsXml'

const BASE_HEADERS: Record<string, string> = {
  'User-Agent': 'okhttp/4.9.3',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'zh-CN,zh;q=0.9',
}

/** 拦截内网/本机目标，避免代理被滥用为内网探测（与上游 Route Handler 一致） */
function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  if (h === 'localhost' || h.endsWith('.local')) return true
  if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.0\.0\.0)/.test(h)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true
  if (/^\[?::1\]?$/.test(h)) return true
  return false
}

async function fetchUpstream(
  url: string,
  timeoutMs: number,
  extraHeaders: Record<string, string> = {},
): Promise<Response | null> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      return await fetch(url, {
        headers: { ...BASE_HEADERS, ...extraHeaders },
        signal: AbortSignal.timeout(timeoutMs),
        redirect: 'follow',
      })
    } catch {
      if (attempt === 2) return null
    }
  }
  return null
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' })
  res.end(JSON.stringify(body))
}

function fail(res: ServerResponse, msg: string, errorType: string, status: number) {
  sendJson(res, status, { code: 0, msg, error_type: errorType })
}

// ===== /api/proxy/site =====

async function handleSite(query: URLSearchParams, res: ServerResponse) {
  const apiUrl = (query.get('api') || '').trim()
  const siteType = parseInt(query.get('type') || '1', 10) || 0
  const siteName = query.get('name') || '站点'
  if (!apiUrl) return fail(res, '站点API地址为空', 'site_empty_api', 400)
  let target: URL
  try {
    target = new URL(apiUrl)
  } catch {
    return fail(res, '站点API地址无效', 'site_empty_api', 400)
  }
  if (!/^https?:$/.test(target.protocol)) return fail(res, '仅支持 http(s) 站点', 'site_not_http_api', 400)
  if (isBlockedHost(target.hostname)) return fail(res, '不允许的请求目标', 'site_not_http_api', 400)

  // 苹果CMS 参数白名单透传
  const params: Record<string, string> = {}
  for (const key of ['ac', 't', 'wd', 'pg', 'ids', 'limit', 'quick']) {
    const value = query.get(key)
    if (value !== null && value !== '') params[key] = value
  }
  const upstream = await fetchUpstream(buildMacCmsUrl(apiUrl, params), 8000)
  if (!upstream) return fail(res, `站点「${siteName}」暂不可达，请切换其他站点`, 'site_unreachable', 502)

  // XML 接口（type=0）：转码 + 转成标准 vod JSON
  if (siteType === 0) {
    const bytes = new Uint8Array(await upstream.arrayBuffer())
    const declared = detectXmlCharset(bytes)
    const text = decodeXmlBytes(bytes, declared || 'utf-8')
    if (text) {
      const json = convertMacCmsXml(text, params['ac'] || '')
      if (json) return sendJson(res, 200, json)
    }
    // 转换失败：透传原始文本，前端 fetchJson 走 {__raw} 分支
    res.writeHead(upstream.status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' })
    return res.end(text ?? '')
  }

  const text = await upstream.text()
  res.writeHead(upstream.status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' })
  res.end(text)
}

// ===== /api/proxy/live =====

async function handleLive(query: URLSearchParams, res: ServerResponse) {
  const url = (query.get('url') || '').trim()
  if (!url) return fail(res, '直播源地址为空', 'live_not_found', 400)
  let target: URL
  try {
    target = new URL(url)
  } catch {
    return fail(res, '直播源地址无效', 'live_not_found', 400)
  }
  if (!/^https?:$/.test(target.protocol)) return fail(res, '仅支持 http(s) 直播源', 'live_not_found', 400)
  if (isBlockedHost(target.hostname)) return fail(res, '不允许的请求目标', 'live_not_found', 400)

  const upstream = await fetchUpstream(url, 15000, { Accept: '*/*' })
  if (!upstream) return fail(res, '直播源拉取失败', 'live_unreachable', 502)

  // 按上游声明编码解码（IPTV 列表常见 GBK）
  const bytes = new Uint8Array(await upstream.arrayBuffer())
  const ct = upstream.headers.get('content-type') || ''
  const m = ct.match(/charset=([\w-]+)/i)
  let text: string
  try {
    text = new TextDecoder((m ? m[1] : 'utf-8').toLowerCase()).decode(bytes)
  } catch {
    text = new TextDecoder('utf-8').decode(bytes)
  }
  res.writeHead(upstream.status, { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' })
  res.end(text)
}

// ===== /api/proxy/parse =====

async function handleParse(query: URLSearchParams, res: ServerResponse) {
  const url = (query.get('url') || '').trim()
  if (!url) return fail(res, '解析地址为空', 'parse_empty_url', 400)
  let target: URL
  try {
    target = new URL(url)
  } catch {
    return fail(res, '解析地址无效', 'parse_empty_url', 400)
  }
  if (!/^https?:$/.test(target.protocol)) return fail(res, '仅支持 http(s) 解析接口', 'parse_not_found', 400)
  if (isBlockedHost(target.hostname)) return fail(res, '不允许的请求目标', 'parse_not_found', 400)

  // ext 扩展请求头（白名单常用键，避免透传危险头）
  const extraHeaders: Record<string, string> = {}
  try {
    const parsed = JSON.parse(query.get('headers') || '{}') as Record<string, unknown>
    for (const [key, value] of Object.entries(parsed)) {
      const normalized = key.toLowerCase().replace(/-/g, '_')
      if (['user_agent', 'referer', 'accept', 'accept_language'].includes(normalized) && typeof value === 'string') {
        extraHeaders[normalized === 'user_agent' ? 'User-Agent' : normalized.replace(/_/g, '-').replace(/\b\w/g, (c) => c.toUpperCase())] = value
      }
    }
  } catch { /* 忽略非法 headers */ }

  const upstream = await fetchUpstream(url, 10000, extraHeaders)
  if (!upstream) return fail(res, '解析请求失败', 'parse_unreachable', 502)

  const text = await upstream.text()
  res.writeHead(upstream.status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' })
  res.end(text)
}

// ===== /api/proxy/search（NDJSON 流式聚合搜索） =====

interface SearchTarget {
  id: string
  api: string
  type: number
}

async function searchOne(target: SearchTarget, keyword: string): Promise<Array<Record<string, unknown>>> {
  const url = new URL(target.api)
  if (!/^https?:$/.test(url.protocol) || isBlockedHost(url.hostname)) return []
  // 苹果CMS 搜索：保留 api 自带参数，覆盖搜索参数
  url.searchParams.set('wd', keyword)
  url.searchParams.set('ac', 'detail')
  url.searchParams.set('pg', '1')

  const resp = await fetch(url.toString(), {
    headers: { 'User-Agent': BASE_HEADERS['User-Agent'], Accept: BASE_HEADERS.Accept },
    signal: AbortSignal.timeout(6000),
    redirect: 'follow',
  })
  const bytes = new Uint8Array(await resp.arrayBuffer())
  if (target.type === 0 || bytes[0] === 0x3c /* '<' → XML */) {
    const text = decodeXmlBytes(bytes) ?? ''
    const json = convertMacCmsXml(text, 'detail')
    return (json?.['list'] as Array<Record<string, unknown>>) ?? []
  }
  try {
    const json = JSON.parse(new TextDecoder('utf-8').decode(bytes)) as Record<string, unknown>
    return (json['list'] as Array<Record<string, unknown>>) ?? []
  } catch {
    return []
  }
}

async function readJsonBody(req: IncomingMessage): Promise<{ keyword?: string; sites?: SearchTarget[] } | null> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf-8') || 'null')
  } catch {
    return null
  }
}

async function handleSearch(req: IncomingMessage, res: ServerResponse) {
  const body = await readJsonBody(req)
  const keyword = String(body?.keyword || '').trim()
  const targets = Array.isArray(body?.sites) ? body!.sites! : []
  if (!keyword) return fail(res, '关键词为空', 'search_empty_keyword', 400)

  res.writeHead(200, {
    'Content-Type': 'application/x-ndjson; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*',
  })
  const send = (obj: unknown) => {
    try {
      res.write(JSON.stringify(obj) + '\n')
    } catch {
      // 客户端断开时 write 可能抛错，忽略
    }
  }

  send({ type: 'start', total: targets.length })
  let completed = 0
  // 每个站点完成立即推送（并发进行）
  await Promise.all(
    targets.map(async (target) => {
      let list: Array<Record<string, unknown>> = []
      try {
        list = await searchOne(target, keyword)
      } catch {
        list = []
      }
      completed += 1
      send({ type: 'site', siteId: target.id, list, completed, total: targets.length })
    }),
  )
  send({ type: 'done' })
  res.end()
}

// ===== Vite 插件 =====

async function routeRequest(
  route: string,
  query: URLSearchParams,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
    })
    return res.end()
  }
  switch (route) {
    case 'site':
      return handleSite(query, res)
    case 'live':
      return handleLive(query, res)
    case 'parse':
      return handleParse(query, res)
    case 'search':
      if (req.method !== 'POST') return fail(res, 'method not allowed', 'search_method', 405)
      return handleSearch(req, res)
    default:
      return fail(res, 'not found', 'proxy_not_found', 404)
  }
}

export function webtvDevProxy(): Plugin {
  return {
    name: 'webtv-dev-proxy',
    // Dev server only — production static deploys have no server-side proxy.
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const raw = req.url ?? ''
        if (!raw.startsWith('/api/proxy/')) return next()
        const q = raw.indexOf('?')
        const route = (q === -1 ? raw : raw.slice(0, q)).slice('/api/proxy/'.length).replace(/\/+$/, '')
        const query = new URL(raw, 'http://localhost').searchParams
        routeRequest(route, query, req, res).catch(() => {
          if (!res.headersSent) fail(res, '代理内部错误', 'proxy_error', 500)
          else res.end()
        })
      })
    },
  }
}

import { buildMacCmsUrl } from './maccms';
import { convertMacCmsXml, decodeXmlBytes, detectXmlCharset } from './maccmsXml';

/**
 * WebTV 同源代理核心 —— 纯 fetch API 实现，同一份代码跑在三类服务端上：
 * - `npm run dev`：vite 插件（app/dev-proxy.ts，Node 适配层）；
 * - Cloudflare Workers 静态资源部署（wrangler.jsonc → worker.ts）；
 * - Cloudflare Pages Functions（functions/api/proxy/[[route]].ts）。
 *
 * 行为对齐上游 webtv/ 的 Next.js Route Handlers（app/api/proxy/*）：服务端
 * 直连源站（无 CORS 限制 + okhttp UA 伪装），XML/GBK 转码复用同构 lib，
 * 聚合搜索以 NDJSON 流逐站推送。只代理元数据；视频流（m3u8/mp4）始终由
 * 播放器直连，不经过这里。
 */

const BASE_HEADERS: Record<string, string> = {
  'User-Agent': 'okhttp/4.9.3',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'zh-CN,zh;q=0.9',
};

/** 拦截内网/本机目标，避免代理被滥用为内网探测（与上游 Route Handler 一致） */
function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h.endsWith('.local')) return true;
  if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.0\.0\.0)/.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (/^\[?::1\]?$/.test(h)) return true;
  return false;
}

/** AbortSignal.timeout 在 Workers 运行时不保证可用，手写 controller 更稳 */
function abortAfter(ms: number): { signal: AbortSignal; done: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, done: () => clearTimeout(timer) };
}

async function fetchUpstream(
  url: string,
  timeoutMs: number,
  extraHeaders: Record<string, string> = {},
): Promise<Response | null> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const { signal, done } = abortAfter(timeoutMs);
    try {
      return await fetch(url, {
        headers: { ...BASE_HEADERS, ...extraHeaders },
        signal,
        redirect: 'follow',
      });
    } catch {
      if (attempt === 2) return null;
    } finally {
      done();
    }
  }
  return null;
}

function json(body: unknown, status = 200, contentType = 'application/json; charset=utf-8'): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*' },
  });
}

function fail(msg: string, errorType: string, status: number): Response {
  return json({ code: 0, msg, error_type: errorType }, status);
}

function passthrough(text: string, status: number, contentType: string): Response {
  return new Response(text, { status, headers: { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*' } });
}

// ===== site =====

async function handleSite(query: URLSearchParams): Promise<Response> {
  const apiUrl = (query.get('api') || '').trim();
  const siteType = parseInt(query.get('type') || '1', 10) || 0;
  const siteName = query.get('name') || '站点';
  if (!apiUrl) return fail('站点API地址为空', 'site_empty_api', 400);
  let target: URL;
  try {
    target = new URL(apiUrl);
  } catch {
    return fail('站点API地址无效', 'site_empty_api', 400);
  }
  if (!/^https?:$/.test(target.protocol)) return fail('仅支持 http(s) 站点', 'site_not_http_api', 400);
  if (isBlockedHost(target.hostname)) return fail('不允许的请求目标', 'site_not_http_api', 400);

  // 苹果CMS 参数白名单透传
  const params: Record<string, string> = {};
  for (const key of ['ac', 't', 'wd', 'pg', 'ids', 'limit', 'quick']) {
    const value = query.get(key);
    if (value !== null && value !== '') params[key] = value;
  }
  const upstream = await fetchUpstream(buildMacCmsUrl(apiUrl, params), 8000);
  if (!upstream) return fail(`站点「${siteName}」暂不可达，请切换其他站点`, 'site_unreachable', 502);

  // XML 接口（type=0）：转码 + 转成标准 vod JSON
  if (siteType === 0) {
    const bytes = new Uint8Array(await upstream.arrayBuffer());
    const declared = detectXmlCharset(bytes);
    const text = decodeXmlBytes(bytes, declared || 'utf-8');
    if (text) {
      const converted = convertMacCmsXml(text, params['ac'] || '');
      if (converted) return json(converted);
    }
    // 转换失败：透传原始文本，前端 fetchJson 走 {__raw} 分支
    return passthrough(text ?? '', upstream.status, 'application/json; charset=utf-8');
  }

  return passthrough(await upstream.text(), upstream.status, 'application/json; charset=utf-8');
}

// ===== live =====

async function handleLive(query: URLSearchParams): Promise<Response> {
  const url = (query.get('url') || '').trim();
  if (!url) return fail('直播源地址为空', 'live_not_found', 400);
  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return fail('直播源地址无效', 'live_not_found', 400);
  }
  if (!/^https?:$/.test(target.protocol)) return fail('仅支持 http(s) 直播源', 'live_not_found', 400);
  if (isBlockedHost(target.hostname)) return fail('不允许的请求目标', 'live_not_found', 400);

  const upstream = await fetchUpstream(url, 15000, { Accept: '*/*' });
  if (!upstream) return fail('直播源拉取失败', 'live_unreachable', 502);

  // 按上游声明编码解码（IPTV 列表常见 GBK）
  const bytes = new Uint8Array(await upstream.arrayBuffer());
  const ct = upstream.headers.get('content-type') || '';
  const m = ct.match(/charset=([\w-]+)/i);
  let text: string;
  try {
    text = new TextDecoder((m ? m[1] : 'utf-8').toLowerCase()).decode(bytes);
  } catch {
    text = new TextDecoder('utf-8').decode(bytes);
  }
  return passthrough(text, upstream.status, 'text/plain; charset=utf-8');
}

// ===== parse =====

async function handleParse(query: URLSearchParams): Promise<Response> {
  const url = (query.get('url') || '').trim();
  if (!url) return fail('解析地址为空', 'parse_empty_url', 400);
  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return fail('解析地址无效', 'parse_empty_url', 400);
  }
  if (!/^https?:$/.test(target.protocol)) return fail('仅支持 http(s) 解析接口', 'parse_not_found', 400);
  if (isBlockedHost(target.hostname)) return fail('不允许的请求目标', 'parse_not_found', 400);

  // ext 扩展请求头（白名单常用键，避免透传危险头）
  const extraHeaders: Record<string, string> = {};
  try {
    const parsed = JSON.parse(query.get('headers') || '{}') as Record<string, unknown>;
    for (const [key, value] of Object.entries(parsed)) {
      const normalized = key.toLowerCase().replace(/-/g, '_');
      if (['user_agent', 'referer', 'accept', 'accept_language'].includes(normalized) && typeof value === 'string') {
        extraHeaders[normalized === 'user_agent' ? 'User-Agent' : normalized.replace(/_/g, '-').replace(/\b\w/g, (c) => c.toUpperCase())] = value;
      }
    }
  } catch { /* 忽略非法 headers */ }

  const upstream = await fetchUpstream(url, 10000, extraHeaders);
  if (!upstream) return fail('解析请求失败', 'parse_unreachable', 502);
  return passthrough(await upstream.text(), upstream.status, 'application/json; charset=utf-8');
}

// ===== search（NDJSON 流式聚合搜索） =====

interface SearchTarget {
  id: string;
  api: string;
  type: number;
}

async function searchOne(target: SearchTarget, keyword: string): Promise<Array<Record<string, unknown>>> {
  const url = new URL(target.api);
  if (!/^https?:$/.test(url.protocol) || isBlockedHost(url.hostname)) return [];
  // 苹果CMS 搜索：保留 api 自带参数，覆盖搜索参数
  url.searchParams.set('wd', keyword);
  url.searchParams.set('ac', 'detail');
  url.searchParams.set('pg', '1');

  const { signal, done } = abortAfter(6000);
  try {
    const resp = await fetch(url.toString(), {
      headers: { 'User-Agent': BASE_HEADERS['User-Agent'], Accept: BASE_HEADERS.Accept },
      signal,
      redirect: 'follow',
    });
    const bytes = new Uint8Array(await resp.arrayBuffer());
    if (target.type === 0 || bytes[0] === 0x3c /* '<' → XML */) {
      const text = decodeXmlBytes(bytes) ?? '';
      const json = convertMacCmsXml(text, 'detail');
      return (json?.['list'] as Array<Record<string, unknown>>) ?? [];
    }
    try {
      const json = JSON.parse(new TextDecoder('utf-8').decode(bytes)) as Record<string, unknown>;
      return (json['list'] as Array<Record<string, unknown>>) ?? [];
    } catch {
      return [];
    }
  } catch {
    return [];
  } finally {
    done();
  }
}

async function handleSearch(request: Request): Promise<Response> {
  let body: { keyword?: string; sites?: SearchTarget[] } | null = null;
  try {
    body = (await request.json()) as { keyword?: string; sites?: SearchTarget[] };
  } catch {
    body = null;
  }
  const keyword = String(body?.keyword || '').trim();
  const targets = Array.isArray(body?.sites) ? body!.sites! : [];
  if (!keyword) return fail('关键词为空', 'search_empty_keyword', 400);

  // 每完成一个站点立即推一行 NDJSON，前端边收边渲染
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (obj: unknown) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));
        } catch {
          // 客户端断开时 enqueue 可能抛错，忽略
        }
      };
      send({ type: 'start', total: targets.length });
      let completed = 0;
      await Promise.all(
        targets.map(async (target) => {
          let list: Array<Record<string, unknown>> = [];
          try {
            list = await searchOne(target, keyword);
          } catch {
            list = [];
          }
          completed += 1;
          send({ type: 'site', siteId: target.id, list, completed, total: targets.length });
        }),
      );
      send({ type: 'done' });
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// ===== 入口 =====

/**
 * 处理 /api/proxy/<route>（route 为空串时按 404 处理）。
 * request 原样传入（POST search 读 JSON body），返回值直接回给客户端。
 */
export async function handleProxyRequest(route: string, query: URLSearchParams, request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
      },
    });
  }
  switch (route.replace(/\/+$/, '')) {
    case 'site':
      return handleSite(query);
    case 'live':
      return handleLive(query);
    case 'parse':
      return handleParse(query);
    case 'search':
      if (request.method !== 'POST') return fail('method not allowed', 'search_method', 405);
      return handleSearch(request);
    default:
      return fail('not found', 'proxy_not_found', 404);
  }
}

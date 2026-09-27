import type { TvSite, TvLive, TvParse, VodItem } from './types';
import { buildMacCmsUrl, buildParseIframeUrl, extractParseUrl, extractVodList } from './maccms';
import { convertMacCmsXml, decodeXmlBytes, detectXmlCharset } from './maccmsXml';
import { loadCorsProxies } from './localStats';

/**
 * 元数据请求策略层：
 * 1. 同源代理可用时优先（/api/proxy/*，Node 侧 UA 伪装 + XML 转换，最可靠）：
 *    `npm run dev` 由 vite 的 webtvDevProxy 插件提供（见 app/dev-proxy.ts），
 *    速度等同上游 Next.js 版；生产静态部署无该通道，首个 404/405 后自动关闭；
 * 2. 无代理或上游经代理仍失败时，按 浏览器直连 → 公共 CORS 代理 逐个尝试，
 *    XML/GBK 转换在浏览器端用同一套 isomorphic 模块完成。
 * 视频流（m3u8/mp4）始终由播放器直连，不经过本模块。
 */

const PROXY_TIMEOUT_MS = 10000;

/** 同源代理是否可用（首次 404/405 后置 false，跳过后续尝试）；dev 下由 vite 插件提供 */
let sameOriginProxyAvailable = true;

function withTimeout(ms: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(timer) };
}

function wrapCorsProxy(template: string, url: string): string {
  return template.replace('{url}', encodeURIComponent(url));
}

interface RawResult {
  text: string;
  status: number;
  contentType: string;
  bytes?: ArrayBuffer;
}

/** 按顺序尝试候选地址，返回首个网络层成功的响应文本 */
async function fetchFirstAvailable(
  candidates: Array<{ url: string; kind: 'proxy' | 'cors' | 'direct'; headers?: Record<string, string> }>,
  binary: boolean
): Promise<RawResult> {
  const errors: string[] = [];
  for (const candidate of candidates) {
    const { signal, cancel } = withTimeout(PROXY_TIMEOUT_MS);
    try {
      const resp = await fetch(candidate.url, {
        signal,
        headers: candidate.kind === 'proxy' ? candidate.headers : undefined,
      });
      // 同源代理不可用（无服务端部署）：404/405，或被 Cloudflare Pages 的 SPA
      // fallback 用 200 + index.html 兜底（content-type 为 text/html）。两种情况
      // 都必须立即关闭该通道，否则 HTML 会被 parseLenient 当成 {__raw} 站点数据，
      // 静默返回空列表且不再降级到直连/公共代理。
      if (candidate.kind === 'proxy') {
        const ct = resp.headers.get('content-type') || '';
        if (resp.status === 404 || resp.status === 405 || ct.includes('text/html')) {
          sameOriginProxyAvailable = false;
          errors.push(`proxy ${resp.status || ct}`);
          continue;
        }
      }
      if (binary) {
        const bytes = await resp.arrayBuffer();
        return { text: '', status: resp.status, contentType: resp.headers.get('content-type') || '', bytes };
      }
      const text = await resp.text();
      return { text, status: resp.status, contentType: resp.headers.get('content-type') || '' };
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    } finally {
      cancel();
    }
  }
  throw new Error(`所有请求通道均失败: ${errors.join('; ')}`);
}

function corsCandidates(targetUrl: string): Array<{ url: string; kind: 'cors' }> {
  return loadCorsProxies().map((template) => ({ url: wrapCorsProxy(template, targetUrl), kind: 'cors' as const }));
}

/**
 * 直连候选：目标带 Access-Control-Allow-Origin 时浏览器可直接取回（如 jsdelivr
 * 托管的直播/订阅列表、部分开了 CORS 的苹果CMS 站）；不带时 fetch 毫秒级抛错，
 * 自动落到后续公共代理 —— 所以放在代理之前尝试。
 */
function directCandidate(targetUrl: string): { url: string; kind: 'direct' } {
  return { url: targetUrl, kind: 'direct' };
}

function decodeResultBytes(result: RawResult): string {
  if (result.bytes) {
    const bytes = new Uint8Array(result.bytes);
    const declared = detectXmlCharset(bytes);
    const ct = result.contentType.match(/charset=([\w-]+)/i);
    const decoded = decodeXmlBytes(bytes, ct ? ct[1] : declared || 'utf-8');
    return decoded ?? new TextDecoder('utf-8').decode(bytes);
  }
  return result.text;
}

/** 从代理响应文本解析 JSON（非 JSON → {__raw} 分支） */
function parseLenient(text: string, status: number): Record<string, unknown> {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { __raw: text, __status: status } as Record<string, unknown>;
  }
}

// ===== 影视站点 =====

export interface SiteQuery {
  ac?: 'type' | 'detail' | 'list';
  t?: string | number;
  wd?: string;
  pg?: number | string;
  ids?: string | number;
  limit?: number;
  quick?: number;
}

/** 请求站点 API（分类/列表/详情/搜索），返回与原 PHP 代理一致的 JSON 结构 */
export async function fetchSiteData(site: TvSite, query: SiteQuery): Promise<Record<string, unknown>> {
  const params: Record<string, string | number | undefined> = {
    ac: query.ac, t: query.t, wd: query.wd, pg: query.pg, ids: query.ids, limit: query.limit, quick: query.quick,
  };
  const candidates: Array<{ url: string; kind: 'proxy' | 'cors' | 'direct' }> = [];

  if (sameOriginProxyAvailable) {
    const qs = new URLSearchParams({ api: site.api, type: String(site.type) });
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    }
    candidates.push({ url: `/api/proxy/site?${qs.toString()}`, kind: 'proxy' });
  }

  const directUrl = buildMacCmsUrl(site.api, params);
  candidates.push(directCandidate(directUrl));
  candidates.push(...corsCandidates(directUrl));

  let lastData: Record<string, unknown> | null = null;
  for (const candidate of candidates) {
    // 同源代理已给出权威结果（上游确实不可达）时，不再尝试公共代理
    if (candidate.kind === 'cors' && lastData && lastData.error_type) break;
    try {
      const binary = site.type === 0;
      const result = await fetchFirstAvailable([candidate], binary);
      const text = decodeResultBytes(result);
      let data = parseLenient(text, result.status);

      // XML 站点：代理/公共代理透传回来的原始 XML 在浏览器端转换
      if (
        (typeof data.__raw === 'string' && String(data.__raw).trimStart().startsWith('<?xml')) ||
        text.trimStart().startsWith('<?xml')
      ) {
        const converted = convertMacCmsXml(text, String(params.ac || ''));
        if (converted) data = converted;
      }

      // 服务端代理的结构化错误（如 site_unreachable）视为权威判定，立即返回
      if (candidate.kind === 'proxy' && data.error_type) return data;

      // 4xx/5xx（如公共代理的 401/503）不能当作站点数据记录，否则站点不可达时
      // 不会归入 error_type，自动切换站点逻辑就失效了
      if (result.status >= 400) continue;
      lastData = data;
      // 上游可达但业务性 404（如站点不存在）不必再试其他通道
      return data;
    } catch {
      // 尝试下一个通道
    }
  }
  return lastData ?? { code: 0, msg: '站点请求失败', error_type: 'site_unreachable' };
}

// ===== 直播源 =====

export async function fetchLiveText(live: TvLive): Promise<string> {
  const candidates: Array<{ url: string; kind: 'proxy' | 'cors' | 'direct' }> = [];
  if (sameOriginProxyAvailable) {
    candidates.push({ url: `/api/proxy/live?url=${encodeURIComponent(live.url)}`, kind: 'proxy' });
  }
  candidates.push(directCandidate(live.url));
  candidates.push(...corsCandidates(live.url));

  for (const candidate of candidates) {
    try {
      const result = await fetchFirstAvailable([candidate], true);
      const text = decodeResultBytes(result);
      if (text.trim()) return text;
    } catch {
      // 尝试下一个通道
    }
  }
  throw new Error('直播源拉取失败');
}

// ===== 解析接口 =====

/** 组装解析接口完整地址（含 ext header/params 扩展） */
export function composeParseUrl(parse: TvParse, playUrl: string): string {
  return buildParseIframeUrl(parse, playUrl);
}

/** 调 JSON 型解析接口，返回提取后的真实播放地址 */
export async function resolveParseUrl(parse: TvParse, playUrl: string): Promise<string> {
  const target = composeParseUrl(parse, playUrl);
  let extraHeaders: Record<string, string> = {};
  try {
    const ext = parse.ext ? JSON.parse(parse.ext) : null;
    const h = ext?.header || ext?.headers;
    if (h && typeof h === 'object') extraHeaders = h;
  } catch { /* 忽略 */ }

  const candidates: Array<{ url: string; kind: 'proxy' | 'cors' | 'direct'; headers?: Record<string, string> }> = [];
  if (sameOriginProxyAvailable) {
    candidates.push({
      url: `/api/proxy/parse?url=${encodeURIComponent(target)}&headers=${encodeURIComponent(JSON.stringify(extraHeaders))}`,
      kind: 'proxy',
    });
  }
  candidates.push(directCandidate(target));
  candidates.push(...corsCandidates(target));

  for (const candidate of candidates) {
    try {
      const result = await fetchFirstAvailable([candidate], false);
      const data = parseLenient(result.text, result.status);
      const url = extractParseUrl(data);
      if (url) return url;
    } catch {
      // 尝试下一个通道
    }
  }
  return '';
}

// ===== 聚合搜索 =====

/**
 * 跨站搜索（流式）：优先走同源聚合接口，服务端每完成一个站点立即推送（NDJSON 流），
 * 前端通过 onSiteResult 边收边渲染；代理不可用时降级为浏览器逐站并发（同样渐进回调）。
 * 返回值：最终完成的站点数（total）。
 */
export async function searchAllSites(
  sites: TvSite[],
  keyword: string,
  onSiteResult: (siteId: string, list: VodItem[], completed: number, total: number) => void
): Promise<number> {
  const total = sites.length;
  if (total === 0) return 0;

  if (sameOriginProxyAvailable) {
    const { signal, cancel } = withTimeout(40000);
    try {
      const resp = await fetch('/api/proxy/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword,
          sites: sites.map((s) => ({ id: s.id, api: s.api, type: s.type })),
        }),
        signal,
      });
      // 404/405，或 SPA fallback 兜底的 200 + index.html → 同源代理不存在，
      // 关闭通道后落入下方浏览器逐站并发
      const ct = resp.headers.get('content-type') || '';
      if (resp.status === 404 || resp.status === 405 || ct.includes('text/html')) {
        sameOriginProxyAvailable = false;
      } else if (resp.ok && ct.includes('ndjson') && resp.body) {
        // 逐行读取 NDJSON 流，每到一个站点结果立即回调
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let completed = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let newlineIdx: number;
          while ((newlineIdx = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, newlineIdx).trim();
            buffer = buffer.slice(newlineIdx + 1);
            if (!line) continue;
            try {
              const msg = JSON.parse(line) as { type: string; siteId?: string; list?: VodItem[]; completed?: number; total?: number };
              if (msg.type === 'site' && msg.siteId) {
                completed = msg.completed ?? completed + 1;
                onSiteResult(msg.siteId, msg.list || [], completed, msg.total ?? total);
              }
            } catch {
              // 忽略不完整行
            }
          }
        }
        return completed;
      }
    } catch {
      // 降级到浏览器并发
    } finally {
      cancel();
    }
  }

  // 降级路径：浏览器逐站并发，谁先完成谁先回调
  let completed = 0;
  await Promise.all(
    sites.map(async (site) => {
      let list: VodItem[] = [];
      try {
        const data = await fetchSiteData(site, { ac: 'detail', wd: keyword, pg: 1 });
        list = extractVodList(data).list;
      } catch {
        list = [];
      }
      completed += 1;
      onSiteResult(site.id, list, completed, total);
    })
  );
  return completed;
}

// ===== 订阅拉取 =====

/** 拉取远程 TVBox 订阅配置原文（供 sources.ts 解析） */
export async function fetchSubscriptionRaw(url: string): Promise<string> {
  const candidates: Array<{ url: string; kind: 'proxy' | 'cors' | 'direct' }> = [];
  if (sameOriginProxyAvailable) {
    candidates.push({ url: `/api/proxy/live?url=${encodeURIComponent(url)}`, kind: 'proxy' });
  }
  candidates.push(directCandidate(url));
  candidates.push(...corsCandidates(url));

  for (const candidate of candidates) {
    try {
      const result = await fetchFirstAvailable([candidate], true);
      const text = decodeResultBytes(result);
      if (text.trim()) return text;
    } catch {
      // 尝试下一个通道
    }
  }
  throw new Error('订阅配置拉取失败');
}

export type { VodItem };

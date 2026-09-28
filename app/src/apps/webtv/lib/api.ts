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
 *
 * 请求层能力：
 * - 结果缓存 + 同键去重（并发相同请求只打一次网络）；
 * - 代理与直连并发竞速，慢代理不再串行拖垮降级；
 * - 代理被判定不可用后进入冷却期而非永久失效，冷却到期自动重新尝试。
 */

/** 同源代理：dev 下由 vite 插件转发，生产不存在且会立即被识别 */
const PROXY_TIMEOUT_MS = 8000;
/** 浏览器直连：CORS 失败是毫秒级的，真失败不值得等 */
const DIRECT_TIMEOUT_MS = 3000;
/** 公共 CORS 代理：第三方服务，允许更长的等待 */
const CORS_TIMEOUT_MS = 12000;
/** 代理被判定不可用后的冷却时间（到点自动重试，避免一次抖动永久降级整场会话） */
const PROXY_COOLDOWN_MS = 60_000;
/** 并发竞速的候选数：同源代理 + 浏览器直连 */
const RACE_SIZE = 2;
const CACHE_MAX_ENTRIES = 128;
const LIVE_CACHE_TTL_MS = 10 * 60_000;
const SUB_CACHE_TTL_MS = 60_000;

type CandidateKind = 'proxy' | 'direct' | 'cors';

const TIMEOUT_MS: Record<CandidateKind, number> = {
  proxy: PROXY_TIMEOUT_MS,
  direct: DIRECT_TIMEOUT_MS,
  cors: CORS_TIMEOUT_MS,
};

interface Candidate {
  url: string;
  kind: CandidateKind;
  headers?: Record<string, string>;
  /** 以字节流读取（供 charset 探测 / GBK 解码） */
  binary?: boolean;
}

let proxyDownUntil = 0;
function proxyEnabled(): boolean {
  return Date.now() >= proxyDownUntil;
}
function markProxyDown(): void {
  proxyDownUntil = Date.now() + PROXY_COOLDOWN_MS;
}

function withTimeout(ms: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(timer) };
}

function abortError(signal: AbortSignal): DOMException {
  return signal.reason instanceof DOMException ? signal.reason : new DOMException('The operation was aborted.', 'AbortError');
}

export function isAbortError(e: unknown): boolean {
  return typeof e === 'object' && e !== null && (e as { name?: unknown }).name === 'AbortError';
}

/**
 * 让调用方在 signal abort 时立即拿到 AbortError。
 * 只切断「观察」，不取消底层请求 —— 同一键的其他等待者仍能拿到真实结果，
 * 取消不会把过期结果污染成失败。
 */
function withSignal<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(abortError(signal));
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(abortError(signal));
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (v) => { signal.removeEventListener('abort', onAbort); resolve(v); },
      (e) => { signal.removeEventListener('abort', onAbort); reject(e); },
    );
  });
}

interface RawResult {
  text: string;
  status: number;
  contentType: string;
  bytes?: ArrayBuffer;
}

/** 按声明编码把字节流转成 UTF-8 文本 */
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

/** 从响应文本解析 JSON（非 JSON → {__raw} 分支） */
function parseLenient(text: string, status: number): Record<string, unknown> {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { __raw: text, __status: status } as Record<string, unknown>;
  }
}

/**
 * 尝试单个候选。网络层失败/超时返回 null（由调用方继续下一个候选），不向外抛错。
 */
async function fetchOne(candidate: Candidate): Promise<RawResult | null> {
  const { signal, cancel } = withTimeout(TIMEOUT_MS[candidate.kind]);
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
        markProxyDown();
        return null;
      }
    }
    if (candidate.binary) {
      return {
        text: '',
        status: resp.status,
        contentType: resp.headers.get('content-type') || '',
        bytes: await resp.arrayBuffer(),
      };
    }
    return { text: await resp.text(), status: resp.status, contentType: resp.headers.get('content-type') || '' };
  } catch {
    return null;
  } finally {
    cancel();
  }
}

function wrapCorsProxy(template: string, url: string): string {
  return template.replace('{url}', encodeURIComponent(url));
}

function corsCandidates(targetUrl: string): Candidate[] {
  return loadCorsProxies().map((template) => ({ url: wrapCorsProxy(template, targetUrl), kind: 'cors' as const }));
}

/**
 * 直连候选：目标带 Access-Control-Allow-Origin 时浏览器可直接取回（如 jsdelivr
 * 托管的直播/订阅列表、部分开了 CORS 的苹果CMS 站）；不带时 fetch 毫秒级抛错，
 * 自动落到后续公共代理 —— 所以放在代理之后、公共代理之前。
 */
function directCandidate(targetUrl: string): Candidate {
  return { url: targetUrl, kind: 'direct' };
}

/**
 * 候选分两批：前 RACE_SIZE 个（同源代理 → 浏览器直连）并发竞速，
 * 公共 CORS 代理为后备批。批内谁先返回结果就返回，不等最慢的那个；
 * 整批都失败才推进下一批。
 *
 * CORS 代理是免费第三方服务，各自 12s 超时预算，因此批内必须竞速：
 * Promise.all 要等最慢的那个 12s 才交结果，会让三个代理退化成串行叠成 36s。
 */
async function firstMatch<T>(
  candidates: Candidate[],
  accept: (text: string, status: number, kind: CandidateKind) => T | null
): Promise<T | null> {
  const tryOne = async (candidate: Candidate): Promise<T | null> => {
    const result = await fetchOne(candidate);
    if (!result) return null;
    return accept(decodeResultBytes(result), result.status, candidate.kind);
  };

  const batches = [candidates.slice(0, RACE_SIZE), candidates.slice(RACE_SIZE)];
  for (const batch of batches) {
    const value = await raceBatch(batch, tryOne);
    if (value !== null) return value;
  }
  return null;
}

/** 批内竞速：任一候选返回被 accept 认可的结果即胜出；全失败返回 null */
async function raceBatch<T>(
  batch: Candidate[],
  tryOne: (candidate: Candidate) => Promise<T | null>
): Promise<T | null> {
  if (batch.length === 0) return null;
  return new Promise<T | null>((resolve) => {
    let pending = batch.length;
    for (const candidate of batch) {
      tryOne(candidate)
        .then((value) => {
          if (value !== null) resolve(value);
          else if (--pending === 0) resolve(null);
        })
        .catch(() => {
          if (--pending === 0) resolve(null);
        });
    }
  });
}

// ===== 缓存与同键去重 =====

interface CacheEntry {
  at: number;
  ttl: number;
  value: unknown;
}

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<unknown>>();

function cacheGet<T>(key: string): T | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > hit.ttl) {
    cache.delete(key);
    return null;
  }
  // 命中即提升为最近使用（Map 迭代顺序即插入顺序）
  cache.delete(key);
  cache.set(key, hit);
  return hit.value as T;
}

function cachePut(key: string, ttl: number, value: unknown): void {
  if (cache.has(key)) cache.delete(key);
  cache.set(key, { at: Date.now(), ttl, value });
  while (cache.size > CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

/** 只做同键去重，不落缓存（用于时效性内容，如解析地址） */
function dedup<T>(key: string, signal: AbortSignal | undefined, run: () => Promise<T>): Promise<T> {
  const pending = inFlight.get(key);
  if (pending) return withSignal(pending, signal).then((v) => v as T);
  const runner: Promise<T> = run().finally(() => { inFlight.delete(key); });
  inFlight.set(key, runner);
  return withSignal(runner, signal);
}

async function cached<T>(
  key: string,
  ttl: number,
  opts: RequestOptions,
  canCache: (value: T) => boolean,
  run: () => Promise<T>,
): Promise<T> {
  if (opts.cache !== false && !opts.force) {
    const hit = cacheGet<T>(key);
    if (hit !== null) return hit;
  }
  return dedup(key, opts.signal, () =>
    run().then((value) => {
      if (opts.cache !== false && canCache(value)) cachePut(key, ttl, value);
      return value;
    })
  );
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

export interface RequestOptions {
  signal?: AbortSignal;
  /** 禁用结果缓存 */
  cache?: boolean;
  /** 跳过缓存但保留进行中请求的去重 */
  force?: boolean;
}

/** 分类极少变化；搜索结果易变；详情与分页列表居中 */
function cacheTtlFor(query: SiteQuery): number {
  if (query.ac === 'type') return 10 * 60_000;
  if (query.wd) return 60_000;
  if (query.ids) return 5 * 60_000;
  return 2 * 60_000;
}

function siteCacheKey(site: TvSite, query: SiteQuery): string {
  return [site.api, site.type, query.ac, query.t, query.wd, query.pg, query.ids, query.limit, query.quick]
    .filter((v) => v !== undefined && v !== '')
    .join('|');
}

/**
 * 只有可用的站点数据才算成功：排除错误判定（error_type）与上游异常响应（{__raw}，
 * 含 SPA fallback 兜底回来的 index.html）。尤其不能把「站点不可达」缓存住，
 * 否则会依据陈旧数据把健康站点禁用；也不能让 HTML 冒充站点数据屏蔽掉降级。
 */
function isUsableSiteData(data: Record<string, unknown>): boolean {
  return !data.error_type && (Array.isArray(data.list) || Array.isArray(data.class));
}

const SITE_UNREACHABLE: Record<string, unknown> = { code: 0, msg: '站点请求失败', error_type: 'site_unreachable' };

/** 请求站点 API（分类/列表/详情/搜索），返回与原 PHP 代理一致的 JSON 结构 */
export async function fetchSiteData(
  site: TvSite,
  query: SiteQuery,
  opts: RequestOptions = {}
): Promise<Record<string, unknown>> {
  return cached(
    siteCacheKey(site, query),
    cacheTtlFor(query),
    opts,
    isUsableSiteData,
    () => fetchSiteDataNetwork(site, query)
  );
}

function buildSiteCandidates(site: TvSite, query: SiteQuery): Candidate[] {
  const params: Record<string, string | number | undefined> = {
    ac: query.ac, t: query.t, wd: query.wd, pg: query.pg, ids: query.ids, limit: query.limit, quick: query.quick,
  };
  const binary = site.type === 0;
  const b = (c: Candidate): Candidate => (binary ? { ...c, binary: true } : c);
  const candidates: Candidate[] = [];

  if (proxyEnabled()) {
    const qs = new URLSearchParams({ api: site.api, type: String(site.type) });
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    }
    candidates.push(b({ url: `/api/proxy/site?${qs.toString()}`, kind: 'proxy' }));
  }

  const directUrl = buildMacCmsUrl(site.api, params);
  candidates.push(b(directCandidate(directUrl)));
  for (const c of corsCandidates(directUrl)) candidates.push(b(c));
  return candidates;
}

interface SiteAttempt {
  kind: CandidateKind;
  data: Record<string, unknown>;
}

/** 取单个候选并解析成标准 vod JSON（含 XML 站点在浏览器端转换） */
async function attemptSite(candidate: Candidate, ac: string): Promise<SiteAttempt | null> {
  const result = await fetchOne(candidate);
  if (!result) return null;
  const text = decodeResultBytes(result);
  let data = parseLenient(text, result.status);
  if (
    (typeof data.__raw === 'string' && data.__raw.trimStart().startsWith('<?xml')) ||
    text.trimStart().startsWith('<?xml')
  ) {
    const converted = convertMacCmsXml(text, ac);
    if (converted) data = converted;
  }
  return { kind: candidate.kind, data };
}

async function fetchSiteDataNetwork(site: TvSite, query: SiteQuery): Promise<Record<string, unknown>> {
  const ac = String(query.ac || '');
  const candidates = buildSiteCandidates(site, query);

  const racedOuts = await Promise.all(candidates.slice(0, RACE_SIZE).map((c) => attemptSite(c, ac)));

  // 并发结果择优：可用的站点数据优先于代理的不可达判定
  //（代理偶发失败/超时不应把一个健康站点误判为不可达）
  const usable = racedOuts.find((r) => r && isUsableSiteData(r.data));
  if (usable) return usable.data;

  let lastData: Record<string, unknown> | null = null;
  for (const r of racedOuts) {
    if (!r) continue;
    lastData = r.data;
    // 服务端代理的结构化错误视为权威判定，不再尝试后续通道
    if (r.kind === 'proxy' && r.data.error_type) return r.data;
  }

  for (const c of candidates.slice(RACE_SIZE)) {
    const r = await attemptSite(c, ac);
    if (!r) continue;
    lastData = r.data;
    // 上游可达且数据可用；4xx/5xx（如公共代理的 401/503）与 HTML 兜底不算站点数据，
    // 否则站点不可达时不会归入 error_type，自动切换站点逻辑就失效了
    if (isUsableSiteData(r.data)) return r.data;
  }

  return lastData ?? SITE_UNREACHABLE;
}

// ===== 直播源 =====

export async function fetchLiveText(live: TvLive, opts: RequestOptions = {}): Promise<string> {
  return cached(
    `live|${live.url}`,
    LIVE_CACHE_TTL_MS,
    opts,
    (text) => text.trim().length > 0,
    async () => {
      const text = await firstMatch(
        [...proxyCandidates(`/api/proxy/live?url=${encodeURIComponent(live.url)}`),
         directCandidate(live.url),
         ...corsCandidates(live.url)],
        (t) => (t.trim() ? t : null),
      );
      if (!text) throw new Error('直播源拉取失败');
      return text;
    }
  );
}

/** 同源代理候选（不可用时返回空数组） */
function proxyCandidates(url: string, binary = false): Candidate[] {
  if (!proxyEnabled()) return [];
  return [binary ? { url, kind: 'proxy', binary: true } : { url, kind: 'proxy' }];
}

// ===== 解析接口 =====

/** 组装解析接口完整地址（含 ext header/params 扩展） */
export function composeParseUrl(parse: TvParse, playUrl: string): string {
  return buildParseIframeUrl(parse, playUrl);
}

function parseExtraHeaders(parse: TvParse): Record<string, string> {
  try {
    const ext = parse.ext ? JSON.parse(parse.ext) : null;
    const h = ext?.header || ext?.headers;
    if (h && typeof h === 'object') return h as Record<string, string>;
  } catch { /* 忽略 */ }
  return {};
}

/**
 * 调 JSON 型解析接口，返回提取后的真实播放地址。
 * 解析地址通常含时效 token，只去重不缓存。
 *
 * 主通道拿到响应体即视为结论，不再换代理重试：解析接口返回的就是目标站点的
 * 真实响应体，公共 CORS 代理转发回来是同一份字节。有些解析站会直接返回一个
 * 无关的 HTML 页面（既无地址也无 iframe），这种"取到了但提取不到"是确定结果——
 * 继续串行试公共代理等于白等十几秒，表现为「点开视频转圈半天」。
 * 只有主通道在**网络层**全部失败（无服务端代理 + 目标站无 CORS）时才走公共代理。
 */
export async function resolveParseUrl(parse: TvParse, playUrl: string, opts: RequestOptions = {}): Promise<string> {
  const target = composeParseUrl(parse, playUrl);
  const headers = parseExtraHeaders(parse);
  const proxyUrl = `/api/proxy/parse?url=${encodeURIComponent(target)}&headers=${encodeURIComponent(JSON.stringify(headers))}`;
  const primary: Candidate[] = [
    ...proxyCandidates(proxyUrl).map((c) => ({ ...c, headers })),
    directCandidate(target),
  ];

  return dedup(`parse|${parse.id}|${target}`, opts.signal, async () => {
    const results = await Promise.all(primary.map(fetchOne));
    const hit = results.find((r) => r !== null);
    if (hit) {
      return extractParseUrl(parseLenient(decodeResultBytes(hit), hit.status)) || '';
    }

    const url = await firstMatch(corsCandidates(target), (text) =>
      extractParseUrl(parseLenient(text, 0)) || null
    );
    return url ?? '';
  });
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

  if (proxyEnabled()) {
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
        markProxyDown();
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
export async function fetchSubscriptionRaw(url: string, opts: RequestOptions = {}): Promise<string> {
  return cached(
    `sub|${url}`,
    SUB_CACHE_TTL_MS,
    opts,
    (text) => text.trim().length > 0,
    async () => {
      const text = await firstMatch(
        [...proxyCandidates(`/api/proxy/live?url=${encodeURIComponent(url)}`, true),
         directCandidate(url),
         ...corsCandidates(url)],
        (t) => (t.trim() ? t : null)
      );
      if (!text) throw new Error('订阅配置拉取失败');
      return text;
    }
  );
}

export type { VodItem };

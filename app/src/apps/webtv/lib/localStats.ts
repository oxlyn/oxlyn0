/**
 * localStorage 版本地统计：替代原版服务端的 disable-site / report-error 接口。
 * 语义对齐：站点连续自动跳过 3 次禁用；解析接口报错 play 3 次 / parse 6 次冻结。
 */

const KEY_SKIP_COUNTS = 'tvbox_site_skip_counts';
const KEY_DISABLED_SITES = 'tvbox_site_disabled';
const KEY_PARSE_ERRORS = 'tvbox_parse_errors';
const KEY_FROZEN_PARSES = 'tvbox_parse_frozen';
const KEY_SUBSCRIPTIONS = 'tvbox_subscriptions';
const KEY_CORS_PROXIES = 'tvbox_cors_proxies';

export const AUTO_DISABLE_THRESHOLD = 3;
export const PARSE_PLAY_THRESHOLD = 3;
export const PARSE_PARSE_THRESHOLD = 6;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage 不可用时静默忽略
  }
}

// ===== 站点跳过计数 =====

export function loadSkipCounts(): Record<string, number> {
  return readJson<Record<string, number>>(KEY_SKIP_COUNTS, {});
}

export function saveSkipCounts(counts: Record<string, number>): void {
  writeJson(KEY_SKIP_COUNTS, counts);
}

export function incrementSkipCount(siteId: string): boolean {
  const counts = loadSkipCounts();
  counts[siteId] = (counts[siteId] || 0) + 1;
  saveSkipCounts(counts);
  return counts[siteId] >= AUTO_DISABLE_THRESHOLD;
}

export function resetSkipCount(siteId: string): void {
  const counts = loadSkipCounts();
  if (counts[siteId]) {
    delete counts[siteId];
    saveSkipCounts(counts);
  }
}

// ===== 本地禁用站点 =====

export function loadDisabledSiteIds(): string[] {
  return readJson<string[]>(KEY_DISABLED_SITES, []);
}

export function disableSite(siteId: string): void {
  const ids = loadDisabledSiteIds();
  if (!ids.includes(siteId)) {
    ids.push(siteId);
    writeJson(KEY_DISABLED_SITES, ids);
  }
  // 与原版 autoDisableSite 一致：禁用时清掉计数
  const counts = loadSkipCounts();
  delete counts[siteId];
  saveSkipCounts(counts);
}

export function enableSite(siteId: string): void {
  writeJson(KEY_DISABLED_SITES, loadDisabledSiteIds().filter((id) => id !== siteId));
}

// ===== 解析接口报错冻结 =====

interface ParseErrorEntry {
  play: number;
  parse: number;
}

function loadParseErrors(): Record<string, ParseErrorEntry> {
  return readJson<Record<string, ParseErrorEntry>>(KEY_PARSE_ERRORS, {});
}

export function reportParseError(parseId: string, type: 'play' | 'parse'): { frozen: boolean; threshold: number } {
  const errors = loadParseErrors();
  const entry = errors[parseId] || { play: 0, parse: 0 };
  entry[type] += 1;
  errors[parseId] = entry;
  writeJson(KEY_PARSE_ERRORS, errors);

  const threshold = type === 'play' ? PARSE_PLAY_THRESHOLD : PARSE_PARSE_THRESHOLD;
  if (entry[type] >= threshold) {
    freezeParse(parseId);
    return { frozen: true, threshold };
  }
  return { frozen: false, threshold };
}

export function loadFrozenParseIds(): string[] {
  return readJson<string[]>(KEY_FROZEN_PARSES, []);
}

export function freezeParse(parseId: string): void {
  const ids = loadFrozenParseIds();
  if (!ids.includes(parseId)) {
    ids.push(parseId);
    writeJson(KEY_FROZEN_PARSES, ids);
  }
}

export function unfreezeParse(parseId: string): void {
  writeJson(KEY_FROZEN_PARSES, loadFrozenParseIds().filter((id) => id !== parseId));
}

// ===== 订阅 =====

export interface SubscriptionEntry {
  id: string;
  name: string;
  url: string;
  addedAt: number;
}

export function loadSubscriptions(): SubscriptionEntry[] {
  return readJson<SubscriptionEntry[]>(KEY_SUBSCRIPTIONS, []);
}

export function saveSubscriptions(list: SubscriptionEntry[]): void {
  writeJson(KEY_SUBSCRIPTIONS, list);
}

// ===== 公共 CORS 代理列表（可被用户覆盖）=====

export const DEFAULT_CORS_PROXIES = [
  'https://corsproxy.io/?url={url}',
  'https://api.allorigins.win/raw?url={url}',
  'https://api.codetabs.com/v1/proxy?quest={url}',
];

export function loadCorsProxies(): string[] {
  const saved = readJson<string[]>(KEY_CORS_PROXIES, []);
  return saved.length > 0 ? saved : DEFAULT_CORS_PROXIES;
}

export function saveCorsProxies(list: string[]): void {
  writeJson(KEY_CORS_PROXIES, list);
}

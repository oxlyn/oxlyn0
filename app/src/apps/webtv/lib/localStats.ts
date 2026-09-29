/**
 * 本地统计/设置存储：替代原版服务端的 disable-site 接口。
 * 语义对齐：站点连续自动跳过 3 次禁用。
 *
 * 读写走 persist（内存镜像 + IndexedDB 后端），键名保持 tvbox_ 前缀不变；
 * 首次启动自动把旧 localStorage 数据迁移过去（见 persist.ts）。
 */
import { readValue, removeValue, writeValue } from './persist';

const KEY_SKIP_COUNTS = 'tvbox_site_skip_counts';
const KEY_DISABLED_SITES = 'tvbox_site_disabled';
const KEY_SUBSCRIPTIONS = 'tvbox_subscriptions';
const KEY_CORS_PROXIES = 'tvbox_cors_proxies';

export const AUTO_DISABLE_THRESHOLD = 3;

function readJson<T>(key: string, fallback: T): T {
  return readValue(key, fallback);
}

function writeJson(key: string, value: unknown): void {
  writeValue(key, value);
}

/** 动态键（订阅实体 tvbox_sub_*）的通用读写删，供 sources.ts 使用 */
export function readPersisted<T>(key: string, fallback: T): T {
  return readValue(key, fallback);
}

export function writePersisted(key: string, value: unknown): void {
  writeValue(key, value);
}

export function removePersisted(key: string): void {
  removeValue(key);
}

// ===== 上次选择的源（下次打开恢复）=====

const KEY_LAST_SITE = 'tvbox_last_site';
const KEY_LAST_LIVE = 'tvbox_last_live';

function loadLastId(key: string): string {
  return readValue<string>(key, '');
}

function saveLastId(key: string, id: string): void {
  if (id) writeValue(key, id);
  else removeValue(key);
}

export function loadLastSiteId(): string {
  return loadLastId(KEY_LAST_SITE);
}

export function saveLastSiteId(id: string): void {
  saveLastId(KEY_LAST_SITE, id);
}

export function loadLastLiveId(): string {
  return loadLastId(KEY_LAST_LIVE);
}

export function saveLastLiveId(id: string): void {
  saveLastId(KEY_LAST_LIVE, id);
}

// ===== 收藏（以整部剧为粒度：siteId + vod_id 唯一确定一部剧，不含单集）=====

const KEY_FAVORITES = 'tvbox_favorites';
/** 上限保护：超出丢最旧的，避免把 localStorage 配额撑爆 */
export const FAVORITES_MAX = 300;

export interface FavoriteEntry {
  siteId: string;
  siteName: string;
  movieId: string;
  /** 收藏时的剧名/海报/备注快照：源挂掉或被移除后，收藏页仍能完整展示 */
  name: string;
  pic: string;
  remarks: string;
  year: string;
  addedAt: number;
}

export function loadFavorites(): FavoriteEntry[] {
  return readJson<FavoriteEntry[]>(KEY_FAVORITES, []);
}

function saveFavorites(list: FavoriteEntry[]): void {
  writeJson(KEY_FAVORITES, list);
}

export function isFavorite(siteId: string, movieId: string): boolean {
  return loadFavorites().some((f) => f.siteId === siteId && f.movieId === movieId);
}

export function addFavorite(entry: Omit<FavoriteEntry, 'addedAt'>): void {
  const list = loadFavorites().filter((f) => !(f.siteId === entry.siteId && f.movieId === entry.movieId));
  list.unshift({ ...entry, addedAt: Date.now() });
  saveFavorites(list.slice(0, FAVORITES_MAX));
}

export function removeFavorite(siteId: string, movieId: string): void {
  saveFavorites(loadFavorites().filter((f) => !(f.siteId === siteId && f.movieId === movieId)));
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

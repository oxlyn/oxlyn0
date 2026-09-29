import type { TvLive, TvParse, TvSite } from './types';
import { PRESET_LIVES, PRESET_PARSES, PRESET_SITES } from './presets';
import {
  disableSite as persistDisableSite,
  enableSite as persistEnableSite,
  loadDisabledSiteIds,
  loadSubscriptions,
  readPersisted,
  removePersisted,
  saveSubscriptions,
  writePersisted,
} from './localStats';
import { fetchSubscriptionRaw } from './api';

/**
 * 源管理：内置预置源 ∪ 本地订阅（TVBox 配置 URL，IndexedDB 持久化）。
 * TVBox 配置解析等价移植 PHP ConfigSyncService：JSON5 注释剥离、编码容错、URL 校验、全局去重。
 */

/** 判断站点 api 是否为网页端可用的 HTTP API（与原 TvboxSite::isHttpApi 对齐） */
export function isHttpApiSite(api: string): boolean {
  if (!/^https?:\/\//i.test(api)) return false;
  const path = api.split('?')[0].toLowerCase();
  return !/\.(js|py|jar|json)$/.test(path);
}

function isValidHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * 剥离 JSON5 风格注释（等价移植 stripJsonComments）：
 * 字符串外的 // 与 /* *\/ 注释移除；字符串内的裸换行/Tab 转义，避免 URL 被破坏。
 */
export function stripJsonComments(text: string): string {
  let result = '';
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) {
        result += ch;
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        result += ch;
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
        result += ch;
        continue;
      }
      // 字符串内的裸换行/Tab 转义为合法 JSON
      if (ch === '\n') { result += '\\n'; continue; }
      if (ch === '\r') { continue; }
      if (ch === '\t') { result += '\\t'; continue; }
      result += ch;
      continue;
    }
    if (ch === '"') {
      inString = true;
      result += ch;
      continue;
    }
    if (ch === '/' && text[i + 1] === '/') {
      // 行注释：跳到行尾
      while (i < text.length && text[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && text[i + 1] === '*') {
      // 块注释：跳到 */
      i += 2;
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++;
      i++;
      continue;
    }
    result += ch;
  }
  // 移除尾随逗号（数组/对象收尾前的 ,）
  return result.replace(/,\s*([}\]])/g, '$1');
}

export interface ParsedTvboxConfig {
  sites: Array<Partial<TvSite>>;
  lives: Array<Partial<TvLive>>;
  parses: Array<Partial<TvParse>>;
}

/** 解析 TVBox 配置 JSON 文本为实体（URL 校验与缺省值对齐 ConfigSyncService::syncData） */
export function parseTvboxConfigText(text: string): ParsedTvboxConfig {
  let data: Record<string, unknown> | null = null;
  try {
    data = JSON.parse(text) as Record<string, unknown>;
  } catch {
    try {
      data = JSON.parse(stripJsonComments(text)) as Record<string, unknown>;
    } catch {
      throw new Error('配置格式错误：无法解析为 JSON（已尝试剥离注释）');
    }
  }

  const out: ParsedTvboxConfig = { sites: [], lives: [], parses: [] };

  const rawSites = Array.isArray(data['sites']) ? data['sites'] : [];
  rawSites.forEach((item, i) => {
    if (typeof item !== 'object' || item === null) return;
    const s = item as Record<string, unknown>;
    const api = String(s['api'] ?? '');
    if (!isValidHttpUrl(api)) return; // 爬虫源(csp_/py_/.js/.jar)与非法 URL 直接跳过
    out.sites.push({
      siteKey: String(s['key'] ?? `site_${i + 1}`),
      name: String(s['name'] ?? `站点${i + 1}`),
      type: Number(s['type'] ?? 1) || 0,
      api,
      searchable: Number(s['searchable'] ?? 1),
      quickSearch: Number(s['quickSearch'] ?? 1),
      filterable: Number(s['filterable'] ?? 1),
      ext: typeof s['ext'] === 'string' ? s['ext'] : s['ext'] ? JSON.stringify(s['ext']) : null,
      jar: s['jar'] ? String(s['jar']) : null,
      sort: 2000 + i,
    });
  });

  const rawLives = Array.isArray(data['lives']) ? data['lives'] : [];
  rawLives.forEach((item, i) => {
    if (typeof item !== 'object' || item === null) return;
    const l = item as Record<string, unknown>;
    const url = String(l['url'] ?? '');
    if (!isValidHttpUrl(url)) return;
    out.lives.push({
      name: String(l['name'] ?? `直播${i + 1}`),
      type: Number(l['type'] ?? 0) || 0,
      url,
      epg: l['epg'] ? String(l['epg']) : null,
      sort: 2000 + i,
    });
  });

  const rawParses = Array.isArray(data['parses']) ? data['parses'] : [];
  rawParses.forEach((item, i) => {
    if (typeof item !== 'object' || item === null) return;
    const p = item as Record<string, unknown>;
    const url = String(p['url'] ?? '');
    if (!isValidHttpUrl(url)) return;
    out.parses.push({
      name: String(p['name'] ?? `解析${i + 1}`),
      type: Number(p['type'] ?? 0) || 0,
      url,
      ext: typeof p['ext'] === 'string' ? p['ext'] : p['ext'] ? JSON.stringify(p['ext']) : null,
      sort: 2000 + i,
    });
  });

  return out;
}

/** 添加订阅：拉取远程配置 → 解析 → 以订阅 id 归属入库（IndexedDB） */
export async function addSubscription(url: string): Promise<{ added: number; name: string }> {
  const raw = await fetchSubscriptionRaw(url);
  const parsed = parseTvboxConfigText(raw);

  const subs = loadSubscriptions();
  const subId = `sub-${Date.now().toString(36)}`;
  // 从配置中提取名称：常见顶层 name 字段
  let name = 'TVBox 订阅';
  try {
    const maybeName = (JSON.parse(stripJsonComments(raw)) as Record<string, unknown>)['name'];
    if (typeof maybeName === 'string' && maybeName.trim()) name = maybeName.trim();
  } catch { /* 保留默认名 */ }

  const siteList = parsed.sites.filter((s) => isHttpApiSite(s.api || '')).map((s, i) => ({
    ...(s as TvSite),
    id: `${subId}-s${i + 1}`,
    sourceId: subId,
  }));
  const liveList = parsed.lives.map((l, i) => ({ ...(l as TvLive), id: `${subId}-l${i + 1}`, sourceId: subId }));
  const parseList = parsed.parses.map((p, i) => ({ ...(p as TvParse), id: `${subId}-p${i + 1}`, sourceId: subId }));

  writeSubEntities(`tvbox_sub_sites_${subId}`, siteList);
  writeSubEntities(`tvbox_sub_lives_${subId}`, liveList);
  writeSubEntities(`tvbox_sub_parses_${subId}`, parseList);

  subs.push({ id: subId, name, url, addedAt: Date.now() });
  saveSubscriptions(subs);

  return { added: siteList.length + liveList.length + parseList.length, name };
}

export function removeSubscription(subId: string): void {
  saveSubscriptions(loadSubscriptions().filter((s) => s.id !== subId));
  removePersisted(`tvbox_sub_sites_${subId}`);
  removePersisted(`tvbox_sub_lives_${subId}`);
  removePersisted(`tvbox_sub_parses_${subId}`);
}

function readSubEntities<T>(key: string): T[] {
  return readPersisted<T[]>(key, []);
}

function writeSubEntities(key: string, value: unknown): void {
  writePersisted(key, value);
}

// ===== 汇总读取（presets ∪ 订阅 - 本地禁用） =====

export function getAllSites(): TvSite[] {
  const disabled = new Set(loadDisabledSiteIds());
  const subs = loadSubscriptions().flatMap((sub) => readSubEntities<TvSite>(`tvbox_sub_sites_${sub.id}`));
  return [...PRESET_SITES, ...subs]
    .filter((s) => isHttpApiSite(s.api))
    .filter((s) => !disabled.has(s.id))
    .sort((a, b) => a.sort - b.sort);
}

export function getAllLives(): TvLive[] {
  const subs = loadSubscriptions().flatMap((sub) => readSubEntities<TvLive>(`tvbox_sub_lives_${sub.id}`));
  return [...PRESET_LIVES, ...subs].sort((a, b) => a.sort - b.sort);
}

export function getAllParses(): TvParse[] {
  const subs = loadSubscriptions().flatMap((sub) => readSubEntities<TvParse>(`tvbox_sub_parses_${sub.id}`));
  return [...PRESET_PARSES, ...subs].sort((a, b) => a.sort - b.sort);
}

export function getSiteById(id: string): TvSite | undefined {
  return getAllSites().find((s) => s.id === id);
}

export function getLiveById(id: string): TvLive | undefined {
  return getAllLives().find((l) => l.id === id);
}

export function getParseById(id: string): TvParse | undefined {
  return [...PRESET_PARSES, ...loadSubscriptions().flatMap((sub) => readSubEntities<TvParse>(`tvbox_sub_parses_${sub.id}`))]
    .find((p) => p.id === id);
}

/** 管理面板用：列出已禁用站点（可恢复） */
export function getDisabledSites(): TvSite[] {
  const disabled = new Set(loadDisabledSiteIds());
  if (disabled.size === 0) return [];
  return [...PRESET_SITES, ...loadSubscriptions().flatMap((sub) => readSubEntities<TvSite>(`tvbox_sub_sites_${sub.id}`))]
    .filter((s) => disabled.has(s.id));
}

export { persistDisableSite as disableSitePersist, persistEnableSite as enableSitePersist };

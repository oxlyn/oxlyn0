import { CACHE_STORE, idbDel, idbEntries, idbGet, idbSet } from './idbStore'

/**
 * 内容缓存：IndexedDB 后端（原 localStorage 版随之退役）。
 * api.ts 的内存缓存冷启动是空的，这里把条目落进 IDB，下次打开直接命中；
 * 配合 api.ts 的 stale-while-revalidate，旧数据先上屏、后台刷新。
 *
 * 与 localStorage 版的差异：配额大了几个数量级，不再需要字符预算和指纹键 ——
 * 键直接用完整缓存键；淘汰简化为「条目数超限按落盘时间删最旧」；
 * 字符串条目（直播列表/订阅原文是唯一的大块头）超 100 万字符不落盘。
 * IDB 是事务化的结构化存储，不再需要防损坏的 JSON 解析兜底。
 */

/** 条目数上限：超出按 at 删最旧 */
const MAX_ENTRIES = 300
/** 字符串条目长度上限（约 2MB UTF-16） */
const MAX_STRING_CHARS = 1_000_000

export interface StoredValue {
  at: number;
  ttl: number;
  value: unknown;
}

export async function readStoredEntry(key: string): Promise<StoredValue | null> {
  const entry = await idbGet<StoredValue>(CACHE_STORE, key)
  if (!entry || typeof entry.at !== 'number' || entry.value == null) return null
  return entry
}

export async function writeStoredEntry(key: string, at: number, ttl: number, value: unknown): Promise<void> {
  if (typeof value === 'string' && value.length > MAX_STRING_CHARS) return
  const ok = await idbSet(CACHE_STORE, key, { at, ttl, value })
  if (ok) await evict()
}

/** 条目数超限时按 at 淘汰最旧。条目量在几百级，全量拉回排序可接受。 */
async function evict(): Promise<void> {
  const entries = await idbEntries<StoredValue>(CACHE_STORE)
  if (entries.length <= MAX_ENTRIES) return
  const sorted = [...entries].sort((a, b) => (a[1].at ?? 0) - (b[1].at ?? 0))
  for (let i = 0; i < sorted.length - MAX_ENTRIES; i++) {
    await idbDel(CACHE_STORE, sorted[i][0])
  }
}

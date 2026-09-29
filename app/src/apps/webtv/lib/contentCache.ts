/**
 * localStorage 内容缓存：api.ts 的内存缓存冷启动是空的，这里把条目落盘，
 * 下次打开直接命中；配合 api.ts 的 stale-while-revalidate，旧数据先上屏、后台刷新。
 *
 * 容量与淘汰：localStorage 一般 5MB，这里给 2MB 预算（按 UTF-16 字符数计）。
 * 超预算时淘汰「本次会话没读过、落盘时间最旧」的条目；单条超过 256KB 不落盘，
 * 避免一份巨大的直播列表把其它条目全部挤掉。写入失败（隐私模式/配额满）先淘汰
 * 再重试一次，仍失败就放弃该条 —— 整层静默降级为纯内存缓存。
 *
 * 索引不落盘：内存里记 <存储键, 字符数>，首次访问扫一遍 localStorage 建立；
 * 「最近读取时间」只记在内存 —— 跨会话没被读过的条目自然成为最旧候选，
 * 因此不需要为了淘汰排序把所有条目 JSON.parse 一遍。
 */

const PREFIX = 'tvbox_cache_';
/** 内容缓存总预算（UTF-16 字符数） */
const MAX_TOTAL_CHARS = 2_000_000;
/** 单条上限：超出视为不值得持久化 */
const MAX_ENTRY_CHARS = 256_000;

interface StoredEntry {
  key: string;
  at: number;
  ttl: number;
  value: unknown;
}

export type StoredValue = Omit<StoredEntry, 'key'>;

/** 存储键 → 条目字符数（含 JSON 包装） */
const index = new Map<string, number>();
/** 存储键 → 本次会话最近一次读取/写入时间（仅内存，用于淘汰排序） */
const touchedAt = new Map<string, number>();
let totalChars = 0;
let scanned = false;
let disabled = false;

function storageKeyOf(key: string): string {
  // 缓存键是完整 api URL + 参数，太长不能直接当 localStorage 键，收成 FNV-1a 指纹
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return PREFIX + (h >>> 0).toString(36);
}

function scan(): void {
  if (scanned) return;
  scanned = true;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(PREFIX)) continue;
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      index.set(k, raw.length);
      totalChars += raw.length;
    }
  } catch {
    disabled = true; // localStorage 不可用（隐私模式等）：整层静默失效
  }
}

function dropEntry(sk: string): void {
  totalChars -= index.get(sk) ?? 0;
  index.delete(sk);
  touchedAt.delete(sk);
  try { localStorage.removeItem(sk); } catch { /* 忽略 */ }
}

/** 命中缓存键。校验完整键防哈希碰撞；损坏条目直接清除。 */
export function readStoredEntry(key: string): StoredValue | null {
  scan();
  if (disabled || index.size === 0) return null;
  const sk = storageKeyOf(key);
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(sk);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const entry = JSON.parse(raw) as StoredEntry;
    if (entry.key !== key || typeof entry.at !== 'number' || entry.value == null) {
      throw new Error('entry mismatch');
    }
    touchedAt.set(sk, Date.now());
    return { at: entry.at, ttl: entry.ttl, value: entry.value };
  } catch {
    dropEntry(sk);
    return null;
  }
}

export function writeStoredEntry(key: string, at: number, ttl: number, value: unknown): void {
  scan();
  if (disabled) return;
  const sk = storageKeyOf(key);
  const payload = JSON.stringify({ key, at, ttl, value } satisfies StoredEntry);
  if (payload.length > MAX_ENTRY_CHARS) return;

  try {
    localStorage.setItem(sk, payload);
  } catch {
    // 配额满：先淘汰到一半再试一次，仍失败就放弃这一条
    evictTo(Math.floor(MAX_TOTAL_CHARS / 2));
    try {
      localStorage.setItem(sk, payload);
    } catch {
      return;
    }
  }
  totalChars += payload.length - (index.get(sk) ?? 0);
  index.set(sk, payload.length);
  touchedAt.set(sk, at);
  evictTo(MAX_TOTAL_CHARS);
}

/** 淘汰到 budget 以内：优先「本次会话没读过」的，其次落盘时间最旧的 */
function evictTo(budget: number): void {
  if (totalChars <= budget) return;
  const candidates = [...index.keys()].sort(
    (a, b) => (touchedAt.get(a) ?? 0) - (touchedAt.get(b) ?? 0)
  );
  for (const sk of candidates) {
    if (totalChars <= budget) break;
    dropEntry(sk);
  }
}

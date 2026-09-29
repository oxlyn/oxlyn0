import { idbDel, idbEntries, idbGet, idbSet, KV_STORE } from './idbStore'

/**
 * 小状态持久化：内存镜像 + IndexedDB 后端 + 旧 localStorage 数据迁移。
 *
 * 为什么有镜像：localStats 的读取全是同步 API（组件渲染路径上到处在调），
 * 而 IndexedDB 只有异步接口。启动时把 IDB 里的状态一次性抬进内存镜像，
 * 之后读全部走内存（O(1) 同步），写更新镜像并异步落库。
 * SourcesProvider 在 ready 之前 await hydratePersisted()，保证任何真实读取
 * 都发生在镜像填充之后。
 *
 * 迁移：首次运行把旧 localStorage 里 tvbox_ 前缀的键搬进 IDB，**写库成功后**
 * 才删旧键（失败则保留，下次启动重试）；IDB 已有的键以 IDB 为准并清掉旧键，
 * 避免陈旧旧数据复活。内容缓存（tvbox_cache_*）不迁移 —— 自重建数据，直接清掉，
 * 顺便把最多 2MB 的 localStorage 配额还给宿主。
 */

const LEGACY_PREFIX = 'tvbox_'
const LEGACY_CACHE_PREFIX = 'tvbox_cache_'

const mirror = new Map<string, unknown>()
let hydrated = false
let hydrating: Promise<void> | null = null

export function hydratePersisted(): Promise<void> {
  if (hydrated) return Promise.resolve()
  if (hydrating) return hydrating
  hydrating = (async () => {
    // 1) IDB 现有内容进镜像
    for (const [k, v] of await idbEntries<unknown>(KV_STORE)) {
      mirror.set(k, v)
    }
    // 2) 旧 localStorage 迁移
    const legacy = legacyKeys()
    for (const key of legacy) {
      if (mirror.has(key)) {
        removeLegacy(key) // IDB 已有：以 IDB 为准，清掉旧键避免复活陈旧数据
        continue
      }
      const raw = legacyGet(key)
      if (raw === undefined) continue
      mirror.set(key, raw)
      if (await idbSet(KV_STORE, key, raw)) removeLegacy(key)
    }
    purgeLegacyContentCache()
    hydrated = true
  })()
  return hydrating
}

/** 同步读：镜像未就绪时返回 fallback（正常流程下 hydrate 完成前组件还没 ready） */
export function readValue<T>(key: string, fallback: T): T {
  const v = mirror.get(key)
  return (v === undefined ? fallback : v) as T
}

/** 同步写：先更镜像（本会话立即生效），再异步落库 */
export function writeValue(key: string, value: unknown): void {
  mirror.set(key, value)
  void idbSet(KV_STORE, key, value)
}

export function removeValue(key: string): void {
  mirror.delete(key)
  void idbDel(KV_STORE, key)
  removeLegacy(key) // 迁移被中断时可能残留旧键，一并清掉
}

// ===== 旧 localStorage 读取（仅迁移用）=====

function legacyKeys(): string[] {
  const out: string[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(LEGACY_PREFIX) && !k.startsWith(LEGACY_CACHE_PREFIX)) out.push(k)
    }
  } catch { /* localStorage 不可用 */ }
  return out
}

function legacyGet(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return undefined
    try {
      return JSON.parse(raw)
    } catch {
      return raw // tvbox_last_site/last_live 存的是裸字符串，不是 JSON
    }
  } catch {
    return undefined
  }
}

function removeLegacy(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch { /* 忽略 */ }
}

/** 清掉旧内容缓存键：不再迁移（自重建数据），把最多 2MB 的 localStorage 配额还回去 */
function purgeLegacyContentCache(): void {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i)
      if (k && k.startsWith(LEGACY_CACHE_PREFIX)) localStorage.removeItem(k)
    }
  } catch { /* 忽略 */ }
}

/** 调试/测试用：镜像是否就绪 */
export function isHydrated(): boolean {
  return hydrated
}

/** 供异常排查：直接看后端里某个键（不经过镜像） */
export async function peekBackend<T>(key: string): Promise<T | undefined> {
  return idbGet<T>(KV_STORE, key)
}

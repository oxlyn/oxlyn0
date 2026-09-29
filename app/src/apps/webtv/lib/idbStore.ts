/**
 * 极简 IndexedDB 键值封装（promise 化），带 localStorage 降级：
 * IDB 打不开（老浏览器/极端隐私模式）时退回 localStorage，接口与语义不变。
 *
 * 一个库两个 store：'kv' 存小状态（收藏/订阅/选择/计数），'cache' 存内容缓存
 * （体积大、按时间淘汰）。降级模式下两者都落到 localStorage 的带前缀键上。
 *
 * 为什么是 IndexedDB：localStorage 是 best-effort 存储（Safari 7 天规则、
 * 浏览器存储压力整站驱逐），配额只有 5–10MB 还要和宿主桌面系统分；
 * IDB 容量大几个数量级，配合 navigator.storage.persist() 可申请「别驱逐」。
 */

const DB_NAME = 'webtv'
const DB_VERSION = 1
export const KV_STORE = 'kv'
export const CACHE_STORE = 'cache'

let dbPromise: Promise<IDBDatabase | null> | null = null

function openDb(): Promise<IDBDatabase | null> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        if (typeof indexedDB === 'undefined') {
          resolve(null)
          return
        }
        const req = indexedDB.open(DB_NAME, DB_VERSION)
        req.onupgradeneeded = () => {
          const db = req.result
          if (!db.objectStoreNames.contains(KV_STORE)) db.createObjectStore(KV_STORE)
          if (!db.objectStoreNames.contains(CACHE_STORE)) db.createObjectStore(CACHE_STORE)
        }
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => resolve(null)
        req.onblocked = () => resolve(null)
      } catch {
        resolve(null)
      }
    })
  }
  return dbPromise
}

export async function idbGet<T>(store: string, key: string): Promise<T | undefined> {
  const db = await openDb()
  if (!db) return lsGet<T>(lsKey(store, key))
  return new Promise((resolve) => {
    try {
      const req = db.transaction(store, 'readonly').objectStore(store).get(key)
      req.onsuccess = () => resolve(req.result as T | undefined)
      req.onerror = () => resolve(undefined)
    } catch {
      resolve(undefined)
    }
  })
}

export async function idbSet(store: string, key: string, value: unknown): Promise<boolean> {
  const db = await openDb()
  if (!db) return lsSet(lsKey(store, key), value)
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(store, 'readwrite')
      tx.objectStore(store).put(value, key)
      tx.oncomplete = () => resolve(true)
      tx.onerror = () => resolve(false)
      tx.onabort = () => resolve(false)
    } catch {
      resolve(false)
    }
  })
}

export async function idbDel(store: string, key: string): Promise<void> {
  const db = await openDb()
  if (!db) {
    lsDel(lsKey(store, key))
    return
  }
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(store, 'readwrite')
      tx.objectStore(store).delete(key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
      tx.onabort = () => resolve()
    } catch {
      resolve()
    }
  })
}

/** 列出 store 内全部键值。条目量在几百级，一次性拉回可接受；键序一致由同一事务保证。 */
export async function idbEntries<T>(store: string): Promise<Array<[string, T]>> {
  const db = await openDb()
  if (!db) return lsEntries<T>(lsPrefix(store))
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(store, 'readonly')
      const os = tx.objectStore(store)
      const keysReq = os.getAllKeys()
      const valsReq = os.getAll()
      tx.oncomplete = () => {
        const keys = keysReq.result as IDBValidKey[]
        const vals = valsReq.result as T[]
        resolve(keys.map((k, i) => [String(k), vals[i]]))
      }
      tx.onerror = () => resolve([])
      tx.onabort = () => resolve([])
    } catch {
      resolve([])
    }
  })
}

// ===== localStorage 降级后端 =====

const LS_PREFIX = 'webtv_'
const lsKey = (store: string, key: string) => `${LS_PREFIX}${store}:${key}`
const lsPrefix = (store: string) => `${LS_PREFIX}${store}:`

function lsGet<T>(k: string): T | undefined {
  try {
    const raw = localStorage.getItem(k)
    return raw ? (JSON.parse(raw) as T) : undefined
  } catch {
    return undefined
  }
}

function lsSet(k: string, value: unknown): boolean {
  try {
    localStorage.setItem(k, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function lsDel(k: string): void {
  try {
    localStorage.removeItem(k)
  } catch { /* 忽略 */ }
}

function lsEntries<T>(prefix: string): Array<[string, T]> {
  const out: Array<[string, T]> = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k || !k.startsWith(prefix)) continue
      const v = lsGet<T>(k)
      if (v !== undefined) out.push([k.slice(prefix.length), v])
    }
  } catch { /* 忽略 */ }
  return out
}

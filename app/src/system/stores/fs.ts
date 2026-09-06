import { create } from 'zustand'
import { FS_SEED } from '../fs-seed'

export interface FsNode {
  id: string
  parentId: string | null
  name: string
  kind: 'folder' | 'file'
  mime?: string
  content?: string
  created: number
  modified: number
}

interface FsState {
  nodes: Record<string, FsNode>
  create: (n: { parentId: string; name: string; kind: FsNode['kind']; mime?: string; content?: string }) => string
  rename: (id: string, name: string) => void
  move: (id: string, parentId: string) => void
  setContent: (id: string, content: string) => void
  trash: (id: string) => void
  emptyTrash: () => void
}

let seq = 0
const nid = () => `fs-${Date.now().toString(36)}-${++seq}`
export const TRASH_ID = 'trash'

/** Pure helpers — components select `nodes` (stable) and derive with useMemo. */
export const childrenOf = (nodes: Record<string, FsNode>, parentId: string): FsNode[] =>
  Object.values(nodes)
    .filter((n) => n.parentId === parentId)
    .sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === 'folder' ? -1 : 1))

export const pathOf = (nodes: Record<string, FsNode>, id: string): FsNode[] => {
  const out: FsNode[] = []
  let cur = nodes[id]
  while (cur) {
    out.unshift(cur)
    cur = cur.parentId ? nodes[cur.parentId] : (undefined as never)
  }
  return out
}

export const useFs = create<FsState>((set, get) => ({
  nodes: Object.fromEntries(FS_SEED.map((n) => [n.id, n])),

  create: ({ parentId, name, kind, mime, content }) => {
    const id = nid()
    const now = Date.now()
    set((s) => ({ nodes: { ...s.nodes, [id]: { id, parentId, name, kind, mime, content, created: now, modified: now } } }))
    return id
  },

  rename: (id, name) =>
    set((s) => ({ nodes: { ...s.nodes, [id]: { ...s.nodes[id], name, modified: Date.now() } } })),

  move: (id, parentId) =>
    set((s) => ({ nodes: { ...s.nodes, [id]: { ...s.nodes[id], parentId, modified: Date.now() } } })),

  setContent: (id, content) =>
    set((s) => ({ nodes: { ...s.nodes, [id]: { ...s.nodes[id], content, modified: Date.now() } } })),

  trash: (id) => {
    const node = get().nodes[id]
    if (!node || node.parentId === TRASH_ID) return
    get().move(id, TRASH_ID)
  },

  emptyTrash: () =>
    set((s) => {
      const nodes = { ...s.nodes }
      for (const n of Object.values(nodes)) if (n.parentId === TRASH_ID || n.id === TRASH_ID) delete nodes[n.id]
      // keep an empty .trash folder
      const now = Date.now()
      nodes[TRASH_ID] = { id: TRASH_ID, parentId: 'home', name: '.trash', kind: 'folder', created: now, modified: now }
      return { nodes }
    }),
}))

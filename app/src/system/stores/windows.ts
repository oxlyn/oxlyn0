import { create } from 'zustand'
import { appById } from '../registry'

export interface Win {
  id: string
  appId: string
  x: number
  y: number
  w: number
  h: number
  /** Rect to restore to after maximize. */
  prev?: { x: number; y: number; w: number; h: number }
  z: number
  minimized: boolean
  maximized: boolean
  payload?: Record<string, unknown>
  /**
   * Closed keep-alive window parked hidden in place (never unmounted —
   * moving/unmounting an iframe reloads it). Revived by the next open().
   */
  dormant?: boolean
  /** Park order, used to evict the oldest dormant window. */
  dormantSeq?: number
}

interface WindowsState {
  wins: Win[]
  focusedId: string | null
  /** Window shown in distraction-free full-screen "focus mode" (other chrome hidden). */
  focusId: string | null
  topZ: number
  cascade: number
  open: (appId: string, payload?: Record<string, unknown>) => void
  close: (id: string) => void
  focus: (id: string) => void
  minimize: (id: string) => void
  toggleMaximize: (id: string) => void
  toggleFocusMode: (id: string) => void
  setRect: (id: string, rect: Partial<Pick<Win, 'x' | 'y' | 'w' | 'h'>>) => void
  setPayload: (id: string, payload: Record<string, unknown>) => void
}

let seq = 0
const uid = () => `win-${Date.now().toString(36)}-${++seq}`

let parkSeq = 0
/** Dormant (parked keep-alive) windows kept mounted, oldest evicted first. */
const DORMANT_CAP = 2

export const useWindows = create<WindowsState>((set, get) => ({
  wins: [],
  focusedId: null,
  focusId: null,
  topZ: 10,
  cascade: 0,

  open: (appId, payload) => {
    const app = appById.get(appId)
    if (!app) return
    const existing = get().wins.filter((w) => w.appId === appId)

    // Keep-alive apps: reviving a dormant window reuses its live iframe —
    // no reload, app state intact.
    const dormantWin = existing.find((w) => w.dormant)
    if (dormantWin) {
      set((s) => ({
        topZ: s.topZ + 1,
        focusedId: dormantWin.id,
        wins: s.wins.map((v) =>
          v.id === dormantWin.id
            ? { ...v, z: s.topZ + 1, dormant: false, minimized: false, payload: payload ?? v.payload }
            : v,
        ),
      }))
      return
    }

    const focusExisting = (w: Win) =>
      set((s) => ({
        topZ: s.topZ + 1,
        focusedId: w.id,
        wins: s.wins.map((v) =>
          v.id === w.id ? { ...v, z: s.topZ + 1, minimized: false, payload: payload ?? v.payload } : v,
        ),
      }))

    // Singleton apps and icon-style opens (Dock / Launchpad, no payload) never
    // spawn a second window — clicking repeatedly just brings the app forward.
    if ((app.singleton || payload == null) && existing.length > 0) {
      const top = existing.slice().sort((a, b) => b.z - a.z)[0]
      focusExisting(top)
      return
    }

    // Same open target twice (e.g. the same file) → focus, don't duplicate.
    const key = JSON.stringify(payload ?? null)
    const samePayload = existing.find((w) => JSON.stringify(w.payload ?? null) === key)
    if (samePayload) {
      focusExisting(samePayload)
      return
    }

    const { topZ, cascade } = get()
    const vw = window.innerWidth, vh = window.innerHeight
    const w = Math.min(app.defaultSize.w, vw - 40)
    // Workspace between the menu bar and the Dock.
    const workTop = 28 + 8
    const workBottom = vh - 88 - 8
    const h = Math.min(app.defaultSize.h, Math.max(240, workBottom - workTop))
    // Horizontally centered, vertically in the upper third of the workspace;
    // cascade only nudges slightly so repeated opens never drift low.
    const off = (cascade % 4) * 20
    const x = Math.max(8, Math.min(Math.round((vw - w) / 2) + off, vw - w - 8))
    const upper = workTop + Math.round((workBottom - workTop - h) / 4)
    const y = Math.max(workTop, Math.min(upper + off, workTop + Math.round((workBottom - workTop - h) / 2)))
    const win: Win = {
      id: uid(),
      appId,
      x, y, w, h, z: topZ + 1,
      minimized: false,
      maximized: false,
      payload,
    }
    set((s) => ({ wins: [...s.wins, win], focusedId: win.id, topZ: s.topZ + 1, cascade: s.cascade + 1 }))
  },

  close: (id) =>
    set((s) => {
      const win = s.wins.find((w) => w.id === id)
      if (!win) return {}
      const keepAlive = appById.get(win.appId)?.keepAlive

      let rest: Win[]
      if (keepAlive) {
        // Park the window dormant (stays mounted, hidden in place). Cap the
        // pool by park order — the oldest dormant window is destroyed.
        const dormant = s.wins.filter((w) => w.dormant && w.id !== id)
        const evict =
          dormant.length >= DORMANT_CAP ? dormant.reduce((a, b) => (a.dormantSeq! <= b.dormantSeq! ? a : b)).id : null
        parkSeq++
        rest = s.wins
          .map((w) => (w.id === id ? { ...w, dormant: true, dormantSeq: parkSeq } : w))
          .filter((w) => w.id !== evict)
      } else {
        rest = s.wins.filter((w) => w.id !== id)
      }

      const nextFocus = rest.filter((w) => !w.dormant && !w.minimized).sort((a, b) => b.z - a.z)[0]
      return { wins: rest, focusedId: nextFocus?.id ?? null, focusId: s.focusId === id ? null : s.focusId }
    }),

  focus: (id) =>
    set((s) => {
      if (s.focusedId === id && !s.wins.find((w) => w.id === id)?.minimized) return s
      return {
        topZ: s.topZ + 1,
        focusedId: id,
        wins: s.wins.map((w) => (w.id === id ? { ...w, z: s.topZ + 1, minimized: false } : w)),
      }
    }),

  minimize: (id) =>
    set((s) => {
      const rest = s.wins.filter((w) => w.id !== id && !w.minimized).sort((a, b) => b.z - a.z)[0]
      return {
        wins: s.wins.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
        focusedId: rest?.id ?? null,
        focusId: s.focusId === id ? null : s.focusId,
      }
    }),

  toggleMaximize: (id) =>
    set((s) => ({
      wins: s.wins.map((w) => {
        if (w.id !== id) return w
        if (w.maximized && w.prev) return { ...w, ...w.prev, maximized: false, prev: undefined }
        return { ...w, prev: { x: w.x, y: w.y, w: w.w, h: w.h }, maximized: true }
      }),
    })),

  /** Full-screen, distraction-free mode: only this window, nothing else. */
  toggleFocusMode: (id) =>
    set((s) => ({ focusId: s.focusId === id ? null : id })),

  setRect: (id, rect) =>
    set((s) => ({ wins: s.wins.map((w) => (w.id === id ? { ...w, ...rect } : w)) })),

  setPayload: (id, payload) =>
    set((s) => ({ wins: s.wins.map((w) => (w.id === id ? { ...w, payload } : w)) })),
}))

export const focusedAppId = () => {
  const { wins, focusedId } = useWindows.getState()
  return wins.find((w) => w.id === focusedId)?.appId ?? null
}

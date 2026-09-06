import { create } from 'zustand'

const B = (f: string) => `${import.meta.env.BASE_URL}${f}`

export interface Wallpaper { id: string; name: string; url: string; dark?: boolean }

export const WALLPAPERS: Wallpaper[] = [
  { id: 'graphite', name: 'Graphite', url: B('wallpaper-graphite.svg'), dark: true },
  { id: 'glass-dark', name: 'Glass Dark', url: B('wallpaper-glass-dark.svg'), dark: true },
  { id: 'glass-light', name: 'Glass Light', url: B('wallpaper-glass-light.svg') },
  { id: 'aurora', name: 'Aurora', url: B('wallpaper-aurora.svg'), dark: true },
  { id: 'sunset', name: 'Sunset', url: B('wallpaper-sunset.svg'), dark: true },
  { id: 'mint', name: 'Mint', url: B('wallpaper-mint.svg') },
]

interface SystemState {
  booted: boolean
  theme: 'light' | 'dark'
  wallpaper: string
  /** Window title-bar strip transparency: 0 = opaque (default) … 1 = fully clear. */
  titlebarTransparency: number
  /** Booted via ?app=<id> into a standalone single-app tab (no window chrome at all). */
  standalone: boolean
  login: () => void
  lock: () => void
  setTheme: (t: 'light' | 'dark') => void
  setWallpaper: (id: string) => void
  setTitlebarTransparency: (t: number) => void
}

export const useSystem = create<SystemState>((set, get) => ({
  booted: false,
  theme: 'dark',
  wallpaper: 'graphite',
  titlebarTransparency: 0,
  standalone: false,
  login: () => set({ booted: true }),
  lock: () => set({ booted: false }),
  setTheme: (t) => set({ theme: t }),
  setWallpaper: (id) => set({ wallpaper: id }),
  setTitlebarTransparency: (t) => set({ titlebarTransparency: Math.min(1, Math.max(0, t)) }),
}))

/** Current wallpaper spec. */
export const currentWallpaper = () => {
  const { wallpaper } = useSystem.getState()
  return WALLPAPERS.find((w) => w.id === wallpaper) ?? WALLPAPERS[0]
}

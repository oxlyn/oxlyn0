import { useState } from 'react'
import { Settings as SettingsGlyph, Sun, Image as ImageIcon, Info, Wifi, Bluetooth, Volume2, Monitor, Check } from 'lucide-react'
import { useSystem, WALLPAPERS } from '@/system/stores/system'
import type { AppDefinition, AppWindowProps } from '@/system/types'

const PANES = [
  { id: 'appearance', label: 'Appearance', Icon: Sun, available: true },
  { id: 'wallpaper', label: 'Wallpaper', Icon: ImageIcon, available: true },
  { id: 'about', label: 'About', Icon: Info, available: true },
  { id: 'wifi', label: 'Wi-Fi', Icon: Wifi, available: false },
  { id: 'bluetooth', label: 'Bluetooth', Icon: Bluetooth, available: false },
  { id: 'sound', label: 'Sound', Icon: Volume2, available: false },
  { id: 'displays', label: 'Displays', Icon: Monitor, available: false },
] as const

function Settings({ payload }: AppWindowProps) {
  const [pane, setPane] = useState<string>((payload?.pane as string) ?? 'appearance')
  const paneId = PANES.some((p) => p.id === pane && p.available) ? pane : 'appearance'

  return (
    <div className="flex h-full text-[13px]">
      <div className="glass-thin w-48 shrink-0 border-r border-black/10 p-2 dark:border-white/10">
        {PANES.map(({ id, label, Icon, available }) => (
          <button
            key={id}
            disabled={!available}
            onClick={() => setPane(id)}
            className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left ${
              paneId === id ? 'bg-blue-500 text-white' : available ? 'hover:bg-black/5 dark:hover:bg-white/10' : 'opacity-35'
            }`}
          >
            <span
              className="flex h-5.5 w-5.5 items-center justify-center rounded-[6px] text-white"
              style={{ background: paneId === id ? 'rgba(255,255,255,0.25)' : 'linear-gradient(160deg,#8E8E93,#48484A)', width: 22, height: 22 }}
            >
              <Icon size={13} />
            </span>
            {label}
          </button>
        ))}
      </div>
      <div className="min-w-0 flex-1 overflow-y-auto p-5">
        {paneId === 'appearance' && <AppearancePane />}
        {paneId === 'wallpaper' && <WallpaperPane />}
        {paneId === 'about' && <AboutPane />}
      </div>
    </div>
  )
}

function AppearancePane() {
  const theme = useSystem((s) => s.theme)
  const setTheme = useSystem((s) => s.setTheme)
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">Appearance</h2>
      <div className="flex gap-4">
        {(['light', 'dark'] as const).map((t) => (
          <button key={t} onClick={() => setTheme(t)} className="group text-center">
            <div
              className={`relative h-24 w-36 overflow-hidden rounded-lg ring-2 ${theme === t ? 'ring-blue-500' : 'ring-black/10 dark:ring-white/15'}`}
              style={{ background: t === 'light' ? 'linear-gradient(160deg,#8fd3f4,#cfe9ff)' : 'linear-gradient(160deg,#1c1c2e,#0a0a14)' }}
            >
              <div className={`absolute top-4 left-4 h-8 w-20 rounded-md ${t === 'light' ? 'bg-white/70' : 'bg-white/15'}`} />
              <div className={`absolute right-4 bottom-3 h-10 w-24 rounded-t-lg ${t === 'light' ? 'bg-white/85' : 'bg-black/60'}`} />
              {theme === t && (
                <span className="absolute top-1.5 right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-500" style={{ width: 18, height: 18 }}>
                  <Check size={11} className="text-white" />
                </span>
              )}
            </div>
            <div className="mt-1.5 font-medium capitalize">{t}</div>
          </button>
        ))}
      </div>
      <p className="mt-4 max-w-md text-black/50 dark:text-white/50">
        Liquid Glass adapts to the appearance. System surfaces pick up the tint automatically.
      </p>
    </div>
  )
}

function WallpaperPane() {
  const wallpaper = useSystem((s) => s.wallpaper)
  const setWallpaper = useSystem((s) => s.setWallpaper)
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">Wallpaper</h2>
      <div className="grid grid-cols-3 gap-4">
        {WALLPAPERS.map((w) => (
          <button key={w.id} onClick={() => setWallpaper(w.id)} className="text-left">
            <img
              src={w.url}
              alt={w.name}
              className={`aspect-[16/10] w-full rounded-lg object-cover ring-2 ${wallpaper === w.id ? 'ring-blue-500' : 'ring-black/10 dark:ring-white/15'}`}
            />
            <div className="mt-1.5 flex items-center gap-1.5 font-medium">
              {w.name}
              {wallpaper === w.id && <Check size={13} className="text-blue-500" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function AboutPane() {
  return (
    <div className="flex flex-col items-center pt-6 text-center">
      <div
        className="mb-4 flex h-24 w-24 items-center justify-center rounded-2xl text-3xl font-bold text-white"
        style={{ background: 'linear-gradient(160deg,#5EC9F8,#1463E8)' }}
      >
        27
      </div>
      <h2 className="text-xl font-bold">macOS 27 — Golden Gate</h2>
      <p className="text-black/50 dark:text-white/50">Web Edition · Liquid Glass</p>
      <div className="mt-6 w-72 space-y-2 text-left">
        {[
          ['Owner', 'Oxlyn'],
          ['Runtime', 'React + TypeScript, Rolldown'],
          ['Window Manager', 'zustand'],
          ['Apps', 'self-registering — see src/apps/'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between border-b border-black/8 pb-1.5 dark:border-white/10">
            <span className="text-black/50 dark:text-white/50">{k}</span>
            <span className="font-medium">{v}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 max-w-sm text-xs leading-relaxed text-black/40 dark:text-white/40">
        This desktop is a résumé. Every app runs — start with Notes, Mail and the Documents folder.
      </p>
    </div>
  )
}

export default {
  id: 'settings',
  name: 'System Settings',
  icon: { from: '#8E8E93', to: '#48484A', Icon: SettingsGlyph },
  component: Settings,
  defaultSize: { w: 780, h: 600 },
  minSize: { w: 620, h: 480 },
  category: 'Utilities',
  keywords: ['preferences', 'wallpaper', 'appearance', 'dark mode'],
  singleton: true,
} satisfies AppDefinition

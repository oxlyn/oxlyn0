import { useEffect, useState } from 'react'
import { useSystem } from './system/stores/system'
import { useWindows } from './system/stores/windows'
import { appById } from './system/registry'
import { LoginScreen } from './system/components/LoginScreen'
import { Desktop } from './system/components/Desktop'
import { MenuBar } from './system/components/MenuBar'
import { Dock } from './system/components/Dock'
import { WindowFrame } from './system/components/WindowFrame'
import { Launchpad } from './system/components/Launchpad'
import { Spotlight } from './system/components/Spotlight'

/** Boot directly into a single app (used by the title-bar "pop out" button: ?app=<id>). */
function bootIntoApp() {
  const appId = new URLSearchParams(location.search).get('app')
  if (!appId || !appById.has(appId)) return
  useSystem.setState({ standalone: true })
  useSystem.getState().login()
  useWindows.getState().open(appId)
  const win = useWindows.getState().wins.find((w) => w.appId === appId)
  if (win) {
    useWindows.getState().toggleFocusMode(win.id)
    document.title = `${appById.get(appId)!.name} — macOS 27`
  }
}

export default function App() {
  const booted = useSystem((s) => s.booted)
  const theme = useSystem((s) => s.theme)
  const wins = useWindows((s) => s.wins)
  const focusId = useWindows((s) => s.focusId)
  const [launchpad, setLaunchpad] = useState(false)
  const [spotlight, setSpotlight] = useState(false)

  useEffect(bootIntoApp, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.code === 'Space')) {
        e.preventDefault()
        setSpotlight((v) => !v)
        setLaunchpad(false)
      }
      if (e.key === 'Escape') {
        setSpotlight(false)
        const { focusId, toggleFocusMode } = useWindows.getState()
        // standalone tabs stay a pure single-app page — no desktop behind them
        if (focusId && !useSystem.getState().standalone) toggleFocusMode(focusId)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!booted) return <LoginScreen />

  // Focus mode: only the focused window, no menu bar / dock / desktop icons.
  const visible = focusId ? wins.filter((w) => w.id === focusId) : wins

  return (
    <div className="h-full">
      <Desktop />
      {/* window layer — own stacking context so win.z never collides with chrome */}
      <div className="pointer-events-none fixed inset-0 z-10">
        {visible.map((w) => (
          <WindowFrame key={w.id} win={w} />
        ))}
      </div>
      {!focusId && <MenuBar onSpotlight={() => setSpotlight((v) => !v)} />}
      {!focusId && <Dock />}
      {!focusId && launchpad && <Launchpad onClose={() => setLaunchpad(false)} />}
      {!focusId && spotlight && <Spotlight onClose={() => setSpotlight(false)} />}
    </div>
  )
}

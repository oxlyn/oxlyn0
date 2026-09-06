import { useEffect, useState } from 'react'
import { currentWallpaper, useSystem } from '../stores/system'

const AVATAR_URL = `${import.meta.env.BASE_URL}avatar-lotus.jpg`

export function LoginScreen() {
  const login = useSystem((s) => s.login)
  const wp = currentWallpaper()
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10_000)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter') login() }
    window.addEventListener('keydown', onKey)
    return () => { clearInterval(t); window.removeEventListener('keydown', onKey) }
  }, [login])

  return (
    <div className="fixed inset-0 cursor-pointer" onClick={login}>
      <img src={wp.url} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />
      <div className="relative flex h-full flex-col items-center justify-center gap-5 text-white">
        <div className="text-center drop-shadow-lg">
          <div className="text-[15px] font-medium opacity-90">
            {now.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <div className="text-7xl font-semibold tracking-tight tabular-nums">
            {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </div>
        </div>
        <div className="mt-6 flex flex-col items-center gap-3">
          <img
            src={AVATAR_URL}
            alt="Oxlyn"
            className="h-20 w-20 rounded-full object-cover ring-2 ring-white/40 shadow-lg"
          />
          <div className="text-lg font-medium drop-shadow">Oxlyn</div>
          <div className="text-sm text-white/80 drop-shadow">Click to log in</div>
        </div>
      </div>
    </div>
  )
}

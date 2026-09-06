import { useEffect } from 'react'
import { useSystem } from './stores/system'

/**
 * Keep a same-origin iframe app in sync with the desktop light/dark appearance.
 * `apply` runs on mount, on every iframe reload (`reloadKey` change), and
 * whenever the appearance flips in System Settings.
 */
export function useIframeDark(
  ref: React.RefObject<HTMLIFrameElement | null>,
  apply: (frame: HTMLIFrameElement, dark: boolean) => void,
  reloadKey?: unknown,
) {
  const dark = useSystem((s) => s.theme === 'dark')
  useEffect(() => {
    const run = () => {
      if (ref.current) apply(ref.current, dark)
    }
    run()
    const f = ref.current
    f?.addEventListener('load', run)
    return () => f?.removeEventListener('load', run)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark, reloadKey])
}

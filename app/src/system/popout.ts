import { appById } from './registry'

/**
 * Open an app in a new browser tab. Apps with a `popOutUrl` (self-contained
 * embedded sites) open that URL directly — no desktop re-boot, no iframe
 * reload. Everything else boots the desktop with ?app=<id>, which skips the
 * login screen and enters focus mode immediately, so the tab shows only
 * that app.
 */
export function popOutApp(appId: string) {
  const app = appById.get(appId)
  if (!app) return
  const url = app.popOutUrl?.() ?? `${location.origin}${import.meta.env.BASE_URL}?app=${appId}`
  window.open(url, '_blank', 'noopener')
}

import { appById } from './registry'

/**
 * Open an app in a new browser tab (same behavior as Study's 独立打开): the tab
 * boots the desktop with ?app=<id>, which skips the login screen and enters
 * focus mode immediately, so the tab shows only that app.
 */
export function popOutApp(appId: string) {
  const app = appById.get(appId)
  if (!app) return
  window.open(`${location.origin}${import.meta.env.BASE_URL}?app=${appId}`, '_blank', 'noopener')
}

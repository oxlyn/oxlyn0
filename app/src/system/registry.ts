import { create } from 'zustand'
import type { AppDefinition } from './types'

/**
 * App auto-discovery.
 *
 * Every `src/apps/<id>/app.tsx` that default-exports an AppDefinition is
 * discovered here. Modules load ASYNC (the bundler code-splits one chunk per
 * app): call `appsReady()` to kick off the loads — it fills the exported
 * arrays in place and flips `useAppsReady` when the registry is complete, so
 * the shell can re-render. To add an app, create a directory under src/apps/
 * with an app.tsx — it then shows up on the Dock, Launchpad, Spotlight and
 * the desktop. Nothing else to wire up.
 */
const loaders = import.meta.glob<{ default: AppDefinition }>('../apps/*/app.tsx')

/** All apps, name-sorted — filled once appsReady() resolves. */
export const apps: AppDefinition[] = []
export const appById: Map<string, AppDefinition> = new Map()

/** Subscribable readiness flag (the registry fills asynchronously). */
export const useAppsReady = create<{ ready: boolean }>(() => ({ ready: false }))

let load: Promise<void> | null = null
export function appsReady(): Promise<void> {
  load ??= Promise.all(Object.values(loaders).map((loadApp) => loadApp())).then((mods) => {
    for (const mod of mods) {
      const app = mod.default
      apps.push(app)
      appById.set(app.id, app)
    }
    apps.sort((a, b) => a.name.localeCompare(b.name))
    rebuildDock()
    useAppsReady.setState({ ready: true })
  })
  return load
}

/** Dock layout, mirroring the original system (unlisted apps live in Launchpad only). */
const DOCK_ORDER = [
  'finder', 'launchpad', 'safari', 'messages', 'mail', 'maps',
  'reminders', 'notes', 'freeform', 'music', 'tv', 'news',
  'games', 'settings',
]

export const dockApps: AppDefinition[] = []

function rebuildDock() {
  dockApps.length = 0
  dockApps.push(
    ...DOCK_ORDER.map((id) => appById.get(id)).filter((a): a is AppDefinition => Boolean(a)),
    ...apps.filter((a) => a.inDock === true && !DOCK_ORDER.includes(a.id)),
  )
}

export const launchpadApps: AppDefinition[] = apps

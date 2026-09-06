import type { AppDefinition } from './types'

/**
 * App auto-discovery.
 *
 * Every `src/apps/<id>/app.tsx` that default-exports an AppDefinition is
 * loaded here at startup. To add an app, create a directory under src/apps/
 * with an app.tsx — it then shows up on the Dock, Launchpad, Spotlight and
 * the desktop automatically. Nothing else to wire up.
 */
const modules = import.meta.glob<{ default: AppDefinition }>('../apps/*/app.tsx', { eager: true })

export const apps: AppDefinition[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.name.localeCompare(b.name))

export const appById: Map<string, AppDefinition> = new Map(apps.map((a) => [a.id, a]))

/** Dock layout, mirroring the original system (unlisted apps live in Launchpad only). */
const DOCK_ORDER = [
  'finder', 'launchpad', 'safari', 'messages', 'mail', 'maps', 'photos', 'facetime', 'phone',
  'calendar', 'contacts', 'reminders', 'notes', 'freeform', 'music', 'podcasts', 'tv', 'news',
  'games', 'appstore', 'settings',
]

export const dockApps: AppDefinition[] = DOCK_ORDER.map((id) => appById.get(id))
  .filter((a): a is AppDefinition => Boolean(a))
  .concat(apps.filter((a) => a.inDock === true && !DOCK_ORDER.includes(a.id)))

export const launchpadApps: AppDefinition[] = apps

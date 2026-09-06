import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'

/** Props every app window component receives. */
export interface AppWindowProps {
  winId: string
  /** Open-time context, e.g. { folder: 'downloads' } for Finder, { nodeId } for Preview. */
  payload?: Record<string, unknown>
}

/** Gradient + glyph icon, rendered by <AppIcon/> (src/system/AppIcon.tsx). */
export interface AppIconSpec {
  from: string
  to: string
  Icon: LucideIcon
  glyphColor?: string
}

/**
 * The contract every app exports from `src/apps/<id>/app.tsx`.
 * The system discovers all apps via import.meta.glob at load time —
 * drop a directory in src/apps/ and the app appears everywhere.
 */
export interface AppDefinition {
  id: string
  name: string
  icon: AppIconSpec
  component: ComponentType<AppWindowProps>
  defaultSize: { w: number; h: number }
  minSize?: { w: number; h: number }
  category?: string
  keywords?: string[]
  /** Only one window instance (default: false). */
  singleton?: boolean
  /** Show in the Dock (default: true). */
  inDock?: boolean
}

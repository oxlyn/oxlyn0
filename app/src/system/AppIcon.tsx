import type { AppIconSpec } from './types'

/** Squircle-ish gradient app icon with a lucide glyph, matching the original look. */
export function AppIcon({ icon, size = 48 }: { icon: AppIconSpec; size?: number }) {
  const { from, to, Icon, glyphColor } = icon
  return (
    <div
      className="flex items-center justify-center shadow-md ring-1 ring-black/10 dark:ring-white/15"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.24,
        background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.35)',
      }}
    >
      <Icon size={size * 0.52} strokeWidth={1.9} color={glyphColor ?? '#fff'} />
    </div>
  )
}

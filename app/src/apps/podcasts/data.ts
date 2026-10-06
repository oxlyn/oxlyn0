/**
 * Content extracted from the original macos27 bundle (source: podcasts.json).
 * Plain source file — edit directly.
 */
// Media URLs are BASE_URL-relative so dev (/macos27/), CF (/) and any base resolve.
const B = (f: string) => import.meta.env.BASE_URL + f

export const podcastsSeed = {
  "shows": [
    {
      "id": "gradient-hour",
      "title": "The Gradient Hour",
      "host": "Mira Chen & Dev Okafor",
      "desc": "A weekly conversation about interface design, motion, and the craft of building software that feels alive. Recorded in a sunlit studio in the Mission.",
      "artwork": B("images/podcast-cover.svg"),
      "genre": "Design"
    },
    {
      "id": "night-circuit",
      "title": "Night Circuit",
      "host": "DJ Nocturne",
      "desc": "One hour of synthwave, ambient and late-night electronic selections, mixed live. Best experienced after midnight with good headphones.",
      "artwork": B("images/cover-1.svg"),
      "genre": "Music"
    }
  ],
  "episodes": [
    {
      "id": "gh-3",
      "showId": "gradient-hour",
      "title": "Liquid Glass, one year later",
      "desc": "Refraction, readability, and what we learned shipping a glass-first design system.",
      "src": B("app/src/apps/music/audio/track-2.mp3"),
      "date": "2026-07-15T08:00:00",
      "duration": 0
    },
    {
      "id": "gh-2",
      "showId": "gradient-hour",
      "title": "The anatomy of a perfect sidebar",
      "desc": "Why every great Mac app starts with 220 points of frosted hierarchy.",
      "src": B("app/src/apps/music/audio/track-3.mp3"),
      "date": "2026-07-08T08:00:00",
      "duration": 0
    },
    {
      "id": "gh-1",
      "showId": "gradient-hour",
      "title": "Color, contrast, and the 60fps rule",
      "desc": "Motion budgets, transform-only animation, and shipping the upper end of every wash range.",
      "src": B("app/src/apps/music/audio/track-4.mp3"),
      "date": "2026-07-01T08:00:00",
      "duration": 0
    },
    {
      "id": "nc-42",
      "showId": "night-circuit",
      "title": "Night Circuit 042: Neon Skyline",
      "desc": "Chrome horizons and magenta grids — a synthwave set featuring Vector Fields.",
      "src": B("app/src/apps/music/audio/track-1.mp3"),
      "date": "2026-07-12T23:00:00",
      "duration": 0
    },
    {
      "id": "nc-41",
      "showId": "night-circuit",
      "title": "Night Circuit 041: Midnight Drift",
      "desc": "Ambient textures for the drive home, with Isla Wave in the mix.",
      "src": B("app/src/apps/music/audio/track-4.mp3"),
      "date": "2026-07-05T23:00:00",
      "duration": 0
    },
    {
      "id": "nc-40",
      "showId": "night-circuit",
      "title": "Night Circuit 040: Golden Hour Mix",
      "desc": "Lo-fi warmth to close out the season, courtesy of Café Mono.",
      "src": B("app/src/apps/music/audio/track-2.mp3"),
      "date": "2026-06-28T23:00:00",
      "duration": 0
    }
  ]
}

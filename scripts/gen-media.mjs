// Generates the gradient SVG media set (wallpapers / album covers / photo
// samples) that replaced the original JPGs — ~1KB each instead of ~2.7MB total.
import { writeFileSync } from 'node:fs'

const svg = (w, h, stops, glows = []) => {
  const [from, to] = stops
  const defs = [
    `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient>`,
    ...glows.map((g, i) => `<radialGradient id="glow${i}" cx="${g.cx}" cy="${g.cy}" r="${g.r}"><stop offset="0" stop-color="${g.c}" stop-opacity="${g.o ?? 0.32}"/><stop offset="1" stop-color="${g.c}" stop-opacity="0"/></radialGradient>`),
  ].join('')
  const rects = glows.map((_, i) => `<rect width="${w}" height="${h}" fill="url(#glow${i})"/>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs><rect width="${w}" height="${h}" fill="url(#g)"/>${rects}</svg>`
}

// ---- wallpapers 2560×1600 ----
const wallpapers = {
  'wallpaper-glass-dark': svg(2560, 1600, ['#070c1e', '#15224a'], [
    { cx: 0.78, cy: 0.16, r: 0.75, c: '#5EC9F8', o: 0.30 },
    { cx: 0.12, cy: 0.88, r: 0.7, c: '#B58CFF', o: 0.22 },
  ]),
  'wallpaper-glass-light': svg(2560, 1600, ['#e6eefa', '#f7f3ea'], [
    { cx: 0.75, cy: 0.2, r: 0.7, c: '#58B8FF', o: 0.20 },
    { cx: 0.15, cy: 0.85, r: 0.65, c: '#FFB35C', o: 0.16 },
  ]),
  'wallpaper-aurora': svg(2560, 1600, ['#120e33', '#0b2036'], [
    { cx: 0.2, cy: 0.15, r: 0.75, c: '#B150E2', o: 0.34 },
    { cx: 0.8, cy: 0.85, r: 0.75, c: '#30D158', o: 0.20 },
  ]),
  'wallpaper-sunset': svg(2560, 1600, ['#231038', '#B23A67'], [
    { cx: 0.75, cy: 0.75, r: 0.8, c: '#FF9A56', o: 0.38 },
    { cx: 0.15, cy: 0.15, r: 0.6, c: '#7D2AE8', o: 0.25 },
  ]),
  'wallpaper-mint': svg(2560, 1600, ['#e0f5ec', '#c2e8db'], [
    { cx: 0.7, cy: 0.2, r: 0.7, c: '#4CAF8E', o: 0.22 },
    { cx: 0.2, cy: 0.8, r: 0.65, c: '#58B8FF', o: 0.16 },
  ]),
  'wallpaper-graphite': svg(2560, 1600, ['#141519', '#2c2e36'], [
    { cx: 0.8, cy: 0.8, r: 0.8, c: '#5E6AD2', o: 0.20 },
    { cx: 0.15, cy: 0.15, r: 0.6, c: '#8E9BA8', o: 0.12 },
  ]),
}

// ---- album covers 1000×1000 (matched to track moods) ----
const covers = {
  'cover-1': svg(1000, 1000, ['#FA2D55', '#7D2AE8'], [{ cx: 0.3, cy: 0.25, r: 0.6, c: '#FFC53D', o: 0.25 }]), // Neon Tide
  'cover-2': svg(1000, 1000, ['#F5A623', '#E0447C'], [{ cx: 0.7, cy: 0.3, r: 0.65, c: '#FFE08A', o: 0.35 }]), // Golden Hour
  'cover-3': svg(1000, 1000, ['#0A84FF', '#30D158'], [{ cx: 0.35, cy: 0.7, r: 0.6, c: '#64D2FF', o: 0.3 }]), // Blue Lane
  'cover-4': svg(1000, 1000, ['#5E5CE6', '#0A1A3C'], [{ cx: 0.65, cy: 0.25, r: 0.6, c: '#BF5AF2', o: 0.35 }]), // Midnight Drift
  'podcast-cover': svg(1000, 1000, ['#7D2AE8', '#2A0A4A'], [{ cx: 0.3, cy: 0.3, r: 0.6, c: '#BF5AF2', o: 0.3 }]),
}

// ---- photo samples 1600×1200 (4:3) ----
const photoPalettes = [
  ['#FFB3C7', '#C76B8F'], // rose
  ['#9AD8FF', '#3E7BC0'], // sky
  ['#BCE8D4', '#3B8A70'], // mint
  ['#FFE3A3', '#D9932B'], // amber
  ['#CDBDF5', '#6E4FC0'], // lavender
  ['#FFC9A8', '#D96C4F'], // coral
  ['#A8E6E0', '#2E8C85'], // teal
  ['#C4CBD8', '#4A5261'], // slate
]
const photos = Object.fromEntries(
  photoPalettes.map((p, i) => [`photo-${i + 1}`, svg(1600, 1200, p, [{ cx: 0.72, cy: 0.22, r: 0.6, c: '#ffffff', o: 0.22 }])]),
)

for (const [name, content] of Object.entries({ ...wallpapers, ...covers, ...photos })) {
  writeFileSync(`${name}.svg`, content)
}
console.log('generated', Object.keys({ ...wallpapers, ...covers, ...photos }).length, 'svg files')

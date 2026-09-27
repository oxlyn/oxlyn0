// One-shot: scope webtv/app/player.css under `.webtv-root` for embedding in
// the desktop app window (reads ../webtv, writes ../app/src/apps/webtv/webtv.css).
// - prefixes every selector with .webtv-root
// - drops the global html/body/* rules (the app root supplies them)
// - renames @keyframes spin -> webtv-spin (Tailwind also defines `spin`)
// - leaves @media/@keyframes machinery and keyframe steps untouched
// - appends window-context adaptations (no viewport units / position:fixed)
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(resolve(here, '../webtv/app/player.css'), 'utf8')

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '')

function transformSelector(prelude) {
  return prelude
    .split(/(\/\*[\s\S]*?\*\/)/g)
    .map((chunk) => {
      if (chunk.startsWith('/*')) return chunk
      return chunk
        .split(',')
        .map((part) => {
          const sel = part.replace(/\s+/g, ' ').trim()
          if (!sel) return ''
          if (/^(html|body|\*)$/i.test(sel)) return '' // dropped: app root supplies these
          return '.webtv-root ' + sel
        })
        .filter((s) => s !== '')
        .join(', ')
    })
    .join('')
    .trim()
}

const out = []
let buf = ''
let depth = 0
let keyframesCloseAt = -1 // depth the current @keyframes block closes at (-1 = not inside)
let skipping = 0 // >0 while discarding a dropped rule's body

for (let i = 0; i < src.length; i++) {
  const ch = src[i]
  if (skipping > 0) {
    if (ch === '{') skipping++
    else if (ch === '}') skipping--
    continue
  }
  if (ch === '{') {
    const prelude = buf.trim()
    buf = ''
    const bare = stripComments(prelude).trim()
    if (bare.startsWith('@keyframes')) {
      out.push(prelude.replace('@keyframes spin', '@keyframes webtv-spin') + ' {')
      keyframesCloseAt = depth // close when the keyframes block itself ends
      depth++
    } else if (keyframesCloseAt !== -1) {
      out.push(prelude + ' {') // keyframe step (from/to/%) — verbatim
      depth++
    } else if (bare.startsWith('@')) {
      out.push(prelude + ' {') // @media & friends — recurse, still prefix inner rules
      depth++
    } else {
      const sel = transformSelector(prelude)
      if (stripComments(sel).trim() === '') {
        out.push(sel) // keep any leading comments
        skipping = 1 // drop the whole rule block
      } else {
        out.push(sel + ' {')
        depth++
      }
    }
    continue
  }
  if (ch === '}') {
    out.push(buf.trimEnd()) // flush trailing declarations
    buf = ''
    depth--
    if (depth === keyframesCloseAt) keyframesCloseAt = -1
    out.push('}')
    continue
  }
  buf += ch
}
out.push(buf)

let css = out.join('')

// keyframe name references
css = css.replace(/animation:\s*spin\b/g, 'animation: webtv-spin')

// --- window-context adaptations (replaces viewport-dependent rules) ---
const adapt = `
/* ==== 桌面窗口适配（.webtv-root 为应用根，自身即布局容器） ==== */
.webtv-root {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #0c0c14;
  color: #eaeaea;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.webtv-root,
.webtv-root *,
.webtv-root *::before,
.webtv-root *::after { box-sizing: border-box; }
.webtv-root a { color: inherit; text-decoration: none; }
.webtv-root .app-header { position: static; flex-shrink: 0; }
.webtv-root .app-main { flex: 1; min-height: 0; height: 100%; }
.webtv-root .sidebar { position: static; top: auto; max-height: none; }
.webtv-root .search-page .search-sidebar { max-height: 480px; }
.webtv-root .parse-page { height: 100%; }
.webtv-root .live-page { height: 100%; min-height: 0; }
/* 网页全屏：铺满应用窗口而非浏览器视口 */
.webtv-root .player-section.browser-fullscreen { position: absolute; }
`

css += adapt

writeFileSync(resolve(here, '../app/src/apps/webtv/webtv.css'), css)
console.log('written', css.length, 'bytes')

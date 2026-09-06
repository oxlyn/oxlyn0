import { useEffect, useRef, useState } from 'react'
import { childrenOf, pathOf, useFs, type FsNode } from '@/system/stores/fs'
import { apps } from '@/system/registry'
import { useWindows } from '@/system/stores/windows'
import { wordsSeed } from '@/apps/dictionary/data'
import type { AppDefinition } from '@/system/types'
import { SquareTerminal } from 'lucide-react'

const CWD_MAP: Record<string, string> = {
  home: '~', desktop: 'Desktop', documents: 'Documents', downloads: 'Downloads',
  pictures: 'Pictures', music: 'Music', trash: '.trash',
}
const DIR_BY_NAME: Record<string, string> = {
  '~': 'home', Desktop: 'desktop', Documents: 'documents', Downloads: 'downloads',
  Pictures: 'pictures', Music: 'music', '.trash': 'trash',
}

const BANNER = `Last login: ${new Date().toLocaleString('en-US')} on ttys001
Type "help" for the command list.`

export function Terminal() {
  const nodes = useFs((s) => s.nodes)
  const [cwd, setCwd] = useState('home')
  const [lines, setLines] = useState<string[]>([BANNER])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const open = useWindows((s) => s.open)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [lines])

  const prompt = `oxlyn@macos27 ${CWD_MAP[cwd] ?? cwd} %`

  const run = (raw: string) => {
    const out: string[] = [`${prompt} ${raw}`]
    const [cmd, ...args] = raw.trim().split(/\s+/)
    const push = (...s: string[]) => out.push(...s)

    switch (cmd) {
      case '': break
      case 'help':
        push(
          'Commands:',
          '  ls               list directory contents',
          '  cd <dir>         change directory (~, .., Desktop, Documents…)',
          '  cat <file>       print file contents',
          '  pwd              print working directory',
          '  open <app>       launch an app (try: open notes)',
          '  apps             list installed apps',
          '  dict <word>      look up a word',
          '  neofetch         system info',
          '  echo · date · whoami · uname · clear',
        )
        break
      case 'ls': {
        const kids = childrenOf(nodes, cwd)
        push(kids.length ? kids.map((k) => (k.kind === 'folder' ? `${k.name}/` : k.name)).join('   ') : '')
        break
      }
      case 'pwd': {
        const p = pathOf(nodes, cwd).map((n) => n.name).join('/').replace(/^\/Users\/oxlyn/, '~')
        push(p)
        break
      }
      case 'cd': {
        const target = args[0] ?? '~'
        if (target === '..') {
          const parent = nodes[cwd]?.parentId
          if (parent && nodes[parent]) setCwd(parent === 'users' || parent === 'root' ? 'home' : parent)
        } else if (DIR_BY_NAME[target]) setCwd(DIR_BY_NAME[target])
        else {
          const kid = childrenOf(nodes, cwd).find((k) => k.kind === 'folder' && k.name.toLowerCase() === target.toLowerCase())
          if (kid) setCwd(kid.id)
          else push(`cd: no such file or directory: ${target}`)
        }
        break
      }
      case 'cat': {
        const kid = childrenOf(nodes, cwd).find((k) => k.name.toLowerCase() === (args[0] ?? '').toLowerCase())
        if (!kid) push(`cat: ${args[0] ?? ''}: No such file or directory`)
        else if (kid.kind === 'folder') push(`cat: ${kid.name}: Is a directory`)
        else if (!kid.content) push(`cat: ${kid.name}: binary file`)
        else push(...kid.content.split('\n'))
        break
      }
      case 'open': {
        const app = apps.find((a) => a.id === args[0] || a.name.toLowerCase() === (args[0] ?? '').toLowerCase())
        if (app) { open(app.id); push(`Launching ${app.name}…`) }
        else push(`open: app not found: ${args[0] ?? ''} (try "apps")`)
        break
      }
      case 'apps':
        push(apps.map((a) => `  ${a.id.padEnd(16)} ${a.name}`).sort().join('\n'))
        break
      case 'dict': {
        const w = (args[0] ?? '').toLowerCase()
        const hit = wordsSeed.find((x) => x.w.toLowerCase() === w)
        push(hit ? `${hit.w} ${hit.ph} — ${hit.pos}\n  ${hit.def}\n  e.g. "${hit.ex}"` : `dict: no entry for "${w}"`)
        break
      }
      case 'echo': push(args.join(' ')); break
      case 'date': push(new Date().toString()); break
      case 'whoami': push('oxlyn'); break
      case 'uname': push('Darwin macos27 27.0.0 arm64'); break
      case 'neofetch':
        push(
          '                    \'c.\'          oxlyn@macos27',
          '                 ,xNMM.          ----------------',
          '               .OMMMMo           OS: macOS 27 Golden Gate (web)',
          '               lMM"              Shell: react-zsh',
          '     .;loddo:.  .olloddol;.      WM: zustand',
          '   cKMMMMMMMMMMNWMMMMMMMMMM0:    Apps: self-registering (src/apps/)',
          ' .KMMMMMMMMMMMMMMMMMMMMMMMWd.',
          ' XMMMMMMMMMMMMMMMMMMMMMMMX.      Resume: this desktop',
          ';MMMMMMMMMMMMMMMMMMMMMMMM:',
          ':MMMMMMMMMMMMMMMMMMMMMMMM:',
          '.MMMMMMMMMMMMMMMMMMMMMMMMX.',
          ' kMMMMMMMMMMMMMMMMMMMMMMMMWd.',
          ' \'XMMMMMMMMMMMMMMMMMMMMMMMMMMk',
          '  \'XMMMMMMMMMMMMMMMMMMMMMMMMK.',
          '    kMMMMMMMMMMMMMMMMMMMMMMd',
          '     ;KMMMMMMMWXXWMMMMMMMk.',
          '       "cooc*"    "*coo\'"',
        )
        break
      case 'sudo': push('oxlyn is not in the sudoers file. This incident will be reported.'); break
      case 'clear': setLines([]); return
      default:
        push(`zsh: command not found: ${cmd}`)
    }
    setLines((l) => [...l, ...out])
  }

  const submit = () => {
    const raw = input
    setLines((l) => [...l, `${prompt} ${raw}`])
    if (raw.trim()) {
      setHistory((h) => [raw, ...h])
      setHistIdx(-1)
      run(raw)
    }
    setInput('')
  }

  return (
    <div
      className="h-full overflow-y-auto bg-[#141416]/97 p-3 font-mono text-[12.5px] leading-relaxed text-[#e8e8e8] select-text"
      ref={scrollRef}
      onClick={() => inputRef.current?.focus()}
    >
      {lines.map((l, i) => (
        <div key={i} className="whitespace-pre-wrap">{l}</div>
      ))}
      <div className="flex">
        <span className="shrink-0 whitespace-pre text-emerald-400">{prompt} </span>
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
            if (e.key === 'ArrowUp') {
              e.preventDefault()
              const i = Math.min(histIdx + 1, history.length - 1)
              if (history[i] !== undefined) { setHistIdx(i); setInput(history[i]) }
            }
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              const i = histIdx - 1
              setHistIdx(i)
              setInput(i >= 0 ? history[i] ?? '' : '')
            }
          }}
          className="w-full bg-transparent caret-emerald-400 outline-none"
          spellCheck={false}
        />
      </div>
    </div>
  )
}

export default {
  id: 'terminal',
  name: 'Terminal',
  icon: { from: '#3A3A3C', to: '#000000', Icon: SquareTerminal },
  component: Terminal,
  defaultSize: { w: 780, h: 520 },
  minSize: { w: 480, h: 320 },
  category: 'Utilities',
  keywords: ['shell', 'console', 'command'],
} satisfies AppDefinition

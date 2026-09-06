import { create } from 'zustand'
import { NOTES_SEED } from '../notes-seed'

export type NoteFolder = 'notes' | 'personal' | 'travel'

export const NOTE_FOLDERS: { id: NoteFolder; name: string; account: string }[] = [
  { id: 'notes', name: 'Notes', account: 'iCloud' },
  { id: 'personal', name: 'Personal', account: 'iCloud' },
  { id: 'travel', name: 'Travel', account: 'On My Mac' },
]

export interface Note {
  id: string
  folder: NoteFolder
  html: string
  tags: string[]
  pinned?: boolean
  deleted?: boolean
  created: number
  modified: number
}

interface NotesState {
  notes: Note[]
  create: (folder: NoteFolder) => string
  setHtml: (id: string, html: string) => void
  togglePin: (id: string) => void
  toggleTag: (id: string, tag: string) => void
  moveToFolder: (id: string, folder: NoteFolder) => void
  softDelete: (id: string) => void
  restore: (id: string) => void
  purge: (id: string) => void
}

let seq = 0
export const noteTitle = (n: Note) => {
  const d = document.createElement('div')
  d.innerHTML = n.html
  return (d.querySelector('h1,h2,h3,div,p,li')?.textContent ?? 'New Note').trim() || 'New Note'
}
export const notePreview = (n: Note) => {
  const d = document.createElement('div')
  d.innerHTML = n.html
  return (d.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 90)
}

export const useNotes = create<NotesState>((set) => ({
  notes: NOTES_SEED(),
  create: (folder) => {
    const id = `note-${Date.now().toString(36)}-${++seq}`
    const now = Date.now()
    set((s) => ({
      notes: [{ id, folder, html: '<h1></h1>', tags: [], created: now, modified: now }, ...s.notes],
    }))
    return id
  },
  setHtml: (id, html) =>
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, html, modified: Date.now() } : n)) })),
  togglePin: (id) =>
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)) })),
  toggleTag: (id, tag) =>
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === id ? { ...n, tags: n.tags.includes(tag) ? n.tags.filter((t) => t !== tag) : [...n.tags, tag] } : n,
      ),
    })),
  moveToFolder: (id, folder) =>
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, folder, modified: Date.now() } : n)) })),
  softDelete: (id) => set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, deleted: true } : n)) })),
  restore: (id) => set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, deleted: false } : n)) })),
  purge: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
}))

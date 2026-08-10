"use client"

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"
import {
  cleanHandle,
  cleanupList,
  generateUsernames,
  parseWords,
  scoreUsername,
  type GeneratorOptions,
} from "@/lib/username"
import { simulateCheck, type CheckStatus } from "@/lib/checker"
import type { ResultRow } from "@/lib/export"

export type Settings = Omit<GeneratorOptions, "customWords"> & { customText: string }

export type StatusFilter = "all" | CheckStatus | "pending"
export type SortKey = "score-desc" | "score-asc" | "az" | "za" | "recent"
export type ResultView = "table" | "cards"

const defaultSettings: Settings = {
  theme: "modern",
  amount: 60,
  minLength: 4,
  maxLength: 16,
  useNumbers: false,
  randomCase: false,
  avoidDuplicates: true,
  prefix: "",
  suffix: "",
  separator: "",
  include: "",
  exclude: "",
  customText: "",
}

type Notice = { id: number; text: string; tone: "info" | "success" | "error" }

type StudioValue = {
  settings: Settings
  updateSettings: (patch: Partial<Settings>) => void
  resetSettings: () => void

  generated: string[]
  generatedSkipped: number
  generate: () => void

  queue: string[]
  addGeneratedToQueue: () => void
  importText: (text: string) => void
  clearQueue: () => void
  dedupeQueue: () => void

  // queue selection
  selected: Set<string>
  toggleSelect: (handle: string) => void
  selectAll: () => void
  clearSelection: () => void
  removeSelected: () => void
  removeFromQueue: (handle: string) => void

  // checker
  running: boolean
  progress: { done: number; total: number }
  startCheck: () => void
  stopCheck: () => void

  // results
  results: ResultRow[]
  toggleFavorite: (id: string) => void
  clearResults: () => void

  // results view/filter/sort
  view: ResultView
  setView: (v: ResultView) => void
  statusFilter: StatusFilter
  setStatusFilter: (s: StatusFilter) => void
  favoritesOnly: boolean
  setFavoritesOnly: (b: boolean) => void
  search: string
  setSearch: (s: string) => void
  sort: SortKey
  setSort: (s: SortKey) => void
  filteredResults: ResultRow[]

  stats: { ready: number; checked: number; taken: number; available: number; unknown: number; favorites: number }

  notices: Notice[]
  notify: (text: string, tone?: Notice["tone"]) => void
  dismissNotice: (id: number) => void
}

const StudioContext = createContext<StudioValue | null>(null)

let idCounter = 0
const nextId = () => `${Date.now().toString(36)}-${(idCounter++).toString(36)}`

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [generated, setGenerated] = useState<string[]>([])
  const [generatedSkipped, setGeneratedSkipped] = useState(0)
  const [queue, setQueue] = useState<string[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [results, setResults] = useState<ResultRow[]>([])
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const stopRef = useRef(false)

  const [view, setView] = useState<ResultView>("table")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortKey>("score-desc")

  const [notices, setNotices] = useState<Notice[]>([])

  const notify = useCallback((text: string, tone: Notice["tone"] = "info") => {
    const id = Date.now() + Math.random()
    setNotices((n) => [...n, { id, text, tone }])
    setTimeout(() => setNotices((n) => n.filter((x) => x.id !== id)), 3200)
  }, [])

  const dismissNotice = useCallback((id: number) => {
    setNotices((n) => n.filter((x) => x.id !== id))
  }, [])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }))
  }, [])

  const resetSettings = useCallback(() => setSettings(defaultSettings), [])

  const generate = useCallback(() => {
    const customWords = parseWords(settings.customText)
    if (settings.theme === "custom" && customWords.length === 0) {
      notify("Add at least one of your own words first.", "error")
      return
    }
    const { usernames, skippedInvalid } = generateUsernames({ ...settings, customWords })
    setGenerated(usernames)
    setGeneratedSkipped(skippedInvalid)
    if (usernames.length === 0) {
      notify("No handles matched those rules. Try loosening them.", "error")
    } else {
      notify(`Generated ${usernames.length} handles.`, "success")
    }
  }, [settings, notify])

  const mergeUnique = (base: string[], extra: string[]) => {
    const seen = new Set(base.map((x) => x.toLowerCase()))
    const out = [...base]
    for (const e of extra) {
      const k = e.toLowerCase()
      if (!seen.has(k)) {
        seen.add(k)
        out.push(e)
      }
    }
    return out
  }

  const addGeneratedToQueue = useCallback(() => {
    if (generated.length === 0) {
      notify("Generate some handles first.", "error")
      return
    }
    setQueue((q) => mergeUnique(q, generated))
    notify(`Added ${generated.length} handles to the queue.`, "success")
  }, [generated, notify])

  const importText = useCallback(
    (text: string) => {
      const raw = parseWords(text)
      const { cleaned, removedDuplicates, removedInvalid } = cleanupList(raw)
      if (cleaned.length === 0) {
        notify("No valid Instagram handles found in that text.", "error")
        return
      }
      setQueue((q) => mergeUnique(q, cleaned))
      const bits = [`Imported ${cleaned.length}`]
      if (removedInvalid) bits.push(`${removedInvalid} invalid skipped`)
      if (removedDuplicates) bits.push(`${removedDuplicates} dupes skipped`)
      notify(bits.join(" · "), "success")
    },
    [notify],
  )

  const clearQueue = useCallback(() => {
    setQueue([])
    setSelected(new Set())
    notify("Queue cleared.")
  }, [notify])

  const dedupeQueue = useCallback(() => {
    setQueue((q) => {
      const before = q.length
      const { cleaned, removedDuplicates, removedInvalid } = cleanupList(q)
      const removed = before - cleaned.length
      if (removed === 0) notify("Queue is already clean.", "info")
      else notify(`Removed ${removedInvalid} invalid & ${removedDuplicates} duplicate handles.`, "success")
      return cleaned
    })
    setSelected(new Set())
  }, [notify])

  const toggleSelect = useCallback((handle: string) => {
    setSelected((s) => {
      const n = new Set(s)
      if (n.has(handle)) n.delete(handle)
      else n.add(handle)
      return n
    })
  }, [])

  const selectAll = useCallback(() => setSelected(new Set(queue)), [queue])
  const clearSelection = useCallback(() => setSelected(new Set()), [])

  const removeSelected = useCallback(() => {
    if (selected.size === 0) return
    setQueue((q) => q.filter((h) => !selected.has(h)))
    notify(`Removed ${selected.size} handles from queue.`, "success")
    setSelected(new Set())
  }, [selected, notify])

  const removeFromQueue = useCallback((handle: string) => {
    setQueue((q) => q.filter((h) => h !== handle))
    setSelected((s) => {
      if (!s.has(handle)) return s
      const n = new Set(s)
      n.delete(handle)
      return n
    })
  }, [])

  const stopCheck = useCallback(() => {
    stopRef.current = true
    setRunning(false)
  }, [])

  const startCheck = useCallback(async () => {
    if (running) return
    const targets = selected.size > 0 ? queue.filter((h) => selected.has(h)) : queue
    if (targets.length === 0) {
      notify("Your queue is empty. Add some handles first.", "error")
      return
    }

    // Build/refresh result rows for the targets.
    setResults((prev) => {
      const byHandle = new Map(prev.map((r) => [r.handle.toLowerCase(), r]))
      const rows: ResultRow[] = [...prev]
      for (const h of targets) {
        const key = h.toLowerCase()
        if (!byHandle.has(key)) {
          const row: ResultRow = {
            id: nextId(),
            handle: h,
            status: "pending",
            message: "Waiting...",
            score: scoreUsername(cleanHandle(h)).score,
            favorite: false,
            checkedAt: null,
          }
          byHandle.set(key, row)
          rows.push(row)
        }
      }
      return rows
    })

    stopRef.current = false
    setRunning(true)
    setProgress({ done: 0, total: targets.length })

    for (let i = 0; i < targets.length; i++) {
      if (stopRef.current) break
      const handle = targets[i]
      // simulate network latency
      await new Promise((res) => setTimeout(res, 90 + Math.random() * 160))
      const outcome = simulateCheck(handle)
      setResults((prev) =>
        prev.map((r) =>
          r.handle.toLowerCase() === handle.toLowerCase()
            ? { ...r, status: outcome.status, message: outcome.message, checkedAt: Date.now() }
            : r,
        ),
      )
      setProgress({ done: i + 1, total: targets.length })
    }

    setRunning(false)
    if (!stopRef.current) notify("Demo check complete.", "success")
  }, [running, queue, selected, notify])

  const toggleFavorite = useCallback((id: string) => {
    setResults((prev) => prev.map((r) => (r.id === id ? { ...r, favorite: !r.favorite } : r)))
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    notify("Results cleared.")
  }, [notify])

  const filteredResults = useMemo(() => {
    let rows = results
    if (statusFilter !== "all") rows = rows.filter((r) => r.status === statusFilter)
    if (favoritesOnly) rows = rows.filter((r) => r.favorite)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter((r) => r.handle.toLowerCase().includes(q))
    }
    const sorted = [...rows]
    switch (sort) {
      case "score-desc":
        sorted.sort((a, b) => b.score - a.score)
        break
      case "score-asc":
        sorted.sort((a, b) => a.score - b.score)
        break
      case "az":
        sorted.sort((a, b) => a.handle.localeCompare(b.handle))
        break
      case "za":
        sorted.sort((a, b) => b.handle.localeCompare(a.handle))
        break
      case "recent":
        sorted.sort((a, b) => (b.checkedAt ?? 0) - (a.checkedAt ?? 0))
        break
    }
    return sorted
  }, [results, statusFilter, favoritesOnly, search, sort])

  const stats = useMemo(() => {
    const checked = results.filter((r) => r.status !== "pending").length
    return {
      ready: queue.length,
      checked,
      taken: results.filter((r) => r.status === "taken").length,
      available: results.filter((r) => r.status === "available").length,
      unknown: results.filter((r) => r.status === "unknown").length,
      favorites: results.filter((r) => r.favorite).length,
    }
  }, [results, queue])

  const value: StudioValue = {
    settings,
    updateSettings,
    resetSettings,
    generated,
    generatedSkipped,
    generate,
    queue,
    addGeneratedToQueue,
    importText,
    clearQueue,
    dedupeQueue,
    selected,
    toggleSelect,
    selectAll,
    clearSelection,
    removeSelected,
    removeFromQueue,
    running,
    progress,
    startCheck,
    stopCheck,
    results,
    toggleFavorite,
    clearResults,
    view,
    setView,
    statusFilter,
    setStatusFilter,
    favoritesOnly,
    setFavoritesOnly,
    search,
    setSearch,
    sort,
    setSort,
    filteredResults,
    stats,
    notices,
    notify,
    dismissNotice,
  }

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
}

export function useStudio() {
  const ctx = useContext(StudioContext)
  if (!ctx) throw new Error("useStudio must be used within StudioProvider")
  return ctx
}

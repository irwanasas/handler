"use client"

import { FileText, FileSpreadsheet, Star, Table2, LayoutGrid, Search, Trash2 } from "lucide-react"
import { useStudio, type StatusFilter, type SortKey } from "./studio-context"
import { EmptyState, ScorePill, SectionCard, SelectInput, StatusBadge, TextInput } from "./ui"
import { exportCsv, exportTxt } from "@/lib/export"
import { cn } from "@/lib/utils"

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "taken", label: "Taken" },
  { value: "unknown", label: "Unclear" },
  { value: "pending", label: "Pending" },
]

const SORTS: { value: SortKey; label: string }[] = [
  { value: "score-desc", label: "Score: high → low" },
  { value: "score-asc", label: "Score: low → high" },
  { value: "az", label: "Name: A → Z" },
  { value: "za", label: "Name: Z → A" },
  { value: "recent", label: "Recently checked" },
]

function timeLabel(ts: number | null) {
  if (!ts) return "—"
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

export function ResultsCard() {
  const {
    filteredResults,
    results,
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
    toggleFavorite,
    clearResults,
    notify,
  } = useStudio()

  const doExport = (fn: () => void) => {
    if (filteredResults.length === 0) return notify("Nothing to export with the current filters.", "error")
    fn()
  }

  return (
    <SectionCard
      icon={<FileText />}
      title="Results"
      subtitle="Everything you've checked, scored and shortlisted."
      action={
        <div className="flex items-center gap-1 rounded-full border border-border bg-muted/50 p-1">
          <button
            type="button"
            onClick={() => setView("table")}
            aria-label="Table view"
            className={cn(
              "grid size-8 place-items-center rounded-full transition-colors",
              view === "table" ? "bg-card text-brand shadow-sm" : "text-muted-foreground",
            )}
          >
            <Table2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setView("cards")}
            aria-label="Card view"
            className={cn(
              "grid size-8 place-items-center rounded-full transition-colors",
              view === "cards" ? "bg-card text-brand shadow-sm" : "text-muted-foreground",
            )}
          >
            <LayoutGrid className="size-4" />
          </button>
        </div>
      }
    >
      {/* Controls */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search handles..."
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  statusFilter === f.value
                    ? "bg-brand text-brand-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            aria-pressed={favoritesOnly}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              favoritesOnly ? "bg-accent2 text-white" : "bg-muted text-muted-foreground hover:bg-accent",
            )}
          >
            <Star className={cn("size-3.5", favoritesOnly && "fill-current")} />
            Shortlist
          </button>

          <div className="ml-auto w-full sm:w-48">
            <SelectInput value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </SelectInput>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => doExport(() => exportTxt(filteredResults))}
            className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3.5 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/70"
          >
            <FileText className="size-4" />
            Export TXT
          </button>
          <button
            type="button"
            onClick={() => doExport(() => exportCsv(filteredResults))}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
          >
            <FileSpreadsheet className="size-4" />
            Export CSV
          </button>
          {results.length > 0 ? (
            <button
              type="button"
              onClick={clearResults}
              className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-danger-soft px-3.5 py-2 text-sm font-semibold text-danger transition-colors hover:bg-danger-soft/70"
            >
              <Trash2 className="size-4" />
              Clear
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        {filteredResults.length === 0 ? (
          <EmptyState>
            {results.length === 0
              ? "Nothing checked yet. Run the demo checker to see results here."
              : "No results match your filters."}
          </EmptyState>
        ) : view === "table" ? (
          <div className="soft-scroll overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-3 font-bold">Handle</th>
                  <th className="px-3 py-3 font-bold">Score</th>
                  <th className="px-3 py-3 font-bold">Result</th>
                  <th className="px-3 py-3 font-bold">Time</th>
                  <th className="px-3 py-3 text-right font-bold">Fav</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-3 py-3 font-mono">{r.handle}</td>
                    <td className="px-3 py-3">
                      <ScorePill score={r.score} />
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-3 py-3 tabular-nums text-muted-foreground">{timeLabel(r.checkedAt)}</td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleFavorite(r.id)}
                        aria-label={r.favorite ? "Remove from shortlist" : "Add to shortlist"}
                        className={cn(
                          "inline-grid size-8 place-items-center rounded-full transition-colors",
                          r.favorite ? "text-accent2" : "text-muted-foreground hover:text-accent2",
                        )}
                      >
                        <Star className={cn("size-4", r.favorite && "fill-current")} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResults.map((r) => (
              <div key={r.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-background/60 p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-sm break-all">{r.handle}</span>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(r.id)}
                    aria-label={r.favorite ? "Remove from shortlist" : "Add to shortlist"}
                    className={cn(
                      "shrink-0 transition-colors",
                      r.favorite ? "text-accent2" : "text-muted-foreground hover:text-accent2",
                    )}
                  >
                    <Star className={cn("size-4", r.favorite && "fill-current")} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.status} />
                  <ScorePill score={r.score} />
                </div>
                <p className="text-xs text-muted-foreground">{r.message}</p>
                <p className="text-[11px] text-muted-foreground/70">{timeLabel(r.checkedAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  )
}

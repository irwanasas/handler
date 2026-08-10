"use client"

import { ListChecks, Plus, Save, Trash2, Sparkles, CheckCheck, X, Eraser } from "lucide-react"
import { useStudio } from "./studio-context"
import { ScorePill, SectionCard } from "./ui"
import { exportSimpleTxt } from "@/lib/export"
import { cn } from "@/lib/utils"

function ActionButton({
  onClick,
  children,
  tone = "secondary",
  disabled,
}: {
  onClick: () => void
  children: React.ReactNode
  tone?: "primary" | "secondary" | "success" | "danger"
  disabled?: boolean
}) {
  const tones = {
    primary: "bg-brand text-brand-foreground hover:bg-brand/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
    success: "bg-success text-white hover:bg-success/90",
    danger: "bg-danger-soft text-danger hover:bg-danger-soft/70",
  }[tone]
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        tones,
      )}
    >
      {children}
    </button>
  )
}

export function QueueCard() {
  const {
    queue,
    selected,
    toggleSelect,
    selectAll,
    clearSelection,
    removeSelected,
    addGeneratedToQueue,
    clearQueue,
    dedupeQueue,
    notify,
  } = useStudio()

  const selCount = selected.size

  return (
    <SectionCard
      icon={<ListChecks />}
      title="Your queue"
      subtitle="Everything lined up and ready for the demo checker."
    >
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-brand/20 bg-brand-soft/50 px-5 py-4">
        <div>
          <div className="text-3xl font-black text-brand tabular-nums">{queue.length}</div>
          <div className="text-xs font-medium text-muted-foreground">handles ready</div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          {selCount > 0 ? (
            <span className="font-semibold text-brand">{selCount} selected</span>
          ) : (
            "Tap a handle to select it"
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton tone="success" onClick={addGeneratedToQueue}>
          <Sparkles className="size-4" />
          Add generated
        </ActionButton>
        <ActionButton onClick={dedupeQueue} disabled={queue.length === 0}>
          <Eraser className="size-4" />
          Clean up
        </ActionButton>
        <ActionButton
          onClick={() => {
            if (queue.length === 0) return notify("Queue is empty.", "error")
            exportSimpleTxt(queue)
          }}
          disabled={queue.length === 0}
        >
          <Save className="size-4" />
          Save list
        </ActionButton>
        <ActionButton tone="danger" onClick={clearQueue} disabled={queue.length === 0}>
          <Trash2 className="size-4" />
          Clear
        </ActionButton>
      </div>

      {/* Multi-select toolbar */}
      {queue.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-muted/40 px-3 py-2 text-sm">
          <span className="text-xs font-medium text-muted-foreground">Bulk actions:</span>
          <button
            type="button"
            onClick={selectAll}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-brand hover:bg-brand-soft"
          >
            <CheckCheck className="size-3.5" /> Select all
          </button>
          <button
            type="button"
            onClick={clearSelection}
            disabled={selCount === 0}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-muted-foreground hover:bg-muted disabled:opacity-40"
          >
            <X className="size-3.5" /> Clear
          </button>
          <button
            type="button"
            onClick={() => exportSimpleTxt(queue.filter((h) => selected.has(h)), "selected")}
            disabled={selCount === 0}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-foreground hover:bg-muted disabled:opacity-40"
          >
            <Save className="size-3.5" /> Save selected
          </button>
          <button
            type="button"
            onClick={removeSelected}
            disabled={selCount === 0}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-danger hover:bg-danger-soft disabled:opacity-40"
          >
            <Trash2 className="size-3.5" /> Remove selected
          </button>
        </div>
      ) : null}

      <div className="mt-4">
        {queue.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-8 text-center text-sm text-muted-foreground">
            Your queue is empty. Generate ideas or import a list to get started.
          </div>
        ) : (
          <div className="soft-scroll flex max-h-72 flex-wrap gap-2 overflow-y-auto rounded-2xl border border-border bg-background/60 p-3">
            {queue.map((h) => {
              const active = selected.has(h)
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => toggleSelect(h)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs transition-colors",
                    active
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-border bg-card hover:border-brand/40",
                  )}
                >
                  {h}
                  <ScorePill handle={h.toLowerCase()} />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </SectionCard>
  )
}

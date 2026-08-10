"use client"

import { Radar, Play, Square, Info } from "lucide-react"
import { useStudio } from "./studio-context"
import { SectionCard } from "./ui"

export function CheckerCard() {
  const { running, progress, startCheck, stopCheck, queue, selected } = useStudio()
  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0
  const targetCount = selected.size > 0 ? selected.size : queue.length

  return (
    <SectionCard
      icon={<Radar />}
      title="Demo checker"
      subtitle="A simulated, offline availability check — great for exploring the flow."
    >
      <div className="flex items-start gap-2.5 rounded-2xl border border-warn/30 bg-warn-soft/60 px-4 py-3 text-sm text-warn">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p className="text-pretty">
          <b>Simulation only.</b> This does not contact Instagram or any real service. Results are randomly
          generated so you can safely test the workflow.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={startCheck}
          disabled={running || targetCount === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play className="size-4" />
          {selected.size > 0 ? `Check ${selected.size} selected` : "Check all queued"}
        </button>
        <button
          type="button"
          onClick={stopCheck}
          disabled={!running}
          className="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground transition-colors hover:bg-secondary/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Square className="size-4" />
          Stop
        </button>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {running
              ? `Checking ${progress.done} of ${progress.total}...`
              : progress.total > 0
                ? `Done — checked ${progress.done} of ${progress.total}`
                : targetCount > 0
                  ? `${targetCount} handles ready to check`
                  : "Add handles to your queue first"}
          </span>
          <span className="font-semibold tabular-nums">{pct}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-accent2 transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </SectionCard>
  )
}

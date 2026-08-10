"use client"

import { useStudio } from "./studio-context"
import { cn } from "@/lib/utils"

export function StatsRow() {
  const { stats } = useStudio()

  const items = [
    { label: "Ready", value: stats.ready, cls: "text-brand", bg: "bg-brand-soft/60 border-brand/20" },
    { label: "Checked", value: stats.checked, cls: "text-chart-5", bg: "bg-accent/60 border-border" },
    { label: "Available", value: stats.available, cls: "text-success", bg: "bg-success-soft/60 border-success/20" },
    { label: "Taken", value: stats.taken, cls: "text-danger", bg: "bg-danger-soft/60 border-danger/20" },
    { label: "Unclear", value: stats.unknown, cls: "text-warn", bg: "bg-warn-soft/60 border-warn/20" },
    { label: "Favorites", value: stats.favorites, cls: "text-accent2", bg: "bg-accent2-soft/60 border-accent2/20" },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((it) => (
        <div key={it.label} className={cn("rounded-2xl border p-4", it.bg)}>
          <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{it.label}</div>
          <div className={cn("mt-1 text-2xl font-black tabular-nums", it.cls)}>{it.value}</div>
        </div>
      ))}
    </div>
  )
}

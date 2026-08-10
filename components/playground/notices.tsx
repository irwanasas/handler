"use client"

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"
import { useStudio } from "./studio-context"
import { cn } from "@/lib/utils"

export function Notices() {
  const { notices, dismissNotice } = useStudio()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:right-4 sm:left-auto sm:items-end">
      {notices.map((n) => {
        const Icon = n.tone === "success" ? CheckCircle2 : n.tone === "error" ? AlertCircle : Info
        const tone =
          n.tone === "success"
            ? "border-success/30 text-success"
            : n.tone === "error"
              ? "border-danger/30 text-danger"
              : "border-border text-foreground"
        return (
          <div
            key={n.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-2xl border bg-card px-4 py-3 text-sm font-medium shadow-lg",
              tone,
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="flex-1 text-foreground">{n.text}</span>
            <button
              type="button"
              onClick={() => dismissNotice(n.id)}
              aria-label="Dismiss"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

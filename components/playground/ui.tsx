"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { scoreUsername, type ScoreTier } from "@/lib/username"
import type { CheckStatus } from "@/lib/checker"

export function SectionCard({
  icon,
  title,
  subtitle,
  action,
  children,
  className,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6",
        className,
      )}
    >
      <div className="mb-5 flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand [&_svg]:size-5">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold tracking-tight text-balance">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground text-pretty">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  )
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string
  hint?: string
  htmlFor?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-foreground/80">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

const controlBase =
  "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(controlBase, props.className)} />
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(controlBase, "min-h-28 resize-y leading-relaxed", props.className)} />
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(controlBase, "appearance-none bg-[length:1rem] pr-9", props.className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239a90a8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.85rem center",
      }}
    />
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-all",
        checked ? "border-brand/40 bg-brand-soft/60" : "border-input bg-background hover:border-brand/30",
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span> : null}
      </span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-brand" : "bg-muted-foreground/30",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-5",
          )}
        />
      </span>
    </button>
  )
}

export function ScorePill({ handle, score }: { handle?: string; score?: number }) {
  const s = typeof score === "number" ? score : handle ? scoreUsername(handle).score : 0
  const tier: ScoreTier = s >= 85 ? "excellent" : s >= 70 ? "good" : s >= 50 ? "fair" : "weak"
  const styles: Record<ScoreTier, string> = {
    excellent: "bg-success-soft text-success",
    good: "bg-brand-soft text-brand",
    fair: "bg-warn-soft text-warn",
    weak: "bg-danger-soft text-danger",
  }
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums", styles[tier])}
      title={`Quality score: ${s}/100`}
    >
      {s}
    </span>
  )
}

export function StatusBadge({ status }: { status: CheckStatus | "pending" }) {
  const map: Record<CheckStatus | "pending", { label: string; cls: string }> = {
    taken: { label: "Taken", cls: "bg-danger-soft text-danger" },
    available: { label: "Available", cls: "bg-success-soft text-success" },
    unknown: { label: "Unclear", cls: "bg-warn-soft text-warn" },
    pending: { label: "Pending", cls: "bg-muted text-muted-foreground" },
  }
  const m = map[status]
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold", m.cls)}>
      <span className="size-1.5 rounded-full bg-current" />
      {m.label}
    </span>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center text-sm text-muted-foreground">
      {children}
    </div>
  )
}

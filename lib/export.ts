import type { CheckStatus } from "@/lib/checker"

export type ResultRow = {
  id: string
  handle: string
  status: CheckStatus | "pending"
  message: string
  score: number
  favorite: boolean
  checkedAt: number | null
}

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function stamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
}

export function exportTxt(rows: ResultRow[], name = "handles") {
  const lines = rows.map((r) => {
    const time = r.checkedAt ? new Date(r.checkedAt).toISOString() : ""
    return `${r.handle}\tscore=${r.score}\tstatus=${r.status}\t${time}`
  })
  triggerDownload(lines.join("\n"), `${name}-${stamp()}.txt`, "text/plain")
}

export function exportSimpleTxt(handles: string[], name = "queue") {
  triggerDownload(handles.join("\n"), `${name}-${stamp()}.txt`, "text/plain")
}

function csvEscape(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`
  return v
}

export function exportCsv(rows: ResultRow[], name = "handles") {
  const header = ["username", "status", "score", "favorite", "checked_at", "message"]
  const body = rows.map((r) =>
    [
      csvEscape(r.handle),
      r.status,
      String(r.score),
      r.favorite ? "yes" : "no",
      r.checkedAt ? new Date(r.checkedAt).toISOString() : "",
      csvEscape(r.message),
    ].join(","),
  )
  triggerDownload([header.join(","), ...body].join("\n"), `${name}-${stamp()}.csv`, "text/csv")
}

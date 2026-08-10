"use client"

import { useRef, useState } from "react"
import { ClipboardList, Upload, Plus } from "lucide-react"
import { useStudio } from "./studio-context"
import { Field, SectionCard, TextArea } from "./ui"
import { cn } from "@/lib/utils"

export function ImportCard() {
  const { importText, notify } = useStudio()
  const [manual, setManual] = useState("")
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function readFile(file: File | undefined) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      importText(String(reader.result ?? ""))
    }
    reader.onerror = () => notify("Couldn't read that file.", "error")
    reader.readAsText(file)
  }

  return (
    <SectionCard
      icon={<ClipboardList />}
      title="Import a list"
      subtitle="Already have handles? Drop a TXT/CSV file or paste them in."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            readFile(e.dataTransfer.files?.[0])
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
            dragging ? "border-brand bg-brand-soft/60" : "border-border bg-background/60 hover:border-brand/50",
          )}
        >
          <div className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
            <Upload className="size-6" />
          </div>
          <strong className="text-sm">Drop a TXT or CSV file</strong>
          <span className="text-xs text-muted-foreground">One handle per line — @ optional</span>
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.csv,text/plain,text/csv"
            className="hidden"
            onChange={(e) => {
              readFile(e.target.files?.[0])
              e.target.value = ""
            }}
          />
        </div>

        <Field label="Or paste them here">
          <TextArea
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder={"@username1\nusername2\nusername3"}
          />
          <button
            type="button"
            onClick={() => {
              importText(manual)
              setManual("")
            }}
            className="mt-1 inline-flex items-center justify-center gap-1.5 self-start rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/70"
          >
            <Plus className="size-4" />
            Add to queue
          </button>
        </Field>
      </div>

      <p className="mt-4 rounded-xl bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
        We clean everything the Instagram way — lowercase, strip <b>@</b> and spaces, allow only letters, numbers,
        dots and underscores, and skip anything invalid or duplicated.
      </p>
    </SectionCard>
  )
}

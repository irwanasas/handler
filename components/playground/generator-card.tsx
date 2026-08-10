"use client"

import { Sparkles, Wand2, ChevronDown } from "lucide-react"
import { useState } from "react"
import { useStudio } from "./studio-context"
import { Field, SectionCard, SelectInput, TextArea, TextInput, Toggle, ScorePill } from "./ui"
import { THEME_LABELS, IG_MIN, IG_MAX } from "@/lib/username"

export function GeneratorCard() {
  const { settings, updateSettings, generate, generated, generatedSkipped } = useStudio()
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <SectionCard
      icon={<Wand2 />}
      title="Generate handles"
      subtitle="Pick a vibe and rules — we'll craft valid Instagram usernames."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Vibe" htmlFor="theme">
          <SelectInput
            id="theme"
            value={settings.theme}
            onChange={(e) => updateSettings({ theme: e.target.value })}
          >
            {THEME_LABELS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field label="How many" htmlFor="amount">
          <TextInput
            id="amount"
            type="number"
            min={1}
            max={10000}
            value={settings.amount}
            onChange={(e) => updateSettings({ amount: Number(e.target.value) })}
          />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Shortest" hint={`${IG_MIN}–${IG_MAX} characters`} htmlFor="minLength">
          <TextInput
            id="minLength"
            type="number"
            min={IG_MIN}
            max={IG_MAX}
            value={settings.minLength}
            onChange={(e) => updateSettings({ minLength: Number(e.target.value) })}
          />
        </Field>
        <Field label="Longest" hint="Instagram caps handles at 30" htmlFor="maxLength">
          <TextInput
            id="maxLength"
            type="number"
            min={IG_MIN}
            max={IG_MAX}
            value={settings.maxLength}
            onChange={(e) => updateSettings({ maxLength: Number(e.target.value) })}
          />
        </Field>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Toggle
          label="Add numbers"
          description="e.g. nova42"
          checked={settings.useNumbers}
          onChange={(v) => updateSettings({ useNumbers: v })}
        />
        <Toggle
          label="Mixed case"
          description="e.g. NoVa"
          checked={settings.randomCase}
          onChange={(v) => updateSettings({ randomCase: v })}
        />
        <Toggle
          label="No repeats"
          description="Keep every idea unique"
          checked={settings.avoidDuplicates}
          onChange={(v) => updateSettings({ avoidDuplicates: v })}
        />
      </div>

      {/* Advanced controls */}
      <button
        type="button"
        onClick={() => setShowAdvanced((s) => !s)}
        className="mt-4 flex w-full items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted"
        aria-expanded={showAdvanced}
      >
        <span>Fine-tuning (prefix, suffix, include & exclude)</span>
        <ChevronDown className={`size-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
      </button>

      {showAdvanced ? (
        <div className="mt-4 grid gap-4 rounded-2xl border border-border bg-background/60 p-4 sm:grid-cols-2">
          <Field label="Prefix" hint="Added to the front, e.g. the" htmlFor="prefix">
            <TextInput
              id="prefix"
              value={settings.prefix}
              placeholder="the"
              onChange={(e) => updateSettings({ prefix: e.target.value })}
            />
          </Field>
          <Field label="Suffix" hint="Added to the end, e.g. hq" htmlFor="suffix">
            <TextInput
              id="suffix"
              value={settings.suffix}
              placeholder="hq"
              onChange={(e) => updateSettings({ suffix: e.target.value })}
            />
          </Field>
          <Field label="Separator" hint="Only . or _ are valid on Instagram" htmlFor="separator">
            <SelectInput
              id="separator"
              value={settings.separator}
              onChange={(e) => updateSettings({ separator: e.target.value })}
            >
              <option value="">None (joined)</option>
              <option value=".">Dot (.)</option>
              <option value="_">Underscore (_)</option>
            </SelectInput>
          </Field>
          <Field label="Must include" hint="Only keep handles containing this" htmlFor="include">
            <TextInput
              id="include"
              value={settings.include}
              placeholder="e.g. sky"
              onChange={(e) => updateSettings({ include: e.target.value })}
            />
          </Field>
          <Field
            label="Exclude"
            hint="Drop handles containing any of these (comma separated)"
            htmlFor="exclude"
            className="sm:col-span-2"
          >
            <TextInput
              id="exclude"
              value={settings.exclude}
              placeholder="e.g. official, real, xxx"
              onChange={(e) => updateSettings({ exclude: e.target.value })}
            />
          </Field>
        </div>
      ) : null}

      <Field label="Your own words" hint="One per line — mixed into the vibe you picked." className="mt-4">
        <TextArea
          placeholder={"john\nalex\nshadow\nblue\ncoffee"}
          value={settings.customText}
          onChange={(e) => updateSettings({ customText: e.target.value })}
        />
      </Field>

      <button
        type="button"
        onClick={generate}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand to-accent2 px-5 py-3.5 text-base font-bold text-brand-foreground shadow-lg shadow-brand/25 transition-transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <Sparkles className="size-5" />
        Make handles
      </button>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <strong className="text-sm">Your ideas</strong>
          <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-bold text-brand">
            {generated.length} ideas
          </span>
        </div>
        {generated.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-8 text-center text-sm text-muted-foreground">
            Your handle ideas will show up here.
          </div>
        ) : (
          <div className="soft-scroll flex max-h-64 flex-wrap gap-2 overflow-y-auto rounded-2xl border border-border bg-background/60 p-3">
            {generated.map((u) => (
              <span
                key={u}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 font-mono text-xs shadow-sm"
              >
                {u}
                <ScorePill handle={u.toLowerCase()} />
              </span>
            ))}
          </div>
        )}
        {generatedSkipped > 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {generatedSkipped} invalid combinations were skipped automatically.
          </p>
        ) : null}
      </div>
    </SectionCard>
  )
}

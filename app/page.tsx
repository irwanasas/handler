import { AtSign, Sparkles } from "lucide-react"
import { FloatingDock } from "@/components/floating-dock"
import { StudioProvider } from "@/components/playground/studio-context"
import { GeneratorCard } from "@/components/playground/generator-card"
import { ImportCard } from "@/components/playground/import-card"
import { QueueCard } from "@/components/playground/queue-card"
import { CheckerCard } from "@/components/playground/checker-card"
import { StatsRow } from "@/components/playground/stats-row"
import { ResultsCard } from "@/components/playground/results-card"
import { Notices } from "@/components/playground/notices"

export default function Page() {
  return (
    <StudioProvider>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-bold text-muted-foreground shadow-sm">
            <Sparkles className="size-3.5 text-brand" />
            Handle Studio
          </div>
          <ThemeToggle />
        </header>

        <section className="mb-10 text-center">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand to-accent2 text-brand-foreground shadow-lg shadow-brand/25">
            <AtSign className="size-7" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-balance sm:text-5xl">
            Find your next <span className="text-brand">Instagram handle</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground text-pretty">
            Generate smart ideas, score their quality, shortlist the best, and run a friendly demo
            availability check — all in one playful workspace.
          </p>
        </section>

        <div className="flex flex-col gap-5">
          <GeneratorCard />
          <ImportCard />
          <QueueCard />
          <CheckerCard />
          <StatsRow />
          <ResultsCard />
        </div>

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          Built for experimenting with Instagram username ideas. The availability checker is a
          simulation and never contacts Instagram.
        </footer>
      </main>
      <Notices />
    </StudioProvider>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { ArrowUp, Moon, Sun } from "lucide-react"

export function FloatingDock() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 320)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const isDark = resolvedTheme === "dark"

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-center gap-3 sm:bottom-6 sm:right-6">
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`inline-flex size-12 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg shadow-black/10 backdrop-blur transition-all duration-300 hover:bg-accent hover:-translate-y-0.5 ${
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <ArrowUp className="size-5" />
      </button>

      <button
        type="button"
        aria-label="Toggle dark mode"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="inline-flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent2 text-brand-foreground shadow-lg shadow-brand/30 transition-transform hover:-translate-y-0.5"
      >
        {mounted ? isDark ? <Sun className="size-5" /> : <Moon className="size-5" /> : <span className="size-5" />}
      </button>
    </div>
  )
}

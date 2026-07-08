"use client"

import Link from "next/link"
import { Menu, X, Leaf, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useBiblicalTheme } from "@/contexts/biblical-theme-context"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Tools" },
  { href: "/blog", label: "Blog" },
  { href: "/help", label: "Help" },
  { href: "/about", label: "About" },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { biblicalMode, toggleBiblicalMode, calmMode, toggleCalmMode } = useBiblicalTheme()

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl shrink-0" aria-label="Zilita Home">
            <span className="text-primary" aria-hidden="true">{biblicalMode ? "\u2618" : "\u25C6"}</span>
            <span className="hidden sm:inline">Zilita</span>
            <span className="sm:hidden">TF</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-foreground transition-colors rounded-sm py-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={toggleBiblicalMode}
            className={`inline-flex items-center justify-center gap-1.5 px-2.5 min-h-[44px] rounded-full text-xs font-medium border transition-colors ${
              biblicalMode
                ? "bg-amber-500/20 border-amber-500/50 text-amber-600"
                : "border-border/60 text-muted-foreground hover:border-amber-500/50 hover:text-amber-600"
            }`}
            title="Toggle Biblical Theme Mode"
            aria-pressed={biblicalMode}
          >
            <Leaf className={`h-3.5 w-3.5 ${biblicalMode ? "fill-amber-500/30" : ""}`} aria-hidden="true" />
            <span className="hidden sm:inline">Biblical</span>
          </button>

          <button
            type="button"
            onClick={toggleCalmMode}
            className={`inline-flex items-center justify-center gap-1.5 px-2.5 min-h-[44px] rounded-full text-xs font-medium border transition-colors ${
              calmMode
                ? "bg-sky-500/20 border-sky-500/50 text-sky-600"
                : "border-border/60 text-muted-foreground hover:border-sky-500/50 hover:text-sky-600"
            }`}
            title="Toggle Calm Mode"
            aria-pressed={calmMode}
          >
            <Moon className={`h-3.5 w-3.5 ${calmMode ? "fill-sky-500/30" : ""}`} aria-hidden="true" />
            <span className="hidden sm:inline">Calm</span>
          </button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden min-h-[44px] min-w-[44px]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-200 ease-in-out ${
          mobileOpen ? "max-h-80 border-t border-border/30" : "max-h-0"
        }`}
        aria-hidden={!mobileOpen}
      >
        <nav className="p-4 space-y-1" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors min-h-[44px]"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 pt-3 mt-2 border-t border-border/30">
            <button
              type="button"
              onClick={toggleBiblicalMode}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border transition-colors min-h-[44px] ${
                biblicalMode
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-600"
                  : "border-border/60 text-muted-foreground"
              }`}
              aria-pressed={biblicalMode}
            >
              <Leaf className={`h-3.5 w-3.5 ${biblicalMode ? "fill-amber-500/30" : ""}`} aria-hidden="true" />
              Biblical {biblicalMode ? "ON" : "OFF"}
            </button>
            <button
              type="button"
              onClick={toggleCalmMode}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border transition-colors min-h-[44px] ${
                calmMode
                  ? "bg-sky-500/20 border-sky-500/50 text-sky-600"
                  : "border-border/60 text-muted-foreground"
              }`}
              aria-pressed={calmMode}
            >
              <Moon className={`h-3.5 w-3.5 ${calmMode ? "fill-sky-500/30" : ""}`} aria-hidden="true" />
              Calm {calmMode ? "ON" : "OFF"}
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}

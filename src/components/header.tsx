"use client"

import Link from "next/link"
import { Menu, X, Leaf, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">{biblicalMode ? "\u2618" : "\u25C6"}</span>
            ToolForge
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleBiblicalMode}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              biblicalMode
                ? "bg-amber-500/20 border-amber-500/50 text-amber-600"
                : "border-border text-muted-foreground hover:border-amber-500/50 hover:text-amber-600"
            }`}
            title="Toggle Biblical Theme Mode"
          >
            <Leaf className={`h-3.5 w-3.5 ${biblicalMode ? "fill-amber-500/30" : ""}`} />
            <span className="hidden sm:inline">Biblical</span>
          </button>

          <button
            type="button"
            onClick={toggleCalmMode}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              calmMode
                ? "bg-sky-500/20 border-sky-500/50 text-sky-600"
                : "border-border text-muted-foreground hover:border-sky-500/50 hover:text-sky-600"
            }`}
            title="Toggle Calm Mode (reduced distractions)"
          >
            <Moon className={`h-3.5 w-3.5 ${calmMode ? "fill-sky-500/30" : ""}`} />
            <span className="hidden sm:inline">Calm</span>
          </button>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t p-4 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-border mb-2">
            <span className="text-xs text-muted-foreground">Theme</span>
            <button
              type="button"
              onClick={toggleBiblicalMode}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${
                biblicalMode
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-600"
                  : "border-border text-muted-foreground"
              }`}
            >
              <Leaf className={`h-3 w-3 ${biblicalMode ? "fill-amber-500/30" : ""}`} />
              Biblical {biblicalMode ? "ON" : "OFF"}
            </button>
            <button
              type="button"
              onClick={toggleCalmMode}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${
                calmMode
                  ? "bg-sky-500/20 border-sky-500/50 text-sky-600"
                  : "border-border text-muted-foreground"
              }`}
            >
              <Moon className={`h-3 w-3 ${calmMode ? "fill-sky-500/30" : ""}`} />
              Calm {calmMode ? "ON" : "OFF"}
            </button>
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm py-1.5"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}

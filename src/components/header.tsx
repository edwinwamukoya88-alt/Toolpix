"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Leaf, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBiblicalTheme } from "@/contexts/biblical-theme-context"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Tools" },
  { href: "/blog", label: "Blog" },
  { href: "/help", label: "Help" },
  { href: "/about", label: "About" },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { biblicalMode, toggleBiblicalMode, calmMode, toggleCalmMode } = useBiblicalTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "border-b border-white/[0.06] bg-background/80 backdrop-blur-xl shadow-lg shadow-black/5"
          : "border-transparent bg-transparent"
      )}
      role="banner"
    >
      <div className="container flex h-16 sm:h-20 items-center justify-between">
        <div className="flex items-center gap-6 sm:gap-12">
          <Link href="/" className="flex items-center shrink-0" aria-label="Zilita Home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-dark.svg" alt="Zilita" className="h-10 sm:h-[52px] w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative transition-colors duration-200 rounded-sm py-1",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-primary to-primary/50" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={toggleBiblicalMode}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 px-2.5 min-h-[44px] rounded-full text-xs font-medium border transition-all duration-300",
              biblicalMode
                ? "bg-amber-500/20 border-amber-500/50 text-amber-600 shadow-sm shadow-amber-500/10"
                : "border-white/[0.08] text-muted-foreground hover:border-amber-500/50 hover:text-amber-600"
            )}
            title="Toggle Biblical Theme Mode"
            aria-pressed={biblicalMode}
          >
            <Leaf className={`h-3.5 w-3.5 ${biblicalMode ? "fill-amber-500/30" : ""}`} aria-hidden="true" />
            <span className="hidden sm:inline">Biblical</span>
          </button>

          <button
            type="button"
            onClick={toggleCalmMode}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 px-2.5 min-h-[44px] rounded-full text-xs font-medium border transition-all duration-300",
              calmMode
                ? "bg-sky-500/20 border-sky-500/50 text-sky-600 shadow-sm shadow-sky-500/10"
                : "border-white/[0.08] text-muted-foreground hover:border-sky-500/50 hover:text-sky-600"
            )}
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
            {mobileOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          mobileOpen ? "max-h-96 border-t border-white/[0.06] bg-background/95 backdrop-blur-xl" : "max-h-0"
        )}
        aria-hidden={!mobileOpen}
      >
        <nav className="p-4 space-y-1" aria-label="Mobile navigation">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            )
          })}
          <div className="flex items-center gap-2 pt-3 mt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={toggleBiblicalMode}
              className={cn(
                "flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border transition-colors min-h-[44px]",
                biblicalMode
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-600"
                  : "border-white/[0.08] text-muted-foreground"
              )}
              aria-pressed={biblicalMode}
            >
              <Leaf className={`h-3.5 w-3.5 ${biblicalMode ? "fill-amber-500/30" : ""}`} aria-hidden="true" />
              Biblical {biblicalMode ? "ON" : "OFF"}
            </button>
            <button
              type="button"
              onClick={toggleCalmMode}
              className={cn(
                "flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border transition-colors min-h-[44px]",
                calmMode
                  ? "bg-sky-500/20 border-sky-500/50 text-sky-600"
                  : "border-white/[0.08] text-muted-foreground"
              )}
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

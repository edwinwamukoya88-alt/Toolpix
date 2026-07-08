"use client"

import { useState, useRef, useEffect } from "react"
import { signOutAction } from "@/app/admin/actions"
import { LogOut, ChevronDown, LayoutDashboard, User } from "lucide-react"

interface AdminHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Admin Dashboard</span>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 rounded-lg border border-border/50 px-3 py-2 hover:bg-muted/50 transition-colors"
          >
            {user?.image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.image}
                  alt={user?.name ?? ""}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-border"
                />
              </>
            ) : (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-tight">{user?.name ?? "User"}</p>
              <p className="text-xs text-muted-foreground leading-tight truncate max-w-[180px]">
                {user?.email ?? ""}
              </p>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 z-20 w-64 rounded-xl border border-border/50 bg-card shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-border/50">
                  <p className="text-sm font-medium">{user?.name ?? "User"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{user?.email ?? ""}</p>
                </div>
                <div className="p-2">
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

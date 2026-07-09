"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, BarChart3, FileText, Wrench, DollarSign, Users,
  Settings, Sparkles, Activity, Menu, X, ChevronRight,
} from "lucide-react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/tools", label: "Tools", icon: Wrench },
  { href: "/admin/ads", label: "Advertisements", icon: DollarSign },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/ai", label: "AI Studio", icon: Sparkles },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/system", label: "System", icon: Activity },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg lg:hidden"
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border/40 bg-background transition-all duration-300 lg:static lg:z-auto ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "w-16" : "w-60"}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/40 px-4 shrink-0">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2 font-semibold text-sm">
              <Image src="/logo-icon.svg" alt="Zilita" width={24} height={24} className="h-6 w-6 shrink-0" />
              <span>Zilita</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/admin" className="mx-auto">
              <Image src="/logo-icon.svg" alt="Zilita" width={24} height={24} className="h-6 w-6" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg hover:bg-muted transition-colors shrink-0"
            aria-label="Collapse sidebar"
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${collapsed ? "" : "rotate-180"}`} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href + "/"))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                } ${collapsed ? "justify-center px-0" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

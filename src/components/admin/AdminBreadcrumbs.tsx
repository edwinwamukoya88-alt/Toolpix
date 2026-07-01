"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

const labelMap: Record<string, string> = {
  admin: "Dashboard",
  blog: "Blog",
  tools: "Tools",
  ads: "Advertisements",
  users: "Users",
  ai: "AI Studio",
  settings: "Settings",
  system: "System",
  new: "New",
  edit: "Edit",
}

export function AdminBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length <= 1) return null

  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
      <Link href="/admin" className="hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.slice(1).map((segment, index) => {
        const href = "/" + segments.slice(0, index + 2).join("/")
        const label = labelMap[segment] ?? segment.replace(/-/g, " ")
        const isLast = index === segments.length - 2
        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            {isLast ? (
              <span className="text-foreground font-medium capitalize">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors capitalize">
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

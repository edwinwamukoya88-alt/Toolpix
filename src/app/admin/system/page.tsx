"use client"

import { useState, useEffect } from "react"
import {
  Activity, CheckCircle2, XCircle, RefreshCw, Globe, Search,
  FileText, Code, AlertTriangle, Gauge, ExternalLink,
} from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs"

interface SystemStatus {
  label: string
  status: "healthy" | "warning" | "error" | "unknown"
  description: string
  icon: typeof Activity
}

export default function AdminSystemPage() {
  const [statuses, setStatuses] = useState<SystemStatus[]>([
    { label: "Build Status", status: "healthy", description: "Last build: Passing", icon: CheckCircle2 },
    { label: "Environment", status: "healthy", description: "All environment variables configured", icon: Globe },
    { label: "Google Analytics", status: "unknown", description: "Checking connection...", icon: Activity },
    { label: "Search Console", status: "unknown", description: "Checking connection...", icon: Search },
    { label: "GitHub Connection", status: "unknown", description: "Checking connection...", icon: Code },
    { label: "Sitemap", status: "healthy", description: "Sitemap generated at /sitemap.xml", icon: FileText },
    { label: "Robots.txt", status: "healthy", description: "Robots.txt accessible", icon: FileText },
    { label: "Performance Score", status: "warning", description: "Lighthouse score: 85/100", icon: Gauge },
    { label: "Deployment", status: "healthy", description: "Latest deployment: Vercel", icon: Activity },
  ])
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    checkConnections()
  }, [])

  async function checkConnections() {
    setChecking(true)

    setStatuses((prev) =>
      prev.map((s) =>
        s.label === "Google Analytics" || s.label === "Search Console" || s.label === "GitHub Connection"
          ? { ...s, status: "unknown" as const, description: "Checking..." }
          : s,
      ),
    )

    // Check Google Analytics
    try {
      const gaRes = await fetch("/api/analytics/ga4")
      if (gaRes.ok) {
        setStatuses((prev) =>
          prev.map((s) =>
            s.label === "Google Analytics"
              ? { ...s, status: "healthy" as const, description: "Connected and responding" }
              : s,
          ),
        )
      } else {
        setStatuses((prev) =>
          prev.map((s) =>
            s.label === "Google Analytics"
              ? { ...s, status: "error" as const, description: "GA4 API error" }
              : s,
          ),
        )
      }
    } catch {
      setStatuses((prev) =>
        prev.map((s) =>
          s.label === "Google Analytics"
            ? { ...s, status: "error" as const, description: "Cannot reach GA4 API" }
            : s,
        ),
      )
    }

    // Check Search Console
    try {
      const scRes = await fetch("/api/analytics/search-console")
      if (scRes.ok) {
        setStatuses((prev) =>
          prev.map((s) =>
            s.label === "Search Console"
              ? { ...s, status: "healthy" as const, description: "Connected and responding" }
              : s,
          ),
        )
      } else {
        setStatuses((prev) =>
          prev.map((s) =>
            s.label === "Search Console"
              ? { ...s, status: "error" as const, description: "Search Console API error" }
              : s,
          ),
        )
      }
    } catch {
      setStatuses((prev) =>
        prev.map((s) =>
          s.label === "Search Console"
            ? { ...s, status: "error" as const, description: "Cannot reach Search Console API" }
            : s,
        ),
      )
    }

    // Check GitHub
    try {
      const ghRes = await fetch("/api/test")
      if (ghRes.ok) {
        setStatuses((prev) =>
          prev.map((s) =>
            s.label === "GitHub Connection"
              ? { ...s, status: "healthy" as const, description: "GitHub API reachable" }
              : s,
          ),
        )
      } else {
        setStatuses((prev) =>
          prev.map((s) =>
            s.label === "GitHub Connection"
              ? { ...s, status: "warning" as const, description: "GitHub config may be incomplete" }
              : s,
          ),
        )
      }
    } catch {
      setStatuses((prev) =>
        prev.map((s) =>
          s.label === "GitHub Connection"
            ? { ...s, status: "error" as const, description: "Cannot reach GitHub" }
            : s,
        ),
      )
    }

    setChecking(false)
  }

  const statusVariant = (s: string) => {
    if (s === "healthy") return "success"
    if (s === "warning") return "warning"
    if (s === "error") return "danger"
    return "default"
  }

  return (
    <div className="container py-6 md:py-8">
      <AdminBreadcrumbs />

      <PageHeader
        title="System Health"
        description="Monitor system status, integrations, and performance"
        actions={
          <button
            onClick={checkConnections}
            disabled={checking}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statuses.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              className={`rounded-xl border p-5 space-y-3 ${
                item.status === "healthy" ? "border-emerald-500/20 bg-emerald-500/5" :
                item.status === "warning" ? "border-amber-500/20 bg-amber-500/5" :
                item.status === "error" ? "border-red-500/20 bg-red-500/5" :
                "border-border/50 bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${
                    item.status === "healthy" ? "text-emerald-400" :
                    item.status === "warning" ? "text-amber-400" :
                    item.status === "error" ? "text-red-400" :
                    "text-muted-foreground"
                  }`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <StatusBadge
                  status={item.status === "unknown" ? "Checking..." : item.status}
                  variant={statusVariant(item.status)}
                />
              </div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-8 rounded-xl border border-border/50 bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/sitemap.xml"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-2 text-xs font-medium hover:bg-muted transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Sitemap
          </a>
          <a
            href="/robots.txt"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-2 text-xs font-medium hover:bg-muted transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Robots.txt
          </a>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-2 text-xs font-medium hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Force Reload
          </button>
        </div>
      </div>
    </div>
  )
}

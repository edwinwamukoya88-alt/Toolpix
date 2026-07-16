"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Activity, CheckCircle2, XCircle, RefreshCw, Globe, Search,
  FileText, Code, AlertTriangle, Gauge, ExternalLink, Database,
  Sparkles, HardDrive, BarChart3, Server, Clock,
} from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs"

interface ServiceStatus {
  label: string
  status: "healthy" | "warning" | "error" | "unknown"
  description: string
  icon: typeof Activity
  latency: number | null
  lastChecked: string | null
  error: string | null
}

interface SystemData {
  database: {
    provider: string
    vendor: string
    status: string
    host: string
    database: string
    latency: number | null
    lastChecked: string
    error: string | null
  }
  prisma: {
    version: string
    connected: boolean
  }
  environment: {
    name: string
    vercel: boolean
    region: string | null
  }
  services: Array<{
    label: string
    status: string
    latency: number | null
    lastChecked: string
    error: string | null
    description: string
  }>
  timestamp: string
}

const SERVICE_ICONS: Record<string, typeof Activity> = {
  "Database": Database,
  "Prisma ORM": Server,
  "Google Analytics": BarChart3,
  "Search Console": Search,
  "Gemini API": Sparkles,
  "GitHub API": Code,
  "Storage": HardDrive,
  "Analytics Pipeline": Activity,
  "Deployment": Globe,
}

export default function AdminSystemPage() {
  const [systemData, setSystemData] = useState<SystemData | null>(null)
  const [statuses, setStatuses] = useState<ServiceStatus[]>([])
  const [checking, setChecking] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const fetchStatus = useCallback(async (force = false) => {
    setChecking(true)
    try {
      const qs = force ? "?force=true" : ""
      const res = await fetch(`/api/admin/system-status${qs}`)
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          setSystemData(json.data)
          setLastUpdated(json.timestamp)

          const mapped: ServiceStatus[] = json.data.services.map((s: any) => ({
            label: s.label,
            status: s.status === "connected" ? "healthy" as const :
                    s.status === "disconnected" ? "error" as const :
                    s.status === "degraded" ? "warning" as const :
                    "unknown" as const,
            description: s.description,
            icon: SERVICE_ICONS[s.label] || Activity,
            latency: s.latency,
            lastChecked: s.lastChecked,
            error: s.error,
          }))
          setStatuses(mapped)
        }
      }
    } catch {
      setStatuses(prev => prev.map(s => ({
        ...s,
        status: "error" as const,
        description: "Failed to fetch status",
      })))
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    const interval = setInterval(() => fetchStatus(), 60000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  const statusVariant = (s: string) => {
    if (s === "healthy") return "success"
    if (s === "warning") return "warning"
    if (s === "error") return "danger"
    return "default"
  }

  const db = systemData?.database
  const env = systemData?.environment
  const prisma = systemData?.prisma

  return (
    <div className="container py-6 md:py-8">
      <AdminBreadcrumbs />

      <PageHeader
        title="System Health"
        description="Monitor system status, integrations, and performance"
        actions={
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => fetchStatus(true)}
              disabled={checking}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        }
      />

      {/* Database & Environment Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`rounded-xl border p-5 space-y-2 ${
          db?.status === "connected" ? "border-emerald-500/20 bg-emerald-500/5" :
          db?.status === "disconnected" ? "border-red-500/20 bg-red-500/5" :
          "border-border/50 bg-card"
        }`}>
          <div className="flex items-center gap-2">
            <Database className={`h-4 w-4 ${db?.status === "connected" ? "text-emerald-400" : db?.status === "disconnected" ? "text-red-400" : "text-muted-foreground"}`} />
            <span className="text-xs font-medium text-muted-foreground">Database</span>
          </div>
          <div className="text-lg font-bold">{db?.provider || "—"}</div>
          <div className="text-xs text-muted-foreground">{db?.vendor || "—"}</div>
          {db?.latency != null && (
            <div className="text-[10px] text-muted-foreground">{db.latency}ms latency</div>
          )}
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-5 space-y-2">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Prisma</span>
          </div>
          <div className="text-lg font-bold">v{prisma?.version || "—"}</div>
          <StatusBadge
            status={prisma?.connected ? "Connected" : "Disconnected"}
            variant={prisma?.connected ? "success" : "danger"}
          />
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-5 space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Environment</span>
          </div>
          <div className="text-lg font-bold capitalize">{env?.name || "—"}</div>
          <div className="text-xs text-muted-foreground">
            {env?.vercel ? `Vercel${env.region ? ` · ${env.region}` : ""}` : "Self-hosted"}
          </div>
        </div>

        <div className={`rounded-xl border p-5 space-y-2 ${
          db?.status === "connected" ? "border-emerald-500/20 bg-emerald-500/5" :
          "border-red-500/20 bg-red-500/5"
        }`}>
          <div className="flex items-center gap-2">
            {db?.status === "connected" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
            <span className="text-xs font-medium text-muted-foreground">Status</span>
          </div>
          <div className={`text-lg font-bold ${db?.status === "connected" ? "text-emerald-400" : "text-red-400"}`}>
            {db?.status === "connected" ? "Healthy" : "Degraded"}
          </div>
          {db?.error && (
            <div className="text-[10px] text-red-400 line-clamp-2">{db.error}</div>
          )}
        </div>
      </div>

      {/* All Services Grid */}
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
                  status={item.status === "unknown" ? "Checking..." : item.status === "healthy" ? "Connected" : item.status === "error" ? "Disconnected" : item.status}
                  variant={statusVariant(item.status)}
                />
              </div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
              {item.latency != null && (
                <p className="text-[10px] text-muted-foreground/60">{item.latency}ms</p>
              )}
              {item.error && (
                <p className="text-[10px] text-red-400 line-clamp-2">{item.error}</p>
              )}
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
            onClick={() => fetchStatus(true)}
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

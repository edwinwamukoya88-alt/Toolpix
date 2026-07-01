"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Wrench, Star, TrendingUp, Zap, Eye, EyeOff } from "lucide-react"
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs"
import { getToolBySlug, updateToolConfig, type Tool } from "@/lib/tools-cms"
import { StatusBadge } from "@/components/admin/StatusBadge"

export default function ToolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [tool, setTool] = useState<(Tool & { enabled: boolean; featured: boolean; popular: boolean; new: boolean }) | null>(null)
  const slug = params.id as string

  useEffect(() => {
    setTool(getToolBySlug(slug))
  }, [slug])

  if (!tool) {
    return (
      <div className="container py-6 md:py-8">
        <AdminBreadcrumbs />
        <div className="rounded-xl border border-border/50 p-12 text-center">
          <p className="text-sm text-muted-foreground">Tool not found.</p>
        </div>
      </div>
    )
  }

  function toggle(field: "enabled" | "featured" | "popular" | "new") {
    if (!tool) return
    updateToolConfig(slug, { [field]: !tool[field] })
    setTool((prev) => prev ? { ...prev, [field]: !prev[field] } : prev)
  }

  return (
    <div className="container py-6 md:py-8">
      <AdminBreadcrumbs />

      <button
        onClick={() => router.push("/admin/tools")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tools
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Wrench className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{tool.name}</h1>
                <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={tool.enabled ? "Enabled" : "Disabled"} variant={tool.enabled ? "success" : "danger"} />
              <StatusBadge status={tool.category} variant="info" />
              <StatusBadge status={tool.badge} variant="default" />
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6">
            <h2 className="text-sm font-semibold mb-4">Analytics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold">—</div>
                <div className="text-xs text-muted-foreground">Launches</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold">—</div>
                <div className="text-xs text-muted-foreground">Users</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold">—</div>
                <div className="text-xs text-muted-foreground">Completion</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold">—</div>
                <div className="text-xs text-muted-foreground">Avg. Time</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Settings</h3>

            <button
              onClick={() => toggle("enabled")}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                tool.enabled ? "bg-emerald-500/10 text-emerald-400" : "bg-muted/30 text-muted-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                {tool.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {tool.enabled ? "Enabled" : "Disabled"}
              </span>
              <StatusBadge status={tool.enabled ? "On" : "Off"} variant={tool.enabled ? "success" : "danger"} />
            </button>

            <button
              onClick={() => toggle("featured")}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                tool.featured ? "bg-amber-500/10 text-amber-400" : "bg-muted/30 text-muted-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4" fill={tool.featured ? "currentColor" : "none"} />
                Featured
              </span>
              <StatusBadge status={tool.featured ? "Yes" : "No"} variant={tool.featured ? "warning" : "default"} />
            </button>

            <button
              onClick={() => toggle("popular")}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                tool.popular ? "bg-emerald-500/10 text-emerald-400" : "bg-muted/30 text-muted-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Popular
              </span>
              <StatusBadge status={tool.popular ? "Yes" : "No"} variant={tool.popular ? "success" : "default"} />
            </button>

            <button
              onClick={() => toggle("new")}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                tool.new ? "bg-blue-500/10 text-blue-400" : "bg-muted/30 text-muted-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                New
              </span>
              <StatusBadge status={tool.new ? "Yes" : "No"} variant={tool.new ? "info" : "default"} />
            </button>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-4 space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details</h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slug</span>
                <span className="font-mono">{tool.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span>{tool.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Badge</span>
                <span>{tool.badge}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coming Soon</span>
                <span>{tool.comingSoon ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

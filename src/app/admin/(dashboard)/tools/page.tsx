"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Search, Wrench, Eye, Star, TrendingUp, Zap,
} from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { DataTable, type Column } from "@/components/admin/DataTable"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs"
import { getToolsWithConfig, updateToolConfig, categories, type ToolWithConfig } from "@/lib/tools-cms"

export default function AdminToolsPage() {
  const router = useRouter()
  const [tools, setTools] = useState<ToolWithConfig[]>([])
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getToolsWithConfig().then((result) => {
      setTools(result)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    return tools.filter((tool) => {
      if (search && !tool.name.toLowerCase().includes(search.toLowerCase()) &&
          !tool.description.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (filterCategory !== "all" && tool.category !== filterCategory) return false
      if (filterStatus === "enabled" && !tool.enabled) return false
      if (filterStatus === "disabled" && tool.enabled) return false
      return true
    })
  }, [tools, search, filterCategory, filterStatus])

  async function toggleEnabled(slug: string) {
    await updateToolConfig(slug, { enabled: !tools.find((t) => t.slug === slug)?.enabled })
    setTools(await getToolsWithConfig())
  }

  async function toggleFeatured(slug: string) {
    await updateToolConfig(slug, { featured: !tools.find((t) => t.slug === slug)?.featured })
    setTools(await getToolsWithConfig())
  }

  async function togglePopular(slug: string) {
    await updateToolConfig(slug, { popular: !tools.find((t) => t.slug === slug)?.popular })
    setTools(await getToolsWithConfig())
  }

  async function toggleNew(slug: string) {
    await updateToolConfig(slug, { new: !tools.find((t) => t.slug === slug)?.new })
    setTools(await getToolsWithConfig())
  }

  const columns: Column<ToolWithConfig>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm">{item.name}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[250px]">{item.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground">{item.category}</span>
      ),
    },
    {
      key: "badge",
      label: "Badge",
      render: (item) => (
        <span className="text-xs text-muted-foreground">{item.badge}</span>
      ),
    },
    {
      key: "enabled",
      label: "Status",
      render: (item) => (
        <button onClick={() => toggleEnabled(item.slug)}>
          {item.enabled ? (
            <StatusBadge status="Enabled" variant="success" />
          ) : (
            <StatusBadge status="Disabled" variant="danger" />
          )}
        </button>
      ),
    },
    {
      key: "featured",
      label: "Featured",
      render: (item) => (
        <button
          onClick={() => toggleFeatured(item.slug)}
          className={`rounded-lg p-1.5 transition-colors ${item.featured ? "text-amber-400 hover:bg-amber-500/10" : "text-muted-foreground/40 hover:bg-muted"}`}
        >
          <Star className="h-4 w-4" fill={item.featured ? "currentColor" : "none"} />
        </button>
      ),
    },
    {
      key: "popular",
      label: "Popular",
      render: (item) => (
        <button
          onClick={() => togglePopular(item.slug)}
          className={`rounded-lg p-1.5 transition-colors ${item.popular ? "text-emerald-400 hover:bg-emerald-500/10" : "text-muted-foreground/40 hover:bg-muted"}`}
        >
          <TrendingUp className="h-4 w-4" />
        </button>
      ),
    },
    {
      key: "new",
      label: "New",
      render: (item) => (
        <button
          onClick={() => toggleNew(item.slug)}
          className={`rounded-lg p-1.5 transition-colors ${item.new ? "text-blue-400 hover:bg-blue-500/10" : "text-muted-foreground/40 hover:bg-muted"}`}
        >
          <Zap className="h-4 w-4" />
        </button>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (item) => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => router.push(`/admin/tools/${item.slug}`)}
            className="rounded-lg p-1.5 hover:bg-muted transition-colors"
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
      className: "text-right",
    },
  ]

  return (
    <div className="container py-6 md:py-8">
      <AdminBreadcrumbs />

      <PageHeader
        title="Tools Management"
        description="Manage all Zilita utilities — enable, feature, and categorize"
      />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools..."
              className="w-full rounded-lg border border-border/50 bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          >
            <option value="all">All Status</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="No tools found matching your filters."
        />
      </div>
    </div>
  )
}

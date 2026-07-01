"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Plus, Search, FileText, Edit, Trash2, Eye, Clock, CheckCircle2,
  XCircle, Sparkles,
} from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { DataTable, type Column } from "@/components/admin/DataTable"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs"
import {
  getDrafts, deleteDraft, getDraftBySlug,
  type BlogListItem, blogCategories,
} from "@/lib/blog-cms"
import { getPublishedPosts } from "./actions"

export default function AdminBlogPage() {
  const router = useRouter()
  const [items, setItems] = useState<BlogListItem[]>([])
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<BlogListItem | null>(null)

  useEffect(() => {
    async function load() {
      const [published, drafts] = await Promise.all([
        getPublishedPosts(),
        Promise.resolve(getDrafts()),
      ])
      const draftItems: BlogListItem[] = drafts.map((d) => ({
        slug: d.slug,
        title: d.title,
        description: d.description,
        date: new Date(d.updatedAt).toISOString(),
        category: d.category,
        tags: d.tags,
        featured: d.featured,
        readingTime: d.content ? Math.max(1, Math.ceil(d.content.split(/\s+/).length / 200)) : 1,
        status: d.status,
        aiScore: 0,
      }))
      const all = [...published, ...draftItems].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      setItems(all)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (search && !item.title.toLowerCase().includes(search.toLowerCase()) &&
          !item.slug.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (filterStatus !== "all" && item.status !== filterStatus) return false
      if (filterCategory !== "all" && item.category !== filterCategory) return false
      return true
    })
  }, [items, search, filterStatus, filterCategory])

  const refresh = useCallback(() => {
    async function reload() {
      setLoading(true)
      const [published, drafts] = await Promise.all([
        getPublishedPosts(),
        Promise.resolve(getDrafts()),
      ])
      const draftItems: BlogListItem[] = drafts.map((d) => ({
        slug: d.slug,
        title: d.title,
        description: d.description,
        date: new Date(d.updatedAt).toISOString(),
        category: d.category,
        tags: d.tags,
        featured: d.featured,
        readingTime: d.content ? Math.max(1, Math.ceil(d.content.split(/\s+/).length / 200)) : 1,
        status: d.status,
        aiScore: 0,
      }))
      const all = [...published, ...draftItems].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      setItems(all)
      setLoading(false)
    }
    reload()
  }, [])

  function handleDelete() {
    if (!deleteTarget) return
    const draft = getDraftBySlug(deleteTarget.slug)
    if (draft) {
      deleteDraft(draft.id)
      refresh()
    }
    setDeleteTarget(null)
  }

  const columns: Column<BlogListItem>[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate max-w-[300px]">{item.title}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[300px]">{item.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (item) => {
        const variant = item.status === "published" ? "success" : item.status === "draft" ? "warning" : "info"
        return <StatusBadge status={item.status} variant={variant} />
      },
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
      key: "featured",
      label: "Featured",
      render: (item) => (
        item.featured
          ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          : <XCircle className="h-4 w-4 text-muted-foreground/40" />
      ),
    },
    {
      key: "readingTime",
      label: "Read Time",
      sortable: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {item.readingTime} min
        </span>
      ),
    },
    {
      key: "aiScore",
      label: "AI Score",
      sortable: true,
      render: (item) => (
        <span className="flex items-center gap-1 text-xs">
          <Sparkles className={`h-3 w-3 ${item.aiScore >= 80 ? "text-amber-400" : "text-muted-foreground"}`} />
          {item.status === "published" ? `${item.aiScore}%` : "—"}
        </span>
      ),
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground">
          {new Date(item.date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (item) => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={(e) => { e.stopPropagation(); window.open(`/blog/${item.slug}`, "_blank") }}
            className="rounded-lg p-1.5 hover:bg-muted transition-colors"
            title="View"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          {item.status !== "published" ? (
            <button
              onClick={(e) => { e.stopPropagation(); router.push(`/admin/blog/${item.slug}/edit`) }}
              className="rounded-lg p-1.5 hover:bg-muted transition-colors"
              title="Edit"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
          ) : null}
          {item.status !== "published" && (
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteTarget(item) }}
              className="rounded-lg p-1.5 hover:bg-destructive/10 transition-colors"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </button>
          )}
        </div>
      ),
      className: "text-right",
    },
  ]

  return (
    <div className="container py-6 md:py-8">
      <AdminBreadcrumbs />

      <PageHeader
        title="Blog Management"
        description="Create, edit, and manage blog posts"
        actions={
          <button
            onClick={() => router.push("/admin/blog/new")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Article
          </button>
        }
      />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full rounded-lg border border-border/50 bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="scheduled">Scheduled</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          >
            <option value="all">All Categories</option>
            {blogCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="No articles found. Create your first article to get started."
        />
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Article"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

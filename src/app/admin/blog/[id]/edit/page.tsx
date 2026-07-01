"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { BlogEditor } from "@/components/admin/BlogEditor"
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs"
import { getDraftBySlug, type BlogDraft } from "@/lib/blog-cms"

export default function EditBlogPage() {
  const params = useParams()
  const router = useRouter()
  const [draft, setDraft] = useState<BlogDraft | null | undefined>(undefined)
  const id = params.id as string

  useEffect(() => {
    const existingDraft = getDraftBySlug(id)
    setDraft(existingDraft ?? null)
  }, [id])

  if (draft === undefined) {
    return (
      <div className="container py-6 md:py-8">
        <AdminBreadcrumbs />
        <div className="space-y-4">
          <div className="h-8 w-48 rounded bg-muted/30 animate-pulse" />
          <div className="h-[600px] rounded-xl bg-muted/30 animate-pulse" />
        </div>
      </div>
    )
  }

  if (draft === null) {
    return (
      <div className="container py-6 md:py-8">
        <AdminBreadcrumbs />
        <div className="rounded-xl border border-border/50 p-12 text-center space-y-4">
          <p className="text-sm text-muted-foreground">Draft not found or this is a published post. Published posts can be edited by creating a new draft.</p>
          <button
            onClick={() => router.push("/admin/blog")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Back to articles
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 md:py-8">
      <AdminBreadcrumbs />
      <BlogEditor draft={draft} />
    </div>
  )
}

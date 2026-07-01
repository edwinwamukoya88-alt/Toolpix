"use client"

import { BlogEditor } from "@/components/admin/BlogEditor"
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs"

export default function NewBlogPage() {
  return (
    <div className="container py-6 md:py-8">
      <AdminBreadcrumbs />
      <BlogEditor />
    </div>
  )
}

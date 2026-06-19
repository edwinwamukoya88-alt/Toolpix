"use client"

import { useState, useMemo } from "react"
import { BookOpen, Search } from "lucide-react"
import FeaturedPost from "@/components/blog/featured-post"
import BlogCard from "@/components/blog/blog-card"
import BlogSearch from "@/components/blog/blog-search"
import CategoryFilter from "@/components/blog/category-filter"
import type { BlogMeta } from "@/lib/blog-types"

interface BlogHomeClientProps {
  posts: BlogMeta[]
  featured: BlogMeta | null
}

export default function BlogHomeClient({ posts, featured }: BlogHomeClientProps) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = posts
    if (featured) {
      result = result.filter((p) => p.slug !== featured.slug)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      )
    }
    if (category) {
      result = result.filter((p) => p.category === category)
    }
    return result
  }, [posts, featured, search, category])

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-transparent to-purple-500/[0.05]" />
        <div className="container relative">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-medium text-muted-foreground bg-background/50 backdrop-blur-sm">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              Guides, tutorials, and insights
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              ToolForge <span className="text-primary">Blog</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-lg mx-auto">
              Guides on CBC education, productivity techniques, privacy tips, and more.
            </p>
          </div>
        </div>
      </section>

      <div className="container pb-16">
        {featured && (
          <section className="mb-12">
            <FeaturedPost post={featured} />
          </section>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <BlogSearch value={search} onChange={setSearch} />
          <div className="text-sm text-muted-foreground shrink-0">
            {filtered.length} {filtered.length === 1 ? "article" : "articles"}
          </div>
        </div>

        <div className="mb-8">
          <CategoryFilter selected={category} onChange={setCategory} />
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-3">
            <Search className="h-8 w-8 mx-auto text-muted-foreground" />
            <div className="text-lg font-medium">No articles found</div>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or category filter.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

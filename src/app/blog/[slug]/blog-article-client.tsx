"use client"

import Link from "next/link"
import { Calendar, Clock, User, ArrowLeft, ChevronRight } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { BlogPost, BlogMeta } from "@/lib/blog-types"
import BlogCoverImage from "@/components/blog/blog-cover-image"
import TableOfContents from "@/components/blog/table-of-contents"
import ShareButtons from "@/components/blog/share-buttons"
import RelatedArticles from "@/components/blog/related-articles"
import RelatedTools from "@/components/blog/related-tools"
import { formatDate } from "@/lib/utils"

interface BlogArticleClientProps {
  post: BlogPost
  relatedPosts: BlogMeta[]
  toolSlugs: string[]
}

export default function BlogArticleClient({ post, relatedPosts, toolSlugs }: BlogArticleClientProps) {
  return (
    <div className="min-h-screen">
      <article className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          <BlogCoverImage coverImage={post.coverImage} title={post.title} size="article" className="mb-8" />

          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-muted-foreground mb-4">
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] md:text-xs font-medium">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.date, "long")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime} min read
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {post.author}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4">{post.title}</h1>
          <p className="text-base md:text-lg text-muted-foreground mb-4">{post.description}</p>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-8 border-b mt-6">
            <ShareButtons title={post.title} slug={post.slug} />
          </div>

          <div className="flex gap-8">
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-24">
                <TableOfContents />
              </div>
            </aside>

            <div className="min-w-0 flex-1 blog-content prose prose-invert prose-sm md:prose-base max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children, ...props }) => {
                    const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
                    return <h2 id={id} {...props}>{children}</h2>
                  },
                  h3: ({ children, ...props }) => {
                    const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
                    return <h3 id={id} {...props}>{children}</h3>
                  },
                  a: ({ href, children, ...props }) => {
                    const isInternal = href?.startsWith("/")
                    if (isInternal) {
                      return <a href={href} {...props}>{children}</a>
                    }
                    return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
                  },
                  img: ({ src, alt, ...props }) => (
                    <div className="rounded-xl overflow-hidden border bg-background/40">
                      <img src={src} alt={alt || ""} className="w-full h-auto" {...props} />
                    </div>
                  ),
                  table: ({ children, ...props }) => (
                    <div className="overflow-x-auto rounded-xl border">
                      <table className="w-full" {...props}>{children}</table>
                    </div>
                  ),
                  code: ({ children, className, ...props }) => {
                    const isInline = !className
                    if (isInline) {
                      return <code className="rounded-md bg-muted px-1.5 py-0.5 text-sm font-mono" {...props}>{children}</code>
                    }
                    return (
                      <div className="rounded-xl border bg-muted/50 overflow-x-auto">
                        <code className={`block p-4 text-sm font-mono ${className}`} {...props}>{children}</code>
                      </div>
                    )
                  },
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border bg-background/40 px-3 py-1 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-8 border-t">
            <ShareButtons title={post.title} slug={post.slug} />
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-16 space-y-12">
          {toolSlugs.length > 0 && (
            <RelatedTools toolSlugs={toolSlugs} />
          )}

          {relatedPosts.length > 0 && (
            <RelatedArticles posts={relatedPosts} />
          )}

          <section className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10 border p-8 md:p-10 text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="relative">
              <h2 className="text-xl md:text-2xl font-bold">Need a Specific Tool?</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Browse all 39+ privacy-first tools. No signup required.
              </p>
              <div className="pt-2">
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/80 transition-colors"
                >
                  Explore Tools <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </article>
    </div>
  )
}

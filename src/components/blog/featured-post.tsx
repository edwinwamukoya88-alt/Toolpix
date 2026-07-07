import Link from "next/link"
import { Calendar, ArrowRight } from "lucide-react"
import type { BlogMeta } from "@/lib/blog-types"
import BlogCoverImage from "@/components/blog/blog-cover-image"
import CategoryBadge from "@/components/blog/category-badge"
import ReadingTimeBadge from "@/components/blog/reading-time-badge"
import { formatDate } from "@/lib/utils"

export default function FeaturedPost({ post }: { post: BlogMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex flex-col md:flex-row rounded-2xl border overflow-hidden transition-all duration-500 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40"
    >
      <div className="relative md:w-1/2 overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <div className="h-full w-full transition-transform duration-700 group-hover:scale-105">
          <BlogCoverImage coverImage={post.coverImage} title={post.title} size="featured" className="h-full w-full rounded-none" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent hidden md:block pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent md:hidden pointer-events-none" />
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-flex items-center rounded-full border bg-background/80 backdrop-blur-sm px-3 py-0.5 text-xs font-medium text-primary">
            Featured
          </span>
        </div>
      </div>
      <div className="flex flex-col justify-center gap-3 p-6 md:p-8 md:w-1/2 bg-background/40">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <CategoryBadge category={post.category} showIcon />
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(post.date)}
          </span>
          <ReadingTimeBadge minutes={post.readingTime} />
        </div>
        <h2 className="text-xl md:text-2xl font-bold group-hover:text-primary transition-colors">{post.title}</h2>
        <p className="text-sm text-muted-foreground line-clamp-3">{post.description}</p>
        <div className="flex items-center gap-1 text-sm text-primary font-medium pt-1">
          Read Article <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}

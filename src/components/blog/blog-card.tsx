import Link from "next/link"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import type { BlogMeta } from "@/lib/blog-types"
import BlogCoverImage from "@/components/blog/blog-cover-image"
import { formatDate } from "@/lib/utils"

export default function BlogCard({ post }: { post: BlogMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex flex-col rounded-xl border bg-background/40 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30"
    >
      <BlogCoverImage coverImage={post.coverImage} title={post.title} size="card" />
      <div className="flex flex-col gap-2 p-5 flex-1">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(post.date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {post.readingTime} min read
          </span>
        </div>
        <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{post.description}</p>
        <div className="flex items-center gap-1 text-sm text-primary font-medium pt-2">
          Read More <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}

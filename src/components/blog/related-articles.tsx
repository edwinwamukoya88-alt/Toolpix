import BlogCard from "./blog-card"
import type { BlogMeta } from "@/lib/blog-types"

interface RelatedArticlesProps {
  posts: BlogMeta[]
}

export default function RelatedArticles({ posts }: RelatedArticlesProps) {
  if (posts.length === 0) return null

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Related Articles</h2>
        <p className="text-sm text-muted-foreground mt-1">Continue reading from the same category</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  )
}

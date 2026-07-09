"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BlogMeta } from "@/lib/blog-types"
import { formatDate } from "@/lib/utils"

interface BlogSectionProps {
  posts: BlogMeta[]
}

function FeaturedPost({ post }: { post: BlogMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative col-span-1 md:col-span-2 flex flex-col rounded-2xl border border-white/[0.06] bg-gradient-to-b from-card/80 to-card/40 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10"
    >
      <div className="aspect-[2/1] bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10 flex items-center justify-center">
        <span className="text-4xl opacity-20" role="img" aria-label="article">📝</span>
      </div>
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="rounded-full border border-primary/20 bg-primary/[0.06] px-2.5 py-0.5 text-primary">{post.category}</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(post.date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {post.readingTime} min read
          </span>
        </div>
        <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
        <p className="text-muted-foreground line-clamp-2">{post.description}</p>
        <div className="flex items-center gap-1 text-sm text-primary font-medium mt-4">
          Read Article <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}

function SmallPost({ post }: { post: BlogMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl border border-white/[0.06] bg-card/40 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
    >
      <div className="aspect-[16/9] bg-gradient-to-br from-primary/[0.06] to-transparent flex items-center justify-center">
        <span className="text-2xl opacity-15" role="img" aria-label="document">📄</span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span className="rounded-full border border-white/[0.06] px-2 py-0.5">{post.category}</span>
          <span>{formatDate(post.date)}</span>
        </div>
        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{post.description}</p>
        <div className="flex items-center gap-1 text-xs text-primary font-medium mt-3">
          Read <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}

export default function BlogSection({ posts }: BlogSectionProps) {
  return (
    <section className="relative py-24 md:py-28">
      <div className="container">
        <motion.div
          className="flex items-end justify-between mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Latest from the blog</h2>
            <p className="text-muted-foreground">Guides, tutorials, and insights from the Zilita team</p>
          </div>
          <Link href="/blog" className="hidden sm:block">
            <Button variant="glass" size="sm" className="gap-1.5 rounded-xl">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {posts.length > 0 && <FeaturedPost post={posts[0]} />}
          {posts.slice(1, 3).map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <SmallPost post={post} />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-6 text-center sm:hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link href="/blog">
            <Button variant="glass" size="sm" className="gap-1.5 rounded-xl">
              View All Posts <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

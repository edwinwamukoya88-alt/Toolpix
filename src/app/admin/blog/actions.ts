"use server"

import { getAllPosts } from "@/lib/blog"
import type { BlogListItem } from "@/lib/blog-cms"

export async function getPublishedPosts(): Promise<BlogListItem[]> {
  return getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    date: p.date,
    category: p.category,
    tags: p.tags,
    featured: p.featured,
    readingTime: p.readingTime,
    status: "published" as const,
    aiScore: p.ai.score,
  }))
}

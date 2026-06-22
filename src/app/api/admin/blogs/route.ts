import { NextResponse } from "next/server"
import { getAllPosts } from "@/lib/blog"

export async function GET() {
  const posts = getAllPosts()
  const data = posts.map((p) => ({
    title: p.title,
    slug: p.slug,
    aiScore: p.ai.score,
    internalLinks: p.ai.internalLinks,
    aiStatus: p.ai.badge,
  }))
  return NextResponse.json(data)
}

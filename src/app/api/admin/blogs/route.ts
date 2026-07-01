import { NextResponse } from "next/server"
import { getAllPosts } from "@/lib/blog"
import { requireApiAuth } from "@/lib/auth-guard"

export async function GET() {
  const authResponse = await requireApiAuth()
  if (authResponse) return authResponse

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

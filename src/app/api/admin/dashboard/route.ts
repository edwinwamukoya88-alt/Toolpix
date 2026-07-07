import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAllPosts } from "@/lib/blog"
import { tools } from "@/lib/tools-data"

export async function GET() {
  try {
    const blogPosts = getAllPosts().length
    const publishedTools = tools.length

    const totalUsers = await prisma.adminUser.count()
    const draftCount = await prisma.blogDraft.count()

    return NextResponse.json({
      blogPosts,
      publishedTools,
      activeUsers: null,
      sessions: null,
      pageViews: null,
      searchClicks: null,
      searchImpressions: null,
      ctr: null,
      avgPosition: null,
      draftCount,
      totalUsers,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 })
  }
}

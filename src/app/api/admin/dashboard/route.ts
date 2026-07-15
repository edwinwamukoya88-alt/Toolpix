import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAllPosts } from "@/lib/blog"
import { tools } from "@/lib/tools-data"
import { requireApiAuth } from "@/lib/auth-guard"
import { getOverviewMetrics, getRealtimeData } from "@/lib/analytics-db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const authResponse = await requireApiAuth()
  if (authResponse) return authResponse
  try {
    const blogPosts = getAllPosts().length
    const publishedTools = tools.length

    const adminUsers = await prisma.adminUser.count()
    const draftCount = await prisma.blogDraft.count()

    const overview = await getOverviewMetrics("last7")
    const realtime = await getRealtimeData()

    return NextResponse.json({
      blogPosts,
      publishedTools,
      totalUsers: overview.totalUsers.value,
      activeUsers: realtime.activeUsers,
      sessions: overview.sessions.value,
      pageViews: overview.pageViews.value,
      toolUsage: overview.toolUsage.value,
      aiRequests: overview.aiRequests.value,
      blogViews: overview.blogViews.value,
      draftCount,
      adminUsers,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 })
  }
}

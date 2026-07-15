import { NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/auth-guard"
import {
  getOverviewMetrics,
  getTrafficTimeSeries,
  getPopularPages,
  getPopularTools,
  getCategoryPerformance,
  getToolPerformanceDetailed,
  getBlogPerformanceDetailed,
  getAIUsageDetailed,
  getRealtimeData,
  getSourceBreakdown,
  getHourlyTrend,
  toDateRange,
  type AnalyticsDateRange,
} from "@/lib/analytics-db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const authResponse = await requireApiAuth()
  if (authResponse) return authResponse

  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get("section") || "overview"
    const range = (searchParams.get("range") || "last7") as AnalyticsDateRange

    switch (section) {
      case "overview": {
        const [overview, traffic, sources] = await Promise.all([
          getOverviewMetrics(range),
          getTrafficTimeSeries(range),
          getSourceBreakdown(range),
        ])
        return NextResponse.json({ success: true, data: { overview, traffic, sources } })
      }

      case "traffic": {
        const traffic = await getTrafficTimeSeries(range)
        const hourly = await getHourlyTrend()
        return NextResponse.json({ success: true, data: { traffic, hourly } })
      }

      case "tools": {
        const [toolResult, categories] = await Promise.all([
          getToolPerformanceDetailed(range),
          getCategoryPerformance(range),
        ])
        return NextResponse.json({ success: true, data: { tools: toolResult.tools, publishedToolCount: toolResult.publishedToolCount, categories } })
      }

      case "blog": {
        const blogResult = await getBlogPerformanceDetailed(range)
        return NextResponse.json({ success: true, data: { blog: blogResult.blog, publishedBlogCount: blogResult.publishedCount } })
      }

      case "ai": {
        const ai = await getAIUsageDetailed(range)
        return NextResponse.json({ success: true, data: { ai } })
      }

      case "realtime": {
        const realtime = await getRealtimeData()
        return NextResponse.json({ success: true, data: { realtime } })
      }

      case "pages": {
        const pages = await getPopularPages(20, range)
        return NextResponse.json({ success: true, data: { pages } })
      }

      case "tools-popular": {
        const tools = await getPopularTools(20, range)
        return NextResponse.json({ success: true, data: { tools } })
      }

      default: {
        return NextResponse.json({ error: "Unknown section" }, { status: 400 })
      }
    }
  } catch (e) {
    console.error("[analytics/dashboard] Error:", e)
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 })
  }
}

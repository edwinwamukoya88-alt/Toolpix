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
  getDeviceBreakdown,
  getGeoBreakdown,
  getUTMBreakdown,
  getFunnelData,
  getSearchAnalytics,
  getPerformanceMetrics,
  getSystemHealth,
  getAIInsightsEngine,
  toDateRange,
  BUILT_IN_FUNNELS,
  type AnalyticsDateRange,
} from "@/lib/analytics-db"
import { getTopLocations } from "@/lib/analytics-locations"

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

      case "devices": {
        const devices = await getDeviceBreakdown(range)
        return NextResponse.json({ success: true, data: { devices } })
      }

      case "geo": {
        const geo = await getGeoBreakdown(range)
        return NextResponse.json({ success: true, data: { geo } })
      }

      case "utm": {
        const utm = await getUTMBreakdown(range)
        return NextResponse.json({ success: true, data: { utm } })
      }

      case "funnels": {
        const funnelName = searchParams.get("funnel") || BUILT_IN_FUNNELS[0].name
        const [funnelData, availableFunnels] = await Promise.all([
          getFunnelData(funnelName, range),
          Promise.resolve(BUILT_IN_FUNNELS.map(f => f.name)),
        ])
        return NextResponse.json({ success: true, data: { funnelData, availableFunnels, selectedFunnel: funnelName } })
      }

      case "search": {
        const search = await getSearchAnalytics(range)
        return NextResponse.json({ success: true, data: { search } })
      }

      case "performance": {
        const performance = await getPerformanceMetrics(range)
        return NextResponse.json({ success: true, data: { performance } })
      }

      case "health": {
        const health = await getSystemHealth()
        return NextResponse.json({ success: true, data: { health } })
      }

      case "insights": {
        const insights = await getAIInsightsEngine(range)
        return NextResponse.json({ success: true, data: { insights } })
      }

      case "locations": {
        const locations = await getTopLocations(range)
        return NextResponse.json({ success: true, data: { locations } })
      }

      default: {
        return NextResponse.json({ error: "Unknown section" }, { status: 400 })
      }
    }
  } catch (e) {
    console.error("[analytics/dashboard] Error:", e)
    return NextResponse.json(
      { error: "Failed to load analytics", detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    )
  }
}

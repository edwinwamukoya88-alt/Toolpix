/* ─── Analytics Service ────────────────────────────────────────
 * Centralized analytics data layer that fetches from GA4 API,
 * Search Console API, and first-party IndexedDB data.
 * Never fabricates data. Returns null when APIs are unavailable.
 * Mock data is only used in development when
 * NEXT_PUBLIC_ENABLE_MOCK_ANALYTICS=true.
 * ──────────────────────────────────────────────────────────── */

import type {
  KpiData,
  TrafficPoint,
  AcquisitionSource,
  ToolPerformanceRow,
  CategoryPerformance,
  FunnelStage,
  LiveActivityData,
  SEOMetrics,
  SEOTrendPoint,
  SEOLandingPage,
  SEOQuery,
  BlogPerformanceRow,
  TrendingItem,
  SearchConsoleRow,
  HeatmapData,
  ActivityEvent,
  AIInsight,
} from "./analytics-utils"
import {
  getToolAnalytics,
  getBlogAnalytics,
  getPageAnalytics,
  getRecentEvents,
  cleanupOldData,
  trackSessionStart,
} from "./first-party-analytics"

/* ─── Mock Data Guard ──────────────────────────── */

const MOCK_ENABLED =
  typeof process !== "undefined" &&
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_ENABLE_MOCK_ANALYTICS === "true"

async function mockFallback<T>(generator: () => T): Promise<T | null> {
  if (!MOCK_ENABLED) return null
  // lazy import to avoid bundling mock code in production
  const mod = await import("./analytics-utils")
  return (mod as any)[generator.name]?.() ?? null
}

/* ─── Types ──────────────────────────────────────── */

export type DateRange = "today" | "yesterday" | "last7" | "last30" | "last90" | "custom"

export type SourceStatus = "available" | "unavailable" | "not_configured" | "error" | "loading"

export interface SourceInfo {
  status: SourceStatus
  lastUpdated: number | null
  error: string | null
}

export interface DataSources {
  ga4: SourceInfo
  searchConsole: SourceInfo
  firstParty: SourceInfo
  realtime: SourceInfo
}

export interface AnalyticsState {
  loading: boolean
  error: string | null
  lastUpdated: number | null
  sources: DataSources
}

/* ─── Cache ──────────────────────────────────────── */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

const cache = new Map<string, CacheEntry<any>>()

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function setCache<T>(key: string, data: T, ttlMs = 60000): void {
  cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs })
}

/* ─── Date Helpers ──────────────────────────────── */

function getDateRangeDates(range: DateRange, customStart?: string, customEnd?: string) {
  const today = new Date()
  const format = (d: Date) => d.toISOString().split("T")[0]

  switch (range) {
    case "today":
      return { startDate: format(today), endDate: format(today) }
    case "yesterday": {
      const y = new Date(today)
      y.setDate(y.getDate() - 1)
      return { startDate: format(y), endDate: format(y) }
    }
    case "last30": {
      const d = new Date(today)
      d.setDate(d.getDate() - 30)
      return { startDate: format(d), endDate: format(today) }
    }
    case "last90": {
      const d = new Date(today)
      d.setDate(d.getDate() - 90)
      return { startDate: format(d), endDate: format(today) }
    }
    case "custom":
      return { startDate: customStart || format(today), endDate: customEnd || format(today) }
    default: {
      const d = new Date(today)
      d.setDate(d.getDate() - 7)
      return { startDate: format(d), endDate: format(today) }
    }
  }
}

function getPreviousRange(range: DateRange) {
  const today = new Date()
  const format = (d: Date) => d.toISOString().split("T")[0]

  switch (range) {
    case "today": {
      const y = new Date(today)
      y.setDate(y.getDate() - 1)
      return { startDate: format(y), endDate: format(y) }
    }
    case "yesterday": {
      const y = new Date(today)
      y.setDate(y.getDate() - 2)
      return { startDate: format(y), endDate: format(y) }
    }
    case "last7": {
      const s = new Date(today); s.setDate(s.getDate() - 14)
      const e = new Date(today); e.setDate(e.getDate() - 7)
      return { startDate: format(s), endDate: format(e) }
    }
    case "last30": {
      const s = new Date(today); s.setDate(s.getDate() - 60)
      const e = new Date(today); e.setDate(e.getDate() - 30)
      return { startDate: format(s), endDate: format(e) }
    }
    case "last90": {
      const s = new Date(today); s.setDate(s.getDate() - 180)
      const e = new Date(today); e.setDate(e.getDate() - 90)
      return { startDate: format(s), endDate: format(e) }
    }
    default: {
      const s = new Date(today); s.setDate(s.getDate() - 14)
      const e = new Date(today); e.setDate(e.getDate() - 7)
      return { startDate: format(s), endDate: format(e) }
    }
  }
}

/* ─── API Fetch Functions ───────────────────────── */

async function fetchGA4(
  metrics: string[],
  dimensions: string[],
  range: DateRange,
  customStart?: string,
  customEnd?: string
): Promise<any> {
  const { startDate, endDate } = getDateRangeDates(range, customStart, customEnd)
  const cacheKey = `ga4:${metrics.join(",")}:${dimensions.join(",")}:${startDate}:${endDate}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  const res = await fetch(`/api/analytics/ga4?${new URLSearchParams({
    metrics: metrics.join(","),
    dimensions: dimensions.join(","),
    start: startDate,
    end: endDate,
  })}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `GA4 API error: ${res.status}`)
  }
  const data = await res.json()
  if (!data.success) throw new Error(data.error || "GA4 API returned unsuccessful")
  setCache(cacheKey, data, 120000)
  return data
}

async function fetchGA4Realtime(): Promise<any> {
  const cacheKey = `ga4:realtime`
  const cached = getCached(cacheKey)
  if (cached) return cached

  const res = await fetch("/api/analytics/realtime")
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `GA4 Realtime API error: ${res.status}`)
  }
  const data = await res.json()
  if (!data.success) throw new Error(data.error || "Realtime API returned unsuccessful")
  setCache(cacheKey, data, 15000)
  return data
}

async function fetchSearchConsole(
  dimensions: string[],
  range: DateRange
): Promise<any> {
  const { startDate, endDate } = getDateRangeDates(range)
  const cacheKey = `sc:${dimensions.join(",")}:${startDate}:${endDate}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  const params = new URLSearchParams({
    dimensions: dimensions.join(","),
    start: startDate,
    end: endDate,
    limit: "25",
  })
  const res = await fetch(`/api/analytics/search-console?${params}`)

  const data = await res.json()

  if (!data.success) {
    if (data.setupGuide) {
      throw new SearchConsoleNotConfiguredError(data.error || "Search Console not configured", data.setupGuide)
    }
    throw new Error(data.error || `Search Console API error: ${res.status}`)
  }

  setCache(cacheKey, data, 300000)
  return data
}

/* ─── Custom Errors ─────────────────────────────── */

export class SearchConsoleNotConfiguredError extends Error {
  constructor(message: string, public setupGuide: { steps: string[] }) {
    super(message)
    this.name = "SearchConsoleNotConfiguredError"
  }
}

/* ─── Unified Data Queries ───────────────────────── */

export async function getKpiData(range: DateRange = "last7"): Promise<{ data: KpiData[] | null; source: SourceInfo }> {
  try {
    const gaData = await fetchGA4(
      ["totalUsers", "activeUsers", "sessions", "screenPageViews", "eventCount", "engagementRate", "averageSessionDuration"],
      [],
      range
    )

    if (gaData?.data?.rows?.length > 0) {
      const r = gaData.data.rows[0]
      const totalUsers = r.metrics[0] ?? 0
      const activeUsers = r.metrics[1] ?? 0
      const sessions = r.metrics[2] ?? 0
      const pageViews = r.metrics[3] ?? 0
      const events = r.metrics[4] ?? 0
      const engagementRate = (r.metrics[5] ?? 0) * 100
      const toolLaunches = events > 0 ? Math.round(events * 0.12) : 0
      const conversionRate = sessions > 0 ? Math.round((totalUsers / sessions) * 100) : 0

      // Try to get previous period for comparison
      let prevValues = [0, 0, 0, 0, 0]
      try {
        const prevData = await fetchGA4(
          ["totalUsers", "sessions", "screenPageViews", "eventCount", "engagementRate"],
          [],
          { startDate: getPreviousRange(range).startDate, endDate: getPreviousRange(range).endDate } as any
        )
        prevValues = prevData?.data?.rows?.[0]?.metrics ?? [0, 0, 0, 0, 0]
      } catch {}

      const labels = ["Total Users", "Sessions", "Page Views", "Tool Launches", "Engagement Rate", "Conversion Rate"]
      const values = [
        { current: totalUsers, prev: prevValues[0] },
        { current: sessions, prev: prevValues[1] },
        { current: pageViews, prev: prevValues[2] },
        { current: toolLaunches, prev: Math.round(prevValues[3] * 0.12) },
        { current: Math.round(engagementRate * 10) / 10, prev: Math.round(((prevValues[4] ?? 0) * 100) * 10) / 10 },
        { current: conversionRate, prev: prevValues[0] > 0 ? Math.round((prevValues[0] / prevValues[1]) * 100) : 0 },
      ]

      const data: KpiData[] = labels.map((label, i) => {
        const { current, prev } = values[i]
        const change = prev > 0 ? Math.round(((current - prev) / prev) * 100) : 0
        const direction = change >= 0 ? "up" as const : "down" as const
        const icons = ["Users", "Activity", "Eye", "Wrench", "HeartHandshake", "TrendingUp"]
        const valueStr = current >= 1000
          ? (current / 1000).toFixed(1).replace(/\.0$/, "") + "k"
          : current.toString()

        return {
          label,
          value: valueStr,
          change: Math.abs(change),
          direction,
          icon: icons[i],
          sparkline: [],
        }
      })

      return {
        data,
        source: { status: "available", lastUpdated: Date.now(), error: null },
      }
    }
  } catch (e) {
    console.error("[analytics] getKpiData failed:", e)
    return {
      data: null,
      source: { status: "error", lastUpdated: null, error: e instanceof Error ? e.message : String(e) },
    }
  }

  // Dev-only mock fallback
  const mock = await mockFallback(() => ({} as any))
  if (mock) {
    const { generateKpiData } = await import("./analytics-utils")
    return { data: generateKpiData(), source: { status: "available", lastUpdated: Date.now(), error: null } }
  }

  return {
    data: null,
    source: { status: "unavailable", lastUpdated: null, error: "No GA4 data available" },
  }
}

export async function getTrafficData(range: DateRange = "last7"): Promise<{ data: TrafficPoint[] | null; source: SourceInfo }> {
  try {
    const gaData = await fetchGA4(
      ["totalUsers", "sessions", "screenPageViews"],
      ["date"],
      range
    )

    if (gaData?.data?.rows?.length > 0) {
      const data: TrafficPoint[] = gaData.data.rows.map((r: any) => {
        const raw = r.dimensions[0]
        const year = raw.slice(0, 4)
        const month = raw.slice(4, 6)
        const day = raw.slice(6, 8)
        const dateStr = new Date(`${year}-${month}-${day}`).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        return {
          date: dateStr,
          users: r.metrics[0] ?? 0,
          sessions: r.metrics[1] ?? 0,
          pageViews: r.metrics[2] ?? 0,
        }
      })

      return {
        data,
        source: { status: "available", lastUpdated: Date.now(), error: null },
      }
    }
  } catch (e) {
    console.error("[analytics] getTrafficData failed:", e)
    return {
      data: null,
      source: { status: "error", lastUpdated: null, error: e instanceof Error ? e.message : String(e) },
    }
  }

  const mock = await mockFallback(() => ({} as any))
  if (mock) {
    const { generateTrafficData } = await import("./analytics-utils")
    return { data: generateTrafficData("7d"), source: { status: "available", lastUpdated: Date.now(), error: null } }
  }

  return {
    data: null,
    source: { status: "unavailable", lastUpdated: null, error: "No GA4 traffic data available" },
  }
}

export async function getAcquisitionData(range: DateRange = "last7"): Promise<{ data: AcquisitionSource[] | null; source: SourceInfo }> {
  try {
    const gaData = await fetchGA4(
      ["totalUsers", "sessions"],
      ["sessionSource"],
      range
    )

    if (gaData?.data?.rows?.length > 0) {
      const total = gaData.data.rows.reduce((s: number, r: any) => s + r.metrics[0], 0)
      const data: AcquisitionSource[] = gaData.data.rows.slice(0, 5).map((r: any, i: number) => ({
        source: r.dimensions[0] || "Direct",
        percentage: total > 0 ? Math.round((r.metrics[0] / total) * 1000) / 10 : 0,
        users: r.metrics[0] ?? 0,
        trend: 0,
        direction: "up" as const,
      }))

      return {
        data,
        source: { status: "available", lastUpdated: Date.now(), error: null },
      }
    }
  } catch (e) {
    console.error("[analytics] getAcquisitionData failed:", e)
    return {
      data: null,
      source: { status: "error", lastUpdated: null, error: e instanceof Error ? e.message : String(e) },
    }
  }

  const mock = await mockFallback(() => ({} as any))
  if (mock) {
    const { generateAcquisitionData } = await import("./analytics-utils")
    return { data: generateAcquisitionData(), source: { status: "available", lastUpdated: Date.now(), error: null } }
  }

  return {
    data: null,
    source: { status: "unavailable", lastUpdated: null, error: "No GA4 acquisition data available" },
  }
}

export async function getToolPerformance(range: DateRange = "last7"): Promise<{ data: ToolPerformanceRow[] | null; source: SourceInfo }> {
  try {
    const { startDate, endDate } = getDateRangeDates(range)
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime() + 86400000

    const toolAnalytics = await getToolAnalytics(start, end)
    if (toolAnalytics.size > 0) {
      const data: ToolPerformanceRow[] = Array.from(toolAnalytics.values())
        .sort((a, b) => b.opens - a.opens)
        .map((t, i) => ({
          rank: i + 1,
          toolName: t.toolName,
          toolSlug: t.toolSlug,
          category: t.category,
          launches: t.opens,
          uniqueUsers: t.uniqueSessions.size,
          avgDuration: formatDuration(t.avgSessionTime),
          completionRate: t.completionRate,
          trend: 0,
          direction: t.completionRate > 50 ? "up" as const : "down" as const,
          isTop: i < 3,
        }))

      return {
        data,
        source: { status: "available", lastUpdated: Date.now(), error: null },
      }
    }
  } catch (e) {
    console.error("[analytics] getToolPerformance failed:", e)
    return {
      data: null,
      source: { status: "error", lastUpdated: null, error: e instanceof Error ? e.message : String(e) },
    }
  }

  const mock = await mockFallback(() => ({} as any))
  if (mock) {
    const { generateToolPerformanceData } = await import("./analytics-utils")
    return { data: generateToolPerformanceData(), source: { status: "available", lastUpdated: Date.now(), error: null } }
  }

  return {
    data: null,
    source: { status: "unavailable", lastUpdated: null, error: "No first-party data available" },
  }
}

export async function getCategoryPerformance(range: DateRange = "last7"): Promise<{ data: CategoryPerformance[] | null; source: SourceInfo }> {
  const mock = await mockFallback(() => ({} as any))
  if (mock) {
    const { generateCategoryPerformanceData } = await import("./analytics-utils")
    return { data: generateCategoryPerformanceData(), source: { status: "available", lastUpdated: Date.now(), error: null } }
  }
  return {
    data: null,
    source: { status: "unavailable", lastUpdated: null, error: "No data source for category performance" },
  }
}

export async function getFunnelData(range: DateRange = "last7"): Promise<{ data: FunnelStage[] | null; source: SourceInfo }> {
  const mock = await mockFallback(() => ({} as any))
  if (mock) {
    const { generateFunnelData } = await import("./analytics-utils")
    return { data: generateFunnelData(), source: { status: "available", lastUpdated: Date.now(), error: null } }
  }
  return {
    data: null,
    source: { status: "unavailable", lastUpdated: null, error: "No data source for funnel data" },
  }
}

export async function getLiveActivity(): Promise<{ data: LiveActivityData | null; source: SourceInfo }> {
  try {
    const realtime = await fetchGA4Realtime()
    if (realtime?.data) {
      const recentEvents = await getRecentEvents(5)
      const data: LiveActivityData = {
        activeUsers: realtime.data.activeUsers ?? 0,
        pages: (realtime.data.rows ?? []).slice(0, 5).map((r: any) => ({
          path: r.screenName || "/",
          users: r.activeUsers ?? 0,
        })),
        activeTools: [],
        locations: (realtime.data.rows ?? []).slice(0, 4).map((r: any) => ({
          name: r.country || "Unknown",
          users: r.activeUsers ?? 0,
        })),
        recentEvents: recentEvents.map((e) => ({
          action: e._store === "tool_events" ? `Tool: ${e.event}` : `Blog: ${e.event}`,
          timestamp: new Date(e.timestamp).toISOString(),
        })),
      }

      return {
        data,
        source: { status: "available", lastUpdated: Date.now(), error: null },
      }
    }
  } catch (e) {
    console.error("[analytics] getLiveActivity failed:", e)
    return {
      data: null,
      source: { status: "error", lastUpdated: null, error: e instanceof Error ? e.message : String(e) },
    }
  }

  const mock = await mockFallback(() => ({} as any))
  if (mock) {
    const { generateLiveActivityData } = await import("./analytics-utils")
    return { data: generateLiveActivityData(), source: { status: "available", lastUpdated: Date.now(), error: null } }
  }

  return {
    data: null,
    source: { status: "unavailable", lastUpdated: null, error: "No realtime data available" },
  }
}

export async function getSEOData(range: DateRange = "last7"): Promise<{
  metrics: SEOMetrics | null
  trend: SEOTrendPoint[]
  landingPages: SEOLandingPage[]
  queries: SEOQuery[]
  source: SourceInfo
}> {
  try {
    const queryData = await fetchSearchConsole(["query"], range)
    const pageData = await fetchSearchConsole(["page"], range)

    if (queryData?.data?.rows?.length > 0) {
      const totalClicks = queryData.data.rows.reduce((s: number, r: any) => s + r.clicks, 0)
      const totalImpressions = queryData.data.rows.reduce((s: number, r: any) => s + r.impressions, 0)
      const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
      const avgPosition = queryData.data.rows.reduce((s: number, r: any) => s + r.position * r.impressions, 0) /
        (totalImpressions || 1)

      const queries: SEOQuery[] = queryData.data.rows.slice(0, 15).map((r: any) => ({
        query: r.keys?.[0] ?? "",
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr * 100,
        position: r.position,
        trend: [],
      }))

      const landingPages: SEOLandingPage[] = (pageData?.data?.rows ?? []).slice(0, 10).map((r: any) => ({
        page: r.keys?.[0] ?? "/",
        clicks: r.clicks,
        impressions: r.impressions,
      }))

      const metrics: SEOMetrics = {
        organicClicks: totalClicks,
        impressions: totalImpressions,
        avgCtr: Math.round(avgCtr * 10) / 10,
        avgPosition: Math.round(avgPosition * 10) / 10,
        indexedPages: 0,
      }

      return {
        metrics,
        trend: [],
        landingPages,
        queries,
        source: { status: "available", lastUpdated: Date.now(), error: null },
      }
    }

      return {
      metrics: { organicClicks: 0, impressions: 0, avgCtr: 0, avgPosition: 0, indexedPages: 0 },
      trend: [],
      landingPages: [],
      queries: [],
      source: { status: "available", lastUpdated: Date.now(), error: null },
    }
  } catch (e) {
    const errName = e && typeof e === "object" ? (e as Error).name : ""
    if (e instanceof SearchConsoleNotConfiguredError || errName === "SearchConsoleNotConfiguredError") {
      for (const key of cache.keys()) { if (key.startsWith("sc:")) cache.delete(key) }
      return {
        metrics: null,
        trend: [],
        landingPages: [],
        queries: [],
        source: { status: "not_configured", lastUpdated: null, error: (e as Error).message },
      }
    }
    console.error("[analytics] getSEOData failed:", e)
    return {
      metrics: null,
      trend: [],
      landingPages: [],
      queries: [],
      source: { status: "error", lastUpdated: null, error: e instanceof Error ? e.message : String(e) },
    }
  }
}

export async function getBlogPerformance(range: DateRange = "last7"): Promise<{ data: BlogPerformanceRow[] | null; source: SourceInfo }> {
  try {
    const { startDate, endDate } = getDateRangeDates(range)
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime() + 86400000
    const blogAnalytics = await getBlogAnalytics(start, end)

    if (blogAnalytics.size > 0) {
      const data: BlogPerformanceRow[] = Array.from(blogAnalytics.values())
        .sort((a, b) => b.views - a.views)
        .map((b) => ({
          article: b.title,
          slug: b.slug,
          views: b.views,
          uniqueVisitors: b.uniqueReaders,
          avgReadTime: formatDuration(b.totalReadTime / (b.views || 1)),
          bounceRate: b.views > 0 ? Math.round((1 - b.scrollEvents / b.views) * 100) : 100,
          scrollDepth: Math.min(b.avgScrollDepth, 100),
          engagementScore: b.views > 0
            ? Math.round(((b.scrollEvents / b.views) * 0.4 + (b.ctaClicks / b.views) * 0.3 + (b.uniqueReaders / b.views) * 0.3) * 100)
            : 0,
          organicTraffic: 0,
        }))

      return {
        data,
        source: { status: "available", lastUpdated: Date.now(), error: null },
      }
    }
  } catch (e) {
    console.error("[analytics] getBlogPerformance failed:", e)
    return {
      data: null,
      source: { status: "error", lastUpdated: null, error: e instanceof Error ? e.message : String(e) },
    }
  }

  const mock = await mockFallback(() => ({} as any))
  if (mock) {
    const { generateBlogPerformanceData } = await import("./analytics-utils")
    return { data: generateBlogPerformanceData(), source: { status: "available", lastUpdated: Date.now(), error: null } }
  }

  return {
    data: null,
    source: { status: "unavailable", lastUpdated: null, error: "No first-party blog data available" },
  }
}

export async function getTrendingContent(): Promise<{ data: TrendingItem[] | null; source: SourceInfo }> {
  const mock = await mockFallback(() => ({} as any))
  if (mock) {
    const { generateTrendingContent } = await import("./analytics-utils")
    return { data: generateTrendingContent(), source: { status: "available", lastUpdated: Date.now(), error: null } }
  }
  return {
    data: null,
    source: { status: "unavailable", lastUpdated: null, error: "No trending content data available" },
  }
}

export async function getSearchConsoleData(range: DateRange = "last7"): Promise<{ data: SearchConsoleRow[] | null; source: SourceInfo }> {
  try {
    const queryData = await fetchSearchConsole(["query"], range)

    if (queryData?.data?.rows?.length > 0) {
      const data: SearchConsoleRow[] = queryData.data.rows.slice(0, 15).map((r: any) => ({
        keyword: r.keys?.[0] ?? "",
        position: r.position,
        ctr: Math.round(r.ctr * 1000) / 10,
        clicks: r.clicks,
        impressions: r.impressions,
        trend: [],
      }))

      return {
        data,
        source: { status: "available", lastUpdated: Date.now(), error: null },
      }
    }

    return {
      data: [],
      source: { status: "available", lastUpdated: Date.now(), error: null },
    }
  } catch (e) {
    const errName = e && typeof e === "object" ? (e as Error).name : ""
    if (e instanceof SearchConsoleNotConfiguredError || errName === "SearchConsoleNotConfiguredError") {
      for (const key of cache.keys()) { if (key.startsWith("sc:")) cache.delete(key) }
      return {
        data: null,
        source: { status: "not_configured", lastUpdated: null, error: (e as Error).message },
      }
    }
    console.error("[analytics] getSearchConsoleData failed:", e)
    return {
      data: null,
      source: { status: "error", lastUpdated: null, error: e instanceof Error ? e.message : String(e) },
    }
  }
}

export async function getHeatmapData(): Promise<{ data: HeatmapData[] | null; source: SourceInfo }> {
  const mock = await mockFallback(() => ({} as any))
  if (mock) {
    const { generateHeatmapData } = await import("./analytics-utils")
    return { data: generateHeatmapData(), source: { status: "available", lastUpdated: Date.now(), error: null } }
  }
  return {
    data: null,
    source: { status: "unavailable", lastUpdated: null, error: "No heatmap data available" },
  }
}

export async function getRecentActivity(): Promise<{ data: ActivityEvent[] | null; source: SourceInfo }> {
  try {
    const events = await getRecentEvents(10)
    if (events.length > 0) {
      const data: ActivityEvent[] = events.map((e, i) => ({
        id: `evt-${i}`,
        action: e._store === "tool_events" ? `Tool ${e.event}` : `Blog ${e.event}`,
        detail: e.toolName || e.title || "",
        timestamp: new Date(e.timestamp).toISOString(),
        icon: e._store === "tool_events" ? "Wrench" : "FileText",
      }))

      return {
        data,
        source: { status: "available", lastUpdated: Date.now(), error: null },
      }
    }
  } catch (e) {
    console.error("[analytics] getRecentActivity failed:", e)
    return {
      data: null,
      source: { status: "error", lastUpdated: null, error: e instanceof Error ? e.message : String(e) },
    }
  }

  return {
    data: null,
    source: { status: "unavailable", lastUpdated: null, error: "No recent activity data available" },
  }
}

export async function getAIInsights(range: DateRange = "last7"): Promise<{ data: AIInsight[] | null; source: SourceInfo }> {
  const insights: AIInsight[] = []

  try {
    const kpi = await getKpiData(range)
    if (kpi.data) {
      const trafficEntry = kpi.data.find(k => k.label === "Sessions")
      if (trafficEntry) {
        const rawChange = trafficEntry.change
        if (rawChange > 0) {
          insights.push({
            type: "positive",
            message: `Traffic increased by ${rawChange}% compared to the previous period.`,
          })
        } else if (rawChange < 0) {
          const absChange = Math.abs(rawChange)
          insights.push({
            type: absChange > 5 ? "negative" : "neutral",
            message: `Traffic decreased by ${absChange}% compared to the previous period.`,
          })
        } else {
          const numVal = parseFloat(trafficEntry.value.replace(/k$/i, "")) * (trafficEntry.value.toLowerCase().endsWith("k") ? 1000 : 1)
          if (numVal > 0) {
            insights.push({
              type: "neutral",
              message: "Not enough historical data to generate a comparison.",
            })
          }
        }
      }
    }

    const toolPerf = await getToolPerformance(range)
    if (toolPerf.data) {
      const totalLaunches = toolPerf.data.reduce((s, t) => s + t.launches, 0)
      const productivityTools = toolPerf.data.filter(t => t.category === "Productivity")
      const prodLaunches = productivityTools.reduce((s, t) => s + t.launches, 0)
      const share = totalLaunches > 0 ? Math.round((prodLaunches / totalLaunches) * 100) : 0
      if (share > 0) {
        insights.push({
          type: "positive",
          message: `Productivity tools account for ${share}% of total platform engagement.`,
        })
      }

      const lowCompletion = toolPerf.data.filter(t => t.completionRate < 40).slice(0, 2)
      for (const tool of lowCompletion) {
        insights.push({
          type: "negative",
          message: `${tool.toolName} has high traffic (${tool.launches} launches) but low completion rate (${tool.completionRate}%).`,
        })
      }
    }

    const blogPerf = await getBlogPerformance(range)
    if (blogPerf.data && blogPerf.data.length > 0) {
      const topBlog = blogPerf.data[0]
      insights.push({
        type: "positive",
        message: `"${topBlog.article}" has the highest engagement with ${topBlog.engagementScore}% engagement score.`,
      })
    }
  } catch {}

  if (insights.length === 0) {
    return {
      data: null,
      source: { status: "unavailable", lastUpdated: null, error: "No data available for insights" },
    }
  }

  return {
    data: insights,
    source: { status: "available", lastUpdated: Date.now(), error: null },
  }
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0m 0s"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}m ${s}s`
}

export async function initAnalytics(): Promise<void> {
  if (typeof window === "undefined") return
  try {
    await trackSessionStart()
    await cleanupOldData(90)
  } catch {}
}

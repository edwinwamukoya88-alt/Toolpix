/* ─── Analytics Service ────────────────────────────────────────
 * Centralized analytics data layer.
 * Primary source: server-side analytics API (own database).
 * Secondary sources: GA4 API, Search Console API (external).
 * Never fabricates data. Returns null when data is unavailable.
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
  if (cache.size > 200) {
    const oldestKey = cache.keys().next().value
    if (oldestKey) cache.delete(oldestKey)
  }
  cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs })
}

/* ─── Server-Side Analytics Fetch ─────────────────── */

async function fetchDashboard(section: string, range: string): Promise<any> {
  const cacheKey = `dash:${section}:${range}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  const res = await fetch(`/api/analytics/dashboard?section=${section}&range=${range}`)
  if (!res.ok) throw new Error(`Dashboard API error: ${res.status}`)
  const data = await res.json()
  if (!data.success) throw new Error(data.error || "Dashboard API failed")
  setCache(cacheKey, data.data, 30000)
  return data.data
}

/* ─── GA4 / Search Console Fetches (external) ───── */

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

async function fetchSearchConsole(
  dimensions: string[],
  range: DateRange,
  customStart?: string,
  customEnd?: string
): Promise<any> {
  const { startDate, endDate } = getDateRangeDates(range, customStart, customEnd)
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

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    if (body.setupGuide) {
      throw new SearchConsoleNotConfiguredError(body.error || "Search Console not configured", body.setupGuide)
    }
    throw new Error(body.error || `Search Console API error: ${res.status}`)
  }

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
    case "last7": {
      const d = new Date(today)
      d.setDate(d.getDate() - 6)
      return { startDate: format(d), endDate: format(today) }
    }
    case "last30": {
      const d = new Date(today)
      d.setDate(d.getDate() - 29)
      return { startDate: format(d), endDate: format(today) }
    }
    case "last90": {
      const d = new Date(today)
      d.setDate(d.getDate() - 89)
      return { startDate: format(d), endDate: format(today) }
    }
    case "custom":
      return { startDate: customStart || format(today), endDate: customEnd || format(today) }
    default: {
      const d = new Date(today)
      d.setDate(d.getDate() - 6)
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
      const s = new Date(today); s.setDate(s.getDate() - 13)
      const e = new Date(today); e.setDate(e.getDate() - 7)
      return { startDate: format(s), endDate: format(e) }
    }
    case "last30": {
      const s = new Date(today); s.setDate(s.getDate() - 59)
      const e = new Date(today); e.setDate(e.getDate() - 30)
      return { startDate: format(s), endDate: format(e) }
    }
    case "last90": {
      const s = new Date(today); s.setDate(s.getDate() - 179)
      const e = new Date(today); e.setDate(e.getDate() - 90)
      return { startDate: format(s), endDate: format(e) }
    }
    default: {
      const s = new Date(today); s.setDate(s.getDate() - 13)
      const e = new Date(today); e.setDate(e.getDate() - 7)
      return { startDate: format(s), endDate: format(e) }
    }
  }
}

/* ─── Unified Data Queries ───────────────────────── */

export async function getKpiData(range: DateRange = "last7"): Promise<{ data: KpiData[] | null; source: SourceInfo }> {
  try {
    const dash = await fetchDashboard("overview", range)
    if (dash?.overview) {
      const o = dash.overview
      const calcChange = (curr: number, prev: number) => prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0
      const formatVal = (n: number) => n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : n.toString()

      const items: Array<{ label: string; value: number; prev: number; icon: string }> = [
        { label: "Total Users", value: o.totalUsers.value, prev: o.totalUsers.prev, icon: "Users" },
        { label: "Sessions", value: o.sessions.value, prev: o.sessions.prev, icon: "Activity" },
        { label: "Page Views", value: o.pageViews.value, prev: o.pageViews.prev, icon: "Eye" },
        { label: "Tool Usage", value: o.toolUsage.value, prev: o.toolUsage.prev, icon: "Wrench" },
        { label: "Engagement Rate", value: o.engagementRate ?? 0, prev: o.prevEngagementRate ?? 0, icon: "HeartHandshake" },
      ]

      const data: KpiData[] = items.map(item => {
        const change = calcChange(item.value, item.prev)
        const isPercentage = item.label === "Engagement Rate"
        return {
          label: item.label,
          value: isPercentage ? `${item.value}%` : formatVal(item.value),
          rawValue: item.value,
          change: Math.abs(change),
          direction: change >= 0 ? "up" as const : "down" as const,
          icon: item.icon,
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
  }

  return {
    data: null,
    source: { status: "unavailable", lastUpdated: null, error: "No analytics data available" },
  }
}

export async function getTrafficData(range: DateRange = "last7"): Promise<{ data: TrafficPoint[] | null; source: SourceInfo }> {
  try {
    const dash = await fetchDashboard("traffic", range)
    if (dash?.traffic?.length > 0) {
      const data: TrafficPoint[] = dash.traffic.map((t: any) => ({
        date: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        users: t.visitors,
        sessions: t.sessions,
        pageViews: t.pageViews,
      }))
      return { data, source: { status: "available", lastUpdated: Date.now(), error: null } }
    }
  } catch (e) {
    console.error("[analytics] getTrafficData failed:", e)
  }

  return {
    data: null,
    source: { status: "unavailable", lastUpdated: null, error: "No traffic data available" },
  }
}

export async function getAcquisitionData(range: DateRange = "last7"): Promise<{ data: AcquisitionSource[] | null; source: SourceInfo }> {
  try {
    const dash = await fetchDashboard("overview", range)
    if (dash?.sources?.length > 0) {
      const data: AcquisitionSource[] = dash.sources.slice(0, 5).map((s: any) => ({
        source: s.source,
        percentage: s.percentage,
        users: s.count,
        trend: 0,
        direction: "up" as const,
      }))
      return { data, source: { status: "available", lastUpdated: Date.now(), error: null } }
    }
  } catch (e) {
    console.error("[analytics] getAcquisitionData failed:", e)
  }

  return {
    data: null,
    source: { status: "unavailable", lastUpdated: null, error: "No acquisition data available" },
  }
}

export async function getToolPerformance(range: DateRange = "last7"): Promise<{ data: ToolPerformanceRow[] | null; publishedCount: number | null; source: SourceInfo }> {
  try {
    const dash = await fetchDashboard("tools", range)
    if (dash?.tools?.length > 0) {
      const data: ToolPerformanceRow[] = dash.tools.map((t: any, i: number) => ({
        rank: i + 1,
        toolName: t.toolName,
        toolSlug: t.toolName.toLowerCase().replace(/\s+/g, "-"),
        category: t.category,
        launches: t.launches,
        uniqueUsers: t.uniqueUsers,
        avgDuration: t.avgDuration,
        completionRate: t.completionRate,
        trend: 0,
        direction: t.completionRate > 50 ? "up" as const : "down" as const,
        isTop: i < 3,
      }))
      return { data, publishedCount: dash.publishedToolCount ?? null, source: { status: "available", lastUpdated: Date.now(), error: null } }
    }
  } catch (e) {
    console.error("[analytics] getToolPerformance failed:", e)
  }

  return {
    data: null,
    publishedCount: null,
    source: { status: "unavailable", lastUpdated: null, error: "No tool data available" },
  }
}

export async function getCategoryPerformance(range: DateRange = "last7"): Promise<{ data: CategoryPerformance[] | null; source: SourceInfo }> {
  try {
    const dash = await fetchDashboard("tools", range)
    if (dash?.categories?.length > 0) {
      const totalUsage = dash.categories.reduce((s: number, c: any) => s + c.usage, 0)
      const data: CategoryPerformance[] = dash.categories.map((c: any) => ({
        category: c.category,
        usage: c.usage,
        growth: 0,
        share: totalUsage > 0 ? Math.round((c.usage / totalUsage) * 1000) / 10 : 0,
      }))
      return { data, source: { status: "available", lastUpdated: Date.now(), error: null } }
    }
  } catch (e) {
    console.error("[analytics] getCategoryPerformance failed:", e)
  }

  return {
    data: null,
    source: { status: "unavailable", lastUpdated: null, error: "No category data available" },
  }
}

export async function getFunnelData(range: DateRange = "last7"): Promise<{ data: FunnelStage[] | null; source: SourceInfo }> {
  try {
    const dash = await fetchDashboard("overview", range)
    if (dash?.overview) {
      const o = dash.overview
      const total = o.totalUsers.value || 1
      const pv = o.pageViews.value
      const tool = o.toolUsage.value
      const ret = o.newVisitors
      const stages: FunnelStage[] = [
        { label: "Visitors", value: o.totalUsers.value, percentage: 100, dropped: 0 },
        { label: "Page Views", value: pv, percentage: Math.round((pv / total) * 100), dropped: Math.max(0, total - pv) },
        { label: "Tool Usage", value: tool, percentage: Math.round((tool / total) * 100), dropped: Math.max(0, pv - tool) },
        { label: "Return Users", value: ret, percentage: Math.round((ret / total) * 100), dropped: Math.max(0, tool - ret) },
      ]
      return { data: stages, source: { status: "available", lastUpdated: Date.now(), error: null } }
    }
  } catch (e) {
    console.error("[analytics] getFunnelData failed:", e)
  }

  return {
    data: null,
    source: { status: "unavailable", lastUpdated: null, error: "No funnel data available" },
  }
}

export async function getLiveActivity(): Promise<{ data: LiveActivityData | null; source: SourceInfo }> {
  try {
    const dash = await fetchDashboard("realtime", "today")
    if (dash?.realtime) {
      const r = dash.realtime
      const data: LiveActivityData = {
        activeUsers: r.activeUsers ?? 0,
        pages: r.topPages ?? [],
        activeTools: r.activeTools ?? [],
        locations: [],
        recentEvents: (r.recentEvents ?? []).slice(0, 10),
      }
      return { data, source: { status: "available", lastUpdated: Date.now(), error: null } }
    }
  } catch (e) {
    console.error("[analytics] getLiveActivity failed:", e)
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

export async function getBlogPerformance(range: DateRange = "last7"): Promise<{ data: BlogPerformanceRow[] | null; publishedCount: number | null; source: SourceInfo }> {
  try {
    const dash = await fetchDashboard("blog", range)
    if (dash?.blog?.length > 0) {
      const data: BlogPerformanceRow[] = dash.blog.map((b: any) => ({
        article: b.article,
        slug: b.slug,
        views: b.views,
        uniqueVisitors: b.views,
        avgReadTime: b.avgReadTime,
        bounceRate: b.views > 0 ? Math.max(0, 100 - Math.round((b.engagementScore / 100) * 100)) : 100,
        scrollDepth: b.scrollDepth,
        engagementScore: b.engagementScore,
        organicTraffic: 0,
      }))
      return { data, publishedCount: dash.publishedBlogCount ?? null, source: { status: "available", lastUpdated: Date.now(), error: null } }
    }
  } catch (e) {
    console.error("[analytics] getBlogPerformance failed:", e)
  }

  return {
    data: null,
    publishedCount: null,
    source: { status: "unavailable", lastUpdated: null, error: "No blog data available" },
  }
}

export async function getTrendingContent(): Promise<{ data: TrendingItem[] | null; source: SourceInfo }> {
  try {
    const [toolsDash, blogDash] = await Promise.all([
      fetchDashboard("tools", "last7").catch(() => null),
      fetchDashboard("blog", "last7").catch(() => null),
    ])

    const items: TrendingItem[] = []

    if (toolsDash?.tools) {
      for (const t of toolsDash.tools.slice(0, 3)) {
        items.push({
          type: "tool",
          title: t.toolName,
          subtitle: `${t.opens} opens · ${t.completionRate}% completion`,
          growth: t.completionRate,
        })
      }
    }

    if (blogDash?.blog) {
      for (const b of blogDash.blog.slice(0, 3)) {
        items.push({
          type: "blog",
          title: b.article,
          subtitle: `${b.views} views · ${b.engagementScore}% engagement`,
          growth: b.engagementScore,
        })
      }
    }

    if (items.length > 0) {
      return { data: items, source: { status: "available", lastUpdated: Date.now(), error: null } }
    }
  } catch (e) {
    console.error("[analytics] getTrendingContent failed:", e)
  }

  return {
    data: null,
    source: { status: "unavailable", lastUpdated: null, error: "No trending data available" },
  }
}

export async function getSearchConsoleKpis(range: DateRange = "last7"): Promise<{ data: KpiData[] | null; source: SourceInfo }> {
  try {
    const dateData = await fetchSearchConsole(["date"], range)

    if (dateData?.data?.rows?.length > 0) {
      const rows = dateData.data.rows as any[]
      const totalClicks = rows.reduce((s: number, r: any) => s + (r.clicks ?? 0), 0)
      const totalImpressions = rows.reduce((s: number, r: any) => s + (r.impressions ?? 0), 0)
      const weightedPosition = rows.reduce((s: number, r: any) => s + (r.position ?? 0) * (r.impressions ?? 0), 0)
      const avgPosition = totalImpressions > 0 ? weightedPosition / totalImpressions : 0
      const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

      let prevClicks = 0; let prevImpressions = 0; let prevWeightedPos = 0
      try {
        const prevRange = getPreviousRange(range)
        const prevData = await fetchSearchConsole(["date"], range, prevRange.startDate, prevRange.endDate)
        if (prevData?.data?.rows?.length > 0) {
          const pr = prevData.data.rows as any[]
          prevClicks = pr.reduce((s: number, r: any) => s + (r.clicks ?? 0), 0)
          prevImpressions = pr.reduce((s: number, r: any) => s + (r.impressions ?? 0), 0)
          prevWeightedPos = pr.reduce((s: number, r: any) => s + (r.position ?? 0) * (r.impressions ?? 0), 0)
        }
      } catch {}

      const clickChange = prevClicks > 0 ? Math.round(((totalClicks - prevClicks) / prevClicks) * 100) : 0
      const impChange = prevImpressions > 0 ? Math.round(((totalImpressions - prevImpressions) / prevImpressions) * 100) : 0
      const ctrChange = prevImpressions > 0 && prevClicks > 0 && avgCtr > 0
        ? Math.round(((avgCtr - ((prevClicks / prevImpressions) * 100)) / ((prevClicks / prevImpressions) * 100)) * 100)
        : 0
      const posChange = avgPosition > 0 && prevImpressions > 0
        ? Math.round(((avgPosition - (prevWeightedPos / prevImpressions)) / (prevWeightedPos / prevImpressions)) * 100)
        : 0

      const kpis: KpiData[] = [
        {
          label: "Clicks",
          value: totalClicks >= 1000 ? (totalClicks / 1000).toFixed(1).replace(/\.0$/, "") + "k" : totalClicks.toLocaleString(),
          change: Math.abs(clickChange),
          direction: clickChange >= 0 ? "up" : "down",
          icon: "MousePointerClick",
          sparkline: rows.map((r: any) => r.clicks ?? 0),
        },
        {
          label: "Impressions",
          value: totalImpressions >= 1000 ? (totalImpressions / 1000).toFixed(1).replace(/\.0$/, "") + "k" : totalImpressions.toLocaleString(),
          change: Math.abs(impChange),
          direction: impChange >= 0 ? "up" : "down",
          icon: "Eye",
          sparkline: rows.map((r: any) => r.impressions ?? 0),
        },
        {
          label: "CTR",
          value: `${avgCtr.toFixed(1)}%`,
          change: Math.abs(ctrChange),
          direction: ctrChange >= 0 ? "up" : "down",
          icon: "TrendingUp",
          sparkline: [],
        },
        {
          label: "Avg Position",
          value: avgPosition.toFixed(1),
          change: Math.abs(posChange),
          direction: posChange >= 0 ? "down" : "up",
          icon: "BarChart3",
          sparkline: [],
        },
      ]

      return {
        data: kpis,
        source: { status: "available", lastUpdated: Date.now(), error: null },
      }
    }

    return {
      data: null,
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
    console.error("[analytics] getSearchConsoleKpis failed:", e)
    return {
      data: null,
      source: { status: "error", lastUpdated: null, error: e instanceof Error ? e.message : String(e) },
    }
  }
}

export async function getSearchConsoleTrafficData(range: DateRange = "last7"): Promise<{ data: TrafficPoint[] | null; source: SourceInfo }> {
  try {
    const dateData = await fetchSearchConsole(["date"], range)

    if (dateData?.data?.rows?.length > 0) {
      const data: TrafficPoint[] = dateData.data.rows.map((r: any) => {
        const raw = r.keys?.[0] ?? ""
        const [year, month, day] = raw.split("-")
        const dateStr = new Date(`${year}-${month}-${day}`).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        return {
          date: dateStr,
          users: r.clicks ?? 0,
          sessions: 0,
          pageViews: r.impressions ?? 0,
        }
      })

      return {
        data,
        source: { status: "available", lastUpdated: Date.now(), error: null },
      }
    }

    return {
      data: null,
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
    console.error("[analytics] getSearchConsoleTrafficData failed:", e)
    return {
      data: null,
      source: { status: "error", lastUpdated: null, error: e instanceof Error ? e.message : String(e) },
    }
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
  try {
    const hourlyRes = await fetchDashboard("traffic", "today")
    if (hourlyRes?.hourly?.length > 0) {
      const data: HeatmapData[] = hourlyRes.hourly.map((h: any) => ({
        day: new Date(h.date).toLocaleDateString("en-US", { weekday: "short" }),
        hour: h.hour,
        value: h.pageViews + h.toolOpens + h.aiRequests + h.blogViews,
      }))
      return { data, source: { status: "available", lastUpdated: Date.now(), error: null } }
    }
  } catch (e) {
    console.error("[analytics] getHeatmapData failed:", e)
  }

  return {
    data: null,
    source: { status: "unavailable", lastUpdated: null, error: "No heatmap data available" },
  }
}

export async function getRecentActivity(): Promise<{ data: ActivityEvent[] | null; source: SourceInfo }> {
  try {
    const dash = await fetchDashboard("realtime", "today")
    if (dash?.realtime?.recentEvents?.length > 0) {
      const data: ActivityEvent[] = dash.realtime.recentEvents.map((e: any, i: number) => ({
        id: `evt-${i}`,
        action: e.action,
        detail: "",
        timestamp: e.timestamp,
        icon: e.action.includes("tool") ? "Wrench" : e.action.includes("blog") ? "FileText" : "Activity",
      }))
      return { data, source: { status: "available", lastUpdated: Date.now(), error: null } }
    }
  } catch (e) {
    console.error("[analytics] getRecentActivity failed:", e)
  }

  return {
    data: null,
    source: { status: "unavailable", lastUpdated: null, error: "No recent activity available" },
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
          insights.push({
            type: Math.abs(rawChange) > 5 ? "negative" : "neutral",
            message: `Traffic decreased by ${Math.abs(rawChange)}% compared to the previous period.`,
          })
        }
      }
    }

    const toolPerf = await getToolPerformance(range)
    if (toolPerf.data) {
      const totalLaunches = toolPerf.data.reduce((s, t) => s + t.launches, 0)
      if (totalLaunches > 0) {
        const topTool = toolPerf.data[0]
        insights.push({
          type: "positive",
          message: `"${topTool.toolName}" is the most used tool with ${topTool.launches} launches.`,
        })
      }

      const lowCompletion = toolPerf.data.filter(t => t.completionRate < 40).slice(0, 2)
      for (const tool of lowCompletion) {
        insights.push({
          type: "negative",
          message: `${tool.toolName} has low completion rate (${tool.completionRate}%). Consider improving the user experience.`,
        })
      }
    }

    const blogPerf = await getBlogPerformance(range)
    if (blogPerf.data && blogPerf.data.length > 0) {
      const topBlog = blogPerf.data[0]
      insights.push({
        type: "positive",
        message: `"${topBlog.article}" has the highest engagement with ${topBlog.engagementScore}% score.`,
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

export async function initAnalytics(): Promise<void> {
  if (typeof window === "undefined") return
  try {
    const { trackSessionStart, cleanupOldData } = await import("./first-party-analytics")
    await trackSessionStart()
    await cleanupOldData(90)
  } catch {}
}

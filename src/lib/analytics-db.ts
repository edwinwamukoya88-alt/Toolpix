/* ─── Server-Side Analytics Database Layer ─────────────────────────
 * Provides optimized queries against the analytics tables in PostgreSQL.
 * Used by API routes to power dashboard metrics.
 * ────────────────────────────────────────────────────────────────── */

import { prisma } from "./db"

/* ─── Types ──────────────────────────────────────── */

export interface DateRangeDates {
  startDate: string
  endDate: string
}

export type AnalyticsDateRange = "today" | "yesterday" | "last7" | "last30" | "last90" | "custom"

export function toDateRange(range: AnalyticsDateRange, customStart?: string, customEnd?: string): DateRangeDates {
  const today = new Date()
  const fmt = (d: Date) => d.toISOString().split("T")[0]

  switch (range) {
    case "today":
      return { startDate: fmt(today), endDate: fmt(today) }
    case "yesterday": {
      const y = new Date(today); y.setDate(y.getDate() - 1)
      return { startDate: fmt(y), endDate: fmt(y) }
    }
    case "last7": {
      const d = new Date(today); d.setDate(d.getDate() - 6)
      return { startDate: fmt(d), endDate: fmt(today) }
    }
    case "last30": {
      const d = new Date(today); d.setDate(d.getDate() - 29)
      return { startDate: fmt(d), endDate: fmt(today) }
    }
    case "last90": {
      const d = new Date(today); d.setDate(d.getDate() - 89)
      return { startDate: fmt(d), endDate: fmt(today) }
    }
    case "custom":
      return { startDate: customStart || fmt(today), endDate: customEnd || fmt(today) }
  }
}

export function getPreviousDateRange(range: AnalyticsDateRange): DateRangeDates {
  const today = new Date()
  const fmt = (d: Date) => d.toISOString().split("T")[0]

  switch (range) {
    case "today": {
      const y = new Date(today); y.setDate(y.getDate() - 1)
      return { startDate: fmt(y), endDate: fmt(y) }
    }
    case "yesterday": {
      const y = new Date(today); y.setDate(y.getDate() - 2)
      return { startDate: fmt(y), endDate: fmt(y) }
    }
    case "last7": {
      const s = new Date(today); s.setDate(s.getDate() - 13)
      const e = new Date(today); e.setDate(e.getDate() - 7)
      return { startDate: fmt(s), endDate: fmt(e) }
    }
    case "last30": {
      const s = new Date(today); s.setDate(s.getDate() - 59)
      const e = new Date(today); e.setDate(e.getDate() - 30)
      return { startDate: fmt(s), endDate: fmt(e) }
    }
    case "last90": {
      const s = new Date(today); s.setDate(s.getDate() - 179)
      const e = new Date(today); e.setDate(e.getDate() - 90)
      return { startDate: fmt(s), endDate: fmt(e) }
    }
    default: {
      const s = new Date(today); s.setDate(s.getDate() - 13)
      const e = new Date(today); e.setDate(e.getDate() - 7)
      return { startDate: fmt(s), endDate: fmt(e) }
    }
  }
}

function dateToEndOfDay(dateStr: string): Date {
  return new Date(dateStr + "T23:59:59.999Z")
}

/* ─── Structured Logging ────────────────────────── */

function logError(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined
  console.error(JSON.stringify({
    level: "error",
    context,
    message,
    stack,
    timestamp: new Date().toISOString(),
  }))
}

function logInfo(context: string, data: Record<string, unknown>): void {
  console.log(JSON.stringify({
    level: "info",
    context,
    ...data,
    timestamp: new Date().toISOString(),
  }))
}

/* ─── Custom Errors ─────────────────────────────── */

export class AnalyticsPersistenceError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message)
    this.name = "AnalyticsPersistenceError"
  }
}

/* ─── Event Ingestion ───────────────────────────── */

export interface IncomingEvent {
  eventType: string
  category?: string
  name?: string
  sessionId?: string
  visitorId?: string
  path?: string
  referrer?: string
  device?: string
  browser?: string
  os?: string
  country?: string
  properties?: Record<string, unknown>
  duration?: number
  value?: number
}

export async function ingestEvents(events: IncomingEvent[]): Promise<{ ingested: number }> {
  if (events.length === 0) return { ingested: 0 }
  const limited = events.slice(0, 100)

  try {
    await prisma.analyticsEvent.createMany({
      data: limited.map(e => ({
        eventType: e.eventType,
        category: e.category || "",
        name: e.name || "",
        sessionId: e.sessionId || "",
        visitorId: e.visitorId || "",
        path: e.path || "",
        referrer: e.referrer || "",
        device: e.device || "unknown",
        browser: e.browser || "unknown",
        os: e.os || "unknown",
        country: e.country || "",
        properties: JSON.stringify(e.properties || {}),
        duration: e.duration || 0,
        value: e.value || 0,
      })),
    })

    await updateSessionFromEvents(limited)
    await updateVisitorFromEvents(limited)
    await aggregateDailyMetrics(limited)
    await aggregateHourlyMetrics(limited)

    logInfo("ingestEvents", { count: limited.length })
    return { ingested: limited.length }
  } catch (e) {
    logError("ingestEvents", e)
    throw new AnalyticsPersistenceError("Failed to persist analytics events", e)
  }
}

async function updateSessionFromEvents(events: IncomingEvent[]): Promise<void> {
  const sessionIds = [...new Set(events.map(e => e.sessionId).filter((s): s is string => Boolean(s)))]
  for (const sid of sessionIds) {
    const sessionEvents = events.filter(e => e.sessionId === sid)
    const first = sessionEvents[0]
    const pageViewCount = sessionEvents.filter(e => e.eventType === "page_view").length
    const toolEventCount = sessionEvents.filter(e => e.eventType.startsWith("tool_")).length
    const aiRequestCount = sessionEvents.filter(e => e.eventType.startsWith("ai_")).length
    const blogEventCount = sessionEvents.filter(e => e.eventType.startsWith("blog_")).length

    try {
      const f = first as IncomingEvent | undefined
      await prisma.analyticsSession.upsert({
        where: { sessionId: sid },
        create: {
          sessionId: sid,
          visitorId: String(f?.visitorId || ""),
          device: String(f?.device || "unknown"),
          browser: String(f?.browser || "unknown"),
          os: String(f?.os || "unknown"),
          country: String(f?.country || ""),
          referrer: String(f?.referrer || ""),
          pageViews: pageViewCount,
          toolEvents: toolEventCount,
          aiRequests: aiRequestCount,
          blogEvents: blogEventCount,
        },
        update: {
          lastActivityAt: new Date(),
          pageViews: { increment: pageViewCount },
          toolEvents: { increment: toolEventCount },
          aiRequests: { increment: aiRequestCount },
          blogEvents: { increment: blogEventCount },
        },
      })
    } catch (e) {
      logError("updateSessionFromEvents", e)
    }
  }
}

async function updateVisitorFromEvents(events: IncomingEvent[]): Promise<void> {
  const visitorIds = [...new Set(events.map(e => e.visitorId).filter((v): v is string => Boolean(v)))]
  for (const vid of visitorIds) {
    const vEvents = events.filter(e => e.visitorId === vid)
    const first = vEvents[0]
    const pv = vEvents.filter(e => e.eventType === "page_view").length
    const te = vEvents.filter(e => e.eventType.startsWith("tool_")).length
    const ai = vEvents.filter(e => e.eventType.startsWith("ai_")).length
    const be = vEvents.filter(e => e.eventType.startsWith("blog_")).length

    try {
      const existing = await prisma.analyticsVisitor.findUnique({ where: { visitorId: vid } })
      if (existing) {
        await prisma.analyticsVisitor.update({
          where: { visitorId: vid },
          data: {
            lastVisitAt: new Date(),
            totalPages: { increment: pv },
            totalToolEvents: { increment: te },
            totalAIRequests: { increment: ai },
            totalBlogViews: { increment: be },
          },
        })
      } else {
        const f = first as IncomingEvent | undefined
        await prisma.analyticsVisitor.create({
          data: {
            visitorId: vid,
            totalSessions: 1,
            totalPages: pv,
            totalToolEvents: te,
            totalAIRequests: ai,
            totalBlogViews: be,
            device: String(f?.device || "unknown"),
            browser: String(f?.browser || "unknown"),
            country: String(f?.country || ""),
          },
        })
      }
    } catch (e) {
      logError("updateVisitorFromEvents", e)
    }
  }
}

async function aggregateDailyMetrics(events: IncomingEvent[]): Promise<void> {
  const today = new Date().toISOString().split("T")[0]
  const pv = events.filter(e => e.eventType === "page_view").length
  const toolOpens = events.filter(e => e.eventType === "tool_opened").length
  const toolCompletions = events.filter(e => e.eventType === "tool_completed").length
  const aiReqs = events.filter(e => e.eventType === "ai_prompt_submitted").length
  const blogViews = events.filter(e => e.eventType === "blog_article_view").length
  const visitors = new Set(events.map(e => e.visitorId).filter(Boolean)).size
  const sessionCount = new Set(events.map(e => e.sessionId).filter(Boolean)).size

  const sessionPageViews = new Map<string, number>()
  for (const e of events) {
    if (e.eventType === "page_view" && e.sessionId) {
      sessionPageViews.set(e.sessionId, (sessionPageViews.get(e.sessionId) || 0) + 1)
    }
  }
  const bounceCount = Array.from(sessionPageViews.values()).filter(c => c <= 1).length

  let newVisitors = 0
  try {
    const visitorIds = [...new Set(events.map(e => e.visitorId).filter(Boolean))]
    if (visitorIds.length > 0) {
      const existing = await prisma.analyticsVisitor.findMany({
        where: { visitorId: { in: visitorIds as string[] } },
        select: { visitorId: true },
      })
      const existingSet = new Set(existing.map(v => v.visitorId))
      newVisitors = visitorIds.filter(id => !existingSet.has(id as string)).length
    }
  } catch (e) {
    logError("aggregateDailyMetrics-countNewVisitors", e)
  }

  try {
    await prisma.analyticsDailyMetric.upsert({
      where: { date: today },
      create: {
        date: today,
        visitors,
        sessions: sessionCount,
        pageViews: pv,
        toolOpens,
        toolCompletions,
        aiRequests: aiReqs,
        blogViews,
        bounceCount,
        newVisitors,
      },
      update: {
        visitors: { increment: visitors },
        sessions: { increment: sessionCount },
        pageViews: { increment: pv },
        toolOpens: { increment: toolOpens },
        toolCompletions: { increment: toolCompletions },
        aiRequests: { increment: aiReqs },
        blogViews: { increment: blogViews },
        bounceCount: { increment: bounceCount },
        newVisitors: { increment: newVisitors },
      },
    })
  } catch (e) {
    logError("aggregateDailyMetrics-upsert", e)
  }
}

async function aggregateHourlyMetrics(events: IncomingEvent[]): Promise<void> {
  const now = new Date()
  const today = now.toISOString().split("T")[0]
  const hour = now.getHours()
  const pv = events.filter(e => e.eventType === "page_view").length
  const toolOpens = events.filter(e => e.eventType === "tool_opened").length
  const aiReqs = events.filter(e => e.eventType === "ai_prompt_submitted").length
  const blogViews = events.filter(e => e.eventType === "blog_article_view").length
  const visitors = new Set(events.map(e => e.visitorId).filter(Boolean)).size
  const sessionCount = new Set(events.map(e => e.sessionId).filter(Boolean)).size

  try {
    await prisma.analyticsHourlyMetric.upsert({
      where: { date_hour: { date: today, hour } },
      create: {
        date: today,
        hour,
        visitors,
        sessions: sessionCount,
        pageViews: pv,
        toolOpens,
        aiRequests: aiReqs,
        blogViews,
      },
      update: {
        visitors: { increment: visitors },
        sessions: { increment: sessionCount },
        pageViews: { increment: pv },
        toolOpens: { increment: toolOpens },
        aiRequests: { increment: aiReqs },
        blogViews: { increment: blogViews },
      },
    })
  } catch (e) {
    logError("aggregateHourlyMetrics", e)
  }
}

/* ─── Dashboard Query Functions ─────────────────── */

export async function getOverviewMetrics(range: AnalyticsDateRange = "last7") {
  const { startDate, endDate } = toDateRange(range)
  const start = new Date(startDate + "T00:00:00.000Z")
  const end = dateToEndOfDay(endDate)
  const prev = getPreviousDateRange(range)
  const prevStart = new Date(prev.startDate + "T00:00:00.000Z")
  const prevEnd = dateToEndOfDay(prev.endDate)

  const [current, previous] = await Promise.all([
    prisma.analyticsDailyMetric.aggregate({
      where: { date: { gte: startDate, lte: endDate } },
      _sum: { visitors: true, sessions: true, pageViews: true, toolOpens: true, toolCompletions: true, aiRequests: true, blogViews: true, bounceCount: true, newVisitors: true },
    }),
    prisma.analyticsDailyMetric.aggregate({
      where: { date: { gte: prev.startDate, lte: prev.endDate } },
      _sum: { visitors: true, sessions: true, pageViews: true, toolOpens: true, toolCompletions: true, aiRequests: true, blogViews: true, bounceCount: true, newVisitors: true },
    }),
  ])

  const c = current._sum
  const p = previous._sum

  const totalVisitors = c.visitors ?? 0
  const totalSessions = c.sessions ?? 0
  const totalPageViews = c.pageViews ?? 0
  const totalToolOpens = c.toolOpens ?? 0
  const totalAIRequests = c.aiRequests ?? 0
  const totalBlogViews = c.blogViews ?? 0

  const uniqueVisitors = await prisma.analyticsVisitor.count({
    where: { lastVisitAt: { gte: start, lte: end } },
  })

  const prevUniqueVisitors = await prisma.analyticsVisitor.count({
    where: { lastVisitAt: { gte: prevStart, lte: prevEnd } },
  })

  const activeSessions = await prisma.analyticsSession.count({
    where: { lastActivityAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } },
  })

  const prevActiveSessions = await prisma.analyticsSession.count({
    where: { lastActivityAt: { gte: new Date(prevEnd.getTime() - 5 * 60 * 1000), lte: prevEnd } },
  })

  const totalBounceCount = c.bounceCount ?? 0
  const engagementRate = totalSessions > 0
    ? Math.round(((totalSessions - totalBounceCount) / totalSessions) * 100)
    : 0

  const prevSessions = p.sessions ?? 0
  const prevBounceCount = p.bounceCount ?? 0
  const prevEngagementRate = prevSessions > 0
    ? Math.round(((prevSessions - prevBounceCount) / prevSessions) * 100)
    : 0

  return {
    totalUsers: { value: uniqueVisitors, prev: prevUniqueVisitors },
    activeUsers: { value: activeSessions, prev: prevActiveSessions },
    sessions: { value: totalSessions, prev: p.sessions ?? 0 },
    pageViews: { value: totalPageViews, prev: p.pageViews ?? 0 },
    toolUsage: { value: totalToolOpens, prev: p.toolOpens ?? 0 },
    aiRequests: { value: totalAIRequests, prev: p.aiRequests ?? 0 },
    blogViews: { value: totalBlogViews, prev: p.blogViews ?? 0 },
    bounceCount: totalBounceCount,
    newVisitors: c.newVisitors ?? 0,
    engagementRate,
    prevEngagementRate,
  }
}

export async function getTrafficTimeSeries(range: AnalyticsDateRange = "last7") {
  const { startDate, endDate } = toDateRange(range)
  const metrics = await prisma.analyticsDailyMetric.findMany({
    where: { date: { gte: startDate, lte: endDate } },
    orderBy: { date: "asc" },
  })

  return metrics.map(m => ({
    date: m.date,
    visitors: m.visitors,
    sessions: m.sessions,
    pageViews: m.pageViews,
    toolOpens: m.toolOpens,
    aiRequests: m.aiRequests,
    blogViews: m.blogViews,
  }))
}

export async function getPopularPages(limit = 10, range: AnalyticsDateRange = "last7") {
  const { startDate, endDate } = toDateRange(range)
  const start = new Date(startDate + "T00:00:00.000Z")
  const end = dateToEndOfDay(endDate)

  const pages = await prisma.analyticsEvent.groupBy({
    by: ["path"],
    where: {
      eventType: "page_view",
      createdAt: { gte: start, lte: end },
      path: { not: "" },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  })

  return pages.map(p => ({
    path: p.path,
    views: p._count.id,
  }))
}

export async function getPopularTools(limit = 10, range: AnalyticsDateRange = "last7") {
  const { startDate, endDate } = toDateRange(range)
  const start = new Date(startDate + "T00:00:00.000Z")
  const end = dateToEndOfDay(endDate)

  const tools = await prisma.analyticsEvent.groupBy({
    by: ["name"],
    where: {
      eventType: "tool_opened",
      createdAt: { gte: start, lte: end },
      name: { not: "" },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  })

  const completions = await prisma.analyticsEvent.groupBy({
    by: ["name"],
    where: {
      eventType: "tool_completed",
      createdAt: { gte: start, lte: end },
      name: { not: "" },
    },
    _count: { id: true },
  })

  const compMap = new Map(completions.map(c => [c.name, c._count.id]))

  return tools.map((t, i) => ({
    rank: i + 1,
    name: t.name,
    opens: t._count.id,
    completions: compMap.get(t.name) || 0,
    completionRate: t._count.id > 0 ? Math.round(((compMap.get(t.name) || 0) / t._count.id) * 100) : 0,
  }))
}

export async function getCategoryPerformance(range: AnalyticsDateRange = "last7") {
  const { startDate, endDate } = toDateRange(range)
  const start = new Date(startDate + "T00:00:00.000Z")
  const end = dateToEndOfDay(endDate)

  const cats = await prisma.analyticsEvent.groupBy({
    by: ["category"],
    where: {
      eventType: "tool_opened",
      createdAt: { gte: start, lte: end },
      category: { not: "" },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  })

  const total = cats.reduce((s, c) => s + c._count.id, 0)
  return cats.map(c => ({
    category: c.category,
    usage: c._count.id,
    percentage: total > 0 ? Math.round((c._count.id / total) * 1000) / 10 : 0,
  }))
}

export async function getToolPerformanceDetailed(range: AnalyticsDateRange = "last7") {
  const { startDate, endDate } = toDateRange(range)
  const start = new Date(startDate + "T00:00:00.000Z")
  const end = dateToEndOfDay(endDate)

  const { tools } = await import("./tools-data")
  const publishedToolCount = tools.length

  const opens = await prisma.analyticsEvent.groupBy({
    by: ["name", "category"],
    where: {
      eventType: "tool_opened",
      createdAt: { gte: start, lte: end },
      name: { not: "" },
    },
    _count: { id: true },
    _avg: { duration: true },
    orderBy: { _count: { id: "desc" } },
  })

  const completions = await prisma.analyticsEvent.groupBy({
    by: ["name"],
    where: {
      eventType: "tool_completed",
      createdAt: { gte: start, lte: end },
      name: { not: "" },
    },
    _count: { id: true },
  })

  const errors = await prisma.analyticsEvent.groupBy({
    by: ["name"],
    where: {
      eventType: "tool_error",
      createdAt: { gte: start, lte: end },
      name: { not: "" },
    },
    _count: { id: true },
  })

  const compMap = new Map(completions.map(c => [c.name, c._count.id]))
  const errMap = new Map(errors.map(e => [e.name, e._count.id]))
  const uniqueSessions = await prisma.analyticsEvent.groupBy({
    by: ["name"],
    where: {
      eventType: "tool_opened",
      createdAt: { gte: start, lte: end },
      name: { not: "" },
      sessionId: { not: "" },
    },
    _count: { sessionId: true },
  })
  const sessMap = new Map(uniqueSessions.map(s => [s.name, s._count.sessionId]))

  const toolsPerformance = opens.map((o, i) => {
    const comp = compMap.get(o.name) || 0
    const errs = errMap.get(o.name) || 0
    const attempts = comp + o._count.id
    return {
      rank: i + 1,
      toolName: o.name,
      category: o.category,
      launches: o._count.id,
      uniqueUsers: sessMap.get(o.name) || 0,
      avgDuration: formatDuration(o._avg.duration || 0),
      completionRate: attempts > 0 ? Math.round((comp / attempts) * 100) : 0,
      errorRate: o._count.id > 0 ? Math.round((errs / o._count.id) * 100) : 0,
      trend: 0 as const,
      direction: "up" as const,
      isTop: i < 3,
    }
  })

  return { tools: toolsPerformance, publishedToolCount }
}

export async function getBlogPerformanceDetailed(range: AnalyticsDateRange = "last7") {
  const { startDate, endDate } = toDateRange(range)
  const start = new Date(startDate + "T00:00:00.000Z")
  const end = dateToEndOfDay(endDate)

  const { getAllPosts } = await import("./blog")
  const publishedCount = getAllPosts().length

  const views = await prisma.analyticsEvent.groupBy({
    by: ["name", "path"],
    where: {
      eventType: "blog_article_view",
      createdAt: { gte: start, lte: end },
      name: { not: "" },
    },
    _count: { id: true },
    _avg: { duration: true },
    orderBy: { _count: { id: "desc" } },
  })

  const scrolls = await prisma.analyticsEvent.groupBy({
    by: ["name"],
    where: {
      eventType: "blog_scroll_depth",
      createdAt: { gte: start, lte: end },
      name: { not: "" },
    },
    _count: { id: true },
  })

  const scrollMap = new Map(scrolls.map(s => [s.name, s._count.id]))
  const ctaClicks = await prisma.analyticsEvent.groupBy({
    by: ["name"],
    where: {
      eventType: "blog_cta_click",
      createdAt: { gte: start, lte: end },
      name: { not: "" },
    },
    _count: { id: true },
  })
  const ctaMap = new Map(ctaClicks.map(c => [c.name, c._count.id]))

  const blog = views.map(v => ({
    article: v.name,
    slug: v.path.replace("/blog/", ""),
    views: v._count.id,
    avgReadTime: formatDuration(v._avg.duration || 0),
    scrollDepth: scrollMap.get(v.name) || 0,
    ctaClicks: ctaMap.get(v.name) || 0,
    engagementScore: v._count.id > 0
      ? Math.round(((scrollMap.get(v.name) || 0) / v._count.id * 40 + (ctaMap.get(v.name) || 0) / v._count.id * 30 + 30))
      : 0,
  }))

  return { blog, publishedCount }
}

export async function getAIUsageDetailed(range: AnalyticsDateRange = "last7") {
  const { startDate, endDate } = toDateRange(range)
  const start = new Date(startDate + "T00:00:00.000Z")
  const end = dateToEndOfDay(endDate)

  const logs = await prisma.aIUsageLog.groupBy({
    by: ["feature", "model"],
    where: { createdAt: { gte: start, lte: end } },
    _count: { id: true },
    _sum: { totalTokens: true, estimatedCost: true, latencyMs: true },
    _avg: { latencyMs: true },
    orderBy: { _count: { id: "desc" } },
  })

  const totalReqs = logs.reduce((s, l) => s + l._count.id, 0)
  const totalTokens = logs.reduce((s, l) => s + (l._sum.totalTokens ?? 0), 0)
  const totalCost = logs.reduce((s, l) => s + (l._sum.estimatedCost ?? 0), 0)
  const avgLatency = totalReqs > 0 ? logs.reduce((s, l) => s + (l._sum.latencyMs ?? 0), 0) / totalReqs : 0

  const errors = await prisma.aIUsageLog.count({
    where: { createdAt: { gte: start, lte: end }, success: false },
  })

  const rateLimits = await prisma.aIUsageLog.count({
    where: { createdAt: { gte: start, lte: end }, rateLimited: true },
  })

  return {
    totalRequests: totalReqs,
    totalTokens,
    totalCost: Math.round(totalCost * 10000) / 10000,
    avgLatency: Math.round(avgLatency),
    errorCount: errors,
    rateLimitHits: rateLimits,
    byFeature: logs.map(l => ({
      feature: l.feature,
      model: l.model,
      requests: l._count.id,
      tokens: l._sum.totalTokens ?? 0,
      cost: Math.round((l._sum.estimatedCost ?? 0) * 10000) / 10000,
      avgLatency: l._count.id > 0 ? Math.round((l._sum.latencyMs ?? 0) / l._count.id) : 0,
    })),
  }
}

export async function getRealtimeData() {
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000)

  const activeSessions = await prisma.analyticsSession.count({
    where: { lastActivityAt: { gte: fiveMinAgo } },
  })

  const recentPageViews = await prisma.analyticsEvent.findMany({
    where: {
      eventType: "page_view",
      createdAt: { gte: fifteenMinAgo },
      path: { not: "" },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const pageMap = new Map<string, number>()
  for (const pv of recentPageViews) {
    pageMap.set(pv.path, (pageMap.get(pv.path) || 0) + 1)
  }
  const topPages = Array.from(pageMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([path, views]) => ({ path, users: views }))

  const recentTools = await prisma.analyticsEvent.findMany({
    where: {
      eventType: "tool_opened",
      createdAt: { gte: fifteenMinAgo },
      name: { not: "" },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const toolMap = new Map<string, number>()
  for (const t of recentTools) {
    toolMap.set(t.name, (toolMap.get(t.name) || 0) + 1)
  }
  const activeTools = Array.from(toolMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, users]) => ({ name, users }))

  const recentEvents = await prisma.analyticsEvent.findMany({
    where: { createdAt: { gte: fifteenMinAgo } },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { eventType: true, name: true, path: true, createdAt: true },
  })

  return {
    activeUsers: activeSessions,
    topPages,
    activeTools,
    recentEvents: recentEvents.map(e => ({
      action: `${e.eventType}: ${e.name || e.path}`,
      timestamp: e.createdAt.toISOString(),
    })),
  }
}

export async function getHourlyTrend() {
  const today = new Date().toISOString().split("T")[0]
  return prisma.analyticsHourlyMetric.findMany({
    where: { date: today },
    orderBy: { hour: "asc" },
  })
}

export async function getSourceBreakdown(range: AnalyticsDateRange = "last7") {
  const { startDate, endDate } = toDateRange(range)
  const start = new Date(startDate + "T00:00:00.000Z")
  const end = dateToEndOfDay(endDate)

  const sources = await prisma.analyticsEvent.groupBy({
    by: ["referrer"],
    where: {
      createdAt: { gte: start, lte: end },
      referrer: { not: "" },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  })

  const total = sources.reduce((s, r) => s + r._count.id, 0)
  const refMap = new Map<string, number>()

  for (const s of sources) {
    let source = "Direct"
    const ref = s.referrer.toLowerCase()
    if (ref.includes("google")) source = "Organic Search"
    else if (ref.includes("facebook") || ref.includes("twitter") || ref.includes("instagram") || ref.includes("linkedin")) source = "Social"
    else if (ref.includes("mail") || ref.includes("mailto")) source = "Email"
    else if (s.referrer && s.referrer !== "direct" && s.referrer !== "") source = "Referral"
    refMap.set(source, (refMap.get(source) || 0) + s._count.id)
  }

  const directCount = await prisma.analyticsEvent.count({
    where: {
      createdAt: { gte: start, lte: end },
      OR: [{ referrer: "" }, { referrer: "direct" }],
    },
  })
  refMap.set("Direct", (refMap.get("Direct") || 0) + directCount)

  const totalWithDirect = Array.from(refMap.values()).reduce((s, v) => s + v, 0)
  return Array.from(refMap.entries())
    .map(([source, count]) => ({
      source,
      count,
      percentage: totalWithDirect > 0 ? Math.round((count / totalWithDirect) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

/* ─── Helpers ────────────────────────────────────── */

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0m 0s"
  const secs = seconds / 1000
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}m ${s}s`
}

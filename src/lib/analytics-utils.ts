import { tools, categories } from "./tools-data"

function seedHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

function pick<T>(arr: T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length]
}

function scaleValue(value: number, min: number, max: number): number {
  return min + (value % (max - min + 1))
}

function generateTrend(current: number, previous: number): { change: number; direction: "up" | "down" } {
  if (previous === 0) return { change: 100, direction: "up" }
  const change = Math.round(((current - previous) / previous) * 100)
  return { change: Math.abs(change), direction: change >= 0 ? "up" : "down" }
}

/* ─── Types ──────────────────────────────────── */

export interface KpiData {
  label: string
  value: string
  change: number
  direction: "up" | "down"
  icon: string
  sparkline: number[]
}

export interface TrafficPoint {
  date: string
  users: number
  sessions: number
  pageViews: number
}

export interface AcquisitionSource {
  source: string
  percentage: number
  users: number
  trend: number
  direction: "up" | "down"
}

export interface ToolPerformanceRow {
  rank: number
  toolName: string
  toolSlug: string
  category: string
  launches: number
  uniqueUsers: number
  avgDuration: string
  completionRate: number
  trend: number
  direction: "up" | "down"
  isTop: boolean
}

export interface CategoryPerformance {
  category: string
  usage: number
  growth: number
  share: number
}

export interface FunnelStage {
  label: string
  value: number
  percentage: number
  dropped: number
}

export interface LiveActivityData {
  activeUsers: number
  pages: { path: string; users: number }[]
  activeTools: { name: string; users: number }[]
  locations: { name: string; users: number }[]
  recentEvents: { action: string; timestamp: string }[]
}

export interface SEOMetrics {
  organicClicks: number
  impressions: number
  avgCtr: number
  avgPosition: number
  indexedPages: number
}

export interface SEOTrendPoint {
  date: string
  clicks: number
  impressions: number
}

export interface SEOLandingPage {
  page: string
  clicks: number
  impressions: number
}

export interface SEOQuery {
  query: string
  clicks: number
  impressions: number
  position: number
  ctr: number
  trend: number[]
}

export interface BlogPerformanceRow {
  article: string
  slug: string
  views: number
  uniqueVisitors: number
  avgReadTime: string
  bounceRate: number
  scrollDepth: number
  engagementScore: number
  organicTraffic: number
}

export interface TrendingItem {
  title: string
  subtitle: string
  growth: number
  type: "blog" | "tool" | "category"
  href?: string
}

export interface SearchConsoleRow {
  keyword: string
  position: number
  ctr: number
  clicks: number
  impressions: number
  trend: number[]
}

export interface HeatmapData {
  day: string
  hour: number
  value: number
}

export interface ActivityEvent {
  id: string
  action: string
  detail: string
  timestamp: string
  icon: string
}

export interface AIInsight {
  type: "positive" | "negative" | "recommendation" | "neutral"
  message: string
}

/* ─── Data Generators ─────────────────────────── */

export function generateKpiData(): KpiData[] {
  const today = new Date().toISOString().split("T")[0]
  const seed = seedHash(`kpi-${today}`)

  const baseValues = [28471, 18234, 94126, 12567, 68.4, 12.9]
  const prevValues = [25100, 16700, 88100, 11200, 64.2, 10.4]
  const labels = ["Total Users", "Sessions", "Page Views", "Tool Launches", "Engagement Rate", "Conversion Rate"]
  const icons = ["Users", "Activity", "Eye", "Wrench", "HeartHandshake", "TrendingUp"]
  const colors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]

  return labels.map((label, i) => {
    const variance = 1 + ((seed + i * 7) % 100) / 1000
    const current = Math.round(baseValues[i] * variance)
    const prev = Math.round(prevValues[i] * (1 + ((seed + i * 13) % 100) / 1000))
    const { change, direction } = generateTrend(current, prev)

    const sparkline: number[] = Array.from({ length: 12 }, (_, j) => {
      const base = current / 12
      const noise = ((seed + i * 31 + j * 17) % 40) - 20
      return Math.round(base + (base * noise) / 100)
    })

    return {
      label,
      value: current >= 1000 ? (current / 1000).toFixed(1).replace(/\.0$/, "") + "k" : current.toString(),
      change,
      direction,
      icon: icons[i],
      sparkline,
    }
  })
}

export function generateTrafficData(period: "24h" | "7d" | "30d" | "90d"): TrafficPoint[] {
  const today = new Date()
  const seed = seedHash(`traffic-${period}-${today.toISOString().split("T")[0]}`)
  const days = period === "24h" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 90
  const points = period === "24h" ? 24 : days
  const usersBase = period === "24h" ? 1200 : period === "7d" ? 8500 : period === "30d" ? 35000 : 95000

  return Array.from({ length: points }, (_, i) => {
    const date = period === "24h"
      ? `${String(i).padStart(2, "0")}:00`
      : new Date(today.getTime() - (days - i) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    const noise = ((seed + i * 13) % 30) - 15
    const weekend = period !== "24h" ? Math.sin(i * Math.PI / 7) * 0.15 : 0
    const hourFactor = period === "24h" ? Math.sin((i - 6) * Math.PI / 12) * 0.3 + 0.5 : 0
    const growth = 1 + (i / points) * 0.1
    const users = Math.round((usersBase / points) * growth * (1 + noise / 100) * (1 + weekend) * (1 + hourFactor))
    const sessions = Math.round(users * (0.6 + ((seed + i * 7) % 20) / 100))
    const pageViews = Math.round(users * (2.5 + ((seed + i * 11) % 40) / 100))
    return { date, users: Math.max(users, 10), sessions: Math.max(sessions, 5), pageViews: Math.max(pageViews, 10) }
  })
}

export function generateAcquisitionData(): AcquisitionSource[] {
  const today = new Date().toISOString().split("T")[0]
  const seed = seedHash(`acq-${today}`)
  const sources = ["Organic Search", "Direct", "Social", "Referral", "Email"]
  const basePcts = [42, 24, 16, 11, 7]
  const baseUsers = [11958, 6833, 4555, 3132, 1993]

  return sources.map((source, i) => {
    const variance = 1 + ((seed + i * 11) % 20) / 100
    const pct = Math.round(basePcts[i] * variance * 10) / 10
    const users = Math.round(baseUsers[i] * variance)
    const trend = ((seed + i * 17) % 30) - 8
    const direction = trend >= 0 ? "up" as const : "down" as const
    return { source, percentage: pct, users, trend: Math.abs(trend), direction }
  })
}

export function generateToolPerformanceData(search?: string, category?: string): ToolPerformanceRow[] {
  const today = new Date().toISOString().split("T")[0]
  const seed = seedHash(`tool-perf-${today}`)
  const totalLaunches = 12567

  let filtered = [...tools]
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(t => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
  }
  if (category && category !== "All") {
    filtered = filtered.filter(t => t.category === category)
  }

  return filtered.map((tool, i) => {
    const launches = scaleValue(seed + i * 31, 50, 1200)
    const uniqueUsers = Math.round(launches * (0.7 + ((seed + i * 7) % 20) / 100))
    const avgSec = 60 + ((seed + i * 13) % 240)
    const avgMin = Math.floor(avgSec / 60)
    const avgSecRem = avgSec % 60
    const completionRate = 50 + ((seed + i * 17) % 45)
    const trend = ((seed + i * 23) % 40) - 10
    const direction = trend >= 0 ? "up" as const : "down" as const
    return {
      rank: i + 1,
      toolName: tool.name,
      toolSlug: tool.slug,
      category: tool.category,
      launches,
      uniqueUsers,
      avgDuration: `${avgMin}m ${avgSecRem}s`,
      completionRate,
      trend: Math.abs(trend),
      direction,
      isTop: i < 3,
    }
  })
}

export function generateCategoryPerformanceData(): CategoryPerformance[] {
  const today = new Date().toISOString().split("T")[0]
  const seed = seedHash(`cat-perf-${today}`)
  const totalUsage = categories.reduce((sum, _, i) => sum + scaleValue(seed + i * 11, 500, 8000), 0)

  return categories.map((category, i) => {
    const usage = scaleValue(seed + i * 11, 500, 8000)
    const growth = ((seed + i * 19) % 40) - 5
    const share = Math.round((usage / totalUsage) * 1000) / 10
    return { category, usage, growth: Math.max(growth, 0), share }
  }).sort((a, b) => b.usage - a.usage)
}

export function generateFunnelData(): FunnelStage[] {
  const today = new Date().toISOString().split("T")[0]
  const seed = seedHash(`funnel-${today}`)
  const visitors = 28471
  const toolClicks = Math.round(visitors * (0.44 + ((seed) % 10) / 100))
  const toolStarted = Math.round(toolClicks * (0.72 + ((seed + 7) % 10) / 100))
  const toolCompleted = Math.round(toolStarted * (0.65 + ((seed + 13) % 10) / 100))
  const returnUsers = Math.round(toolCompleted * (0.38 + ((seed + 19) % 10) / 100))

  return [
    { label: "Visitors", value: visitors, percentage: 100, dropped: 0 },
    { label: "Tool Clicks", value: toolClicks, percentage: Math.round(toolClicks / visitors * 100), dropped: visitors - toolClicks },
    { label: "Tool Started", value: toolStarted, percentage: Math.round(toolStarted / toolClicks * 100), dropped: toolClicks - toolStarted },
    { label: "Tool Completed", value: toolCompleted, percentage: Math.round(toolCompleted / toolStarted * 100), dropped: toolStarted - toolCompleted },
    { label: "Return Users", value: returnUsers, percentage: Math.round(returnUsers / toolCompleted * 100), dropped: toolCompleted - returnUsers },
  ]
}

export function generateLiveActivityData(): LiveActivityData {
  const today = new Date().toISOString().split("T")[0]
  const seed = seedHash(`live-${today}-${new Date().getHours()}`)
  const activeUsers = 32 + (seed % 45)

  const pagePaths = ["/", "/tools", "/tools/planner", "/blog/time-management-hacks-daily-routine", "/tools/pomodoro", "/tools/qr-generator", "/tools/grade-calculator", "/blog/pomodoro-technique-guide", "/tools/currency-converter", "/tools/notes"]
  const pages = pagePaths.slice(0, 5).map((path, i) => ({
    path,
    users: Math.max(1, activeUsers - i * 4 - (seed % 6)),
  }))

  const toolNames = ["Task Planner", "Pomodoro Timer", "QR Generator", "Grade Calculator", "Notes App", "Currency Converter"]
  const activeTools = toolNames.slice(0, 4).map((name, i) => ({
    name,
    users: Math.max(1, activeUsers - i * 5 - (seed % 8)),
  }))

  const locations = ["Nairobi, KE", "Mombasa, KE", "Kisumu, KE", "Nakuru, KE"]
  const locs = locations.map((name, i) => ({
    name,
    users: Math.max(1, Math.round(activeUsers * (0.35 - i * 0.07))),
  }))

  const eventActions = ["Task Planner launched", "Blog: Time Management viewed", "Calculator: ROI completed", "QR Scanner opened", "SEO article read", "Pomodoro timer started", "Notes: Meeting notes saved"]
  const recentEvents = eventActions.slice(0, 5).map((action, i) => ({
    action,
    timestamp: new Date(Date.now() - i * 45000).toISOString(),
  }))

  return { activeUsers, pages, activeTools, locations: locs, recentEvents }
}

export function generateSEOMetrics(): SEOMetrics {
  const today = new Date().toISOString().split("T")[0]
  const seed = seedHash(`seo-metrics-${today}`)
  return {
    organicClicks: 8250 + (seed % 1200),
    impressions: 45200 + (seed % 5000),
    avgCtr: 18.2 + ((seed % 30) / 10),
    avgPosition: 4.7 + ((seed % 20) / 10),
    indexedPages: 47 + (seed % 8),
  }
}

export function generateSEOTrend(): SEOTrendPoint[] {
  const today = new Date()
  const seed = seedHash(`seo-trend-${today.toISOString().split("T")[0]}`)
  return Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today.getTime() - (13 - i) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    const noise = ((seed + i * 17) % 25) - 10
    return {
      date,
      clicks: Math.round(580 + i * 12 + noise * 8),
      impressions: Math.round(3200 + i * 45 + noise * 40),
    }
  })
}

export function generateSEOLandingPages(): SEOLandingPage[] {
  const today = new Date().toISOString().split("T")[0]
  const seed = seedHash(`seo-lp-${today}`)
  const paths = ["/", "/tools", "/blog/time-management-hacks-daily-routine", "/tools/planner", "/tools/pomodoro", "/blog/pomodoro-technique-guide", "/tools/grade-calculator", "/tools/qr-generator", "/blog/privacy-first-tools", "/tools/currency-converter", "/tools/notes", "/blog/cbc-grade-calculator-guide"]
  return paths.map((page, i) => ({
    page,
    clicks: Math.round(scaleValue(seed + i * 7, 100, 2500)),
    impressions: Math.round(scaleValue(seed + i * 13, 500, 12000)),
  })).sort((a, b) => b.clicks - a.clicks)
}

export function generateSEOQueries(): SEOQuery[] {
  const today = new Date().toISOString().split("T")[0]
  const seed = seedHash(`seo-q-${today}`)
  const queries = [
    "task planner online", "free qr code generator", "pomodoro timer", "grade calculator cbc",
    "time management tools", "password generator", "json formatter", "currency converter",
    "notes app online", "cbc lesson plan", "pdf converter free", "image converter",
  ]
  return queries.map((query, i) => {
    const trend: number[] = Array.from({ length: 7 }, (_, j) =>
      Math.round(scaleValue(seed + i * 13 + j * 7, 10, 200))
    )
    return {
      query,
      clicks: Math.round(scaleValue(seed + i * 11, 20, 800)),
      impressions: Math.round(scaleValue(seed + i * 17, 100, 4500)),
      position: Math.round((3 + ((seed + i * 23) % 18)) * 10) / 10,
      ctr: Math.round(((15 + ((seed + i * 7) % 25)) * 10)) / 10,
      trend,
    }
  }).sort((a, b) => b.clicks - a.clicks)
}

export function generateBlogPerformanceData(): BlogPerformanceRow[] {
  const today = new Date().toISOString().split("T")[0]
  const seed = seedHash(`blog-perf-${today}`)

  const articles = [
    { title: "Smart Time Blocking: The Ultimate Productivity System", slug: "smart-time-blocking-system" },
    { title: "Time Management Hacks for a Productive Daily Routine", slug: "time-management-hacks-daily-routine" },
    { title: "Pomodoro Technique Guide: Boost Your Focus", slug: "pomodoro-technique-guide" },
    { title: "CBC Grade Calculator Guide for Parents & Teachers", slug: "cbc-grade-calculator-guide" },
    { title: "KICD Lesson Plan Guide: Complete Teacher Resource", slug: "kicd-lesson-plan-guide" },
    { title: "Privacy-First Tools: Why Local Processing Matters", slug: "privacy-first-tools" },
    { title: "Stop Feeling Overwhelmed: Master Your Daily Tasks", slug: "stop-overwhelmed-master-daily-tasks" },
    { title: "Revision Planning Techniques for CBC Students", slug: "revision-planning-techniques" },
    { title: "CBC Competency Assessment: A Complete Guide", slug: "cbc-competency-assessment" },
    { title: "Smart Time Blocking Blueprint for Professionals", slug: "smart-time-blocking-blueprint" },
  ]

  return articles.map((article, i) => ({
    article: article.title,
    slug: article.slug,
    views: Math.round(scaleValue(seed + i * 7, 100, 3500)),
    uniqueVisitors: Math.round(scaleValue(seed + i * 11, 60, 2200)),
    avgReadTime: `${2 + ((seed + i * 13) % 8)}m ${(seed + i * 17) % 60}s`,
    bounceRate: 20 + ((seed + i * 23) % 50),
    scrollDepth: 45 + ((seed + i * 29) % 50),
    engagementScore: 30 + ((seed + i * 31) % 65),
    organicTraffic: Math.round(scaleValue(seed + i * 37, 40, 1800)),
  })).sort((a, b) => b.views - a.views)
}

export function generateTrendingContent(): TrendingItem[] {
  const today = new Date().toISOString().split("T")[0]
  const seed = seedHash(`trending-content-${today}`)

  const blogItems = [
    { title: "Smart Time Blocking System", subtitle: "Productivity", growth: 42 },
    { title: "Pomodoro Technique Guide", subtitle: "Focus & Productivity", growth: 38 },
    { title: "CBC Grade Calculator Guide", subtitle: "Education", growth: 35 },
    { title: "Privacy-First Tools Guide", subtitle: "Security", growth: 28 },
  ].map((item, i) => ({
    ...item,
    type: "blog" as const,
    href: `/blog/${["smart-time-blocking-system", "pomodoro-technique-guide", "cbc-grade-calculator-guide", "privacy-first-tools"][i]}`,
  }))

  const toolItems = [
    { title: "Task Planner", subtitle: "Productivity", growth: 56 },
    { title: "QR Code Generator", subtitle: "QR & Connectivity", growth: 48 },
    { title: "Pomodoro Timer", subtitle: "Productivity", growth: 34 },
    { title: "CBC Grade Calculator", subtitle: "Education", growth: 31 },
  ].map((item, i) => ({
    ...item,
    type: "tool" as const,
    href: `/tools/${["planner", "qr-generator", "pomodoro", "grade-calculator"][i]}`,
  }))

  const categoryItems = [
    { title: "Productivity", subtitle: "45.2% of total usage", growth: 62 },
    { title: "Education & CBC Tools", subtitle: "22.8% of total usage", growth: 45 },
    { title: "QR & Connectivity", subtitle: "12.1% of total usage", growth: 28 },
    { title: "Finance Tools", subtitle: "8.5% of total usage", growth: 15 },
  ].map(item => ({ ...item, type: "category" as const }))

  return [...blogItems, ...toolItems, ...categoryItems].sort((a, b) => b.growth - a.growth)
}

export function generateSearchConsoleData(): SearchConsoleRow[] {
  const today = new Date().toISOString().split("T")[0]
  const seed = seedHash(`search-console-${today}`)
  const queries = [
    "task planner online free", "qr code generator", "pomodoro timer online",
    "cbc grade calculator", "time management tools", "password generator secure",
    "json formatter online", "currency converter kenya", "notes app browser",
    "cbc lesson plan template", "pdf converter free online", "image converter jpg to png",
    "url shortener free", "unit converter metric", "color picker hex",
  ]
  return queries.map((query, i) => {
    const trend: number[] = Array.from({ length: 7 }, (_, j) =>
      Math.round(scaleValue(seed + i * 13 + j * 7, 10, 200))
    )
    return {
      keyword: query,
      position: Math.round((2.5 + ((seed + i * 17) % 20)) * 10) / 10,
      ctr: Math.round((12 + ((seed + i * 11) % 25)) * 10) / 10,
      clicks: Math.round(scaleValue(seed + i * 23, 15, 650)),
      impressions: Math.round(scaleValue(seed + i * 29, 80, 4000)),
      trend,
    }
  }).sort((a, b) => b.clicks - a.clicks)
}

export function generateHeatmapData(): HeatmapData[] {
  const today = new Date().toISOString().split("T")[0]
  const seed = seedHash(`heatmap-${today}`)
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const data: HeatmapData[] = []
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const base = (h >= 8 && h <= 17) ? 60 + Math.sin((h - 8) * Math.PI / 9) * 30 : 10
      const weekdayBoost = (d >= 1 && d <= 5) ? 1.4 : 0.6
      const noise = ((seed + d * 31 + h * 17) % 25) - 10
      data.push({
        day: days[d],
        hour: h,
        value: Math.round(Math.max(0, base * weekdayBoost + noise)),
      })
    }
  }
  return data
}

export function generateRecentActivity(): ActivityEvent[] {
  const today = new Date().toISOString().split("T")[0]
  const seed = seedHash(`activity-${today}`)

  const events = [
    { action: "Tool Launched", detail: "Task Planner", icon: "Wrench" },
    { action: "Blog Viewed", detail: "Time Management Hacks for Daily Routine", icon: "FileText" },
    { action: "Tool Completed", detail: "Calculator: Profit Calculator", icon: "CheckCircle" },
    { action: "Tool Opened", detail: "QR Scanner", icon: "Scan" },
    { action: "Blog Viewed", detail: "SEO: Privacy-First Tools", icon: "FileText" },
    { action: "Tool Launched", detail: "Pomodoro Timer", icon: "Timer" },
    { action: "Tool Completed", detail: "Notes App: Meeting Notes", icon: "StickyNote" },
    { action: "Search", detail: "cbc grade calculator guide", icon: "Search" },
    { action: "Tool Launched", detail: "Currency Converter", icon: "DollarSign" },
    { action: "Conversion", detail: "Return visitor: Task Planner", icon: "Repeat" },
  ]

  return events.map((event, i) => ({
    id: `evt-${i}`,
    ...event,
    timestamp: new Date(Date.now() - i * 120000 - ((seed + i * 7) % 60) * 1000).toISOString(),
  }))
}

export function generateAIInsights(): AIInsight[] {
  const today = new Date().toISOString().split("T")[0]
  const seed = seedHash(`ai-insights-${today}`)
  const all: AIInsight[] = [
    { type: "positive", message: "Traffic increased by 18% this week compared to last week." },
    { type: "positive", message: "Productivity tools generated 62% of total platform engagement." },
    { type: "positive", message: "Morning Routine article has the highest average engagement score." },
    { type: "negative", message: "QR Scanner usage declined by 21% over the past month." },
    { type: "positive", message: "Mobile users convert 15% better than desktop users." },
    { type: "negative", message: "Referral traffic dropped by 8% this month." },
    { type: "recommendation", message: "Improve internal linking between blog posts and related tools." },
    { type: "recommendation", message: "Promote top-performing tools (Task Planner, QR Generator) on the homepage." },
    { type: "recommendation", message: "Update low-performing blog posts with fresh content and better CTAs." },
    { type: "recommendation", message: "Optimize pages with high impressions but low CTR (grade-calculator, unit-converter)." },
  ]
  return all
}

export function generateSparklineData(seed: number, points: number, min: number, max: number): number[] {
  return Array.from({ length: points }, (_, i) => {
    const base = (min + max) / 2
    const amplitude = (max - min) / 2
    const noise = ((seed + i * 17) % 100) / 100
    return Math.round(base + (noise - 0.5) * amplitude * 2)
  })
}

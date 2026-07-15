/* ─── Types ──────────────────────────────────── */

export interface KpiData {
  label: string
  value: string
  rawValue?: number
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

function seedHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
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

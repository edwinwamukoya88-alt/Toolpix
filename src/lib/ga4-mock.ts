export interface ToolUsageData {
  toolName: string
  toolSlug: string
  totalClicks: number
  totalUsage: number
  pageViews: number
}

export interface RealtimePageData {
  path: string
  title: string
  activeUsers: number
}

export interface RealtimeData {
  activeUsers: number
  topPages: RealtimePageData[]
  updatedAt: string
}

export interface BlogAnalyticsData {
  slug: string
  title: string
  views: number
  avgTimeOnPage: number
  bounceRate: number
}

export interface FunnelStageData {
  label: string
  value: number
  percentage: number
}

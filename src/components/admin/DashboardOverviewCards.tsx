"use client"

import { Users, FileText, Wrench, Eye, MousePointerClick, Search, Hash, TrendingUp, Activity } from "lucide-react"
import { StatCard } from "./StatCard"

interface OverviewData {
  totalUsers: number
  activeUsers: number
  blogPosts: number
  publishedTools: number
  totalPageViews: number
  sessions: number
  searchClicks: number
  searchImpressions: number
  avgPosition: number
  ctr: number
}

interface DashboardOverviewCardsProps {
  data: OverviewData | null
  loading?: boolean
}

export function DashboardOverviewCards({ data, loading }: DashboardOverviewCardsProps) {
  if (!data && !loading) return null

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <StatCard
          title="Total Users"
          value={data?.totalUsers.toLocaleString() ?? "—"}
          icon={Users}
          trend={{ value: 12, positive: true }}
          loading={loading}
        />
        <StatCard
          title="Active Users"
          value={data?.activeUsers.toLocaleString() ?? "—"}
          icon={Activity}
          trend={{ value: 8, positive: true }}
          loading={loading}
        />
        <StatCard
          title="Blog Posts"
          value={data?.blogPosts.toLocaleString() ?? "—"}
          icon={FileText}
          subtitle="Published articles"
          loading={loading}
        />
        <StatCard
          title="Published Tools"
          value={data?.publishedTools.toLocaleString() ?? "—"}
          icon={Wrench}
          subtitle="Available utilities"
          loading={loading}
        />
        <StatCard
          title="Page Views"
          value={data?.totalPageViews.toLocaleString() ?? "—"}
          icon={Eye}
          trend={{ value: 15, positive: true }}
          loading={loading}
        />
        <StatCard
          title="Sessions"
          value={data?.sessions.toLocaleString() ?? "—"}
          icon={TrendingUp}
          trend={{ value: 10, positive: true }}
          loading={loading}
        />
        <StatCard
          title="Search Clicks"
          value={data?.searchClicks.toLocaleString() ?? "—"}
          icon={MousePointerClick}
          trend={{ value: 5, positive: true }}
          loading={loading}
        />
        <StatCard
          title="Impressions"
          value={data?.searchImpressions.toLocaleString() ?? "—"}
          icon={Search}
          trend={{ value: 22, positive: true }}
          loading={loading}
        />
        <StatCard
          title="Avg. Position"
          value={data?.avgPosition.toFixed(1) ?? "—"}
          icon={Hash}
          trend={{ value: 8, positive: true }}
          loading={loading}
        />
        <StatCard
          title="CTR"
          value={data?.ctr ? `${(data.ctr * 100).toFixed(1)}%` : "—"}
          icon={MousePointerClick}
          trend={{ value: 3, positive: false }}
          loading={loading}
        />
      </div>
    </div>
  )
}

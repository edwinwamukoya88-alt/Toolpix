"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Search, MousePointerClick, Eye, BarChart3, FileText, TrendingUp, TrendingDown } from "lucide-react"
import ChartContainer from "@/components/chart-container"
import type { SEOMetrics, SEOTrendPoint, SEOLandingPage, SEOQuery } from "@/lib/analytics-utils"

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  direction,
}: {
  icon: typeof Search
  label: string
  value: string
  sub?: string
  trend?: number
  direction?: "up" | "down"
}) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4 space-y-1.5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-xl font-bold tabular-nums">{value}</div>
      {(trend !== undefined || sub) && (
        <div className="flex items-center gap-1.5">
          {trend !== undefined && (
            <div className={`flex items-center gap-0.5 text-xs font-medium ${direction === "up" ? "text-emerald-400" : "text-red-400"}`}>
              {direction === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend}%
            </div>
          )}
          {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
        </div>
      )}
    </div>
  )
}

export default function SEODashboard({
  metrics,
  trend,
  landingPages,
  queries,
  loading,
}: {
  metrics: SEOMetrics | null
  trend: SEOTrendPoint[]
  landingPages: SEOLandingPage[]
  queries: SEOQuery[]
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
        <div className="h-[250px] rounded-2xl bg-muted/50 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-[250px] rounded-2xl bg-muted/50 animate-pulse" />
          <div className="h-[250px] rounded-2xl bg-muted/50 animate-pulse" />
        </div>
      </div>
    )
  }

  if (!metrics) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard icon={MousePointerClick} label="Organic Clicks" value={metrics.organicClicks.toLocaleString()} trend={12} direction="up" />
        <MetricCard icon={Eye} label="Impressions" value={metrics.impressions.toLocaleString()} trend={8} direction="up" />
        <MetricCard icon={BarChart3} label="Avg CTR" value={`${metrics.avgCtr}%`} sub="click-through rate" />
        <MetricCard icon={TrendingUp} label="Avg Position" value={metrics.avgPosition.toFixed(1)} trend={5} direction="down" />
        <MetricCard icon={FileText} label="Indexed Pages" value={metrics.indexedPages.toString()} sub="in search console" />
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h3 className="text-sm font-semibold mb-4">Organic Traffic Trend</h3>
        <ChartContainer height={220}>
          <AreaChart data={trend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <Tooltip content={({ active, payload, label }: any) => {
              if (!active || !payload?.length) return null
              return (
                <div className="rounded-xl border bg-card/95 backdrop-blur-sm px-4 py-3 shadow-xl text-sm space-y-1">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-semibold tabular-nums">{payload[0].value.toLocaleString()} clicks</p>
                </div>
              )
            }} />
            <Area type="monotone" dataKey="clicks" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="text-sm font-semibold mb-4">Top Landing Pages</h3>
          <div className="space-y-2">
            {landingPages.slice(0, 6).map((page) => (
              <div key={page.page} className="flex items-center justify-between text-xs py-1.5">
                <span className="text-muted-foreground truncate max-w-[200px]">{page.page || "/"}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="tabular-nums">{page.clicks.toLocaleString()} clicks</span>
                  <span className="text-muted-foreground tabular-nums">{page.impressions.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <h3 className="text-sm font-semibold mb-4">Top Search Queries</h3>
          <div className="space-y-2">
            {queries.slice(0, 6).map((q) => (
              <div key={q.query} className="flex items-center justify-between text-xs py-1.5">
                <span className="truncate max-w-[160px]">{q.query}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="tabular-nums">{q.position.toFixed(1)}</span>
                  <span className="text-muted-foreground tabular-nums">{q.ctr}%</span>
                  <span className="tabular-nums">{q.clicks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

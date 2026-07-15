import { TrendingUp, TrendingDown, Users, Activity, Eye, Wrench, HeartHandshake, BarChart3, MousePointerClick, type LucideIcon } from "lucide-react"
import type { KpiData } from "@/lib/analytics-utils"

const iconMap: Record<string, LucideIcon> = {
  Users, Activity, Eye, Wrench, HeartHandshake, TrendingUp, BarChart3, MousePointerClick,
}

const gradientMap: Record<string, string> = {
  "Total Users": "from-blue-500/20 to-blue-600/5",
  Sessions: "from-purple-500/20 to-purple-600/5",
  "Page Views": "from-cyan-500/20 to-cyan-600/5",
  "Tool Usage": "from-emerald-500/20 to-emerald-600/5",
  "Engagement Rate": "from-amber-500/20 to-amber-600/5",
  "Conversion Rate": "from-red-500/20 to-red-600/5",
  Clicks: "from-blue-500/20 to-blue-600/5",
  Impressions: "from-cyan-500/20 to-cyan-600/5",
  CTR: "from-emerald-500/20 to-emerald-600/5",
  "Avg Position": "from-amber-500/20 to-amber-600/5",
}

const accentMap: Record<string, string> = {
  "Total Users": "bg-blue-500",
  Sessions: "bg-purple-500",
  "Page Views": "bg-cyan-500",
  "Tool Usage": "bg-emerald-500",
  "Engagement Rate": "bg-amber-500",
  "Conversion Rate": "bg-red-500",
  Clicks: "bg-blue-500",
  Impressions: "bg-cyan-500",
  CTR: "bg-emerald-500",
  "Avg Position": "bg-amber-500",
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const width = 80
  const height = 32
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(" ")
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-20 h-8" aria-hidden="true">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className="drop-shadow-[0_0_4px_var(--tw-shadow-color)]"
        style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
      />
    </svg>
  )
}

export default function KpiCard({ data, index }: { data: KpiData; index: number }) {
  const Icon = iconMap[data.icon] ?? BarChart3
  const gradient = gradientMap[data.label] ?? "from-primary/20 to-primary/5"
  const accent = accentMap[data.label] ?? "bg-primary"
  const sparkColor = accent.replace("bg-", "#")

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-0.5"
      role="article"
      aria-label={`${data.label}: ${data.value}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 transition-opacity duration-300 group-hover:opacity-100`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}/10`}>
            <Icon className={`h-4.5 w-4.5 ${accent.replace("bg-", "text-")}/80`} />
          </div>
          <div className="flex items-center gap-1.5">
            {data.direction === "up" ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-400" />
            )}
            <span className={`text-xs font-semibold tabular-nums ${data.direction === "up" ? "text-emerald-400" : "text-red-400"}`}>
              {data.change}%
            </span>
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight mb-0.5">{data.value}</div>
        <div className="text-xs text-muted-foreground">{data.label}</div>
        <div className="mt-2 flex items-end justify-between">
          <div className={`h-1 w-12 rounded-full ${accent}/30`}>
            <div className={`h-full rounded-full ${accent} w-1/2 transition-all duration-500 group-hover:w-full`} />
          </div>
          <MiniSparkline data={data.sparkline} color={sparkColor} />
        </div>
      </div>
    </div>
  )
}

export function KpiCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-5 animate-pulse" aria-hidden="true">
      <div className="flex items-center justify-between mb-3">
        <div className="h-9 w-9 rounded-xl bg-muted" />
        <div className="h-4 w-12 rounded bg-muted" />
      </div>
      <div className="h-8 w-24 rounded bg-muted mb-2" />
      <div className="h-3 w-20 rounded bg-muted mb-3" />
      <div className="h-1 w-full rounded-full bg-muted" />
    </div>
  )
}

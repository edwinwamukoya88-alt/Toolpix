"use client"

import { memo } from "react"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  type LucideIcon,
} from "lucide-react"
import AnimatedCounter from "./animated-counter"
import SparklineChart from "./sparkline-chart"
import { cn } from "@/lib/utils"

export interface InsightCardData {
  id: string
  label: string
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  change?: number
  icon: LucideIcon
  color: string
  sparkline?: number[]
  trend?: "up" | "down" | "neutral"
  status?: "success" | "warning" | "danger" | "info"
}

interface InsightCardProps {
  data: InsightCardData
  index?: number
}

function TrendIndicator({ trend, change }: { trend?: string; change?: number }) {
  if (!trend || trend === "neutral" || change === undefined) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        <span className="tabular-nums">—</span>
      </span>
    )
  }
  const isUp = trend === "up"
  return (
    <span
      className={cn(
        "flex items-center gap-1 text-xs font-semibold tabular-nums",
        isUp ? "text-emerald-400" : "text-red-400"
      )}
    >
      {isUp ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {Math.abs(change)}%
    </span>
  )
}

const StatusDot = memo(function StatusDot({ status }: { status?: string }) {
  const colors: Record<string, string> = {
    success: "bg-emerald-500 shadow-[0_0_6px_hsl(160_84%_39%/0.5)]",
    warning: "bg-amber-500 shadow-[0_0_6px_hsl(38_92%_50%/0.5)]",
    danger: "bg-red-500 shadow-[0_0_6px_hsl(0_84%_60%/0.5)]",
    info: "bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]",
  }
  return (
    <span
      className={cn(
        "inline-block h-1.5 w-1.5 rounded-full",
        colors[status ?? "info"] ?? colors.info
      )}
      aria-hidden="true"
    />
  )
})

function InsightCard({ data, index = 0 }: InsightCardProps) {
  const Icon = data.icon
  const gradientMap: Record<string, string> = {
    emerald: "from-emerald-500/20 to-emerald-600/5",
    blue: "from-blue-500/20 to-blue-600/5",
    purple: "from-purple-500/20 to-purple-600/5",
    amber: "from-amber-500/20 to-amber-600/5",
    rose: "from-rose-500/20 to-rose-600/5",
    cyan: "from-cyan-500/20 to-cyan-600/5",
    violet: "from-violet-500/20 to-violet-600/5",
    orange: "from-orange-500/20 to-orange-600/5",
  }
  const gradient = gradientMap[data.color] ?? "from-primary/20 to-primary/5"

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      role="article"
      aria-label={`${data.label}: ${data.prefix ?? ""}${data.value}${data.suffix ?? ""}`}
      tabIndex={0}
      style={{ animationDelay: `${(index || 0) * 80}ms` }}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity duration-300 group-hover:opacity-100",
          gradient
        )}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${data.color.replace("text-", "")}/10` }}
          >
            <Icon className="h-4.5 w-4.5" style={{ color: `hsl(var(--${data.color}))` }} />
          </div>
          <div className="flex items-center gap-2">
            <StatusDot status={data.status} />
            <TrendIndicator trend={data.trend} change={data.change} />
          </div>
        </div>

        <div className="text-2xl font-bold tracking-tight mb-0.5">
          <AnimatedCounter
            value={data.value}
            suffix={data.suffix ?? ""}
            prefix={data.prefix ?? ""}
            decimals={data.decimals ?? 0}
          />
        </div>

        <div className="text-xs text-muted-foreground mb-2">{data.label}</div>

        {data.sparkline && data.sparkline.length > 0 && (
          <div className="flex items-end justify-between">
            <div className="h-1 w-12 rounded-full bg-muted/50">
              <div
                className="h-full rounded-full transition-all duration-500 group-hover:w-full"
                style={{
                  width: `${Math.min(100, data.value)}%`,
                  backgroundColor: data.status === "success"
                    ? "hsl(160 84% 39%)"
                    : data.status === "danger"
                      ? "hsl(0 84% 60%)"
                      : "hsl(var(--primary))",
                }}
              />
            </div>
            <SparklineChart
              data={data.sparkline}
              color={data.color.startsWith("text-") ? `hsl(var(--${data.color.replace("text-", "")}))` : "hsl(var(--primary))"}
              width={64}
              height={24}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(InsightCard)

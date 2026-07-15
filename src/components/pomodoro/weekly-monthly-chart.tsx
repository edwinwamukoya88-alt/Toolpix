"use client"

import { memo, useMemo, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
} from "recharts"
import { Calendar, TrendingUp, BarChart3 } from "lucide-react"
import type { FocusTrend } from "@/lib/pomodoro-analytics"
import { cn } from "@/lib/utils"
import ChartContainer from "@/components/chart-container"

interface FocusTrendChartProps {
  weeklyData: FocusTrend[]
  monthlyData: FocusTrend[]
  className?: string
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border bg-card p-3 shadow-lg text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-muted-foreground" style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold tabular-nums">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

function FocusTrendChart({ weeklyData, monthlyData, className = "" }: FocusTrendChartProps) {
  const [view, setView] = useState<"weekly" | "monthly">("weekly")
  const data = view === "weekly" ? weeklyData : monthlyData

  const chartData = useMemo(
    () => data.map(d => ({
      date: new Date(d.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      sessions: d.sessions,
      minutes: d.totalMinutes,
      focus: d.avgFocus,
    })),
    [data]
  )

  return (
    <div className={cn("rounded-2xl border bg-card p-6", className)}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Focus Trend</h2>
        </div>
        <div className="flex rounded-lg border p-0.5" role="radiogroup" aria-label="Chart period">
          <button
            onClick={() => setView("weekly")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-all",
              view === "weekly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            role="radio"
            aria-checked={view === "weekly"}
          >
            7 Days
          </button>
          <button
            onClick={() => setView("monthly")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-all",
              view === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            role="radio"
            aria-checked={view === "monthly"}
          >
            30 Days
          </button>
        </div>
      </div>

      <ChartContainer height={240}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="focus"
            name="Focus Score"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#focusGradient)"
            dot={{ r: 3, fill: "hsl(var(--primary))" }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="sessions"
            name="Sessions"
            stroke="hsl(var(--chart-2))"
            strokeWidth={1.5}
            fill="none"
            strokeDasharray="4 4"
            dot={false}
          />
        </AreaChart>
      </ChartContainer>

      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-sm" style={{ backgroundColor: "hsl(var(--primary))" }} />
          Focus Score
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t-2 border-dashed" style={{ borderColor: "hsl(var(--chart-2))" }} />
          Sessions
        </div>
      </div>
    </div>
  )
}

export default memo(FocusTrendChart)

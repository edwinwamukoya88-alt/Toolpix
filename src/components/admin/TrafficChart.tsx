"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { Calendar } from "lucide-react"
import ChartContainer from "@/components/chart-container"
import type { TrafficPoint } from "@/lib/analytics-utils"

const periods = ["24 Hours", "7 Days", "30 Days", "90 Days"] as const
const periodKeys: ("24h" | "7d" | "30d" | "90d")[] = ["24h", "7d", "30d", "90d"]

const seriesConfig = [
  { key: "users", label: "Users", color: "#3b82f6" },
  { key: "sessions", label: "Sessions", color: "#8b5cf6" },
  { key: "pageViews", label: "Page Views", color: "#06b6d4" },
]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border bg-card/95 backdrop-blur-sm px-4 py-3 shadow-xl text-sm space-y-1.5">
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold tabular-nums">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export default function TrafficChart({
  data,
  loading,
}: {
  data: TrafficPoint[]
  loading?: boolean
}) {
  const [mounted, setMounted] = useState(false)
  const [activePeriod, setActivePeriod] = useState<"24h" | "7d" | "30d" | "90d">("7d")
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(new Set(["users", "sessions", "pageViews"]))

  const toggleSeries = (key: string) => {
    setVisibleSeries(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <div className="h-6 w-40 rounded bg-muted animate-pulse mb-4" />
        <div className="h-[300px] rounded-xl bg-muted/50 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold">Traffic Overview</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Users, sessions and page views over time</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 mr-2">
            {seriesConfig.map(s => (
              <button
                key={s.key}
                onClick={() => toggleSeries(s.key)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                  visibleSeries.has(s.key)
                    ? "bg-muted text-foreground"
                    : "bg-transparent text-muted-foreground line-through opacity-50"
                }`}
                aria-pressed={visibleSeries.has(s.key)}
                aria-label={`Toggle ${s.label} series`}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
            {periodKeys.map((key, i) => (
              <button
                key={key}
                onClick={() => setActivePeriod(key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  activePeriod === key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-pressed={activePeriod === key}
              >
                {periods[i]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ChartContainer height={300}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
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
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString()}
          />
          <Tooltip content={<CustomTooltip />} />
          {seriesConfig.map(s => (
            visibleSeries.has(s.key) && (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                connectNulls
              />
            )
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  )
}

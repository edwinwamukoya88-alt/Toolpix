"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts"
import ChartContainer from "@/components/chart-container"
import type { CategoryPerformance } from "@/lib/analytics-utils"

const BAR_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#f97316"]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border bg-card/95 backdrop-blur-sm px-4 py-3 shadow-xl text-sm space-y-1">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground text-xs">{d.usage.toLocaleString()} uses · {d.share}% share</p>
      <p className={`text-xs ${d.growth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
        {d.growth >= 0 ? "+" : ""}{d.growth}% growth
      </p>
    </div>
  )
}

export default function CategoryBarChart({
  data,
  loading,
}: {
  data: CategoryPerformance[]
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <div className="h-5 w-44 rounded bg-muted animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="text-lg font-semibold mb-1">Category Performance</h2>
      <p className="text-xs text-muted-foreground mb-5">Usage by category</p>

      <ChartContainer height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 20, left: -10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString()}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            width={130}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="usage" radius={[0, 6, 6, 0]} maxBarSize={20}>
            {data.map((_, i) => (
              <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  )
}

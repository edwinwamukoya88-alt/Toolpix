"use client"

import { PieChart, Pie, Cell, Tooltip } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"
import ChartContainer from "@/components/chart-container"
import type { AcquisitionSource } from "@/lib/analytics-utils"

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"]

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border bg-card/95 backdrop-blur-sm px-4 py-3 shadow-xl text-sm space-y-1">
      <p className="font-medium">{d.source}</p>
      <p className="text-muted-foreground text-xs">{d.users.toLocaleString()} users</p>
    </div>
  )
}

export default function AcquisitionDonut({
  data,
  loading,
}: {
  data: AcquisitionSource[]
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <div className="h-5 w-36 rounded bg-muted animate-pulse mb-4" />
        <div className="h-[250px] rounded-xl bg-muted/50 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="text-lg font-semibold mb-1">User Acquisition</h2>
      <p className="text-xs text-muted-foreground mb-5">Traffic sources breakdown</p>

      <div className="flex items-center gap-6">
        <ChartContainer height={220} width={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="users"
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ChartContainer>

        <div className="flex-1 min-w-0 space-y-3">
          {data.map((source, i) => (
            <div key={source.source} className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{source.source}</span>
                  <span className="text-sm font-semibold tabular-nums">{source.percentage}%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{source.users.toLocaleString()} users</span>
                  <span className="flex items-center gap-0.5">
                    {source.direction === "up" ? (
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-400" />
                    )}
                    {source.trend}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

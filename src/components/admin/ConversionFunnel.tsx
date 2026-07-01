"use client"

import { Users, MousePointerClick, PlayCircle, CheckCircle, Repeat, ArrowDown } from "lucide-react"
import type { FunnelStage } from "@/lib/analytics-utils"

const stageIcons = [Users, MousePointerClick, PlayCircle, CheckCircle, Repeat]
const stageColors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"]

export default function ConversionFunnel({
  data,
  loading,
}: {
  data: FunnelStage[]
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <div className="h-5 w-40 rounded bg-muted animate-pulse mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const maxValue = data[0]?.value ?? 1

  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="text-lg font-semibold mb-1">Conversion Funnel</h2>
      <p className="text-xs text-muted-foreground mb-5">Visitor to return user conversion</p>

      <div className="space-y-3">
        {data.map((stage, i) => {
          const Icon = stageIcons[i] ?? Users
          const widthPct = (stage.value / maxValue) * 100

          return (
            <div key={stage.label}>
              <div className="relative flex items-center gap-4 py-3 px-4 rounded-xl bg-muted/30">
                <div
                  className="absolute inset-0 rounded-xl transition-all duration-700"
                  style={{
                    width: `${widthPct}%`,
                    background: `linear-gradient(90deg, ${stageColors[i]}20, ${stageColors[i]}08)`,
                    borderLeft: `2px solid ${stageColors[i]}50`,
                  }}
                />
                <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${stageColors[i]}20` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: stageColors[i] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{stage.label}</div>
                    <div className="text-xs text-muted-foreground">{stage.value.toLocaleString()}</div>
                  </div>
                  <div className="relative z-10 text-right shrink-0">
                    {i > 0 && (
                      <div className="text-sm font-semibold tabular-nums" style={{ color: stageColors[i] }}>
                        {stage.percentage}%
                      </div>
                    )}
                    {i > 0 && (
                      <div className="text-[10px] text-muted-foreground">conversion</div>
                    )}
                  </div>
                </div>
              </div>
              {i < data.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

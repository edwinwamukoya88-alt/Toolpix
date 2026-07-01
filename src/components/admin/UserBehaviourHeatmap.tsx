"use client"

import type { HeatmapData } from "@/lib/analytics-utils"

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i === 0 ? "12a" : i < 12 ? `${i}a` : i === 12 ? "12p" : `${i - 12}p`
)
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getColor(value: number, max: number): string {
  if (max === 0) return "bg-muted/30"
  const intensity = value / max
  if (intensity < 0.2) return "bg-blue-500/10"
  if (intensity < 0.35) return "bg-blue-500/25"
  if (intensity < 0.5) return "bg-blue-500/40"
  if (intensity < 0.65) return "bg-blue-500/55"
  if (intensity < 0.8) return "bg-blue-500/70"
  return "bg-blue-500/90"
}

export default function UserBehaviourHeatmap({
  data,
  loading,
}: {
  data: HeatmapData[]
  loading?: boolean
}) {
  const maxValue = Math.max(...data.map(d => d.value), 1)

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <div className="h-5 w-44 rounded bg-muted animate-pulse mb-4" />
        <div className="h-[200px] rounded-xl bg-muted/50 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="text-lg font-semibold mb-1">User Behaviour</h2>
      <p className="text-xs text-muted-foreground mb-4">Activity by day and hour</p>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="flex mb-1">
            <div className="w-10 shrink-0" />
            {HOURS.map((h, i) => (
              <div key={i} className="flex-1 text-[9px] text-muted-foreground text-center leading-none truncate" title={h}>
                {i % 3 === 0 ? h : ""}
              </div>
            ))}
          </div>
          {DAYS.map((day, dIdx) => (
            <div key={day} className="flex items-center mb-0.5">
              <div className="w-10 shrink-0 text-[10px] text-muted-foreground font-medium">{day}</div>
              {Array.from({ length: 24 }, (_, hIdx) => {
                const cell = data.find(d => d.day === day && d.hour === hIdx)
                const value = cell?.value ?? 0
                return (
                  <div
                    key={hIdx}
                    className={`flex-1 aspect-[1.2] rounded-sm ${getColor(value, maxValue)} transition-colors duration-200 cursor-default`}
                    title={`${day} ${HOURS[hIdx]}: ${value} activities`}
                    role="gridcell"
                    aria-label={`${day} ${HOURS[hIdx]}: ${value} activities`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-muted-foreground">Less</span>
        <div className="flex gap-0.5">
          {["bg-blue-500/10", "bg-blue-500/25", "bg-blue-500/40", "bg-blue-500/55", "bg-blue-500/70", "bg-blue-500/90"].map(c => (
            <div key={c} className={`h-3 w-3 rounded-sm ${c}`} />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>
    </div>
  )
}

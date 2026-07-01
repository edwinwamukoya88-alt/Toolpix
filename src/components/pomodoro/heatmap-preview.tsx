"use client"

import { memo, useMemo, useState } from "react"
import { Calendar, Info } from "lucide-react"
import type { HeatmapDay } from "@/lib/pomodoro-analytics"
import { cn } from "@/lib/utils"

interface HeatmapPreviewProps {
  data: HeatmapDay[]
  className?: string
}

const levelColors = [
  "bg-muted/30",
  "bg-emerald-500/20",
  "bg-emerald-500/40",
  "bg-emerald-500/60",
  "bg-emerald-500/80",
]

function HeatmapPreview({ data, className = "" }: HeatmapPreviewProps) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null)

  const weeks = useMemo(() => {
    const result: HeatmapDay[][] = []
    let currentWeek: HeatmapDay[] = []
    for (const day of data) {
      const dayOfWeek = new Date(day.date).getDay()
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        result.push(currentWeek)
        currentWeek = []
      }
      currentWeek.push(day)
    }
    if (currentWeek.length > 0) result.push(currentWeek)
    return result
  }, [data])

  const totalSessions = useMemo(() => data.reduce((sum, d) => sum + d.count, 0), [data])

  return (
    <div className={cn("rounded-2xl border bg-card p-6", className)}>
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
          <Calendar className="h-4 w-4 text-emerald-400" />
        </div>
        <h2 className="text-lg font-semibold">Focus Calendar</h2>
      </div>

      <div className="overflow-x-auto pb-2" role="grid" aria-label="Focus activity heatmap for last 90 days">
        <div className="flex gap-1 min-w-fit">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <div
                  key={day.date}
                  className={cn(
                    "h-3 w-3 rounded-sm transition-all duration-150 cursor-pointer",
                    levelColors[day.level],
                    hoveredDay?.date === day.date && "ring-1 ring-ring scale-125"
                  )}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  role="gridcell"
                  aria-label={`${day.date}: ${day.count} session${day.count !== 1 ? "s" : ""}`}
                  tabIndex={0}
                  onFocus={() => setHoveredDay(day)}
                  onBlur={() => setHoveredDay(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {hoveredDay && (
        <div className="mt-3 p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground flex items-center gap-2" aria-live="polite">
          <Info className="h-3 w-3 shrink-0" />
          <span>
            <strong className="text-foreground">{hoveredDay.date}</strong> — {hoveredDay.count} session{hoveredDay.count !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <span>{totalSessions} sessions in 90 days</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          {levelColors.map((color, i) => (
            <div key={i} className={cn("h-2.5 w-2.5 rounded-sm", color)} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}

export default memo(HeatmapPreview)

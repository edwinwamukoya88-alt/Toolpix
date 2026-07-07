import { CheckSquare, CreditCard, ImagePlus, Timer, StickyNote, Box } from "lucide-react"
import type { ToolUsageData } from "@/lib/ga4-mock"

const toolIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  planner: CheckSquare,
  "design-cards-studio": CreditCard,
  "image-converter": ImagePlus,
  pomodoro: Timer,
  notes: StickyNote,
}

const barColors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"]

export default function ToolUsageChart({
  data,
}: {
  data: ToolUsageData[]
}) {
  const sorted = [...data].sort((a, b) => b.totalClicks - a.totalClicks)
  const maxClicks = sorted[0]?.totalClicks ?? 1

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border bg-background/40 p-6 text-center text-sm text-muted-foreground">
        No tool usage data available yet.
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-background/40 p-6 space-y-5">
      <div>
        <h3 className="text-sm font-semibold">Tool Usage</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Total clicks per tool across all categories
        </p>
      </div>
      <div className="space-y-4">
        {sorted.map((tool, i) => {
          const Icon = toolIconMap[tool.toolSlug] ?? Box
          const pct = maxClicks > 0 ? (tool.totalClicks / maxClicks) * 100 : 0
          return (
            <div key={tool.toolSlug} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="font-medium truncate">{tool.toolName}</span>
                </div>
                <span className="text-muted-foreground tabular-nums shrink-0 ml-4">
                  {tool.totalClicks.toLocaleString()} clicks
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${barColors[i % barColors.length]}, ${barColors[i % barColors.length]}cc)`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

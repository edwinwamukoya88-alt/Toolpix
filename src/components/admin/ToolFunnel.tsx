import { Users, MousePointerClick, WandSparkles } from "lucide-react"
import type { FunnelStageData } from "@/lib/ga4-mock"

const stageConfig = [
  { icon: Users, color: "bg-blue-500" },
  { icon: MousePointerClick, color: "bg-emerald-500" },
  { icon: WandSparkles, color: "bg-violet-500" },
]

export default function ToolFunnel({
  data,
}: {
  data: FunnelStageData[]
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border bg-background/40 p-6 text-center text-sm text-muted-foreground">
        No funnel data available yet.
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-background/40 p-6 space-y-5">
      <div>
        <h3 className="text-sm font-semibold">Tool Funnel</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Conversion from visits to tool usage
        </p>
      </div>
      <div className="space-y-4">
        {data.map((stage, i) => {
          const StageIcon = stageConfig[i]?.icon ?? Users
          const colorClass = stageConfig[i]?.color ?? "bg-gray-500"

          return (
            <div key={stage.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <StageIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{stage.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium tabular-nums">
                    {stage.value.toLocaleString()}
                  </span>
                  {i > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ({stage.percentage}%)
                    </span>
                  )}
                </div>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
                  style={{
                    width: i === 0 ? "100%" : `${stage.percentage}%`,
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

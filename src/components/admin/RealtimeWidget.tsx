import { Users, Eye } from "lucide-react"
import type { RealtimeData } from "@/lib/ga4-mock"

export default function RealtimeWidget({
  data,
}: {
  data: RealtimeData | null
}) {
  if (!data) {
    return (
      <div className="rounded-xl border bg-background/40 p-6 text-center text-sm text-muted-foreground">
        No realtime data available yet.
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-background/40 p-6 space-y-5">
      <div className="flex items-center gap-2">
        <div className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-medium text-green-500 uppercase tracking-wider">
          Live
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold tabular-nums">{data.activeUsers}</span>
        <span className="text-sm text-muted-foreground">active users</span>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">in the last 30 minutes</p>

      <div className="space-y-2 pt-2 border-t">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Eye className="h-3 w-3" />
          <span>Currently visiting</span>
        </div>
        {data.topPages.map((page) => (
          <div
            key={page.path}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-muted-foreground font-mono text-xs">
              {page.path}
            </span>
            <div className="flex items-center gap-1.5">
              <div
                className="h-1.5 rounded-full bg-primary/30"
                style={{
                  width: `${Math.max(4, (page.activeUsers / Math.max(data.activeUsers, 1)) * 60)}px`,
                }}
              />
              <span className="text-xs font-medium tabular-nums w-8 text-right">
                {page.activeUsers}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

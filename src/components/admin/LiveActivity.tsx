"use client"

import { Globe, Activity, Zap, MapPin } from "lucide-react"
import type { LiveActivityData } from "@/lib/analytics-utils"

function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
    </span>
  )
}

function TimeAgo({ timestamp }: { timestamp: string }) {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  return `${Math.floor(seconds / 60)}m ago`
}

export default function LiveActivity({ data }: { data?: LiveActivityData }) {
  if (!data) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-center">
        <div className="flex justify-center mb-3">
          <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
            <Zap className="h-5 w-5 text-muted-foreground/50" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">No realtime data available</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Live activity requires GA4 Realtime API access</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold">Live Activity</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time platform monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <LiveDot />
          <span className="text-xs font-medium text-emerald-400">LIVE</span>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold tabular-nums">{data.activeUsers}</span>
          <span className="text-sm text-muted-foreground">active now</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Globe className="h-3 w-3" />
            Top Pages
          </div>
          {data.pages.length === 0 ? (
            <p className="text-xs text-muted-foreground/60">No page data</p>
          ) : (
            data.pages.map((page) => (
              <div key={page.path} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground truncate max-w-[140px]">{page.path}</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 rounded-full bg-primary/30" style={{ width: `${Math.max(4, (page.users / Math.max(data.activeUsers, 1)) * 50)}px` }} />
                  <span className="font-medium tabular-nums w-6 text-right">{page.users}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Zap className="h-3 w-3" />
            Active Tools
          </div>
          {data.activeTools.length === 0 ? (
            <p className="text-xs text-muted-foreground/60">No active tools</p>
          ) : (
            data.activeTools.map((tool) => (
              <div key={tool.name} className="flex items-center justify-between text-xs">
                <span className="truncate max-w-[140px]">{tool.name}</span>
                <span className="font-medium tabular-nums">{tool.users} users</span>
              </div>
            ))
          )}
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mt-3">
            <MapPin className="h-3 w-3" />
            Top Locations
          </div>
          {data.locations.length === 0 ? (
            <p className="text-xs text-muted-foreground/60">No location data</p>
          ) : (
            data.locations.map((loc) => (
              <div key={loc.name} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{loc.name}</span>
                <span className="font-medium tabular-nums">{loc.users} users</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
          <Activity className="h-3 w-3" />
          Recent Events
        </div>
        {data.recentEvents.length === 0 ? (
          <p className="text-xs text-muted-foreground/60">No recent events</p>
        ) : (
          <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
            {data.recentEvents.map((evt, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="truncate max-w-[220px]">{evt.action}</span>
                <span className="text-muted-foreground shrink-0 ml-2 tabular-nums">
                  <TimeAgo timestamp={evt.timestamp} />
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

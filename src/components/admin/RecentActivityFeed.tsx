"use client"

import { FileText, Wrench, CheckCircle, Scan, Search, StickyNote, Timer, DollarSign, Repeat, type LucideIcon } from "lucide-react"
import type { ActivityEvent } from "@/lib/analytics-utils"

const iconMap: Record<string, LucideIcon> = {
  FileText, Wrench, CheckCircle, Scan, Search, StickyNote, Timer, DollarSign, Repeat,
}

function TimeAgo({ timestamp }: { timestamp: string }) {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function RecentActivityFeed({
  events,
  loading,
}: {
  events: ActivityEvent[]
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <div className="h-5 w-36 rounded bg-muted animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="text-lg font-semibold mb-1">Recent Activity</h2>
      <p className="text-xs text-muted-foreground mb-5">Latest platform events</p>

      <div className="space-y-0">
        {events.map((event, i) => {
          const Icon = iconMap[event.icon] ?? Activity
          return (
            <div key={event.id} className="flex gap-3 pb-4 last:pb-0 relative">
              {i < events.length - 1 && (
                <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
              )}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted relative z-10">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{event.action}</p>
                  <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                    <TimeAgo timestamp={event.timestamp} />
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{event.detail}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Activity(props: any) { return <svg {...props} /> }

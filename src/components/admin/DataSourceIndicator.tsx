"use client"

import { CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react"

interface DataSourceIndicatorProps {
  source: string
  status: "available" | "unavailable" | "not_configured" | "loading" | "error"
  lastUpdated?: number | null
  error?: string | null
}

export default function DataSourceIndicator({ source, status, lastUpdated, error }: DataSourceIndicatorProps) {
  const timeStr = lastUpdated
    ? new Date(lastUpdated).toISOString().replace("T", " ").slice(0, 19) + " UTC"
    : null

  return (
    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 border-t pt-2 mt-2">
      {status === "available" && (
        <>
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          <span className="font-medium text-emerald-400/80 uppercase tracking-wider">{source}</span>
          <span className="text-muted-foreground/50">|</span>
          <Clock className="h-3 w-3" />
          <span>Last synced: {timeStr ?? "..."}</span>
        </>
      )}
      {status === "not_configured" && (
        <>
          <XCircle className="h-3 w-3 text-amber-400" />
          <span className="font-medium text-amber-400/80 uppercase tracking-wider">{source}</span>
          <span className="text-muted-foreground/50">|</span>
          <span className="text-amber-400/70">Configuration required</span>
        </>
      )}
      {status === "unavailable" && (
        <>
          <XCircle className="h-3 w-3 text-red-400" />
          <span className="font-medium text-red-400/80 uppercase tracking-wider">{source}</span>
          <span className="text-muted-foreground/50">|</span>
          <span className="text-red-400/70">Unavailable</span>
        </>
      )}
      {status === "error" && (
        <>
          <XCircle className="h-3 w-3 text-red-400" />
          <span className="font-medium text-red-400/80 uppercase tracking-wider">{source}</span>
          <span className="text-muted-foreground/50">|</span>
          <span className="text-red-400/70 max-w-[200px] truncate" title={error ?? ""}>{error ?? "Error"}</span>
        </>
      )}
      {status === "loading" && (
        <>
          <RefreshCw className="h-3 w-3 text-muted-foreground animate-spin" />
          <span className="font-medium text-muted-foreground/80 uppercase tracking-wider">{source}</span>
          <span className="text-muted-foreground/50">|</span>
          <span>Loading...</span>
        </>
      )}
    </div>
  )
}

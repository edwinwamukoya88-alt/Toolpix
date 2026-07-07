"use client"

import { useState } from "react"
import { Calendar, ArrowLeftRight, Download, RefreshCw, ChevronDown, FileSpreadsheet, FileDown, FileText } from "lucide-react"
import { useAnalytics } from "@/contexts/analytics-context"
import type { ExportFormat } from "@/lib/export-utils"

const dateRanges = [
  { label: "Today", value: "today" as const },
  { label: "Yesterday", value: "yesterday" as const },
  { label: "Last 7 days", value: "last7" as const },
  { label: "Last 30 days", value: "last30" as const },
  { label: "Last 90 days", value: "last90" as const },
]

export default function AnalyticsHeader({
  onRefresh,
  loading,
  onExport,
}: {
  onRefresh?: () => void
  loading?: boolean
  onExport?: (format: ExportFormat) => void
}) {
  const { dateRange, setDateRange, comparePrevious, setComparePrevious } = useAnalytics()
  const [open, setOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  const currentLabel = dateRanges.find(r => r.value === dateRange)?.label ?? "Last 7 days"

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Growth & Analytics Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-xl">
          Monitor traffic, engagement, tool usage, SEO performance, and growth metrics across the entire platform.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            {currentLabel}
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-xl border bg-card shadow-2xl py-1" role="listbox">
                {dateRanges.map(r => (
                  <button
                    key={r.value}
                    onClick={() => { setDateRange(r.value); setOpen(false) }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-muted ${dateRange === r.value ? "text-primary font-medium" : "text-muted-foreground"}`}
                    role="option"
                    aria-selected={dateRange === r.value}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => setComparePrevious(!comparePrevious)}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            comparePrevious ? "bg-primary/10 border-primary/30 text-primary" : "bg-background text-muted-foreground hover:text-foreground"
          }`}
          aria-pressed={comparePrevious}
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          Compare
        </button>

        <div className="relative">
          <button
            onClick={() => setExportOpen(!exportOpen)}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
          {exportOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-xl border bg-card shadow-2xl py-1">
                <button
                  onClick={() => { onExport?.("csv"); setExportOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Export CSV
                </button>
                <button
                  onClick={() => { onExport?.("pdf"); setExportOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Export PDF
                </button>
                <button
                  onClick={() => { onExport?.("excel"); setExportOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  Export Excel
                </button>
              </div>
            </>
          )}
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>
    </div>
  )
}

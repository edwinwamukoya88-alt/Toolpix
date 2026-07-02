"use client"

import { useState, useMemo } from "react"
import { Search, ArrowUpDown, BarChart3 } from "lucide-react"
import type { SearchConsoleRow } from "@/lib/analytics-utils"

type SortKey = "clicks" | "impressions" | "ctr" | "position"

function MiniTrendChart({ data }: { data: number[] }) {
  const width = 60
  const height = 24
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(" ")
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-[60px] h-6" aria-hidden="true">
      <polyline fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  )
}

export default function SearchConsoleInsights({
  data,
  loading,
}: {
  data: SearchConsoleRow[] | null
  loading?: boolean
}) {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("clicks")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const filtered = useMemo(() => {
    if (!data || data.length === 0) return []
    let result = [...data]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(r => r.keyword.toLowerCase().includes(q))
    }
    result.sort((a, b) => {
      const factor = sortDir === "desc" ? -1 : 1
      if (sortKey === "clicks") return (a.clicks - b.clicks) * factor
      if (sortKey === "impressions") return (a.impressions - b.impressions) * factor
      if (sortKey === "ctr") return (a.ctr - b.ctr) * factor
      return (a.position - b.position) * factor
    })
    return result
  }, [data, search, sortKey, sortDir])

  if (!data || data.length === 0) {
    return null
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("desc") }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <div className="h-5 w-44 rounded bg-muted animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold">Search Console Insights</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Top performing keywords</p>
        </div>
        <div className="relative w-full sm:w-52">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search keywords..."
            className="w-full rounded-lg border bg-background pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            aria-label="Search keywords"
          />
        </div>
      </div>

      <div className="overflow-x-auto -mx-6">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="text-left font-medium pb-3 pl-6 pr-3">Keyword</th>
              {[
                { key: "position" as SortKey, label: "Position" },
                { key: "ctr" as SortKey, label: "CTR" },
                { key: "clicks" as SortKey, label: "Clicks" },
                { key: "impressions" as SortKey, label: "Impressions" },
              ].map(col => (
                <th
                  key={col.label}
                  className={`text-right font-medium pb-3 px-2 ${col.key ? "cursor-pointer hover:text-foreground transition-colors" : ""}`}
                  onClick={() => col.key && handleSort(col.key)}
                  aria-sort={col.key === sortKey ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
                >
                  <div className="inline-flex items-center gap-1">
                    {col.label}
                    {col.key && <ArrowUpDown className={`h-3 w-3 ${col.key === sortKey ? "text-primary" : ""}`} />}
                  </div>
                </th>
              ))}
              <th className="text-right font-medium pb-3 pr-6">Trend</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.keyword} className="border-b border-muted/30 last:border-0 hover:bg-muted/20 transition-colors">
                <td className="py-3 pl-6 pr-3">
                  <div className="flex items-center gap-2">
                    <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate max-w-[200px]">{row.keyword}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-right tabular-nums">
                  <span className={row.position <= 5 ? "text-emerald-400" : row.position <= 10 ? "text-amber-400" : "text-muted-foreground"}>
                    {row.position.toFixed(1)}
                  </span>
                </td>
                <td className="py-3 px-2 text-right tabular-nums">{row.ctr}%</td>
                <td className="py-3 px-2 text-right tabular-nums font-medium">{row.clicks}</td>
                <td className="py-3 px-2 text-right tabular-nums text-muted-foreground">{row.impressions.toLocaleString()}</td>
                <td className="py-3 pr-6 text-right">
                  <MiniTrendChart data={row.trend} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

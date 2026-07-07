"use client"

import { useState, useMemo } from "react"
import { Search, ArrowUpDown, FileText, TrendingUp } from "lucide-react"
import type { BlogPerformanceRow } from "@/lib/analytics-utils"

type SortKey = "views" | "uniqueVisitors" | "bounceRate" | "scrollDepth" | "engagementScore" | "organicTraffic"

export default function BlogPerformanceTable({
  data,
  loading,
}: {
  data: BlogPerformanceRow[]
  loading?: boolean
}) {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("views")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const filtered = useMemo(() => {
    let result = [...data]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(r => r.article.toLowerCase().includes(q))
    }
    result.sort((a, b) => {
      const factor = sortDir === "desc" ? -1 : 1
      if (sortKey === "views") return (a.views - b.views) * factor
      if (sortKey === "uniqueVisitors") return (a.uniqueVisitors - b.uniqueVisitors) * factor
      if (sortKey === "bounceRate") return (a.bounceRate - b.bounceRate) * factor
      if (sortKey === "scrollDepth") return (a.scrollDepth - b.scrollDepth) * factor
      if (sortKey === "engagementScore") return (a.engagementScore - b.engagementScore) * factor
      return (a.organicTraffic - b.organicTraffic) * factor
    })
    return result
  }, [data, search, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("desc") }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <div className="h-5 w-36 rounded bg-muted animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold">Blog Performance</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} articles tracked</p>
        </div>
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full rounded-lg border bg-background pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            aria-label="Search blog articles"
          />
        </div>
      </div>

      <div className="overflow-x-auto -mx-6">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="text-left font-medium pb-3 pl-6 pr-3">Article</th>
              {[
                { key: "views" as SortKey, label: "Views" },
                { key: "uniqueVisitors" as SortKey, label: "Visitors" },
                { key: null, label: "Avg Read" },
                { key: "bounceRate" as SortKey, label: "Bounce" },
                { key: "scrollDepth" as SortKey, label: "Scroll" },
                { key: "engagementScore" as SortKey, label: "Engagement" },
                { key: "organicTraffic" as SortKey, label: "Organic" },
              ].map(col => (
                <th
                  key={col.label}
                  className={`text-right font-medium pb-3 px-2 last:pr-6 ${col.key ? "cursor-pointer hover:text-foreground transition-colors" : ""}`}
                  onClick={() => col.key && handleSort(col.key)}
                  aria-sort={col.key === sortKey ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
                >
                  <div className="inline-flex items-center gap-1">
                    {col.label}
                    {col.key && <ArrowUpDown className={`h-3 w-3 ${col.key === sortKey ? "text-primary" : ""}`} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.slug} className="border-b border-muted/30 last:border-0 hover:bg-muted/20 transition-colors">
                <td className="py-3 pl-6 pr-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate max-w-[220px] font-medium">{row.article}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-right tabular-nums">{row.views.toLocaleString()}</td>
                <td className="py-3 px-2 text-right tabular-nums text-muted-foreground">{row.uniqueVisitors.toLocaleString()}</td>
                <td className="py-3 px-2 text-right tabular-nums text-muted-foreground">{row.avgReadTime}</td>
                <td className="py-3 px-2 text-right tabular-nums">
                  <span className={row.bounceRate < 35 ? "text-emerald-400" : row.bounceRate < 50 ? "text-amber-400" : "text-red-400"}>
                    {row.bounceRate}%
                  </span>
                </td>
                <td className="py-3 px-2 text-right tabular-nums">{row.scrollDepth}%</td>
                <td className="py-3 px-2 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <div className="h-1.5 w-10 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${row.engagementScore}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums">{row.engagementScore}%</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-right tabular-nums last:pr-6">{row.organicTraffic.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

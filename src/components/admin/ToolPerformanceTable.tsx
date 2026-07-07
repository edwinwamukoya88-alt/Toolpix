"use client"

import { useState, useMemo } from "react"
import { Search, ArrowUpDown, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Trophy, Medal, Award } from "lucide-react"
import type { ToolPerformanceRow } from "@/lib/analytics-utils"
import { categories } from "@/lib/tools-data"

type SortKey = "rank" | "launches" | "uniqueUsers" | "completionRate" | "trend"

const rankBadge = (rank: number) => {
  if (rank === 1) return { icon: Trophy, className: "text-yellow-400" }
  if (rank === 2) return { icon: Medal, className: "text-gray-300" }
  if (rank === 3) return { icon: Award, className: "text-amber-600" }
  return null
}

export default function ToolPerformanceTable({
  data,
  loading,
}: {
  data: ToolPerformanceRow[]
  loading?: boolean
}) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [sortKey, setSortKey] = useState<SortKey>("launches")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(0)
  const pageSize = 8

  const filtered = useMemo(() => {
    let result = [...data]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(t => t.toolName.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
    }
    if (categoryFilter !== "All") {
      result = result.filter(t => t.category === categoryFilter)
    }
    result.sort((a, b) => {
      const factor = sortDir === "desc" ? -1 : 1
      if (sortKey === "rank") return (a.rank - b.rank) * factor
      if (sortKey === "launches") return (a.launches - b.launches) * factor
      if (sortKey === "uniqueUsers") return (a.uniqueUsers - b.uniqueUsers) * factor
      if (sortKey === "completionRate") return (a.completionRate - b.completionRate) * factor
      return (a.trend - b.trend) * factor
    })
    return result
  }, [data, search, categoryFilter, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const pageData = filtered.slice(page * pageSize, (page + 1) * pageSize)

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("desc") }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <div className="h-6 w-48 rounded bg-muted animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold">Tool Performance</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} tools tracked</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              placeholder="Search tools..."
              className="w-full rounded-lg border bg-background pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              aria-label="Search tools"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(0) }}
            className="rounded-lg border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary/50"
            aria-label="Filter by category"
          >
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto -mx-6">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              {[
                { key: "rank" as SortKey, label: "Rank" },
                { key: null, label: "Tool" },
                { key: null, label: "Category" },
                { key: "launches" as SortKey, label: "Launches" },
                { key: "uniqueUsers" as SortKey, label: "Users" },
                { key: null, label: "Avg Duration" },
                { key: "completionRate" as SortKey, label: "Completion" },
                { key: "trend" as SortKey, label: "Trend" },
              ].map(col => (
                <th
                  key={col.label}
                  className={`text-left font-medium pb-3 px-3 first:pl-6 last:pr-6 ${col.key ? "cursor-pointer hover:text-foreground transition-colors" : ""}`}
                  onClick={() => col.key && handleSort(col.key)}
                  aria-sort={col.key === sortKey ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.key && <ArrowUpDown className={`h-3 w-3 ${col.key === sortKey ? "text-primary" : ""}`} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row) => {
              const Badge = rankBadge(row.rank)
              return (
                <tr key={row.toolSlug} className="border-b border-muted/30 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-3 first:pl-6">
                    <div className="flex items-center gap-1.5">
                      {Badge ? <Badge.icon className={`h-4 w-4 ${Badge.className}`} /> : (
                        <span className="w-4 text-center text-xs text-muted-foreground">{row.rank}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium">{row.toolName}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-xs text-muted-foreground">{row.category}</span>
                  </td>
                  <td className="py-3 px-3 tabular-nums">{row.launches.toLocaleString()}</td>
                  <td className="py-3 px-3 tabular-nums text-muted-foreground">{row.uniqueUsers.toLocaleString()}</td>
                  <td className="py-3 px-3 text-muted-foreground tabular-nums">{row.avgDuration}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${row.completionRate}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums">{row.completionRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 last:pr-6">
                    <div className="flex items-center gap-1">
                      {row.direction === "up" ? (
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                      )}
                      <span className={`text-xs font-medium tabular-nums ${row.direction === "up" ? "text-emerald-400" : "text-red-400"}`}>
                        {row.trend}%
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <span className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg p-1.5 hover:bg-muted transition-colors disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-lg p-1.5 hover:bg-muted transition-colors disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

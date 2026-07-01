"use client"

import { TrendingUp, TrendingDown, Flame, FileText, Wrench, BarChart3 } from "lucide-react"
import Link from "next/link"
import type { TrendingItem } from "@/lib/analytics-utils"

const typeIcons = {
  blog: FileText,
  tool: Wrench,
  category: BarChart3,
}

const typeLabels = {
  blog: "Blog Post",
  tool: "Tool",
  category: "Category",
}

export default function TrendingContent({
  data,
  loading,
}: {
  data: TrendingItem[]
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <div className="h-5 w-40 rounded bg-muted animate-pulse mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10">
          <Flame className="h-4 w-4 text-orange-400" />
        </div>
        <h2 className="text-lg font-semibold">Trending Now</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.slice(0, 9).map((item, i) => {
          const Icon = typeIcons[item.type] ?? FileText
          return (
            <Link
              key={i}
              href={item.href || "#"}
              className="group rounded-xl border bg-muted/20 p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {typeLabels[item.type]}
                  </span>
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-semibold shrink-0 ${item.growth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {item.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(item.growth)}%
                </div>
              </div>
              <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

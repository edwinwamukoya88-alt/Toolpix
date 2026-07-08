"use client"

import { Suspense, useState, useMemo, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowRight, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import ToolCard from "@/components/tool-card"
import SearchBar from "@/components/search-bar"
import { tools, categories } from "@/lib/tools-data"
import { trackSearch } from "@/lib/analytics"
import Link from "next/link"

function ToolsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("q") || "")
  const [activeCat, setActiveCat] = useState(searchParams.get("category") || "All")

  const isFiltering = activeCat !== "All" || search.trim().length > 0

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      if (activeCat !== "All" && t.category !== activeCat) return false
      if (search) {
        const q = search.toLowerCase()
        return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      }
      return true
    })
  }, [search, activeCat])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof tools>()
    for (const tool of tools) {
      const cat = tool.category
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(tool)
    }
    return Array.from(map.entries())
  }, [])

  const searchTimer = useRef<number | null>(null)

  const handleSearch = useCallback((val: string) => {
    setSearch(val)
    if (searchTimer.current !== null) window.clearTimeout(searchTimer.current)
    searchTimer.current = window.setTimeout(() => {
      if (val.trim()) trackSearch(val)
    }, 600)
  }, [])

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Tools</h1>
        <p className="text-muted-foreground mt-1">{tools.length} free utilities at your fingertips</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search 44+ utility tools..." />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0 flex-nowrap">
          {["All", ...categories].map((cat) => (
            <Button
              key={cat}
              variant={activeCat === cat ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (cat === "AI Assistant") {
                  router.push("/tools/ai-workspace")
                } else {
                  setActiveCat(cat)
                }
              }}
              className="text-xs shrink-0 min-h-[44px]"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-muted-foreground text-lg">No tools found</p>
          <p className="text-sm text-muted-foreground">Try a different search or category</p>
        </div>
      ) : isFiltering ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((tool) => (
            <ToolCard key={tool.slug} {...tool} />
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {grouped.map(([category, catTools]) => (
            <section key={category}>
              <div className="flex items-center gap-2 mb-4">
                <LayoutGrid className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">{category}</h2>
                <span className="text-xs text-muted-foreground">({catTools.length} tools)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {catTools.map((tool) => (
                  <ToolCard key={tool.slug} {...tool} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ToolsPage() {
  return (
    <Suspense fallback={<div className="container py-8"><div className="h-96 animate-pulse bg-muted rounded-xl" /></div>}>
      <ToolsContent />
    </Suspense>
  )
}

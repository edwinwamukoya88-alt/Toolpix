"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"
import { CATEGORIES } from "../data"
import type { FeatureCategory } from "../types"

interface CategoryTabsProps {
  activeCategory: FeatureCategory
  onCategoryChange: (cat: FeatureCategory) => void
}

export default memo(function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-3 sm:-mx-4 px-3 sm:px-4 md:mx-0 md:px-0">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon
        const isActive = activeCategory === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onCategoryChange(cat.id)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all shrink-0 min-h-[44px] touch-manipulation border active:scale-[0.97]",
              isActive
                ? "bg-primary/12 text-primary border-primary/25 shadow-sm"
                : "bg-card/60 text-muted-foreground hover:text-foreground hover:bg-card border-border/40 hover:border-border/60",
            )}
            aria-pressed={isActive}
            aria-label={`${cat.label} tools`}
          >
            <Icon className={cn("h-4 w-4 shrink-0", cat.color)} />
            <span>{cat.label}</span>
          </button>
        )
      })}
    </div>
  )
})

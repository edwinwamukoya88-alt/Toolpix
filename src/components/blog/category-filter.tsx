"use client"

import { cn } from "@/lib/utils"
import { blogCategories } from "@/lib/blog-types"

interface CategoryFilterProps {
  selected: string | null
  onChange: (category: string | null) => void
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={cn(
          "inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
          selected === null
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-primary/30"
        )}
      >
        All
      </button>
      {blogCategories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat === selected ? null : cat)}
          className={cn(
            "inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
            selected === cat
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-primary/30"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

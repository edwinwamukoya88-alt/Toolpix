"use client"

import { cn } from "@/lib/utils"
import type { FeatureDef } from "../types"

interface FeatureChipsProps {
  features: FeatureDef[]
  activeFeature: string | null
  onSelect: (id: string) => void
}

export default function FeatureChips({ features, activeFeature, onSelect }: FeatureChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-3 sm:-mx-4 px-3 sm:px-4 md:mx-0 md:px-0">
      {features.map((feat) => {
        const Icon = feat.icon
        const isActive = activeFeature === feat.id
        return (
          <button
            key={feat.id}
            onClick={() => onSelect(feat.id)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all shrink-0 min-h-[48px] touch-manipulation border",
              isActive
                ? "bg-primary/10 text-primary border-primary/30 shadow-sm"
                : "bg-card text-muted-foreground hover:text-foreground border-border/40 hover:border-border/70",
            )}
            aria-pressed={isActive}
            aria-label={feat.name}
          >
            <Icon className={cn("h-4 w-4 shrink-0", feat.color)} />
            <span>{feat.name}</span>
          </button>
        )
      })}
    </div>
  )
}

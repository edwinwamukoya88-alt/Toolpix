"use client"

import { memo } from "react"
import { Sparkles, History } from "lucide-react"
import type { FeatureDef } from "../types"

interface HeaderProps {
  feature: FeatureDef | undefined
  onHistoryClick: () => void
}

export default memo(function Header({ feature, onHistoryClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/30 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-3 sm:px-4 md:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-sm font-semibold hidden sm:block">AI Assistant</h1>
        </div>

        {feature && (
          <div className="hidden sm:flex items-center gap-1.5 ml-1">
            <span className="text-muted-foreground/40">/</span>
            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
              {feature.name}
            </span>
          </div>
        )}

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onHistoryClick}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl hover:bg-muted/50 transition-colors"
            aria-label="View history"
          >
            <History className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  )
})

"use client"

import { memo } from "react"
import { Loader2, Sparkles, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface PromptEditorProps {
  value: string
  onChange: (v: string) => void
  placeholder: string
  disabled: boolean
  usageRemaining: number
  onGenerate: () => void
  isGenerating: boolean
  hasFeature: boolean
  error: string | null
  featureName?: string
}

function getButtonLabel(featureName: string | undefined): string {
  if (!featureName) return "Generate"
  return `Generate ${featureName}`
}

export default memo(function PromptEditor({
  value,
  onChange,
  placeholder,
  disabled,
  usageRemaining,
  onGenerate,
  isGenerating,
  hasFeature,
  error,
  featureName,
}: PromptEditorProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="relative rounded-2xl border border-border/25 bg-card/40 shadow-sm overflow-hidden focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15 focus-within:shadow-lg focus-within:shadow-primary/5 transition-all duration-200">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Ask AI Assistant anything or paste text to rewrite, humanize, summarize, translate, improve, or generate professional content."}
          disabled={disabled}
          rows={5}
          className="w-full min-h-[180px] sm:min-h-[200px] resize-y bg-transparent px-5 sm:px-6 pt-5 sm:pt-6 pb-3 text-sm sm:text-base leading-relaxed text-foreground placeholder:text-muted-foreground/25 outline-none disabled:opacity-50 transition-all"
          style={{ WebkitTextSizeAdjust: "100%" }}
          aria-label="Input text"
        />
        <div className="flex items-center justify-between border-t border-border/15 px-5 sm:px-6 py-2">
          <span className="text-[11px] tabular-nums text-muted-foreground/40">
            {value.length} <span className="hidden sm:inline">characters</span><span className="sm:hidden">ch</span>
          </span>
          <span className="text-[11px] tabular-nums text-muted-foreground/40">
            {usageRemaining} / 5 daily
          </span>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground/35 px-1 -mt-1">
        AI responses may contain mistakes. Review important information before using it.
      </p>

      <button
        type="button"
        onClick={onGenerate}
        disabled={!value.trim() || !hasFeature || isGenerating || usageRemaining <= 0}
        className={cn(
          "relative flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all min-h-[52px] touch-manipulation",
          "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          "shadow-lg shadow-primary/20",
        )}
        aria-label={isGenerating ? "Generating..." : (featureName ? `Generate ${featureName}` : "Generate")}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            <span>{getButtonLabel(featureName)}</span>
          </>
        )}
      </button>

      {error && (
        <div
          className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-3 sm:p-4"
          role="alert"
        >
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-400">Error</p>
            <p className="text-sm text-red-300/80 mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
})

"use client"

import { Loader2, Sparkles, AlertCircle } from "lucide-react"
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

const FEATURE_EMOJIS: Record<string, string> = {
  "Lesson Plan": "📘",
  "Assessment": "📝",
  "Comments": "💬",
  "Scheme of Work": "📚",
  "Revision": "🎯",
  "Bulk Comments": "📋",
  "Follow-up": "🔄",
}

function getButtonLabel(featureName: string | undefined, isGen: boolean): string {
  if (isGen) return "Generating..."
  const emoji = (featureName && FEATURE_EMOJIS[featureName]) || "✨"
  return `${emoji} Generate${featureName ? ` ${featureName}` : ""}`
}

export default function PromptEditor({
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
    <div className="space-y-4">
      <div className="relative rounded-2xl border border-border/35 bg-card shadow-sm overflow-hidden">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Describe what you need..."}
          disabled={disabled}
          rows={6}
          className="w-full min-h-[180px] resize-y bg-transparent px-4 py-4 text-[16px] leading-relaxed text-foreground placeholder:text-muted-foreground/40 outline-none disabled:opacity-50"
          style={{ WebkitTextSizeAdjust: "100%" }}
        />
        <div className="flex items-center justify-between border-t border-border/25 px-4 py-2.5">
          <span className="text-xs text-muted-foreground/70">
            {value.length} characters
          </span>
          <span className="text-xs text-muted-foreground/70">
            {usageRemaining} / 5 daily
          </span>
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={!value.trim() || !hasFeature || isGenerating || usageRemaining <= 0}
        className={cn(
          "relative flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all min-h-[52px] touch-manipulation",
          "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          "shadow-lg shadow-primary/20",
        )}
        aria-label={isGenerating ? "Generating..." : "Generate"}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            {getButtonLabel(featureName, false)}
          </>
        )}
      </button>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-400">Error</p>
            <p className="text-sm text-red-300/80 mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}

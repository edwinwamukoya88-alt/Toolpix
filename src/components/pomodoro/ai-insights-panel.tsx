"use client"

import { memo } from "react"
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Clock,
  Sun,
  Brain,
  Coffee,
  Calendar,
  Flame,
  type LucideIcon,
} from "lucide-react"
import type { AIInsight } from "@/lib/pomodoro-analytics"
import { cn } from "@/lib/utils"

const iconMap: Record<string, LucideIcon> = {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Sun,
  Brain,
  Coffee,
  Calendar,
  Flame,
  Sparkles,
  AlertTriangle,
}

const typeConfig = {
  achievement: {
    icon: Sparkles,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    label: "Achievement",
  },
  tip: {
    icon: Lightbulb,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    label: "Tip",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    label: "Warning",
  },
  milestone: {
    icon: Target,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    label: "Milestone",
  },
}

function Lightbulb({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  )
}

interface AIInsightsPanelProps {
  insights: AIInsight[]
  className?: string
}

function AIInsightsPanel({ insights, className = "" }: AIInsightsPanelProps) {
  if (insights.length === 0) return null

  return (
    <div className={cn("rounded-2xl border bg-card p-6", className)}>
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">AI Insights</h2>
      </div>

      <div className="space-y-3" role="list" aria-label="Personalized insights">
        {insights.map((insight, i) => {
          const cfg = typeConfig[insight.type]
          const Icon = iconMap[insight.icon] ?? cfg.icon
          return (
            <div
              key={i}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3 transition-all duration-200 hover:translate-x-0.5",
                cfg.border,
                cfg.bg
              )}
              role="listitem"
            >
              <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", cfg.color)} />
              <div className="flex-1 min-w-0">
                <span className={cn("text-xs font-semibold uppercase tracking-wider mb-0.5 block", cfg.color)}>
                  {cfg.label}
                </span>
                <p className="text-sm text-muted-foreground">{insight.message}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default memo(AIInsightsPanel)

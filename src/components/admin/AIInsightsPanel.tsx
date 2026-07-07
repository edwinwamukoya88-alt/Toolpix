"use client"

import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, Sparkles, ArrowRight, BarChart3 } from "lucide-react"
import type { AIInsight } from "@/lib/analytics-utils"

const config = {
  positive: { icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  negative: { icon: TrendingDown, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  recommendation: { icon: Lightbulb, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  neutral: { icon: BarChart3, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
}

export default function AIInsightsPanel({
  insights,
  loading,
}: {
  insights: AIInsight[] | null
  loading?: boolean
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <div className="h-5 w-36 rounded bg-muted animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">AI Insights</h2>
        </div>
        <p className="text-sm text-muted-foreground text-center py-6">No insights available yet. Data from connected sources will generate insights automatically.</p>
      </div>
    )
  }

  const positives = insights.filter(i => i.type === "positive")
  const negatives = insights.filter(i => i.type === "negative")
  const neutrals = insights.filter(i => i.type === "neutral")
  const recommendations = insights.filter(i => i.type === "recommendation")

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">AI Insights</h2>
      </div>

      <div className="space-y-4">
        {positives.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" />
              Positive Signals
            </h3>
            <div className="space-y-2">
              {positives.map((insight, i) => {
                const cfg = config[insight.type]
                return (
                  <div key={i} className={`flex items-start gap-3 rounded-xl border ${cfg.border} ${cfg.bg} p-3`}>
                    <cfg.icon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.color}`} />
                    <p className="text-sm text-muted-foreground">{insight.message}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {neutrals.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <BarChart3 className="h-3 w-3" />
              No Change
            </h3>
            <div className="space-y-2">
              {neutrals.map((insight, i) => {
                const cfg = config[insight.type]
                return (
                  <div key={i} className={`flex items-start gap-3 rounded-xl border ${cfg.border} ${cfg.bg} p-3`}>
                    <cfg.icon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.color}`} />
                    <p className="text-sm text-muted-foreground">{insight.message}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {negatives.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" />
              Attention Needed
            </h3>
            <div className="space-y-2">
              {negatives.map((insight, i) => {
                const cfg = config[insight.type]
                return (
                  <div key={i} className={`flex items-start gap-3 rounded-xl border ${cfg.border} ${cfg.bg} p-3`}>
                    <cfg.icon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.color}`} />
                    <p className="text-sm text-muted-foreground">{insight.message}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
              <Lightbulb className="h-3 w-3" />
              Recommendations
            </h3>
            <div className="space-y-2">
              {recommendations.map((insight, i) => {
                const cfg = config[insight.type]
                return (
                  <div key={i} className={`flex items-start gap-3 rounded-xl border ${cfg.border} ${cfg.bg} p-3`}>
                    <cfg.icon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">{insight.message}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground mt-1 shrink-0" />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

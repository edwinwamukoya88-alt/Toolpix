"use client"

import { useMemo, memo } from "react"
import { motion } from "framer-motion"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Target,
  Clock,
  Sparkles,
  Star,
  Timer,
  Gauge,
  AlertTriangle,
  Zap,
  Sun,
  BarChart3,
} from "lucide-react"
import type { PomodoroSession, PomodoroAnalytics, PomodoroGamification } from "@/lib/pomodoro-analytics"
import { computeAnalytics, computeGamification, generateWeeklyTrend } from "@/lib/pomodoro-analytics"
import { cn } from "@/lib/utils"
import AnimatedCounter from "@/components/pomodoro/animated-counter"
import SparklineChart from "@/components/pomodoro/sparkline-chart"

interface SmartInsightsProps {
  sessions: PomodoroSession[]
  className?: string
}

interface InsightCardDef {
  id: string
  label: string
  description: string
  icon: any
  color: string
  gradient: string
  generate: (analytics: PomodoroAnalytics, gamification: PomodoroGamification, sessions: PomodoroSession[]) => {
    value: string | number
    suffix?: string
    trend?: "up" | "down" | "neutral"
    change?: number
    sparkline?: number[]
    items?: { label: string; pct: number; color: string }[]
  } | null
}

const insightCards: InsightCardDef[] = [
  {
    id: "peak-hour",
    label: "Peak Focus Hour",
    description: "Your most productive time of day",
    icon: Sun,
    color: "text-amber-400",
    gradient: "from-amber-500/15 to-amber-600/5",
    generate: (analytics) => {
      if (analytics.bestFocusHour === "N/A") return null
      return { value: analytics.bestFocusHour, suffix: "", trend: "neutral" as const, change: 0 }
    },
  },
  {
    id: "best-day",
    label: "Best Focus Day",
    description: "Your highest-performing weekday",
    icon: Star,
    color: "text-yellow-400",
    gradient: "from-yellow-500/15 to-yellow-600/5",
    generate: (analytics) => {
      if (analytics.bestFocusDay === "N/A") return null
      return { value: analytics.bestFocusDay, suffix: "", trend: "neutral" as const, change: 0 }
    },
  },
  {
    id: "longest-session",
    label: "Longest Session",
    description: "Your personal endurance record",
    icon: Timer,
    color: "text-indigo-400",
    gradient: "from-indigo-500/15 to-indigo-600/5",
    generate: (_a, _g, sessions) => {
      const completed = sessions.filter(s => s.completed)
      if (completed.length === 0) return null
      const longest = Math.max(...completed.map(s => s.duration))
      return { value: longest, suffix: " min", trend: "neutral" as const, change: 0 }
    },
  },
  {
    id: "deep-work",
    label: "Deep Work Hours",
    description: "Total focused time accumulated",
    icon: Brain,
    color: "text-violet-400",
    gradient: "from-violet-500/15 to-violet-600/5",
    generate: (analytics) => ({
      value: analytics.deepWorkHours,
      suffix: "h",
      trend: analytics.weeklyImprovement >= 0 ? "up" as const : "down" as const,
      change: Math.abs(Math.round(analytics.weeklyImprovement)),
    }),
  },
  {
    id: "weekly-trend",
    label: "Weekly Trend",
    description: "Your focus trajectory this week",
    icon: BarChart3,
    color: "text-emerald-400",
    gradient: "from-emerald-500/15 to-emerald-600/5",
    generate: (analytics) => ({
      value: analytics.weeklyImprovement >= 0 ? `+${analytics.weeklyImprovement}%` : `${analytics.weeklyImprovement}%`,
      suffix: "",
      trend: analytics.weeklyImprovement >= 0 ? "up" as const : "down" as const,
      change: Math.abs(analytics.weeklyImprovement),
    }),
  },
  {
    id: "momentum",
    label: "Momentum Score",
    description: "Consistency of your focus quality",
    icon: TrendingUp,
    color: "text-cyan-400",
    gradient: "from-cyan-500/15 to-cyan-600/5",
    generate: (analytics) => ({
      value: analytics.focusMomentum,
      suffix: " pts",
      trend: analytics.focusMomentum >= 0 ? "up" as const : "down" as const,
      change: Math.abs(analytics.focusMomentum),
    }),
  },
  {
    id: "consistency",
    label: "Consistency Rate",
    description: "How regularly you maintain focus",
    icon: Gauge,
    color: "text-blue-400",
    gradient: "from-blue-500/15 to-blue-600/5",
    generate: (_a, _g, sessions) => {
      const completed = sessions.filter(s => s.completed)
      if (completed.length === 0) return null
      const goodSessions = completed.filter(s => s.focusRating >= 7).length
      const rate = Math.round((goodSessions / completed.length) * 100)
      return {
        value: rate,
        suffix: "%",
        trend: rate >= 70 ? "up" as const : rate >= 40 ? "neutral" as const : "down" as const,
        change: rate,
      }
    },
  },
  {
    id: "burnout",
    label: "Burnout Risk",
    description: "Early warning for overtraining",
    icon: AlertTriangle,
    color: "text-rose-400",
    gradient: "from-rose-500/15 to-rose-600/5",
    generate: (analytics) => ({
      value: analytics.burnoutRisk,
      suffix: "%",
      trend: analytics.burnoutRisk <= 30 ? "up" as const : "down" as const,
      change: analytics.burnoutRisk,
    }),
  },
]

function TrendBadge({ trend, change }: { trend?: string; change?: number }) {
  if (!trend || trend === "neutral" || !change) {
    return (
      <span className="flex items-center gap-1 text-[10px] text-indigo-300/30">
        <Minus className="h-3 w-3" />
        <span className="tabular-nums">—</span>
      </span>
    )
  }
  const isUp = trend === "up"
  return (
    <span className={cn(
      "flex items-center gap-1 text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-md",
      isUp ? "text-emerald-300 bg-emerald-500/10" : "text-rose-300 bg-rose-500/10"
    )}>
      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {change}%
    </span>
  )
}

function InsightCard({ def, sessions, index }: { def: InsightCardDef; sessions: PomodoroSession[]; index: number }) {
  const analytics = useMemo(() => computeAnalytics(sessions), [sessions])
  const gamification = useMemo(() => computeGamification(sessions), [sessions])
  const weeklyTrend = useMemo(() => generateWeeklyTrend(sessions), [sessions])

  const result = useMemo(() => def.generate(analytics, gamification, sessions), [def, analytics, gamification, sessions])
  if (!result) return null

  const Icon = def.icon
  const sparklineColor = def.color.replace("text-", "hsl(var(--").replace(
    /\}$/, ""
  ) + "))"

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-2xl border border-indigo-500/10 bg-gradient-to-b from-indigo-950/30 to-slate-950/30 p-4 hover:border-indigo-500/20 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br", def.gradient)} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/10">
            <Icon className={cn("h-4 w-4", def.color)} />
          </div>
          <TrendBadge trend={result.trend} change={result.change} />
        </div>

        <div className="text-xl font-bold tracking-tight text-white mb-0.5">
          {typeof result.value === "number" ? (
            <AnimatedCounter value={result.value} suffix={result.suffix ?? ""} decimals={typeof result.value === "number" && result.value % 1 !== 0 ? 1 : 0} />
          ) : (
            <span>{result.value}{result.suffix ?? ""}</span>
          )}
        </div>

        <div className="text-[10px] text-indigo-300/40 font-medium mb-2">{def.label}</div>
        <p className="text-[9px] text-indigo-300/30 leading-relaxed">{def.description}</p>

        {result.sparkline && result.sparkline.length > 1 && (
          <div className="mt-2">
            <SparklineChart
              data={result.sparkline}
              width={80}
              height={20}
              color={sparklineColor}
              className="opacity-60"
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

function SmartInsights({ sessions, className = "" }: SmartInsightsProps) {
  if (sessions.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn("group relative overflow-hidden rounded-3xl border border-indigo-500/10 bg-gradient-to-b from-indigo-950/40 to-slate-950/40 p-5 sm:p-6 noise", className)}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-indigo-500/10">
            <Zap className="h-4 w-4 text-indigo-300" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-indigo-200">Smart Insights</h2>
            <p className="text-[10px] text-indigo-300/40">AI-powered productivity analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {insightCards.map((card, i) => (
            <InsightCard key={card.id} def={card} sessions={sessions} index={i} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default memo(SmartInsights)
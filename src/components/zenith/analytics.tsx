"use client"

import { useState, useEffect, useMemo, Suspense, lazy, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart3,
  Brain,
  Flame,
  Clock,
  Target,
  Gauge,
  Zap,
  AlertTriangle,
  Sun,
  Coffee,
  TrendingUp,
  Sparkles,
} from "lucide-react"
import type { PomodoroSession } from "@/lib/pomodoro-analytics"
import type { InsightCardData } from "@/components/pomodoro/insight-card"
import {
  computeAnalytics,
  computeGamification,
  computeAIInsights,
  generateWeeklyTrend,
  generateMonthlyTrend,
  generateHeatmapData,
} from "@/lib/pomodoro-analytics"
import InsightCard from "@/components/pomodoro/insight-card"
import { DashboardSkeleton } from "@/components/pomodoro/loading-skeleton"
import EmptyState from "@/components/pomodoro/empty-state"
import { cn } from "@/lib/utils"

const FocusTrendChart = lazy(() => import("@/components/pomodoro/weekly-monthly-chart"))
const HeatmapPreview = lazy(() => import("@/components/pomodoro/heatmap-preview"))
const GamificationCard = lazy(() => import("@/components/pomodoro/gamification-card"))
const AIInsightsPanel = lazy(() => import("@/components/pomodoro/ai-insights-panel"))

type Period = "today" | "7days" | "30days" | "all"

interface FocusAnalyticsProps {
  sessions: PomodoroSession[]
  className?: string
  onStartFirstSession?: () => void
}

function filterSessionsByPeriod(sessions: PomodoroSession[], period: Period): PomodoroSession[] {
  const now = new Date()
  const today = now.toISOString().split("T")[0]

  switch (period) {
    case "today":
      return sessions.filter(s => s.date === today)
    case "7days": {
      const d = new Date(now)
      d.setDate(d.getDate() - 7)
      return sessions.filter(s => new Date(s.date) >= d)
    }
    case "30days": {
      const d = new Date(now)
      d.setDate(d.getDate() - 30)
      return sessions.filter(s => new Date(s.date) >= d)
    }
    case "all":
    default:
      return sessions
  }
}

const PERIOD_LABELS: Record<Period, string> = {
  today: "Today",
  "7days": "7 Days",
  "30days": "30 Days",
  all: "All Time",
}

function FocusAnalytics({ sessions, className = "", onStartFirstSession }: FocusAnalyticsProps) {
  const [period, setPeriod] = useState<Period>("7days")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filtered = useMemo(() => filterSessionsByPeriod(sessions, period), [sessions, period])
  const analytics = useMemo(() => computeAnalytics(filtered), [filtered])
  const gamification = useMemo(() => computeGamification(sessions), [sessions])
  const insights = useMemo(() => computeAIInsights(filtered, analytics), [filtered, analytics])
  const weeklyTrend = useMemo(() => generateWeeklyTrend(filtered), [filtered])
  const monthlyTrend = useMemo(() => generateMonthlyTrend(filtered), [filtered])
  const heatmapData = useMemo(() => generateHeatmapData(sessions), [sessions])

  const cards: InsightCardData[] = useMemo(() => [
    {
      id: "focus-score",
      label: "Focus Score",
      value: analytics.focusScore,
      suffix: "/100",
      icon: Brain,
      color: "violet",
      status: analytics.focusScore >= 70 ? "success" : analytics.focusScore >= 40 ? "warning" : "danger",
      trend: analytics.focusMomentum >= 0 ? "up" : "down",
      change: Math.abs(analytics.focusMomentum),
      sparkline: weeklyTrend.map(d => d.avgFocus),
    },
    {
      id: "sessions",
      label: "Sessions Completed",
      value: analytics.sessionsThisWeek,
      icon: Zap,
      color: "amber",
      status: analytics.sessionsThisWeek >= 4 ? "success" : analytics.sessionsThisWeek >= 1 ? "warning" : "info",
      trend: analytics.weeklyImprovement >= 0 ? "up" : "down",
      change: Math.abs(analytics.weeklyImprovement),
    },
    {
      id: "streak",
      label: "Current Streak",
      value: analytics.currentStreak,
      suffix: " days",
      icon: Flame,
      color: "orange",
      status: analytics.currentStreak >= 3 ? "success" : analytics.currentStreak >= 1 ? "warning" : "info",
      trend: analytics.currentStreak > 0 ? "up" : "neutral",
      change: analytics.currentStreak,
    },
    {
      id: "deep-work",
      label: "Deep Work Hours",
      value: analytics.deepWorkHours,
      suffix: "h",
      decimals: 1,
      icon: Clock,
      color: "blue",
      status: analytics.deepWorkHours >= 5 ? "success" : analytics.deepWorkHours >= 2 ? "warning" : "info",
      trend: analytics.weeklyImprovement >= 0 ? "up" : "down",
      change: Math.abs(analytics.weeklyImprovement),
      sparkline: weeklyTrend.map(d => d.totalMinutes),
    },
    {
      id: "productivity",
      label: "Productivity Rating",
      value: analytics.productivityRating,
      suffix: "/10",
      icon: Gauge,
      color: "emerald",
      status: analytics.productivityRating >= 7 ? "success" : analytics.productivityRating >= 4 ? "warning" : "danger",
      trend: analytics.focusMomentum >= 0 ? "up" : "down",
      change: Math.abs(analytics.focusMomentum),
    },
    {
      id: "daily-goal",
      label: "Daily Goal Progress",
      value: analytics.dailyGoalProgress,
      suffix: "%",
      icon: Target,
      color: "purple",
      status: analytics.dailyGoalProgress >= 100 ? "success" : analytics.dailyGoalProgress >= 50 ? "warning" : "info",
      trend: analytics.dailyGoalProgress >= 50 ? "up" : "neutral",
      change: analytics.dailyGoalProgress,
    },
    {
      id: "avg-session",
      label: "Avg Session Length",
      value: analytics.avgSessionLength,
      suffix: " min",
      icon: Coffee,
      color: "cyan",
      status: analytics.avgSessionLength >= 25 ? "success" : analytics.avgSessionLength >= 15 ? "warning" : "info",
      trend: analytics.avgSessionLength >= 20 ? "up" : "down",
      change: Math.round((analytics.avgSessionLength / 25) * 100),
    },
    {
      id: "burnout",
      label: "Burnout Risk",
      value: analytics.burnoutRisk,
      suffix: "%",
      icon: AlertTriangle,
      color: "rose",
      status: analytics.burnoutRisk > 60 ? "danger" : analytics.burnoutRisk > 30 ? "warning" : "success",
      trend: analytics.burnoutRisk <= 30 ? "up" : "down",
      change: analytics.burnoutRisk,
    },
  ], [analytics, weeklyTrend])

  const periods: Period[] = ["today", "7days", "30days", "all"]

  if (!mounted) {
    return <DashboardSkeleton count={8} />
  }

  if (sessions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("group relative overflow-hidden rounded-3xl border border-indigo-500/10 bg-gradient-to-b from-indigo-950/40 to-slate-950/40 p-5 sm:p-6 noise", className)}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(238_90%_60%/0.03),transparent_60%)]" />
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-indigo-500/10">
              <BarChart3 className="h-4 w-4 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-indigo-200">Focus Analytics</h2>
              <p className="text-[10px] text-indigo-300/40">Track your productivity journey</p>
            </div>
          </div>
          <EmptyState onStartFirstSession={onStartFirstSession} />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn("space-y-6", className)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-indigo-500/10">
            <BarChart3 className="h-4 w-4 text-indigo-300" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-indigo-200">Focus Analytics</h2>
            <p className="text-[10px] text-indigo-300/40">{sessions.length} total sessions</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 rounded-2xl border border-indigo-500/10 bg-indigo-950/30 p-1 w-fit" role="radiogroup" aria-label="Analytics period">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "px-4 py-1.5 text-xs font-medium rounded-xl transition-all",
              period === p
                ? "bg-indigo-500/20 text-indigo-200 shadow-sm"
                : "text-indigo-300/50 hover:text-indigo-200/70"
            )}
            role="radio"
            aria-checked={period === p}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={period}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, i) => (
              <InsightCard key={card.id} data={card} index={i} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div className="rounded-2xl border border-indigo-500/10 bg-indigo-950/30 p-6 h-[320px] animate-pulse" />}>
          <FocusTrendChart weeklyData={weeklyTrend} monthlyData={monthlyTrend} />
        </Suspense>
        <Suspense fallback={<div className="rounded-2xl border border-indigo-500/10 bg-indigo-950/30 p-6 h-[320px] animate-pulse" />}>
          <HeatmapPreview data={heatmapData} />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div className="rounded-2xl border border-indigo-500/10 bg-indigo-950/30 p-6 h-[400px] animate-pulse" />}>
          <GamificationCard data={gamification} />
        </Suspense>
        <Suspense fallback={<div className="rounded-2xl border border-indigo-500/10 bg-indigo-950/30 p-6 h-[200px] animate-pulse" />}>
          <AIInsightsPanel insights={insights} />
        </Suspense>
      </div>
    </motion.div>
  )
}

export default memo(FocusAnalytics)
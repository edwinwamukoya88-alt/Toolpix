"use client"

import { useMemo, useState, useCallback, lazy, Suspense } from "react"
import { useMounted } from "@/hooks/use-mounted"
import {
  Brain,
  Flame,
  Zap,
  Target,
  Clock,
  Coffee,
  BarChart3,
  Sun,
  TrendingUp,
  Calendar,
  Award,
  Gauge,
  AlertTriangle,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import type { PomodoroSession } from "@/lib/pomodoro-analytics"
import type { InsightCardData } from "./insight-card"
import {
  computeAnalytics,
  computeGamification,
  computeAIInsights,
  generateWeeklyTrend,
  generateMonthlyTrend,
  generateHeatmapData,
  formatMinutes,
} from "@/lib/pomodoro-analytics"
import { cn } from "@/lib/utils"
import InsightCard from "./insight-card"
import { DashboardSkeleton } from "./loading-skeleton"
import EmptyState from "./empty-state"

const FocusTrendChart = lazy(() => import("./weekly-monthly-chart"))
const HeatmapPreview = lazy(() => import("./heatmap-preview"))
const GamificationCard = lazy(() => import("./gamification-card"))
const AIInsightsPanel = lazy(() => import("./ai-insights-panel"))

type DashboardTab = "overview" | "charts" | "achievements" | "insights"

interface InsightsDashboardProps {
  sessions: PomodoroSession[]
  className?: string
  onStartSession?: () => void
}

export default function InsightsDashboard({
  sessions,
  className = "",
  onStartSession,
}: InsightsDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview")
  const mounted = useMounted()

  const analytics = useMemo(() => computeAnalytics(sessions), [sessions])
  const gamification = useMemo(() => computeGamification(sessions), [sessions])
  const insights = useMemo(() => computeAIInsights(sessions, analytics), [sessions, analytics])
  const weeklyTrend = useMemo(() => generateWeeklyTrend(sessions), [sessions])
  const monthlyTrend = useMemo(() => generateMonthlyTrend(sessions), [sessions])
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
      id: "current-streak",
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
      id: "sessions-today",
      label: "Sessions Today",
      value: analytics.sessionsToday,
      icon: Zap,
      color: "amber",
      status: analytics.sessionsToday >= 4 ? "success" : analytics.sessionsToday >= 1 ? "warning" : "info",
      trend: analytics.sessionsToday > 0 ? "up" : "neutral",
      change: analytics.sessionsToday,
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
      sparkline: weeklyTrend.map(d => Math.round((d.sessions / 8) * 100)),
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
    {
      id: "best-focus",
      label: "Best Focus Day",
      value: analytics.bestFocusDay === "N/A" ? 0 : analytics.focusScore,
      prefix: analytics.bestFocusDay !== "N/A" ? `${analytics.bestFocusDay} — ` : "",
      icon: Sun,
      color: "amber",
      status: "info",
      trend: "neutral",
      change: 0,
    },
  ], [analytics, weeklyTrend])

  const tabs: { id: DashboardTab; label: string; icon: LucideIcon }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "charts", label: "Charts", icon: TrendingUp },
    { id: "achievements", label: "Achievements", icon: Award },
    { id: "insights", label: "Insights", icon: Sparkles },
  ]

  if (!mounted) {
    return <DashboardSkeleton count={6} />
  }

  if (sessions.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Focus Analytics</h2>
        </div>
        <EmptyState onStartFirstSession={onStartSession} />
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
          <BarChart3 className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-xl font-bold">Focus Analytics</h2>
      </div>

      <div className="flex rounded-lg border p-0.5" role="tablist" aria-label="Dashboard sections">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div
          id="panel-overview"
          role="tabpanel"
          aria-label="Overview"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card, i) => (
              <InsightCard key={card.id} data={card} index={i} />
            ))}
          </div>
        </div>
      )}

      {activeTab === "charts" && (
        <div
          id="panel-charts"
          role="tabpanel"
          aria-label="Charts"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Suspense fallback={<div className="rounded-2xl border bg-card p-6 h-[320px] animate-pulse" />}>
              <FocusTrendChart weeklyData={weeklyTrend} monthlyData={monthlyTrend} />
            </Suspense>
            <Suspense fallback={<div className="rounded-2xl border bg-card p-6 h-[320px] animate-pulse" />}>
              <HeatmapPreview data={heatmapData} />
            </Suspense>
          </div>
        </div>
      )}

      {activeTab === "achievements" && (
        <div
          id="panel-achievements"
          role="tabpanel"
          aria-label="Achievements"
        >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<div className="rounded-2xl border bg-card p-6 h-[400px] animate-pulse" />}>
            <GamificationCard data={gamification} />
          </Suspense>
          <div className="space-y-6">
            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                  <Calendar className="h-4 w-4 text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold">Monthly Summary</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Sessions", value: analytics.sessionsThisMonth, icon: Zap },
                  { label: "Deep Work", value: `${analytics.deepWorkHours}h`, icon: Clock },
                  { label: "Best Day", value: analytics.bestFocusDay, icon: Sun },
                  { label: "Avg Rating", value: `${analytics.productivityRating}/10`, icon: Gauge },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl bg-muted/30 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="text-lg font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
                <h2 className="text-lg font-semibold">Progress</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Weekly Goal", value: analytics.weeklyGoalProgress, color: "bg-blue-500" },
                  { label: "Monthly Goal", value: analytics.monthlyGoalProgress, color: "bg-purple-500" },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>{item.label}</span>
                      <span className="tabular-nums">{item.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {activeTab === "insights" && (
        <div
          id="panel-insights"
          role="tabpanel"
          aria-label="Insights"
        >
          <Suspense fallback={<div className="rounded-2xl border bg-card p-6 h-[200px] animate-pulse" />}>
            <AIInsightsPanel insights={insights} />
          </Suspense>
        </div>
      )}
    </div>
  )
}

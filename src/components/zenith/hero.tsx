"use client"

import { memo } from "react"
import { useMounted } from "@/hooks/use-mounted"
import { motion } from "framer-motion"
import {
  Zap,
  Flame,
  Settings,
  Trophy,
  Target,
  Clock,
  Brain,
  Star,
  Timer,
} from "lucide-react"
import type { PomodoroGamification, PomodoroAnalytics } from "@/lib/pomodoro-analytics"
import { cn } from "@/lib/utils"

interface ZenithHeroProps {
  gamification: PomodoroGamification
  analytics: PomodoroAnalytics
  timerMode?: string
  onOpenSettings?: () => void
  className?: string
}

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }: {
  icon: any; label: string; value: string | number; sub?: string; color: string; delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-indigo-500/10 bg-indigo-950/40 p-3.5 hover:border-indigo-500/25 hover:bg-indigo-950/60 transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1.5">
          <Icon className={cn("h-3.5 w-3.5", color)} />
          <span className="text-[10px] font-medium text-indigo-300/60 uppercase tracking-wider">{label}</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold tracking-tight text-white">{value}</span>
          {sub && <span className="text-[10px] text-indigo-300/40">{sub}</span>}
        </div>
      </div>
    </motion.div>
  )
}

function calculateDeepWorkToday(analytics: PomodoroAnalytics): string {
  const totalMin = Math.round(analytics.avgSessionLength * analytics.sessionsToday)
  if (totalMin < 60) return `${totalMin}m`
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function ZenithHero({ gamification, analytics, timerMode = "focus", onOpenSettings, className = "" }: ZenithHeroProps) {
  const mounted = useMounted()

  const xpProgress = gamification.xpToNextLevel > 0
    ? Math.min(100, Math.round(((gamification.xp - gamification.xpInCurrentLevel) / (gamification.xpToNextLevel - gamification.xpInCurrentLevel)) * 100))
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn("group relative overflow-hidden rounded-3xl border border-indigo-500/20", className)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-indigo-900/30 to-slate-950/80 noise" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(238_90%_60%/0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(238_90%_60%/0.06),transparent_50%)]" />
      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] animate-breathing-glow" />

      <div className="relative z-10 p-5 sm:p-7">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25"
            >
              <Brain className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2.5 mb-0.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Zenith Focus
                </h1>
              </div>
              <p className="text-xs text-indigo-200/60">
                Elevate your concentration. Master your flow.
              </p>
            </div>
          </div>
          {onOpenSettings && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenSettings}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300/70 hover:bg-indigo-500/20 hover:text-indigo-200 transition-all"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </motion.button>
          )}
        </div>

        <div className="rounded-2xl border border-indigo-500/10 bg-indigo-950/30 p-4 mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-medium text-indigo-200/70">Level {gamification.level}</span>
            </div>
            <span className="text-[10px] text-indigo-300/50 font-mono">{gamification.xp.toLocaleString()} / {gamification.xpToNextLevel.toLocaleString()} XP</span>
          </div>
          <div className="h-2 rounded-full bg-indigo-950/60 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 animate-gradient-shift relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <StatCard icon={Target} label="Today's Goal" value={`${Math.min(8, analytics.sessionsToday)}/${8}`} sub="sessions" color="text-emerald-400" delay={0.1} />
          <StatCard icon={Flame} label="Current Streak" value={analytics.currentStreak} sub="days" color="text-orange-400" delay={0.15} />
          <StatCard icon={Zap} label="Focus Score" value={analytics.focusScore} sub="/100" color="text-yellow-400" delay={0.2} />
          <StatCard icon={Timer} label="Mode" value={timerMode === "focus" ? "Focus" : timerMode === "shortBreak" ? "Short Break" : "Long Break"} color="text-indigo-400" delay={0.25} />
        </div>

        <div className="grid grid-cols-2 gap-2.5 mt-2.5">
          <StatCard icon={Clock} label="Deep Work Today" value={calculateDeepWorkToday(analytics)} color="text-cyan-400" delay={0.3} />
          <StatCard icon={Star} label="Total Focus Time" value={`${analytics.deepWorkHours}h`} color="text-violet-400" delay={0.35} />
        </div>
      </div>
    </motion.div>
  )
}

export default memo(ZenithHero)

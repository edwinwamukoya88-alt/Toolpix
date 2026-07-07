"use client"

import { memo, useMemo } from "react"
import {
  Trophy,
  Zap,
  Target,
  Award,
  Crown,
  Flame,
  Brain,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react"
import type { PomodoroGamification } from "@/lib/pomodoro-analytics"
import { cn } from "@/lib/utils"

const badgeIcons: Record<string, LucideIcon> = {
  none: Star,
  bronze: Award,
  silver: Award,
  gold: Crown,
  platinum: Crown,
  diamond: Sparkles,
}

const badgeColors: Record<string, string> = {
  none: "text-muted-foreground",
  bronze: "text-amber-700",
  silver: "text-slate-300",
  gold: "text-yellow-400",
  platinum: "text-cyan-300",
  diamond: "text-blue-400",
}

const badgeBg: Record<string, string> = {
  none: "bg-muted",
  bronze: "bg-amber-700/20",
  silver: "bg-slate-300/20",
  gold: "bg-yellow-400/20",
  platinum: "bg-cyan-300/20",
  diamond: "bg-blue-400/20",
}

const achievementIcons: Record<string, LucideIcon> = {
  Target,
  Zap,
  Flame,
  Award,
  Brain,
  Crown,
}

interface GamificationCardProps {
  data: PomodoroGamification
  className?: string
}

function GamificationCard({ data, className = "" }: GamificationCardProps) {
  const BadgeIcon = badgeIcons[data.productivityBadge]
  const xpProgress = data.xpToNextLevel > 0
    ? Math.min(100, Math.round(((data.xp - data.xpInCurrentLevel) / (data.xpToNextLevel - data.xpInCurrentLevel)) * 100))
    : 0

  const unlockedAchievements = useMemo(
    () => data.achievements.filter(a => a.unlocked).length,
    [data.achievements]
  )

  const nextAchievement = useMemo(
    () => data.achievements.find(a => !a.unlocked),
    [data.achievements]
  )

  return (
    <div className={cn("rounded-2xl border bg-card p-6", className)}>
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
          <Trophy className="h-4 w-4 text-amber-400" />
        </div>
        <h2 className="text-lg font-semibold">Achievements</h2>
      </div>

      <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", badgeBg[data.productivityBadge])}>
            <BadgeIcon className={cn("h-6 w-6", badgeColors[data.productivityBadge])} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">Level {data.level}</span>
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full capitalize", badgeBg[data.productivityBadge], badgeColors[data.productivityBadge])}>
                {data.productivityBadge}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{data.xp.toLocaleString()} XP</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Level {data.level}</span>
          <span>Level {data.level + 1}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={xpProgress} aria-valuemin={0} aria-valuemax={100} aria-label="XP progress">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="tabular-nums">{data.xp.toLocaleString()} XP</span>
          <span className="tabular-nums">{data.xpToNextLevel.toLocaleString()} XP</span>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Achievements ({unlockedAchievements}/{data.achievements.length})
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {data.achievements.map(a => {
            const Icon = achievementIcons[a.icon] ?? Award
            return (
              <div
                key={a.id}
                className={cn(
                  "flex items-center gap-2 rounded-xl border p-2.5 transition-all duration-200",
                  a.unlocked ? "border-emerald-500/20 bg-emerald-500/5" : "border-border bg-muted/30 opacity-60"
                )}
                title={a.description}
              >
                <Icon className={cn("h-4 w-4 shrink-0", a.unlocked ? "text-emerald-400" : "text-muted-foreground")} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs font-medium truncate", a.unlocked ? "text-foreground" : "text-muted-foreground")}>
                      {a.title}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-muted mt-1 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-300", a.unlocked ? "bg-emerald-500" : "bg-muted-foreground/30")}
                      style={{ width: `${a.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-purple-500/20 bg-purple-500/5 p-3">
        <Target className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-purple-400 mb-0.5">Daily Challenge</p>
          <p className="text-xs text-muted-foreground">{data.dailyChallenge}</p>
        </div>
      </div>

      {nextAchievement && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 mt-3">
          <Flame className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-400 mb-0.5">Next Milestone</p>
            <p className="text-xs text-muted-foreground">{nextAchievement.title} — {nextAchievement.description}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(GamificationCard)

import { generateId } from "./utils"

/* ─── Types ──────────────────────────────────── */

export interface PomodoroSession {
  id: string
  date: string
  startTime: number
  duration: number
  workDuration: number
  breakDuration: number
  completed: boolean
  interruptions: number
  focusRating: number
}

export interface PomodoroAnalytics {
  focusScore: number
  currentStreak: number
  longestStreak: number
  sessionsToday: number
  sessionsThisWeek: number
  sessionsThisMonth: number
  deepWorkHours: number
  avgSessionLength: number
  avgBreakLength: number
  dailyGoalProgress: number
  weeklyGoalProgress: number
  monthlyGoalProgress: number
  productivityRating: number
  burnoutRisk: number
  focusMomentum: number
  bestFocusDay: string
  bestFocusHour: string
  weeklyImprovement: number
  monthlyImprovement: number
}

export interface PomodoroGamification {
  xp: number
  level: number
  xpToNextLevel: number
  xpInCurrentLevel: number
  achievements: Achievement[]
  nextMilestone: string
  dailyChallenge: string
  productivityBadge: ProductivityBadge
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  progress: number
  unlocked: boolean
}

export type ProductivityBadge =
  | "none"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"

export interface FocusTrend {
  date: string
  sessions: number
  totalMinutes: number
  avgFocus: number
}

export interface HeatmapDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export interface AIInsight {
  type: "achievement" | "tip" | "warning" | "milestone"
  message: string
  icon: string
}

/* ─── Seeded Generators ──────────────────────── */

function seedHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

function scaleValue(value: number, min: number, max: number): number {
  return min + (value % (max - min + 1))
}

/* ─── Generate Analytics from Sessions ───────── */

export function computeAnalytics(sessions: PomodoroSession[]): PomodoroAnalytics {
  const today = new Date().toISOString().split("T")[0]
  const todaySessions = sessions.filter(s => s.date === today)
  const completedSessions = sessions.filter(s => s.completed)

  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  const weekSessions = sessions.filter(s => new Date(s.date) >= startOfWeek && s.completed)

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthSessions = sessions.filter(s => new Date(s.date) >= startOfMonth && s.completed)

  const totalWorkMinutes = completedSessions.reduce((sum, s) => sum + s.duration, 0)

  const sortedByDate = [...completedSessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  let currentStreak = 0
  const uniqueDays = new Set(completedSessions.map(s => s.date))
  const sortedDays = [...uniqueDays].sort().reverse()
  const checkDate = new Date()
  for (const day of sortedDays) {
    const dayDate = new Date(day)
    const diff = Math.round((checkDate.getTime() - dayDate.getTime()) / 86400000)
    if (diff === currentStreak) {
      currentStreak++
    } else if (diff > currentStreak) {
      break
    }
  }

  let longestStreak = 0
  let tempStreak = 0
  const allDays = [...uniqueDays].sort()
  for (let i = 0; i < allDays.length; i++) {
    if (i === 0) {
      tempStreak = 1
    } else {
      const prev = new Date(allDays[i - 1])
      const curr = new Date(allDays[i])
      const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000)
      if (diff === 1) {
        tempStreak++
      } else {
        tempStreak = 1
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)
  }

  const avgLength = completedSessions.length > 0
    ? Math.round(totalWorkMinutes / completedSessions.length)
    : 0

  const breakMinutes = sessions.reduce((sum, s) => sum + (s.breakDuration || 0), 0)
  const avgBreak = sessions.length > 0 ? Math.round(breakMinutes / sessions.length) : 0

  const deepWorkHours = Math.round((totalWorkMinutes / 60) * 10) / 10

  const dailyGoal = 8
  const weeklyGoal = 40
  const monthlyGoal = 160

  const dailyGoalProgress = Math.min(100, Math.round((todaySessions.filter(s => s.completed).length / dailyGoal) * 100))
  const weeklyGoalProgress = Math.min(100, Math.round((weekSessions.length / weeklyGoal) * 100))
  const monthlyGoalProgress = Math.min(100, Math.round((monthSessions.length / monthlyGoal) * 100))

  const totalRating = completedSessions.reduce((sum, s) => sum + s.focusRating, 0)
  const productivityRating = completedSessions.length > 0
    ? Math.round(totalRating / completedSessions.length)
    : 0

  const recentSessions = completedSessions.slice(-7)
  const avgRecent = recentSessions.length > 0
    ? recentSessions.reduce((sum, s) => sum + s.focusRating, 0) / recentSessions.length
    : 0
  const burnoutRisk = Math.max(0, Math.min(100, Math.round(
    (sessions.filter(s => s.interruptions > 3).length / Math.max(sessions.length, 1)) * 100
  )))

  const focusMomentum = completedSessions.length >= 2
    ? Math.round(((completedSessions[completedSessions.length - 1]?.focusRating || 0) -
      (completedSessions[0]?.focusRating || 0)) /
      Math.max(completedSessions.length, 1) * 10)
    : 0

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const dayScores: Record<string, number[]> = {}
  for (const s of completedSessions) {
    const day = dayNames[new Date(s.date).getDay()]
    if (!dayScores[day]) dayScores[day] = []
    dayScores[day].push(s.focusRating)
  }
  let bestDay = "N/A"
  let bestDayAvg = 0
  for (const [day, ratings] of Object.entries(dayScores)) {
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
    if (avg > bestDayAvg) {
      bestDayAvg = avg
      bestDay = day
    }
  }

  const hourScores: Record<number, number[]> = {}
  for (const s of completedSessions) {
    const hour = new Date(s.startTime).getHours()
    if (!hourScores[hour]) hourScores[hour] = []
    hourScores[hour].push(s.focusRating)
  }
  let bestHour = "N/A"
  let bestHourAvg = 0
  for (const [hour, ratings] of Object.entries(hourScores)) {
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
    if (avg > bestHourAvg) {
      bestHourAvg = avg
      bestHour = `${hour.padStart(2, "0")}:00`
    }
  }

  const prevWeekSessions = sessions.filter(s => {
    const d = new Date(s.date)
    const prevStart = new Date(startOfWeek)
    prevStart.setDate(prevStart.getDate() - 7)
    return d >= prevStart && d < startOfWeek && s.completed
  })
  const weeklyImprovement = prevWeekSessions.length > 0
    ? Math.round(((weekSessions.length - prevWeekSessions.length) / prevWeekSessions.length) * 100)
    : 0

  const prevMonthSessions = sessions.filter(s => {
    const d = new Date(s.date)
    const prevStart = new Date(startOfMonth)
    prevStart.setMonth(prevStart.getMonth() - 1)
    return d >= prevStart && d < startOfMonth && s.completed
  })
  const monthlyImprovement = prevMonthSessions.length > 0
    ? Math.round(((monthSessions.length - prevMonthSessions.length) / prevMonthSessions.length) * 100)
    : 0

  return {
    focusScore: Math.min(100, Math.max(0, productivityRating * 10)),
    currentStreak,
    longestStreak,
    sessionsToday: todaySessions.filter(s => s.completed).length,
    sessionsThisWeek: weekSessions.length,
    sessionsThisMonth: monthSessions.length,
    deepWorkHours,
    avgSessionLength: avgLength,
    avgBreakLength: avgBreak,
    dailyGoalProgress,
    weeklyGoalProgress,
    monthlyGoalProgress,
    productivityRating,
    burnoutRisk,
    focusMomentum,
    bestFocusDay: bestDay,
    bestFocusHour: bestHour,
    weeklyImprovement,
    monthlyImprovement,
  }
}

export function computeGamification(sessions: PomodoroSession[]): PomodoroGamification {
  const completedSessions = sessions.filter(s => s.completed)
  const totalMinutes = completedSessions.reduce((sum, s) => sum + s.duration, 0)
  const xp = Math.floor(totalMinutes * 2 + completedSessions.length * 10)

  const level = Math.floor(Math.sqrt(xp / 100)) + 1
  const xpForLevel = (level: number) => level * level * 100
  const xpToNextLevel = xpForLevel(level + 1)
  const xpInCurrentLevel = xpForLevel(level)

  const achievements: Achievement[] = [
    {
      id: "first-session",
      title: "First Focus",
      description: "Complete your first Pomodoro session",
      icon: "Target",
      progress: completedSessions.length >= 1 ? 100 : Math.round((completedSessions.length / 1) * 100),
      unlocked: completedSessions.length >= 1,
    },
    {
      id: "ten-sessions",
      title: "Getting Started",
      description: "Complete 10 Pomodoro sessions",
      icon: "Zap",
      progress: Math.min(100, Math.round((completedSessions.length / 10) * 100)),
      unlocked: completedSessions.length >= 10,
    },
    {
      id: "streak-3",
      title: "Three-Day Streak",
      description: "Complete sessions for 3 consecutive days",
      icon: "Flame",
      progress: computeAnalytics(sessions).currentStreak >= 3 ? 100 : Math.round((computeAnalytics(sessions).currentStreak / 3) * 100),
      unlocked: computeAnalytics(sessions).currentStreak >= 3,
    },
    {
      id: "streak-7",
      title: "Week Warrior",
      description: "Complete sessions for 7 consecutive days",
      icon: "Award",
      progress: computeAnalytics(sessions).currentStreak >= 7 ? 100 : Math.round((computeAnalytics(sessions).currentStreak / 7) * 100),
      unlocked: computeAnalytics(sessions).currentStreak >= 7,
    },
    {
      id: "deep-work-5",
      title: "Deep Focus",
      description: "Accumulate 5 hours of deep work",
      icon: "Brain",
      progress: Math.min(100, Math.round((totalMinutes / (5 * 60)) * 100)),
      unlocked: totalMinutes >= 5 * 60,
    },
    {
      id: "deep-work-20",
      title: "Master of Focus",
      description: "Accumulate 20 hours of deep work",
      icon: "Crown",
      progress: Math.min(100, Math.round((totalMinutes / (20 * 60)) * 100)),
      unlocked: totalMinutes >= 20 * 60,
    },
  ]

  const badgeLevels: ProductivityBadge[] = ["none", "bronze", "silver", "gold", "platinum", "diamond"]
  const badgeThresholds = [0, 5, 20, 50, 100, 200]
  let badgeIndex = 0
  for (let i = badgeThresholds.length - 1; i >= 0; i--) {
    if (completedSessions.length >= badgeThresholds[i]) {
      badgeIndex = i
      break
    }
  }
  const productivityBadge = badgeLevels[badgeIndex]

  const nextMilestoneXp = xpForLevel(level + 1)
  const nextMilestone = `${nextMilestoneXp} XP to Level ${level + 1}`

  const challenges = [
    "Complete 4 focused sessions today",
    "Maintain 0 interruptions in your next session",
    "Achieve a focus rating of 9+ in one session",
    "Complete your daily goal before noon",
    "Do 5 sessions with no skipped breaks",
  ]
  const dailyChallenge = challenges[new Date().getDate() % challenges.length]

  return {
    xp,
    level,
    xpToNextLevel,
    xpInCurrentLevel,
    achievements,
    nextMilestone,
    dailyChallenge,
    productivityBadge,
  }
}

export function computeAIInsights(sessions: PomodoroSession[], analytics: PomodoroAnalytics): AIInsight[] {
  const insights: AIInsight[] = []
  const completed = sessions.filter(s => s.completed)

  if (analytics.bestFocusDay !== "N/A") {
    insights.push({
      type: "achievement",
      message: `You are most productive on ${analytics.bestFocusDay}s.`,
      icon: "Calendar",
    })
  }

  if (analytics.weeklyImprovement > 0) {
    insights.push({
      type: "achievement",
      message: `Your focus improved ${analytics.weeklyImprovement}% this week.`,
      icon: "TrendingUp",
    })
  } else if (analytics.weeklyImprovement < 0) {
    insights.push({
      type: "warning",
      message: `Your focus declined ${Math.abs(analytics.weeklyImprovement)}% this week. Try shorter sessions.`,
      icon: "TrendingDown",
    })
  }

  if (analytics.avgSessionLength > 0) {
    insights.push({
      type: "tip",
      message: `Your average uninterrupted session is ${analytics.avgSessionLength} minutes.`,
      icon: "Clock",
    })
  }

  if (analytics.dailyGoalProgress < 100) {
    const remaining = 8 - analytics.sessionsToday
    if (remaining > 0 && remaining <= 3) {
      insights.push({
        type: "milestone",
        message: `Completing ${remaining} more session${remaining > 1 ? "s" : ""} today will reach your daily goal.`,
        icon: "Target",
      })
    }
  }

  if (analytics.burnoutRisk > 60) {
    insights.push({
      type: "warning",
      message: "Your burnout risk is high. Consider taking a longer break or rest day.",
      icon: "AlertTriangle",
    })
  }

  if (analytics.bestFocusHour !== "N/A") {
    insights.push({
      type: "tip",
      message: `Your peak focus hour is ${analytics.bestFocusHour}. Schedule important tasks then.`,
      icon: "Sun",
    })
  }

  if (analytics.focusScore >= 80) {
    insights.push({
      type: "achievement",
      message: "Excellent focus score! Your deep work habits are paying off.",
      icon: "Sparkles",
    })
  }

  if (analytics.currentStreak >= 3) {
    insights.push({
      type: "milestone",
      message: `You're on a ${analytics.currentStreak}-day streak! Keep the momentum going.`,
      icon: "Flame",
    })
  }

  if (completed.length > 0 && analytics.avgBreakLength < 4) {
    insights.push({
      type: "tip",
      message: "Your breaks are very short (under 4 min). Try 5-10 minute breaks to recharge.",
      icon: "Coffee",
    })
  }

  if (analytics.deepWorkHours >= 5) {
    insights.push({
      type: "achievement",
      message: `You've logged ${analytics.deepWorkHours} hours of deep work this month.`,
      icon: "Brain",
    })
  }

  return insights
}

export function generateWeeklyTrend(sessions: PomodoroSession[]): FocusTrend[] {
  const now = new Date()
  const trends: FocusTrend[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split("T")[0]
    const daySessions = sessions.filter(s => s.date === dateStr && s.completed)
    const totalMin = daySessions.reduce((sum, s) => sum + s.duration, 0)
    const avgFocus = daySessions.length > 0
      ? Math.round(daySessions.reduce((sum, s) => sum + s.focusRating, 0) / daySessions.length * 10)
      : 0
    trends.push({
      date: dateStr,
      sessions: daySessions.length,
      totalMinutes: totalMin,
      avgFocus,
    })
  }
  return trends
}

export function generateMonthlyTrend(sessions: PomodoroSession[]): FocusTrend[] {
  const now = new Date()
  const trends: FocusTrend[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split("T")[0]
    const daySessions = sessions.filter(s => s.date === dateStr && s.completed)
    const totalMin = daySessions.reduce((sum, s) => sum + s.duration, 0)
    const avgFocus = daySessions.length > 0
      ? Math.round(daySessions.reduce((sum, s) => sum + s.focusRating, 0) / daySessions.length * 10)
      : 0
    trends.push({
      date: dateStr,
      sessions: daySessions.length,
      totalMinutes: totalMin,
      avgFocus,
    })
  }
  return trends
}

export function generateHeatmapData(sessions: PomodoroSession[]): HeatmapDay[] {
  const now = new Date()
  const data: HeatmapDay[] = []
  for (let i = 90; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split("T")[0]
    const daySessions = sessions.filter(s => s.date === dateStr && s.completed)
    const count = daySessions.length
    const level = count === 0 ? 0 : count <= 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4
    data.push({ date: dateStr, count, level: level as HeatmapDay["level"] })
  }
  return data
}

export function generateDefaultSessions(): PomodoroSession[] {
  const today = new Date().toISOString().split("T")[0]
  const seed = seedHash(`pomodoro-${today}`)
  const sessions: PomodoroSession[] = []

  for (let day = 0; day < 14; day++) {
    const d = new Date()
    d.setDate(d.getDate() - day)
    const dateStr = d.toISOString().split("T")[0]
    const sessionsToday = scaleValue(seed + day * 7, 1, 6)

    for (let s = 0; s < sessionsToday; s++) {
      const hour = 6 + ((seed + day * 13 + s * 17) % 14)
      const minute = (seed + day * 19 + s * 23) % 60
      const startTime = new Date(dateStr)
      startTime.setHours(hour, minute, 0, 0)
      const duration = 20 + ((seed + day * 11 + s * 13) % 35)
      sessions.push({
        id: generateId(),
        date: dateStr,
        startTime: startTime.getTime(),
        duration,
        workDuration: duration,
        breakDuration: 5 + ((seed + day * 7 + s * 11) % 10),
        completed: true,
        interruptions: (seed + day * 3 + s * 5) % 4,
        focusRating: 3 + ((seed + day * 7 + s * 11) % 8),
      })
    }
  }

  return sessions
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

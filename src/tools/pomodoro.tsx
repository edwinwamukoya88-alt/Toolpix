"use client"

import { useState, useEffect, useRef, useCallback, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { generateId } from "@/lib/utils"
import type { PomodoroSession } from "@/lib/pomodoro-analytics"
import { computeAnalytics, computeGamification } from "@/lib/pomodoro-analytics"
import ZenithHero from "@/components/zenith/hero"
import ZenithTimer, { type TimerMode } from "@/components/zenith/timer"
import AmbientSounds from "@/components/zenith/ambient-sounds"
import QuoteDisplay from "@/components/zenith/quote-display"
import TaskOrganizer, { type Task } from "@/components/zenith/task-organizer"
import FocusAnalytics from "@/components/zenith/analytics"
import SmartInsights from "@/components/zenith/smart-insights"

const STORAGE_KEY = "pomodoro-sessions"

function loadSessions(): PomodoroSession[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveSessions(sessions: PomodoroSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  } catch {}
}

const springEase: [number, number, number, number] = [0.16, 1, 0.3, 1]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
}

const childVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: springEase },
  },
}

function Pomodoro() {
  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const [mounted, setMounted] = useState(false)
  const [timerMode, setTimerMode] = useState<TimerMode>("focus")
  const [sessionsToday, setSessionsToday] = useState(0)
  const loaded = useRef(false)

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true
      const saved = loadSessions()
      setSessions(saved)
      const today = new Date().toISOString().split("T")[0]
      setSessionsToday(saved.filter(s => s.date === today && s.completed).length)
    }
    setMounted(true)
  }, [])

  const handleSessionComplete = useCallback((duration: number, mode: TimerMode) => {
    const now = Date.now()
    const newSession: PomodoroSession = {
      id: generateId(),
      date: new Date().toISOString().split("T")[0],
      startTime: now,
      duration,
      workDuration: mode === "focus" ? duration : 0,
      breakDuration: mode !== "focus" ? duration : 0,
      completed: true,
      interruptions: 0,
      focusRating: mode === "focus" ? Math.max(5, Math.min(10, 7 + Math.floor(Math.random() * 3))) : 0,
    }
    setSessions(prev => {
      const updated = [...prev, newSession]
      saveSessions(updated)
      return updated
    })
    setSessionsToday(prev => prev + 1)
  }, [])

  const handleTaskUpdate = useCallback((_tasks: Task[]) => {
    // task persistence handled inside TaskOrganizer
  }, [])

  const scrollToAnalytics = useCallback(() => {
    const el = document.getElementById("focus-analytics")
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-48 rounded-3xl bg-indigo-950/20 animate-pulse" />
        <div className="h-96 rounded-3xl bg-indigo-950/20 animate-pulse" />
      </div>
    )
  }

  const analytics = computeAnalytics(sessions)
  const gamification = computeGamification(sessions)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen p-3 sm:p-5 lg:p-7 max-w-7xl mx-auto"
    >
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,hsl(238_90%_60%/0.03),transparent_60%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(238_90%_60%/0.02),transparent_50%)] pointer-events-none" />

      <div className="relative space-y-5">
        <motion.div variants={childVariants}>
          <ZenithHero
            gamification={gamification}
            analytics={analytics}
            timerMode={timerMode}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <motion.div variants={childVariants}>
              <ZenithTimer
                onSessionComplete={handleSessionComplete}
                onModeChange={setTimerMode}
              />
            </motion.div>

            <motion.div variants={childVariants}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <AmbientSounds />
                <QuoteDisplay sessionCount={sessions.length} />
              </div>
            </motion.div>

            <motion.div variants={childVariants}>
              <TaskOrganizer onTaskUpdate={handleTaskUpdate} />
            </motion.div>

            <motion.div variants={childVariants}>
              <SmartInsights sessions={sessions} />
            </motion.div>
          </div>

          <motion.div
            variants={childVariants}
            className="space-y-5 lg:sticky lg:top-5 lg:self-start"
          >
            <div id="focus-analytics">
              <FocusAnalytics
                sessions={sessions}
                onStartFirstSession={() => {
                  // Scroll to timer and focus on starting
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default memo(Pomodoro)
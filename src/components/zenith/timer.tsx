"use client"

import { useState, useEffect, useRef, useCallback, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, SkipForward, Maximize2, Minimize2, Keyboard } from "lucide-react"
import { cn } from "@/lib/utils"

type TimerMode = "focus" | "shortBreak" | "longBreak"

interface TimerConfig {
  label: string
  minutes: number
  color: string
  ringFrom: string
  ringTo: string
  glowColor: string
  bgGlow: string
}

const TIMER_CONFIGS: Record<TimerMode, TimerConfig> = {
  focus: {
    label: "Focus",
    minutes: 25,
    color: "text-indigo-300",
    ringFrom: "hsl(238, 90%, 60%)",
    ringTo: "hsl(262, 83%, 65%)",
    glowColor: "hsla(238, 90%, 60%, 0.4)",
    bgGlow: "shadow-indigo-500/20",
  },
  shortBreak: {
    label: "Short Break",
    minutes: 5,
    color: "text-emerald-300",
    ringFrom: "hsl(160, 84%, 39%)",
    ringTo: "hsl(142, 76%, 36%)",
    glowColor: "hsla(160, 84%, 39%, 0.4)",
    bgGlow: "shadow-emerald-500/20",
  },
  longBreak: {
    label: "Long Break",
    minutes: 15,
    color: "text-violet-300",
    ringFrom: "hsl(262, 83%, 65%)",
    ringTo: "hsl(271, 91%, 60%)",
    glowColor: "hsla(262, 83%, 65%, 0.4)",
    bgGlow: "shadow-violet-500/20",
  },
}

interface ZenithTimerProps {
  onSessionComplete: (duration: number, mode: TimerMode) => void
  onInterruption?: () => void
  onModeChange?: (mode: TimerMode) => void
  className?: string
}

function ZenithTimer({ onSessionComplete, onInterruption, onModeChange, className = "" }: ZenithTimerProps) {
  const [mode, setMode] = useState<TimerMode>("focus")
  const [seconds, setSeconds] = useState(TIMER_CONFIGS.focus.minutes * 60)
  const [running, setRunning] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const config = TIMER_CONFIGS[mode]
  const total = config.minutes * 60
  const progress = total > 0 ? ((total - seconds) / total) * 100 : 0
  const circumference = 2 * Math.PI * 155
  const offset = circumference - (progress / 100) * circumference

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  const switchMode = useCallback((newMode: TimerMode) => {
    setRunning(false)
    setMode(newMode)
    setSeconds(TIMER_CONFIGS[newMode].minutes * 60)
    onModeChange?.(newMode)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [onModeChange])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setRunning(false)
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          const completedDuration = config.minutes
          setTimeout(() => onSessionComplete(completedDuration, mode), 100)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, mode, config.minutes, onSessionComplete])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      switch (e.code) {
        case "Space":
          e.preventDefault()
          toggle()
          break
        case "KeyR":
          e.preventDefault()
          reset()
          break
        case "KeyS":
          e.preventDefault()
          skip()
          break
        case "KeyF":
          e.preventDefault()
          toggleFullscreen()
          break
        case "Digit1":
          switchMode("focus"); break
        case "Digit2":
          switchMode("shortBreak"); break
        case "Digit3":
          switchMode("longBreak"); break
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, seconds, running])

  function toggle() {
    if (seconds <= 0) {
      setSeconds(config.minutes * 60)
    }
    if (!running && seconds > 0 && onInterruption) {
      onInterruption()
    }
    setRunning((prev) => !prev)
  }

  function reset() {
    setRunning(false)
    setSeconds(config.minutes * 60)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  function skip() {
    setRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    const completedDuration = total - seconds > 30 ? (total - seconds) / 60 : 0
    if (completedDuration > 0) {
      onSessionComplete(Math.round(completedDuration), mode)
    }
    setSeconds(0)
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setFullscreen(false)).catch(() => {})
    }
  }

  useEffect(() => {
    function onFSChange() {
      setFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", onFSChange)
    return () => document.removeEventListener("fullscreenchange", onFSChange)
  }, [])

  const modes: TimerMode[] = ["focus", "shortBreak", "longBreak"]

  const timerContent = (
    <div className="flex flex-col items-center justify-center flex-1 w-full">
      <div className="flex justify-center gap-1 mb-6 sm:mb-8 rounded-2xl border border-indigo-500/10 bg-indigo-950/30 p-1 w-fit mx-auto backdrop-blur-sm">
        {modes.map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={cn(
              "relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300",
              mode === m
                ? TIMER_CONFIGS[m].color + " bg-indigo-500/15"
                : "text-indigo-300/50 hover:text-indigo-200/70"
            )}
            aria-selected={mode === m}
            role="tab"
          >
            {TIMER_CONFIGS[m].label}
            {mode === m && (
              <motion.div
                layoutId="timer-tab-indicator"
                className="absolute inset-0 rounded-xl bg-indigo-500/10 -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto mb-6 sm:mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 340 340">
          <defs>
            <linearGradient id={`ring-gradient-${mode}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.ringFrom} />
              <stop offset="100%" stopColor={config.ringTo} />
            </linearGradient>
            <filter id={`glow-${mode}`}>
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="170"
            cy="170"
            r="155"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="6"
            opacity={0.15}
          />
          <motion.circle
            cx="170"
            cy="170"
            r="155"
            fill="none"
            stroke={`url(#ring-gradient-${mode})`}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5, ease: "linear" }}
            filter={`url(#glow-${mode})`}
            style={{ filter: `drop-shadow(0 0 12px ${config.glowColor})` }}
          />
        </svg>

        <div className="absolute -inset-4 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${config.glowColor}, transparent 70%)`,
          }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={mode}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "text-7xl sm:text-8xl font-bold tracking-tighter tabular-nums",
                running ? "text-white" : "text-white/80"
              )}
            >
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </motion.span>
          </AnimatePresence>
          <motion.span
            key={running ? "running" : "paused"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("text-sm mt-2 font-medium tracking-wide", config.color)}
          >
            {config.label} {running ? "•" : "‖"}
          </motion.span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 sm:gap-5">
        <div className="flex flex-col items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-indigo-500/15 bg-indigo-950/40 text-indigo-300/50 hover:bg-indigo-900/50 hover:text-indigo-200 hover:border-indigo-500/30 transition-all"
            aria-label="Reset timer"
          >
            <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
          </motion.button>
          <span className="text-[9px] text-indigo-300/30 font-mono">R</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggle}
          className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:shadow-xl transition-shadow"
          aria-label={running ? "Pause timer" : "Start timer"}
        >
          {running ? <Pause className="h-7 w-7 sm:h-8 sm:w-8" /> : <Play className="h-7 w-7 sm:h-8 sm:w-8 ml-0.5" />}
        </motion.button>

        <div className="flex flex-col items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={skip}
            className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-indigo-500/15 bg-indigo-950/40 text-indigo-300/50 hover:bg-indigo-900/50 hover:text-indigo-200 hover:border-indigo-500/30 transition-all"
            aria-label="Skip to next phase"
          >
            <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
          </motion.button>
          <span className="text-[9px] text-indigo-300/30 font-mono">S</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={toggleFullscreen}
        className="mt-4 sm:mt-5 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/10 bg-indigo-950/30 text-[10px] text-indigo-300/40 hover:text-indigo-200/60 hover:border-indigo-500/20 transition-all"
        aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {fullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
        <span>{fullscreen ? "Exit" : "Focus Mode"}</span>
        <span className="ml-1 text-[8px] text-indigo-300/20 font-mono">F</span>
      </motion.button>
    </div>
  )

  if (fullscreen) {
    return (
      <div
        ref={containerRef}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-slate-950 noise",
          className
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(238_90%_60%/0.06),transparent_60%)]" />
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        {timerContent}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => document.exitFullscreen()}
          className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-500/10 glass text-[11px] text-indigo-300/50 hover:text-indigo-200 hover:border-indigo-500/20 transition-all"
        >
          <Minimize2 className="h-3.5 w-3.5" />
          Exit
        </motion.button>
      </div>
    )
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-indigo-500/10 bg-gradient-to-b from-indigo-950/40 to-slate-950/40 p-5 sm:p-7 text-center flex flex-col noise",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(238_90%_60%/0.04),transparent_60%)]" />
      {timerContent}
    </motion.div>
  )
}

export { type TimerMode, TIMER_CONFIGS }
export default memo(ZenithTimer)
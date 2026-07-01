"use client"

import { motion } from "framer-motion"
import { BarChart3, Clock, Brain, Flame, Target, Sparkles, Zap, TrendingUp, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  title?: string
  description?: string
  onStartFirstSession?: () => void
}

const features = [
  { icon: Zap, label: "Productivity Score", color: "text-yellow-400" },
  { icon: Flame, label: "Heatmaps", color: "text-orange-400" },
  { icon: TrendingUp, label: "Weekly Trends", color: "text-emerald-400" },
  { icon: Brain, label: "AI Insights", color: "text-indigo-400" },
  { icon: Target, label: "Achievements", color: "text-violet-400" },
  { icon: Sparkles, label: "XP & Levels", color: "text-amber-400" },
]

export default function EmptyState({
  title = "Your analytics journey starts here",
  description = "Complete your first focus session to unlock a powerful dashboard of productivity insights, heatmaps, trends, and achievements.",
  onStartFirstSession,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center" role="status" aria-label={title}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-6"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-indigo-500/10">
          <Brain className="h-10 w-10 text-indigo-300" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg"
        >
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </motion.div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-lg font-bold text-indigo-100 mb-2"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-xs text-indigo-300/50 max-w-sm mb-6 leading-relaxed"
      >
        {description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="grid grid-cols-2 gap-2 mb-6 w-full max-w-xs"
      >
        {features.map((f, i) => (
          <div
            key={f.label}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-950/40 border border-indigo-500/10"
          >
            <f.icon className={cn("h-3.5 w-3.5 shrink-0", f.color)} />
            <span className="text-[10px] text-indigo-200/60">{f.label}</span>
          </div>
        ))}
      </motion.div>

      {onStartFirstSession && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStartFirstSession}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow"
        >
          <Clock className="h-4 w-4" />
          Start Your First Session
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      )}
    </div>
  )
}
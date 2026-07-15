"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Brain, BookOpen, Clock, BarChart3, LayoutGrid, Calendar, Code, Palette } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

const features = [
  { icon: Brain, label: "AI Assistant", color: "from-indigo-500/20 to-purple-500/20" },
  { icon: BookOpen, label: "CBC Planner", color: "from-emerald-500/20 to-teal-500/20" },
  { icon: Clock, label: "Pomodoro", color: "from-rose-500/20 to-pink-500/20" },
  { icon: BarChart3, label: "Analytics", color: "from-blue-500/20 to-cyan-500/20" },
  { icon: LayoutGrid, label: "Kanban", color: "from-amber-500/20 to-orange-500/20" },
  { icon: Calendar, label: "Calendar", color: "from-violet-500/20 to-indigo-500/20" },
  { icon: Code, label: "Code Tools", color: "from-sky-500/20 to-blue-500/20" },
  { icon: Palette, label: "Design Studio", color: "from-pink-500/20 to-rose-500/20" },
]

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 lg:py-40 bg-grid-glow">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-cyan-500/[0.04]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-gradient-to-b from-primary/[0.06] to-transparent blur-3xl pointer-events-none" />

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-4 py-1.5 text-xs font-medium text-primary mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Privacy-First AI Workspace
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
              The{" "}
              <span className="bg-gradient-to-r from-primary via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Privacy-First
              </span>{" "}
              AI Browser Workspace
            </h1>

            <div className="space-y-4 mb-8">
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                70+ free tools for productivity, education, business, and development — all running privately in your browser.
              </p>
              <p className="text-base text-muted-foreground/70">
                No login required. No data uploaded. No tracking. Everything processes locally on your device using client-side JavaScript, so your files and information never leave your browser.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link href="/tools" className={buttonVariants({ variant: "primary-gradient", size: "lg", className: "gap-2 h-12 px-8 text-base rounded-xl" })}>
                Start Free
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/tools" className={buttonVariants({ variant: "glass", size: "lg", className: "h-12 px-8 text-base rounded-xl gap-2" })}>
                Explore 70+ Tools
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                </span>
                No login required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                100% client-side
              </span>
              <span className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                </span>
                Zero data collection
              </span>
            </div>
          </motion.div>

          <motion.div
            className="relative hidden lg:block h-[500px] w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            aria-hidden="true"
          >
            <motion.div
              className="absolute inset-x-0 top-[5%] mx-auto w-[90%] rounded-2xl border border-white/[0.08] bg-gradient-to-b from-card/90 to-card/60 backdrop-blur-xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className="ml-4 flex-1 rounded-md bg-white/[0.06] px-3 py-1.5">
                  <span className="text-[10px] text-muted-foreground/50">zilita.com/dashboard</span>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Tasks", value: "12", change: "+3", color: "from-indigo-500/20 to-purple-500/20" },
                    { label: "Projects", value: "5", change: "+1", color: "from-emerald-500/20 to-teal-500/20" },
                    { label: "Focus", value: "2h", change: "18m", color: "from-rose-500/20 to-pink-500/20" },
                  ].map((stat) => (
                    <div key={stat.label} className={`rounded-xl bg-gradient-to-br ${stat.color} p-3 border border-white/[0.04]`}>
                      <p className="text-[10px] text-muted-foreground/60">{stat.label}</p>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg font-bold">{stat.value}</span>
                        <span className="text-[10px] text-emerald-400">+{stat.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-3">
                  <p className="text-[10px] text-muted-foreground/60 mb-2">Weekly Activity</p>
                  <div className="flex items-end gap-1.5 h-12">
                    {[40, 65, 35, 80, 55, 90, 70].map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-sm bg-gradient-to-t from-primary/40 to-primary/20"
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.5, delay: 0.8 + i * 0.08 }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { text: "CBC Lesson Plan — Grade 4 Science", time: "2m ago", done: true },
                    { text: "Design project — Brand Guidelines", time: "15m ago", done: false },
                    { text: "Pomodoro session — 25 min focus", time: "1h ago", done: false },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 1 + i * 0.1 }}
                    >
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${item.done ? "bg-emerald-500/20 border-emerald-500/30" : "border-white/[0.1]"}`}>
                        {item.done && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate">{item.text}</p>
                        <p className="text-[10px] text-muted-foreground/40">{item.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/5 rounded-full blur-[80px]" />
          </motion.div>
        </div>

        {/* Floating feature badges — static, no animation noise */}
        <div className="hidden lg:flex flex-wrap items-center justify-center gap-2 mt-16">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <span
                key={f.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-background/50 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br ${f.color}`}>
                  <Icon className="h-3 w-3 text-white" aria-hidden="true" />
                </span>
                {f.label}
              </span>
            )
          })}
        </div>
      </div>
    </section>
  )
}

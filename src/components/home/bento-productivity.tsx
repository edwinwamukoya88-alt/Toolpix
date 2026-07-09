"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Timer, StickyNote, LayoutGrid, Target, Calendar, ListChecks, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const items = [
  {
    icon: Timer, title: "Pomodoro Timer", desc: "Stay focused with customizable focus sessions", href: "/tools/pomodoro",
    size: "sm", gradient: "from-rose-500/20 to-pink-500/10", iconColor: "from-rose-400 to-pink-400", row: 1, col: 1,
  },
  {
    icon: StickyNote, title: "Notes App", desc: "Write and organize notes with local storage — always private.", href: "/tools/notes",
    size: "sm", gradient: "from-amber-500/20 to-orange-500/10", iconColor: "from-amber-400 to-orange-400", row: 1, col: 2,
  },
  {
    icon: LayoutGrid, title: "Kanban Board", desc: "Drag-and-drop task management for projects and workflows.", href: "/tools/kanban",
    size: "md", gradient: "from-blue-500/20 to-cyan-500/10", iconColor: "from-blue-400 to-cyan-400", row: 1, col: 3, rowSpan: 2,
  },
  {
    icon: Target, title: "Habit Tracker", desc: "Build daily streaks and track your habits over time.", href: "/tools/habit-tracker",
    size: "sm", gradient: "from-emerald-500/20 to-teal-500/10", iconColor: "from-emerald-400 to-teal-400", row: 2, col: 1,
  },
  {
    icon: Calendar, title: "Day Planner", desc: "Plan your day hour by hour with time-blocking.", href: "/tools/day-planner",
    size: "sm", gradient: "from-violet-500/20 to-indigo-500/10", iconColor: "from-violet-400 to-indigo-400", row: 2, col: 2,
  },
  {
    icon: ListChecks, title: "Task Planner", desc: "Organize tasks, reminders, and workflows in one powerful planner.", href: "/tools/planner",
    size: "md", gradient: "from-purple-500/20 to-pink-500/10", iconColor: "from-purple-400 to-pink-400", row: 1, col: 4, rowSpan: 2,
  },
]

export default function BentoProductivity() {
  return (
    <section className="relative py-24 md:py-28">
      <div className="container">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Stay organized and productive
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            A complete productivity system — timer, notes, kanban, habits, planner — all in one place.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[180px] md:auto-rows-[200px]">
          {items.map((item, i) => {
            const Icon = item.icon
            const rowSpan = item.rowSpan || 1
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={cn(
                  "col-span-1",
                  rowSpan === 2 && "row-span-2"
                )}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex flex-col justify-end rounded-2xl border border-white/[0.06] bg-gradient-to-b from-card/80 to-card/40 p-5 h-full overflow-hidden",
                    "transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10"
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    item.gradient
                  )} />
                  <div className="relative">
                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br mb-3",
                      "group-hover:scale-110 transition-transform duration-300",
                      item.gradient
                    )}>
                      <Icon className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
                    </div>
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{item.desc}</p>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href="/tools?category=Productivity">
            <Button variant="glass" size="lg" className="gap-2 h-12 px-8 text-base rounded-xl">
              All Productivity Tools
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

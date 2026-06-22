"use client"

import { memo, useMemo } from "react"
import { ListTodo, CheckCircle2, CalendarCheck, AlertTriangle, Target, Trophy, CalendarRange } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useTodoStore } from "./store"
import { todayStr } from "./utils"

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-muted ${color}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

const TaskDashboard = memo(function TaskDashboard() {
  const todos = useTodoStore((s) => s.todos)
  const currentStreak = useTodoStore((s) => s.analytics.currentStreak)
  const longestStreak = useTodoStore((s) => s.analytics.longestStreak)

  const active = useMemo(() => todos.filter((t) => !t.archived), [todos])
  const total = active.length
  const completed = active.filter((t) => t.done).length
  const dueToday = active.filter((t) => !t.done && t.dueDate === todayStr()).length
  const overdue = active.filter((t) => !t.done && t.dueDate !== null && t.dueDate < todayStr()).length
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0

  const thisMonth = todayStr().slice(0, 7)
  const completedThisMonth = useMemo(() => active.filter((t) => t.completedAt?.startsWith(thisMonth)).length, [active, thisMonth])

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Tasks" value={total} icon={<ListTodo className="size-4" />} color="text-blue-500" />
        <StatCard label="Completed" value={completed} icon={<CheckCircle2 className="size-4" />} color="text-green-500" />
        <StatCard label="Due Today" value={dueToday} icon={<CalendarCheck className="size-4" />} color="text-amber-500" />
        <StatCard label="Overdue" value={overdue} icon={<AlertTriangle className="size-4" />} color={overdue > 0 ? "text-red-500" : "text-muted-foreground"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="size-4 text-primary" />
              <span className="text-sm font-medium">Completion Rate</span>
            </div>
            <div className="text-3xl font-bold mb-2">{rate}%</div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${rate}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{completed} of {total} tasks done</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="size-4 text-amber-500" />
              <span className="text-sm font-medium">Current Streak</span>
            </div>
            <div className="text-3xl font-bold mb-1">{currentStreak} days</div>
            <p className="text-xs text-muted-foreground">Longest: {longestStreak} days</p>
            <div className="flex gap-0.5 mt-2">
              {Array.from({ length: Math.min(currentStreak, 14) }, (_, i) => (
                <div key={i} className="size-2 rounded-sm bg-primary" />
              ))}
              {currentStreak > 14 && <span className="text-[10px] text-muted-foreground">+{currentStreak - 14}</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarRange className="size-4 text-blue-500" />
              <span className="text-sm font-medium">This Month</span>
            </div>
            <div className="text-3xl font-bold mb-1">{completedThisMonth}</div>
            <p className="text-xs text-muted-foreground">Tasks completed this month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

export default TaskDashboard

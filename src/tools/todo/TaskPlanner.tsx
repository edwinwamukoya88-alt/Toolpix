"use client"

import { memo, useMemo, useState } from "react"
import { Sun, SunMedium, Moon, ListTodo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTodoStore } from "./store"
import { getTimeSlot, timeSlotLabel, todayStr } from "./utils"
import TaskCard from "./TaskCard"
import type { Todo } from "./types"

const timeSlots = ["morning", "afternoon", "evening"] as const
const slotIcons = {
  morning: <Sun className="size-4 text-amber-500" />,
  afternoon: <SunMedium className="size-4 text-orange-500" />,
  evening: <Moon className="size-4 text-blue-500" />,
}

const TaskPlanner = memo(function TaskPlanner() {
  const todos = useTodoStore((s) => s.todos)
  const updateTask = useTodoStore((s) => s.updateTask)
  const setDraggedTask = useTodoStore((s) => s.setDraggedTask)
  const calendar = useTodoStore((s) => s.calendar)

  const today = calendar.selectedDate || todayStr()

  const todaysTasks = useMemo(
    () => todos.filter((t) => t.dueDate === today && !t.done && !t.archived),
    [todos, today]
  )

  const completedToday = useMemo(
    () => todos.filter((t) => t.dueDate === today && t.done && !t.archived),
    [todos, today]
  )

  const grouped = useMemo(() => {
    const groups: Record<string, Todo[]> = { morning: [], afternoon: [], evening: [] }
    todaysTasks.forEach((t) => {
      const slot = getTimeSlot(today, t.dueTime)
      groups[slot].push(t)
    })
    return groups
  }, [todaysTasks, today])

  function handleDropOnSlot(slot: string) {
    const dragged = calendar.draggedTask
    if (!dragged) return
    const task = todos.find((t) => t.id === dragged)
    if (!task) return
    let newTime: string | null = null
    if (slot === "morning") newTime = "09:00"
    else if (slot === "afternoon") newTime = "13:00"
    else newTime = "18:00"
    updateTask(dragged, { dueDate: today, dueTime: newTime })
    setDraggedTask(null)
  }

  return (
    <div className="animate-in fade-in duration-300 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          {today === todayStr() ? "Today's Plan" : `Plan for ${new Date(today + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`}
        </h3>
        <span className="text-xs text-muted-foreground">{todaysTasks.length} active · {completedToday.length} done</span>
      </div>

      {todaysTasks.length === 0 && completedToday.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ListTodo className="size-16 text-muted-foreground/40 mb-4" />
          <p className="text-base font-medium text-foreground/60">No tasks planned for this day</p>
          <p className="text-sm text-muted-foreground mt-1">Add tasks with a due date to see them here</p>
        </div>
      )}

      {timeSlots.map((slot) => {
        const slotTasks = grouped[slot]
        const isEmpty = slotTasks.length === 0
        return (
          <div key={slot}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDropOnSlot(slot)}
            className={cn(
              "rounded-xl border bg-card p-4 transition-colors",
              !isEmpty && "border-l-4 border-l-amber-500/50"
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              {slotIcons[slot]}
              <span className="text-sm font-medium">{timeSlotLabel(slot)}</span>
              <span className="text-[10px] text-muted-foreground ml-auto">{slotTasks.length} tasks</span>
            </div>
            {isEmpty ? (
              <div className="py-6 text-center">
                <p className="text-xs text-muted-foreground">No tasks scheduled for this time slot</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">Drag a task here or create one with a time</p>
              </div>
            ) : (
              <div className="space-y-2">
                {slotTasks.map((t) => <TaskCard key={t.id} todo={t} />)}
              </div>
            )}
          </div>
        )
      })}

      {completedToday.length > 0 && (
        <div className="rounded-xl border border-green-300 dark:border-green-800 bg-green-50/30 dark:bg-green-950/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">✅</span>
            <span className="text-sm font-medium text-green-700 dark:text-green-400">Completed</span>
            <span className="text-[10px] text-muted-foreground ml-auto">{completedToday.length} tasks</span>
          </div>
          <div className="space-y-2">
            {completedToday.map((t) => <TaskCard key={t.id} todo={t} />)}
          </div>
        </div>
      )}
    </div>
  )
})

export default TaskPlanner

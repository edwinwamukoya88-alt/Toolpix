"use client"

import { memo, useMemo } from "react"
import { Focus, ListTodo, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useTodoStore } from "./store"
import { todayStr, formatDateDisplay } from "./utils"
import TaskCard from "./TaskCard"
import type { Todo } from "./types"

const FocusMode = memo(function FocusMode() {
  const todos = useTodoStore((s) => s.todos)
  const toggleFocusMode = useTodoStore((s) => s.toggleFocusMode)

  const todayTasks = useMemo(
    () => todos.filter((t) => t.dueDate === todayStr() && !t.done && !t.archived),
    [todos]
  )

  const pinnedTasks = useMemo(
    () => todos.filter((t) => t.pinned && !t.done && !t.archived),
    [todos]
  )

  const noDateTasks = useMemo(
    () => todos.filter((t) => !t.dueDate && !t.done && !t.archived && !t.pinned),
    [todos]
  )

  return (
    <div className="max-w-2xl mx-auto py-4 animate-in fade-in duration-300">
      {/* Minimal header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Focus Mode</h2>
          <p className="text-xs text-muted-foreground">{formatDateDisplay(todayStr())}</p>
        </div>
        <Button variant="outline" size="sm" onClick={toggleFocusMode}>
          <Sparkles className="size-3.5 mr-1" /> Exit Focus
        </Button>
      </div>

      <Separator className="mb-6" />

      {/* Today's Priority */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="size-2 rounded-full bg-primary" />
          <h3 className="text-sm font-medium">Today&apos;s Focus</h3>
          <span className="text-xs text-muted-foreground">{todayTasks.length} tasks</span>
        </div>
        {todayTasks.length === 0 ? (
          <div className="text-center py-8">
            <ListTodo className="size-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No tasks scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.map((t) => <TaskCard key={t.id} todo={t} />)}
          </div>
        )}
      </div>

      {/* Pinned tasks */}
      {pinnedTasks.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="size-2 rounded-full bg-amber-500" />
            <h3 className="text-sm font-medium text-muted-foreground">Pinned</h3>
            <span className="text-xs text-muted-foreground">{pinnedTasks.length}</span>
          </div>
          <div className="space-y-2">
            {pinnedTasks.map((t) => <TaskCard key={t.id} todo={t} />)}
          </div>
        </div>
      )}

      {/* No date tasks */}
      {noDateTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="size-2 rounded-full bg-muted-foreground/40" />
            <h3 className="text-sm font-medium text-muted-foreground">Other Tasks</h3>
            <span className="text-xs text-muted-foreground">{noDateTasks.length}</span>
          </div>
          <div className="space-y-2">
            {noDateTasks.map((t) => <TaskCard key={t.id} todo={t} />)}
          </div>
        </div>
      )}
    </div>
  )
})

export default FocusMode

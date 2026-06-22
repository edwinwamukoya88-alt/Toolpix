"use client"

import { memo } from "react"
import {
  Check, Trash2, Edit3, Copy, Pin, Archive, ArchiveX,
  ChevronDown, ChevronRight, GripVertical, Plus,
  Calendar, Clock, Bell, Repeat, ListTodo,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useTodoStore } from "./store"
import {
  PRIORITIES,
  DEFAULT_CATEGORIES,
  CATEGORY_COLORS,
  formatDateDisplay,
  formatTimeDisplay,
  isOverdue,
  isDueToday,
  PRIORITY_ICONS,
} from "./utils"
import type { Todo } from "./types"

function PriorityBadge({ priority }: { priority: Todo["priority"] }) {
  const p = PRIORITIES.find((x) => x.value === priority) || PRIORITIES[2]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${p.color}`}>
      {PRIORITY_ICONS[priority]}
      {p.label}
    </span>
  )
}

function CategoryBadge({ category }: { category: string }) {
  if (!category) return null
  const cat = DEFAULT_CATEGORIES.find((c) => c.value === category)
  const color = CATEGORY_COLORS[category] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}>
      {cat?.label || category}
    </span>
  )
}

interface TaskCardProps {
  todo: Todo
  compact?: boolean
  onEdit?: (id: string) => void
}

const TaskCard = memo(function TaskCard({ todo, compact = false }: TaskCardProps) {
  const toggleDone = useTodoStore((s) => s.toggleDone)
  const duplicateTask = useTodoStore((s) => s.duplicateTask)
  const togglePin = useTodoStore((s) => s.togglePin)
  const archiveTask = useTodoStore((s) => s.archiveTask)
  const deleteTask = useTodoStore((s) => s.deleteTask)
  const addSubtask = useTodoStore((s) => s.addSubtask)
  const toggleSubtask = useTodoStore((s) => s.toggleSubtask)
  const updateSubtaskTitle = useTodoStore((s) => s.updateSubtaskTitle)
  const deleteSubtask = useTodoStore((s) => s.deleteSubtask)
  const setDraggedTask = useTodoStore((s) => s.setDraggedTask)
  const setEditingTaskId = useTodoStore((s) => s.setEditingTaskId)
  const setConfirmDeleteId = useTodoStore((s) => s.setConfirmDeleteId)
  const expandedSubtasks = useTodoStore((s) => s.ui.expandedSubtasks)
  const toggleExpandedSubtask = useTodoStore((s) => s.toggleExpandedSubtask)

  const completedCount = todo.subtasks.filter((s) => s.done).length
  const subProgress = todo.subtasks.length > 0 ? `${completedCount}/${todo.subtasks.length}` : null
  const isOverdueTask = isOverdue(todo)
  const isDueTodayTask = isDueToday(todo)
  const isExpanded = expandedSubtasks.includes(todo.id)

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.effectAllowed = "move"
    setDraggedTask(todo.id)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "group relative rounded-xl border bg-card p-3 transition-all duration-200 hover:shadow-md hover:border-foreground/20",
        todo.pinned && "ring-1 ring-primary/20",
        isOverdueTask && !todo.done && "border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-950/10",
        isDueTodayTask && !todo.done && !isOverdueTask && "border-amber-300 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/10",
        todo.done && "border-green-300 dark:border-green-800 bg-green-50/30 dark:bg-green-950/10 opacity-75",
        todo.archived && "opacity-50",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity pt-0.5">
          <GripVertical className="size-4 text-muted-foreground" />
        </div>

        <button
          onClick={() => toggleDone(todo.id)}
          className={`mt-0.5 size-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${todo.done ? "bg-primary border-primary text-primary-foreground scale-105" : "border-muted-foreground hover:border-foreground hover:scale-105"}`}
        >
          {todo.done && <Check className="size-3" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {todo.pinned && <Pin className="size-3 text-primary fill-primary" />}
                <span className={cn("text-sm font-medium leading-tight", todo.done && "line-through text-muted-foreground")}>
                  {todo.title}
                </span>
              </div>
              {todo.description && !compact && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{todo.description}</p>
              )}
            </div>

            {!compact && (
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <Button variant="ghost" size="icon-xs" onClick={() => setEditingTaskId(todo.id)}><Edit3 className="size-3.5" /></Button>
                <Button variant="ghost" size="icon-xs" onClick={() => duplicateTask(todo.id)}><Copy className="size-3.5" /></Button>
                <Button variant="ghost" size="icon-xs" onClick={() => togglePin(todo.id)}>
                  <Pin className={cn("size-3.5", todo.pinned && "fill-primary text-primary")} />
                </Button>
                <Button variant="ghost" size="icon-xs" onClick={() => archiveTask(todo.id)}>
                  {todo.archived ? <ArchiveX className="size-3.5" /> : <Archive className="size-3.5" />}
                </Button>
                <Button variant="ghost" size="icon-xs" onClick={() => setConfirmDeleteId(todo.id)}><Trash2 className="size-3.5 text-destructive" /></Button>
              </div>
            )}
          </div>

          {!compact && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <PriorityBadge priority={todo.priority} />
              <CategoryBadge category={todo.category} />
              {todo.dueDate && (
                <span className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md",
                  isOverdueTask ? "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30" :
                  isDueTodayTask ? "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30" :
                  "text-muted-foreground bg-muted"
                )}>
                  <Calendar className="size-3" />
                  {formatDateDisplay(todo.dueDate)}
                  {todo.dueTime && <><Clock className="size-3 ml-0.5" />{formatTimeDisplay(todo.dueTime)}</>}
                </span>
              )}
              {todo.reminderOffset !== null && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  <Bell className="size-3" />
                  {todo.reminderSent ? "🔔" : "⏰"}
                </span>
              )}
              {todo.recurring && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  <Repeat className="size-3" />
                  {todo.recurring.type}
                </span>
              )}
              {todo.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">#{tag}</Badge>
              ))}
            </div>
          )}

          <div className="mt-2">
            {todo.subtasks.length > 0 && (
              <div>
                <button onClick={() => toggleExpandedSubtask(todo.id)} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                  {isExpanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                  {subProgress} Complete
                  <span className="ml-1 h-1.5 w-16 rounded-full bg-muted overflow-hidden inline-block">
                    <span className="h-full block rounded-full bg-primary transition-all" style={{ width: `${todo.subtasks.length > 0 ? (completedCount / todo.subtasks.length) * 100 : 0}%` }} />
                  </span>
                </button>
                {isExpanded && (
                  <div className="mt-1 pl-2 border-l-2 border-muted">
                    {todo.subtasks.map((sub) => (
                      <div key={sub.id} className="flex items-center gap-2 py-0.5 group/sub">
                        <button onClick={() => toggleSubtask(todo.id, sub.id)}
                          className={`size-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${sub.done ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground hover:border-foreground"}`}>
                          {sub.done && <Check className="size-2.5" />}
                        </button>
                        <input value={sub.title} onChange={(e) => updateSubtaskTitle(todo.id, sub.id, e.target.value)}
                          className={`flex-1 bg-transparent text-xs outline-none ${sub.done ? "line-through text-muted-foreground" : ""}`}
                          placeholder="Subtask..." />
                        <button onClick={() => deleteSubtask(todo.id, sub.id)} className="opacity-0 group-hover/sub:opacity-100 transition-opacity">
                          <Trash2 className="size-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button onClick={() => addSubtask(todo.id)} className="text-[10px] text-muted-foreground hover:text-foreground mt-1 flex items-center gap-1">
              <Plus className="size-3" /> Add subtask
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

export default TaskCard

"use client"

import { useState, useRef, useCallback, useMemo, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Circle, Plus, Trash2, GripVertical, ListTodo, Search, Filter, Calendar, Clock, ChevronDown, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { generateId } from "@/lib/utils"

interface Task {
  id: string
  text: string
  completed: boolean
  estimatedPomodoros: number
  completedPomodoros: number
  priority: "low" | "medium" | "high"
  dueDate?: string
  createdAt: number
}

interface TaskOrganizerProps {
  className?: string
  onTaskUpdate?: (tasks: Task[]) => void
}

const priorityColors: Record<string, string> = {
  low: "bg-slate-500/20 text-slate-300 border-slate-500/20",
  medium: "bg-amber-500/20 text-amber-300 border-amber-500/20",
  high: "bg-rose-500/20 text-rose-300 border-rose-500/20",
}

const priorityDotColors: Record<string, string> = {
  low: "bg-slate-400",
  medium: "bg-amber-400",
  high: "bg-rose-400",
}

const priorityLabels: Record<string, string> = {
  low: "Low",
  medium: "Med",
  high: "High",
}

type TaskFilter = "all" | "today" | "upcoming" | "completed" | "overdue"

function CircularProgress({ pct, size = 32 }: { pct: number; size?: number }) {
  const r = (size - 4) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(238, 90%, 60%, 0.1)" strokeWidth="3" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="url(#task-progress-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (pct / 100) * c }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <defs>
        <linearGradient id="task-progress-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(238, 90%, 60%)" />
          <stop offset="100%" stopColor="hsl(262, 83%, 65%)" />
        </linearGradient>
      </defs>
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" fill="hsl(238, 90%, 70%, 0.8)" fontSize="7" fontWeight="600" fontFamily="monospace">
        {Math.round(pct)}%
      </text>
    </svg>
  )
}

function TaskItem({
  task,
  onToggle,
  onDelete,
  onIncrementPomo,
  onUpdate,
  onNativeDragStart,
  onNativeDragOver,
  onNativeDragEnd,
  isDragging,
}: {
  task: Task
  onToggle: () => void
  onDelete: () => void
  onIncrementPomo: () => void
  onUpdate: (updates: Partial<Task>) => void
  onNativeDragStart: (e: React.DragEvent) => void
  onNativeDragOver: (e: React.DragEvent) => void
  onNativeDragEnd: () => void
  isDragging: boolean
}) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
  const pomoPct = task.estimatedPomodoros > 0 ? Math.min(100, Math.round((task.completedPomodoros / task.estimatedPomodoros) * 100)) : 0

  return (
    <div
      draggable
      onDragStart={onNativeDragStart}
      onDragOver={onNativeDragOver}
      onDragEnd={onNativeDragEnd}
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-3.5 transition-all duration-200 cursor-grab active:cursor-grabbing",
        isDragging
          ? "border-indigo-500/30 bg-indigo-500/10 opacity-80 shadow-xl scale-[1.02]"
          : task.completed
            ? "border-emerald-500/10 bg-indigo-950/15 opacity-60"
            : isOverdue
              ? "border-rose-500/15 bg-rose-500/5"
              : "border-indigo-500/10 bg-indigo-950/30 hover:border-indigo-500/20 hover:bg-indigo-950/40"
      )}
    >
      <div className="text-indigo-300/20 cursor-grab hover:text-indigo-300/40 transition-colors">
        <GripVertical className="h-4 w-4" />
      </div>

      <button
        onClick={onToggle}
        className="shrink-0 relative"
        aria-label={task.completed ? "Mark incomplete" : "Mark completed"}
      >
        {task.completed ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </motion.div>
        ) : (
          <Circle className="h-5 w-5 text-indigo-300/30 hover:text-indigo-300/50 transition-colors" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0",
            priorityDotColors[task.priority]
          )} />
          <span
            className={cn(
              "text-sm block truncate",
              task.completed ? "line-through text-indigo-300/30" : "text-indigo-100"
            )}
          >
            {task.text}
          </span>
          {task.completed && (
            <span className="shrink-0">
              <Sparkles className="h-3 w-3 text-emerald-400" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5 mt-1.5">
          <span className={cn("text-[9px] px-1.5 py-0.5 rounded-md font-medium border", priorityColors[task.priority])}>
            {priorityLabels[task.priority]}
          </span>
          <button
            onClick={onIncrementPomo}
            className="flex items-center gap-1 text-[9px] text-indigo-300/40 hover:text-indigo-200/60 transition-colors"
            title="Increment completed pomodoro"
          >
            <Clock className="h-3 w-3" />
            <span>{task.completedPomodoros}/{task.estimatedPomodoros}</span>
          </button>
          {task.dueDate && (
            <span className={cn(
              "flex items-center gap-1 text-[9px]",
              isOverdue ? "text-rose-400" : "text-indigo-300/40"
            )}>
              <Calendar className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <CircularProgress pct={pomoPct} size={28} />
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-indigo-300/20 hover:text-rose-400 transition-all"
          aria-label="Delete task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

function TaskOrganizer({ className = "", onTaskUpdate }: TaskOrganizerProps) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const raw = localStorage.getItem("zenith-tasks")
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [newTaskText, setNewTaskText] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<Task["priority"]>("medium")
  const [newTaskPomodoros, setNewTaskPomodoros] = useState(2)
  const [newTaskDueDate, setNewTaskDueDate] = useState("")
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [filter, setFilter] = useState<TaskFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"created" | "priority" | "due">("created")
  const [showInput, setShowInput] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const persist = useCallback((updated: Task[]) => {
    setTasks(updated)
    try {
      localStorage.setItem("zenith-tasks", JSON.stringify(updated))
    } catch {}
    onTaskUpdate?.(updated)
  }, [onTaskUpdate])

  function addTask() {
    if (!newTaskText.trim()) return
    const task: Task = {
      id: generateId(),
      text: newTaskText.trim(),
      completed: false,
      estimatedPomodoros: newTaskPomodoros,
      completedPomodoros: 0,
      priority: newTaskPriority,
      dueDate: newTaskDueDate || undefined,
      createdAt: Date.now(),
    }
    persist([...tasks, task])
    setNewTaskText("")
    setNewTaskDueDate("")
    setNewTaskPomodoros(2)
    setNewTaskPriority("medium")
    inputRef.current?.focus()
  }

  function toggleTask(id: string) {
    persist(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  function deleteTask(id: string) {
    persist(tasks.filter(t => t.id !== id))
  }

  function incrementPomo(id: string) {
    persist(tasks.map(t =>
      t.id === id && t.completedPomodoros < t.estimatedPomodoros
        ? { ...t, completedPomodoros: t.completedPomodoros + 1 }
        : t
    ))
  }

  function handleDragStart(index: number) {
    setDragIndex(index)
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    const updated = [...tasks]
    const [moved] = updated.splice(dragIndex, 1)
    updated.splice(index, 0, moved)
    setDragIndex(index)
    setTasks(updated)
  }

  function handleDragEnd() {
    setDragIndex(null)
    try {
      localStorage.setItem("zenith-tasks", JSON.stringify(tasks))
    } catch {}
    onTaskUpdate?.(tasks)
  }

  const filteredTasks = useMemo(() => {
    let result = [...tasks]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t => t.text.toLowerCase().includes(q))
    }

    const today = new Date().toISOString().split("T")[0]
    switch (filter) {
      case "today":
        result = result.filter(t => !t.completed && t.dueDate === today)
        break
      case "upcoming":
        result = result.filter(t => !t.completed && t.dueDate && t.dueDate > today)
        break
      case "completed":
        result = result.filter(t => t.completed)
        break
      case "overdue":
        result = result.filter(t => !t.completed && t.dueDate && t.dueDate < today)
        break
      default:
        result = result.filter(t => !t.completed)
    }

    switch (sortBy) {
      case "priority":
        const order = { high: 0, medium: 1, low: 2 }
        result.sort((a, b) => order[a.priority] - order[b.priority])
        break
      case "due":
        result.sort((a, b) => {
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return a.dueDate.localeCompare(b.dueDate)
        })
        break
      default:
        result.sort((a, b) => b.createdAt - a.createdAt)
    }

    return result
  }, [tasks, filter, searchQuery, sortBy])

  const totalEstimated = tasks.reduce((s, t) => s + t.estimatedPomodoros, 0)
  const totalCompleted = tasks.reduce((s, t) => s + t.completedPomodoros, 0)
  const overallPct = totalEstimated > 0 ? Math.round((totalCompleted / totalEstimated) * 100) : 0
  const doneTasks = tasks.filter(t => t.completed).length

  const filters: { key: TaskFilter; label: string; count?: number }[] = [
    { key: "all", label: "Active", count: tasks.filter(t => !t.completed).length },
    { key: "today", label: "Today", count: tasks.filter(t => !t.completed && t.dueDate === new Date().toISOString().split("T")[0]).length },
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Done", count: doneTasks },
    { key: "overdue", label: "Overdue", count: tasks.filter(t => !t.completed && t.dueDate && t.dueDate < new Date().toISOString().split("T")[0]).length },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn("group relative overflow-hidden rounded-3xl border border-indigo-500/10 bg-gradient-to-b from-indigo-950/40 to-slate-950/40 p-5 sm:p-6 noise", className)}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-indigo-500/10">
              <ListTodo className="h-4 w-4 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-indigo-200">Task Planner</h2>
              <p className="text-[10px] text-indigo-300/40">{tasks.length} tasks</p>
            </div>
          </div>
          {tasks.length > 0 && (
            <div className="flex items-center gap-2">
              <CircularProgress pct={overallPct} size={36} />
            </div>
          )}
        </div>

        {tasks.length > 0 && overallPct > 0 && (
          <div className="mb-4 p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/10">
            <div className="flex items-center justify-between text-xs text-indigo-300/60 mb-1.5">
              <span>Progress</span>
              <span className="tabular-nums font-mono text-indigo-200">{doneTasks}/{tasks.length} done</span>
            </div>
            <div className="h-2 rounded-full bg-indigo-950/60 overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallPct}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 animate-gradient-shift relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </motion.div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium rounded-xl whitespace-nowrap transition-all shrink-0",
                filter === f.key
                  ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/20 shadow-sm"
                  : "text-indigo-300/40 hover:text-indigo-200/60 border border-transparent hover:border-indigo-500/10"
              )}
            >
              {f.label}
              {f.count !== undefined && f.count > 0 && (
                <span className={cn(
                  "text-[8px] px-1.5 py-0.5 rounded-full font-mono",
                  filter === f.key ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-950/40 text-indigo-300/30"
                )}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-indigo-300/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-indigo-950/30 border border-indigo-500/10 rounded-xl pl-9 pr-3 py-2 text-xs text-indigo-200/60 placeholder-indigo-300/20 outline-none focus:border-indigo-500/30 focus:ring-1 focus:ring-indigo-500/10 transition-all"
              aria-label="Search tasks"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-indigo-950/30 border border-indigo-500/10 rounded-xl px-2.5 py-2 text-[10px] text-indigo-300/50 outline-none focus:border-indigo-500/30 cursor-pointer"
            aria-label="Sort tasks"
          >
            <option value="created">Latest</option>
            <option value="priority">Priority</option>
            <option value="due">Due Date</option>
          </select>
        </div>

        <AnimatePresence mode="popLayout">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, i) => (
              <div key={task.id} className="mb-2">
                <TaskItem
                  task={task}
                  onToggle={() => toggleTask(task.id)}
                  onDelete={() => deleteTask(task.id)}
                  onIncrementPomo={() => incrementPomo(task.id)}
                  onUpdate={(updates) => persist(tasks.map(t => t.id === task.id ? { ...t, ...updates } : t))}
                  onNativeDragStart={() => handleDragStart(tasks.indexOf(task))}
                  onNativeDragOver={(e) => handleDragOver(e, tasks.indexOf(task))}
                  onNativeDragEnd={handleDragEnd}
                  isDragging={dragIndex === tasks.indexOf(task)}
                />
              </div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 px-4 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 mb-3">
                <Sparkles className="h-6 w-6 text-indigo-300/40" />
              </div>
              <p className="text-sm text-indigo-200/40 font-medium">
                {searchQuery ? "No matching tasks" : filter === "completed" ? "No completed tasks yet" : "Your tasks will appear here"}
              </p>
              <p className="text-[10px] text-indigo-300/30 mt-1">
                {searchQuery ? "Try a different search term" : "Add a task below to get started"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4">
          <button
            onClick={() => setShowInput(!showInput)}
            className="flex items-center gap-2 w-full px-4 py-3 rounded-2xl border border-dashed border-indigo-500/15 text-indigo-300/40 hover:text-indigo-200/60 hover:border-indigo-500/30 hover:bg-indigo-950/20 transition-all text-xs font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>

          <AnimatePresence>
            {showInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden mt-2"
              >
                <div className="rounded-2xl border border-indigo-500/10 bg-indigo-950/30 p-4 space-y-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    placeholder="What do you want to work on?"
                    className="w-full bg-indigo-950/40 border border-indigo-500/15 rounded-xl px-4 py-3 text-sm text-indigo-200 placeholder-indigo-300/20 outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                    aria-label="New task description"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-lg border border-indigo-500/10 bg-indigo-950/40 px-2.5 py-1.5">
                      <span className="text-[9px] text-indigo-300/40">Priority:</span>
                      {(["low", "medium", "high"] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setNewTaskPriority(p)}
                          className={cn(
                            "text-[9px] px-2 py-0.5 rounded-md font-medium transition-all",
                            newTaskPriority === p
                              ? priorityColors[p]
                              : "text-indigo-300/30 hover:text-indigo-300/50"
                          )}
                        >
                          {priorityLabels[p]}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-indigo-500/10 bg-indigo-950/40 px-2.5 py-1.5">
                      <Clock className="h-3 w-3 text-indigo-300/30" />
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={newTaskPomodoros}
                        onChange={(e) => setNewTaskPomodoros(Math.max(1, Math.min(8, Number(e.target.value))))}
                        className="w-8 bg-transparent text-xs text-indigo-200 outline-none text-center tabular-nums"
                        aria-label="Estimated pomodoros"
                      />
                      <span className="text-[9px] text-indigo-300/30">pomos</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-indigo-500/10 bg-indigo-950/40 px-2.5 py-1.5">
                      <Calendar className="h-3 w-3 text-indigo-300/30" />
                      <input
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        className="w-24 bg-transparent text-[10px] text-indigo-200/60 outline-none [color-scheme:dark]"
                        aria-label="Due date"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={addTask}
                      disabled={!newTaskText.trim()}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:shadow-indigo-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                      Create Task
                    </motion.button>
                    <button
                      onClick={() => setShowInput(false)}
                      className="px-3 py-2.5 rounded-xl border border-indigo-500/10 text-[11px] text-indigo-300/40 hover:text-indigo-200 hover:border-indigo-500/20 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export { type Task }
export default memo(TaskOrganizer)
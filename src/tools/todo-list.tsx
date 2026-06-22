"use client"

import { useMemo, useRef, useEffect } from "react"
import {
  CheckCircle2, BarChart3, Calendar, LayoutDashboard,
  Plus, Download, Upload, Archive, ArchiveX, Bell,
  Sparkles, Focus, X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import { useTodoStore, selectFilteredTodos, selectPinnedTodos, selectUnreadNotifications } from "./todo/store"
import { todayStr, PRIORITIES } from "./todo/utils"
import type { ViewMode, Priority } from "./todo/types"

import TaskFilters from "./todo/TaskFilters"
import TaskCard from "./todo/TaskCard"
import TaskForm from "./todo/TaskForm"
import TaskDashboard from "./todo/TaskDashboard"
import TaskCalendar from "./todo/TaskCalendar"
import TaskPlanner from "./todo/TaskPlanner"
import FocusMode from "./todo/FocusMode"
import ReminderSystem from "./todo/ReminderSystem"

export default function TodoList() {
  // Store subscriptions
  const todos = useTodoStore((s) => s.todos)
  const ui = useTodoStore((s) => s.ui)
  const filters = useTodoStore((s) => s.filters)
  const calendar = useTodoStore((s) => s.calendar)
  const quickAdd = useTodoStore((s) => s.quickAdd)
  const notificationQueue = useTodoStore((s) => s.notificationQueue)
  const customCategories = useTodoStore((s) => s.customCategories)
  const backupTimestamp = useTodoStore((s) => s.backupTimestamp)
  const analytics = useTodoStore((s) => s.analytics)

  // Actions
  const setView = useTodoStore((s) => s.setView)
  const toggleFocusMode = useTodoStore((s) => s.toggleFocusMode)
  const setShowArchived = useTodoStore((s) => s.setShowArchived)
  const setTaskDialogOpen = useTodoStore((s) => s.setTaskDialogOpen)
  const setEditingTaskId = useTodoStore((s) => s.setEditingTaskId)
  const setConfirmDeleteId = useTodoStore((s) => s.setConfirmDeleteId)
  const setDraggedTask = useTodoStore((s) => s.setDraggedTask)
  const setQuickAddText = useTodoStore((s) => s.setQuickAddText)
  const setQuickAddPriority = useTodoStore((s) => s.setQuickAddPriority)
  const addTask = useTodoStore((s) => s.addTask)
  const deleteTask = useTodoStore((s) => s.deleteTask)
  const setBackupTimestamp = useTodoStore((s) => s.setBackupTimestamp)
  const moveTaskOrder = useTodoStore((s) => s.moveTaskOrder)
  const dismissNotification = useTodoStore((s) => s.dismissNotification)
  const clearNotifications = useTodoStore((s) => s.clearNotifications)
  const markAllNotificationsRead = useTodoStore((s) => s.markAllNotificationsRead)

  // Computed
  const filteredTodos = useMemo(() => selectFilteredTodos({ todos, filters, ui }), [todos, filters, ui, analytics])

  const pinnedTodos = useMemo(() => selectPinnedTodos({ todos }), [todos])
  const unreadNotifs = useMemo(() => selectUnreadNotifications({ notificationQueue }), [notificationQueue])

  const effectiveTodos = useMemo(
    () => (ui.showArchived ? todos : todos.filter((t) => !t.archived)),
    [todos, ui.showArchived]
  )

  // Drop handler for task reordering
  const dragOverIndex = useRef<number | null>(null)

  // Request notification permission on mount
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  // ── Export/Import ──
  function exportJSON() {
    const data = JSON.stringify({
      todos, analytics, customCategories, exportedAt: new Date().toISOString(),
    }, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `todo-backup-${todayStr()}.json`
    a.click(); URL.revokeObjectURL(url)
    setBackupTimestamp(new Date().toISOString())
    toast.success("Backup exported")
  }

  function exportCSV() {
    const headers = ["Title", "Description", "Category", "Priority", "DueDate", "DueTime", "Tags", "Status", "CreatedAt"]
    const rows = todos.map((t) => [
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.category, t.priority, t.dueDate || "", t.dueTime || "",
      t.tags.join("; "), t.done ? "Completed" : "Active", t.createdAt,
    ].join(","))
    const csv = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `todo-export-${todayStr()}.csv`
    a.click(); URL.revokeObjectURL(url)
    toast.success("CSV exported")
  }

  function importJSON(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.todos && Array.isArray(data.todos)) {
          const store = useTodoStore.getState()
          const existing = new Map(store.todos.map((t) => [t.id, t]))
          data.todos.forEach((t: typeof todos[0]) => {
            if (!existing.has(t.id)) existing.set(t.id, t)
          })
          useTodoStore.getState().setTodos(Array.from(existing.values()))
          if (data.customCategories) useTodoStore.getState().setCustomCategories(data.customCategories)
          if (data.analytics) useTodoStore.getState().setAnalytics(data.analytics)
          toast.success(`Imported ${data.todos.length} tasks`)
        } else {
          toast.error("Invalid backup file")
        }
      } catch { toast.error("Failed to parse file") }
    }
    reader.readAsText(file)
  }

  function importCSV(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n").filter(Boolean)
        if (lines.length < 2) { toast.error("CSV is empty"); return }
        const headers = lines[0].split(",").map((h) => h.trim())
        const newTodos: typeof todos = []
        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(",").map((v) => v.replace(/^"|"$/g, "").trim())
          const title = vals[headers.indexOf("Title")] || `Task ${i}`
          const priority = (vals[headers.indexOf("Priority")] || "medium").toLowerCase()
          newTodos.push({
            id: crypto.randomUUID(), title,
            description: vals[headers.indexOf("Description")] || "",
            category: (vals[headers.indexOf("Category")] || "personal").toLowerCase(),
            priority: (["critical", "high", "medium", "low"].includes(priority) ? priority : "medium") as Priority,
            dueDate: vals[headers.indexOf("DueDate")] || null,
            dueTime: vals[headers.indexOf("DueTime")] || null,
            reminderOffset: null, reminderSent: false, recurring: null,
            tags: (vals[headers.indexOf("Tags")] || "").split(";").map((t) => t.trim()).filter(Boolean),
            done: vals[headers.indexOf("Status")] === "Completed",
            pinned: false, archived: false,
            createdAt: vals[headers.indexOf("CreatedAt")] || new Date().toISOString(),
            completedAt: null, subtasks: [], order: Date.now() + i,
          })
        }
        useTodoStore.getState().setTodos((prev) => [...prev, ...newTodos])
        toast.success(`Imported ${newTodos.length} tasks from CSV`)
      } catch { toast.error("Failed to parse CSV") }
    }
    reader.readAsText(file)
  }

  function handleQuickAdd() {
    if (!quickAdd.text.trim()) return
    addTask({ title: quickAdd.text.trim(), priority: quickAdd.priority })
    setQuickAddText("")
  }

  // Focus mode overrides the entire view
  if (ui.focusMode) {
    return <FocusMode />
  }

  const navViews: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: "tasks", label: "Tasks", icon: <CheckCircle2 className="size-4" /> },
    { key: "dashboard", label: "Dashboard", icon: <BarChart3 className="size-4" /> },
    { key: "calendar", label: "Calendar", icon: <Calendar className="size-4" /> },
    { key: "planner", label: "Planner", icon: <LayoutDashboard className="size-4" /> },
  ]

  return (
    <div className="space-y-4">
      <ReminderSystem />

      {/* Privacy Banner */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border text-xs text-muted-foreground">
        <span className="text-base">🔒</span>
        <span>All tasks are stored locally in your browser. No account required. No data leaves your device.</span>
      </div>

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          {navViews.map((tab) => (
            <button key={tab.key} onClick={() => setView(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                ui.view === tab.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <div className="relative">
            <Button variant="ghost" size="icon-sm" onClick={() => {
              if (unreadNotifs > 0) markAllNotificationsRead()
            }}>
              <Bell className="size-4" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 size-4 rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground flex items-center justify-center">
                  {unreadNotifs > 9 ? "9+" : unreadNotifs}
                </span>
              )}
            </Button>
          </div>

          {/* Focus mode toggle */}
          <Button variant="ghost" size="icon-sm" onClick={toggleFocusMode}>
            <Sparkles className="size-4" />
          </Button>

          {/* Export/Import */}
          <Button variant="outline" size="sm" onClick={exportJSON}><Download className="size-3.5 mr-1" /> Export</Button>
          <label className="cursor-pointer">
            <Button variant="outline" size="sm"><Upload className="size-3.5 mr-1" /> Import</Button>
            <input type="file" accept=".json,.csv" className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (file.name.endsWith(".json")) importJSON(file)
                else if (file.name.endsWith(".csv")) importCSV(file)
                e.target.value = ""
              }} />
          </label>
          <Button variant="ghost" size="icon-sm" onClick={() => setShowArchived(!ui.showArchived)}>
            {ui.showArchived ? <ArchiveX className="size-4" /> : <Archive className={cn("size-4")} />}
          </Button>
        </div>
      </div>

      {/* View Content */}
      {ui.view === "dashboard" && <TaskDashboard />}
      {ui.view === "calendar" && <TaskCalendar />}

      {ui.view === "planner" && <TaskPlanner />}

      {ui.view === "tasks" && (
        <div className="space-y-3 animate-in fade-in duration-300">
          <TaskFilters />

          {/* Quick add */}
          {ui.showQuickAdd && (
            <div className="flex items-center gap-2">
              <input value={quickAdd.text} onChange={(e) => setQuickAddText(e.target.value)}
                placeholder="Quick add a task..."
                onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <select value={quickAdd.priority} onChange={(e) => setQuickAddPriority(e.target.value as Priority)}
                className="h-9 rounded-md border border-input bg-transparent px-2 text-xs w-20">
                {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <Button onClick={handleQuickAdd}><Plus className="size-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => { setEditingTaskId(null); setTaskDialogOpen(true) }}>
                <Plus className="size-4" />
              </Button>
            </div>
          )}

          {/* Pinned section */}
          {pinnedTodos.length > 0 && ui.sectionFilter === "all" && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">📌 Pinned</span>
              </div>
              <div className={cn("gap-2", ui.tasksView === "board" ? "grid grid-cols-1 md:grid-cols-2" : "space-y-2")}>
                {pinnedTodos.map((t) => <TaskCard key={t.id} todo={t} />)}
              </div>
              <Separator className="my-3" />
            </div>
          )}

          {/* Main task list */}
          {filteredTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 text-muted-foreground/40"><CheckCircle2 className="size-16" /></div>
              <p className="text-base font-medium text-foreground/60">
                {filters.searchQuery ? "No tasks match your search" : "No tasks yet"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {filters.searchQuery ? "Try different keywords or clear filters" : "Create your first task to get started"}
              </p>
              <Button variant="outline" size="sm" className="mt-4"
                onClick={() => { setEditingTaskId(null); setTaskDialogOpen(true) }}>
                <Plus className="size-4 mr-1" /> Create Task
              </Button>
            </div>
          ) : (
            <div className={cn("gap-2", ui.tasksView === "board" ? "grid grid-cols-1 md:grid-cols-2" : "space-y-2")}>
              {filteredTodos.map((t) => <TaskCard key={t.id} todo={t} />)}
            </div>
          )}

          {filteredTodos.length > 0 && (
            <p className="text-xs text-center text-muted-foreground pb-2">
              Showing {filteredTodos.length} of {effectiveTodos.filter((t) => !t.archived).length} tasks
            </p>
          )}
        </div>
      )}

      {/* Floating add button (mobile) */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
        <Button className="size-14 rounded-full shadow-lg" onClick={() => { setEditingTaskId(null); setTaskDialogOpen(true) }}>
          <Plus className="size-6" />
        </Button>
      </div>

      {/* Task Form Dialog */}
      <TaskForm />

      {/* Notification history panel */}
      {notificationQueue.length > 0 && (
        <div className="fixed bottom-4 left-4 z-50 max-w-xs w-full">
          {notificationQueue.filter((n) => !n.read).slice(0, 3).map((n) => (
            <div key={n.id}
              className="flex items-start gap-2 p-3 mb-1 rounded-lg bg-popover border shadow-lg text-sm animate-in slide-in-from-bottom-2 fade-in duration-200"
            >
              <Bell className="size-4 mt-0.5 flex-shrink-0 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{n.message}</p>
              </div>
              <button onClick={() => dismissNotification(n.id)} className="flex-shrink-0">
                <X className="size-3 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {ui.confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="rounded-xl bg-popover p-6 shadow-lg border max-w-sm w-full mx-4">
            <h3 className="text-sm font-medium mb-2">Delete Task</h3>
            <p className="text-xs text-muted-foreground mb-4">Are you sure you want to delete this task? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={() => {
                if (ui.confirmDeleteId) { deleteTask(ui.confirmDeleteId); setConfirmDeleteId(null) }
              }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Separate component to avoid circular dependency
function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px bg-border", className)} />
}

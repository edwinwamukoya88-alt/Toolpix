"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  Todo,
  AnalyticsData,
  Priority,
  ViewMode,
  TasksView,
  CalendarViewMode,
  SectionFilter,
  FilterState,
  UIState,
  CalendarState,
  NotificationItem,
  QuickAddState,
  Subtask,
  RecurringConfig,
} from "./types"
import { generateNextOccurrence, migrateLegacyTodo, todayStr, createNotificationId } from "./utils"

const STORAGE_KEY = "toolpix_todo_store"

function getDefaultAnalytics(): AnalyticsData {
  return { dailyLog: {}, longestStreak: 0, currentStreak: 0, lastActiveDate: null }
}

function getDefaultFilters(): FilterState {
  return {
    searchQuery: "",
    priority: "all",
    category: "all",
    tag: "all",
    status: "all",
    sortBy: "created",
    sortAsc: false,
    pinFilter: false,
  }
}

function getDefaultUI(): UIState {
  return {
    view: "tasks",
    tasksView: "list",
    calendarView: "month",
    sectionFilter: "all",
    showArchived: false,
    showQuickAdd: true,
    focusMode: false,
    taskDialogOpen: false,
    editingTaskId: null,
    confirmDeleteId: null,
    expandedSubtasks: [],
  }
}

function getDefaultCalendar(): CalendarState {
  const now = new Date()
  return {
    month: now.getMonth(),
    year: now.getFullYear(),
    selectedDate: todayStr(),
    draggedTask: null,
  }
}

function getDefaultQuickAdd(): QuickAddState {
  return { text: "", priority: "medium" }
}

export interface TodoStore {
  // Data
  todos: Todo[]
  analytics: AnalyticsData
  customCategories: string[]
  backupTimestamp: string | null

  // State slices
  filters: FilterState
  ui: UIState
  calendar: CalendarState
  quickAdd: QuickAddState
  notificationQueue: NotificationItem[]

  // Data actions
  setTodos: (fn: Todo[] | ((prev: Todo[]) => Todo[])) => void
  setAnalytics: (fn: AnalyticsData | ((prev: AnalyticsData) => AnalyticsData)) => void
  setCustomCategories: (fn: string[] | ((prev: string[]) => string[])) => void
  setBackupTimestamp: (fn: string | null | ((prev: string | null) => string | null)) => void

  // Filter actions
  setSearchQuery: (query: string) => void
  setFilterPriority: (p: Priority | "all") => void
  setFilterCategory: (c: string) => void
  setFilterTag: (t: string) => void
  setFilterStatus: (s: "all" | "active" | "completed") => void
  setSortBy: (s: FilterState["sortBy"]) => void
  setSortAsc: (a: boolean) => void
  setPinFilter: (p: boolean) => void

  // UI actions
  setView: (v: ViewMode) => void
  setTasksView: (v: TasksView) => void
  setCalendarView: (v: CalendarViewMode) => void
  setSectionFilter: (s: SectionFilter) => void
  setShowArchived: (s: boolean) => void
  setShowQuickAdd: (s: boolean) => void
  toggleFocusMode: () => void
  setTaskDialogOpen: (o: boolean) => void
  setEditingTaskId: (id: string | null) => void
  setConfirmDeleteId: (id: string | null) => void
  toggleExpandedSubtask: (id: string) => void

  // Calendar actions
  setCalendarMonth: (m: number) => void
  setCalendarYear: (y: number) => void
  setSelectedDate: (d: string) => void
  setDraggedTask: (id: string | null) => void
  prevMonth: () => void
  nextMonth: () => void

  // Quick add actions
  setQuickAddText: (t: string) => void
  setQuickAddPriority: (p: Priority) => void

  // Notification actions
  addNotification: (item: Omit<NotificationItem, "id" | "timestamp" | "read">) => void
  dismissNotification: (id: string) => void
  clearNotifications: () => void
  markAllNotificationsRead: () => void

  // Task CRUD
  addTask: (data: Partial<Todo>) => Todo
  updateTask: (id: string, updates: Partial<Todo>) => void
  deleteTask: (id: string) => void
  toggleDone: (id: string) => void
  duplicateTask: (id: string) => void
  togglePin: (id: string) => void
  archiveTask: (id: string) => void
  moveTaskOrder: (fromIndex: number, toIndex: number) => void

  // Subtask actions
  addSubtask: (taskId: string) => void
  toggleSubtask: (taskId: string, subId: string) => void
  updateSubtaskTitle: (taskId: string, subId: string, title: string) => void
  deleteSubtask: (taskId: string, subId: string) => void

  // Computed helpers (keep derived state in selectors/components)
}

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => {
      // Migration from old format
      const migrate = () => {
        try {
          const oldTodos = localStorage.getItem("toolpix_todos")
          if (oldTodos) {
            const parsed = JSON.parse(oldTodos)
            if (Array.isArray(parsed)) {
              const migrated = parsed
                .map((t: Record<string, unknown>) => migrateLegacyTodo(t))
                .filter(Boolean) as Todo[]
              if (migrated.length > 0) {
                set({ todos: migrated })
              }
            }
            localStorage.removeItem("toolpix_todos")
          }
          const oldAnalytics = localStorage.getItem("toolpix_todo_analytics")
          if (oldAnalytics) {
            try { set({ analytics: JSON.parse(oldAnalytics) }) } catch { /* ignore */ }
            localStorage.removeItem("toolpix_todo_analytics")
          }
          const oldCategories = localStorage.getItem("toolpix_todo_categories")
          if (oldCategories) {
            try { set({ customCategories: JSON.parse(oldCategories) }) } catch { /* ignore */ }
            localStorage.removeItem("toolpix_todo_categories")
          }
          const oldBackup = localStorage.getItem("toolpix_todo_backup_timestamp")
          if (oldBackup) {
            set({ backupTimestamp: oldBackup })
            localStorage.removeItem("toolpix_todo_backup_timestamp")
          }
        } catch { /* ignore migration errors */ }
      }

      migrate()

      return {
        // Data
        todos: [],
        analytics: getDefaultAnalytics(),
        customCategories: [],
        backupTimestamp: null,

        // State slices
        filters: getDefaultFilters(),
        ui: getDefaultUI(),
        calendar: getDefaultCalendar(),
        quickAdd: getDefaultQuickAdd(),
        notificationQueue: [],

        // Data actions
        setTodos: (fn) => set((state) => ({ todos: typeof fn === "function" ? fn(state.todos) : fn })),
        setAnalytics: (fn) => set((state) => ({ analytics: typeof fn === "function" ? fn(state.analytics) : fn })),
        setCustomCategories: (fn) => set((state) => ({ customCategories: typeof fn === "function" ? fn(state.customCategories) : fn })),
        setBackupTimestamp: (fn) => set((state) => ({ backupTimestamp: typeof fn === "function" ? fn(state.backupTimestamp) : fn })),

        // Filter actions
        setSearchQuery: (searchQuery) => set((state) => ({ filters: { ...state.filters, searchQuery } })),
        setFilterPriority: (priority) => set((state) => ({ filters: { ...state.filters, priority } })),
        setFilterCategory: (category) => set((state) => ({ filters: { ...state.filters, category } })),
        setFilterTag: (tag) => set((state) => ({ filters: { ...state.filters, tag } })),
        setFilterStatus: (status) => set((state) => ({ filters: { ...state.filters, status } })),
        setSortBy: (sortBy) => set((state) => ({ filters: { ...state.filters, sortBy } })),
        setSortAsc: (sortAsc) => set((state) => ({ filters: { ...state.filters, sortAsc } })),
        setPinFilter: (pinFilter) => set((state) => ({ filters: { ...state.filters, pinFilter } })),

        // UI actions
        setView: (view) => set((state) => ({ ui: { ...state.ui, view } })),
        setTasksView: (tasksView) => set((state) => ({ ui: { ...state.ui, tasksView } })),
        setCalendarView: (calendarView) => set((state) => ({ ui: { ...state.ui, calendarView } })),
        setSectionFilter: (sectionFilter) => set((state) => ({ ui: { ...state.ui, sectionFilter } })),
        setShowArchived: (showArchived) => set((state) => ({ ui: { ...state.ui, showArchived } })),
        setShowQuickAdd: (showQuickAdd) => set((state) => ({ ui: { ...state.ui, showQuickAdd } })),
        toggleFocusMode: () => set((state) => ({ ui: { ...state.ui, focusMode: !state.ui.focusMode } })),
        setTaskDialogOpen: (taskDialogOpen) => set((state) => ({ ui: { ...state.ui, taskDialogOpen } })),
        setEditingTaskId: (editingTaskId) => set((state) => ({ ui: { ...state.ui, editingTaskId } })),
        setConfirmDeleteId: (confirmDeleteId) => set((state) => ({ ui: { ...state.ui, confirmDeleteId } })),
        toggleExpandedSubtask: (id) => set((state) => {
          const subs = state.ui.expandedSubtasks
          return {
            ui: {
              ...state.ui,
              expandedSubtasks: subs.includes(id) ? subs.filter((s) => s !== id) : [...subs, id],
            },
          }
        }),

        // Calendar actions
        setCalendarMonth: (month) => set((state) => ({ calendar: { ...state.calendar, month } })),
        setCalendarYear: (year) => set((state) => ({ calendar: { ...state.calendar, year } })),
        setSelectedDate: (selectedDate) => set((state) => ({ calendar: { ...state.calendar, selectedDate } })),
        setDraggedTask: (draggedTask) => set((state) => ({ calendar: { ...state.calendar, draggedTask } })),
        prevMonth: () => set((state) => {
          const { month, year } = state.calendar
          if (month === 0) return { calendar: { ...state.calendar, month: 11, year: year - 1 } }
          return { calendar: { ...state.calendar, month: month - 1 } }
        }),
        nextMonth: () => set((state) => {
          const { month, year } = state.calendar
          if (month === 11) return { calendar: { ...state.calendar, month: 0, year: year + 1 } }
          return { calendar: { ...state.calendar, month: month + 1 } }
        }),

        // Quick add actions
        setQuickAddText: (text) => set((state) => ({ quickAdd: { ...state.quickAdd, text } })),
        setQuickAddPriority: (priority) => set((state) => ({ quickAdd: { ...state.quickAdd, priority } })),

        // Notification actions
        addNotification: (item) => set((state) => ({
          notificationQueue: [
            {
              ...item,
              id: createNotificationId(),
              timestamp: Date.now(),
              read: false,
            },
            ...state.notificationQueue,
          ].slice(0, 50),
        })),
        dismissNotification: (id) => set((state) => ({
          notificationQueue: state.notificationQueue.map((n) => n.id === id ? { ...n, read: true } : n),
        })),
        clearNotifications: () => set({ notificationQueue: [] }),
        markAllNotificationsRead: () => set((state) => ({
          notificationQueue: state.notificationQueue.map((n) => ({ ...n, read: true })),
        })),

        // Task CRUD
        addTask: (data) => {
          const newTask: Todo = {
            id: crypto.randomUUID(),
            title: data.title || "",
            description: data.description || "",
            category: data.category || "personal",
            priority: data.priority || "medium",
            dueDate: data.dueDate || null,
            dueTime: data.dueTime || null,
            reminderOffset: data.reminderOffset || null,
            reminderSent: false,
            recurring: data.recurring || null,
            tags: data.tags || [],
            done: false,
            pinned: false,
            archived: false,
            createdAt: new Date().toISOString(),
            completedAt: null,
            subtasks: [],
            order: Date.now(),
          }
          set((state) => {
            let updatedCategories = state.customCategories
            if (data.category && !["work", "school", "personal", "business", "church"].includes(data.category)
              && !state.customCategories.includes(data.category)) {
              updatedCategories = [...state.customCategories, data.category]
            }
            return { todos: [...state.todos, newTask], customCategories: updatedCategories }
          })
          // Request notification permission if needed
          if (data.reminderOffset !== null && typeof Notification !== "undefined" && Notification.permission === "default") {
            Notification.requestPermission()
          }
          return newTask
        },

        updateTask: (id, updates) => set((state) => ({
          todos: state.todos.map((t) => t.id === id ? { ...t, ...updates } : t),
        })),

        deleteTask: (id) => set((state) => ({
          todos: state.todos.filter((t) => t.id !== id),
        })),

        toggleDone: (id) => set((state) => {
          const now = new Date().toISOString()
          const today = todayStr()
          return {
            todos: state.todos.map((t) => {
              if (t.id !== id) return t
              const nowDone = !t.done
              const updatedSubtasks = nowDone ? t.subtasks.map((s) => ({ ...s, done: true })) : t.subtasks
              let updated = { ...t, done: nowDone, completedAt: nowDone ? now : null, subtasks: updatedSubtasks }

              if (nowDone && t.recurring && t.dueDate) {
                const next = generateNextOccurrence(t)
                if (next) {
                  const nextTask: Todo = {
                    ...t,
                    ...next,
                    id: crypto.randomUUID(),
                    done: false,
                    completedAt: null,
                    reminderSent: false,
                    createdAt: now,
                    order: Date.now(),
                    pinned: false,
                  }
                  set((s) => ({ todos: [...s.todos, nextTask] }))
                }
              }

              return updated
            }),
            analytics: (() => {
              const prev = get().analytics
              const completedToday = state.todos.filter(
                (t) => t.done && t.completedAt?.startsWith(today)
              ).length + (!state.todos.find((t) => t.id === id)?.done ? 1 : 0)
              const newLog = { ...prev.dailyLog, [today]: completedToday }
              const dates = Object.keys(newLog).sort().reverse()
              let streak = 0
              for (const d of dates) {
                if ((newLog[d] || 0) > 0) streak++
                else break
              }
              return {
                ...prev,
                dailyLog: newLog,
                currentStreak: streak,
                longestStreak: Math.max(prev.longestStreak, streak),
                lastActiveDate: today,
              }
            })(),
          }
        }),

        duplicateTask: (id) => set((state) => {
          const source = state.todos.find((t) => t.id === id)
          if (!source) return state
          const copy: Todo = {
            ...source,
            id: crypto.randomUUID(),
            title: source.title + " (copy)",
            done: false,
            completedAt: null,
            reminderSent: false,
            createdAt: new Date().toISOString(),
            order: Date.now(),
            pinned: false,
          }
          return { todos: [...state.todos, copy] }
        }),

        togglePin: (id) => set((state) => ({
          todos: state.todos.map((t) => t.id === id ? { ...t, pinned: !t.pinned } : t),
        })),

        archiveTask: (id) => set((state) => ({
          todos: state.todos.map((t) => t.id === id ? { ...t, archived: !t.archived } : t),
        })),

        moveTaskOrder: (fromIndex, toIndex) => set((state) => {
          const items = [...state.todos]
          const [moved] = items.splice(fromIndex, 1)
          items.splice(toIndex, 0, moved)
          return { todos: items.map((t, i) => ({ ...t, order: i })) }
        }),

        // Subtask actions
        addSubtask: (taskId) => set((state) => ({
          todos: state.todos.map((t) => {
            if (t.id !== taskId) return t
            const newSub: Subtask = { id: crypto.randomUUID(), title: "", done: false }
            return { ...t, subtasks: [...t.subtasks, newSub] }
          }),
          ui: {
            ...state.ui,
            expandedSubtasks: state.ui.expandedSubtasks.includes(taskId)
              ? state.ui.expandedSubtasks
              : [...state.ui.expandedSubtasks, taskId],
          },
        })),

        toggleSubtask: (taskId, subId) => set((state) => ({
          todos: state.todos.map((t) => {
            if (t.id !== taskId) return t
            const subs = t.subtasks.map((s) => s.id === subId ? { ...s, done: !s.done } : s)
            const allDone = subs.length > 0 && subs.every((s) => s.done)
            return { ...t, subtasks: subs, done: allDone ? true : t.done }
          }),
        })),

        updateSubtaskTitle: (taskId, subId, title) => set((state) => ({
          todos: state.todos.map((t) => {
            if (t.id !== taskId) return t
            return { ...t, subtasks: t.subtasks.map((s) => s.id === subId ? { ...s, title } : s) }
          }),
        })),

        deleteSubtask: (taskId, subId) => set((state) => ({
          todos: state.todos.map((t) => {
            if (t.id !== taskId) return t
            return { ...t, subtasks: t.subtasks.filter((s) => s.id !== subId) }
          }),
        })),
      }
    },
    {
      name: STORAGE_KEY,
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          const state = persistedState as Partial<TodoStore>
          return {
            ...state,
            filters: state.filters || getDefaultFilters(),
            ui: state.ui || getDefaultUI(),
            calendar: state.calendar || getDefaultCalendar(),
            quickAdd: state.quickAdd || getDefaultQuickAdd(),
            notificationQueue: state.notificationQueue || [],
            analytics: state.analytics || getDefaultAnalytics(),
            customCategories: state.customCategories || [],
            backupTimestamp: state.backupTimestamp || null,
          }
        }
        return persistedState as TodoStore
      },
    }
  )
)

// Selectors for derived data
export function selectFilteredTodos(state: Pick<TodoStore, "todos" | "filters" | "ui">): Todo[] {
  const { todos, filters, ui } = state
  let items = ui.showArchived ? [...todos] : todos.filter((t) => !t.archived)

  // Section filter
  switch (ui.sectionFilter) {
    case "today":
      items = items.filter((t) => !t.done && t.dueDate === todayStr())
      break
    case "upcoming":
      items = items.filter((t) => !t.done && t.dueDate !== null && t.dueDate > todayStr())
      break
    case "overdue":
      items = items.filter((t) => !t.done && t.dueDate !== null && t.dueDate < todayStr())
      break
    case "completed":
      items = items.filter((t) => t.done)
      break
    case "archived":
      items = items.filter((t) => t.archived)
      break
    default:
      items = items.filter((t) => !t.archived)
      break
  }

  // Search
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase()
    items = items.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q))
    )
  }

  // Priority filter
  if (filters.priority !== "all") items = items.filter((t) => t.priority === filters.priority)
  // Category filter
  if (filters.category !== "all") items = items.filter((t) => t.category === filters.category)
  // Tag filter
  if (filters.tag !== "all") items = items.filter((t) => t.tags.includes(filters.tag))
  // Status filter
  if (filters.status === "active") items = items.filter((t) => !t.done)
  else if (filters.status === "completed") items = items.filter((t) => t.done)

  // Pin filter
  if (filters.pinFilter) items = items.filter((t) => t.pinned)

  // Sort
  const order = { critical: 0, high: 1, medium: 2, low: 3 }
  items.sort((a, b) => {
    let cmp = 0
    if (filters.sortBy === "priority") cmp = order[a.priority] - order[b.priority]
    else if (filters.sortBy === "date") cmp = (a.dueDate || "9999-99-99").localeCompare(b.dueDate || "9999-99-99")
    else if (filters.sortBy === "title") cmp = a.title.localeCompare(b.title)
    else cmp = a.order - b.order
    return filters.sortAsc ? cmp : -cmp
  })

  // Pinned first
  items.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return 0
  })

  return items
}

export function selectStats(state: TodoStore) {
  const all = state.todos.filter((t) => !t.archived)
  const total = all.length
  const completed = all.filter((t) => t.done).length
  const dueToday = all.filter((t) => !t.done && t.dueDate === todayStr()).length
  const overdue = all.filter((t) => !t.done && t.dueDate !== null && t.dueDate < todayStr()).length
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0
  const thisMonth = todayStr().slice(0, 7)
  const completedThisMonth = all.filter((t) => t.completedAt?.startsWith(thisMonth)).length
  return { total, completed, dueToday, overdue, rate, completedThisMonth, active: total - completed }
}

export function selectPinnedTodos(state: { todos: Todo[] }): Todo[] {
  return state.todos.filter((t) => t.pinned && !t.done && !t.archived)
}

export function selectCalendarTasks(state: { todos: Todo[] }): Map<string, Todo[]> {
  const map = new Map<string, Todo[]>()
  state.todos.filter((t) => t.dueDate && !t.archived).forEach((t) => {
    const dateStr = t.dueDate!
    const existing = map.get(dateStr) || []
    existing.push(t)
    map.set(dateStr, existing)
  })
  return map
}

export function selectUnreadNotifications(state: { notificationQueue: NotificationItem[] }): number {
  return state.notificationQueue.filter((n) => !n.read).length
}

export function selectAllTags(state: { todos: Todo[] }): string[] {
  const set = new Set<string>()
  state.todos.forEach((t) => t.tags.forEach((tag) => set.add(tag)))
  return Array.from(set)
}

export function selectAllCategories(state: { todos: Todo[]; customCategories: string[] }): string[] {
  return [...new Set([...state.todos.map((t) => t.category), ...state.customCategories])].filter(Boolean)
}

export interface Subtask {
  id: string
  title: string
  done: boolean
}

export type RecurringType = "daily" | "weekly" | "monthly" | "weekdays" | "custom"

export interface RecurringConfig {
  type: RecurringType
  interval?: number
}

export type Priority = "critical" | "high" | "medium" | "low"

export type ViewMode = "tasks" | "dashboard" | "calendar" | "planner"

export type TasksView = "list" | "board"

export type CalendarViewMode = "month" | "week"

export type SectionFilter = "all" | "today" | "upcoming" | "overdue" | "completed" | "archived"

export interface Todo {
  id: string
  title: string
  description: string
  category: string
  priority: Priority
  dueDate: string | null
  dueTime: string | null
  reminderOffset: number | null
  reminderSent: boolean
  recurring: RecurringConfig | null
  tags: string[]
  done: boolean
  pinned: boolean
  archived: boolean
  createdAt: string
  completedAt: string | null
  subtasks: Subtask[]
  order: number
}

export interface AnalyticsData {
  dailyLog: Record<string, number>
  longestStreak: number
  currentStreak: number
  lastActiveDate: string | null
}

export interface NotificationItem {
  id: string
  taskId: string
  title: string
  message: string
  timestamp: number
  read: boolean
}

export interface FilterState {
  searchQuery: string
  priority: Priority | "all"
  category: string
  tag: string
  status: "all" | "active" | "completed"
  sortBy: "priority" | "date" | "title" | "created"
  sortAsc: boolean
  pinFilter: boolean
}

export interface UIState {
  view: ViewMode
  tasksView: TasksView
  calendarView: CalendarViewMode
  sectionFilter: SectionFilter
  showArchived: boolean
  showQuickAdd: boolean
  focusMode: boolean
  taskDialogOpen: boolean
  editingTaskId: string | null
  confirmDeleteId: string | null
  expandedSubtasks: string[]
}

export interface CalendarState {
  month: number
  year: number
  selectedDate: string
  draggedTask: string | null
}

export interface QuickAddState {
  text: string
  priority: Priority
}

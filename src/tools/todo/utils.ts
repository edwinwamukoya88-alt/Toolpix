import type { Todo, Priority, RecurringConfig } from "./types"

export const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-300 dark:border-red-800" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border-orange-300 dark:border-orange-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800" },
  { value: "low", label: "Low", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-green-300 dark:border-green-800" },
]

export const PRIORITY_ORDER: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 }

export const DEFAULT_CATEGORIES = [
  { value: "work", label: "Work" },
  { value: "school", label: "School" },
  { value: "personal", label: "Personal" },
  { value: "business", label: "Business" },
  { value: "church", label: "Church" },
]

export const CATEGORY_COLORS: Record<string, string> = {
  work: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  school: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  personal: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  business: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  church: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
}

export const REMINDER_OPTIONS = [
  { value: 5, label: "5 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
  { value: 1440, label: "1 day before" },
] as const

export const RECURRING_OPTIONS = [
  { value: "daily" as const, label: "Daily" },
  { value: "weekdays" as const, label: "Weekdays" },
  { value: "weekly" as const, label: "Weekly" },
  { value: "monthly" as const, label: "Monthly" },
  { value: "custom" as const, label: "Custom interval" },
]

export const COMMON_TAGS = ["important", "meeting", "revision", "project", "urgent", "idea", "follow-up", "research"]

export const PRIORITY_ICONS: Record<Priority, string> = {
  critical: "🔴",
  high: "🟠",
  medium: "🟡",
  low: "🟢",
}

export function todayStr(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function isOverdue(todo: Todo): boolean {
  if (!todo.dueDate || todo.done || todo.archived) return false
  return todo.dueDate < todayStr()
}

export function isDueToday(todo: Todo): boolean {
  if (!todo.dueDate || todo.done || todo.archived) return false
  return todo.dueDate === todayStr()
}

export function isUpcoming(todo: Todo): boolean {
  if (!todo.dueDate || todo.done || todo.archived) return false
  return todo.dueDate > todayStr()
}

export function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  const today = new Date(todayStr() + "T00:00:00")
  const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return "Today"
  if (diff === 1) return "Tomorrow"
  if (diff === -1) return "Yesterday"
  if (diff > 0 && diff <= 7) return d.toLocaleDateString("en-US", { weekday: "long" })
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined })
}

export function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return ""
  const [h, m] = timeStr.split(":").map(Number)
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function dateToStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function getWeekDates(date: Date = new Date()): Date[] {
  const start = new Date(date)
  start.setDate(start.getDate() - start.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d
  })
}

export function generateNextOccurrence(todo: Todo): Partial<Todo> | null {
  if (!todo.recurring || !todo.dueDate) return null
  const currentDate = new Date(todo.dueDate + "T00:00:00")
  let newDate: Date | null = null

  switch (todo.recurring.type) {
    case "daily":
      newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() + (todo.recurring.interval || 1))
      break
    case "weekdays":
      newDate = new Date(currentDate)
      do {
        newDate.setDate(newDate.getDate() + 1)
      } while (newDate.getDay() === 0 || newDate.getDay() === 6)
      break
    case "weekly":
      newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() + 7 * (todo.recurring.interval || 1))
      break
    case "monthly":
      newDate = new Date(currentDate)
      newDate.setMonth(newDate.getMonth() + (todo.recurring.interval || 1))
      break
    case "custom":
      if (todo.recurring.interval) {
        newDate = new Date(currentDate)
        newDate.setDate(newDate.getDate() + todo.recurring.interval)
      }
      break
  }

  if (!newDate) return null
  const y = newDate.getFullYear()
  const m = String(newDate.getMonth() + 1).padStart(2, "0")
  const d = String(newDate.getDate()).padStart(2, "0")
  return { dueDate: `${y}-${m}-${d}` }
}

export function migrateLegacyTodo(item: Record<string, unknown>): Todo | null {
  if (item.id && typeof item.title === "string") return item as unknown as Todo
  if (item.id && item.text && typeof item.text === "string") {
    const priority = (item.priority as string)?.toLowerCase()
    return {
      id: item.id as string,
      title: item.text as string,
      description: "",
      category: "personal",
      priority: (["critical", "high", "medium", "low"].includes(priority) ? priority : "medium") as Priority,
      dueDate: null,
      dueTime: null,
      reminderOffset: null,
      reminderSent: false,
      recurring: null,
      tags: [],
      done: (item.done as boolean) || false,
      pinned: false,
      archived: false,
      createdAt: (item.createdAt as string) || new Date().toISOString(),
      completedAt: null,
      subtasks: [],
      order: (item.order as number) || Date.now(),
    }
  }
  return null
}

export function getTimeSlot(dateStr: string, timeStr: string | null): "morning" | "afternoon" | "evening" {
  if (!timeStr) {
    if (!dateStr) return "morning"
    return "morning"
  }
  const h = parseInt(timeStr.split(":")[0], 10)
  if (h < 12) return "morning"
  if (h < 17) return "afternoon"
  return "evening"
}

export function timeSlotLabel(slot: "morning" | "afternoon" | "evening"): string {
  switch (slot) {
    case "morning": return "🌅 Morning"
    case "afternoon": return "☀️ Afternoon"
    case "evening": return "🌙 Evening"
  }
}

export function createNotificationId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 11)
}

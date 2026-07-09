"use client"

import { useEffect, useRef, useCallback } from "react"
import { Bell } from "lucide-react"
import { useTodoStore } from "./store"
import { formatDateDisplay, formatTimeDisplay, REMINDER_OPTIONS } from "./utils"
import { toast } from "sonner"

export default function ReminderSystem() {
  const todos = useTodoStore((s) => s.todos)
  const updateTask = useTodoStore((s) => s.updateTask)
  const addNotification = useTodoStore((s) => s.addNotification)

  const notifyTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const snoozeReminder = useCallback((id: string, minutes: number) => {
    const todo = todos.find((t) => t.id === id)
    if (!todo) return
    updateTask(id, { reminderSent: false, reminderOffset: (todo.reminderOffset || 0) + minutes })
    toast.success(`Snoozed for ${minutes} minutes`)
  }, [todos, updateTask])

  useEffect(() => {
    function check() {
      const now = new Date()
      todos
        .filter((t) => !t.done && !t.archived && t.dueDate && t.reminderOffset !== null && !t.reminderSent)
        .forEach((todo) => {
          const dueDateTime = new Date(todo.dueDate + "T" + (todo.dueTime || "23:59") + ":00")
          const reminderTime = new Date(dueDateTime.getTime() - todo.reminderOffset! * 60 * 1000)

          if (now >= reminderTime && now < dueDateTime) {
            // In-app notification (always works)
            const reminderLabel = REMINDER_OPTIONS.find((r) => r.value === todo.reminderOffset)?.label || ""
            addNotification({
              taskId: todo.id,
              title: "Task Reminder",
              message: `"${todo.title}" is due ${formatDateDisplay(todo.dueDate!)}${todo.dueTime ? " at " + formatTimeDisplay(todo.dueTime) : ""}`,
            })
            toast(`${todo.title} — due ${formatDateDisplay(todo.dueDate!)}${todo.dueTime ? " at " + formatTimeDisplay(todo.dueTime) : ""}`, {
              icon: <Bell className="size-4" />,
              duration: 10000,
              action: {
                label: "Snooze 5m",
                onClick: () => snoozeReminder(todo.id, 5),
              },
            })

            // Browser notification (fallback-safe)
            if (typeof Notification !== "undefined" && Notification.permission === "granted") {
              try {
                const n = new Notification("Task Reminder", {
                  body: `"${todo.title}" is due soon!`,
                  icon: "/logo-icon.svg",
                })
                setTimeout(() => n.close(), 10000)
              } catch {
                // Silently fail - in-app toast already fired
              }
            }

            // Mark as reminded
            updateTask(todo.id, { reminderSent: true })
          }
        })
    }

    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [todos, updateTask, addNotification, snoozeReminder])

  return null
}

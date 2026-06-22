"use client"

import { useState, useEffect, memo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useTodoStore } from "./store"
import {
  PRIORITIES,
  DEFAULT_CATEGORIES,
  REMINDER_OPTIONS,
  RECURRING_OPTIONS,
  COMMON_TAGS,
} from "./utils"
import type { Priority, RecurringType, Todo } from "./types"
import { toast } from "sonner"

const TaskForm = memo(function TaskForm() {
  const taskDialogOpen = useTodoStore((s) => s.ui.taskDialogOpen)
  const setTaskDialogOpen = useTodoStore((s) => s.setTaskDialogOpen)
  const editingTaskId = useTodoStore((s) => s.ui.editingTaskId)
  const setEditingTaskId = useTodoStore((s) => s.setEditingTaskId)
  const todos = useTodoStore((s) => s.todos)
  const addTask = useTodoStore((s) => s.addTask)
  const updateTask = useTodoStore((s) => s.updateTask)
  const customCategories = useTodoStore((s) => s.customCategories)
  const addNotification = useTodoStore((s) => s.addNotification)

  const task = editingTaskId ? todos.find((t) => t.id === editingTaskId) : null
  const isEditing = !!task

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [category, setCategory] = useState("personal")
  const [dueDate, setDueDate] = useState("")
  const [dueTime, setDueTime] = useState("")
  const [reminderOffset, setReminderOffset] = useState<number | null>(null)
  const [recurringType, setRecurringType] = useState<RecurringType | "none">("none")
  const [recurringInterval, setRecurringInterval] = useState(1)
  const [tagsInput, setTagsInput] = useState("")
  const [customCategory, setCustomCategory] = useState("")

  useEffect(() => {
    if (!taskDialogOpen) return
    if (task) {
      setTitle(task.title || "")
      setDescription(task.description || "")
      setPriority(task.priority || "medium")
      setCategory(task.category || "personal")
      setDueDate(task.dueDate || "")
      setDueTime(task.dueTime || "")
      setReminderOffset(task.reminderOffset || null)
      if (task.recurring) {
        setRecurringType(task.recurring.type)
        setRecurringInterval(task.recurring.interval || 1)
      } else {
        setRecurringType("none")
        setRecurringInterval(1)
      }
      setTagsInput(task.tags?.join(", ") || "")
    } else {
      setTitle("")
      setDescription("")
      setPriority("medium")
      setCategory("personal")
      setDueDate("")
      setDueTime("")
      setReminderOffset(null)
      setRecurringType("none")
      setRecurringInterval(1)
      setTagsInput("")
    }
    setCustomCategory("")
  }, [taskDialogOpen, task])

  const allCategories = [...DEFAULT_CATEGORIES.map((c) => c.value), ...customCategories]

  function handleSave() {
    if (!title.trim()) {
      toast.error("Task title is required")
      return
    }
    const effectiveCategory = customCategory || category
    const tags = tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)

    const data = {
      title: title.trim(),
      description,
      priority,
      category: effectiveCategory,
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      reminderOffset,
      recurring: recurringType !== "none" ? { type: recurringType as RecurringType, interval: recurringInterval } : null,
      tags,
    }

    if (isEditing && task) {
      updateTask(task.id, data)
      toast.success("Task updated")
    } else {
      const newTask = addTask(data)
      if (data.reminderOffset !== null) {
        addNotification({
          taskId: newTask.id,
          title: "Reminder set",
          message: `"${newTask.title}" will remind you ${REMINDER_OPTIONS.find((r) => r.value === data.reminderOffset)?.label || "before"}`,
        })
      }
      toast.success("Task created")
    }
    setTaskDialogOpen(false)
    setEditingTaskId(null)
  }

  return (
    <Dialog open={taskDialogOpen} onOpenChange={(v) => { setTaskDialogOpen(v); if (!v) setEditingTaskId(null) }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create Task"}</DialogTitle>
          <DialogDescription>Fill in the details for your task.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <label className="block text-xs font-medium mb-1">Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" autoFocus />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className="flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              placeholder="Add details..." rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50">
                {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50">
                {DEFAULT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                {customCategories.filter((c) => !DEFAULT_CATEGORIES.find((dc) => dc.value === c)).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Custom Category (optional)</label>
            <Input value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="Type a new category name..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Due Date</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Due Time</label>
              <Input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Reminder</label>
            <select value={reminderOffset ?? ""} onChange={(e) => setReminderOffset(e.target.value ? Number(e.target.value) : null)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
              <option value="">No reminder</option>
              {REMINDER_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Recurring</label>
              <select value={recurringType} onChange={(e) => setRecurringType(e.target.value as RecurringType | "none")}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="none">No repeat</option>
                {RECURRING_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            {recurringType === "custom" && (
              <div>
                <label className="block text-xs font-medium mb-1">Every N days</label>
                <Input type="number" min={1} value={recurringInterval} onChange={(e) => setRecurringInterval(Math.max(1, Number(e.target.value)))} />
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Tags</label>
            <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="tag1, tag2, tag3" />
            <div className="flex flex-wrap gap-1 mt-1">
              {COMMON_TAGS.filter((t) => !tagsInput.includes(t)).slice(0, 6).map((t) => (
                <button key={t} type="button" onClick={() => setTagsInput((prev) => (prev ? `${prev}, ${t}` : t))}
                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground">+{t}</button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter showCloseButton>
          <Button onClick={handleSave}>{isEditing ? "Save Changes" : "Create Task"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

export default TaskForm

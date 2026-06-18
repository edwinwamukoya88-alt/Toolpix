"use client"

import { useState } from "react"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface Task {
  id: string
  text: string
}

interface Column {
  id: string
  title: string
  tasks: Task[]
}

export default function KanbanBoard() {
  const [columns, setColumns] = useLocalStorage<Column[]>("toolpix_kanban", [
    { id: "todo", title: "To Do", tasks: [] },
    { id: "doing", title: "In Progress", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
  ])
  const [newTask, setNewTask] = useState("")

  function addTask() {
    if (!newTask.trim()) return
    setColumns((prev) => prev.map((col, i) =>
      i === 0 ? { ...col, tasks: [...col.tasks, { id: crypto.randomUUID(), text: newTask }] } : col
    ))
    setNewTask("")
  }

  function moveTask(taskId: string, fromCol: string, toCol: string) {
    setColumns((prev) => {
      let task: Task | undefined
      const next = prev.map((col) => {
        if (col.id === fromCol) {
          const found = col.tasks.find((t) => t.id === taskId)
          task = found
          return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
        }
        return col
      })
      if (task) {
        return next.map((col) =>
          col.id === toCol ? { ...col, tasks: [...col.tasks, task!] } : col
        )
      }
      return next
    })
  }

  function removeTask(colId: string, taskId: string) {
    setColumns((prev) => prev.map((col) =>
      col.id === colId ? { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) } : col
    ))
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 max-w-sm">
        <Input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="New task..." onKeyDown={(e) => e.key === "Enter" && addTask()} />
        <Button onClick={addTask}><Plus className="h-4 w-4" /></Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => (
          <div key={col.id} className="rounded-xl border bg-card/50 p-4 space-y-2">
            <h3 className="font-semibold text-sm mb-3">{col.title} <span className="text-muted-foreground font-normal">({col.tasks.length})</span></h3>
            {col.tasks.map((task) => (
              <Card key={task.id} className="cursor-grab active:cursor-grabbing">
                <CardContent className="p-3 flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 text-sm">{task.text}</span>
                  <div className="flex gap-1">
                    {col.id !== "todo" && <Button variant="ghost" size="icon" className="h-6 w-6 text-xs" onClick={() => moveTask(task.id, col.id, columns[columns.indexOf(col) - 1]?.id || col.id)}>←</Button>}
                    {col.id !== "done" && <Button variant="ghost" size="icon" className="h-6 w-6 text-xs" onClick={() => moveTask(task.id, col.id, columns[columns.indexOf(col) + 1]?.id || col.id)}>→</Button>}
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeTask(col.id, task.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

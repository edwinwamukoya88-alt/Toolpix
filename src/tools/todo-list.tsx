"use client"

import { useState } from "react"
import { Plus, Check, Trash2, ListTodo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface Todo {
  id: string
  text: string
  priority: "Low" | "Medium" | "High"
  done: boolean
}

const priorities = ["Low", "Medium", "High"] as const
const priorityColors = { Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" }

export default function TodoList() {
  const [todos, setTodos] = useLocalStorage<Todo[]>("toolpix_todos", [])
  const [text, setText] = useState("")
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium")
  const [filter, setFilter] = useState<"All" | "Active" | "Completed">("All")

  const filtered = todos.filter((t) => {
    if (filter === "Active") return !t.done
    if (filter === "Completed") return t.done
    return true
  })

  function add() {
    if (!text.trim()) return
    setTodos((prev) => [...prev, { id: crypto.randomUUID(), text, priority, done: false }])
    setText("")
  }

  function toggle(id: string) {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t))
  }

  function remove(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a task..." onKeyDown={(e) => e.key === "Enter" && add()} />
          <select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)} className="h-9 rounded-md border bg-background px-3 text-sm w-24">
            {priorities.map((p) => <option key={p}>{p}</option>)}
          </select>
          <Button onClick={add}><Plus className="h-4 w-4" /></Button>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {(["All", "Active", "Completed"] as const).map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>{f}</Button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <ListTodo className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No tasks</p>
          </div>
        )}
        {filtered.map((todo) => (
          <Card key={todo.id} className={`${todo.done ? "opacity-60" : ""}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <button
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${todo.done ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"}`}
                onClick={() => toggle(todo.id)}
              >
                {todo.done && <Check className="h-3 w-3" />}
              </button>
              <span className={`flex-1 text-sm ${todo.done ? "line-through text-muted-foreground" : ""}`}>{todo.text}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[todo.priority]}`}>{todo.priority}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(todo.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

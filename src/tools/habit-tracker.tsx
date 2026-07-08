"use client"

import { useState } from "react"
import { Plus, Check, Trash2, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface Habit {
  id: string
  name: string
  streak: number
  lastDate: string
}

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

export default function HabitTracker() {
  const [habits, setHabits] = useLocalStorage<Habit[]>("zilita_habits", [])
  const [name, setName] = useState("")

  function add() {
    if (!name.trim()) return
    setHabits((prev) => [...prev, { id: crypto.randomUUID(), name, streak: 0, lastDate: "" }])
    setName("")
  }

  function checkIn(id: string) {
    const today = getToday()
    setHabits((prev) => prev.map((h) => {
      if (h.id !== id) return h
      if (h.lastDate === today) return h
      const isConsecutive = h.lastDate === new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      return { ...h, streak: isConsecutive || h.streak === 0 ? h.streak + 1 : 1, lastDate: today }
    }))
  }

  function remove(id: string) {
    setHabits((prev) => prev.filter((h) => h.id !== id))
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New habit..." onKeyDown={(e) => e.key === "Enter" && add()} />
        <Button onClick={add}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>

      {habits.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Target className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>No habits tracked yet</p>
        </div>
      )}

      <div className="space-y-2">
        {habits.map((habit) => {
          const checkedToday = habit.lastDate === getToday()
          return (
            <Card key={habit.id}>
              <CardContent className="p-4 flex items-center gap-3">
                <button
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${checkedToday ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/20"}`}
                  onClick={() => checkIn(habit.id)}
                >
                  {checkedToday ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </button>
                <div className="flex-1">
                  <p className="text-sm font-medium">{habit.name}</p>
                  <p className="text-xs text-muted-foreground">🔥 {habit.streak} day streak</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(habit.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

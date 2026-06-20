"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { Clock, Bell, ListChecks, Circle, BarChart3, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLocalStorage } from "@/hooks/use-local-storage"

type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"

type WeekTasks = Record<DayKey, Record<string, string>>

const DAYS: { key: DayKey; label: string }[] = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
]

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const label = String(i).padStart(2, "0") + ":00"
  return { value: i, label }
})

const WEEKDAY_INDEX: DayKey[] = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
]

function getTodayKey(): DayKey {
  return WEEKDAY_INDEX[new Date().getDay()]
}

function defaultWeekData(): WeekTasks {
  return {
    monday: {},
    tuesday: {},
    wednesday: {},
    thursday: {},
    friday: {},
    saturday: {},
    sunday: {},
  }
}

export default function DayPlanner() {
  const [weekData, setWeekData] = useLocalStorage<WeekTasks>("toolpix_weekly_planner", defaultWeekData())
  const [activeDay, setActiveDay] = useState<DayKey>(getTodayKey)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const currentDate = useMemo(() => new Date(now), [now])
  const currentHour = currentDate.getHours()
  const todayKey = WEEKDAY_INDEX[currentDate.getDay()]
  const isToday = activeDay === todayKey

  const getTask = useCallback(
    (hourLabel: string): string => {
      return weekData[activeDay]?.[hourLabel] ?? ""
    },
    [weekData, activeDay],
  )

  const setTask = useCallback(
    (hourLabel: string, task: string) => {
      setWeekData((prev) => {
        const day = { ...(prev[activeDay] || {}) }
        if (task.trim()) {
          day[hourLabel] = task
        } else {
          delete day[hourLabel]
        }
        return { ...prev, [activeDay]: day }
      })
    },
    [setWeekData, activeDay],
  )

  const stats = useMemo(() => {
    const dayTasks = weekData[activeDay] || {}
    const total = 24
    const filled = Object.keys(dayTasks).filter((k) => dayTasks[k].trim()).length
    const empty = total - filled
    const productivity = total > 0 ? Math.round((filled / total) * 100) : 0
    return { total, filled, empty, productivity }
  }, [weekData, activeDay])

  const dueReminder = useMemo(() => {
    if (!isToday) return null
    const hourLabel = String(currentHour).padStart(2, "0") + ":00"
    const task = weekData[todayKey]?.[hourLabel]
    return task?.trim() ? { hour: hourLabel, task: task.trim() } : null
  }, [weekData, todayKey, currentHour, isToday])

  const productivityColor =
    stats.productivity >= 50
      ? "text-green-600 dark:text-green-400"
      : stats.productivity >= 25
        ? "text-amber-600 dark:text-amber-400"
        : "text-muted-foreground"

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Day Planner</h2>
        <p className="text-sm text-muted-foreground">Plan your week hour by hour</p>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {DAYS.map((day) => {
          const isActive = day.key === activeDay
          const isToday = day.key === todayKey
          return (
            <Button
              key={day.key}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={`flex-1 min-w-[3.5rem] text-xs font-medium transition-all ${
                isToday && !isActive ? "ring-1 ring-primary/30" : ""
              }`}
              onClick={() => setActiveDay(day.key)}
            >
              {day.label}
              {isToday && <span className="ml-1 text-[10px] opacity-70">●</span>}
            </Button>
          )
        })}
      </div>

      {dueReminder && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-200 animate-in slide-in-from-top-1 duration-200">
          <Bell className="h-4 w-4 shrink-0" />
          <span>
            <strong>Now:</strong> {dueReminder.hour} &mdash; {dueReminder.task}
          </span>
        </div>
      )}

      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <ListChecks className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Tasks</span>
                <span className="font-semibold">{stats.filled}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Circle className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Free</span>
                <span className="font-semibold">{stats.empty}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Productivity</span>
                <span className={`font-semibold ${productivityColor}`}>{stats.productivity}%</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{activeDay.charAt(0).toUpperCase() + activeDay.slice(1)}</span>
            </div>
          </div>
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${stats.productivity}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-px">
        {HOURS.map((hour) => {
          const task = getTask(hour.label)
          const isCurrent = isToday && hour.value === currentHour

          return (
            <Card
              key={hour.label}
              className={`rounded-none first:rounded-t-lg last:rounded-b-lg border-b-0 last:border-b shadow-sm transition-all duration-200 ${
                isCurrent
                  ? "border-l-4 border-l-primary ring-1 ring-primary/20 bg-primary/[0.03]"
                  : "border-l-4 border-l-transparent"
              }`}
            >
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  <div
                    className={`flex items-center justify-center w-16 shrink-0 border-r text-sm font-semibold tabular-nums transition-colors ${
                      isCurrent ? "text-primary bg-primary/5" : "text-muted-foreground"
                    }`}
                  >
                    {isCurrent && <Clock className="h-3 w-3 mr-1.5 inline" />}
                    {hour.label}
                  </div>
                  <Input
                    value={task}
                    onChange={(e) => setTask(hour.label, e.target.value)}
                    placeholder="What are you doing?"
                    className="flex-1 border-0 rounded-none h-11 text-sm bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4"
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

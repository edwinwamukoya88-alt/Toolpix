"use client"

import { memo, useMemo } from "react"
import { ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTodoStore, selectCalendarTasks } from "./store"
import { getDaysInMonth, getFirstDayOfMonth, getWeekDates, dateToStr, formatDateDisplay, isOverdue, todayStr } from "./utils"
import TaskCard from "./TaskCard"

const CalendarDay = memo(function CalendarDay({
  dateStr, dayNum, isToday, isSelected, tasks, onSelect, onDrop,
}: {
  dateStr: string; dayNum: string; isToday: boolean; isSelected: boolean
  tasks: { id: string; title: string; done: boolean; dueDate: string | null }[]
  onSelect: () => void; onDrop: () => void
}) {
  return (
    <div
      onClick={onSelect}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={cn(
        "min-h-[80px] border-r border-b last:border-r-0 p-1 cursor-pointer transition-colors hover:bg-muted/30",
        isToday && "bg-primary/5",
        isSelected && "ring-2 ring-inset ring-primary",
      )}
    >
      <span className={cn(
        "inline-flex size-5 items-center justify-center rounded-full text-[10px] font-medium",
        isToday && "bg-primary text-primary-foreground size-5",
      )}>
        {dayNum}
      </span>
      <div className="mt-0.5 space-y-0.5">
        {tasks.slice(0, 3).map((t) => (
          <div key={t.id} className={cn(
            "text-[8px] px-1 py-0.5 rounded truncate font-medium",
            t.done ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
            isOverdue(t as Parameters<typeof isOverdue>[0]) ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
            "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
          )}>
            {t.title}
          </div>
        ))}
        {tasks.length > 3 && <span className="text-[8px] text-muted-foreground">+{tasks.length - 3} more</span>}
      </div>
    </div>
  )
})

const TaskCalendar = memo(function TaskCalendar() {
  const calendar = useTodoStore((s) => s.calendar)
  const ui = useTodoStore((s) => s.ui)
  const allTodos = useTodoStore((s) => s.todos)
  const setCalendarView = useTodoStore((s) => s.setCalendarView)
  const setSelectedDate = useTodoStore((s) => s.setSelectedDate)
  const setDraggedTask = useTodoStore((s) => s.setDraggedTask)
  const prevMonth = useTodoStore((s) => s.prevMonth)
  const nextMonth = useTodoStore((s) => s.nextMonth)
  const updateTask = useTodoStore((s) => s.updateTask)

  const calendarTasks = useMemo(() => selectCalendarTasks({ todos: allTodos }), [allTodos])

  const daysInMonth = getDaysInMonth(calendar.year, calendar.month)
  const firstDay = getFirstDayOfMonth(calendar.year, calendar.month)
  const calendarDays = Array.from(
    { length: daysInMonth },
    (_, i) => `${calendar.year}-${String(calendar.month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`
  )

  function handleDropOnDate(dateStr: string) {
    const dragged = calendar.draggedTask
    if (!dragged) return
    updateTask(dragged, { dueDate: dateStr })
    setDraggedTask(null)
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          <button onClick={() => setCalendarView("month")}
            className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all", ui.calendarView === "month" ? "bg-background shadow-sm" : "text-muted-foreground")}>Month</button>
          <button onClick={() => setCalendarView("week")}
            className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all", ui.calendarView === "week" ? "bg-background shadow-sm" : "text-muted-foreground")}>Week</button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-xs" onClick={prevMonth}><ChevronLeft className="size-4" /></Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {new Date(calendar.year, calendar.month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <Button variant="ghost" size="icon-xs" onClick={nextMonth}><ChevronRightIcon className="size-4" /></Button>
        </div>
      </div>

      {ui.calendarView === "month" && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="grid grid-cols-7 border-b bg-muted/50">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="p-2 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] border-r border-b last:border-r-0 p-1 bg-muted/20" />
            ))}
            {calendarDays.map((dateStr) => {
              const dayTasks = calendarTasks.get(dateStr) || []
              const isToday = dateStr === todayStr()
              const isSelected = dateStr === calendar.selectedDate
              const dayNum = dateStr.split("-").pop() || ""
              return (
                <CalendarDay
                  key={dateStr}
                  dateStr={dateStr}
                  dayNum={dayNum}
                  isToday={isToday}
                  isSelected={isSelected}
                  tasks={dayTasks}
                  onSelect={() => setSelectedDate(dateStr)}
                  onDrop={() => handleDropOnDate(dateStr)}
                />
              )
            })}
          </div>
        </div>
      )}

      {ui.calendarView === "week" && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="grid grid-cols-7 border-b bg-muted/50">
            {getWeekDates(new Date(calendar.year, calendar.month, 1)).map((d, i) => (
              <div key={i} className="p-2 text-center">
                <div className="text-[10px] font-medium text-muted-foreground uppercase">
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <span className={cn("inline-flex size-6 items-center justify-center rounded-full text-xs font-medium mt-1",
                  dateToStr(d) === todayStr() && "bg-primary text-primary-foreground")}>
                  {d.getDate()}
                </span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {getWeekDates(new Date(calendar.year, calendar.month, 1)).map((d) => {
              const ds = dateToStr(d)
              const dayTasks = calendarTasks.get(ds) || []
              return (
                <div key={ds} onDragOver={(e) => e.preventDefault()} onDrop={() => handleDropOnDate(ds)}
                  className="min-h-[120px] border-r last:border-r-0 p-1">
                  {dayTasks.map((t) => (
                    <div key={t.id} className={cn(
                      "text-[9px] px-1 py-0.5 rounded truncate mb-0.5 font-medium",
                      t.done ? "bg-green-100 dark:bg-green-900/30 text-green-700" :
                      isOverdue(t) ? "bg-red-100 dark:bg-red-900/30 text-red-700" :
                      "bg-blue-100 dark:bg-blue-900/30 text-blue-700"
                    )}>
                      {t.title}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {calendar.selectedDate && (
        <div className="mt-3">
          <p className="text-xs font-medium mb-2 text-muted-foreground">
            Tasks for {formatDateDisplay(calendar.selectedDate)}
          </p>
          <div className="space-y-2">
            {(calendarTasks.get(calendar.selectedDate) || []).length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No tasks for this date</p>
            ) : (
              (calendarTasks.get(calendar.selectedDate) || []).map((t) => <TaskCard key={t.id} todo={t} compact />)
            )}
          </div>
        </div>
      )}
    </div>
  )
})

export default TaskCalendar

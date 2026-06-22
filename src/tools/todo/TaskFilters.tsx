"use client"

import { memo, useMemo } from "react"
import { Search, X, ArrowUpDown, LayoutGrid, List as ListIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTodoStore, selectAllTags } from "./store"
import { PRIORITIES, DEFAULT_CATEGORIES } from "./utils"
import type { Priority, SectionFilter } from "./types"

interface SectionTab {
  key: SectionFilter
  label: string
  count: number
}

const TaskFilters = memo(function TaskFilters() {
  const filters = useTodoStore((s) => s.filters)
  const ui = useTodoStore((s) => s.ui)
  const todos = useTodoStore((s) => s.todos)
  const customCategories = useTodoStore((s) => s.customCategories)
  const allTags = useMemo(() => selectAllTags({ todos }), [todos])

  const setSearchQuery = useTodoStore((s) => s.setSearchQuery)
  const setFilterPriority = useTodoStore((s) => s.setFilterPriority)
  const setFilterCategory = useTodoStore((s) => s.setFilterCategory)
  const setFilterTag = useTodoStore((s) => s.setFilterTag)
  const setFilterStatus = useTodoStore((s) => s.setFilterStatus)
  const setSortBy = useTodoStore((s) => s.setSortBy)
  const setSortAsc = useTodoStore((s) => s.setSortAsc)
  const setSectionFilter = useTodoStore((s) => s.setSectionFilter)
  const setTasksView = useTodoStore((s) => s.setTasksView)

  const todayStr = new Date().toISOString().slice(0, 10)
  const sectionTabs: SectionTab[] = useMemo(() => [
    { key: "all", label: "All", count: todos.filter((t) => !t.done && !t.archived).length },
    { key: "today", label: "Today", count: todos.filter((t) => !t.done && t.dueDate === todayStr).length },
    { key: "upcoming", label: "Upcoming", count: todos.filter((t) => !t.done && t.dueDate !== null && t.dueDate > todayStr).length },
    { key: "overdue", label: "Overdue", count: todos.filter((t) => !t.done && t.dueDate !== null && t.dueDate < todayStr).length },
    { key: "completed", label: "Completed", count: todos.filter((t) => t.done).length },
  ], [todos, todayStr])

  const allCategories = [...DEFAULT_CATEGORIES.map((c) => c.value), ...customCategories]

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input value={filters.searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..." className="pl-9 pr-8" />
        {filters.searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="size-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select value={filters.priority} onChange={(e) => setFilterPriority(e.target.value as Priority | "all")}
          className="h-7 rounded-md border border-input bg-transparent px-2 text-[11px] outline-none focus-visible:border-ring">
          <option value="all">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>

        <select value={filters.category} onChange={(e) => setFilterCategory(e.target.value)}
          className="h-7 rounded-md border border-input bg-transparent px-2 text-[11px] outline-none focus-visible:border-ring">
          <option value="all">All Categories</option>
          {allCategories.map((c) => (
            <option key={c} value={c}>{DEFAULT_CATEGORIES.find((dc) => dc.value === c)?.label || c}</option>
          ))}
        </select>

        {allTags.length > 0 && (
          <select value={filters.tag} onChange={(e) => setFilterTag(e.target.value)}
            className="h-7 rounded-md border border-input bg-transparent px-2 text-[11px] outline-none focus-visible:border-ring">
            <option value="all">All Tags</option>
            {allTags.map((t) => <option key={t} value={t}>#{t}</option>)}
          </select>
        )}

        <select value={filters.status} onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "completed")}
          className="h-7 rounded-md border border-input bg-transparent px-2 text-[11px] outline-none focus-visible:border-ring">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>

        <select value={filters.sortBy} onChange={(e) => setSortBy(e.target.value as typeof filters.sortBy)}
          className="h-7 rounded-md border border-input bg-transparent px-2 text-[11px] outline-none focus-visible:border-ring">
          <option value="created">Sort: Created</option>
          <option value="priority">Sort: Priority</option>
          <option value="date">Sort: Due Date</option>
          <option value="title">Sort: Title</option>
        </select>

        <Button variant="ghost" size="icon-xs" onClick={() => setSortAsc(!filters.sortAsc)}>
          <ArrowUpDown className={cn("size-3.5", filters.sortAsc && "rotate-180")} />
        </Button>

        <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5 ml-auto">
          <button onClick={() => setTasksView("list")}
            className={cn("p-1 rounded", ui.tasksView === "list" ? "bg-background shadow-sm" : "text-muted-foreground")}>
            <ListIcon className="size-3.5" />
          </button>
          <button onClick={() => setTasksView("board")}
            className={cn("p-1 rounded", ui.tasksView === "board" ? "bg-background shadow-sm" : "text-muted-foreground")}>
            <LayoutGrid className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
        {sectionTabs.map((section) => (
          <button key={section.key} onClick={() => setSectionFilter(section.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all",
              ui.sectionFilter === section.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}>
            {section.label}
            {section.count > 0 && (
              <span className={cn("text-[10px] px-1.5 rounded-full",
                ui.sectionFilter === section.key ? "bg-primary-foreground/20" : "bg-muted-foreground/10")}>
                {section.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
})

export default TaskFilters

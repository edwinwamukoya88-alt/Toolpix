"use client"

import { useState, useMemo, useCallback } from "react"
import { Plus, Trash2, Wallet, TrendingUp, Utensils, Car, Receipt, ShoppingBag, Ellipsis, BarChart3, CalendarDays, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

type Category = "Food" | "Transport" | "Bills" | "Shopping" | "Other"

interface Expense {
  id: string
  title: string
  amount: number
  category: Category
  date: string
}

const CATEGORIES: { key: Category; label: string; color: string; icon: React.ReactNode }[] = [
  { key: "Food", label: "Food", color: "#22c55e", icon: <Utensils className="h-3.5 w-3.5" /> },
  { key: "Transport", label: "Transport", color: "#3b82f6", icon: <Car className="h-3.5 w-3.5" /> },
  { key: "Bills", label: "Bills", color: "#ef4444", icon: <Receipt className="h-3.5 w-3.5" /> },
  { key: "Shopping", label: "Shopping", color: "#f59e0b", icon: <ShoppingBag className="h-3.5 w-3.5" /> },
  { key: "Other", label: "Other", color: "#6b7280", icon: <Ellipsis className="h-3.5 w-3.5" /> },
]

const CATEGORY_MAP = new Map(CATEGORIES.map((c) => [c.key, c]))

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function currentMonthLabel(): string {
  const d = new Date()
  return d.toLocaleString("en-US", { month: "long", year: "numeric" })
}

function isCurrentMonth(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

let nextId = 1
function genId(): string {
  return `exp_${Date.now()}_${nextId++}`
}

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>("toolpix_expenses", [])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState<Category>("Food")
  const [date, setDate] = useState(todayISO)

  const monthExpenses = useMemo(() => expenses.filter((e) => isCurrentMonth(e.date)), [expenses])

  const total = useMemo(() => monthExpenses.reduce((s, e) => s + e.amount, 0), [monthExpenses])

  const categoryTotals = useMemo(() => {
    const map = new Map<Category, number>()
    for (const e of monthExpenses) {
      map.set(e.category, (map.get(e.category) || 0) + e.amount)
    }
    return CATEGORIES.map((c) => ({
      name: c.key,
      label: c.label,
      value: map.get(c.key) || 0,
      color: c.color,
    }))
  }, [monthExpenses])

  const topCategory = useMemo(() => {
    let max = 0
    let top: Category | null = null
    for (const e of monthExpenses) {
      if (e.amount > max) {
        max = e.amount
        top = e.category
      }
    }
    return top
  }, [monthExpenses])

  const resetForm = useCallback(() => {
    setTitle("")
    setAmount("")
    setCategory("Food")
    setDate(todayISO)
  }, [])

  function addExpense() {
    const numAmount = parseFloat(amount)
    if (!title.trim()) { toast.error("Enter a title"); return }
    if (isNaN(numAmount) || numAmount <= 0) { toast.error("Enter a valid amount"); return }

    setExpenses((prev) => [
      ...prev,
      { id: genId(), title: title.trim(), amount: numAmount, category, date },
    ])
    resetForm()
    setShowForm(false)
    toast.success("Expense added")
  }

  function deleteExpense(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    toast.success("Expense deleted")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Expense Tracker</h2>
        <p className="text-sm text-muted-foreground">Track and analyze your monthly spending</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border shadow-sm">
          <CardContent className="p-4 text-center space-y-1.5">
            <div className="flex justify-center text-muted-foreground"><Wallet className="h-5 w-5" /></div>
            <div className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-foreground">${fmt(total)}</div>
            <p className="text-xs text-muted-foreground">Total this month</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-4 text-center space-y-1.5">
            <div className="flex justify-center text-muted-foreground"><BarChart3 className="h-5 w-5" /></div>
            <div className="text-base sm:text-lg font-bold tabular-nums tracking-tight text-foreground">{monthExpenses.length} entries</div>
            <p className="text-xs text-muted-foreground">{currentMonthLabel()}</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-4 text-center space-y-1.5">
            <div className="flex justify-center text-muted-foreground"><TrendingUp className="h-5 w-5" /></div>
            <div className="text-sm sm:text-base font-bold tabular-nums tracking-tight text-foreground">
              {topCategory ? (
                <span className="flex items-center justify-center gap-1">
                  {CATEGORY_MAP.get(topCategory)?.icon}
                  {topCategory}
                </span>
              ) : "—"}
            </div>
            <p className="text-xs text-muted-foreground">Highest category</p>
          </CardContent>
        </Card>
      </div>

      {categoryTotals.some((c) => c.value > 0) && (
        <Card className="border">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground">Category Breakdown</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={categoryTotals} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barCategoryGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${v}`} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={72} />
                <Tooltip
                  formatter={(value) => [typeof value === "number" ? `$${fmt(value)}` : String(value), "Total"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--color-border)" }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} background={{ fill: "var(--color-muted)" }}>
                  {categoryTotals.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">{currentMonthLabel()}</h3>
            </div>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Expense
            </Button>
          </div>

          {monthExpenses.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              <AlertCircle className="h-6 w-6" />
              <p>No expenses this month</p>
              <p className="text-xs text-muted-foreground/70">Click &quot;Add Expense&quot; to get started.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {monthExpenses.map((expense) => {
                const cat = CATEGORY_MAP.get(expense.category)
                return (
                  <div key={expense.id} className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-white text-xs"
                      style={{ backgroundColor: cat?.color || "#6b7280" }}
                    >
                      {cat?.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{expense.title}</p>
                      <p className="text-[11px] text-muted-foreground">{expense.date}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[11px]">{expense.category}</Badge>
                    <span className="text-sm font-semibold tabular-nums w-20 text-right shrink-0">${fmt(expense.amount)}</span>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-xs" onClick={() => { setShowForm(false); resetForm() }}>
          <Card className="w-full max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-5 space-y-4">
              <h3 className="text-base font-semibold">Add Expense</h3>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Groceries" className="h-10" autoFocus />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Amount ($)</label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="h-10 tabular-nums" min="0" step="0.01" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => { setShowForm(false); resetForm() }}>Cancel</Button>
                <Button className="flex-1" onClick={addExpense}>Add Expense</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

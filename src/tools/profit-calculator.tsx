"use client"

import { useState, useMemo } from "react"
import { DollarSign, TrendingUp, TrendingDown, BadgeDollarSign, BarChart3, Percent, AlertTriangle, PieChart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtCompact(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B"
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M"
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K"
  return fmt(n)
}

function KpiCard({ label, value, accent, subtitle, icon }: { label: string; value: string; accent: "green" | "red" | "amber" | "neutral"; subtitle?: string; icon: React.ReactNode }) {
  const colors = {
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
    amber: "text-amber-600 dark:text-amber-400",
    neutral: "text-foreground",
  }
  return (
    <Card className="border shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4 text-center space-y-1.5">
        <div className="flex justify-center text-muted-foreground">{icon}</div>
        <div className={`text-2xl sm:text-3xl font-bold tabular-nums tracking-tight ${colors[accent]}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {subtitle && <p className="text-[10px] text-muted-foreground/70">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

export default function ProfitCalculator() {
  const [revenue, setRevenue] = useState("50000")
  const [costs, setCosts] = useState("35000")

  const rev = Math.max(0, Number(revenue) || 0)
  const cos = Math.max(0, Number(costs) || 0)
  const profit = rev - cos
  const margin = rev > 0 ? (profit / rev) * 100 : 0
  const roi = cos > 0 ? (profit / cos) * 100 : 0
  const ratio = rev > 0 ? profit / rev : 0

  const marginColor = margin >= 20 ? "green" : margin >= 5 ? "amber" : "red"
  const profitColor = profit >= 0 ? "green" : "red"

  const bars = useMemo(() => {
    const max = Math.max(rev, cos, profit > 0 ? profit : 0) || 1
    return [
      { label: "Revenue", value: rev, pct: (rev / max) * 100, color: "bg-blue-500" },
      { label: "Costs", value: cos, pct: (cos / max) * 100, color: "bg-red-500" },
      { label: "Profit", value: profit > 0 ? profit : 0, pct: Math.max(0, (profit / max) * 100), color: "bg-green-500" },
    ]
  }, [rev, cos, profit])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Profit Calculator</h2>
        <p className="text-sm text-muted-foreground">Analyze revenue, costs, profit, and ROI</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                <label className="text-xs font-medium text-muted-foreground">Revenue ($)</label>
              </div>
              <Input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                placeholder="50000"
                className="h-11 text-base tabular-nums"
                min="0"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                <label className="text-xs font-medium text-muted-foreground">Costs ($)</label>
              </div>
              <Input
                type="number"
                value={costs}
                onChange={(e) => setCosts(e.target.value)}
                placeholder="35000"
                className="h-11 text-base tabular-nums"
                min="0"
              />
            </div>
          </div>

          {cos > rev && rev > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Costs exceed revenue — the business is operating at a loss.</span>
            </div>
          )}

          <div className="h-px bg-border" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KpiCard label="Net Profit" value={`${profit >= 0 ? "+" : ""}$${fmtCompact(Math.abs(profit))}`} accent={profitColor} icon={<BadgeDollarSign className="h-5 w-5" />} subtitle={profit >= 0 ? "Profitable" : "Loss-making"} />
            <KpiCard label="Profit Margin" value={`${margin.toFixed(1)}%`} accent={marginColor} icon={<Percent className="h-5 w-5" />} subtitle={margin >= 20 ? "High margin" : margin >= 5 ? "Moderate margin" : "Low margin"} />
            <KpiCard label="Return on Investment" value={`${roi.toFixed(1)}%`} accent={profitColor} icon={<PieChart className="h-5 w-5" />} subtitle={roi > 0 ? `${roi.toFixed(0)}% return on costs` : "Negative return"} />
          </div>

          <Card className="border-dashed bg-muted/30">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="font-semibold tabular-nums text-blue-600 dark:text-blue-400">${fmtCompact(rev)}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Costs</p>
                  <p className="font-semibold tabular-nums text-red-600 dark:text-red-400">${fmtCompact(cos)}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Profit Ratio</p>
                  <p className={`font-semibold tabular-nums ${profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {ratio >= 0 ? "+" : ""}{ratio.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {bars.map((bar) => (
                  <div key={bar.label} className="space-y-0.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{bar.label}</span>
                      <span className="font-medium tabular-nums">${fmtCompact(bar.value)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted-foreground/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${bar.color}`}
                        style={{ width: `${bar.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 border-t text-xs">
                <span className="text-muted-foreground">Break-even</span>
                <span className={`font-semibold flex items-center gap-1 ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {profit >= 0 ? (
                    <><TrendingUp className="h-3 w-3" /> Profitable</>
                  ) : (
                    <><TrendingDown className="h-3 w-3" /> Loss-making</>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}

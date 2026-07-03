"use client"

import { CalculatorHeader, CalculatorCard, NumberInput, ResultCard, ActionBar, InfoBox, ProgressBar } from "@/components/calculator/index"
import { Card, CardContent } from "@/components/ui/card"
import { parseNum, fmt, fmtCompact } from "@/lib/calculator/format"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import ChartContainer from "@/components/chart-container"
import { Target, PiggyBank, TrendingUp, Calendar, Clock, DollarSign } from "lucide-react"
import { useMemo, useState } from "react"

const MAX_MONTHS = 1200

interface MonthData {
  month: number
  balance: number
}

export default function SavingsGoalCalculator() {
  const [goal, setGoal] = useState("50000")
  const [current, setCurrent] = useState("5000")
  const [monthly, setMonthly] = useState("1000")
  const [rate, setRate] = useState("3")

  const goalVal = parseNum(goal)
  const currentVal = parseNum(current)
  const monthlyVal = parseNum(monthly)
  const annualRate = Math.max(0, Number(rate) || 0)
  const monthlyRate = annualRate / 100 / 12

  const { monthsRequired, chartData, totalInterest } = useMemo((): { monthsRequired: number; chartData: MonthData[]; totalInterest: number } => {
    if (goalVal <= 0 || monthlyVal <= 0) {
      return { monthsRequired: 0, chartData: [] as MonthData[], totalInterest: 0 }
    }

    let balance = currentVal
    let interest = 0
    const data: MonthData[] = [{ month: 0, balance }]

    for (let m = 1; m <= MAX_MONTHS; m++) {
      balance += monthlyVal
      const monthInterest = balance * monthlyRate
      balance += monthInterest
      interest += monthInterest
      data.push({ month: m, balance: Math.round(balance * 100) / 100 })

      if (balance >= goalVal) {
        return { monthsRequired: m, chartData: data, totalInterest: interest }
      }
    }

    return { monthsRequired: MAX_MONTHS, chartData: data, totalInterest }
  }, [goalVal, currentVal, monthlyVal, monthlyRate])

  const completionDate = useMemo(() => {
    if (monthsRequired <= 0) return "N/A"
    const d = new Date()
    d.setMonth(d.getMonth() + monthsRequired)
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }, [monthsRequired])

  const progressPct = goalVal > 0 ? (currentVal / goalVal) * 100 : 0

  function reset() {
    setGoal("50000")
    setCurrent("5000")
    setMonthly("1000")
    setRate("3")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CalculatorHeader title="Savings Goal Calculator" description="See how long it takes to reach your savings target with compound interest" />

      <CalculatorCard>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberInput label="Goal Amount ($)" value={goal} onChange={setGoal} icon={<Target className="h-3.5 w-3.5" />} placeholder="50000" />
          <NumberInput label="Current Savings ($)" value={current} onChange={setCurrent} icon={<PiggyBank className="h-3.5 w-3.5" />} placeholder="5000" />
          <NumberInput label="Monthly Savings ($)" value={monthly} onChange={setMonthly} icon={<DollarSign className="h-3.5 w-3.5" />} placeholder="1000" />
          <NumberInput label="Interest Rate (%)" value={rate} onChange={setRate} icon={<TrendingUp className="h-3.5 w-3.5" />} placeholder="3" step="0.1" min="0" />
        </div>

        <InfoBox variant="info">
          <Clock className="h-4 w-4 shrink-0" />
          <span>Compound interest is calculated monthly. Your savings grow faster as interest builds on interest.</span>
        </InfoBox>

        {goalVal > 0 && currentVal < goalVal && monthsRequired > 0 && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress toward goal</span>
                <span className="font-medium tabular-nums">{progressPct.toFixed(1)}%</span>
              </div>
              <ProgressBar value={currentVal} max={goalVal} color="bg-primary" />
              <div className="flex justify-between text-[10px] text-muted-foreground/70">
                <span>${fmtCompact(currentVal)} saved</span>
                <span>${fmtCompact(goalVal)} goal</span>
              </div>
            </div>

            {monthsRequired < MAX_MONTHS && (
              <div className="flex items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-800 dark:text-green-200">
                <Target className="h-4 w-4 shrink-0 mr-2" />
                <span>You will reach your goal in <strong>{monthsRequired} month{monthsRequired !== 1 ? "s" : ""}</strong> (around {completionDate})</span>
              </div>
            )}

            {monthsRequired >= MAX_MONTHS && (
              <InfoBox variant="warning">
                <Clock className="h-4 w-4 shrink-0" />
                <span>It will take more than {MAX_MONTHS} months (100 years) to reach your goal with current settings. Try increasing your monthly savings or goal.</span>
              </InfoBox>
            )}
          </>
        )}

        {currentVal >= goalVal && goalVal > 0 && (
          <InfoBox variant="success">
                <Target className="h-4 w-4 shrink-0" />
            <span>You have already reached your savings goal! Current savings (${fmtCompact(currentVal)}) exceed the goal of ${fmtCompact(goalVal)}.</span>
          </InfoBox>
        )}

        <div className="h-px bg-border" />

        {monthsRequired > 0 && monthsRequired < MAX_MONTHS && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ResultCard label="Months Required" value={String(monthsRequired)} accent="blue" icon={<Clock className="h-5 w-5" />} subtitle={`~${(monthsRequired / 12).toFixed(1)} years`} />
            <ResultCard label="Estimated Completion" value={completionDate} accent="neutral" icon={<Calendar className="h-5 w-5" />} subtitle="Goal date" />
            <ResultCard label="Total Interest Earned" value={`$${fmt(totalInterest)}`} accent="green" icon={<TrendingUp className="h-5 w-5" />} subtitle="From compound growth" />
          </div>
        )}

        {chartData.length > 1 && (
          <Card className="border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Savings Growth Over Time</span>
              </div>
              <ChartContainer height={300}>
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary, #8b5cf6)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-primary, #8b5cf6)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e5e7eb)" opacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} label={{ value: "Months", position: "insideBottomRight", offset: -5, style: { fontSize: 11, fill: "var(--color-muted-foreground)" } }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${fmtCompact(v)}`} tickLine={false} axisLine={false} width={70} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--color-border)" }}
                    formatter={(value: any) => [`$${fmt(value)}`, "Balance"]}
                    labelFormatter={(label) => `Month ${label}`}
                  />
                  <ReferenceLine y={goalVal} stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" label={{ value: "Goal", position: "right", fontSize: 11, fill: "#22c55e" }} />
                  <Area type="monotone" dataKey="balance" stroke="var(--color-primary, #8b5cf6)" strokeWidth={2} fill="url(#savingsGrad)" name="balance" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {goalVal <= 0 && (
          <InfoBox variant="info">
            <Target className="h-4 w-4 shrink-0" />
            <span>Enter your goal amount, current savings, monthly contribution, and interest rate to see the projection.</span>
          </InfoBox>
        )}

        <ActionBar onReset={reset} result={monthsRequired > 0 && monthsRequired < MAX_MONTHS ? `${monthsRequired} months` : undefined} />
      </CalculatorCard>
    </div>
  )
}

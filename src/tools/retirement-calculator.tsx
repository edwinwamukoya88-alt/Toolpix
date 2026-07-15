"use client"

import { CalculatorHeader, CalculatorCard, NumberInput, ResultCard, ActionBar, InfoBox, ProgressBar } from "@/components/calculator/index"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { parseNum, fmt, fmtCompact } from "@/lib/calculator/format"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import ChartContainer from "@/components/chart-container"
import { Heart, TrendingUp, PiggyBank, Users, Calendar, Clock, DollarSign, AlertTriangle } from "lucide-react"
import { useMemo, useState } from "react"

export default function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState("30")
  const [retirementAge, setRetirementAge] = useState("65")
  const [currentSavings, setCurrentSavings] = useState("50000")
  const [monthlyContribution, setMonthlyContribution] = useState("1000")
  const [annualReturn, setAnnualReturn] = useState("7")

  const calc = useMemo(() => {
    const a = parseNum(currentAge)
    const r = parseNum(retirementAge)
    const s = parseNum(currentSavings)
    const m = parseNum(monthlyContribution)
    const rate = parseNum(annualReturn)

    const years = Math.max(0, r - a)
    const months = years * 12
    const monthlyRate = rate / 100 / 12

    let futureValue = s
    let totalContrib = s

    if (months > 0) {
      if (monthlyRate > 0) {
        const growthFactor = Math.pow(1 + monthlyRate, months)
        futureValue = s * growthFactor + m * (growthFactor - 1) / monthlyRate
      } else {
        futureValue = s + m * months
      }
      totalContrib = s + m * months
    }

    const monthlyIncome = futureValue * 0.04 / 12

    const chartData: { age: number; portfolio: number }[] = []
    for (let y = 0; y <= years; y++) {
      const mm = y * 12
      let pv: number
      if (mm > 0 && monthlyRate > 0) {
        const gf = Math.pow(1 + monthlyRate, mm)
        pv = s * gf + m * (gf - 1) / monthlyRate
      } else {
        pv = s + m * mm
      }
      chartData.push({ age: a + y, portfolio: Math.round(pv) })
    }

    return { futureValue, monthlyIncome, totalContrib, chartData, years }
  }, [currentAge, retirementAge, currentSavings, monthlyContribution, annualReturn])

  const { futureValue, monthlyIncome, totalContrib, chartData, years } = calc

  const readiness = useMemo(() => {
    if (futureValue >= 1_000_000) return {
      icon: Heart,
      label: "On Track",
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
      desc: "You're on track for a comfortable retirement!",
    }
    if (futureValue >= 500_000) return {
      icon: TrendingUp,
      label: "Making Progress",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
      desc: "Consider increasing contributions to reach $1M.",
    }
    return {
      icon: AlertTriangle,
      label: "Needs Attention",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
      desc: "Try increasing your monthly contribution or extending your retirement age.",
    }
  }, [futureValue])

  const ReadinessIcon = readiness.icon

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CalculatorHeader title="Retirement Calculator" description="Plan your retirement savings" />

      <CalculatorCard>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberInput label="Current Age" value={currentAge} onChange={setCurrentAge} icon={<Calendar className="h-4 w-4" />} step="1" min="0" />
          <NumberInput label="Retirement Age" value={retirementAge} onChange={setRetirementAge} icon={<Clock className="h-4 w-4" />} step="1" min="0" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberInput label="Current Savings" value={currentSavings} onChange={setCurrentSavings} icon={<DollarSign className="h-4 w-4" />} step="1000" min="0" />
          <NumberInput label="Monthly Contribution" value={monthlyContribution} onChange={setMonthlyContribution} icon={<PiggyBank className="h-4 w-4" />} step="100" min="0" />
        </div>
        <NumberInput label="Expected Annual Return" value={annualReturn} onChange={setAnnualReturn} icon={<TrendingUp className="h-4 w-4" />} step="0.5" min="0" suffix="%" />
      </CalculatorCard>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ResultCard label="Retirement Fund" value={`$${fmtCompact(futureValue)}`} accent="green" icon={<PiggyBank className="h-5 w-5" />} subtitle={`at age ${parseNum(retirementAge)}`} />
        <ResultCard label="Monthly Income (4% Rule)" value={`$${fmt(monthlyIncome)}`} accent="blue" icon={<DollarSign className="h-5 w-5" />} subtitle="estimated monthly withdrawal" />
        <ResultCard label="Total Contributions" value={`$${fmtCompact(totalContrib)}`} accent="neutral" icon={<Users className="h-5 w-5" />} subtitle="you contribute this amount" />
      </div>

      <Card className={readiness.bg}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <ReadinessIcon className={`h-5 w-5 shrink-0 ${readiness.color}`} />
            <div className="space-y-0.5 flex-1">
              <p className={`text-sm font-semibold ${readiness.color}`}>{readiness.label}</p>
              <p className="text-xs text-muted-foreground">{readiness.desc}</p>
            </div>
          </div>
          {futureValue < 1_000_000 && (
            <>
              <ProgressBar value={futureValue} max={1_000_000} color="bg-primary" />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>$0</span>
                <span>$1M Goal</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {years > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Growth Projection</h3>
            </div>
            <ChartContainer height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 0.3 }} />
                    <stop offset="95%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" />
                <XAxis dataKey="age" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${fmtCompact(v)}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--popover-foreground))" }}
                  formatter={(value: any) => [`$${fmtCompact(value)}`, "Portfolio"]}
                  labelFormatter={(label: any) => `Age ${label}`}
                />
                <Area type="monotone" dataKey="portfolio" stroke="hsl(var(--primary))" fill="url(#portfolioGrad)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <ActionBar
        onReset={() => {
          setCurrentAge("30")
          setRetirementAge("65")
          setCurrentSavings("50000")
          setMonthlyContribution("1000")
          setAnnualReturn("7")
        }}
        result={`Retirement Fund: $${fmtCompact(futureValue)} | Monthly Income: $${fmt(monthlyIncome)}`}
      />

      <InfoBox>
        <AlertTriangle className="h-4 w-4 shrink-0" />
        This is an estimate. Consult a financial advisor for personalized retirement planning.
      </InfoBox>
    </div>
  )
}

"use client"

import { CalculatorHeader, CalculatorCard, NumberInput, ResultCard, ActionBar, InfoBox } from "@/components/calculator/index"
import { Card, CardContent } from "@/components/ui/card"
import { parseNum, fmt, fmtCompact } from "@/lib/calculator/format"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import ChartContainer from "@/components/chart-container"
import { TrendingUp, PiggyBank, PlusCircle, Calendar, BarChart3, DollarSign } from "lucide-react"
import { useMemo, useState } from "react"

export default function InvestmentCalculator() {
  const [initial, setInitial] = useState("10000")
  const [monthly, setMonthly] = useState("1000")
  const [returnRate, setReturnRate] = useState("8")
  const [years, setYears] = useState("20")

  const calc = useMemo(() => {
    const p = parseNum(initial)
    const m = parseNum(monthly)
    const r = parseNum(returnRate)
    const y = parseNum(years)

    if (p <= 0 || m <= 0 || r <= 0 || y <= 0) {
      return { futureValue: 0, gains: 0, contributions: 0, chartData: [] as { year: number; portfolioValue: number; totalContributions: number }[] }
    }

    const monthlyRate = r / 100 / 12
    const totalMonths = y * 12
    const totalContributions = p + m * totalMonths
    const compound = Math.pow(1 + monthlyRate, totalMonths)
    const futureValue = p * compound + m * ((compound - 1) / monthlyRate)
    const gains = futureValue - totalContributions

    const chartData = []
    for (let year = 1; year <= y; year++) {
      const yearMonths = year * 12
      const yearCompound = Math.pow(1 + monthlyRate, yearMonths)
      const portfolioValue = p * yearCompound + m * ((yearCompound - 1) / monthlyRate)
      const totalContributed = p + m * yearMonths
      chartData.push({
        year,
        portfolioValue: Math.round(portfolioValue * 100) / 100,
        totalContributions: Math.round(totalContributed * 100) / 100,
      })
    }

    return {
      futureValue: Math.round(futureValue * 100) / 100,
      gains: Math.round(gains * 100) / 100,
      contributions: Math.round(totalContributions * 100) / 100,
      chartData,
    }
  }, [initial, monthly, returnRate, years])

  function reset() {
    setInitial("10000"); setMonthly("1000"); setReturnRate("8"); setYears("20")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CalculatorHeader title="Investment Calculator" description="Project the growth of your investments over time" />

      <CalculatorCard>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberInput label="Initial Investment ($)" value={initial} onChange={setInitial} icon={<DollarSign className="h-3.5 w-3.5" />} placeholder="10000" />
          <NumberInput label="Monthly Investment ($)" value={monthly} onChange={setMonthly} icon={<PlusCircle className="h-3.5 w-3.5" />} placeholder="1000" />
          <NumberInput label="Expected Annual Return (%)" value={returnRate} onChange={setReturnRate} icon={<BarChart3 className="h-3.5 w-3.5" />} placeholder="8" step="0.1" min="0" />
          <NumberInput label="Investment Period (years)" value={years} onChange={setYears} icon={<Calendar className="h-3.5 w-3.5" />} placeholder="20" />
        </div>

        <InfoBox variant="info">
          <TrendingUp className="h-4 w-4 shrink-0" />
          <span>Projections assume a constant annual return. Actual returns may vary.</span>
        </InfoBox>

        <div className="h-px bg-border" />

        {calc.futureValue > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ResultCard label="Future Value" value={`$${fmtCompact(calc.futureValue)}`} accent="green" icon={<TrendingUp className="h-5 w-5" />} />
            <ResultCard label="Investment Gains" value={`$${fmtCompact(calc.gains)}`} accent="blue" icon={<BarChart3 className="h-5 w-5" />} subtitle="Above contributions" />
            <ResultCard label="Total Contributions" value={`$${fmtCompact(calc.contributions)}`} accent="neutral" icon={<PiggyBank className="h-5 w-5" />} />
          </div>
        )}

        {calc.chartData.length > 0 && (
          <Card className="border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Growth Over Time</span>
              </div>
              <ChartContainer height={320}>
                <AreaChart data={calc.chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="tcGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.5} />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} label={{ value: "Years", position: "insideBottomRight", offset: -5, style: { fontSize: 11, fill: "var(--color-muted-foreground)" } }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${fmtCompact(v)}`} tickLine={false} axisLine={false} width={70} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--color-border)" }}
                    formatter={(value: any) => [`$${fmt(value)}`, ""]}
                    labelFormatter={(label: any) => `Year ${label}`}
                  />
                  <Area type="monotone" dataKey="portfolioValue" stroke="hsl(142, 76%, 36%)" strokeWidth={2} fill="url(#pvGrad)" name="Portfolio Value" />
                  <Area type="monotone" dataKey="totalContributions" stroke="hsl(217, 91%, 60%)" strokeWidth={2} fill="url(#tcGrad)" name="Total Contributions" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        <ActionBar onReset={reset} result={`$${fmtCompact(calc.futureValue)}`} />
      </CalculatorCard>
    </div>
  )
}

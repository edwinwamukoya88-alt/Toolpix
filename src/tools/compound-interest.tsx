"use client"

import { CalculatorHeader, CalculatorCard, NumberInput, ResultCard, ActionBar, InfoBox } from "@/components/calculator/index"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { parseNum, fmt, fmtCompact } from "@/lib/calculator/format"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import ChartContainer from "@/components/chart-container"
import { TrendingUp, PiggyBank, PlusCircle, Calendar, DollarSign } from "lucide-react"
import { useMemo, useState } from "react"

type Frequency = "monthly" | "quarterly" | "yearly"

function futureValue(P: number, PMT: number, r: number, t: number, freq: Frequency): number {
  const periodsPerYear = freq === "monthly" ? 12 : freq === "quarterly" ? 4 : 1
  const rate = r / 100 / periodsPerYear
  const totalPeriods = periodsPerYear * t
  const pmtPerPeriod = freq === "monthly" ? PMT : freq === "quarterly" ? PMT * 3 : PMT * 12
  if (rate === 0) return P + pmtPerPeriod * totalPeriods
  const factor = Math.pow(1 + rate, totalPeriods)
  return P * factor + pmtPerPeriod * (factor - 1) / rate
}

const FREQ_OPTIONS: { value: Frequency; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
]

export default function CompoundInterestCalculator() {
  const [initialStr, setInitialStr] = useState("10000")
  const [monthlyStr, setMonthlyStr] = useState("500")
  const [rateStr, setRateStr] = useState("7")
  const [freq, setFreq] = useState<Frequency>("monthly")
  const [yearsStr, setYearsStr] = useState("10")

  const initial = parseNum(initialStr)
  const monthly = parseNum(monthlyStr)
  const rate = parseNum(rateStr)
  const years = Math.max(0, parseInt(yearsStr) || 0)

  const finalBalance = futureValue(initial, monthly, rate, years, freq)
  const totalContributions = initial + monthly * 12 * years
  const totalInterest = finalBalance - totalContributions

  const chartData = useMemo(() => {
    const data = []
    for (let y = 0; y <= years; y++) {
      const balance = futureValue(initial, monthly, rate, y, freq)
      const contrib = initial + monthly * 12 * y
      data.push({
        year: y,
        balance: Math.round(balance * 100) / 100,
        contributions: Math.round(contrib * 100) / 100,
      })
    }
    return data
  }, [initial, monthly, rate, years, freq])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CalculatorHeader
        title="Compound Interest Calculator"
        description="See how your money grows with compound interest over time"
      />

      <CalculatorCard>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberInput
            label="Initial Investment ($)"
            value={initialStr}
            onChange={setInitialStr}
            icon={<DollarSign className="h-3.5 w-3.5" />}
          />
          <NumberInput
            label="Monthly Contribution ($)"
            value={monthlyStr}
            onChange={setMonthlyStr}
            icon={<PlusCircle className="h-3.5 w-3.5" />}
          />
          <NumberInput
            label="Annual Interest Rate (%)"
            value={rateStr}
            onChange={setRateStr}
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            step="0.1"
          />
          <NumberInput
            label="Time Period (years)"
            value={yearsStr}
            onChange={setYearsStr}
            icon={<Calendar className="h-3.5 w-3.5" />}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <PiggyBank className="h-3.5 w-3.5 text-muted-foreground" />
            <label className="text-xs font-medium text-muted-foreground">Compounding Frequency</label>
          </div>
          <select
            value={freq}
            onChange={(e) => setFreq(e.target.value as Frequency)}
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-base tabular-nums ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {FREQ_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </CalculatorCard>

      {years > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ResultCard
              label="Final Balance"
              value={`$${fmt(finalBalance)}`}
              accent="green"
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <ResultCard
              label="Total Interest Earned"
              value={`$${fmt(totalInterest)}`}
              accent="blue"
              icon={<DollarSign className="h-5 w-5" />}
            />
            <ResultCard
              label="Total Contributions"
              value={`$${fmt(totalContributions)}`}
              accent="neutral"
              icon={<PlusCircle className="h-5 w-5" />}
            />
          </div>

          <Card>
            <CardContent className="p-4">
              <ChartContainer height={320}>
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary, #8b5cf6)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-primary, #8b5cf6)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="contribGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e5e7eb)" opacity={0.5} />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    label={{
                      value: "Years",
                      position: "insideBottomRight",
                      offset: -5,
                      style: { fontSize: 11, fill: "var(--color-muted-foreground)" },
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: number) => `$${fmtCompact(v)}`}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--color-border)" }}
                    formatter={(value: any, name: any) => {
                      const labels: Record<string, string> = {
                        balance: "Total Balance",
                        contributions: "Contributions",
                      }
                      return [`$${fmt(value)}`, labels[name] || name]
                    }}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="var(--color-primary, #8b5cf6)"
                    strokeWidth={2}
                    fill="url(#balGrad)"
                    name="balance"
                  />
                  <Area
                    type="monotone"
                    dataKey="contributions"
                    stroke="#22c55e"
                    strokeWidth={1.5}
                    fill="url(#contribGrad)"
                    name="contributions"
                    opacity={0.7}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      ) : (
        <InfoBox>
          <span>Enter a time period to see your compound interest projections.</span>
        </InfoBox>
      )}
    </div>
  )
}

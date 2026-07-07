"use client"

import { CalculatorHeader, CalculatorCard, NumberInput, ResultCard, ActionBar, Bar, InfoBox } from "@/components/calculator/index"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { parseNum, fmt, fmtCompact } from "@/lib/calculator/format"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import ChartContainer from "@/components/chart-container"
import { Home, Percent, Calendar, DollarSign, Shield, TrendingDown, Banknote, PieChart } from "lucide-react"
import { useMemo, useState } from "react"

interface YearData {
  year: number
  balance: number
  cumulativePrincipal: number
  cumulativeInterest: number
}

export default function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState("350000")
  const [downPayment, setDownPayment] = useState("70000")
  const [rate, setRate] = useState("6.5")
  const [term, setTerm] = useState("30")
  const [propertyTax, setPropertyTax] = useState("2400")
  const [insurance, setInsurance] = useState("1200")

  const hp = parseNum(homePrice)
  const dp = parseNum(downPayment)
  const loanAmount = Math.max(0, hp - dp)
  const annualRate = parseNum(rate)
  const monthlyRate = annualRate / 100 / 12
  const n = Math.max(1, parseNum(term) * 12)
  const annualTax = parseNum(propertyTax)
  const annualInsurance = parseNum(insurance)

  const monthlyPi = loanAmount > 0 && monthlyRate > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)
    : loanAmount > 0 ? loanAmount / n : 0

  const monthlyTax = annualTax / 12
  const monthlyInsurance = annualInsurance / 12
  const totalMonthly = monthlyPi + monthlyTax + monthlyInsurance
  const totalPaid = monthlyPi * n
  const totalInterest = totalPaid - loanAmount
  const totalWithTaxAndInsurance = totalPaid + annualTax * parseNum(term) + annualInsurance * parseNum(term)

  const schedule = useMemo<YearData[]>(() => {
    if (loanAmount <= 0 || monthlyRate <= 0) return []
    const rows: YearData[] = []
    let balance = loanAmount
    let cumPrincipal = 0
    let cumInterest = 0
    for (let year = 1; year <= parseNum(term); year++) {
      for (let m = 0; m < 12; m++) {
        const interestPaid = balance * monthlyRate
        const principalPaid = monthlyPi - interestPaid
        balance = Math.max(0, balance - principalPaid)
        cumPrincipal += principalPaid
        cumInterest += interestPaid
      }
      rows.push({
        year,
        balance,
        cumulativePrincipal: cumPrincipal,
        cumulativeInterest: cumInterest,
      })
    }
    return rows
  }, [loanAmount, monthlyRate, monthlyPi, parseNum(term)])

  const principalPct = totalPaid > 0 ? (loanAmount / totalPaid) * 100 : 0
  const interestPct = totalPaid > 0 ? (totalInterest / totalPaid) * 100 : 0

  const dpPct = hp > 0 ? (dp / hp) * 100 : 0
  const ltv = hp > 0 ? (loanAmount / hp) * 100 : 0

  const breakdownBars = [
    { label: "Principal", value: loanAmount, pct: principalPct, color: "bg-blue-500" },
    { label: "Interest", value: totalInterest, pct: interestPct, color: "bg-orange-500" },
  ]

  function handleReset() {
    setHomePrice("350000")
    setDownPayment("70000")
    setRate("6.5")
    setTerm("30")
    setPropertyTax("2400")
    setInsurance("1200")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CalculatorHeader title="Mortgage Calculator" description="Estimate your monthly payments and total costs" />

      <CalculatorCard>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberInput label="Home Price ($)" value={homePrice} onChange={setHomePrice} icon={<Home className="h-3.5 w-3.5" />} placeholder="350000" step="1000" />
          <NumberInput label="Down Payment ($)" value={downPayment} onChange={setDownPayment} icon={<Banknote className="h-3.5 w-3.5" />} placeholder="70000" step="1000" />
          <NumberInput label="Interest Rate (%)" value={rate} onChange={setRate} icon={<Percent className="h-3.5 w-3.5" />} placeholder="6.5" step="0.1" />
          <NumberInput label="Loan Term (years)" value={term} onChange={setTerm} icon={<Calendar className="h-3.5 w-3.5" />} placeholder="30" step="1" />
          <NumberInput label="Property Tax (annual $)" value={propertyTax} onChange={setPropertyTax} icon={<DollarSign className="h-3.5 w-3.5" />} placeholder="2400" step="100" />
          <NumberInput label="Insurance (annual $)" value={insurance} onChange={setInsurance} icon={<Shield className="h-3.5 w-3.5" />} placeholder="1200" step="100" />
        </div>

        {dp > 0 && hp > 0 && (
          <InfoBox variant="info">
            <span>
              Down payment is <strong>{dpPct.toFixed(1)}%</strong> of home price.
              Loan-to-value ratio: <strong>{ltv.toFixed(1)}%</strong>.
            </span>
          </InfoBox>
        )}

        <div className="h-px bg-border" />

        {totalMonthly > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ResultCard label="Monthly Payment" value={`$${fmt(totalMonthly)}`} accent="blue" icon={<DollarSign className="h-5 w-5" />} subtitle={`P&I $${fmt(monthlyPi)} + Tax $${fmt(monthlyTax)} + Ins $${fmt(monthlyInsurance)}`} />
              <ResultCard label="Total Paid Over Term" value={`$${fmtCompact(totalWithTaxAndInsurance)}`} accent="neutral" icon={<Banknote className="h-5 w-5" />} subtitle={`${term} years`} />
              <ResultCard label="Total Interest" value={`$${fmtCompact(totalInterest)}`} accent="amber" icon={<TrendingDown className="h-5 w-5" />} subtitle={`${((totalInterest / totalPaid) * 100).toFixed(1)}% of total`} />
            </div>

            <Card className="border-dashed bg-muted/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <PieChart className="h-4 w-4" />
                  <span>Principal vs Interest</span>
                </div>
                <div className="space-y-2">
                  {breakdownBars.map((bar) => (
                    <Bar key={bar.label} label={bar.label} value={`$${fmtCompact(bar.value)}`} pct={bar.pct} color={bar.color} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {schedule.length > 0 && (
              <Card className="border">
                <CardContent className="p-4 pt-4">
                  <ChartContainer height={300}>
                    <AreaChart data={schedule} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="cumPrincipalGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="cumInterestGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e5e7eb)" opacity={0.5} />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} label={{ value: "Years", position: "insideBottomRight", offset: -5, style: { fontSize: 11, fill: "var(--color-muted-foreground)" } }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${fmtCompact(v)}`} tickLine={false} axisLine={false} width={70} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--color-border)" }}
                        formatter={(value: any) => [`$${fmtCompact(value)}`, ""]}
                        labelFormatter={(label) => `Year ${label}`}
                      />
                      <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} fill="url(#balanceGrad)" name="Remaining Balance" />
                      <Area type="monotone" dataKey="cumulativePrincipal" stroke="#22c55e" strokeWidth={1.5} fill="url(#cumPrincipalGrad)" name="Principal Paid" opacity={0.7} />
                      <Area type="monotone" dataKey="cumulativeInterest" stroke="#f97316" strokeWidth={1.5} fill="url(#cumInterestGrad)" name="Interest Paid" opacity={0.7} />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            <ActionBar onReset={handleReset} result={fmt(totalMonthly)} />
          </>
        ) : (
          <InfoBox variant="info">
            <Home className="h-4 w-4 shrink-0" />
            <span>Enter your home price and loan details to calculate your monthly mortgage payment.</span>
          </InfoBox>
        )}
      </CalculatorCard>
    </div>
  )
}

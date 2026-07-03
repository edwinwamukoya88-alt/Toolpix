"use client"

import { CalculatorHeader, CalculatorCard, NumberInput, ResultCard, ActionBar, InfoBox, Bar } from "@/components/calculator/index"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { parseNum, fmt, fmtCompact } from "@/lib/calculator/format"
import { DollarSign, Percent, Wallet, TrendingDown, Building, Receipt, Landmark } from "lucide-react"
import { useMemo, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const countryDefaults: Record<string, { taxRate: number; deductions: number; currency: string; note: string }> = {
  "United States": { taxRate: 22, deductions: 12950, currency: "$", note: "Based on 2024 standard deduction for single filer." },
  Kenya: { taxRate: 30, deductions: 28800, currency: "KSh", note: "Based on PAYE bands. Personal relief of KSh 2,400/month included." },
  "United Kingdom": { taxRate: 20, deductions: 12570, currency: "£", note: "Based on 2024/25 Personal Allowance." },
  Canada: { taxRate: 25, deductions: 15000, currency: "C$", note: "Based on 2024 federal basic personal amount." },
}

export default function IncomeTaxCalculator() {
  const [country, setCountry] = useState("United States")
  const [income, setIncome] = useState("75000")
  const [taxRate, setTaxRate] = useState("22")
  const [deductions, setDeductions] = useState("12950")

  const inc = parseNum(income)
  const rate = Math.max(0, Number(taxRate) || 0)
  const ded = parseNum(deductions)

  const taxable = Math.max(0, inc - ded)
  const tax = taxable * (rate / 100)
  const effectiveRate = inc > 0 ? (tax / inc) * 100 : 0
  const net = inc - tax
  const monthly = net / 12

  const currency = countryDefaults[country]?.currency ?? "$"

  function handleCountryChange(val: string | null) {
    if (!val) return
    setCountry(val)
    const c = countryDefaults[val]
    if (c) {
      setTaxRate(String(c.taxRate))
      setDeductions(String(c.deductions))
    }
  }

  function reset() {
    setIncome("75000")
    setTaxRate("22")
    setDeductions("12950")
    setCountry("United States")
  }

  const bars = useMemo(() => {
    const max = Math.max(inc, ded, tax) || 1
    return [
      { label: "Gross Income", value: `${currency}${fmtCompact(inc)}`, pct: (inc / max) * 100, color: "bg-blue-500" },
      { label: "Deductions", value: `${currency}${fmtCompact(ded)}`, pct: (ded / max) * 100, color: "bg-amber-500" },
      { label: "Tax Payable", value: `${currency}${fmtCompact(tax)}`, pct: (tax / max) * 100, color: "bg-red-500" },
      { label: "Net Income", value: `${currency}${fmtCompact(net)}`, pct: (net / max) * 100, color: "bg-green-500" },
    ]
  }, [inc, ded, tax, net, currency])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CalculatorHeader title="Income Tax Calculator" description="Estimate your income tax based on your country's tax rules" />

      <CalculatorCard>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5 text-muted-foreground" />
            <label className="text-xs font-medium text-muted-foreground">Country</label>
          </div>
          <Select value={country} onValueChange={handleCountryChange}>
            <SelectTrigger className="h-11 text-base">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(countryDefaults).map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground/70">{countryDefaults[country]?.note}</p>
        </div>

        <div className="h-px bg-border" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NumberInput label={`Annual Income (${currency})`} value={income} onChange={setIncome} icon={<DollarSign className="h-3.5 w-3.5" />} placeholder="75000" />
          <NumberInput label="Tax Rate (%)" value={taxRate} onChange={setTaxRate} icon={<Percent className="h-3.5 w-3.5" />} placeholder="22" step="0.1" min="0" />
          <NumberInput label={`Deductions (${currency})`} value={deductions} onChange={setDeductions} icon={<Receipt className="h-3.5 w-3.5" />} placeholder="12950" />
        </div>

        <InfoBox variant="info">
          <Landmark className="h-4 w-4 shrink-0" />
          <span>Taxable income is calculated as gross income minus deductions. Tax is then applied at the specified rate.</span>
        </InfoBox>

        <div className="h-px bg-border" />

        {inc > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ResultCard label="Tax Payable" value={`${currency}${fmt(tax)}`} accent="red" icon={<TrendingDown className="h-5 w-5" />} subtitle={taxable > 0 ? `Taxed on ${currency}${fmtCompact(taxable)}` : "No taxable income"} />
            <ResultCard label="Effective Tax Rate" value={`${effectiveRate.toFixed(2)}%`} accent="amber" icon={<Percent className="h-5 w-5" />} subtitle={`of ${currency}${fmtCompact(inc)} gross income`} />
            <ResultCard label="Net Income" value={`${currency}${fmt(net)}`} accent="green" icon={<Wallet className="h-5 w-5" />} subtitle={`After tax and deductions`} />
            <ResultCard label="Monthly Take-Home" value={`${currency}${fmt(monthly)}`} accent="blue" icon={<DollarSign className="h-5 w-5" />} subtitle={`Per month (${currency}${fmtCompact(net)} / 12)`} />
          </div>
        )}

        {inc > 0 && (
          <Card className="border-dashed bg-muted/30">
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Gross Income</p>
                  <p className="font-semibold tabular-nums text-blue-600 dark:text-blue-400">{currency}{fmtCompact(inc)}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Deductions</p>
                  <p className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">{currency}{fmtCompact(ded)}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Taxable Income</p>
                  <p className="font-semibold tabular-nums">{currency}{fmtCompact(taxable)}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Tax Rate</p>
                  <p className="font-semibold tabular-nums text-red-600 dark:text-red-400">{rate}%</p>
                </div>
              </div>

              <div className="space-y-2">
                {bars.map((bar) => (
                  <Bar key={bar.label} label={bar.label} value={bar.value} pct={bar.pct} color={bar.color} />
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 border-t text-xs">
                <span className="text-muted-foreground">Take-home ratio</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {inc > 0 ? ((net / inc) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {inc <= 0 && (
          <InfoBox variant="info">
            <DollarSign className="h-4 w-4 shrink-0" />
            <span>Enter your annual income to see the estimated tax breakdown.</span>
          </InfoBox>
        )}

        <ActionBar onReset={reset} result={`${currency}${fmt(net)}`} />
      </CalculatorCard>
    </div>
  )
}

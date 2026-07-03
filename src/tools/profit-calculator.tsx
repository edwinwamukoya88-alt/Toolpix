"use client"

import { CalculatorHeader, CalculatorCard, NumberInput, ResultCard, ActionBar, InfoBox, Bar } from "@/components/calculator/index"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { parseNum, fmt, fmtCompact, fmtPercent } from "@/lib/calculator/format"
import { TrendingUp, TrendingDown, DollarSign, Percent, BadgeDollarSign, PieChart, BarChart3, Package, AlertTriangle } from "lucide-react"
import { useMemo, useState } from "react"

export default function ProfitCalculator() {
  const [costPrice, setCostPrice] = useState("10")
  const [sellPrice, setSellPrice] = useState("25")
  const [quantity, setQuantity] = useState("100")

  const calc = useMemo(() => {
    const cost = parseNum(costPrice)
    const sell = parseNum(sellPrice)
    const qty = parseNum(quantity)

    const revenue = sell * qty
    const costs = cost * qty
    const profit = revenue - costs
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0
    const markup = cost > 0 ? ((sell - cost) / cost) * 100 : 0
    const roi = cost > 0 ? (profit / cost) * 100 : 0
    const breakEven = sell > cost ? Math.ceil(cost / (sell - cost) * qty) : null

    return { cost, sell, qty, revenue, costs, profit, margin, markup, roi, breakEven }
  }, [costPrice, sellPrice, quantity])

  const { cost, sell, qty, revenue, costs: totalCosts, profit, margin, markup, roi, breakEven } = calc

  const roiColor = roi >= 0 ? "green" : "red"
  const profitColor = profit >= 0 ? "green" : "red"
  const lossWarning = totalCosts > revenue && revenue > 0

  const bars = useMemo(() => {
    const max = Math.max(revenue, totalCosts, profit > 0 ? profit : 0) || 1
    return [
      { label: "Revenue", value: `$${fmtCompact(revenue)}`, pct: (revenue / max) * 100, color: "bg-blue-500" },
      { label: "Costs", value: `$${fmtCompact(totalCosts)}`, pct: (totalCosts / max) * 100, color: "bg-red-500" },
      { label: "Profit", value: `$${fmtCompact(Math.abs(profit))}`, pct: Math.max(0, (profit / max) * 100), color: "bg-green-500" },
    ]
  }, [revenue, totalCosts, profit])

  const result = `Profit: ${profit >= 0 ? "+" : ""}$${fmtCompact(Math.abs(profit))} | Margin: ${fmtPercent(margin)} | Markup: ${fmtPercent(markup)} | ROI: ${fmtPercent(roi)}`

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CalculatorHeader title="Profit Calculator" description="Analyze profit margins, markup, and break-even point" />

      <CalculatorCard>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NumberInput label="Cost Price Per Unit ($)" value={costPrice} onChange={setCostPrice} icon={<DollarSign className="h-4 w-4" />} step="0.01" min="0" />
          <NumberInput label="Selling Price Per Unit ($)" value={sellPrice} onChange={setSellPrice} icon={<TrendingUp className="h-4 w-4" />} step="0.01" min="0" />
          <NumberInput label="Quantity" value={quantity} onChange={setQuantity} icon={<Package className="h-4 w-4" />} step="1" min="0" />
        </div>
      </CalculatorCard>

      {lossWarning && (
        <InfoBox variant="warning">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Costs exceed revenue — the business is operating at a loss.
        </InfoBox>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ResultCard label="Total Profit" value={`${profit >= 0 ? "+" : "-"}$${fmtCompact(Math.abs(profit))}`} accent={profitColor} icon={<BadgeDollarSign className="h-5 w-5" />} subtitle={profit >= 0 ? "Profitable" : "Loss-making"} />
        <ResultCard label="Gross Margin" value={fmtPercent(margin)} accent="amber" icon={<Percent className="h-5 w-5" />} subtitle="Profit as % of revenue" />
        <ResultCard label="Markup" value={fmtPercent(markup)} accent="blue" icon={<BarChart3 className="h-5 w-5" />} subtitle="Markup over cost" />
        <ResultCard label="Return on Investment" value={fmtPercent(roi)} accent={roiColor} icon={<PieChart className="h-5 w-5" />} subtitle={`${roi >= 0 ? "Return" : "Loss"} on cost basis`} />
      </div>

      <ResultCard label="Break-even Quantity" value={breakEven !== null ? fmt(breakEven) : "N/A"} accent="neutral" icon={<TrendingDown className="h-5 w-5" />} subtitle="Units needed to cover costs" />

      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Revenue vs Costs vs Profit
          </h3>
          <div className="space-y-2">
            {bars.map((bar) => (
              <Bar key={bar.label} label={bar.label} value={bar.value} pct={bar.pct} color={bar.color} />
            ))}
          </div>
        </CardContent>
      </Card>

      <ActionBar
        onReset={() => {
          setCostPrice("10")
          setSellPrice("25")
          setQuantity("100")
        }}
        result={result}
      />
    </div>
  )
}

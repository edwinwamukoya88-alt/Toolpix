"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Wallet, Percent, Calendar, TrendingUp, TrendingDown, Banknote, BadgeDollarSign, Table2, BarChart3, FileDown, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface AmortizationRow {
  month: number
  openingBalance: number
  emi: number
  principal: number
  interest: number
  closingBalance: number
}

type Tab = "summary" | "amortization" | "graph"

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtCompact(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B"
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M"
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K"
  return fmt(n)
}

function ResultCard({ label, value, accent, icon }: { label: string; value: string; accent: "green" | "red" | "neutral"; icon: React.ReactNode }) {
  const colors = { green: "text-green-600 dark:text-green-400", red: "text-red-600 dark:text-red-400", neutral: "text-foreground" }
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4 text-center space-y-1.5">
        <div className="flex justify-center text-muted-foreground">{icon}</div>
        <div className={`text-2xl sm:text-3xl font-bold tabular-nums tracking-tight ${colors[accent]}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}

const TAB_ICONS: Record<Tab, React.ReactNode> = {
  summary: <BadgeDollarSign className="h-4 w-4" />,
  amortization: <Table2 className="h-4 w-4" />,
  graph: <BarChart3 className="h-4 w-4" />,
}

export default function LoanCalculator() {
  const [amount, setAmount] = useState("250000")
  const [rate, setRate] = useState("6.5")
  const [years, setYears] = useState("30")
  const [tab, setTab] = useState<Tab>("summary")

  const p = Math.max(0, Number(amount) || 0)
  const annualRate = Math.max(0, Number(rate) || 0)
  const monthlyRate = annualRate / 100 / 12
  const n = Math.max(1, (Number(years) || 0) * 12)

  const monthly = p > 0 && monthlyRate > 0 && n > 0
    ? (p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)
    : 0
  const total = monthly * n
  const interest = total - p
  const interestPct = p > 0 ? (interest / p) * 100 : 0

  const schedule = useMemo<AmortizationRow[]>(() => {
    if (p <= 0 || monthlyRate <= 0) return []
    const rows: AmortizationRow[] = []
    let balance = p
    for (let i = 1; i <= n; i++) {
      const interestPaid = balance * monthlyRate
      const principalPaid = monthly - interestPaid
      balance -= principalPaid
      rows.push({
        month: i,
        openingBalance: rows.length > 0 ? rows[rows.length - 1].closingBalance : p,
        emi: monthly,
        principal: principalPaid,
        interest: interestPaid,
        closingBalance: Math.max(0, balance),
      })
    }
    return rows
  }, [p, monthlyRate, n, monthly])

  const chartData = useMemo(() => {
    let cumPrincipal = 0
    let cumInterest = 0
    return schedule.map((row) => {
      cumPrincipal += row.principal
      cumInterest += row.interest
      return {
        month: row.month,
        balance: row.closingBalance,
        cumulativePrincipal: cumPrincipal,
        cumulativeInterest: cumInterest,
      }
    })
  }, [schedule])

  const scheduleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (tab === "amortization" && scheduleRef.current) {
      scheduleRef.current.scrollTop = 0
    }
  }, [tab])

  async function downloadPDF() {
    try {
      const [{ default: jsPDF }, mod] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ])

      const doc = new jsPDF({ unit: "mm", format: "a4" })

      doc.setFontSize(18)
      doc.text("Loan Amortization Schedule", 14, 20)

      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 27)

      doc.setFontSize(12)
      doc.text("Loan Summary", 14, 36)

      const summaryRows = [
        ["Principal", `$${fmt(p)}`],
        ["Interest Rate", `${annualRate}%`],
        ["Term", `${years} years (${n} months)`],
        ["Monthly Payment", `$${fmt(monthly)}`],
        ["Total Payment", `$${fmt(total)}`],
        ["Total Interest", `$${fmt(interest)}`],
      ]

      ;(doc as any).autoTable({
        startY: 40,
        head: [["Item", "Value"]],
        body: summaryRows,
        theme: "grid",
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 9 },
      })

      const tableStart = (doc as any).lastAutoTable.finalY + 10

      doc.setFontSize(12)
      doc.text("Amortization Schedule", 14, tableStart)

      const amortBody = schedule.map((row) => [
        String(row.month),
        `$${fmt(row.openingBalance)}`,
        `$${fmt(row.emi)}`,
        `$${fmt(row.principal)}`,
        `$${fmt(row.interest)}`,
        `$${fmt(row.closingBalance)}`,
      ])

      ;(doc as any).autoTable({
        startY: tableStart + 5,
        head: [["#", "Opening", "EMI", "Principal", "Interest", "Closing"]],
        body: amortBody.slice(0, 120),
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229], fontSize: 8 },
        styles: { fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 30 },
          2: { cellWidth: 28 },
          3: { cellWidth: 28 },
          4: { cellWidth: 28 },
          5: { cellWidth: 30 },
        },
      })

      if (schedule.length > 120) {
        const yPos = (doc as any).lastAutoTable.finalY + 5
        doc.setFontSize(8)
        doc.text(`Showing first 120 of ${schedule.length} months.`, 14, yPos)
      }

      doc.save("loan-amortization.pdf")
      toast.success("PDF report downloaded")
    } catch (err) {
      toast.error("Failed to generate PDF")
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Loan / EMI Calculator</h2>
        <p className="text-sm text-muted-foreground">Calculate loan payments and full amortization summary</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                <label className="text-xs font-medium text-muted-foreground">Loan Amount ($)</label>
              </div>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="250000" className="h-11 text-base tabular-nums" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                <label className="text-xs font-medium text-muted-foreground">Interest Rate (%)</label>
              </div>
              <Input type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="6.5" className="h-11 text-base tabular-nums" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <label className="text-xs font-medium text-muted-foreground">Term (years)</label>
              </div>
              <Input type="number" value={years} onChange={(e) => setYears(e.target.value)} placeholder="30" className="h-11 text-base tabular-nums" />
            </div>
          </div>

          <div className="h-px bg-border" />

          {monthly > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ResultCard label="Monthly Payment" value={`$${fmt(monthly)}`} accent="green" icon={<BadgeDollarSign className="h-5 w-5" />} />
                <ResultCard label="Total Payment" value={`$${fmt(total)}`} accent="neutral" icon={<Banknote className="h-5 w-5" />} />
                <ResultCard label="Total Interest" value={`$${fmt(interest)}`} accent="red" icon={<TrendingDown className="h-5 w-5" />} />
              </div>

              <div className="flex flex-wrap gap-2">
                {(["summary", "amortization", "graph"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      tab === t
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {TAB_ICONS[t]}
                    {t === "summary" ? "Summary" : t === "amortization" ? "Amortization" : "Graph"}
                  </button>
                ))}
              </div>

              {tab === "summary" && (
                <Card className="border-dashed bg-muted/30">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Principal</p>
                        <p className="font-semibold tabular-nums">${fmtCompact(p)}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Interest Rate</p>
                        <p className="font-semibold tabular-nums">{annualRate}%</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Term</p>
                        <p className="font-semibold tabular-nums">{years} years ({n} months)</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Interest / Principal</p>
                        <p className="font-semibold tabular-nums text-red-600 dark:text-red-400">+{interestPct.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 w-full rounded-full bg-muted-foreground/15 overflow-hidden flex">
                      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(p / total) * 100}%` }} />
                      <div className="h-full rounded-full bg-red-500/60 transition-all duration-500" style={{ width: `${(interest / total) * 100}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-muted-foreground">Principal {((p / total) * 100).toFixed(1)}%</span>
                      <span className="text-[10px] text-muted-foreground">Interest {((interest / total) * 100).toFixed(1)}%</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {tab === "amortization" && (
                <div ref={scheduleRef} className="max-h-80 overflow-auto rounded-lg border">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/70 sticky top-0 z-10">
                        <th className="px-2.5 py-2 text-left font-medium text-muted-foreground">#</th>
                        <th className="px-2.5 py-2 text-right font-medium text-muted-foreground">Opening</th>
                        <th className="px-2.5 py-2 text-right font-medium text-muted-foreground">EMI</th>
                        <th className="px-2.5 py-2 text-right font-medium text-muted-foreground">Principal</th>
                        <th className="px-2.5 py-2 text-right font-medium text-muted-foreground">Interest</th>
                        <th className="px-2.5 py-2 text-right font-medium text-muted-foreground">Closing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map((row, i) => {
                        const isLast = i === schedule.length - 1
                        return (
                          <tr key={row.month} className={`border-t border-border/40 transition-colors ${
                            isLast ? "bg-primary/5 font-semibold" : i % 2 === 0 ? "bg-background" : "bg-muted/20"
                          }`}>
                            <td className="px-2.5 py-1.5 tabular-nums text-muted-foreground">{row.month}</td>
                            <td className="px-2.5 py-1.5 text-right tabular-nums">${fmt(row.openingBalance)}</td>
                            <td className="px-2.5 py-1.5 text-right tabular-nums text-green-600 dark:text-green-400">${fmt(row.emi)}</td>
                            <td className="px-2.5 py-1.5 text-right tabular-nums">${fmt(row.principal)}</td>
                            <td className="px-2.5 py-1.5 text-right tabular-nums text-red-600 dark:text-red-400">${fmt(row.interest)}</td>
                            <td className="px-2.5 py-1.5 text-right tabular-nums font-medium">${fmt(row.closingBalance)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {tab === "graph" && (
                <Card className="border">
                  <CardContent className="p-4">
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-primary, #8b5cf6)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--color-primary, #8b5cf6)" stopOpacity={0.02} />
                          </linearGradient>
                          <linearGradient id="principalGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                          </linearGradient>
                          <linearGradient id="interestGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e5e7eb)" opacity={0.5} />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} label={{ value: "Months", position: "insideBottomRight", offset: -5, style: { fontSize: 11, fill: "var(--color-muted-foreground)" } }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${fmtCompact(v)}`} tickLine={false} axisLine={false} width={70} />
                        <Tooltip
                          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--color-border)" }}
                          formatter={(value) => [typeof value === "number" ? `$${fmt(value)}` : String(value), ""]}
                          labelFormatter={(label) => `Month ${label}`}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value: string) => {
                            const labels: Record<string, string> = { balance: "Remaining Balance", cumulativePrincipal: "Principal Paid", cumulativeInterest: "Interest Paid" }
                            return <span style={{ fontSize: 11 }}>{labels[value] || value}</span>
                          }}
                        />
                        <Area type="monotone" dataKey="balance" stroke="var(--color-primary, #8b5cf6)" strokeWidth={2} fill="url(#balanceGrad)" name="balance" />
                        <Area type="monotone" dataKey="cumulativePrincipal" stroke="#22c55e" strokeWidth={1.5} fill="url(#principalGrad)" name="cumulativePrincipal" opacity={0.7} />
                        <Area type="monotone" dataKey="cumulativeInterest" stroke="#ef4444" strokeWidth={1.5} fill="url(#interestGrad)" name="cumulativeInterest" opacity={0.7} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              <Button variant="outline" size="sm" className="w-full" onClick={downloadPDF}>
                <FileDown className="h-4 w-4 mr-1.5" /> Download Report (PDF)
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 shrink-0" />
              <span>Enter a loan amount, interest rate, and term to see your payment breakdown.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

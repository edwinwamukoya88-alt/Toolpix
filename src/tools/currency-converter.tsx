"use client"

import { CalculatorHeader, CalculatorCard, NumberInput, ResultCard, ActionBar, InfoBox } from "@/components/calculator/index"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeftRight, ChevronDown, Search, Copy, Clock, DollarSign, AlertCircle, Star } from "lucide-react"
import { useState, useRef, useEffect, useMemo } from "react"
import { toast } from "sonner"

const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł" },
]

const RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  KES: 129.5,
  NGN: 1550,
  ZAR: 18.45,
  INR: 83.1,
  AED: 3.67,
  JPY: 149.5,
  CNY: 7.24,
  CAD: 1.36,
  AUD: 1.53,
  BRL: 4.97,
  KRW: 1320,
  CHF: 0.88,
  SEK: 10.45,
  NOK: 10.62,
  DKK: 6.89,
  MXN: 17.12,
  SGD: 1.34,
  HKD: 7.82,
  TRY: 30.5,
  RUB: 92.3,
  PLN: 4.02,
}

const POPULAR_CODES = ["USD", "EUR", "GBP", "KES", "NGN"]
const HISTORY_KEY = "currency-converter-history"

function formatNumber(n: number): string {
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + "B"
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + "M"
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface HistoryItem {
  from: string
  to: string
  amount: number
  result: number
  timestamp: number
}

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(items: HistoryItem[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items))
  } catch {}
}

export default function CurrencyConverter() {
  const [from, setFrom] = useState("USD")
  const [to, setTo] = useState("KES")
  const [amount, setAmount] = useState("100")
  const [fromOpen, setFromOpen] = useState(false)
  const [toOpen, setToOpen] = useState(false)
  const [fromSearch, setFromSearch] = useState("")
  const [toSearch, setToSearch] = useState("")
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory())

  const fromRef = useRef<HTMLDivElement>(null)
  const toRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) setFromOpen(false)
      if (toRef.current && !toRef.current.contains(e.target as Node)) setToOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fromRate = RATES[from]
  const toRate = RATES[to]
  const numAmount = parseFloat(amount)

  const result = !isNaN(numAmount) && numAmount > 0 && fromRate != null && toRate != null
    ? (numAmount / fromRate) * toRate
    : null

  const filteredFrom = useMemo(
    () => CURRENCIES.filter((c) => c.code.includes(fromSearch.toUpperCase()) || c.name.toLowerCase().includes(fromSearch.toLowerCase())),
    [fromSearch],
  )

  const filteredTo = useMemo(
    () => CURRENCIES.filter((c) => c.code.includes(toSearch.toUpperCase()) || c.name.toLowerCase().includes(toSearch.toLowerCase())),
    [toSearch],
  )

  function swap() {
    setFrom(to)
    setTo(from)
  }

  function selectFrom(currency: string) {
    setFrom(currency)
    setFromOpen(false)
    setFromSearch("")
  }

  function selectTo(currency: string) {
    setTo(currency)
    setToOpen(false)
    setToSearch("")
  }

  function addToHistory() {
    if (result == null) return
    const item: HistoryItem = { from, to, amount: numAmount, result, timestamp: Date.now() }
    const next = [item, ...history.filter((h) => !(h.from === from && h.to === to && h.amount === numAmount))].slice(0, 10)
    setHistory(next)
    saveHistory(next)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (result != null) addToHistory()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  function copyResult() {
    if (result == null) return
    const text = `${formatNumber(numAmount)} ${from} = ${formatNumber(result)} ${to}`
    navigator.clipboard.writeText(text).then(() => toast.success("Result copied"))
  }

  function formatTimestamp(ts: number) {
    const d = new Date(ts)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHrs = Math.floor(diffMins / 60)
    if (diffHrs < 24) return `${diffHrs}h ago`
    return d.toLocaleDateString()
  }

  const fromCurrency = CURRENCIES.find((c) => c.code === from)
  const toCurrency = CURRENCIES.find((c) => c.code === to)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CalculatorHeader title="Currency Converter" description="Convert between global currencies" />

      <CalculatorCard>
        <NumberInput
          label="Amount"
          value={amount}
          onChange={setAmount}
          placeholder="Enter amount"
          icon={<DollarSign className="h-3.5 w-3.5" />}
        />

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px] space-y-1.5" ref={fromRef}>
            <label className="text-xs font-medium text-muted-foreground">From</label>
            <div className="relative">
              <button
                onClick={() => { setFromOpen((o) => !o); setToOpen(false); setFromSearch("") }}
                className="flex items-center justify-between w-full h-11 rounded-lg border border-input bg-background px-3 text-sm hover:bg-accent transition-colors"
              >
                <span className="font-medium">{from}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              {fromOpen && (
                <div className="absolute z-10 top-full mt-1 left-0 right-0 rounded-lg border bg-popover shadow-lg">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        autoFocus
                        value={fromSearch}
                        onChange={(e) => setFromSearch(e.target.value)}
                        placeholder="Search currencies..."
                        className="w-full h-9 rounded-md border border-input bg-transparent pl-8 pr-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                  <div className="max-h-52 overflow-y-auto">
                    {filteredFrom.length === 0 && (
                      <p className="p-3 text-sm text-muted-foreground text-center">No currencies found</p>
                    )}
                    {filteredFrom.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => selectFrom(c.code)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-accent transition-colors ${
                          from === c.code ? "bg-primary/10 font-medium" : ""
                        }`}
                      >
                        <span className="font-semibold w-10 tabular-nums">{c.code}</span>
                        <span className="text-muted-foreground truncate flex-1">{c.name}</span>
                        <span className="text-xs text-muted-foreground">{c.symbol}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="shrink-0 mb-0.5 rounded-full h-9 w-9"
            onClick={swap}
            title="Swap currencies"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>

          <div className="flex-1 min-w-[140px] space-y-1.5" ref={toRef}>
            <label className="text-xs font-medium text-muted-foreground">To</label>
            <div className="relative">
              <button
                onClick={() => { setToOpen((o) => !o); setFromOpen(false); setToSearch("") }}
                className="flex items-center justify-between w-full h-11 rounded-lg border border-input bg-background px-3 text-sm hover:bg-accent transition-colors"
              >
                <span className="font-medium">{to}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              {toOpen && (
                <div className="absolute z-10 top-full mt-1 left-0 right-0 rounded-lg border bg-popover shadow-lg">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        autoFocus
                        value={toSearch}
                        onChange={(e) => setToSearch(e.target.value)}
                        placeholder="Search currencies..."
                        className="w-full h-9 rounded-md border border-input bg-transparent pl-8 pr-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                  <div className="max-h-52 overflow-y-auto">
                    {filteredTo.length === 0 && (
                      <p className="p-3 text-sm text-muted-foreground text-center">No currencies found</p>
                    )}
                    {filteredTo.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => selectTo(c.code)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-accent transition-colors ${
                          to === c.code ? "bg-primary/10 font-medium" : ""
                        }`}
                      >
                        <span className="font-semibold w-10 tabular-nums">{c.code}</span>
                        <span className="text-muted-foreground truncate flex-1">{c.name}</span>
                        <span className="text-xs text-muted-foreground">{c.symbol}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {POPULAR_CODES.map((code) => {
            const c = CURRENCIES.find((x) => x.code === code)
            if (!c) return null
            const isFrom = from === code
            const isTo = to === code
            return (
              <Button
                key={code}
                variant={isFrom || isTo ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (isFrom) { setTo(code); return }
                  setFrom(code)
                }}
                className="gap-1 h-8 text-xs"
              >
                {c.symbol} {code}
              </Button>
            )
          })}
        </div>

        {result != null && (
          <div className="space-y-3">
            <ResultCard
              label={`${from} to ${to}`}
              value={`${formatNumber(result)} ${to}`}
              accent="blue"
              icon={<DollarSign className="h-4 w-4" />}
              subtitle={`1 ${from} = ${formatNumber((1 / fromRate!) * toRate!)} ${to}`}
            />
            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={copyResult} className="gap-1.5">
                <Copy className="h-3.5 w-3.5" /> Copy Result
              </Button>
            </div>
          </div>
        )}

        {isNaN(numAmount) && amount && (
          <InfoBox variant="error">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Please enter a valid amount</span>
          </InfoBox>
        )}
      </CalculatorCard>

      {history.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Conversion History</span>
              <span className="text-xs text-muted-foreground/60">(last 10)</span>
            </div>
            <div className="space-y-1">
              {history.slice(0, 10).map((item, i) => (
                <button
                  key={i}
                  onClick={() => { setFrom(item.from); setTo(item.to); setAmount(String(item.amount)) }}
                  className="w-full flex items-center justify-between rounded-lg border border-transparent px-3 py-2 text-sm hover:bg-accent hover:border-border transition-colors text-left"
                >
                  <span className="tabular-nums font-medium">
                    {formatNumber(item.amount)} {item.from}
                  </span>
                  <span className="text-muted-foreground mx-2">→</span>
                  <span className="tabular-nums font-medium flex-1">
                    {formatNumber(item.result)} {item.to}
                  </span>
                  <span className="text-[10px] text-muted-foreground/50 shrink-0 ml-2">
                    {formatTimestamp(item.timestamp)}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Rates are static examples. Real-time rates require an API connection.
      </p>
    </div>
  )
}

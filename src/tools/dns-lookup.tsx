"use client"

import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Copy, Download, AlertCircle, Server, Check } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type RecordType = "A" | "AAAA" | "MX" | "TXT" | "NS" | "CNAME" | "SOA" | "PTR"

const RECORD_TYPES: RecordType[] = ["A", "AAAA", "MX", "TXT", "NS", "CNAME", "SOA", "PTR"]

interface DNSAnswer {
  name: string
  type: number
  TTL: number
  data: string
}

interface DNSResult {
  Status: number
  TC: boolean
  RD: boolean
  RA: boolean
  AD: boolean
  CD: boolean
  Question: { name: string; type: number }[]
  Answer?: DNSAnswer[]
  Authority?: DNSAnswer[]
  Additional?: DNSAnswer[]
  Comment?: string
  Error?: string
}

const TYPE_MAP: Record<number, string> = {
  1: "A",
  28: "AAAA",
  15: "MX",
  16: "TXT",
  2: "NS",
  5: "CNAME",
  6: "SOA",
  12: "PTR",
}

function formatData(type: RecordType, data: string): string {
  if (type === "MX") {
    const [pref, ...rest] = data.split(" ")
    return `${rest.join(" ")} (Priority: ${pref})`
  }
  if (type === "SOA") {
    return data.replace(/\\n/g, " ")
  }
  return data
}

function formatTTL(ttl: number): string {
  if (ttl >= 86400) return `${Math.round(ttl / 86400)}d`
  if (ttl >= 3600) return `${Math.round(ttl / 3600)}h`
  if (ttl >= 60) return `${Math.round(ttl / 60)}m`
  return `${ttl}s`
}

function exportJSON(results: DNSResult[], domain: string): string {
  return JSON.stringify({ domain, results, timestamp: new Date().toISOString() }, null, 2)
}

export default function DNSLookup() {
  const [domain, setDomain] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<RecordType[]>(["A", "AAAA", "MX"])
  const [results, setResults] = useState<DNSResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const toggleType = useCallback((type: RecordType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }, [])

  const lookup = useCallback(async () => {
    const q = domain.trim()
    if (!q) {
      setError("Please enter a domain name")
      return
    }
    if (selectedTypes.length === 0) {
      setError("Select at least one record type")
      return
    }

    setLoading(true)
    setError("")
    setResults([])

    try {
      const res = await fetch(
        `/api/dns-lookup?name=${encodeURIComponent(q)}&types=${selectedTypes.join(",")}`,
        { signal: AbortSignal.timeout(15000) }
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "DNS lookup failed")
      }
      const data: DNSResult[] = await res.json()
      setResults(data)
      const hasErrors = data.some((r) => r.Status !== 0 && r.Status !== 3)
      if (hasErrors) {
        setError("Some record types returned errors")
      }
    } catch (e) {
      setError((e as Error).message || "DNS lookup failed")
    } finally {
      setLoading(false)
    }
  }, [domain, selectedTypes])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    lookup()
  }, [lookup])

  const exportResults = useCallback(() => {
    const json = exportJSON(results, domain)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dns-${domain}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("JSON exported")
  }, [results, domain])

  const copyAll = useCallback(() => {
    const text = results
      .flatMap((r) =>
        (r.Answer || []).map((a) => `${TYPE_MAP[r.Question[0]?.type] || "?"} ${a.name} → ${a.data}`)
      )
      .join("\n")
    if (!text) {
      toast.error("Nothing to copy")
      return
    }
    navigator.clipboard.writeText(text).then(() => toast.success("Results copied"))
  }, [results])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">DNS Lookup</h2>
        <p className="text-sm text-muted-foreground">Look up DNS records for any domain</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="pl-9 h-11"
              />
            </div>
            <Button type="submit" disabled={loading || !domain.trim()} className="h-11 px-5 gap-2">
              {loading ? (
                <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Lookup
            </Button>
          </form>

          <div className="flex flex-wrap gap-2">
            {RECORD_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                  selectedTypes.includes(type)
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "hover:bg-accent"
                )}
              >
                {selectedTypes.includes(type) && <Check className="h-3 w-3" />}
                {type}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="p-5 space-y-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {results.length > 0 && !loading && (
        <>
          {results.map((result, idx) => {
            const type = TYPE_MAP[result.Question[0]?.type] || "?"
            const answers = result.Answer || []
            return (
              <Card key={idx}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Server className="h-4 w-4 text-primary" />
                    <span className="text-primary">{type} Records</span>
                    <span className="text-xs text-muted-foreground">({answers.length} records)</span>
                  </div>
                  {answers.length === 0 && (
                    <p className="text-sm text-muted-foreground py-2">No {type} records found</p>
                  )}
                  {answers.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-muted-foreground border-b">
                            <th className="text-left py-2 pr-3 font-medium">Name</th>
                            <th className="text-left px-2 font-medium">Value</th>
                            <th className="text-right pl-2 font-medium">TTL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {answers.map((a, i) => (
                            <tr key={i} className="border-b border-muted/30">
                              <td className="py-2 pr-3 text-muted-foreground max-w-[120px] truncate">{a.name}</td>
                              <td className="py-2 px-2 font-medium max-w-[280px] truncate">
                                {formatData(type as RecordType, a.data)}
                              </td>
                              <td className="py-2 pl-2 text-right text-muted-foreground tabular-nums">
                                {formatTTL(a.TTL)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {result.Comment && (
                    <p className="text-xs text-muted-foreground italic">{result.Comment}</p>
                  )}
                </CardContent>
              </Card>
            )
          })}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" size="sm" onClick={copyAll} className="gap-1.5">
              <Copy className="h-3.5 w-3.5" /> Copy Results
            </Button>
            <Button variant="outline" size="sm" onClick={exportResults} className="gap-1.5">
              <Download className="h-3.5 w-3.5" /> Export JSON
            </Button>
          </div>
        </>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Powered by Google DNS-over-HTTPS via server proxy.
      </p>
    </div>
  )
}

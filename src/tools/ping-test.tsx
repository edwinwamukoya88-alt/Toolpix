"use client"

import { useState, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Download, Activity, Minus, AlertCircle, Clock } from "lucide-react"
import { toast } from "sonner"

interface PingResult {
  seq: number
  time: number
  success: boolean
}

interface PingStats {
  target: string
  results: PingResult[]
  avg: number
  min: number
  max: number
  packetLoss: number
  sent: number
  received: number
}

const DEFAULT_TARGETS = [
  "google.com",
  "cloudflare.com",
  "github.com",
]

async function pingTarget(target: string, seq: number, timeout = 8000): Promise<PingResult> {
  const start = performance.now()
  try {
    await fetch(`/api/ping?target=${encodeURIComponent(target)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(timeout),
    })
    const end = performance.now()
    return { seq, time: Math.round(end - start), success: true }
  } catch {
    return { seq, time: timeout, success: false }
  }
}

function exportCSV(stats: PingStats): string {
  const header = "Seq,Time (ms),Success"
  const rows = stats.results.map(
    (r) => `${r.seq},${r.time},${r.success ? "Yes" : "No"}`
  )
  const summary = `\n\nSummary\nAvg,${stats.avg} ms\nMin,${stats.min} ms\nMax,${stats.max} ms\nPacket Loss,${stats.packetLoss}%\nSent,${stats.sent}\nReceived,${stats.received}`
  return [header, ...rows, summary].join("\n")
}

export default function PingTest() {
  const [target, setTarget] = useState("google.com")
  const [count, setCount] = useState("5")
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stats, setStats] = useState<PingStats | null>(null)
  const [error, setError] = useState("")
  const resultsRef = useRef<PingResult[]>([])
  const abortRef = useRef<AbortController | null>(null)

  const runTest = useCallback(async () => {
    const host = target.trim()
    if (!host) {
      setError("Please enter a domain or IP address")
      return
    }
    const numCount = parseInt(count) || 5
    if (numCount < 1 || numCount > 100) {
      setError("Count must be between 1 and 100")
      return
    }

    setRunning(true)
    setProgress(0)
    setError("")
    setStats(null)
    resultsRef.current = []

    const abortCtrl = new AbortController()
    abortRef.current = abortCtrl
    const received: PingResult[] = []

    for (let i = 0; i < numCount; i++) {
      if (abortCtrl.signal.aborted) break
      const result = await pingTarget(host, i + 1)
      received.push(result)
      resultsRef.current = received
      setProgress(Math.round(((i + 1) / numCount) * 100))
    }

    if (!abortCtrl.signal.aborted) {
      const times = received.filter((r) => r.success).map((r) => r.time)
      const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0
      const min = times.length > 0 ? Math.min(...times) : 0
      const max = times.length > 0 ? Math.max(...times) : 0
      const packetLoss = numCount > 0 ? Math.round(((numCount - received.filter((r) => r.success).length) / numCount) * 100) : 0
      const successful = received.filter((r) => r.success).length

      setStats({
        target: host,
        results: received,
        avg,
        min,
        max,
        packetLoss,
        sent: numCount,
        received: successful,
      })
    }
    setRunning(false)
    abortRef.current = null
  }, [target, count])

  const exportResults = useCallback(() => {
    if (!stats) return
    const csv = exportCSV(stats)
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ping-${stats.target}-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("CSV exported")
  }, [stats])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Ping Test</h2>
        <p className="text-sm text-muted-foreground">Measure network latency and packet loss to any host</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Host</label>
              <Input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="google.com"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Requests</label>
              <Input
                type="number"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                min="1"
                max="100"
                className="h-11"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_TARGETS.map((t) => (
              <button
                key={t}
                onClick={() => setTarget(t)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                  target === t
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "hover:bg-accent"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <Button
            onClick={runTest}
            disabled={running}
            className="w-full gap-2 h-11"
          >
            {running ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                Testing... {progress}%
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> Start Ping Test
              </>
            )}
          </Button>

          {running && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Sending packets...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted-foreground/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="rounded-xl border p-4 text-center space-y-1">
              <Clock className="h-4 w-4 mx-auto text-blue-400" />
              <div className="text-lg font-bold tabular-nums">{stats.avg} <span className="text-xs font-normal text-muted-foreground">ms</span></div>
              <p className="text-xs text-muted-foreground">Average</p>
            </div>
            <div className="rounded-xl border p-4 text-center space-y-1">
              <Minus className="h-4 w-4 mx-auto text-green-400" />
              <div className="text-lg font-bold tabular-nums">{stats.min} <span className="text-xs font-normal text-muted-foreground">ms</span></div>
              <p className="text-xs text-muted-foreground">Minimum</p>
            </div>
            <div className="rounded-xl border p-4 text-center space-y-1">
              <Activity className="h-4 w-4 mx-auto text-amber-400" />
              <div className="text-lg font-bold tabular-nums">{stats.max} <span className="text-xs font-normal text-muted-foreground">ms</span></div>
              <p className="text-xs text-muted-foreground">Maximum</p>
            </div>
            <div className="rounded-xl border p-4 text-center space-y-1">
              <Download className="h-4 w-4 mx-auto text-purple-400" />
              <div className="text-lg font-bold tabular-nums">{stats.packetLoss} <span className="text-xs font-normal text-muted-foreground">%</span></div>
              <p className="text-xs text-muted-foreground">Packet Loss</p>
            </div>
            <div className="rounded-xl border p-4 text-center space-y-1 col-span-2 sm:col-span-1">
              <Activity className="h-4 w-4 mx-auto text-muted-foreground" />
              <div className="text-lg font-bold tabular-nums">{stats.received}/{stats.sent}</div>
              <p className="text-xs text-muted-foreground">Packets</p>
            </div>
          </div>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  <span>Results</span>
                </div>
                <Button variant="outline" size="sm" onClick={exportResults} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted-foreground border-b">
                      <th className="text-left py-2 pr-3 font-medium">#</th>
                      <th className="text-right px-2 font-medium">Time</th>
                      <th className="text-right pl-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.results.map((r) => (
                      <tr key={r.seq} className="border-b border-muted/30">
                        <td className="py-2 pr-3 text-muted-foreground">{r.seq}</td>
                        <td className={`text-right px-2 tabular-nums ${r.success ? "" : "text-destructive"}`}>
                          {r.success ? `${r.time} ms` : "Timeout"}
                        </td>
                        <td className={`text-right pl-2 ${r.success ? "text-green-500" : "text-destructive"}`}>
                          {r.success ? "✓" : "✗"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Measures round-trip time via server proxy. Results include both client-server and server-target latency.
      </p>
    </div>
  )
}

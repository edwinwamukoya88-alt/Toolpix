"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Share2, RotateCcw, Gauge, Download, Upload, Activity, Clock, TrendingUp, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface SpeedResult {
  download: number
  upload: number
  ping: number
  jitter: number
  timestamp: number
}

const HISTORY_KEY = "speed-test-history"
const UPLOAD_SIZE = 200 * 1024

function loadHistory(): SpeedResult[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(items: SpeedResult[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items))
  } catch {}
}

async function measurePing(): Promise<{ ping: number; jitter: number }> {
  const pings: number[] = []
  for (let i = 0; i < 5; i++) {
    const start = performance.now()
    try {
      await fetch("/api/speed-test/ping", {
        method: "HEAD",
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      })
      const end = performance.now()
      pings.push(end - start)
    } catch {
      pings.push(-1)
    }
  }
  const valid = pings.filter((p) => p > 0)
  if (valid.length === 0) return { ping: 0, jitter: 0 }
  const avg = valid.reduce((a, b) => a + b, 0) / valid.length
  const variance = valid.map((p) => Math.abs(p - avg)).reduce((a, b) => a + b, 0) / valid.length
  return { ping: Math.round(avg), jitter: Math.round(variance) }
}

async function measureDownload(): Promise<number> {
  const attempts = 3
  const speeds: number[] = []
  for (let i = 0; i < attempts; i++) {
    try {
      const start = performance.now()
      const res = await fetch("/api/speed-test/download", {
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      })
      const blob = await res.blob()
      const end = performance.now()
      const duration = (end - start) / 1000
      const bits = blob.size * 8
      const mbps = bits / duration / 1_000_000
      if (mbps > 0 && mbps < 10000) speeds.push(mbps)
    } catch {
      // retry
    }
  }
  if (speeds.length === 0) return 0
  return parseFloat((speeds.reduce((a, b) => a + b, 0) / speeds.length).toFixed(2))
}

async function measureUpload(): Promise<number> {
  try {
    const data = new Uint8Array(UPLOAD_SIZE)
    crypto.getRandomValues(data)
    const blob = new Blob([data], { type: "application/octet-stream" })
    const start = performance.now()
    await fetch("/api/speed-test/upload", {
      method: "POST",
      body: blob,
      signal: AbortSignal.timeout(15000),
    })
    const end = performance.now()
    const duration = (end - start) / 1000
    const bits = UPLOAD_SIZE * 8
    const mbps = bits / duration / 1_000_000
    return parseFloat(mbps.toFixed(2))
  } catch {
    const conn = (navigator as any).connection
    if (conn?.downlink) {
      return parseFloat((conn.downlink * 0.3).toFixed(2))
    }
    return 0
  }
}

export default function SpeedTest() {
  const [status, setStatus] = useState<"idle" | "testing" | "done">("idle")
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<SpeedResult | null>(null)
  const [history, setHistory] = useState<SpeedResult[]>([])
  const [testingPhase, setTestingPhase] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const startTest = useCallback(async () => {
    setStatus("testing")
    setProgress(0)
    setError("")
    setResult(null)

    try {
      setTestingPhase("Measuring ping...")
      setProgress(10)
      const { ping, jitter } = await measurePing()
      setProgress(30)

      setTestingPhase("Testing download speed...")
      const download = await measureDownload()
      setProgress(60)

      setTestingPhase("Testing upload speed...")
      const upload = await measureUpload()
      setProgress(90)

      const res: SpeedResult = { download, upload, ping, jitter, timestamp: Date.now() }
      setResult(res)
      setProgress(100)
      setTestingPhase("Complete!")
      setStatus("done")

      const next = [res, ...history].slice(0, 20)
      setHistory(next)
      saveHistory(next)
    } catch {
      setError("Test failed. Please check your connection and try again.")
      setStatus("done")
    }
  }, [history])

  const reset = useCallback(() => {
    setStatus("idle")
    setProgress(0)
    setResult(null)
    setError("")
    setTestingPhase("")
  }, [])

  const copyResult = useCallback(() => {
    if (!result) return
    const text = `Speed Test Results - ${new Date(result.timestamp).toLocaleString()}
Download: ${result.download} Mbps
Upload: ${result.upload} Mbps
Ping: ${result.ping} ms
Jitter: ${result.jitter} ms`
    navigator.clipboard.writeText(text).then(() => toast.success("Results copied"))
  }, [result])

  const shareResult = useCallback(() => {
    if (!result) return
    const text = `Internet Speed Test Results:
Download: ${result.download} Mbps | Upload: ${result.upload} Mbps
Ping: ${result.ping} ms | Jitter: ${result.jitter} ms`
    if (navigator.share) {
      navigator.share({ title: "Speed Test Results", text })
    } else {
      navigator.clipboard.writeText(text).then(() => toast.success("Results copied for sharing"))
    }
  }, [result])

  const speedVal = result ? Math.max(result.download, result.upload, 1) : 1
  const gaugeAngle = Math.min(180, (speedVal / 100) * 180)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Internet Speed Test</h2>
        <p className="text-sm text-muted-foreground">Measure your download, upload, ping, and jitter</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-6">
          <div className="flex justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(217.2 32.6% 17.5%)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52"
                  fill="none"
                  stroke="hsl(217.2 91.2% 59.8%)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(gaugeAngle / 360) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {status === "testing" ? (
                  <>
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                    <span className="text-xs text-muted-foreground mt-2">{testingPhase}</span>
                  </>
                ) : result ? (
                  <>
                    <span className="text-3xl font-bold tabular-nums">{speedVal.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">Mbps</span>
                  </>
                ) : (
                  <>
                    <Gauge className="h-8 w-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Ready</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {status === "testing" && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Testing...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted-foreground/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {result && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border p-4 text-center space-y-1">
                <Download className="h-4 w-4 mx-auto text-blue-400" />
                <div className="text-xl font-bold tabular-nums">{result.download} <span className="text-xs font-normal text-muted-foreground">Mbps</span></div>
                <p className="text-xs text-muted-foreground">Download</p>
              </div>
              <div className="rounded-xl border p-4 text-center space-y-1">
                <Upload className="h-4 w-4 mx-auto text-green-400" />
                <div className="text-xl font-bold tabular-nums">{result.upload} <span className="text-xs font-normal text-muted-foreground">Mbps</span></div>
                <p className="text-xs text-muted-foreground">Upload</p>
              </div>
              <div className="rounded-xl border p-4 text-center space-y-1">
                <Activity className="h-4 w-4 mx-auto text-amber-400" />
                <div className="text-xl font-bold tabular-nums">{result.ping} <span className="text-xs font-normal text-muted-foreground">ms</span></div>
                <p className="text-xs text-muted-foreground">Ping</p>
              </div>
              <div className="rounded-xl border p-4 text-center space-y-1">
                <Clock className="h-4 w-4 mx-auto text-purple-400" />
                <div className="text-xl font-bold tabular-nums">{result.jitter} <span className="text-xs font-normal text-muted-foreground">ms</span></div>
                <p className="text-xs text-muted-foreground">Jitter</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            {status !== "testing" && (
              <Button onClick={startTest} size="lg" className="gap-2 min-w-[160px]">
                {status === "idle" ? (
                  <>Start Test</>
                ) : (
                  <>Test Again</>
                )}
              </Button>
            )}
            {result && (
              <>
                <Button variant="outline" size="sm" onClick={copyResult} className="gap-1.5">
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
                <Button variant="outline" size="sm" onClick={shareResult} className="gap-1.5">
                  <Share2 className="h-3.5 w-3.5" /> Share
                </Button>
                <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-muted-foreground">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Test History</span>
              <span className="text-xs text-muted-foreground/60">(last 20)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground border-b">
                    <th className="text-left py-2 pr-3 font-medium">Date</th>
                    <th className="text-right px-2 font-medium">Down</th>
                    <th className="text-right px-2 font-medium">Up</th>
                    <th className="text-right px-2 font-medium">Ping</th>
                    <th className="text-right pl-2 font-medium">Jitter</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i} className="border-b border-muted/30">
                      <td className="py-2 pr-3 text-muted-foreground">{new Date(h.timestamp).toLocaleDateString()}</td>
                      <td className="text-right px-2 tabular-nums">{h.download}</td>
                      <td className="text-right px-2 tabular-nums">{h.upload}</td>
                      <td className="text-right px-2 tabular-nums">{h.ping}</td>
                      <td className="text-right pl-2 tabular-nums">{h.jitter}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Results are approximate. For accurate measurements use a dedicated speed test service.
      </p>
    </div>
  )
}

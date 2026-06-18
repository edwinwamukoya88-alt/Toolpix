"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Flag, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLocalStorage } from "@/hooks/use-local-storage"

export default function Stopwatch() {
  const [running, setRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [laps, setLaps] = useLocalStorage<number[]>("toolpix_laps", [])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => setTime((prev) => prev + 10), 10)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  function toggle() { setRunning(!running) }

  function reset() {
    setRunning(false)
    setTime(0)
    setLaps([])
  }

  function lap() {
    if (running) setLaps((prev) => [...prev, time])
  }

  function format(ms: number) {
    const mins = Math.floor(ms / 60000)
    const secs = Math.floor((ms % 60000) / 1000)
    const cent = Math.floor((ms % 1000) / 10)
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(cent).padStart(2, "0")}`
  }

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <Card>
        <CardContent className="p-8 text-center space-y-6">
          <div className="text-5xl font-bold tabular-nums tracking-wider font-mono">{format(time)}</div>
          <div className="flex justify-center gap-3">
            <Button onClick={toggle}>{running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Button>
            <Button variant="outline" onClick={lap} disabled={!running}><Flag className="h-4 w-4" /></Button>
            <Button variant="outline" onClick={reset}><RotateCcw className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      {laps.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-1 max-h-60 overflow-y-auto">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Laps</h4>
            {[...laps].reverse().map((l, i) => (
              <div key={i} className="flex justify-between text-sm font-mono py-1 border-b last:border-0">
                <span className="text-muted-foreground">Lap {laps.length - i}</span>
                <span>{format(l)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

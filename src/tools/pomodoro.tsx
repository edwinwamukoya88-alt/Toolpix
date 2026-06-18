"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function Pomodoro() {
  const [work, setWork] = useState(25)
  const [breakM, setBreakM] = useState(5)
  const [seconds, setSeconds] = useState(work * 60)
  const [phase, setPhase] = useState<"work" | "break">("work")
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          if (phase === "work") {
            setPhase("break")
            return breakM * 60
          } else {
            setPhase("work")
            return work * 60
          }
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, phase, work, breakM])

  function reset() {
    setRunning(false)
    setPhase("work")
    setSeconds(work * 60)
  }

  function toggle() {
    if (!running && seconds === work * 60 && phase === "work") {
      setSeconds(work * 60)
    }
    if (!running && seconds === breakM * 60 && phase === "break") {
      setSeconds(breakM * 60)
    }
    setRunning(!running)
  }

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const total = phase === "work" ? work * 60 : breakM * 60
  const pct = ((total - seconds) / total) * 100

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <Card>
        <CardContent className="p-8 text-center space-y-6">
          <div className="relative w-48 h-48 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--primary))" strokeWidth="6" strokeDasharray={`${pct * 2.827} 282.7`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold tabular-nums">{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
              <span className="text-sm text-muted-foreground capitalize mt-1">{phase}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <Button onClick={toggle}>{running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Button>
            <Button variant="outline" onClick={reset}><RotateCcw className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Work (min)</label>
          <Input type="number" value={work} onChange={(e) => { const v = Number(e.target.value); setWork(v); if (phase === "work" && !running) setSeconds(v * 60) }} min={1} max={120} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Break (min)</label>
          <Input type="number" value={breakM} onChange={(e) => { const v = Number(e.target.value); setBreakM(v); if (phase === "break" && !running) setSeconds(v * 60) }} min={1} max={60} />
        </div>
      </div>
    </div>
  )
}

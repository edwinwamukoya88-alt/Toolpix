"use client"

import { useState, useCallback } from "react"
import { Percent, Copy, Printer } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { trackToolUse } from "@/lib/analytics"

type CBCLevel = "EE" | "ME" | "AE" | "BE"

interface CBCBand {
  level: CBCLevel
  band: string
  min: number
  max: number
  points: number
  label: string
}

const cbcBands: CBCBand[] = [
  { level: "EE", band: "EE1", min: 90, max: 100, points: 8, label: "Exceeding Expectation" },
  { level: "EE", band: "EE2", min: 75, max: 89, points: 7, label: "Exceeding Expectation" },
  { level: "ME", band: "ME1", min: 58, max: 74, points: 6, label: "Meeting Expectation" },
  { level: "ME", band: "ME2", min: 41, max: 57, points: 5, label: "Meeting Expectation" },
  { level: "AE", band: "AE1", min: 31, max: 40, points: 4, label: "Approaching Expectation" },
  { level: "AE", band: "AE2", min: 21, max: 30, points: 3, label: "Approaching Expectation" },
  { level: "BE", band: "BE1", min: 11, max: 20, points: 2, label: "Below Expectation" },
  { level: "BE", band: "BE2", min: 1, max: 10, points: 1, label: "Below Expectation" },
]

const levelColors: Record<CBCLevel, string> = {
  EE: "text-green-500",
  ME: "text-blue-500",
  AE: "text-amber-500",
  BE: "text-red-500",
}

const levelBadgeColors: Record<CBCLevel, string> = {
  EE: "bg-green-500/10 border-green-500/30 text-green-500",
  ME: "bg-blue-500/10 border-blue-500/30 text-blue-500",
  AE: "bg-amber-500/10 border-amber-500/30 text-amber-500",
  BE: "bg-red-500/10 border-red-500/30 text-red-500",
}

const levelLabels: Record<CBCLevel, string> = {
  EE: "Exceeding Expectation",
  ME: "Meeting Expectation",
  AE: "Approaching Expectation",
  BE: "Below Expectation",
}

const referenceGroups: { level: CBCLevel; label: string }[] = [
  { level: "EE", label: "Exceeding Expectation" },
  { level: "ME", label: "Meeting Expectation" },
  { level: "AE", label: "Approaching Expectation" },
  { level: "BE", label: "Below Expectation" },
]

export default function CBCGradeCalculator() {
  const [obtained, setObtained] = useState("")
  const [total, setTotal] = useState("")

  const obtainedNum = Math.max(0, Number(obtained) || 0)
  const totalNum = Math.max(1, Number(total) || 1)
  const percentage = totalNum > 0 ? (obtainedNum / totalNum) * 100 : 0

  const sortedBands = [...cbcBands].sort((a, b) => b.min - a.min)
  const matchedBand = percentage >= 1 ? sortedBands.find((b) => percentage >= b.min) ?? null : null
  const isNA = percentage === 0 && total.length > 0

  const currentLevel = matchedBand?.level ?? null

  const handleCopy = useCallback(() => {
    if (isNA) {
      const text = [
        "CBC Assessment Result",
        "=".repeat(40),
        `Marks: ${obtainedNum} / ${totalNum}`,
        "Percentage: 0%",
        "Status: Not Assessed (NA)",
      ].join("\n")
      navigator.clipboard.writeText(text)
      trackToolUse("grade-calculator", "copy")
      toast.success("Result copied")
      return
    }
    if (!matchedBand) return
    const text = [
      "CBC Assessment Result",
      "=".repeat(40),
      `Competency Level: ${matchedBand.level}`,
      `Band: ${matchedBand.band}`,
      `Percentage: ${percentage.toFixed(1)}%`,
      `Points: ${matchedBand.points}`,
      `Category: ${matchedBand.label}`,
    ].join("\n")
    navigator.clipboard.writeText(text)
    trackToolUse("grade-calculator", "copy")
    toast.success("Result copied")
  }, [obtainedNum, totalNum, percentage, matchedBand, isNA])

  const handlePrint = useCallback(() => {
    trackToolUse("grade-calculator", "print")
    window.print()
  }, [])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">CBC Grade Calculator</h2>
        <p className="text-sm text-muted-foreground">
          Calculate competency levels per KICD guidelines (EE / ME / AE / BE)
        </p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Marks Obtained
              </label>
              <Input
                type="number"
                value={obtained}
                onChange={(e) => setObtained(e.target.value)}
                placeholder="e.g. 45"
                min="0"
                className="h-11 text-base tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Total Marks
              </label>
              <Input
                type="number"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="e.g. 60"
                min="1"
                className="h-11 text-base tabular-nums"
              />
            </div>
          </div>

          {obtained && total && (
            <>
              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card className="border shadow-sm">
                  <CardContent className="p-4 text-center space-y-1">
                    <div className="flex justify-center text-muted-foreground">
                      <Percent className="h-5 w-5" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-primary">
                      {percentage.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Percentage Score</p>
                  </CardContent>
                </Card>

                <Card
                  className={`border shadow-sm ${currentLevel ? levelColors[currentLevel] : "text-muted-foreground"}`}
                >
                  <CardContent className="p-4 text-center space-y-1">
                    <div
                      className={`flex justify-center text-lg font-bold ${currentLevel ? levelColors[currentLevel] : "text-muted-foreground"}`}
                    >
                      CBC
                    </div>
                    <div
                      className={`text-2xl sm:text-3xl font-bold tabular-nums tracking-tight ${currentLevel ? levelColors[currentLevel] : "text-muted-foreground"}`}
                    >
                      {isNA ? "NA" : currentLevel ?? "—"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {matchedBand
                        ? matchedBand.band
                        : isNA
                          ? "Not Assessed"
                          : "Competency Level"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardContent className="p-4 text-center space-y-1">
                    <div className="flex justify-center text-muted-foreground text-lg font-bold">
                      #
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-primary">
                      {isNA ? "—" : matchedBand ? `${matchedBand.points}` : "—"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isNA ? "Not Assessed" : matchedBand ? "Points" : ""}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {matchedBand && (
                <div className="rounded-lg border bg-muted/10 p-4 space-y-1.5">
                  <p className="text-sm font-semibold mb-2">
                    CBC Assessment Result
                  </p>
                  <div className="text-sm space-y-0.5">
                    <p>
                      Competency Level:{" "}
                      <span
                        className={`font-semibold ${levelColors[matchedBand.level]}`}
                      >
                        {matchedBand.level}
                      </span>
                    </p>
                    <p>
                      Band:{" "}
                      <span className="font-semibold">{matchedBand.band}</span>
                    </p>
                    <p>
                      Percentage:{" "}
                      <span className="font-semibold tabular-nums">
                        {percentage.toFixed(1)}%
                      </span>
                    </p>
                    <p>
                      Points:{" "}
                      <span className="font-semibold tabular-nums">
                        {matchedBand.points}
                      </span>
                    </p>
                    <p>
                      Category:{" "}
                      <span className="font-semibold">
                        {matchedBand.label}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {isNA && (
                <div className="rounded-lg border bg-muted/10 p-4 text-center">
                  <p className="text-sm font-semibold">Not Assessed (NA)</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    The learner has not been assessed for this competency.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!matchedBand && !isNA}
                >
                  <Copy className="h-3.5 w-3.5" /> Copy Result
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  disabled={!matchedBand && !isNA}
                >
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              KICD CBC Competency Scale Reference
            </p>
            <div className="space-y-3">
              {referenceGroups.map((group) => {
                const color = levelColors[group.level]
                const badgeColor = levelBadgeColors[group.level]
                const groupBands = cbcBands.filter(
                  (b) => b.level === group.level,
                )
                return (
                  <div key={group.level} className="rounded-lg border bg-muted/10 p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}
                      >
                        {group.level}
                      </span>
                      <span className={`text-sm font-bold ${color}`}>
                        {group.label}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {groupBands.map((band) => (
                        <div
                          key={band.band}
                          className="text-xs text-muted-foreground pl-3"
                        >
                          {band.band}: {band.min}–{band.max}% (
                          {band.points} {band.points === 1 ? "Point" : "Points"}
                          )
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

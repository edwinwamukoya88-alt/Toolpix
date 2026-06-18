"use client"

import { useState, useCallback } from "react"
import { Percent, Copy, Printer, Settings, RotateCcw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { trackToolUse } from "@/lib/analytics"

interface GradeScale {
  min: number
  grade: string
  remark: string
}

const defaultScale: GradeScale[] = [
  { min: 80, grade: "A", remark: "Excellent Performance" },
  { min: 70, grade: "B", remark: "Good Performance" },
  { min: 60, grade: "C", remark: "Satisfactory Performance" },
  { min: 50, grade: "D", remark: "Below Average" },
  { min: 0, grade: "E", remark: "Needs Improvement" },
]

const gradeColors: Record<string, string> = {
  A: "text-green-500",
  B: "text-blue-500",
  C: "text-amber-500",
  D: "text-orange-500",
  E: "text-red-500",
}

export default function GradeCalculator() {
  const [obtained, setObtained] = useState("")
  const [total, setTotal] = useState("")
  const [scale, setScale] = useState<GradeScale[]>(defaultScale)
  const [showScale, setShowScale] = useState(false)
  const [editMin, setEditMin] = useState("")
  const [editGrade, setEditGrade] = useState("")
  const [editRemark, setEditRemark] = useState("")
  const [editIndex, setEditIndex] = useState<number | null>(null)

  const obtainedNum = Math.max(0, Number(obtained) || 0)
  const totalNum = Math.max(1, Number(total) || 1)
  const percentage = totalNum > 0 ? (obtainedNum / totalNum) * 100 : 0

  const sorted = [...scale].sort((a, b) => b.min - a.min)
  const current = sorted.find((s) => percentage >= s.min) || scale[scale.length - 1]

  const handleCopy = useCallback(() => {
    const text = [
      `Marks: ${obtainedNum} / ${totalNum}`,
      `Percentage: ${percentage.toFixed(1)}%`,
      `Grade: ${current.grade}`,
      `Remark: ${current.remark}`,
    ].join("\n")
    navigator.clipboard.writeText(text)
    trackToolUse("grade-calculator", "copy")
    toast.success("Results copied")
  }, [obtainedNum, totalNum, percentage, current])

  const handlePrint = useCallback(() => {
    trackToolUse("grade-calculator", "print")
    window.print()
  }, [])

  const addScaleEntry = () => {
    const min = Number(editMin)
    if (isNaN(min) || !editGrade.trim() || !editRemark.trim()) return
    const updated = [...scale, { min, grade: editGrade.trim(), remark: editRemark.trim() }]
    setScale(updated)
    setEditMin("")
    setEditGrade("")
    setEditRemark("")
    setEditIndex(null)
    trackToolUse("grade-calculator", "custom-scale")
    toast.success("Grade scale entry added")
  }

  const removeScaleEntry = (index: number) => {
    setScale(scale.filter((_, i) => i !== index))
  }

  const resetScale = () => {
    setScale(defaultScale)
    toast.success("Scale reset to default")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Grade Calculator</h2>
        <p className="text-sm text-muted-foreground">Calculate scores, percentages, and performance levels</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Marks Obtained</label>
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
              <label className="text-xs font-medium text-muted-foreground">Total Marks</label>
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
                    <div className="flex justify-center text-muted-foreground"><Percent className="h-5 w-5" /></div>
                    <div className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-primary">
                      {percentage.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Percentage</p>
                  </CardContent>
                </Card>
                <Card className="border shadow-sm">
                  <CardContent className="p-4 text-center space-y-1">
                    <div className="flex justify-center text-muted-foreground">
                      <span className="text-lg font-bold">Grade</span>
                    </div>
                    <div className={`text-2xl sm:text-3xl font-bold tabular-nums tracking-tight ${gradeColors[current.grade] || "text-foreground"}`}>
                      {current.grade}
                    </div>
                    <p className="text-xs text-muted-foreground">Grade</p>
                  </CardContent>
                </Card>
                <Card className="border shadow-sm">
                  <CardContent className="p-4 text-center space-y-1">
                    <div className="flex justify-center text-muted-foreground">
                      <span className="text-lg font-bold">i</span>
                    </div>
                    <div className="text-sm sm:text-base font-semibold tabular-nums tracking-tight text-foreground">
                      {current.remark}
                    </div>
                    <p className="text-xs text-muted-foreground">Remarks</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-3.5 w-3.5" /> Copy Results
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowScale(!showScale)}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings className="h-3.5 w-3.5" />
                Custom Grading Scale
              </button>
              <Button variant="ghost" size="xs" onClick={resetScale}>
                <RotateCcw className="h-3 w-3" /> Reset
              </Button>
            </div>

            {showScale && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <Input
                    type="number"
                    value={editMin}
                    onChange={(e) => setEditMin(e.target.value)}
                    placeholder="Min %"
                    min="0"
                    max="100"
                    className="h-9 text-sm"
                  />
                  <Input
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value)}
                    placeholder="Grade"
                    className="h-9 text-sm"
                  />
                  <Input
                    value={editRemark}
                    onChange={(e) => setEditRemark(e.target.value)}
                    placeholder="Remark"
                    className="h-9 text-sm sm:col-span-1"
                  />
                  <Button size="sm" onClick={addScaleEntry}>Add</Button>
                </div>

                <div className="space-y-1">
                  {scale.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-1.5 text-sm">
                      <span className="text-muted-foreground">&ge;{entry.min}%</span>
                      <span className="font-semibold">{entry.grade}</span>
                      <span className="text-muted-foreground text-xs">{entry.remark}</span>
                      <button
                        onClick={() => removeScaleEntry(i)}
                        className="text-xs text-red-500 hover:text-red-400 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useCallback, useMemo } from "react"
import { CalendarDays, Copy, Printer, FileDown, Plus, Trash2, GripVertical } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { trackToolUse, trackDownload } from "@/lib/analytics"

interface SubjectEntry {
  name: string
  priority: number
  color: string
}

const subjectColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-indigo-500",
]

interface DaySchedule {
  day: string
  date: string
  subjects: { name: string; hours: number; color: string }[]
  totalHours: number
}

export default function RevisionPlanner() {
  const [studentName, setStudentName] = useState("")
  const [examDate, setExamDate] = useState("")
  const [dailyHours, setDailyHours] = useState("4")
  const [subjects, setSubjects] = useState<SubjectEntry[]>([
    { name: "", priority: 1, color: subjectColors[0] },
  ])
  const [plannerGenerated, setPlannerGenerated] = useState(false)

  const addSubject = () => {
    if (subjects.length >= 10) return
    setSubjects((prev) => [
      ...prev,
      { name: "", priority: prev.length + 1, color: subjectColors[prev.length % subjectColors.length] },
    ])
  }

  const removeSubject = (index: number) => {
    setSubjects((prev) => prev.filter((_, i) => i !== index))
  }

  const updateSubject = (index: number, key: keyof SubjectEntry, value: string | number) => {
    setSubjects((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [key]: value as never }
      return updated
    })
  }

  const daysUntilExam = useMemo(() => {
    if (!examDate) return 0
    const now = new Date()
    const exam = new Date(examDate)
    const diff = Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
  }, [examDate])

  const schedule = useMemo((): DaySchedule[] => {
    if (!plannerGenerated || !examDate || subjects.filter((s) => s.name).length === 0) return []

    const validSubjects = subjects.filter((s) => s.name.trim())
    const maxPriority = Math.max(...validSubjects.map((s) => s.priority), 1)
    const hoursPerDay = Math.max(1, Number(dailyHours) || 4)
    const totalDays = Math.min(daysUntilExam, 90)

    const days = Array.from({ length: totalDays }, (_, i) => {
    const date = new Date()
      date.setDate(date.getDate() + i)
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      return {
        day: dayNames[date.getDay()],
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        subjects: [] as { name: string; hours: number; color: string }[],
        totalHours: 0,
      }
    })

    days.forEach((day) => {
      const prioritySum = validSubjects.reduce((sum, s) => sum + s.priority, 0)
      let remaining = hoursPerDay

      validSubjects.forEach((subject) => {
        const share = (subject.priority / prioritySum) * hoursPerDay
        const hours = Math.round(share * 10) / 10
        if (hours > 0 && remaining > 0) {
          const actual = Math.min(hours, remaining)
          day.subjects.push({ name: subject.name, hours: actual, color: subject.color })
          remaining -= actual
        }
      })
      day.totalHours = day.subjects.reduce((sum, s) => sum + s.hours, 0)
    })

    return days
  }, [plannerGenerated, examDate, subjects, dailyHours, daysUntilExam])

  const generate = () => {
    if (!studentName.trim()) {
      toast.error("Please enter student name")
      return
    }
    if (!examDate) {
      toast.error("Please select an exam date")
      return
    }
    if (!subjects.some((s) => s.name.trim())) {
      toast.error("Please add at least one subject")
      return
    }
    setPlannerGenerated(true)
    trackToolUse("revision-planner", "generate")
    toast.success("Revision planner generated")
  }

  const handleCopy = useCallback(() => {
    const lines = [
      `REVISION PLANNER`,
      `Student: ${studentName}`,
      `Exam Date: ${examDate}`,
      `Days Remaining: ${daysUntilExam}`,
      `Daily Study Hours: ${dailyHours}`,
      "",
      ...schedule.map((day) => {
        const subjects = day.subjects.map((s) => `${s.name} (${s.hours}h)`).join(", ")
        return `${day.day} ${day.date}: ${subjects} | Total: ${day.totalHours}h`
      }),
    ]
    navigator.clipboard.writeText(lines.join("\n"))
    trackToolUse("revision-planner", "copy")
    toast.success("Planner copied")
  }, [studentName, examDate, daysUntilExam, dailyHours, schedule])

  const handlePrint = useCallback(() => {
    trackToolUse("revision-planner", "print")
    window.print()
  }, [])

  const handlePDF = useCallback(async () => {
    try {
      const { default: jsPDF } = await import("jspdf")
      await import("jspdf-autotable")
      const doc = new jsPDF()

      doc.setFontSize(16)
      doc.text("REVISION PLANNER", 20, 20)
      doc.setFontSize(11)
      doc.text(`Student: ${studentName}`, 20, 30)
      doc.text(`Exam Date: ${examDate}  |  Days Remaining: ${daysUntilExam}  |  Daily Hours: ${dailyHours}`, 20, 38)

      const rows = schedule.slice(0, 42).map((day) => [
        `${day.day}\n${day.date}`,
        day.subjects.map((s) => `${s.name} (${s.hours}h)`).join("\n"),
        `${day.totalHours}h`,
      ])

      ;(doc as any).autoTable({
        startY: 45,
        head: [["Day", "Subjects", "Hours"]],
        body: rows,
        styles: { fontSize: 7, cellPadding: 1.5 },
        headStyles: { fillColor: [59, 130, 246] },
      })

      doc.save("revision-planner.pdf")
      trackDownload("revision-planner", "pdf")
      toast.success("PDF downloaded")
    } catch {
      toast.error("Failed to generate PDF")
    }
  }, [studentName, examDate, daysUntilExam, dailyHours, schedule])

  const groupedWeeks = useMemo(() => {
    const weeks: DaySchedule[][] = []
    for (let i = 0; i < schedule.length; i += 7) {
      weeks.push(schedule.slice(i, i + 7))
    }
    return weeks
  }, [schedule])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Revision Planner</h2>
        <p className="text-sm text-muted-foreground">Create study schedules and exam preparation timetables</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Student Name</label>
              <Input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. John Doe"
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Exam Date</label>
              <Input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Daily Study Hours</label>
              <Input
                type="number"
                value={dailyHours}
                onChange={(e) => setDailyHours(e.target.value)}
                min="1"
                max="16"
                className="h-10 text-sm"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Subjects</label>
              <Button variant="ghost" size="xs" onClick={addSubject}>
                <Plus className="h-3 w-3" /> Add Subject
              </Button>
            </div>
            {subjects.map((subject, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full shrink-0 ${subject.color}`} />
                <Input
                  value={subject.name}
                  onChange={(e) => updateSubject(i, "name", e.target.value)}
                  placeholder={`Subject ${i + 1}`}
                  className="h-9 text-sm flex-1"
                />
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <span>Priority:</span>
                  <select
                    value={subject.priority}
                    onChange={(e) => updateSubject(i, "priority", Number(e.target.value))}
                    className="h-8 w-16 rounded-lg border border-input bg-transparent px-1.5 text-xs outline-none focus-visible:border-ring dark:bg-input/30"
                  >
                    {[1, 2, 3, 4, 5].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                {subjects.length > 1 && (
                  <button onClick={() => removeSubject(i)} className="text-red-500 hover:text-red-400 shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <Button onClick={generate} className="w-full">
            <CalendarDays className="h-4 w-4" /> Generate Revision Plan
          </Button>
        </CardContent>
      </Card>

      {plannerGenerated && schedule.length > 0 && (
        <Card className="border-primary/30">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Revision Schedule</h3>
                <p className="text-xs text-muted-foreground">
                  {studentName} &middot; {daysUntilExam} days until exam &middot; {dailyHours}h/day
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="xs" onClick={handleCopy}><Copy className="h-3.5 w-3.5" /> Copy</Button>
                <Button variant="outline" size="xs" onClick={handlePDF}><FileDown className="h-3.5 w-3.5" /> PDF</Button>
                <Button variant="outline" size="xs" onClick={handlePrint}><Printer className="h-3.5 w-3.5" /> Print</Button>
              </div>
            </div>

            <Separator />

            <div className="text-sm font-medium text-muted-foreground">
              Revision Summary: {subjects.filter(s => s.name).map(s => `${s.name} (Priority ${s.priority})`).join(", ") || "—"}
            </div>

            <div className="space-y-6">
              {groupedWeeks.map((week, wi) => (
                <div key={wi}>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">Week {wi + 1}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
                    {week.map((day, di) => (
                      <Card key={di} className={`border ${day.day === "Sunday" ? "border-muted" : ""}`}>
                        <CardContent className="p-2.5 space-y-1">
                          <div className="text-[10px] font-semibold text-muted-foreground">{day.day}</div>
                          <div className="text-[10px] text-muted-foreground/70">{day.date}</div>
                          {day.subjects.map((sub, si) => (
                            <div key={si} className="flex items-center gap-1 text-[10px]">
                              <div className={`h-1.5 w-1.5 rounded-full ${sub.color}`} />
                              <span className="truncate flex-1">{sub.name}</span>
                              <span className="font-mono text-muted-foreground">{sub.hours}h</span>
                            </div>
                          ))}
                          <div className="text-[10px] font-medium text-right pt-1 border-t border-border/30">
                            Total: {day.totalHours}h
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

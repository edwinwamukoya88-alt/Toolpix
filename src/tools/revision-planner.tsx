"use client"

import { useState, useCallback, useMemo } from "react"
import { CalendarDays, Copy, Printer, FileDown, Plus, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { trackToolUse, trackDownload } from "@/lib/analytics"

const skillBanks: Record<string, string[]> = {
  "Communication": [
    "Practice presenting findings to a family member",
    "Write a short paragraph about a topic studied",
    "Role-play a conversation using new vocabulary",
    "Record yourself explaining a concept",
    "Design a poster to share what you learned",
    "Prepare a 2-minute talk on a topic of interest",
    "Write a simple report on a practical activity",
    "Discuss a real-life problem and suggest solutions",
  ],
  "Critical Thinking": [
    "Sort objects by size, colour, and shape",
    "Find three different ways to solve a problem",
    "Observe an experiment and record changes",
    "Compare two different items and list differences",
    "Identify patterns in your environment",
    "Solve a puzzle using logical reasoning",
    "Make a prediction and test it with an activity",
    "Categorise items based on their properties",
  ],
  "Creativity": [
    "Draw or model something related to the topic",
    "Build a simple prototype using household items",
    "Create a song or poem about what you learned",
    "Design a solution to a common problem",
    "Make a collage using recycled materials",
    "Invent a new use for an everyday object",
    "Create a mind map connecting ideas",
    "Compose a short story based on a theme",
  ],
  "Collaboration": [
    "Work with a partner to complete a task",
    "Practice taking turns during group activities",
    "Help a classmate who is struggling with a concept",
    "Participate in a group discussion and share ideas",
    "Complete a group project with assigned roles",
    "Practice active listening during peer presentations",
    "Give constructive feedback to a partner",
    "Collaborate on solving a community problem",
  ],
  "Digital Literacy": [
    "Use a tablet or computer to research a topic",
    "Practice typing a short paragraph",
    "Create a simple digital drawing or design",
    "Use an educational app to practice skills",
    "Watch an educational video and summarise it",
    "Navigate a website safely with guidance",
    "Use a calculator to check math work",
    "Take a photo of your project and describe it",
  ],
  "Self-Efficacy": [
    "Set a personal learning goal for the week",
    "Reflect on one thing you learned well today",
    "Try a challenging task without giving up",
    "Celebrate a small achievement with a positive note",
    "Practice a skill until you feel confident",
    "Ask for help when you need it",
    "Complete a task independently from start to finish",
    "Write one thing you will improve tomorrow",
  ],
}

const projectIdeas = [
  "Design a simple water harvesting system using local materials.",
  "Create a weather chart and record daily observations for one week.",
  "Plant seeds and observe germination and growth over 14 days.",
  "Interview a community member about a local tradition.",
  "Build a model of a healthy meal using the food groups.",
  "Create a family tree showing three generations.",
  "Design a poster promoting environmental conservation.",
  "Make a simple musical instrument from recycled materials.",
  "Create a budget for a small family event.",
  "Map the route from home to school, noting landmarks.",
  "Conduct a simple survey and present findings in a chart.",
  "Create a diary of a plant or animal in the local environment.",
]

interface SubjectEntry {
  name: string
  color: string
}

const subjectColors = [
  "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500",
  "bg-rose-500", "bg-cyan-500", "bg-emerald-500", "bg-orange-500",
  "bg-pink-500", "bg-indigo-500",
]

interface WeekPlan {
  weekLabel: string
  days: {
    label: string
    activities: string[]
    project: string
  }[]
  focusSkill: string
}

export default function CBCRevisionPlanner() {
  const [studentName, setStudentName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [weeks, setWeeks] = useState("4")
  const [subjects, setSubjects] = useState<SubjectEntry[]>([
    { name: "", color: subjectColors[0] },
  ])
  const [plannerGenerated, setPlannerGenerated] = useState(false)

  const numWeeks = Math.max(1, Math.min(12, Number(weeks) || 4))

  const addSubject = () => {
    if (subjects.length >= 8) return
    setSubjects((prev) => [...prev, { name: "", color: subjectColors[prev.length % subjectColors.length] }])
  }

  const removeSubject = (index: number) => {
    setSubjects((prev) => prev.filter((_, i) => i !== index))
  }

  const updateSubject = (index: number, value: string) => {
    setSubjects((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], name: value }
      return updated
    })
  }

  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
  const pickN = (arr: string[], n: number) => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, n)
  }

  const weekPlan = useMemo((): WeekPlan[] => {
    if (!plannerGenerated) return []

    const skillKeys = Object.keys(skillBanks)
    const weekNames = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8", "Week 9", "Week 10", "Week 11", "Week 12"]
    const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

    return Array.from({ length: numWeeks }, (_, wi) => {
      const skill = skillKeys[wi % skillKeys.length]
      const activities = pickN(skillBanks[skill] || skillBanks["Critical Thinking"], 5)
      const project = pick(projectIdeas)

      return {
        weekLabel: weekNames[wi] || `Week ${wi + 1}`,
        days: dayLabels.map((d, di) => ({
          label: d,
          activities: [activities[di % activities.length]],
          project: di === 4 ? project : "",
        })),
        focusSkill: skill,
      }
    })
  }, [plannerGenerated, numWeeks])

  const generate = () => {
    if (!studentName.trim()) {
      toast.error("Please enter learner name")
      return
    }
    if (!startDate) {
      toast.error("Please select a start date")
      return
    }
    setPlannerGenerated(true)
    trackToolUse("revision-planner", "generate")
    toast.success("CBC competency planner generated")
  }

  const handleCopy = useCallback(() => {
    const lines = [
      "CBC COMPETENCY REINFORCEMENT PLANNER",
      "=".repeat(50),
      `Learner: ${studentName}`,
      `Start Date: ${startDate}`,
      `Duration: ${numWeeks} weeks`,
      "",
      ...weekPlan.flatMap((week) => [
        `--- ${week.weekLabel} | Focus: ${week.focusSkill} ---`,
        ...week.days.flatMap((day) => [
          `  ${day.label}:`,
          ...day.activities.map((a) => `    • ${a}`),
          ...(day.project ? [`    ⭐ Project: ${day.project}`] : []),
        ]),
        "",
      ]),
    ]
    navigator.clipboard.writeText(lines.join("\n"))
    trackToolUse("revision-planner", "copy")
    toast.success("Planner copied")
  }, [studentName, startDate, numWeeks, weekPlan])

  const handlePrint = useCallback(() => {
    trackToolUse("revision-planner", "print")
    window.print()
  }, [])

  const handlePDF = useCallback(async () => {
    try {
      const { default: jsPDF } = await import("jspdf")
      const doc = new jsPDF()
      let y = 20
      const margin = 20
      const lineHeight = 6

      doc.setFontSize(14)
      doc.text("CBC COMPETENCY REINFORCEMENT PLANNER", margin, y)
      y += 9
      doc.setFontSize(10)
      doc.text(`Learner: ${studentName}  |  Start: ${startDate}  |  Duration: ${numWeeks} weeks`, margin, y)
      y += 10

      weekPlan.forEach((week) => {
        if (y > 260) { doc.addPage(); y = 20 }
        doc.setFontSize(11)
        doc.setFont("helvetica", "bold")
        doc.text(`${week.weekLabel} — Focus Skill: ${week.focusSkill}`, margin, y)
        y += 7
        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)

        week.days.forEach((day) => {
          if (y > 270) { doc.addPage(); y = 20 }
          doc.setFont("helvetica", "bold")
          doc.text(day.label, margin, y)
          y += 5
          doc.setFont("helvetica", "normal")
          day.activities.forEach((a) => {
            const lines = doc.splitTextToSize(`   • ${a}`, 170)
            lines.forEach((l: string) => {
              if (y > 275) { doc.addPage(); y = 20 }
              doc.text(l, margin, y)
              y += lineHeight
            })
          })
          if (day.project) {
            if (y > 270) { doc.addPage(); y = 20 }
            doc.text(`   ⭐ Project: ${day.project}`, margin, y)
            y += lineHeight + 1
          }
          y += 2
        })
        y += 4
      })

      doc.save("cbc-competency-planner.pdf")
      trackDownload("revision-planner", "pdf")
      toast.success("PDF downloaded")
    } catch {
      toast.error("Failed to generate PDF")
    }
  }, [studentName, startDate, numWeeks, weekPlan])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">CBC Revision Planner</h2>
        <p className="text-sm text-muted-foreground">Plan skill-based practice, projects, and weekly competency reinforcement activities</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Learner Name</label>
              <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="e.g. John Kamau" className="h-10 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Start Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-10 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Duration (weeks)</label>
              <Input type="number" value={weeks} onChange={(e) => setWeeks(e.target.value)} min="1" max="12" className="h-10 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Learning Areas</label>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={addSubject} className="flex-1 h-10 text-xs">
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {subjects.map((subject, i) => (
              <div key={i} className="flex items-center gap-1.5 rounded-lg border bg-muted/10 px-2 py-1">
                <div className={`h-2.5 w-2.5 rounded-full ${subject.color}`} />
                <Input
                  value={subject.name}
                  onChange={(e) => updateSubject(i, e.target.value)}
                  placeholder={`Area ${i + 1}`}
                  className="h-7 w-28 text-xs"
                />
                {subjects.length > 1 && (
                  <button onClick={() => removeSubject(i)} className="text-red-500 hover:text-red-400">
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <Button onClick={generate} className="w-full">
            <CalendarDays className="h-4 w-4" /> Generate Competency Planner
          </Button>
        </CardContent>
      </Card>

      {plannerGenerated && weekPlan.length > 0 && (
        <Card className="border-primary/30">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Competency Reinforcement Planner</h3>
                <p className="text-xs text-muted-foreground">
                  {studentName} &middot; Starts {startDate} &middot; {numWeeks} weeks
                  {subjects.filter(s => s.name).length > 0 && ` &middot; ${subjects.filter(s => s.name).map(s => s.name).join(", ")}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="xs" onClick={handleCopy}><Copy className="h-3.5 w-3.5" /> Copy</Button>
                <Button variant="outline" size="xs" onClick={handlePDF}><FileDown className="h-3.5 w-3.5" /> PDF</Button>
                <Button variant="outline" size="xs" onClick={handlePrint}><Printer className="h-3.5 w-3.5" /> Print</Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-6">
              {weekPlan.map((week, wi) => (
                <div key={wi}>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-semibold">{week.weekLabel}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] text-primary font-medium">
                      Focus: {week.focusSkill}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {week.days.map((day, di) => (
                      <Card key={di} className="border">
                        <CardContent className="p-2.5 space-y-1">
                          <div className="text-[10px] font-semibold text-muted-foreground">{day.label}</div>
                          {day.activities.map((a, ai) => (
                            <div key={ai} className="text-[10px] leading-relaxed text-muted-foreground">
                              • {a}
                            </div>
                          ))}
                          {day.project && (
                            <div className="text-[10px] leading-relaxed text-amber-500 dark:text-amber-400 font-medium mt-1 pt-1 border-t border-border/30">
                              ⭐ {day.project}
                            </div>
                          )}
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

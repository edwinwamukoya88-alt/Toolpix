"use client"

import { useState, useCallback } from "react"
import { BookOpen, Copy, Printer, FileDown, Plus, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { trackToolUse, trackDownload } from "@/lib/analytics"

interface LessonPlan {
  grade: string
  subject: string
  strand: string
  subStrand: string
  outcomes: string[]
  inquiryQuestions: string[]
  learningExperiences: string[]
  resources: string[]
  assessmentMethods: string[]
  duration: string
}

const emptyPlan: LessonPlan = {
  grade: "",
  subject: "",
  strand: "",
  subStrand: "",
  outcomes: [""],
  inquiryQuestions: [""],
  learningExperiences: [""],
  resources: [""],
  assessmentMethods: [""],
  duration: "40",
}

export default function LessonPlanGenerator() {
  const [plan, setPlan] = useState<LessonPlan>({ ...emptyPlan })
  const [generated, setGenerated] = useState(false)

  const update = <K extends keyof LessonPlan>(key: K, value: LessonPlan[K]) =>
    setPlan((prev) => ({ ...prev, [key]: value }))

  const addItem = (key: "outcomes" | "inquiryQuestions" | "learningExperiences" | "resources" | "assessmentMethods") =>
    setPlan((prev) => ({ ...prev, [key]: [...prev[key], ""] }))

  const removeItem = (key: "outcomes" | "inquiryQuestions" | "learningExperiences" | "resources" | "assessmentMethods", index: number) =>
    setPlan((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }))

  const updateItem = (key: "outcomes" | "inquiryQuestions" | "learningExperiences" | "resources" | "assessmentMethods", index: number, value: string) =>
    setPlan((prev) => {
      const arr = [...prev[key]]
      arr[index] = value
      return { ...prev, [key]: arr }
    })

  const generate = () => {
    if (!plan.grade || !plan.subject || !plan.strand) {
      toast.error("Please fill in Grade, Subject, and Strand")
      return
    }
    setGenerated(true)
    trackToolUse("lesson-plan-generator", "generate")
    toast.success("Lesson plan generated")
  }

  const handleCopy = useCallback(() => {
    const lines = [
      "LESSON PLAN",
      "=".repeat(40),
      `Grade: ${plan.grade}`,
      `Subject: ${plan.subject}`,
      `Strand: ${plan.strand}`,
      `Sub-Strand: ${plan.subStrand}`,
      `Duration: ${plan.duration} minutes`,
      "",
      "Learning Outcomes:",
      ...plan.outcomes.filter(Boolean).map((o) => `  • ${o}`),
      "",
      "Key Inquiry Questions:",
      ...plan.inquiryQuestions.filter(Boolean).map((q) => `  • ${q}`),
      "",
      "Learning Experiences:",
      ...plan.learningExperiences.filter(Boolean).map((e) => `  • ${e}`),
      "",
      "Resources:",
      ...plan.resources.filter(Boolean).map((r) => `  • ${r}`),
      "",
      "Assessment Methods:",
      ...plan.assessmentMethods.filter(Boolean).map((a) => `  • ${a}`),
    ]
    navigator.clipboard.writeText(lines.join("\n"))
    trackToolUse("lesson-plan-generator", "copy")
    toast.success("Lesson plan copied")
  }, [plan])

  const handlePrint = useCallback(() => {
    trackToolUse("lesson-plan-generator", "print")
    window.print()
  }, [])

  const handlePDF = useCallback(async () => {
    try {
      const { default: jsPDF } = await import("jspdf")
      const doc = new jsPDF()
      let y = 20
      const lineHeight = 7
      const margin = 20
      const pageWidth = doc.internal.pageSize.getWidth()
      const maxWidth = pageWidth - margin * 2

      doc.setFontSize(16)
      doc.text("LESSON PLAN", margin, y)
      y += 10
      doc.setFontSize(11)

      const field = (label: string, value: string) => {
        doc.setFont("helvetica", "bold")
        doc.text(`${label}: `, margin, y)
        doc.setFont("helvetica", "normal")
        const valX = margin + doc.getTextWidth(`${label}: `)
        doc.text(value, valX, y)
        y += lineHeight
      }

      field("Grade", plan.grade)
      field("Subject", plan.subject)
      field("Strand", plan.strand)
      field("Sub-Strand", plan.subStrand || "—")
      field("Duration", `${plan.duration} minutes`)

      const listSection = (title: string, items: string[]) => {
        if (y > 260) { doc.addPage(); y = 20 }
        doc.setFont("helvetica", "bold")
        doc.text(title, margin, y)
        y += lineHeight
        doc.setFont("helvetica", "normal")
        items.filter(Boolean).forEach((item) => {
          if (y > 270) { doc.addPage(); y = 20 }
          const lines = doc.splitTextToSize(`  • ${item}`, maxWidth)
          lines.forEach((l: string) => {
            if (y > 270) { doc.addPage(); y = 20 }
            doc.text(l, margin, y)
            y += lineHeight
          })
        })
        y += 3
      }

      listSection("Learning Outcomes", plan.outcomes)
      listSection("Key Inquiry Questions", plan.inquiryQuestions)
      listSection("Learning Experiences", plan.learningExperiences)
      listSection("Resources", plan.resources)
      listSection("Assessment Methods", plan.assessmentMethods)

      doc.save("lesson-plan.pdf")
      trackDownload("lesson-plan-generator", "pdf")
      toast.success("PDF downloaded")
    } catch {
      toast.error("Failed to generate PDF")
    }
  }, [plan])

  const fields = [
    { key: "grade" as const, label: "Grade", placeholder: "e.g. Grade 4" },
    { key: "subject" as const, label: "Subject", placeholder: "e.g. Mathematics" },
    { key: "strand" as const, label: "Strand", placeholder: "e.g. Numbers" },
    { key: "subStrand" as const, label: "Sub-Strand", placeholder: "e.g. Place Value" },
    { key: "duration" as const, label: "Lesson Duration (minutes)", placeholder: "40" },
  ]

  const listFields: { key: "outcomes" | "inquiryQuestions" | "learningExperiences" | "resources" | "assessmentMethods"; label: string; addLabel: string }[] = [
    { key: "outcomes", label: "Learning Outcomes", addLabel: "Add Outcome" },
    { key: "inquiryQuestions", label: "Key Inquiry Questions", addLabel: "Add Question" },
    { key: "learningExperiences", label: "Learning Experiences", addLabel: "Add Experience" },
    { key: "resources", label: "Resources", addLabel: "Add Resource" },
    { key: "assessmentMethods", label: "Assessment Methods", addLabel: "Add Method" },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Lesson Plan Generator</h2>
        <p className="text-sm text-muted-foreground">Generate structured CBC lesson plans using predefined templates</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                <Input
                  value={plan[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="h-10 text-sm"
                />
              </div>
            ))}
          </div>

          <Separator />

          {listFields.map((lf) => (
            <div key={lf.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">{lf.label}</label>
                <Button variant="ghost" size="xs" onClick={() => addItem(lf.key)}>
                  <Plus className="h-3 w-3" /> {lf.addLabel}
                </Button>
              </div>
              {plan[lf.key].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateItem(lf.key, i, e.target.value)}
                    placeholder={`${lf.label} ${i + 1}`}
                    className="h-9 text-sm flex-1"
                  />
                  {plan[lf.key].length > 1 && (
                    <button
                      onClick={() => removeItem(lf.key, i)}
                      className="text-red-500 hover:text-red-400 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}

          <Separator />

          <Button onClick={generate} className="w-full">
            <BookOpen className="h-4 w-4" /> Generate Lesson Plan
          </Button>
        </CardContent>
      </Card>

      {generated && (
        <Card className="border-primary/30">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Generated Lesson Plan</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="xs" onClick={handleCopy}>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
                <Button variant="outline" size="xs" onClick={handlePDF}>
                  <FileDown className="h-3.5 w-3.5" /> PDF
                </Button>
                <Button variant="outline" size="xs" onClick={handlePrint}>
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/20 p-4 text-sm space-y-3 font-mono">
              <div><span className="font-semibold">Grade:</span> {plan.grade}</div>
              <div><span className="font-semibold">Subject:</span> {plan.subject}</div>
              <div><span className="font-semibold">Strand:</span> {plan.strand}</div>
              <div><span className="font-semibold">Sub-Strand:</span> {plan.subStrand || "—"}</div>
              <div><span className="font-semibold">Duration:</span> {plan.duration} minutes</div>

              <Separator />

              {listFields.map((lf) => {
                const items = plan[lf.key].filter(Boolean)
                if (items.length === 0) return null
                return (
                  <div key={lf.key}>
                    <p className="font-semibold mb-1">{lf.label}:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                      {items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

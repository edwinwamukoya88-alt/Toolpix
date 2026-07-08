"use client"

import { useState, useCallback } from "react"
import { ClipboardList, Copy, Printer, FileDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { trackToolUse, trackDownload } from "@/lib/analytics"

interface WeekEntry {
  week: number
  strand: string
  subStrand: string
  outcomes: string
  inquiryQuestions: string
  activities: string
  assessment: string
  competencies: string
}

interface SchemeData {
  grade: string
  learningArea: string
  term: string
  year: string
  totalWeeks: number
  entries: WeekEntry[]
}

const terms = ["Term 1", "Term 2", "Term 3"]
const defaultWeeks = 12

export default function CBCSchemeOfWorkGenerator() {
  const [data, setData] = useState<SchemeData>({
    grade: "",
    learningArea: "",
    term: "Term 1",
    year: new Date().getFullYear().toString(),
    totalWeeks: defaultWeeks,
    entries: Array.from({ length: defaultWeeks }, (_, i) => ({
      week: i + 1,
      strand: "",
      subStrand: "",
      outcomes: "",
      inquiryQuestions: "",
      activities: "",
      assessment: "",
      competencies: "",
    })),
  })
  const [generated, setGenerated] = useState(false)

  const updateMeta = (key: "grade" | "learningArea" | "term" | "year" | "totalWeeks", value: string | number) => {
    setData((prev) => {
      const updated = { ...prev, [key]: value }
      if (key === "totalWeeks") {
        const n = Math.max(1, Math.min(28, Number(value) || 1))
        const entries: WeekEntry[] = Array.from({ length: n }, (_, i) => ({
          week: i + 1,
          strand: prev.entries[i]?.strand || "",
          subStrand: prev.entries[i]?.subStrand || "",
          outcomes: prev.entries[i]?.outcomes || "",
          inquiryQuestions: prev.entries[i]?.inquiryQuestions || "",
          activities: prev.entries[i]?.activities || "",
          assessment: prev.entries[i]?.assessment || "",
          competencies: prev.entries[i]?.competencies || "",
        }))
        return { ...updated, totalWeeks: n, entries }
      }
      return updated
    })
  }

  const updateEntry = (index: number, key: keyof WeekEntry, value: string) => {
    setData((prev) => {
      const entries = [...prev.entries]
      entries[index] = { ...entries[index], [key]: value }
      return { ...prev, entries }
    })
  }

  const generate = () => {
    if (!data.grade || !data.learningArea) {
      toast.error("Please fill in Grade and Learning Area")
      return
    }
    setGenerated(true)
    trackToolUse("scheme-of-work-generator", "generate")
    toast.success("KICD scheme of work generated")
  }

  const handleCopy = useCallback(() => {
    const lines = [
      "KICD SCHEME OF WORK",
      "=".repeat(50),
      `Grade: ${data.grade}`,
      `Learning Area: ${data.learningArea}`,
      `Term: ${data.term} ${data.year}`,
      `Total Weeks: ${data.totalWeeks}`,
      "",
      "Wk | Strand | Sub-Strand | Outcomes | Inquiry Questions | Activities | Assessment | Competencies",
      "-".repeat(100),
      ...data.entries.map(
        (e) => `${e.week} | ${e.strand} | ${e.subStrand} | ${e.outcomes} | ${e.inquiryQuestions} | ${e.activities} | ${e.assessment} | ${e.competencies}`
      ),
    ]
    navigator.clipboard.writeText(lines.join("\n"))
    trackToolUse("scheme-of-work-generator", "copy")
    toast.success("Scheme copied")
  }, [data])

  const handlePrint = useCallback(() => {
    trackToolUse("scheme-of-work-generator", "print")
    window.print()
  }, [])

  const handlePDF = useCallback(async () => {
    try {
      const { default: jsPDF } = await import("jspdf")
      await import("jspdf-autotable")
      const doc = new jsPDF()

      doc.setFontSize(14)
      doc.text("KICD SCHEME OF WORK", 20, 20)
      doc.setFontSize(9)
      doc.text(`Grade: ${data.grade}    Learning Area: ${data.learningArea}    Term: ${data.term} ${data.year}`, 20, 28)

      const rows = data.entries.map((e) => [
        String(e.week), e.strand, e.subStrand, e.outcomes,
        e.inquiryQuestions, e.activities, e.assessment, e.competencies,
      ])

      ;(doc as any).autoTable({
        startY: 34,
        head: [["Wk", "Strand", "Sub-Strand", "Learning Outcomes", "Inquiry Questions", "Activities", "Assessment", "Competencies"]],
        body: rows,
        styles: { fontSize: 6, cellPadding: 1 },
        headStyles: { fillColor: [59, 130, 246], fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 28 },
          2: { cellWidth: 24 },
          3: { cellWidth: 30 },
          4: { cellWidth: 28 },
          5: { cellWidth: 28 },
          6: { cellWidth: 24 },
          7: { cellWidth: 28 },
        },
      })

      doc.save("cbc-scheme-of-work.pdf")
      trackDownload("scheme-of-work-generator", "pdf")
      toast.success("PDF downloaded")
    } catch {
      toast.error("Failed to generate PDF")
    }
  }, [data])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">CBC Scheme of Work Generator</h2>
        <p className="text-sm text-muted-foreground">Create KICD schemes of work with inquiry questions and competency integration</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Grade</label>
              <Input value={data.grade} onChange={(e) => updateMeta("grade", e.target.value)} placeholder="e.g. Grade 4" className="h-10 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Learning Area</label>
              <Input value={data.learningArea} onChange={(e) => updateMeta("learningArea", e.target.value)} placeholder="e.g. Mathematics" className="h-10 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Term</label>
              <select value={data.term} onChange={(e) => updateMeta("term", e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                {terms.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Year</label>
              <Input value={data.year} onChange={(e) => updateMeta("year", e.target.value)} placeholder="2026" className="h-10 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Weeks</label>
              <Input type="number" value={data.totalWeeks} onChange={(e) => updateMeta("totalWeeks", e.target.value)} min="1" max="28" className="h-10 text-sm" />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Weekly Entries</label>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b text-[10px] text-muted-foreground">
                    <th className="px-1.5 py-1 text-left w-8">Wk</th>
                    <th className="px-1.5 py-1 text-left">Strand</th>
                    <th className="px-1.5 py-1 text-left">Sub-Strand</th>
                    <th className="px-1.5 py-1 text-left">Learning Outcomes</th>
                    <th className="px-1.5 py-1 text-left">Inquiry Questions</th>
                    <th className="px-1.5 py-1 text-left">Learning Activities</th>
                    <th className="px-1.5 py-1 text-left">Assessment</th>
                    <th className="px-1.5 py-1 text-left">Competencies</th>
                  </tr>
                </thead>
                <tbody>
                  {data.entries.map((entry, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-1.5 py-1 text-muted-foreground font-mono text-[10px]">{entry.week}</td>
                      <td className="px-1.5 py-1"><Input value={entry.strand} onChange={(e) => updateEntry(i, "strand", e.target.value)} className="h-7 text-[10px]" /></td>
                      <td className="px-1.5 py-1"><Input value={entry.subStrand} onChange={(e) => updateEntry(i, "subStrand", e.target.value)} className="h-7 text-[10px]" /></td>
                      <td className="px-1.5 py-1"><Input value={entry.outcomes} onChange={(e) => updateEntry(i, "outcomes", e.target.value)} className="h-7 text-[10px]" /></td>
                      <td className="px-1.5 py-1"><Input value={entry.inquiryQuestions} onChange={(e) => updateEntry(i, "inquiryQuestions", e.target.value)} className="h-7 text-[10px]" /></td>
                      <td className="px-1.5 py-1"><Input value={entry.activities} onChange={(e) => updateEntry(i, "activities", e.target.value)} className="h-7 text-[10px]" /></td>
                      <td className="px-1.5 py-1"><Input value={entry.assessment} onChange={(e) => updateEntry(i, "assessment", e.target.value)} className="h-7 text-[10px]" /></td>
                      <td className="px-1.5 py-1"><Input value={entry.competencies} onChange={(e) => updateEntry(i, "competencies", e.target.value)} className="h-7 text-[10px]" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Button onClick={generate} className="w-full">
            <ClipboardList className="h-4 w-4" /> Generate KICD Scheme of Work
          </Button>
        </CardContent>
      </Card>

      {!generated ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted/30 p-4 mb-4">
            <ClipboardList className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No scheme generated yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1.5 max-w-[280px]">
            Fill in the details above and click Generate to create a KICD scheme of work
          </p>
        </div>
      ) : (
        <Card className="border-primary/30">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Generated KICD Scheme of Work</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="xs" onClick={handleCopy}><Copy className="h-3.5 w-3.5" /> Copy</Button>
                <Button variant="outline" size="xs" onClick={handlePDF}><FileDown className="h-3.5 w-3.5" /> PDF</Button>
                <Button variant="outline" size="xs" onClick={handlePrint}><Printer className="h-3.5 w-3.5" /> Print</Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-xs border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-muted/30 border-b text-[10px] text-muted-foreground">
                    <th className="px-2 py-1.5 text-left">Wk</th>
                    <th className="px-2 py-1.5 text-left">Strand</th>
                    <th className="px-2 py-1.5 text-left">Sub-Strand</th>
                    <th className="px-2 py-1.5 text-left">Learning Outcomes</th>
                    <th className="px-2 py-1.5 text-left">Inquiry Questions</th>
                    <th className="px-2 py-1.5 text-left">Activities</th>
                    <th className="px-2 py-1.5 text-left">Assessment</th>
                    <th className="px-2 py-1.5 text-left">Competencies</th>
                  </tr>
                </thead>
                <tbody>
                  {data.entries.map((entry, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/10">
                      <td className="px-2 py-1.5 font-mono text-muted-foreground">{entry.week}</td>
                      <td className="px-2 py-1.5">{entry.strand || "—"}</td>
                      <td className="px-2 py-1.5">{entry.subStrand || "—"}</td>
                      <td className="px-2 py-1.5 max-w-[160px]">{entry.outcomes || "—"}</td>
                      <td className="px-2 py-1.5 max-w-[140px]">{entry.inquiryQuestions || "—"}</td>
                      <td className="px-2 py-1.5 max-w-[140px]">{entry.activities || "—"}</td>
                      <td className="px-2 py-1.5 max-w-[120px]">{entry.assessment || "—"}</td>
                      <td className="px-2 py-1.5 max-w-[120px]">{entry.competencies || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

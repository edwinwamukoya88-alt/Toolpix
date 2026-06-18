"use client"

import { useState, useCallback } from "react"
import { ClipboardList, Copy, Printer, FileDown, Plus, Trash2 } from "lucide-react"
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
  activities: string
  resources: string
  assessment: string
}

interface SchemeData {
  grade: string
  subject: string
  term: string
  totalWeeks: number
  entries: WeekEntry[]
}

const terms = ["Term 1", "Term 2", "Term 3"]
const defaultWeeks = 12

export default function SchemeOfWorkGenerator() {
  const [data, setData] = useState<SchemeData>({
    grade: "",
    subject: "",
    term: "Term 1",
    totalWeeks: defaultWeeks,
    entries: Array.from({ length: defaultWeeks }, (_, i) => ({
      week: i + 1,
      strand: "",
      subStrand: "",
      outcomes: "",
      activities: "",
      resources: "",
      assessment: "",
    })),
  })
  const [generated, setGenerated] = useState(false)

  const updateMeta = (key: "grade" | "subject" | "term" | "totalWeeks", value: string | number) => {
    setData((prev) => {
      const updated = { ...prev, [key]: value }
      if (key === "totalWeeks") {
        const n = Math.max(1, Math.min(20, Number(value) || 1))
        const entries: WeekEntry[] = Array.from({ length: n }, (_, i) => ({
          week: i + 1,
          strand: prev.entries[i]?.strand || "",
          subStrand: prev.entries[i]?.subStrand || "",
          outcomes: prev.entries[i]?.outcomes || "",
          activities: prev.entries[i]?.activities || "",
          resources: prev.entries[i]?.resources || "",
          assessment: prev.entries[i]?.assessment || "",
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
    if (!data.grade || !data.subject) {
      toast.error("Please fill in Grade and Subject")
      return
    }
    setGenerated(true)
    trackToolUse("scheme-of-work-generator", "generate")
    toast.success("Scheme of work generated")
  }

  const handleCopy = useCallback(() => {
    const lines = [
      "SCHEME OF WORK",
      "=".repeat(40),
      `Grade: ${data.grade}`,
      `Subject: ${data.subject}`,
      `Term: ${data.term}`,
      `Total Weeks: ${data.totalWeeks}`,
      "",
      "Week | Strand | Sub-Strand | Outcomes | Activities | Resources | Assessment",
      "-".repeat(80),
      ...data.entries.map(
        (e) => `${e.week} | ${e.strand} | ${e.subStrand} | ${e.outcomes} | ${e.activities} | ${e.resources} | ${e.assessment}`
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

      doc.setFontSize(16)
      doc.text("SCHEME OF WORK", 20, 20)
      doc.setFontSize(11)
      doc.text(`Grade: ${data.grade}    Subject: ${data.subject}    Term: ${data.term}`, 20, 30)

      const rows = data.entries.map((e) => [
        String(e.week),
        e.strand,
        e.subStrand,
        e.outcomes,
        e.activities,
        e.resources,
        e.assessment,
      ])

      ;(doc as any).autoTable({
        startY: 38,
        head: [["Week", "Strand", "Sub-Strand", "Outcomes", "Activities", "Resources", "Assessment"]],
        body: rows,
        styles: { fontSize: 7, cellPadding: 1.5 },
        headStyles: { fillColor: [59, 130, 246] },
      })

      doc.save("scheme-of-work.pdf")
      trackDownload("scheme-of-work-generator", "pdf")
      toast.success("PDF downloaded")
    } catch {
      toast.error("Failed to generate PDF")
    }
  }, [data])

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Scheme of Work Generator</h2>
        <p className="text-sm text-muted-foreground">Create termly schemes of work from structured curriculum inputs</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Grade</label>
              <Input
                value={data.grade}
                onChange={(e) => updateMeta("grade", e.target.value)}
                placeholder="e.g. Grade 4"
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Subject</label>
              <Input
                value={data.subject}
                onChange={(e) => updateMeta("subject", e.target.value)}
                placeholder="e.g. Mathematics"
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Term</label>
              <select
                value={data.term}
                onChange={(e) => updateMeta("term", e.target.value)}
                className="h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                {terms.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Weeks</label>
              <Input
                type="number"
                value={data.totalWeeks}
                onChange={(e) => updateMeta("totalWeeks", e.target.value)}
                min="1"
                max="20"
                className="h-10 text-sm"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Weekly Entries</label>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="px-2 py-1.5 text-left w-12">Wk</th>
                    <th className="px-2 py-1.5 text-left">Strand</th>
                    <th className="px-2 py-1.5 text-left">Sub-Strand</th>
                    <th className="px-2 py-1.5 text-left">Outcomes</th>
                    <th className="px-2 py-1.5 text-left">Activities</th>
                    <th className="px-2 py-1.5 text-left">Resources</th>
                    <th className="px-2 py-1.5 text-left">Assessment</th>
                  </tr>
                </thead>
                <tbody>
                  {data.entries.map((entry, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-2 py-1.5 text-muted-foreground font-mono text-xs">{entry.week}</td>
                      <td className="px-2 py-1.5"><Input value={entry.strand} onChange={(e) => updateEntry(i, "strand", e.target.value)} className="h-8 text-xs" /></td>
                      <td className="px-2 py-1.5"><Input value={entry.subStrand} onChange={(e) => updateEntry(i, "subStrand", e.target.value)} className="h-8 text-xs" /></td>
                      <td className="px-2 py-1.5"><Input value={entry.outcomes} onChange={(e) => updateEntry(i, "outcomes", e.target.value)} className="h-8 text-xs" /></td>
                      <td className="px-2 py-1.5"><Input value={entry.activities} onChange={(e) => updateEntry(i, "activities", e.target.value)} className="h-8 text-xs" /></td>
                      <td className="px-2 py-1.5"><Input value={entry.resources} onChange={(e) => updateEntry(i, "resources", e.target.value)} className="h-8 text-xs" /></td>
                      <td className="px-2 py-1.5"><Input value={entry.assessment} onChange={(e) => updateEntry(i, "assessment", e.target.value)} className="h-8 text-xs" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Button onClick={generate} className="w-full">
            <ClipboardList className="h-4 w-4" /> Generate Scheme of Work
          </Button>
        </CardContent>
      </Card>

      {generated && (
        <Card className="border-primary/30">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Generated Scheme of Work</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="xs" onClick={handleCopy}><Copy className="h-3.5 w-3.5" /> Copy</Button>
                <Button variant="outline" size="xs" onClick={handlePDF}><FileDown className="h-3.5 w-3.5" /> PDF</Button>
                <Button variant="outline" size="xs" onClick={handlePrint}><Printer className="h-3.5 w-3.5" /> Print</Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b text-xs text-muted-foreground">
                    <th className="px-3 py-2 text-left">Week</th>
                    <th className="px-3 py-2 text-left">Strand</th>
                    <th className="px-3 py-2 text-left">Sub-Strand</th>
                    <th className="px-3 py-2 text-left">Outcomes</th>
                    <th className="px-3 py-2 text-left">Activities</th>
                    <th className="px-3 py-2 text-left">Resources</th>
                    <th className="px-3 py-2 text-left">Assessment</th>
                  </tr>
                </thead>
                <tbody>
                  {data.entries.map((entry, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/10">
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{entry.week}</td>
                      <td className="px-3 py-2 text-xs">{entry.strand || "—"}</td>
                      <td className="px-3 py-2 text-xs">{entry.subStrand || "—"}</td>
                      <td className="px-3 py-2 text-xs">{entry.outcomes || "—"}</td>
                      <td className="px-3 py-2 text-xs">{entry.activities || "—"}</td>
                      <td className="px-3 py-2 text-xs">{entry.resources || "—"}</td>
                      <td className="px-3 py-2 text-xs">{entry.assessment || "—"}</td>
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

"use client"

import { motion } from "framer-motion"
import { Eye, Copy, FileDown, FileText, Printer, Save, Upload, StickyNote, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { KICDPlan, WeeklyPlan, DayKey } from "@/lib/planner-types"
import { DAY_LABELS } from "@/lib/planner-types"

interface StepPreviewProps {
  plan: KICDPlan
  weeklyMode: boolean
  weeklyPlans: WeeklyPlan
  biblicalVerseEnabled: boolean
  biblicalVerse: string
  teacherReflectionNotes: string
  curriculumConnection: string
  verseExplanation: string
  includeNotesInExport: boolean
  setIncludeNotesInExport: (v: boolean) => void
  teacherPrivateNotes: string
  setTeacherPrivateNotes: (v: string) => void
  handleCopy: () => void
  handlePDF: () => void
  handleDOCX: () => void
  handlePrint: () => void
  setSaveDialogOpen: (v: boolean) => void
  setLoadDialogOpen: (v: boolean) => void
  duplicatePlan: () => void
}

export function StepPreview({
  plan,
  weeklyMode,
  weeklyPlans,
  biblicalVerseEnabled,
  biblicalVerse,
  teacherReflectionNotes,
  curriculumConnection,
  verseExplanation,
  includeNotesInExport,
  setIncludeNotesInExport,
  teacherPrivateNotes,
  setTeacherPrivateNotes,
  handleCopy,
  handlePDF,
  handleDOCX,
  handlePrint,
  setSaveDialogOpen,
  setLoadDialogOpen,
  duplicatePlan,
}: StepPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
          <Eye className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Preview & Export</h3>
          <p className="text-[10px] text-muted-foreground">Review your plan and export to various formats</p>
        </div>
      </div>

      {weeklyMode ? (
        <div className="space-y-4">
          {DAY_LABELS.map((day) => {
            const p = weeklyPlans[day.toLowerCase() as DayKey]
            return (
              <div key={day} className="rounded-xl border border-border/60 bg-muted/10 p-4 text-sm space-y-2">
                <div className="font-bold text-sm text-primary flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-[10px]">{day[0]}</span>
                  {day}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                  <span>{p.grade || "\u2014"} | {p.learningArea || "\u2014"}</span>
                  <span>Lesson {p.lessonNumber} | {p.duration} min</span>
                </div>
                {p.outcomes.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Outcomes:</span> {p.outcomes.slice(0, 2).join("; ")}{p.outcomes.length > 2 ? "..." : ""}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-white dark:bg-zinc-900/80 p-5 text-sm space-y-3 leading-relaxed">
          <div className="text-center">
            <div className="text-[9px] font-semibold tracking-[0.2em] text-blue-600/60 dark:text-blue-400/60 uppercase">Republic of Kenya</div>
            <div className="font-bold text-base text-blue-700 dark:text-blue-300 mt-0.5">KICD COMPETENCY-BASED LESSON PLAN</div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs border-t border-border/30 pt-3">
            <div className="flex justify-between border-b border-dotted border-border/20 pb-0.5">
              <span className="font-semibold text-muted-foreground font-sans">Grade:</span>
              <span className="font-medium font-sans">{plan.grade}</span>
            </div>
            <div className="flex justify-between border-b border-dotted border-border/20 pb-0.5">
              <span className="font-semibold text-muted-foreground font-sans">Learning Area:</span>
              <span className="font-medium font-sans">{plan.learningArea}</span>
            </div>
            <div className="flex justify-between col-span-2 border-b border-dotted border-border/20 pb-0.5">
              <span className="font-semibold text-muted-foreground font-sans">Strand:</span>
              <span className="font-medium font-sans">{plan.strand}</span>
            </div>
            <div className="flex justify-between col-span-2 border-b border-dotted border-border/20 pb-0.5">
              <span className="font-semibold text-muted-foreground font-sans">Sub-Strand:</span>
              <span className="font-medium font-sans">{plan.subStrand || "\u2014"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-muted-foreground font-sans">Lesson No:</span>
              <span className="font-medium font-sans">{plan.lessonNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-muted-foreground font-sans">Duration:</span>
              <span className="font-medium font-sans">{plan.duration} min</span>
            </div>
          </div>

          <Separator />

          <div>
            <span className="font-bold text-xs text-primary font-sans">1. Learning Outcomes</span>
            <ul className="list-disc list-inside text-muted-foreground mt-0.5 space-y-0.5">
              {plan.outcomes.length ? plan.outcomes.map((o, i) => <li key={i} className="text-xs">{o}</li>) : <li className="list-none text-muted-foreground text-xs">\u2014</li>}
            </ul>
          </div>

          <div>
            <span className="font-bold text-xs font-sans">2. Success Criteria</span>
            {plan.successCriteria.length ? (
              <ul className="list-disc list-inside text-muted-foreground mt-0.5 space-y-0.5">
                {plan.successCriteria.map((s, i) => <li key={i} className="text-xs">{s}</li>)}
              </ul>
            ) : <span className="text-xs text-muted-foreground">\u2014</span>}
          </div>

          <div>
            <span className="font-bold text-xs font-sans">3. Key Inquiry Question</span>
            <p className="text-xs text-muted-foreground mt-0.5 italic">{plan.keyInquiryQuestion || "\u2014"}</p>
          </div>

          <div>
            <span className="font-bold text-xs text-blue-600 font-sans">4. Core Competencies</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {plan.competencies.length
                ? plan.competencies.map((c) => <span key={c} className="px-2 py-0.5 rounded bg-primary/10 text-xs font-sans">{c}</span>)
                : <span className="text-muted-foreground text-xs">\u2014</span>}
            </div>
          </div>

          <div>
            <span className="font-bold text-xs text-green-600 font-sans">5. Values</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {plan.values.length
                ? plan.values.map((v) => <span key={v} className="px-2 py-0.5 rounded bg-green-500/10 text-xs font-sans">{v}</span>)
                : <span className="text-muted-foreground text-xs">\u2014</span>}
            </div>
          </div>

          <div>
            <span className="font-bold text-xs text-purple-600 font-sans">6. Pertinent and Contemporary Issues (PCIs)</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {plan.pcis.length
                ? plan.pcis.map((p) => <span key={p} className="px-2 py-0.5 rounded bg-purple-500/10 text-xs font-sans">{p}</span>)
                : <span className="text-muted-foreground text-xs">\u2014</span>}
            </div>
          </div>

          <div>
            <span className="font-bold text-xs text-muted-foreground font-sans">7. Learning Resources</span>
            <ul className="list-disc list-inside text-muted-foreground mt-0.5 space-y-0.5">
              {plan.resources.length
                ? plan.resources.map((r, i) => <li key={i} className="text-xs">{r}</li>)
                : <li className="list-none text-muted-foreground text-xs">\u2014</li>}
            </ul>
          </div>

          <div>
            <span className="font-bold text-xs text-emerald-600 font-sans">8. Lesson Development</span>
            {plan.lessonDevelopment ? (
              <div className="mt-1 space-y-2 text-xs text-muted-foreground leading-relaxed">
                {plan.lessonDevelopment.split("\n").filter(l => l.trim()).map((line, i) => {
                  const trimmed = line.trim()
                  const isPhase = /^(Introduction|Lesson Development|Conclusion)/i.test(trimmed)
                  return isPhase
                    ? <p key={i} className="font-semibold text-foreground/80">{trimmed}</p>
                    : <p key={i} className="text-justify">{trimmed}</p>
                })}
              </div>
            ) : (
              <span className="text-muted-foreground text-xs">\u2014</span>
            )}
          </div>

          <div>
            <span className="font-bold text-xs text-red-600 font-sans">9. Assessment</span>
            <ul className="list-disc list-inside text-muted-foreground mt-0.5 space-y-0.5">
              {plan.assessmentMethods.length
                ? plan.assessmentMethods.map((a, i) => <li key={i} className="text-xs">{a}</li>)
                : <li className="list-none text-muted-foreground text-xs">\u2014</li>}
            </ul>
          </div>

          <div>
            <span className="font-bold text-xs font-sans">10. Reflection</span>
            <p className="text-xs text-muted-foreground mt-0.5 italic">{plan.remarks || "\u2014"}</p>
          </div>

          {includeNotesInExport && teacherPrivateNotes.trim() && (
            <div className="border-t pt-2 mt-2">
              <span className="font-semibold text-muted-foreground text-xs font-sans">Teacher Notes (Private):</span>
              <p className="text-muted-foreground text-xs mt-0.5 whitespace-pre-wrap">{teacherPrivateNotes}</p>
            </div>
          )}
        </div>
      )}

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="teacher-private-notes" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <StickyNote className="h-3 w-3" />
            Teacher Reflection Notes (Private)
          </label>
          <span className="text-[9px] text-muted-foreground italic border px-1.5 py-0.5 rounded font-sans">PRIVATE</span>
        </div>
        <textarea
          id="teacher-private-notes"
          value={teacherPrivateNotes}
          onChange={(e) => setTeacherPrivateNotes(e.target.value)}
          placeholder="Jot down your personal reflections, observations, or notes for improvement. These are not part of the KICD plan."
          rows={3}
          className="w-full rounded-xl border border-border/60 bg-background/50 px-3 py-2.5 text-xs outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none"
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="includeNotesExport"
            checked={includeNotesInExport}
            onChange={(e) => setIncludeNotesInExport(e.target.checked)}
            className="rounded border-border accent-primary"
          />
          <label htmlFor="includeNotesExport" className="text-[10px] text-muted-foreground">
            Include in download (PDF/DOCX)
          </label>
        </div>
        <p className="text-[9px] text-muted-foreground italic font-sans">
          Auto-saved to browser storage. Not shared or uploaded.
        </p>
      </div>

      <Separator />

      <div className="space-y-2.5">
        <label className="text-xs font-medium text-muted-foreground">Export Options</label>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="min-h-[44px]">
            <Copy className="h-3.5 w-3.5" /> Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handlePDF} className="min-h-[44px]">
            <FileDown className="h-3.5 w-3.5" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleDOCX} className="min-h-[44px]">
            <FileText className="h-3.5 w-3.5" /> DOCX
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="min-h-[44px]">
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <Button variant="default" size="sm" onClick={() => setSaveDialogOpen(true)} className="min-h-[44px]">
          <Save className="h-3.5 w-3.5" /> Save Plan
        </Button>
        <Button variant="outline" size="sm" onClick={() => setLoadDialogOpen(true)} className="min-h-[44px]">
          <Upload className="h-3.5 w-3.5" /> Load Saved
        </Button>
        <Button variant="outline" size="sm" onClick={duplicatePlan} className="min-h-[44px]">
          <Sparkles className="h-3.5 w-3.5" /> Duplicate
        </Button>
      </div>
    </motion.div>
  )
}

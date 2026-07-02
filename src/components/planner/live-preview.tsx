"use client"

import { motion, AnimatePresence } from "framer-motion"
import { FileText } from "lucide-react"
import type { KICDPlan } from "@/lib/planner-types"
import { computeComplianceScore, getSmartFallbackOutcomes } from "@/lib/planner-utils"

interface LivePreviewProps {
  plan: KICDPlan
  generated: boolean
  biblicalVerseEnabled: boolean
  biblicalVerse: string
  teacherReflectionNotes: string
  curriculumConnection: string
  verseExplanation: string
  includeNotesInExport: boolean
  teacherPrivateNotes: string
  updateField: <K extends keyof KICDPlan>(key: K, value: KICDPlan[K]) => void
}

export function LivePreview({
  plan,
  generated,
  biblicalVerseEnabled,
  biblicalVerse,
  teacherReflectionNotes,
  curriculumConnection,
  verseExplanation,
  includeNotesInExport,
  teacherPrivateNotes,
  updateField,
}: LivePreviewProps) {
  return (
    <AnimatePresence mode="wait">
      {!plan.grade ? (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center py-12 text-muted-foreground px-4"
        >
          <FileText className="h-10 w-10 mb-3 text-muted-foreground/20" />
          <p className="text-sm font-medium text-foreground/60">Lesson Plan Preview</p>
          <p className="text-xs mt-1 text-center max-w-[200px] leading-relaxed text-muted-foreground/60">
            Select a grade and learning area to begin.
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="preview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-white dark:bg-zinc-900/80 text-sm font-serif border-b border-border/40"
        >
          {/* Header */}
          <div className="px-5 py-4 text-center border-b border-border/30">
            <div className="text-[10px] font-semibold tracking-[0.15em] text-blue-600/50 dark:text-blue-400/50 uppercase">
              Republic of Kenya
            </div>
            <div className="text-base font-bold text-blue-700 dark:text-blue-300 mt-0.5">
              KICD CBC LESSON PLAN
            </div>
          </div>

          {/* Info table */}
          <div className="px-5 py-3 border-b border-border/30">
            <table className="w-full text-xs">
              <tbody>
                {plan.schoolName && (
                  <tr className="border-b border-dotted border-border/20">
                    <td className="py-1 pr-4 text-muted-foreground w-28">School</td>
                    <td className="py-1 font-medium">{plan.schoolName}</td>
                  </tr>
                )}
                {plan.teacherName && (
                  <tr className="border-b border-dotted border-border/20">
                    <td className="py-1 pr-4 text-muted-foreground">Teacher</td>
                    <td className="py-1 font-medium">{plan.teacherName}</td>
                  </tr>
                )}
                {plan.lessonDate && (
                  <tr className="border-b border-dotted border-border/20">
                    <td className="py-1 pr-4 text-muted-foreground">Date</td>
                    <td className="py-1 font-medium">{plan.lessonDate}</td>
                  </tr>
                )}
                {(plan.term || plan.week) && (
                  <tr className="border-b border-dotted border-border/20">
                    <td className="py-1 pr-4 text-muted-foreground">Term &amp; Week</td>
                    <td className="py-1 font-medium">{plan.term || "\u2014"} / Week {plan.week || "\u2014"}</td>
                  </tr>
                )}
                {plan.topicTitle && (
                  <tr className="border-b border-dotted border-border/20">
                    <td className="py-1 pr-4 text-muted-foreground">Topic</td>
                    <td className="py-1 font-medium">{plan.topicTitle}</td>
                  </tr>
                )}
                <tr className="border-b border-dotted border-border/20">
                  <td className="py-1 pr-4 text-muted-foreground w-28">Grade</td>
                  <td className="py-1 font-medium">{plan.grade}</td>
                </tr>
                <tr className="border-b border-dotted border-border/20">
                  <td className="py-1 pr-4 text-muted-foreground">Learning Area</td>
                  <td className="py-1 font-medium">{plan.learningArea || "\u2014"}</td>
                </tr>
                <tr className="border-b border-dotted border-border/20">
                  <td className="py-1 pr-4 text-muted-foreground">Strand</td>
                  <td className="py-1 font-medium">{plan.strand || "\u2014"}</td>
                </tr>
                <tr className="border-b border-dotted border-border/20">
                  <td className="py-1 pr-4 text-muted-foreground">Sub-Strand</td>
                  <td className="py-1 font-medium">{plan.subStrand || "\u2014"}</td>
                </tr>
                <tr>
                  <td className="py-1 pr-4 text-muted-foreground">Lesson / Duration</td>
                  <td className="py-1 font-medium">#{plan.lessonNumber} \u2022 {plan.duration} min</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Content sections */}
          <div className="divide-y divide-border/30">
            {plan.outcomes.length > 0 && (
              <div className="px-5 py-3">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">1. Specific Learning Outcomes</p>
                <ul className="space-y-0.5">
                  {plan.outcomes.map((o, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2">
                      <span className="text-primary shrink-0 mt-0.5">\u2022</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(plan.competencies.length > 0 || plan.values.length > 0 || plan.pcis.length > 0) && (
              <div className="px-5 py-3 space-y-2">
                {plan.competencies.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">2. Core Competencies</p>
                    <div className="flex flex-wrap gap-1">
                      {plan.competencies.map((c) => (
                        <span key={c} className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px]">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {plan.values.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1">3. Values</p>
                    <div className="flex flex-wrap gap-1">
                      {plan.values.map((v) => (
                        <span key={v} className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 text-[10px]">{v}</span>
                      ))}
                    </div>
                  </div>
                )}
                {plan.pcis.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1">4. PCIs</p>
                    <div className="flex flex-wrap gap-1">
                      {plan.pcis.map((p) => (
                        <span key={p} className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 text-[10px]">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {(plan.teacherActivities.length > 0 || plan.learnerActivities.length > 0) && (
              <div className="px-5 py-3">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">5. Learning Activities</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[9px] font-semibold text-muted-foreground mb-0.5">Teacher</p>
                    <ul className="space-y-0.5">
                      {plan.teacherActivities.slice(0, 3).map((a, i) => (
                        <li key={i} className="text-[10px] text-muted-foreground">{a}</li>
                      ))}
                      {plan.teacherActivities.length > 3 && (
                        <li className="text-[9px] text-muted-foreground/60">+{plan.teacherActivities.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-muted-foreground mb-0.5">Learner</p>
                    <ul className="space-y-0.5">
                      {plan.learnerActivities.slice(0, 3).map((a, i) => (
                        <li key={i} className="text-[10px] text-muted-foreground">{a}</li>
                      ))}
                      {plan.learnerActivities.length > 3 && (
                        <li className="text-[9px] text-muted-foreground/60">+{plan.learnerActivities.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {(plan.assessmentMethods.length > 0 || plan.resources.length > 0 || plan.remarks) && (
              <div className="px-5 py-3">
                {plan.assessmentMethods.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">6. Assessment Methods</p>
                    <div className="flex flex-wrap gap-1">
                      {plan.assessmentMethods.map((a) => (
                        <span key={a} className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 text-[10px]">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
                {plan.resources.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Resources</p>
                    <ul className="space-y-0.5">
                      {plan.resources.map((r, i) => (
                        <li key={i} className="text-[10px] text-muted-foreground">{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {plan.remarks && (
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Remarks</p>
                    <p className="text-xs text-muted-foreground italic">&ldquo;{plan.remarks}&rdquo;</p>
                  </div>
                )}
              </div>
            )}

            {/* Biblical Reflection */}
            {biblicalVerseEnabled && biblicalVerse && (
              <div className="px-5 py-3 border-t-2 border-amber-200/30">
                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                  Biblical Reflection (Optional)
                </p>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200 mt-1">
                  {biblicalVerse.split(" \u2014 ")[0]}
                </p>
                <p className="text-xs italic text-amber-700 dark:text-amber-300 leading-relaxed mt-0.5">
                  &ldquo;{biblicalVerse.split(" \u2014 ").slice(1).join(" \u2014 ")}&rdquo;
                </p>
                {curriculumConnection && (
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-1">
                    <span className="font-semibold">Curriculum Connection:</span> {curriculumConnection}
                  </p>
                )}
                {verseExplanation && (
                  <p className="text-[11px] text-amber-600/70 dark:text-amber-400/70 italic mt-0.5">
                    {verseExplanation}
                  </p>
                )}
                {teacherReflectionNotes && (
                  <p className="text-[11px] text-muted-foreground italic mt-0.5">\u2014 {teacherReflectionNotes}</p>
                )}
              </div>
            )}

            {includeNotesInExport && teacherPrivateNotes.trim() && (
              <div className="px-5 py-3 bg-muted/5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Teacher Notes</p>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{teacherPrivateNotes}</p>
              </div>
            )}

            {/* Auto-generate */}
            {!generated && (
              <div className="px-5 py-3">
                <button
                  type="button"
                  onClick={() => {
                    const p = plan
                    const updates: Partial<KICDPlan> = {}
                    if (p.outcomes.length === 0 && p.strand) {
                      updates.outcomes = getSmartFallbackOutcomes(p.strand).slice(0, 3)
                    }
                    if (p.teacherActivities.length === 0) {
                      updates.teacherActivities = [
                        "Guides learners through examples using real objects",
                        "Asks probing questions to promote critical thinking",
                        "Facilitates class discussion on key concepts",
                      ]
                    }
                    if (p.learnerActivities.length === 0) {
                      updates.learnerActivities = [
                        "Participates actively in class discussions",
                        "Works in groups to solve problems and tasks",
                        "Completes worksheets and written exercises",
                      ]
                    }
                    if (p.assessmentMethods.length === 0) {
                      updates.assessmentMethods = ["Observation", "Oral questioning", "Written exercise"]
                    }
                    if (!p.remarks) {
                      updates.remarks = "Lesson well received. Learners demonstrated understanding."
                    }
                    Object.entries(updates).forEach(([key, value]) => {
                      updateField(key as keyof KICDPlan, value)
                    })
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-primary/20 text-primary text-xs font-medium hover:bg-primary/5 transition-colors"
                >
                  Auto-fill sections
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-2 bg-muted/5 flex items-center justify-between text-[9px] text-muted-foreground border-t border-border/30">
            <span>Lesson #{plan.lessonNumber}</span>
            <span>{plan.outcomes.length} outcomes</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

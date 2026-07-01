"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"
import type { KICDPlan } from "@/lib/planner-types"
import { BIBLE_VERSES } from "@/lib/planner-data"
import { suggestVerseForLesson } from "@/lib/planner-utils"

interface BiblicalReflectionProps {
  plan: KICDPlan
  biblicalVerseEnabled: boolean
  setBiblicalVerseEnabled: (v: boolean) => void
  biblicalVerse: string
  setBiblicalVerse: (v: string) => void
  teacherReflectionNotes: string
  setTeacherReflectionNotes: (v: string) => void
  curriculumConnection: string
  setCurriculumConnection: (v: string) => void
  verseExplanation: string
  setVerseExplanation: (v: string) => void
  toggleChip: (key: "competencies" | "values" | "pcis", item: string) => void
}

export function BiblicalReflection({
  plan,
  biblicalVerseEnabled,
  setBiblicalVerseEnabled,
  biblicalVerse,
  setBiblicalVerse,
  teacherReflectionNotes,
  setTeacherReflectionNotes,
  curriculumConnection,
  setCurriculumConnection,
  verseExplanation,
  setVerseExplanation,
  toggleChip,
}: BiblicalReflectionProps) {
  const handleSuggestVerse = () => {
    const { suggestion, matchSource } = suggestVerseForLesson(
      plan.strand,
      plan.subStrand,
      plan.values,
    )

    if (suggestion) {
      const verseObj = BIBLE_VERSES.find((v) => v.ref === suggestion.verseRef)
      const verseFull = verseObj
        ? `${verseObj.ref} — ${verseObj.text}`
        : suggestion.verseRef
      setBiblicalVerse(verseFull)
      setCurriculumConnection(suggestion.connection)
      setVerseExplanation(suggestion.explanation)

      if (!teacherReflectionNotes) {
        setTeacherReflectionNotes(`This lesson connects to ${matchSource}-based learning. ${suggestion.connection}`)
      }
    }

    if (!biblicalVerseEnabled) {
      setBiblicalVerseEnabled(true)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-amber-200/30 dark:border-amber-800/30 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 dark:from-amber-950/20 dark:via-background dark:to-amber-950/10 p-5 mt-6 space-y-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <span className="text-amber-500">{"\u2618"}</span>
            Biblical Reflection (Optional)
          </h4>
          <p className="text-[10px] text-amber-600/60 dark:text-amber-400/60 italic">Optional for Christian teachers</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={biblicalVerseEnabled}
            onChange={() => setBiblicalVerseEnabled(!biblicalVerseEnabled)}
            className="sr-only peer"
          />
          <div className="w-10 h-5.5 rounded-full bg-muted peer-checked:bg-amber-500 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-500/30 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[18px]" />
          <span className="ml-2 text-[10px] font-medium text-amber-700 dark:text-amber-400">
            {biblicalVerseEnabled ? "On" : "Off"}
          </span>
        </label>
      </div>

      <AnimatePresence>
        {biblicalVerseEnabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-3 overflow-hidden"
          >
            <div className="h-px bg-gradient-to-r from-amber-200/50 via-amber-300/30 to-transparent dark:from-amber-800/50 dark:via-amber-700/30" />

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={handleSuggestVerse}
              disabled={!plan.strand && !plan.subStrand && plan.values.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500/90 to-amber-600/90 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:from-amber-500 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Auto-suggest a Bible verse based on your Strand, Sub-Strand, and selected Values"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Suggest Verse for This Lesson
            </motion.button>
            {!plan.strand && plan.values.length === 0 && (
              <p className="text-[9px] text-amber-500/70 text-center">Select a Strand or Values first for context-aware suggestions</p>
            )}

            {biblicalVerse && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-amber-200/40 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/30 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-950/30 px-3.5 py-2 border-b border-amber-200/40 dark:border-amber-800/40">
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Selected Verse</span>
                </div>

                <div className="px-3.5 py-2.5 space-y-2.5">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-500">Reference</p>
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-200">{biblicalVerse.split(" — ")[0]}</p>
                  </div>

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-500">Verse</p>
                    <p className="text-[11px] italic text-amber-800 dark:text-amber-300 leading-relaxed">"{biblicalVerse.split(" — ").slice(1).join(" — ")}"</p>
                  </div>

                  {curriculumConnection && (
                    <div className="rounded-xl bg-amber-100/70 dark:bg-amber-900/30 px-3 py-2 border border-amber-200/30 dark:border-amber-800/30">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-0.5">Curriculum Connection</p>
                      <p className="text-[10px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">{curriculumConnection}</p>
                    </div>
                  )}

                  {verseExplanation && (
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-500">Verse Explanation</p>
                      <p className="text-[10px] text-amber-700/80 dark:text-amber-300/80 italic leading-relaxed">{verseExplanation}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <span>Or choose a verse manually</span>
                <span className="text-[9px] font-normal text-muted-foreground">(optional override)</span>
              </label>
              <select
                value={biblicalVerse}
                onChange={(e) => {
                  const verse = e.target.value
                  setBiblicalVerse(verse)
                  if (verse) {
                    setCurriculumConnection("")
                    setVerseExplanation("")
                  }
                }}
                className="w-full rounded-xl border border-amber-200/40 dark:border-amber-800/40 bg-white dark:bg-amber-950/40 px-3 py-2.5 text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              >
                <option value="">— Choose a verse —</option>
                {BIBLE_VERSES.map((v) => (
                  <option key={v.ref} value={`${v.ref} — ${v.text}`}>
                    {v.ref} — {v.text}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <span>Teacher Reflection Notes</span>
                <span className="text-[9px] font-normal text-muted-foreground">(optional)</span>
              </label>
              <textarea
                value={teacherReflectionNotes}
                onChange={(e) => setTeacherReflectionNotes(e.target.value)}
                placeholder="How does this verse connect with today's lesson? What can learners take away from this scripture?"
                rows={3}
                className="w-full rounded-xl border border-amber-200/40 dark:border-amber-800/40 bg-white dark:bg-amber-950/40 px-3 py-2.5 text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
              />
            </div>

            <div className="rounded-xl bg-amber-100/50 dark:bg-amber-950/30 px-3 py-2.5">
              <p className="text-[9px] text-amber-600/80 dark:text-amber-400/80 leading-relaxed">
                The verse, curriculum connection, and reflection will appear in the live preview and in PDF/DOCX exports. Does not affect CBC compliance scoring.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

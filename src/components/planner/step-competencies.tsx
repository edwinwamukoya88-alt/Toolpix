"use client"

import { motion } from "framer-motion"
import { GraduationCap, Leaf, AlertCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import type { KICDPlan } from "@/lib/planner-types"
import { coreCompetencies, values as valuesList, pciOptions, SUBSTRAND_VALUE_MAP, VALUES_ADVISORY_ALL } from "@/lib/planner-data"
import { BiblicalReflection } from "./biblical-reflection"
import { CustomFieldInput } from "./custom-field-input"

interface StepCompetenciesProps {
  plan: KICDPlan
  updateField: <K extends keyof KICDPlan>(key: K, value: KICDPlan[K]) => void
  toggleChip: (key: "competencies" | "values" | "pcis", item: string) => void
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
  valuesEnhancerEnabled: boolean
  setValuesEnhancerEnabled: (v: boolean) => void
}

export function StepCompetencies({
  plan,
  updateField,
  toggleChip,
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
  valuesEnhancerEnabled,
  setValuesEnhancerEnabled,
}: StepCompetenciesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
          <GraduationCap className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Competencies, Values & PCIs</h3>
          {plan.subStrand && (
            <p className="text-[10px] text-muted-foreground">Auto-suggested from sub-strand</p>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        <label className="text-xs font-medium text-muted-foreground">Core Competencies</label>
        <div className="flex flex-wrap gap-1.5">
          {coreCompetencies.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleChip("competencies", c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150 ${
                plan.competencies.includes(c)
                  ? "bg-primary/20 border-primary text-primary shadow-sm"
                  : "bg-muted/20 border-border/60 text-muted-foreground hover:border-primary/40 hover:bg-muted/30"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <CustomFieldInput
          label="Competency"
          onAdd={(val) => { if (!plan.competencies.includes(val)) updateField("competencies", [...plan.competencies, val]) }}
        />
      </div>

      <div className="space-y-2.5">
        <label className="text-xs font-medium text-muted-foreground">Values</label>
        <div className="flex flex-wrap gap-1.5">
          {valuesList.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => toggleChip("values", v)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150 ${
                plan.values.includes(v)
                  ? "bg-green-500/20 border-green-500 text-green-500 shadow-sm"
                  : "bg-muted/20 border-border/60 text-muted-foreground hover:border-green-500/40 hover:bg-muted/30"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <CustomFieldInput
          label="Value"
          onAdd={(val) => { if (!plan.values.includes(val)) updateField("values", [...plan.values, val]) }}
        />
      </div>

      <div className="space-y-2.5">
        <label className="text-xs font-medium text-muted-foreground">Pertinent & Contemporary Issues (PCIs)</label>
        <div className="flex flex-wrap gap-1.5">
          {pciOptions.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => toggleChip("pcis", p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150 ${
                plan.pcis.includes(p)
                  ? "bg-purple-500/20 border-purple-500 text-purple-500 shadow-sm"
                  : "bg-muted/20 border-border/60 text-muted-foreground hover:border-purple-500/40 hover:bg-muted/30"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <CustomFieldInput
          label="PCI"
          onAdd={(val) => { if (!plan.pcis.includes(val)) updateField("pcis", [...plan.pcis, val]) }}
        />
      </div>

      <Separator />

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">Values-Based Lesson Enhancer (Optional)</label>
          <button
            type="button"
            onClick={() => setValuesEnhancerEnabled(!valuesEnhancerEnabled)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-medium border transition-colors ${
              valuesEnhancerEnabled
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-600"
                : "bg-muted/20 border-border/60 text-muted-foreground hover:border-emerald-500/50"
            }`}
          >
            <Leaf className="h-3 w-3" />
            {valuesEnhancerEnabled ? "Showing" : "Show"}
          </button>
        </div>
        {valuesEnhancerEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-emerald-200/30 dark:border-emerald-800/30 bg-gradient-to-br from-emerald-50/30 to-transparent dark:from-emerald-950/20 dark:to-transparent p-4 space-y-2.5"
          >
            <p className="text-[10px] text-muted-foreground">
              <span className="font-medium text-emerald-600 dark:text-emerald-400">Suggested Values</span> — based on your Sub-Strand: <strong>{plan.subStrand || "(not set)"}</strong>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(plan.subStrand ? SUBSTRAND_VALUE_MAP[plan.subStrand] || VALUES_ADVISORY_ALL : VALUES_ADVISORY_ALL).map((v) => {
                const selected = plan.values.includes(v)
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => toggleChip("values", v)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-medium border transition-all ${
                      selected
                        ? "bg-green-500/20 border-green-500 text-green-500"
                        : "bg-muted/20 border-border/60 text-muted-foreground hover:border-emerald-500/40"
                    }`}
                  >
                    {v} {selected ? "\u2713" : "+"}
                  </button>
                )
              })}
            </div>
            <p className="text-[9px] text-muted-foreground italic flex items-center gap-1">
              <AlertCircle className="h-2.5 w-2.5" />
              Advisory only — tap a chip to add or remove it from your plan values.
            </p>
          </motion.div>
        )}
      </div>

      <BiblicalReflection
        plan={plan}
        biblicalVerseEnabled={biblicalVerseEnabled}
        setBiblicalVerseEnabled={setBiblicalVerseEnabled}
        biblicalVerse={biblicalVerse}
        setBiblicalVerse={setBiblicalVerse}
        teacherReflectionNotes={teacherReflectionNotes}
        setTeacherReflectionNotes={setTeacherReflectionNotes}
        curriculumConnection={curriculumConnection}
        setCurriculumConnection={setCurriculumConnection}
        verseExplanation={verseExplanation}
        setVerseExplanation={setVerseExplanation}
        toggleChip={toggleChip}
      />
    </motion.div>
  )
}

"use client"

import { motion } from "framer-motion"
import { Settings } from "lucide-react"
import type { KICDPlan } from "@/lib/planner-types"
import { GRADES, LEARNING_AREAS_BY_GRADE, TERMS } from "@/lib/planner-data"
import { CustomFieldInput } from "./custom-field-input"

const inputClass = "flex h-12 w-full rounded-xl border border-border/50 bg-background px-4 py-2 text-sm outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/30 hover:border-primary/40 placeholder:text-muted-foreground/40"
const selectClass = "flex h-12 w-full rounded-xl border border-border/50 bg-background px-4 py-2 text-sm outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/30 hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed appearance-none cursor-pointer"

interface StepSetupProps {
  plan: KICDPlan
  updateField: <K extends keyof KICDPlan>(key: K, value: KICDPlan[K]) => void
  setActivePlan: (plan: KICDPlan) => void
  learningAreas: string[]
}

export function StepSetup({ plan, updateField, setActivePlan, learningAreas }: StepSetupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* ── Header ── */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">1</span>
          <span className="text-[10px] font-medium text-muted-foreground tracking-wide">STEP 1 OF 6</span>
        </div>
        <h2 className="text-lg font-semibold tracking-tight">Lesson Setup Details</h2>
      </div>

      {/* ── School Name ── */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">School Name <span className="text-primary">*</span></label>
        <input
          type="text"
          value={plan.schoolName}
          onChange={(e) => updateField("schoolName", e.target.value)}
          placeholder=""
          className={inputClass}
        />
      </div>

      {/* ── Teacher Name ── */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">Teacher Name <span className="text-primary">*</span></label>
        <input
          type="text"
          value={plan.teacherName}
          onChange={(e) => updateField("teacherName", e.target.value)}
          placeholder=""
          className={inputClass}
        />
      </div>

      {/* ── Date / Term / Week ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Lesson Date <span className="text-primary">*</span></label>
          <input
            type="date"
            value={plan.lessonDate}
            onChange={(e) => updateField("lessonDate", e.target.value)}
            className={`${inputClass} [color-scheme:light] dark:[color-scheme:dark]`}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Term <span className="text-primary">*</span></label>
          <select
            value={plan.term}
            onChange={(e) => updateField("term", e.target.value)}
            className={selectClass}
          >
            <option value="">Select term...</option>
            {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Week</label>
          <input
            type="number"
            min={1}
            max={14}
            value={plan.week}
            onChange={(e) => updateField("week", e.target.value)}
            placeholder=""
            className={inputClass}
          />
        </div>
      </div>

      {/* ── Lesson Number / Duration ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Lesson Number</label>
          <input
            type="number"
            min={1}
            max={30}
            value={plan.lessonNumber}
            onChange={(e) => updateField("lessonNumber", e.target.value)}
            placeholder=""
            className={inputClass}
          />
          <p className="text-[10px] text-muted-foreground/60">Sequential number within the term</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Lesson Duration (Minutes)</label>
          <input
            type="number"
            min={5}
            max={120}
            value={plan.duration}
            onChange={(e) => updateField("duration", e.target.value)}
            placeholder=""
            className={inputClass}
          />
          <p className="text-[10px] text-muted-foreground/60">Recommended: 30\u201360 minutes</p>
        </div>
      </div>

      {/* ── Topic Title ── */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">Lesson Topic / Sub-topic Title</label>
        <input
          type="text"
          value={plan.topicTitle}
          onChange={(e) => updateField("topicTitle", e.target.value)}
          placeholder=""
          className={inputClass}
        />
      </div>

      {/* ── Separator ── */}
      <div className="border-t border-border/40" />

      {/* ── Curriculum Level ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Grade <span className="text-primary">*</span></label>
          <select
            value={plan.grade}
            onChange={(e) => {
              const val = e.target.value
              if (!val) { updateField("grade", ""); return }
              setActivePlan({ ...plan, grade: val, learningArea: "", strand: "", subStrand: "", outcomes: [], competencies: [], values: [], pcis: [] })
            }}
            className={selectClass}
          >
            <option value="">Select grade...</option>
            {[...GRADES, ...plan.customGrades].map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <CustomFieldInput
            label="Grade"
            onAdd={(val) => {
              const updated = [...plan.customGrades, val]
              setActivePlan({ ...plan, customGrades: updated, grade: val, learningArea: "", strand: "", subStrand: "", outcomes: [], competencies: [], values: [], pcis: [] })
            }}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Learning Area <span className="text-primary">*</span></label>
          <select
            value={plan.learningArea}
            onChange={(e) => {
              const val = e.target.value
              setActivePlan({ ...plan, learningArea: val, strand: "", subStrand: "", outcomes: [], competencies: [], values: [], pcis: [] })
            }}
            disabled={!plan.grade}
            className={selectClass}
          >
            <option value="">Select learning area...</option>
            {[...learningAreas, ...plan.customLearningAreas].map((la) => <option key={la} value={la}>{la}</option>)}
          </select>
          <CustomFieldInput
            label="Learning Area"
            onAdd={(val) => {
              const updated = [...plan.customLearningAreas, val]
              setActivePlan({ ...plan, customLearningAreas: updated, learningArea: val, strand: "", subStrand: "", outcomes: [], competencies: [], values: [], pcis: [] })
            }}
          />
        </div>
      </div>

      {/* ── Helper text ── */}
      <div className="rounded-xl border border-primary/10 bg-primary/[0.03] px-4 py-3">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Setting clear school metadata ensures the printable lesson plan meets KICD and Ministry of Education requirements while making administrative review easier.
        </p>
      </div>
    </motion.div>
  )
}

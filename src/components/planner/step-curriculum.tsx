"use client"

import { motion } from "framer-motion"
import { BookTemplate, Sparkles, Plus } from "lucide-react"
import type { KICDPlan } from "@/lib/planner-types"
import { STRANDS_BY_AREA, SUBSTRANDS, OUTCOMES_BY_SUBSTRAND } from "@/lib/planner-data"
import { SearchableMultiSelect } from "./searchable-multi-select"
import { CustomFieldInput } from "./custom-field-input"

interface StepCurriculumProps {
  plan: KICDPlan
  updateField: <K extends keyof KICDPlan>(key: K, value: KICDPlan[K]) => void
  setActivePlan: (plan: KICDPlan) => void
  handleStrandChange: (strand: string) => void
  handleSubStrandChange: (sub: string) => void
  strands: string[]
  subStrands: string[]
  suggestedOutcomes: string[]
  getSmartFallbackOutcomes: (strand: string) => string[]
}

export function StepCurriculum({
  plan,
  updateField,
  setActivePlan,
  handleStrandChange,
  handleSubStrandChange,
  strands,
  subStrands,
  suggestedOutcomes,
  getSmartFallbackOutcomes,
}: StepCurriculumProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
          <BookTemplate className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Curriculum Mapping</h3>
          <p className="text-[10px] text-muted-foreground">Map your lesson to the KICD curriculum structure</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="strand" className="text-xs font-medium text-muted-foreground">Strand <span className="text-primary">*</span></label>
          <select
            id="strand"
            value={plan.strand}
            onChange={(e) => handleStrandChange(e.target.value)}
            disabled={!plan.learningArea}
            className="flex h-11 w-full rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/30 hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-required="true"
          >
            <option value="">Select strand...</option>
            {[...strands, ...plan.customStrands].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex items-center justify-between">
            <p className="text-[9px] text-muted-foreground/60">Broad topic area within the selected Learning Area</p>
            <CustomFieldInput
              label="Strand"
              onAdd={(val) => {
                const updated = [...plan.customStrands, val]
                setActivePlan({ ...plan, customStrands: updated, strand: val, subStrand: "", outcomes: [], competencies: [], values: [], pcis: [] })
              }}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="sub-strand" className="text-xs font-medium text-muted-foreground">Sub-Strand</label>
          <select
            id="sub-strand"
            value={plan.subStrand}
            onChange={(e) => handleSubStrandChange(e.target.value)}
            disabled={!plan.strand}
            className="flex h-11 w-full rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/30 hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="">Select sub-strand...</option>
            {[...subStrands, ...plan.customSubStrands].map((ss) => <option key={ss} value={ss}>{ss}</option>)}
          </select>
          <div className="flex items-center justify-between">
            <p className="text-[9px] text-muted-foreground/60">Specific focus area under the selected Strand</p>
            <CustomFieldInput
              label="Sub-Strand"
              onAdd={(val) => {
                const updated = [...plan.customSubStrands, val]
                setActivePlan({ ...plan, customSubStrands: updated, subStrand: val, outcomes: plan.outcomes.length > 0 ? plan.outcomes : [], competencies: plan.competencies.length > 0 ? plan.competencies : [], values: plan.values.length > 0 ? plan.values : [], pcis: plan.pcis.length > 0 ? plan.pcis : [] })
              }}
            />
          </div>
        </div>
      </div>

      <SearchableMultiSelect
        label="Specific Learning Outcomes *"
        options={suggestedOutcomes}
        selected={plan.outcomes}
        onChange={(val) => updateField("outcomes", val)}
        placeholder="Search outcomes..."
        allowCustom
        customPlaceholder="Type a custom outcome..."
        description="Measurable statements of what learners will achieve. Select at least 2."
      />

      <CustomFieldInput
        label="Outcome"
        onAdd={(val) => {
          if (!plan.outcomes.includes(val)) {
            updateField("outcomes", [...plan.outcomes, val])
          }
        }}
      />

      <SearchableMultiSelect
        label="Success Criteria"
        options={plan.outcomes}
        selected={plan.successCriteria}
        onChange={(val) => updateField("successCriteria", val)}
        placeholder="Search or type success criteria..."
        allowCustom
        customPlaceholder="Type a success criterion..."
        description="Measurable indicators that show learners have achieved the learning outcomes."
      />

      <div className="space-y-1.5">
        <label htmlFor="key-inquiry" className="text-xs font-medium text-muted-foreground">Key Inquiry Question</label>
        <p className="text-[9px] text-muted-foreground/60 -mt-0.5">The overarching question that guides the lesson</p>
        <input
          id="key-inquiry"
          type="text"
          value={plan.keyInquiryQuestion}
          onChange={(e) => updateField("keyInquiryQuestion", e.target.value)}
          placeholder="e.g. How can we use addition to solve problems in our daily lives?"
          className="flex h-11 w-full rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/30 hover:border-primary/40"
        />
      </div>

      {plan.subStrand && suggestedOutcomes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-amber-200/40 dark:border-amber-800/40 bg-gradient-to-br from-amber-50/60 to-amber-50/20 dark:from-amber-950/30 dark:to-amber-950/10 p-4 space-y-2"
        >
          <div className="flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Suggested outcomes based on strand: {plan.strand}
              </p>
              <p className="text-[10px] text-amber-600/70 dark:text-amber-500/70 mt-0.5">Click to add suggested outcomes or type custom ones below</p>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {getSmartFallbackOutcomes(plan.strand).slice(0, 4).map((outcome, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  const current = plan.outcomes
                  if (!current.includes(outcome)) {
                    updateField("outcomes", [...current, outcome])
                  }
                }}
                className="text-left text-[11px] px-3 py-2 rounded-xl border border-amber-200/30 dark:border-amber-800/30 bg-white dark:bg-amber-950/40 hover:bg-amber-50 dark:hover:bg-amber-900/40 transition-all flex items-center gap-2.5"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                  <Plus className="h-3 w-3" />
                </span>
                <span className="text-amber-800 dark:text-amber-300">{outcome}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {plan.subStrand && suggestedOutcomes.length > 0 && (
        <p className="text-[10px] text-muted-foreground">
          {suggestedOutcomes.length} preloaded outcomes available. You can also add custom outcomes.
        </p>
      )}
    </motion.div>
  )
}

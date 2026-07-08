"use client"

import { motion } from "framer-motion"
import { ClipboardList, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { KICDPlan } from "@/lib/planner-types"
import { ASSESSMENT_METHODS, REMARKS } from "@/lib/planner-data"
import { MultiSelect } from "./multi-select"
import { CustomFieldInput } from "./custom-field-input"

interface StepAssessmentProps {
  plan: KICDPlan
  updateField: <K extends keyof KICDPlan>(key: K, value: KICDPlan[K]) => void
  autoGenerateRemarks: () => void
}

export function StepAssessment({ plan, updateField, autoGenerateRemarks }: StepAssessmentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
          <ClipboardList className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Assessment & Remarks</h3>
          <p className="text-[10px] text-muted-foreground">Choose assessment methods and add remarks</p>
        </div>
      </div>

      <MultiSelect
        label="Assessment Methods"
        options={ASSESSMENT_METHODS}
        selected={plan.assessmentMethods}
        onChange={(val) => updateField("assessmentMethods", val)}
        description="Ways to evaluate learner understanding. Select 2-3 methods."
      />

      <CustomFieldInput
        label="Assessment Method"
        onAdd={(val) => { if (!plan.assessmentMethods.includes(val)) updateField("assessmentMethods", [...plan.assessmentMethods, val]) }}
      />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="remarks" className="text-xs font-medium text-muted-foreground">Remarks</label>
          <Button variant="ghost" size="sm" type="button" onClick={autoGenerateRemarks} className="text-primary">
            <Sparkles className="h-3 w-3" /> Auto-generate
          </Button>
        </div>
        <select
          id="remarks"
          value={plan.remarks}
          onChange={(e) => updateField("remarks", e.target.value)}
          className="flex h-11 w-full rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/30 hover:border-primary/40"
        >
          <option value="">Select remarks...</option>
          {REMARKS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <p className="text-[9px] text-muted-foreground/60">KICD-aligned remarks for lesson evaluation</p>
      </div>
    </motion.div>
  )
}

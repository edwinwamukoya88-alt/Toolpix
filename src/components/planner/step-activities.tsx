"use client"

import { motion } from "framer-motion"
import { Workflow } from "lucide-react"
import type { KICDPlan } from "@/lib/planner-types"
import { TEACHER_ACTIVITIES, LEARNER_ACTIVITIES, RESOURCES } from "@/lib/planner-data"
import { MultiSelect } from "./multi-select"
import { CustomFieldInput } from "./custom-field-input"

interface StepActivitiesProps {
  plan: KICDPlan
  updateField: <K extends keyof KICDPlan>(key: K, value: KICDPlan[K]) => void
}

export function StepActivities({ plan, updateField }: StepActivitiesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
          <Workflow className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Learning Activities</h3>
          <p className="text-[10px] text-muted-foreground">Define teacher and learner activities for this lesson</p>
        </div>
      </div>

      <MultiSelect
        label="Teacher Activities *"
        options={TEACHER_ACTIVITIES}
        selected={plan.teacherActivities}
        onChange={(val) => updateField("teacherActivities", val)}
        description="Actions the teacher will perform during the lesson"
      />

      <MultiSelect
        label="Learner Activities *"
        options={LEARNER_ACTIVITIES}
        selected={plan.learnerActivities}
        onChange={(val) => updateField("learnerActivities", val)}
        description="Tasks and exercises for learners to complete"
      />

      <MultiSelect
        label="Resources"
        options={RESOURCES}
        selected={plan.resources}
        onChange={(val) => updateField("resources", val)}
        description="Materials and tools needed for the lesson"
      />

      <CustomFieldInput
        label="Resource"
        onAdd={(val) => { if (!plan.resources.includes(val)) updateField("resources", [...plan.resources, val]) }}
      />
    </motion.div>
  )
}

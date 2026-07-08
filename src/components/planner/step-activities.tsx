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

      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
            <Workflow className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Lesson Development</h3>
            <p className="text-[10px] text-muted-foreground">
              Write the lesson development in paragraph form covering Introduction, Development, and Conclusion phases
            </p>
          </div>
        </div>
        <textarea
          id="lesson-development"
          value={plan.lessonDevelopment}
          onChange={(e) => updateField("lessonDevelopment", e.target.value)}
          placeholder={`Introduction (~3\u20135 min)\nBegin with a brief recap of previous learning and introduce the lesson\u2019s objectives through an engaging starter activity...\n\nLesson Development (~30\u201335 min)\nGuide learners through the core content using a variety of learner-centred approaches...\n\nConclusion (~5 min)\nSummarise key takeaways, administer a quick assessment, and connect to the next lesson...`}
          rows={10}
          className="w-full rounded-xl border border-border/60 bg-background/50 px-4 py-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-y"
          aria-label="Lesson Development"
        />
        <p className="text-[10px] text-muted-foreground italic">
          Use the three KICD-recommended phases: Introduction, Lesson Development, and Conclusion.
        </p>
      </div>
    </motion.div>
  )
}

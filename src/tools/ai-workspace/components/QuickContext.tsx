"use client"

import { ChevronDown } from "lucide-react"
import { getLearningAreas } from "../curriculum"

interface QuickContextProps {
  grade: string
  learningArea: string
  strand: string
  subStrand: string
  duration: string
  onGradeChange: (v: string) => void
  onLearningAreaChange: (v: string) => void
  onStrandChange: (v: string) => void
  onSubStrandChange: (v: string) => void
  onDurationChange: (v: string) => void
}

export default function QuickContext({
  grade, learningArea, strand, subStrand, duration,
  onGradeChange, onLearningAreaChange, onStrandChange, onSubStrandChange, onDurationChange,
}: QuickContextProps) {
  const grades = ["Pre-Primary 1", "Pre-Primary 2", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9"]
  const learningAreas = grade ? getLearningAreas(grade) : []

  return (
    <div className="space-y-4 rounded-2xl border border-border/30 bg-card/50 p-3 sm:p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Quick Context
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" id="grade-label">Grade</label>
          <div className="relative">
            <select
              value={grade}
              onChange={(e) => {
                onGradeChange(e.target.value)
                onLearningAreaChange("")
                onStrandChange("")
                onSubStrandChange("")
              }}
              aria-labelledby="grade-label"
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20 appearance-none min-h-[44px]"
            >
              <option value="">Select Grade</option>
              {grades.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" id="area-label">Learning Area</label>
          <div className="relative">
            <select
              value={learningArea}
              onChange={(e) => {
                onLearningAreaChange(e.target.value)
                onStrandChange("")
                onSubStrandChange("")
              }}
              disabled={!grade}
              aria-labelledby="area-label"
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20 appearance-none min-h-[44px] disabled:opacity-40"
            >
              <option value="">Select Learning Area</option>
              {learningAreas.map((la) => (
                <option key={la} value={la}>{la}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" id="strand-label">Strand</label>
          <input
            type="text"
            value={strand}
            onChange={(e) => onStrandChange(e.target.value)}
            placeholder="Enter Strand"
            aria-labelledby="strand-label"
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20 min-h-[44px]"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" id="substrand-label">Sub-Strand</label>
          <input
            type="text"
            value={subStrand}
            onChange={(e) => onSubStrandChange(e.target.value)}
            placeholder="Enter Sub-Strand"
            aria-labelledby="substrand-label"
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20 min-h-[44px]"
          />
        </div>
      </div>
      <div className="w-full sm:w-1/2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" id="duration-label">Lesson Duration</label>
          <div className="relative">
            <select
              value={duration}
              onChange={(e) => onDurationChange(e.target.value)}
              aria-labelledby="duration-label"
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20 appearance-none min-h-[44px]"
            >
              <option value="30">30 Minutes</option>
              <option value="40">40 Minutes</option>
              <option value="60">60 Minutes</option>
              <option value="80">80 Minutes</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  )
}

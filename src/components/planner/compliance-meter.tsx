"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronDown, ShieldCheck } from "lucide-react"
import type { KICDPlan } from "@/lib/planner-types"

interface ComplianceMeterProps {
  plan: KICDPlan
}

const categories: { label: string; weight: number; key: keyof KICDPlan | "remarks"; min?: number }[] = [
  { label: "Grade selected", weight: 8, key: "grade" },
  { label: "Learning Area selected", weight: 8, key: "learningArea" },
  { label: "Strand mapped", weight: 12, key: "strand" },
  { label: "Sub-Strand selected", weight: 10, key: "subStrand" },
  { label: "Learning Outcomes", weight: 15, key: "outcomes", min: 2 },
  { label: "Core Competencies", weight: 10, key: "competencies", min: 2 },
  { label: "Values integrated", weight: 8, key: "values", min: 2 },
  { label: "PCIs addressed", weight: 8, key: "pcis", min: 1 },
  { label: "Teacher Activities", weight: 6, key: "teacherActivities", min: 2 },
  { label: "Learner Activities", weight: 6, key: "learnerActivities", min: 2 },
  { label: "Assessment Methods", weight: 5, key: "assessmentMethods", min: 2 },
  { label: "Remarks recorded", weight: 4, key: "remarks" },
]

function isEarned(plan: KICDPlan, cat: typeof categories[number]): boolean {
  if (cat.key === "remarks") return !!plan.remarks
  const val = plan[cat.key as keyof KICDPlan]
  if (typeof val === "string") return !!val
  if (Array.isArray(val)) return val.length >= (cat.min ?? 1)
  return false
}

export function ComplianceMeter({ plan }: ComplianceMeterProps) {
  const [showDetails, setShowDetails] = useState(false)

  const breakdown = useMemo(
    () => categories.map((c) => ({ label: c.label, weight: c.weight, earned: isEarned(plan, c) })),
    [plan],
  )

  const score = useMemo(() => {
    let s = 0
    breakdown.forEach((b) => { if (b.earned) s += b.weight })
    return Math.min(100, s)
  }, [breakdown])

  const earnedCount = useMemo(() => breakdown.filter((b) => b.earned).length, [breakdown])
  const totalCount = breakdown.length
  const ready = score >= 80

  const strokeDasharray = 2 * Math.PI * 36
  const strokeDashoffset = strokeDasharray - (score / 100) * strokeDasharray

  return (
    <div className="rounded-xl border border-border/40 bg-card p-4">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 100 100" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label={`CBC compliance score ${score}%`}>
            <circle cx="50" cy="50" r="36" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
            <motion.circle
              cx="50" cy="50" r="36" fill="none"
              stroke={ready ? "#16a34a" : "#eab308"}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              initial={{ strokeDashoffset: strokeDasharray }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-bold tabular-nums ${ready ? "text-green-600" : "text-amber-500"}`}>
              {score}%
            </span>
          </div>
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">CBC Compliance</p>
          <p className="text-xs text-muted-foreground">
            {earnedCount} of {totalCount} requirements completed
          </p>
          {ready && (
            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <ShieldCheck className="h-3 w-3" />
              Ready for KICD Submission
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        aria-expanded={showDetails}
        className="mt-3 w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted/10 transition-colors"
      >
        <ChevronDown className={`h-3 w-3 transition-transform ${showDetails ? "rotate-180" : ""}`} />
        {showDetails ? "Hide details" : "View Details"}
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-1 border-t border-border/40 mt-3">
              {breakdown.map((b) => (
                <div
                  key={b.label}
                  className="flex items-center gap-2 py-1"
                >
                  <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${
                    b.earned ? "bg-green-500/15 text-green-600" : "bg-muted/20 text-muted-foreground/50"
                  }`}>
                    {b.earned ? <Check className="h-2 w-2" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                  </span>
                  <span className={`text-xs ${b.earned ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
                    {b.label}
                  </span>
                  <span className={`ml-auto text-[10px] tabular-nums font-medium ${
                    b.earned ? "text-green-600/70" : "text-muted-foreground/40"
                  }`}>
                    {b.earned ? `+${b.weight}%` : `${b.weight}%`}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

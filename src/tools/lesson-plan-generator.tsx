"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar, Clock, ShieldCheck, Check, ChevronLeft, ChevronRight,
  Copy, Printer, FileDown, FileText,   BookOpen, RefreshCw, Eye,
  Save, Upload, Trash2, Circle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { trackToolUse, trackDownload } from "@/lib/analytics"
import type { KICDPlan, SavedPlan, WeeklyPlan, DayKey } from "@/lib/planner-types"
import { STORAGE_KEY, STEPS, DAY_LABELS } from "@/lib/planner-types"
import { initialPlan, LEARNING_AREAS_BY_GRADE, STRANDS_BY_AREA, SUBSTRANDS, OUTCOMES_BY_SUBSTRAND, SUBSTRAND_COMPETENCY_MAP, SUBSTRAND_VALUE_MAP, SUBSTRAND_PCI_MAP, REMARKS } from "@/lib/planner-data"
import { createEmptyPlan, getSmartFallbackOutcomes, formatPlan, formatPlanHTML, generatePDF as generatePDFUtil, computeComplianceScore } from "@/lib/planner-utils"
import { ComplianceMeter } from "@/components/planner/compliance-meter"
import { StepSetup } from "@/components/planner/step-setup"
import { StepCurriculum } from "@/components/planner/step-curriculum"
import { StepCompetencies } from "@/components/planner/step-competencies"
import { StepActivities } from "@/components/planner/step-activities"
import { StepAssessment } from "@/components/planner/step-assessment"
import { StepPreview } from "@/components/planner/step-preview"
import { LivePreview } from "@/components/planner/live-preview"

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
}

const stepLabels = ["Setup", "Curriculum", "Competencies", "Activities", "Assessment", "Review"] as const

export default function CBCLessonPlanner() {
  const [plan, setPlan] = useState<KICDPlan>({ ...initialPlan })
  const [generated, setGenerated] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [weeklyMode, setWeeklyMode] = useState(false)
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan>({
    monday: createEmptyPlan(), tuesday: createEmptyPlan(), wednesday: createEmptyPlan(),
    thursday: createEmptyPlan(), friday: createEmptyPlan(),
  })
  const [weeklyDay, setWeeklyDay] = useState<DayKey>("monday")
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>(() => {
    try {
      if (typeof window === "undefined") return []
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const [planName, setPlanName] = useState("")
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  const [biblicalVerseEnabled, setBiblicalVerseEnabled] = useState(false)
  const [biblicalVerse, setBiblicalVerse] = useState("")
  const [teacherReflectionNotes, setTeacherReflectionNotes] = useState("")
  const [curriculumConnection, setCurriculumConnection] = useState("")
  const [verseExplanation, setVerseExplanation] = useState("")
  const [valuesEnhancerEnabled, setValuesEnhancerEnabled] = useState(false)
  const [teacherPrivateNotes, setTeacherPrivateNotes] = useState("")
  const [includeNotesInExport, setIncludeNotesInExport] = useState(false)

  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saving" | "saved" | "idle">("idle")

  useEffect(() => {
    trackToolUse("cbc_lesson_planner", "tool_open")
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try { const saved = localStorage.getItem("toolforge_teacher_notes"); if (saved) setTeacherPrivateNotes(saved) } catch { /* ignore */ }
    })
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    try { localStorage.setItem("toolforge_teacher_notes", teacherPrivateNotes) } catch { /* ignore */ }
  }, [teacherPrivateNotes])

  useEffect(() => {
    const timer = setTimeout(() => {
      setAutoSaveStatus("saved")
      setLastSaved(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    }, 800)
    return () => clearTimeout(timer)
  }, [plan, weeklyPlans, biblicalVerse, teacherReflectionNotes])

  const activePlanObj = weeklyMode ? weeklyPlans[weeklyDay] : plan
  const complianceScore = computeComplianceScore(activePlanObj)

  const updateField = <K extends keyof KICDPlan>(key: K, value: KICDPlan[K]) => {
    if (weeklyMode) { setWeeklyPlans((prev) => ({ ...prev, [weeklyDay]: { ...prev[weeklyDay], [key]: value } })) }
    else { setPlan((prev) => ({ ...prev, [key]: value })) }
  }

  const setActivePlan = useCallback((newPlan: KICDPlan) => {
    if (weeklyMode) { setWeeklyPlans((prev) => ({ ...prev, [weeklyDay]: newPlan })) }
    else { setPlan(newPlan) }
  }, [weeklyMode, weeklyDay])

  const learningAreas = activePlanObj.grade ? LEARNING_AREAS_BY_GRADE[activePlanObj.grade] || [] : []
  const strands = activePlanObj.learningArea ? STRANDS_BY_AREA[activePlanObj.learningArea] || [] : []
  const subStrands = activePlanObj.strand ? SUBSTRANDS[activePlanObj.strand] || [] : []
  const suggestedOutcomes = activePlanObj.subStrand ? OUTCOMES_BY_SUBSTRAND[activePlanObj.subStrand] || [] : []

  const handleStrandChange = (strand: string) => {
    setActivePlan({ ...activePlanObj, strand, subStrand: "", outcomes: [], competencies: [], values: [], pcis: [] })
  }

  const handleSubStrandChange = (sub: string) => {
    setActivePlan({
      ...activePlanObj,
      subStrand: sub,
      outcomes: activePlanObj.outcomes.length > 0 ? activePlanObj.outcomes : (OUTCOMES_BY_SUBSTRAND[sub]?.slice(0, 2) || []),
      competencies: activePlanObj.competencies.length > 0 ? activePlanObj.competencies : (SUBSTRAND_COMPETENCY_MAP[sub] || []),
      values: activePlanObj.values.length > 0 ? activePlanObj.values : (SUBSTRAND_VALUE_MAP[sub] || []),
      pcis: activePlanObj.pcis.length > 0 ? activePlanObj.pcis : (SUBSTRAND_PCI_MAP[sub] || []),
    })
  }

  const toggleChip = (key: "competencies" | "values" | "pcis", item: string) => {
    const current = activePlanObj[key]
    updateField(key, current.includes(item) ? current.filter((v: string) => v !== item) : [...current, item])
  }

  const autoGenerateRemarks = () => {
    updateField("remarks", REMARKS[Math.floor(Math.random() * REMARKS.length)])
    toast.success("Remarks auto-generated")
  }

  const generate = () => {
    if (!activePlanObj.schoolName || !activePlanObj.teacherName || !activePlanObj.lessonDate || !activePlanObj.term || !activePlanObj.grade || !activePlanObj.learningArea || !activePlanObj.strand) { toast.error("Please fill in all required fields"); return }
    if (activePlanObj.outcomes.length === 0) { toast.error("Please select at least one Learning Outcome"); return }
    if (weeklyMode) {
      const incomplete = DAY_LABELS.map((d) => d.toLowerCase() as DayKey).filter((d) => !weeklyPlans[d].schoolName || !weeklyPlans[d].grade || !weeklyPlans[d].learningArea || !weeklyPlans[d].strand)
      if (incomplete.length > 0) { toast.error(`Some days are incomplete: ${incomplete.join(", ")}`); return }
    }
    setGenerated(true)
    trackToolUse("cbc_lesson_planner", "generate_lesson")
    toast.success(weeklyMode ? "Weekly lesson plans generated" : "KICD CBC lesson plan generated")
  }

  const resetForm = () => {
    if (weeklyMode) { setWeeklyPlans({ monday: createEmptyPlan(), tuesday: createEmptyPlan(), wednesday: createEmptyPlan(), thursday: createEmptyPlan(), friday: createEmptyPlan() }) }
    else { setPlan({ ...initialPlan }) }
    setGenerated(false)
    toast.success("Form reset")
  }

  const saveToStorage = (name: string) => {
    const toSave = weeklyMode ? weeklyPlans[weeklyDay] : plan
    const entry: SavedPlan = { id: Date.now().toString(), name: name || `Lesson Plan ${new Date().toLocaleDateString()}`, createdAt: new Date().toISOString(), plan: { ...toSave } }
    const updated = [...savedPlans, entry]
    setSavedPlans(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    toast.success("Lesson plan saved")
    setSaveDialogOpen(false)
    setPlanName("")
  }

  const loadFromStorage = (entry: SavedPlan) => {
    if (weeklyMode) { setWeeklyPlans((prev) => ({ ...prev, [weeklyDay]: { ...entry.plan } })) }
    else { setPlan({ ...entry.plan }) }
    setGenerated(true); setLoadDialogOpen(false); toast.success(`Loaded: ${entry.name}`)
  }
  const deleteSaved = (id: string) => { const updated = savedPlans.filter((s) => s.id !== id); setSavedPlans(updated); localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); toast.success("Plan deleted") }

  const duplicatePlan = () => {
    const src = weeklyMode ? weeklyPlans[weeklyDay] : plan
    const updated = { ...src, lessonNumber: String(Math.min(30, Number(src.lessonNumber) + 1)) }
    if (weeklyMode) { setWeeklyPlans((prev) => ({ ...prev, [weeklyDay]: updated })) }
    else { setPlan(updated) }
    toast.success("Plan duplicated (lesson number incremented)")
  }

  const handleCopy = useCallback(() => {
    const text = weeklyMode ? DAY_LABELS.map((d) => `=== ${d.toUpperCase()} ===\n${formatPlan(weeklyPlans[d.toLowerCase() as DayKey], biblicalVerseEnabled, biblicalVerse, teacherReflectionNotes, curriculumConnection, verseExplanation, includeNotesInExport, teacherPrivateNotes)}`).join("\n\n") : formatPlan(plan, biblicalVerseEnabled, biblicalVerse, teacherReflectionNotes, curriculumConnection, verseExplanation, includeNotesInExport, teacherPrivateNotes)
    navigator.clipboard.writeText(text)
    trackToolUse("cbc_lesson_planner", "copy")
    toast.success(weeklyMode ? "All weekly plans copied" : "Lesson plan copied to clipboard")
  }, [plan, weeklyMode, weeklyPlans, biblicalVerseEnabled, biblicalVerse, teacherReflectionNotes, curriculumConnection, verseExplanation, includeNotesInExport, teacherPrivateNotes])

  const handlePrint = useCallback(() => { trackToolUse("cbc_lesson_planner", "print"); window.print() }, [])

  const handlePDF = useCallback(() => {
    generatePDFUtil(plan, weeklyMode, weeklyPlans, biblicalVerseEnabled, biblicalVerse, teacherReflectionNotes, curriculumConnection, verseExplanation, includeNotesInExport, teacherPrivateNotes, trackDownload, (m) => toast.success(m), (m) => toast.error(m))
  }, [plan, weeklyMode, weeklyPlans, biblicalVerseEnabled, biblicalVerse, teacherReflectionNotes, curriculumConnection, verseExplanation, includeNotesInExport, teacherPrivateNotes])

  const handleDOCX = useCallback(() => {
    const content = weeklyMode ? DAY_LABELS.map((d) => `<h1 style="text-align:center">${d}</h1>${formatPlanHTML(weeklyPlans[d.toLowerCase() as DayKey], biblicalVerseEnabled, biblicalVerse, teacherReflectionNotes, curriculumConnection, verseExplanation, includeNotesInExport, teacherPrivateNotes)}`).join('<div style="page-break-before:always"></div>') : formatPlanHTML(plan, biblicalVerseEnabled, biblicalVerse, teacherReflectionNotes, curriculumConnection, verseExplanation, includeNotesInExport, teacherPrivateNotes)
    const blob = new Blob([content], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = weeklyMode ? "cbc-weekly-lesson-plans.doc" : "cbc-lesson-plan.doc"
    a.click()
    URL.revokeObjectURL(url)
    trackDownload("cbc_lesson_planner", "download_docx")
    toast.success("DOCX downloaded")
  }, [plan, weeklyMode, weeklyPlans, biblicalVerseEnabled, biblicalVerse, teacherReflectionNotes, curriculumConnection, verseExplanation, includeNotesInExport, teacherPrivateNotes])

  const canGoNext = currentStep === 1
    ? !!activePlanObj.schoolName && !!activePlanObj.teacherName && !!activePlanObj.lessonDate && !!activePlanObj.term && !!activePlanObj.grade && !!activePlanObj.learningArea
    : currentStep === 2
      ? !!activePlanObj.strand && activePlanObj.outcomes.length > 0
      : currentStep === 3
        ? activePlanObj.competencies.length > 0
        : currentStep === 4
          ? activePlanObj.teacherActivities.length > 0 && activePlanObj.learnerActivities.length > 0
          : true

  const goNext = () => { if (currentStep < 6) setCurrentStep((s) => s + 1) }
  const goPrev = () => { if (currentStep > 1) setCurrentStep((s) => s - 1) }

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <StepSetup plan={activePlanObj} updateField={updateField} setActivePlan={setActivePlan} learningAreas={learningAreas} />
      case 2: return <StepCurriculum plan={activePlanObj} updateField={updateField} setActivePlan={setActivePlan} handleStrandChange={handleStrandChange} handleSubStrandChange={handleSubStrandChange} strands={strands} subStrands={subStrands} suggestedOutcomes={suggestedOutcomes} getSmartFallbackOutcomes={getSmartFallbackOutcomes} />
      case 3: return <StepCompetencies plan={activePlanObj} updateField={updateField} toggleChip={toggleChip} biblicalVerseEnabled={biblicalVerseEnabled} setBiblicalVerseEnabled={setBiblicalVerseEnabled} biblicalVerse={biblicalVerse} setBiblicalVerse={setBiblicalVerse} teacherReflectionNotes={teacherReflectionNotes} setTeacherReflectionNotes={setTeacherReflectionNotes} curriculumConnection={curriculumConnection} setCurriculumConnection={setCurriculumConnection} verseExplanation={verseExplanation} setVerseExplanation={setVerseExplanation} valuesEnhancerEnabled={valuesEnhancerEnabled} setValuesEnhancerEnabled={setValuesEnhancerEnabled} />
      case 4: return <StepActivities plan={activePlanObj} updateField={updateField} />
      case 5: return <StepAssessment plan={activePlanObj} updateField={updateField} autoGenerateRemarks={autoGenerateRemarks} />
      case 6: return <StepPreview plan={plan} weeklyMode={weeklyMode} weeklyPlans={weeklyPlans} biblicalVerseEnabled={biblicalVerseEnabled} biblicalVerse={biblicalVerse} teacherReflectionNotes={teacherReflectionNotes} curriculumConnection={curriculumConnection} verseExplanation={verseExplanation} includeNotesInExport={includeNotesInExport} setIncludeNotesInExport={setIncludeNotesInExport} teacherPrivateNotes={teacherPrivateNotes} setTeacherPrivateNotes={setTeacherPrivateNotes} handleCopy={handleCopy} handlePDF={handlePDF} handleDOCX={handleDOCX} handlePrint={handlePrint} setSaveDialogOpen={setSaveDialogOpen} setLoadDialogOpen={setLoadDialogOpen} duplicatePlan={duplicatePlan} />
    }
  }

  const complianceReady = complianceScore >= 80

  const exportBtnClass =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border/40 bg-muted/10 hover:bg-muted/20 transition-colors min-h-[44px]"
  const exportPrimaryClass =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border/40 bg-primary/5 text-primary hover:bg-primary/10 transition-colors min-h-[44px]"
  const exportBlueClass =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border/40 bg-blue-500/5 text-blue-600 hover:bg-blue-500/10 transition-colors min-h-[44px]"
  const actionBtnClass =
    "w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-border/40 bg-muted/10 hover:bg-muted/20 transition-colors min-h-[44px]"

  const renderExportSection = (grid: boolean) => (
    <div className="rounded-xl border border-border/40 bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground mb-3">Export</p>
      <div className={grid ? "grid grid-cols-2 gap-2" : "flex flex-wrap gap-2"}>
        <button type="button" onClick={handleCopy} className={exportBtnClass}><Copy className="h-3.5 w-3.5" /> Copy</button>
        <button type="button" onClick={handlePrint} className={exportBtnClass}><Printer className="h-3.5 w-3.5" /> Print</button>
        <button type="button" onClick={handlePDF} className={exportPrimaryClass}><FileDown className="h-3.5 w-3.5" /> PDF</button>
        <button type="button" onClick={handleDOCX} className={exportBlueClass}><FileText className="h-3.5 w-3.5" /> DOCX</button>
      </div>
    </div>
  )

  const renderActionsSection = () => (
    <div className="rounded-xl border border-border/40 bg-card p-4 space-y-2">
      <button type="button" onClick={() => setSaveDialogOpen(true)} className={actionBtnClass}>
        <Save className="h-3.5 w-3.5" /> Save Plan
      </button>
      <button type="button" onClick={() => setLoadDialogOpen(true)} className={actionBtnClass}>
        <Upload className="h-3.5 w-3.5" /> Load Saved
      </button>
      <button type="button" onClick={duplicatePlan} className={actionBtnClass}>
        <FileText className="h-3.5 w-3.5" /> Duplicate
      </button>
    </div>
  )

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 print:hidden space-y-4 sm:space-y-6">

        {/* ── HEADER ── */}
        <motion.div {...fadeUp} className="flex items-start justify-between gap-3 sm:gap-6">
          <div className="space-y-0 sm:space-y-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">CBC Lesson Planner</h1>
            <p className="hidden sm:block text-sm text-muted-foreground">
              Create KICD-compliant lesson plans with live validation and one-click export.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              type="button"
              onClick={() => { setWeeklyMode(!weeklyMode); setGenerated(false) }}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border transition-all ${
                weeklyMode
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border/40 text-muted-foreground hover:border-primary/30"
              }`}
            >
              <Calendar className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
              <span className="hidden sm:inline">Weekly</span>
              <span className="sm:hidden">Wk</span>
            </button>

            {autoSaveStatus === "saved" && (
              <span className="hidden sm:flex text-xs text-muted-foreground items-center gap-1">
                <Clock className="h-3 w-3" />
                Saved {lastSaved ? `\u2022 ${lastSaved}` : ""}
              </span>
            )}

            <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium border ${
              complianceReady
                ? "bg-green-500/8 text-green-600 border-green-500/20"
                : "bg-amber-500/8 text-amber-600 border-amber-500/20"
            }`}>
              <ShieldCheck className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
              <span className="hidden sm:inline">{complianceReady ? "KICD Ready" : `${complianceScore}% KICD`}</span>
              <span className="sm:hidden">{complianceScore}%</span>
            </span>
          </div>
        </motion.div>

        <Separator />

        {/* ── MOBILE STEP INDICATOR ── */}
        <div className="sm:hidden flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Step {currentStep} of 6 — {stepLabels[currentStep - 1]}
          </span>
          <div className="flex items-center gap-1">
            {currentStep > 1 && (
              <button type="button" onClick={goPrev}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted/10 transition-colors min-h-[44px]"
                aria-label="Previous step"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
            )}
            <button type="button" onClick={currentStep < 6 ? goNext : undefined} disabled={currentStep < 6 ? !canGoNext : false}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-foreground hover:bg-muted/10 transition-colors disabled:opacity-40 min-h-[44px]"
            >
              {currentStep < 6 ? (
                <><ChevronRight className="h-3 w-3" /> Next</>
              ) : (
                <Check className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>

        {/* ── HORIZONTAL STEP NAVIGATION (sm+) ── */}
        <motion.nav {...fadeUp} className="hidden sm:flex items-center gap-0">
          {STEPS.map((step) => {
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className="flex-1 flex flex-col items-center gap-1.5 pb-3 relative group"
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium border transition-all ${
                  isActive
                    ? "bg-primary text-white border-primary"
                    : isCompleted
                      ? "bg-green-500/10 text-green-600 border-green-500/30"
                      : "bg-muted/10 text-muted-foreground/50 border-border/40 group-hover:border-border/60"
                }`}>
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                </div>
                <span className={`text-xs font-medium ${
                  isActive ? "text-foreground" : isCompleted ? "text-green-600" : "text-muted-foreground/50"
                }`}>
                  {step.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="step-underline"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                  />
                )}
              </button>
            )
          })}
        </motion.nav>

        {/* ── WEEKLY DAY TABS (scrollable on mobile) ── */}
        {weeklyMode && (
          <motion.div {...fadeUp} className="flex items-center gap-2 overflow-x-auto flex-nowrap pb-1 scrollbar-none">
            {DAY_LABELS.map((day) => {
              const key = day.toLowerCase() as DayKey
              const filled = !!weeklyPlans[key].grade && !!weeklyPlans[key].learningArea && !!weeklyPlans[key].strand
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setWeeklyDay(key)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border transition-all ${
                    weeklyDay === key
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : filled
                        ? "bg-green-500/5 text-green-600 border-green-500/20"
                        : "border-border/40 text-muted-foreground hover:border-border/60"
                  }`}
                >
                  {day} {filled && <Check className="h-3 w-3 inline ml-1" />}
                </button>
              )
            })}
          </motion.div>
        )}

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] xl:grid-cols-[240px_1fr_360px] gap-4 sm:gap-6 items-start">

          {/* ====== LEFT (xl+ only): Compliance + Export + Actions ====== */}
          <div className="hidden xl:flex xl:flex-col xl:gap-6 xl:sticky xl:top-6">
            <motion.div {...fadeUp}>
              <ComplianceMeter plan={activePlanObj} />
            </motion.div>
            <motion.div {...fadeUp}>
              {renderExportSection(false)}
            </motion.div>
            <motion.div {...fadeUp}>
              {renderActionsSection()}
            </motion.div>
          </div>

          {/* ====== CENTER: Form ====== */}
          <main className="space-y-4 sm:space-y-6 min-w-0">
            <motion.div {...fadeUp} className="rounded-2xl border border-border/40 bg-card shadow-sm">
              <div className="p-4 sm:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation (hidden on mobile, shown sm+) */}
              <div className="hidden sm:flex items-center justify-between px-8 pb-6">
                <div className="flex gap-2">
                  {currentStep > 1 && (
                    <Button variant="outline" size="sm" onClick={goPrev}>
                      <ChevronLeft className="h-3.5 w-3.5" /> Back
                    </Button>
                  )}
                  {currentStep < 6 ? (
                    <Button size="sm" onClick={goNext} disabled={!canGoNext}>
                      Continue <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  {currentStep === 6 && (
                    <Button onClick={generate} size="sm">
                      <BookOpen className="h-3.5 w-3.5" /> {weeklyMode ? "Generate Weekly Plans" : "Generate KICD Plan"}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={resetForm}>
                    <RefreshCw className="h-3.5 w-3.5" /> Reset
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Step helper text (hidden on mobile) */}
            <p className="hidden sm:block text-xs text-muted-foreground text-center">
              {currentStep === 1 && "Enter school info and select curriculum level to begin."}
              {currentStep === 2 && "Choose Strand and Sub-Strand. Learning Outcomes auto-suggest based on your Sub-Strand selection."}
              {currentStep === 3 && "Competencies, Values, and PCIs are auto-suggested from your Sub-Strand."}
              {currentStep === 4 && "Select teacher and learner activities from the lists."}
              {currentStep === 5 && "Choose assessment methods and optionally auto-generate remarks."}
              {currentStep === 6 && "Review your plan, then export as Copy, PDF, DOCX, or Print."}
            </p>

            {/* ── Mobile: Compliance ── */}
            <div className="md:hidden">
              <ComplianceMeter plan={activePlanObj} />
            </div>

            {/* ── Mobile: Preview accordion ── */}
            <div className="md:hidden">
              {mobilePreviewOpen ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-xl border border-border/40 bg-card overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 pt-3">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" /> Live Preview
                    </span>
                    <button
                      type="button"
                      onClick={() => setMobilePreviewOpen(false)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Hide
                    </button>
                  </div>
                  <LivePreview
                    plan={activePlanObj}
                    generated={generated}
                    biblicalVerseEnabled={biblicalVerseEnabled}
                    biblicalVerse={biblicalVerse}
                    teacherReflectionNotes={teacherReflectionNotes}
                    curriculumConnection={curriculumConnection}
                    verseExplanation={verseExplanation}
                    includeNotesInExport={includeNotesInExport}
                    teacherPrivateNotes={teacherPrivateNotes}
                    updateField={updateField}
                  />
                </motion.div>
              ) : (
                <button
                  type="button"
                  onClick={() => setMobilePreviewOpen(true)}
                  className="w-full rounded-xl border border-border/40 bg-card p-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-center"
                >
                  <Eye className="h-4 w-4 inline mr-2" />
                  Tap to View Preview
                </button>
              )}
            </div>

            {/* ── Mobile: Export 2×2 grid ── */}
            <div className="md:hidden">
              {renderExportSection(true)}
            </div>

            {/* ── Mobile: Actions ── */}
            <div className="md:hidden">
              {renderActionsSection()}
            </div>
          </main>

          {/* ====== RIGHT (md-xl + xl): Preview / Compliance / Export / Actions ====== */}
          <aside className="hidden md:flex md:flex-col md:gap-6 md:sticky md:top-6">
            {/* Compliance: md-xl only (hidden on xl+, moved to left column) */}
            <div className="xl:hidden">
              <motion.div {...fadeUp}>
                <ComplianceMeter plan={activePlanObj} />
              </motion.div>
            </div>

            {/* Preview: md-xl only on step 6, xl+ always */}
            <div className={`hidden ${currentStep === 6 ? 'md:block' : 'xl:block'}`}>
              <motion.div {...fadeUp}>
                <div className="rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden">
                  <LivePreview
                    plan={activePlanObj}
                    generated={generated}
                    biblicalVerseEnabled={biblicalVerseEnabled}
                    biblicalVerse={biblicalVerse}
                    teacherReflectionNotes={teacherReflectionNotes}
                    curriculumConnection={curriculumConnection}
                    verseExplanation={verseExplanation}
                    includeNotesInExport={includeNotesInExport}
                    teacherPrivateNotes={teacherPrivateNotes}
                    updateField={updateField}
                  />
                </div>
              </motion.div>
            </div>

            {/* Export + Actions: md-xl only (hidden on xl+, moved to left column) */}
            <div className="xl:hidden space-y-6">
              <motion.div {...fadeUp}>
                {renderExportSection(false)}
              </motion.div>
              <motion.div {...fadeUp}>
                {renderActionsSection()}
              </motion.div>
            </div>
          </aside>
        </div>

        {/* Bottom spacer for mobile sticky nav */}
        <div className="h-20 sm:hidden" />
      </div>

      {/* ── MOBILE STICKY BOTTOM NAV ── */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden z-50 border-t border-border/40 bg-background/95 backdrop-blur-md px-4 py-3 safe-bottom">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" size="sm" onClick={goPrev} className="min-h-[44px]">
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {currentStep < 6 ? (
              <Button size="sm" onClick={goNext} disabled={!canGoNext} className="min-h-[44px]">
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={generate} size="sm" className="min-h-[44px]">
                <BookOpen className="h-4 w-4" /> Generate
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={resetForm} className="text-muted-foreground min-h-[44px] min-w-[44px]" aria-label="Reset form">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ====== SAVE DIALOG ====== */}
      {saveDialogOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="save-dialog-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setSaveDialogOpen(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-background rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-border/30" onClick={(e) => e.stopPropagation()}>
            <h3 id="save-dialog-title" className="font-semibold text-sm mb-4">Save Lesson Plan</h3>
            <Input value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="Enter plan name..." className="mb-4 h-10" autoFocus onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveToStorage(planName) } }} />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={() => saveToStorage(planName)} disabled={!planName.trim()}>Save</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ====== LOAD DIALOG ====== */}
      {loadDialogOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="load-dialog-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setLoadDialogOpen(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-background rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[70vh] overflow-y-auto border border-border/30" onClick={(e) => e.stopPropagation()}>
            <h3 id="load-dialog-title" className="font-semibold text-sm mb-4">Saved Lesson Plans</h3>
            {savedPlans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted/30 p-3 mb-3">
                  <Upload className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No saved plans yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Save your first lesson plan to see it here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedPlans.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-xl border border-border/30 p-3 hover:bg-muted/10 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{entry.name}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString()} | {entry.plan.grade} | {entry.plan.learningArea}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button variant="ghost" size="icon-sm" onClick={() => loadFromStorage(entry)} aria-label={`Load ${entry.name}`}><Upload className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => deleteSaved(entry.id)} aria-label={`Delete ${entry.name}`}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end"><Button variant="outline" size="sm" onClick={() => setLoadDialogOpen(false)}>Close</Button></div>
          </motion.div>
        </div>
      )}

      {/* ====== PRINT OUTPUT ====== */}
      {generated && !weeklyMode && (
        <div className="print:block hidden print:mt-4">
          <div className="rounded-lg border bg-muted/20 p-4 text-sm space-y-3 leading-relaxed">
            <div className="font-bold text-base">KICD COMPETENCY-BASED LESSON PLAN</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {plan.schoolName && <div className="col-span-2"><span className="font-semibold">School:</span> {plan.schoolName}</div>}
              {plan.teacherName && <div className="col-span-2"><span className="font-semibold">Teacher:</span> {plan.teacherName}</div>}
              {plan.lessonDate && <div><span className="font-semibold">Date:</span> {plan.lessonDate}</div>}
              {(plan.term || plan.week) && <div><span className="font-semibold">Term & Week:</span> {plan.term || "\u2014"} / Week {plan.week || "\u2014"}</div>}
              {plan.topicTitle && <div className="col-span-2"><span className="font-semibold">Topic:</span> {plan.topicTitle}</div>}
              <div><span className="font-semibold">Grade:</span> {plan.grade}</div>
              <div><span className="font-semibold">Learning Area:</span> {plan.learningArea}</div>
              <div><span className="font-semibold">Strand:</span> {plan.strand}</div>
              <div><span className="font-semibold">Sub-Strand:</span> {plan.subStrand || "\u2014"}</div>
              <div><span className="font-semibold">Lesson No:</span> {plan.lessonNumber}</div>
              <div><span className="font-semibold">Duration:</span> {plan.duration} min</div>
            </div>
            <Separator />
            <div><span className="font-semibold">1. Learning Outcomes</span><ul className="list-disc list-inside text-muted-foreground mt-0.5 space-y-0.5">{plan.outcomes.length ? plan.outcomes.map((o, i) => <li key={i}>{o}</li>) : <li className="list-none text-muted-foreground">\u2014</li>}</ul></div>
            {plan.successCriteria.length > 0 && <div><span className="font-semibold">2. Success Criteria</span><ul className="list-disc list-inside text-muted-foreground mt-0.5 space-y-0.5">{plan.successCriteria.map((s, i) => <li key={i} className="text-xs">{s}</li>)}</ul></div>}
            {plan.keyInquiryQuestion && <div><span className="font-semibold">3. Key Inquiry Question</span><p className="text-xs text-muted-foreground mt-0.5 italic">{plan.keyInquiryQuestion}</p></div>}
            <div><span className="font-semibold">4. Core Competencies</span><div className="flex flex-wrap gap-1 mt-0.5">{plan.competencies.length ? plan.competencies.map((c) => <span key={c} className="px-2 py-0.5 rounded-full bg-primary/10 text-xs">{c}</span>) : <span className="text-muted-foreground">\u2014</span>}</div></div>
            <div><span className="font-semibold">5. Values</span><div className="flex flex-wrap gap-1 mt-0.5">{plan.values.length ? plan.values.map((v) => <span key={v} className="px-2 py-0.5 rounded-full bg-green-500/10 text-xs">{v}</span>) : <span className="text-muted-foreground">\u2014</span>}</div></div>
            <div><span className="font-semibold">6. Pertinent and Contemporary Issues (PCIs)</span><div className="flex flex-wrap gap-1 mt-0.5">{plan.pcis.length ? plan.pcis.map((p) => <span key={p} className="px-2 py-0.5 rounded-full bg-purple-500/10 text-xs">{p}</span>) : <span className="text-muted-foreground">\u2014</span>}</div></div>
            <div><span className="font-semibold">7. Learning Resources</span><ul className="list-disc list-inside text-muted-foreground mt-0.5 space-y-0.5">{plan.resources.length ? plan.resources.map((r, i) => <li key={i}>{r}</li>) : <li className="list-none text-muted-foreground">\u2014</li>}</ul></div>
            {plan.lessonDevelopment && (
              <div><span className="font-semibold">8. Lesson Development</span><div className="mt-1 space-y-1 text-xs text-muted-foreground leading-relaxed">{plan.lessonDevelopment.split("\n").filter(l => l.trim()).map((line, i) => { const t = line.trim(); return /^(Introduction|Lesson Development|Conclusion)/i.test(t) ? <p key={i} className="font-semibold text-foreground/80">{t}</p> : <p key={i} className="text-justify">{t}</p> })}</div></div>
            )}
            <div><span className="font-semibold">9. Assessment</span><ul className="list-disc list-inside text-muted-foreground mt-0.5 space-y-0.5">{plan.assessmentMethods.length ? plan.assessmentMethods.map((a, i) => <li key={i}>{a}</li>) : <li className="list-none text-muted-foreground">\u2014</li>}</ul></div>
            <div><span className="font-semibold">10. Reflection:</span> {plan.remarks || "\u2014"}</div>
            {includeNotesInExport && teacherPrivateNotes.trim() && <div className="border-t pt-2 mt-2"><span className="font-semibold text-muted-foreground text-xs">Teacher Notes (Private):</span><p className="text-muted-foreground text-xs mt-0.5 whitespace-pre-wrap">{teacherPrivateNotes}</p></div>}
          </div>
        </div>
      )}

      {generated && weeklyMode && (
        <div className="print:block hidden print:mt-4 space-y-6">
          {DAY_LABELS.map((day) => {
            const p = weeklyPlans[day.toLowerCase() as DayKey]
            return (
              <div key={day} className="rounded-lg border bg-muted/20 p-4 text-sm space-y-3 leading-relaxed">
                <div className="font-bold text-base text-primary">{day.toUpperCase()}</div>
                <div className="font-bold text-sm">KICD COMPETENCY-BASED LESSON PLAN</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {p.schoolName && <div className="col-span-2"><span className="font-semibold">School:</span> {p.schoolName}</div>}
                  {p.teacherName && <div className="col-span-2"><span className="font-semibold">Teacher:</span> {p.teacherName}</div>}
                  {p.lessonDate && <div><span className="font-semibold">Date:</span> {p.lessonDate}</div>}
                  {(p.term || p.week) && <div><span className="font-semibold">Term & Week:</span> {p.term || "\u2014"} / Week {p.week || "\u2014"}</div>}
                  {p.topicTitle && <div className="col-span-2"><span className="font-semibold">Topic:</span> {p.topicTitle}</div>}
                  <div><span className="font-semibold">Grade:</span> {p.grade}</div>
                  <div><span className="font-semibold">Learning Area:</span> {p.learningArea}</div>
                  <div><span className="font-semibold">Strand:</span> {p.strand}</div>
                  <div><span className="font-semibold">Sub-Strand:</span> {p.subStrand || "\u2014"}</div>
                  <div><span className="font-semibold">Lesson No:</span> {p.lessonNumber}</div>
                  <div><span className="font-semibold">Duration:</span> {p.duration} min</div>
                </div>
                <Separator />
                <div><span className="font-semibold">1. Learning Outcomes</span><ul className="list-disc list-inside text-muted-foreground mt-0.5">{p.outcomes.map((o, i) => <li key={i}>{o}</li>)}</ul></div>
                {p.successCriteria.length > 0 && <div><span className="font-semibold">2. Success Criteria</span><ul className="list-disc list-inside text-muted-foreground mt-0.5">{p.successCriteria.map((s, i) => <li key={i}>{s}</li>)}</ul></div>}
                {p.keyInquiryQuestion && <div><span className="font-semibold">3. Key Inquiry Question</span><p className="text-xs text-muted-foreground mt-0.5 italic">{p.keyInquiryQuestion}</p></div>}
                <div><span className="font-semibold">4. Core Competencies</span><div className="flex flex-wrap gap-1 mt-0.5">{p.competencies.length ? p.competencies.map((c) => <span key={c} className="px-2 py-0.5 rounded-full bg-primary/10 text-xs">{c}</span>) : <span className="text-muted-foreground">\u2014</span>}</div></div>
                <div><span className="font-semibold">5. Values</span><div className="flex flex-wrap gap-1 mt-0.5">{p.values.length ? p.values.map((v) => <span key={v} className="px-2 py-0.5 rounded-full bg-green-500/10 text-xs">{v}</span>) : <span className="text-muted-foreground">\u2014</span>}</div></div>
                <div><span className="font-semibold">6. Pertinent and Contemporary Issues (PCIs)</span><div className="flex flex-wrap gap-1 mt-0.5">{p.pcis.length ? p.pcis.map((pc) => <span key={pc} className="px-2 py-0.5 rounded-full bg-purple-500/10 text-xs">{pc}</span>) : <span className="text-muted-foreground">\u2014</span>}</div></div>
                <div><span className="font-semibold">7. Learning Resources</span><ul className="list-disc list-inside text-muted-foreground mt-0.5">{p.resources.map((r, i) => <li key={i}>{r}</li>)}</ul></div>
                {p.lessonDevelopment && (
                  <div><span className="font-semibold">8. Lesson Development</span><div className="mt-1 space-y-1 text-xs text-muted-foreground leading-relaxed">{p.lessonDevelopment.split("\n").filter(l => l.trim()).map((line, i) => { const t = line.trim(); return /^(Introduction|Lesson Development|Conclusion)/i.test(t) ? <p key={i} className="font-semibold text-foreground/80">{t}</p> : <p key={i} className="text-justify">{t}</p> })}</div></div>
                )}
                <div><span className="font-semibold">9. Assessment</span><div className="flex flex-wrap gap-1 mt-0.5">{p.assessmentMethods.length ? p.assessmentMethods.map((a) => <span key={a} className="px-2 py-0.5 rounded-full bg-red-500/10 text-xs">{a}</span>) : <span className="text-muted-foreground">\u2014</span>}</div></div>
                {p.remarks && <div><span className="font-semibold">10. Reflection:</span> {p.remarks}</div>}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

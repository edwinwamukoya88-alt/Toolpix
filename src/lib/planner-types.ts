export interface KICDPlan {
  grade: string
  learningArea: string
  strand: string
  subStrand: string
  lessonNumber: string
  duration: string
  schoolName: string
  teacherName: string
  lessonDate: string
  term: string
  week: string
  topicTitle: string
  outcomes: string[]
  successCriteria: string[]
  keyInquiryQuestion: string
  competencies: string[]
  values: string[]
  pcis: string[]
  teacherActivities: string[]
  learnerActivities: string[]
  resources: string[]
  assessmentMethods: string[]
  remarks: string
  lessonDevelopment: string
  customGrades: string[]
  customLearningAreas: string[]
  customStrands: string[]
  customSubStrands: string[]
}

export interface SavedPlan {
  id: string
  name: string
  createdAt: string
  plan: KICDPlan
}

export interface WeeklyPlan {
  monday: KICDPlan
  tuesday: KICDPlan
  wednesday: KICDPlan
  thursday: KICDPlan
  friday: KICDPlan
}

export type DayKey = keyof WeeklyPlan

export const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const

export interface ComplianceBreakdown {
  label: string
  weight: number
  earned: boolean
  deduction: number
}

export interface BibleVerse {
  ref: string
  text: string
  explanation: string
}

export interface VerseSuggestion {
  verseRef: string
  connection: string
  explanation: string
}

export const STORAGE_KEY = "toolforge_lesson_plans"

export const STEPS = [
  { id: 1, label: "Lesson Setup", desc: "School metadata & curriculum level" },
  { id: 2, label: "Curriculum", desc: "Strand, sub-strand & outcomes" },
  { id: 3, label: "Competencies", desc: "Competencies, values & PCIs" },
  { id: 4, label: "Activities", desc: "Teacher & learner activities" },
  { id: 5, label: "Assessment", desc: "Methods & remarks" },
  { id: 6, label: "Preview", desc: "Review & export" },
]

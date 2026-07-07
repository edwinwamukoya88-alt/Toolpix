"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import {
  CalendarDays, Copy, Printer, FileDown, Trash2,
  User, GraduationCap, School, Calendar, BookOpen,
  Target, Brain, ListChecks, Sparkles,
  CheckCircle2, AlertCircle, Clock, ArrowRight,
  TrendingUp, Zap, AlertTriangle, Lightbulb,
  RefreshCw, Eye, ArrowDown, UserCheck,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { trackToolUse, trackDownload } from "@/lib/analytics"

const cbcLearningAreas: Record<string, { strands: Record<string, string[]> }> = {
  Mathematics: {
    strands: {
      Numbers: ["Place value", "Operations", "Fractions", "Decimals", "Percentages", "Ratios & proportions"],
      Algebra: ["Patterns & sequences", "Algebraic expressions", "Equations", "Inequalities"],
      Measurement: ["Length", "Mass", "Capacity", "Time", "Money", "Perimeter & area", "Volume"],
      Geometry: ["Shapes & solids", "Lines & angles", "Symmetry", "Transformations", "Position & direction"],
      "Data Handling": ["Data collection", "Data presentation", "Data interpretation", "Probability"],
    },
  },
  English: {
    strands: {
      "Listening & Speaking": ["Pronunciation", "Oral narratives", "Conversations", "Presentations", "Debates"],
      Reading: ["Phonics & word recognition", "Comprehension", "Fluency", "Vocabulary building", "Critical reading"],
      Writing: ["Handwriting", "Composition", "Spelling", "Punctuation", "Creative writing"],
      Grammar: ["Parts of speech", "Tenses", "Sentence structure", "Punctuation rules"],
      "Language & Literature": ["Poetry", "Prose", "Drama", "Oral literature"],
    },
  },
  Kiswahili: {
    strands: {
      "Kusikiliza na Kuzungumza": ["Matamshi", "Mazungumzo", "Simulizi", "Hotuba", "Majadiliano"],
      Kusoma: ["Sauti na maneno", "Ufahamu", "Msamiati", "Usomaji makini"],
      Kuandika: ["Uandishi wa herufi", "Insha", "Tahajia", "Uandishi wa insha"],
      Sarufi: ["Aina za maneno", "Ngeli", "Tenses", "Muundo wa sentensi"],
      "Fasihi": ["Ushairi", "Nathari", "Tamthilia", "Fasihi simulizi"],
    },
  },
  "Integrated Science": {
    strands: {
      "Living Things": ["Plants", "Animals", "Human body", "Health & nutrition", "Life cycles"],
      Environment: ["Ecosystems", "Weather & climate", "Conservation", "Pollution"],
      "Matter & Energy": ["States of matter", "Forces & motion", "Energy forms", "Light & sound", "Electricity"],
      "Earth & Space": ["Rocks & minerals", "Solar system", "Weather patterns", "Natural resources"],
    },
  },
  "Social Studies": {
    strands: {
      "Physical Environment": ["Map reading", "Weather & climate", "Vegetation", "Landforms"],
      "Social Relations": ["Family & community", "Culture & diversity", "Conflict resolution"],
      Resources: ["Natural resources", "Economic activities", "Entrepreneurship"],
      Citizenship: ["Rights & responsibilities", "Governance", "Law & order", "National values"],
      History: ["Kenyan heritage", "Great leaders", "Historical events"],
    },
  },
  "Creative Arts & Sports": {
    strands: {
      "Visual Arts": ["Drawing & painting", "Modeling & sculpture", "Design", "Patterns & decoration"],
      Music: ["Singing", "Musical instruments", "Rhythm & movement", "Music appreciation"],
      "Physical Education": ["Athletics", "Games", "Gymnastics", "Swimming", "Outdoor activities"],
      "Dance & Drama": ["Creative movement", "Drama & role play", "Cultural dances"],
    },
  },
  Agriculture: {
    strands: {
      "Plants & Crops": ["Crop types", "Planting", "Crop care", "Harvesting"],
      "Animals": ["Livestock types", "Animal care", "Animal products"],
      "Farming Practices": ["Soil preparation", "Organic farming", "Pest control", "Irrigation"],
      "Food & Nutrition": ["Food groups", "Meal planning", "Food preservation"],
    },
  },
  "Pre-Technical & Pre-Career Education": {
    strands: {
      "Technical Skills": ["Materials & tools", "Measurement", "Drawing & design", "Construction"],
      "Career Awareness": ["Career clusters", "Workplace skills", "Entrepreneurship"],
      "Digital Literacy": ["Computer basics", "Internet safety", "Digital tools"],
      "Life Skills": ["Problem solving", "Decision making", "Financial literacy"],
    },
  },
  "Business Studies": {
    strands: {
      "Business & Enterprise": ["Business types", "Entrepreneurship", "Business plans"],
      "Money & Finance": ["Savings", "Budgeting", "Banking services", "Investments"],
      "Goods & Services": ["Production", "Distribution", "Trade", "Consumer rights"],
    },
  },
  "Religious Education": {
    strands: {
      "Beliefs & Values": ["Faith & worship", "Moral values", "Ethical decisions"],
      "Sacred Texts": ["Scriptures", "Teachings", "Stories & lessons"],
      "Community & Service": ["Family & community", "Service to others", "Celebrations"],
    },
  },
  "Health Education": {
    strands: {
      "Personal Hygiene": ["Body care", "Dental health", "Sanitation"],
      "Nutrition": ["Balanced diet", "Meal planning", "Food safety"],
      "Disease Prevention": ["Common illnesses", "Immunization", "First aid"],
      "Mental Health": ["Emotions", "Stress management", "Healthy relationships"],
    },
  },
}

const skillBanks: Record<string, string[]> = {
  "Communication & Collaboration": [
    "Practice presenting findings to a family member",
    "Write a short paragraph about a topic studied",
    "Role-play a conversation using new vocabulary",
    "Record yourself explaining a concept",
    "Design a poster to share what you learned",
    "Prepare a 2-minute talk on a topic of interest",
    "Write a simple report on a practical activity",
    "Discuss a real-life problem and suggest solutions",
    "Work with a partner to complete a task",
    "Practice taking turns during group activities",
    "Help a classmate who is struggling with a concept",
    "Participate in a group discussion and share ideas",
    "Complete a group project with assigned roles",
    "Practice active listening during peer presentations",
    "Give constructive feedback to a partner",
    "Collaborate on solving a community problem",
  ],
  "Critical Thinking & Problem Solving": [
    "Sort objects by size, colour, and shape",
    "Find three different ways to solve a problem",
    "Observe an experiment and record changes",
    "Compare two different items and list differences",
    "Identify patterns in your environment",
    "Solve a puzzle using logical reasoning",
    "Make a prediction and test it with an activity",
    "Categorise items based on their properties",
  ],
  "Creativity & Imagination": [
    "Draw or model something related to the topic",
    "Build a simple prototype using household items",
    "Create a song or poem about what you learned",
    "Design a solution to a common problem",
    "Make a collage using recycled materials",
    "Invent a new use for an everyday object",
    "Create a mind map connecting ideas",
    "Compose a short story based on a theme",
  ],
  Citizenship: [
    "Identify a community need and propose a solution",
    "Research a national leader and their contributions",
    "Participate in a school or community clean-up",
    "Discuss the importance of national values",
    "Create a chart showing rights and responsibilities",
    "Role-play how to resolve a conflict peacefully",
    "Write about a cultural tradition in your community",
    "Plan a small service project for the community",
  ],
  "Digital Literacy": [
    "Use a tablet or computer to research a topic",
    "Practice typing a short paragraph",
    "Create a simple digital drawing or design",
    "Use an educational app to practice skills",
    "Watch an educational video and summarise it",
    "Navigate a website safely with guidance",
    "Use a calculator to check math work",
    "Take a photo of your project and describe it",
  ],
  "Self-Efficacy": [
    "Set a personal learning goal for the week",
    "Reflect on one thing you learned well today",
    "Try a challenging task without giving up",
    "Celebrate a small achievement with a positive note",
    "Practice a skill until you feel confident",
    "Ask for help when you need it",
    "Complete a task independently from start to finish",
    "Write one thing you will improve tomorrow",
  ],
}

const projectIdeas = [
  "Design a simple water harvesting system using local materials.",
  "Create a weather chart and record daily observations for one week.",
  "Plant seeds and observe germination and growth over 14 days.",
  "Interview a community member about a local tradition.",
  "Build a model of a healthy meal using the food groups.",
  "Create a family tree showing three generations.",
  "Design a poster promoting environmental conservation.",
  "Make a simple musical instrument from recycled materials.",
  "Create a budget for a small family event.",
  "Map the route from home to school, noting landmarks.",
  "Conduct a simple survey and present findings in a chart.",
  "Create a diary of a plant or animal in the local environment.",
]

const coreCompetencyOptions = [
  "Communication & Collaboration",
  "Critical Thinking & Problem Solving",
  "Creativity & Imagination",
  "Citizenship",
  "Digital Literacy",
  "Self-Efficacy",
]

const termOptions = ["Term 1", "Term 2", "Term 3"]

const gradeOptions = [
  "PP1", "PP2", "Grade 1", "Grade 2", "Grade 3",
  "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9",
]

const assessmentTemplates = [
  "End-of-week written quiz covering the strand objectives",
  "Oral assessment — learner explains key concepts from the week",
  "Practical task demonstration with observation checklist",
  "Peer assessment — learners review each other's work against rubric",
  "Self-reflection journal entry on weekly learning progress",
  "Project presentation with competency-based scoring guide",
  "Portfolio review of completed tasks and practice work",
  "Group discussion evaluation — assess collaboration and contribution",
]

const practiceTaskTemplates = [
  "Workbook exercises on identified sub-strands",
  "Revision questions from past assessments",
  "Concept mapping exercise linking strand ideas",
  "Problem-solving worksheets with step-by-step prompts",
  "Reading comprehension passage with follow-up questions",
  "Guided discovery task exploring real-world applications",
  "Fill-in diagnostic check on foundational knowledge",
  "Skill-building drill focused on weak areas",
]

interface WeekPlan {
  weekLabel: string
  focusSkill: string
  activities: string[]
  practiceTask: string
  miniAssessment: string
  project: string
}

interface AnalysisItem {
  category: "weak" | "medium" | "strength"
  area: string
  detail: string
  weekPriority: string
}

interface TeacherFeedback {
  difficultyLevel: "Easy" | "Moderate" | "Advanced"
  teachingApproach: string
  classroomFocusTip: string
}

function generateTeacherFeedback(
  learningArea: string,
  strand: string,
  grade: string,
  weakAreasCount: number,
  competencies: string[],
  _version?: number
): TeacherFeedback {
  const gradeNum = parseInt(grade?.replace(/\D/g, "")) || 0
  const isLower = grade?.startsWith("PP") || gradeNum <= 3
  const isUpper = gradeNum >= 7

  let difficultyLevel: TeacherFeedback["difficultyLevel"] = "Moderate"
  let difficultyScore = 0
  if (isLower) difficultyScore += 1
  if (isUpper) difficultyScore += 2
  if (learningArea === "Mathematics" || learningArea === "Integrated Science") difficultyScore += 1
  if (strand && ["Algebra", "Geometry", "Data Handling", "Matter & Energy", "Earth & Space"].includes(strand)) difficultyScore += 1
  if (weakAreasCount >= 3) difficultyScore += 1
  if (competencies.length >= 4) difficultyScore += 1
  if (difficultyScore <= 2) difficultyLevel = "Easy"
  else if (difficultyScore <= 4) difficultyLevel = "Moderate"
  else difficultyLevel = "Advanced"

  const approachMap: Record<string, string[]> = {
    "Communication & Collaboration": ["Increase group-based collaborative activities", "Incorporate peer teaching sessions"],
    "Critical Thinking & Problem Solving": ["Use inquiry-based learning stations", "Introduce real-world problem scenarios"],
    "Creativity & Imagination": ["Integrate project-based creative tasks", "Use visual aids and hands-on modeling"],
    "Citizenship": ["Connect lessons to community service projects", "Facilitate discussions on national values"],
    "Digital Literacy": ["Blend digital tools with traditional instruction", "Use interactive educational apps for practice"],
    "Self-Efficacy": ["Build confidence through scaffolded tasks", "Provide frequent positive reinforcement"],
  }
  const approachPool = competencies.length > 0
    ? competencies.flatMap((c) => approachMap[c] || [])
    : ["Use differentiated instruction strategies", "Blend direct instruction with guided discovery"]
  const teachingApproach = approachPool.length > 0
    ? approachPool[Math.floor(Math.random() * approachPool.length)]
    : "Use varied instructional strategies to maintain engagement"

  const tipPool: string[] = []
  if (isLower) {
    tipPool.push("Use visual aids and manipulatives for Week 1 concepts")
    tipPool.push("Incorporate movement-based learning activities")
    tipPool.push("Keep instructions short and demonstration-heavy")
  } else if (isUpper) {
    tipPool.push("Encourage independent research and peer-led discussions")
    tipPool.push("Focus on application and real-world connections")
    tipPool.push("Use formative assessments to gauge depth of understanding")
  } else {
    tipPool.push("Balance guided practice with independent work")
    tipPool.push("Use exit tickets to check understanding daily")
  }
  if (weakAreasCount > 0) {
    tipPool.push("Focus on reinforcement for identified weak skills early")
    tipPool.push("Allocate extra practice time for struggling learners")
  }
  if (learningArea === "Mathematics") tipPool.push("Use concrete-pictorial-abstract approach for new topics")
  if (learningArea === "English" || learningArea === "Kiswahili") tipPool.push("Integrate language skills across all activities")
  if (strand) tipPool.push(`Build scaffolded activities around ${strand} concepts`)
  const classroomFocusTip = tipPool[Math.floor(Math.random() * tipPool.length)]

  return { difficultyLevel, teachingApproach, classroomFocusTip }
}

function generateFlowConnections(weeks: number): { from: number; to: number; label: string }[] {
  const connections: { from: number; to: number; label: string }[] = []
  const labels = [
    "Builds on", "Extends", "Reinforces", "Deepens",
    "Applies", "Connects to", "Prepares for", "Reviews",
    "Integrates with", "Advances to", "Consolidates",
  ]
  for (let i = 0; i < weeks - 1; i++) {
    connections.push({
      from: i,
      to: i + 1,
      label: labels[i % labels.length],
    })
  }
  return connections
}

function generateAnalysis(
  learningArea: string,
  strand: string,
  subStrand: string,
  weakAreas: string,
  coreSkills: string,
  numWeeks: number
): AnalysisItem[] {
  const items: AnalysisItem[] = []
  const weakList = weakAreas.split(",").map((s) => s.trim()).filter(Boolean)
  const derivedTopics = subStrand ? [subStrand] : strand ? [strand] : []

  weakList.forEach((w, i) => {
    const weekNum = (i % numWeeks) + 1
    items.push({
      category: "weak",
      area: w,
      detail: `Needs reinforcement — prioritize in Week ${weekNum} activities`,
      weekPriority: `Week ${weekNum} priority`,
    })
  })

  derivedTopics.forEach((topic) => {
    if (!weakList.some((w) => topic.toLowerCase().includes(w.toLowerCase()) || w.toLowerCase().includes(topic.toLowerCase()))) {
      const weekNum = (weakList.length + items.filter((x) => x.category === "medium").length) % numWeeks + 1
      items.push({
        category: "medium",
        area: topic,
        detail: `Moderate progress expected — allocate practice time across Weeks 1–${Math.min(3, numWeeks)}`,
        weekPriority: `Weeks 1–${Math.min(3, numWeeks)}`,
      })
    }
  })

  const skillList = coreSkills.split(",").map((s) => s.trim()).filter(Boolean)
  skillList.forEach((s) => {
    items.push({
      category: "strength",
      area: s,
      detail: "Strong foundation — leverage as anchor for new learning",
      weekPriority: "Ongoing",
    })
  })

  if (items.length === 0 && learningArea) {
    items.push({
      category: "medium",
      area: learningArea,
      detail: "Comprehensive review recommended across all strands",
      weekPriority: `Weeks 1–${numWeeks}`,
    })
  }

  return items
}

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
const pickN = (arr: string[], n: number) => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

export default function CBCLearningRevisionPlanner() {
  const [learnerName, setLearnerName] = useState("")
  const [grade, setGrade] = useState("")
  const [school, setSchool] = useState("")
  const [startDate, setStartDate] = useState("")
  const [weeks, setWeeks] = useState("4")
  const [term, setTerm] = useState("Term 1")
  const [learningArea, setLearningArea] = useState("")
  const [strand, setStrand] = useState("")
  const [subStrand, setSubStrand] = useState("")
  const [keyCompetenciesFocus, setKeyCompetenciesFocus] = useState("")
  const [coreSkills, setCoreSkills] = useState("")
  const [weakAreas, setWeakAreas] = useState("")
  const [targetOutcomes, setTargetOutcomes] = useState("")
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([])
  const [week1Activities, setWeek1Activities] = useState("")
  const [week2Activities, setWeek2Activities] = useState("")
  const [practiceTasks, setPracticeTasks] = useState("")
  const [projects, setProjects] = useState("")
  const [assessments, setAssessments] = useState("")
  const [autoGenerate, setAutoGenerate] = useState(true)
  const [plannerGenerated, setPlannerGenerated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [flowPreviewMode, setFlowPreviewMode] = useState(false)
  const [weakRegenCounter, setWeakRegenCounter] = useState(0)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [teacherFeedbackVersion, setTeacherFeedbackVersion] = useState(0)

  const numWeeks = Math.max(1, Math.min(12, Number(weeks) || 4))
  const [prevWeekPlan, setPrevWeekPlan] = useState<WeekPlan[]>([])

  const selectedStrands = learningArea ? Object.keys(cbcLearningAreas[learningArea]?.strands || {}) : []
  const selectedSubStrands = learningArea && strand
    ? cbcLearningAreas[learningArea]?.strands[strand] || []
    : []

  const toggleCompetency = (comp: string) => {
    setSelectedCompetencies((prev) =>
      prev.includes(comp) ? prev.filter((c) => c !== comp) : [...prev, comp]
    )
  }

  const analysisItems = useMemo(
    () => generateAnalysis(learningArea, strand, subStrand, weakAreas, coreSkills, numWeeks),
    [learningArea, strand, subStrand, weakAreas, coreSkills, numWeeks]
  )

  const weakAlerts = analysisItems.filter((i) => i.category === "weak")
  const mediumAreas = analysisItems.filter((i) => i.category === "medium")
  const strengthAreas = analysisItems.filter((i) => i.category === "strength")

  const teacherFeedback = useMemo(
    () => generateTeacherFeedback(learningArea, strand, grade, weakAlerts.length, selectedCompetencies, teacherFeedbackVersion),
    [learningArea, strand, grade, weakAlerts.length, selectedCompetencies, teacherFeedbackVersion]
  )

  const flowConnections = useMemo(() => generateFlowConnections(numWeeks), [numWeeks])

  const autoSuggestFocus = useMemo(() => {
    if (!learningArea && !strand && !subStrand) return ""
    const parts = [learningArea, strand, subStrand].filter(Boolean)
    return parts.length > 0
      ? `Reinforce understanding of ${parts.join(" — ")}. Build confidence through targeted practice and self-assessment.`
      : ""
  }, [learningArea, strand, subStrand])

  const autoSuggestActivities = useMemo(() => {
    if (autoGenerate) return ""
    if (!learningArea) return ""
    const area = cbcLearningAreas[learningArea]
    if (!area) return ""
    const allStrands = Object.values(area.strands).flat()
    return allStrands.slice(0, 6).map((s) => `Practice and review ${s.toLowerCase()}`).slice(0, numWeeks).join("; ")
  }, [autoGenerate, learningArea, numWeeks])

  const weekPlan = useMemo((): WeekPlan[] => {
    if (!plannerGenerated) return []
    const weekNames = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`)
    const focusedCompetencies = selectedCompetencies.length > 0
      ? selectedCompetencies
      : coreCompetencyOptions

    const isRegen = weakRegenCounter > 0 && prevWeekPlan.length > 0
    const weakWeeks = new Set<number>()
    if (isRegen) {
      weakAlerts.forEach((a) => {
        const match = a.weekPriority.match(/Week (\d+)/)
        if (match) weakWeeks.add(parseInt(match[1]) - 1)
      })
    }

    const newPlan = Array.from({ length: numWeeks }, (_, wi) => {
      const comp = focusedCompetencies[wi % focusedCompetencies.length]
      const skillActivities = skillBanks[comp] || skillBanks["Communication & Collaboration"]

      const activities = autoGenerate
        ? pickN(skillActivities, 3)
        : [
            week1Activities || "Review & practice core concepts",
            week2Activities || "Apply knowledge through exercises",
            practiceTasks || "Complete practice tasks",
          ]

      const project = autoGenerate ? pick(projectIdeas) : (projects || projectIdeas[wi % projectIdeas.length])

      if (isRegen && !weakWeeks.has(wi) && prevWeekPlan[wi]) {
        return { ...prevWeekPlan[wi] }
      }

      const weekFocus = weakWeeks.has(wi) ? `${comp} (weak area focus)` : comp
      const weakActivities = weakWeeks.has(wi)
        ? [
            `Targeted remediation: ${weakAlerts.filter((a) => a.weekPriority.includes(`Week ${wi + 1}`)).map((a) => a.area).join(", ") || "weak skills"}`,
            ...pickN(skillActivities, 2),
          ]
        : activities.slice(0, 3)

      return {
        weekLabel: weekNames[wi] || `Week ${wi + 1}`,
        focusSkill: weekFocus,
        activities: weakWeeks.has(wi) ? weakActivities.slice(0, 3) : activities.slice(0, 3),
        practiceTask: weakWeeks.has(wi)
          ? "Focused drill on identified weak areas with guided support"
          : (autoGenerate ? pick(practiceTaskTemplates) : (practiceTasks || "Complete assigned workbook exercises")),
        miniAssessment: weakWeeks.has(wi)
          ? "Diagnostic check on weak skill progress with remediation feedback"
          : (autoGenerate ? pick(assessmentTemplates) : (assessments || "End-of-week review and reflection")),
        project: weakWeeks.has(wi)
          ? `Project applying ${weakAlerts.filter((a) => a.weekPriority.includes(`Week ${wi + 1}`)).map((a) => a.area).join(" & ") || "target skills"} in real-world context`
          : project,
      }
    })

    return newPlan
  }, [plannerGenerated, numWeeks, autoGenerate, selectedCompetencies, week1Activities, week2Activities, practiceTasks, projects, assessments, weakRegenCounter, weakAlerts, prevWeekPlan])

  const prevWeekPlanStr = JSON.stringify(weekPlan)
  useEffect(() => {
    if (JSON.stringify(prevWeekPlan) !== prevWeekPlanStr) {
      queueMicrotask(() => setPrevWeekPlan(weekPlan))
    }
  }, [prevWeekPlanStr, weekPlan, prevWeekPlan])

  const autoFillPlan = useCallback(() => {
    if (!learnerName.trim()) {
      toast.error("Please enter the learner name")
      return
    }
    if (!startDate) {
      toast.error("Please select a start date")
      return
    }
    if (!learningArea) {
      toast.error("Please select a learning area")
      return
    }

    setIsGenerating(true)

    const areaData = cbcLearningAreas[learningArea]
    const allSubStrands = strand && areaData?.strands[strand]
      ? areaData.strands[strand]
      : []

    if (!coreSkills.trim() && strand) {
      setCoreSkills(strand)
    }
    if (!weakAreas.trim() && allSubStrands.length > 0) {
      setWeakAreas(allSubStrands.slice(0, 2).join(", "))
    }
    if (!targetOutcomes.trim()) {
      setTargetOutcomes(
        `Master ${strand || learningArea} concepts with ${Math.min(80, 60 + numWeeks * 5)}% proficiency by end of ${term}`
      )
    }
    if (selectedCompetencies.length === 0) {
      if (learningArea === "Mathematics" || learningArea === "Integrated Science") {
        setSelectedCompetencies(["Critical Thinking & Problem Solving", "Digital Literacy", "Self-Efficacy"])
      } else if (learningArea === "English" || learningArea === "Kiswahili") {
        setSelectedCompetencies(["Communication & Collaboration", "Creativity & Imagination", "Self-Efficacy"])
      } else if (learningArea === "Creative Arts & Sports") {
        setSelectedCompetencies(["Creativity & Imagination", "Communication & Collaboration", "Citizenship"])
      } else if (learningArea === "Social Studies" || learningArea === "Religious Education" || learningArea === "Citizenship") {
        setSelectedCompetencies(["Communication & Collaboration", "Citizenship", "Critical Thinking & Problem Solving"])
      } else {
        setSelectedCompetencies(["Critical Thinking & Problem Solving", "Communication & Collaboration", "Self-Efficacy"])
      }
    }
    if (!keyCompetenciesFocus.trim() && autoSuggestFocus) {
      setKeyCompetenciesFocus(autoSuggestFocus)
    }

    setTimeout(() => {
      setAutoGenerate(true)
      setPlannerGenerated(true)
      setIsGenerating(false)
      trackToolUse("revision-planner", "auto-generate")
      toast.success("Complete revision plan auto-generated")
    }, 400)
  }, [learnerName, startDate, learningArea, strand, term, numWeeks, coreSkills, weakAreas, targetOutcomes, selectedCompetencies, keyCompetenciesFocus, autoSuggestFocus])

  const generate = () => {
    if (!learnerName.trim()) {
      toast.error("Please enter the learner name")
      return
    }
    if (!startDate) {
      toast.error("Please select a start date")
      return
    }
    if (!learningArea) {
      toast.error("Please select a learning area")
      return
    }
    if (autoGenerate && selectedCompetencies.length === 0) {
      toast.error("Please select at least one core competency focus")
      return
    }
    setPlannerGenerated(true)
    trackToolUse("revision-planner", "generate")
    toast.success("CBC Learning & Revision Plan generated")
  }

  const regenerateWeakAreas = useCallback(() => {
    if (!plannerGenerated) return
    if (weakAlerts.length === 0) {
      toast.error("No weak areas identified to regenerate")
      return
    }
    setIsRegenerating(true)
    setWeakRegenCounter((c) => c + 1)
    setTimeout(() => {
      setIsRegenerating(false)
      trackToolUse("revision-planner", "regenerate-weak")
      toast.success(`Regenerated ${weakAlerts.length} weak area section${weakAlerts.length > 1 ? "s" : ""}`)
    }, 300)
  }, [plannerGenerated, weakAlerts.length])

  const changeTeacherFeedback = useCallback(() => {
    setTeacherFeedbackVersion((v) => v + 1)
  }, [])

  const resetForm = () => {
    setPlannerGenerated(false)
    setWeakRegenCounter(0)
    setTeacherFeedbackVersion(0)
  }

  const handleCopy = useCallback(() => {
    const lines = [
      "=".repeat(60),
      "CBC LEARNING & REVISION PLAN",
      "Kenya Institute of Curriculum Development",
      "=".repeat(60),
      "",
      `Learner: ${learnerName}`,
      `Grade: ${grade || "—"}`,
      `School: ${school || "—"}`,
      `Term: ${term}`,
      `Start Date: ${startDate}`,
      `Duration: ${numWeeks} weeks`,
      `Learning Area: ${learningArea || "—"}`,
      `Strand: ${strand || "—"}`,
      `Sub-Strand: ${subStrand || "—"}`,
      "",
      "REVISION OBJECTIVES",
      "-".repeat(40),
      ...(coreSkills ? [`• Reinforce: ${coreSkills}`] : []),
      ...(weakAreas ? [`• Improve: ${weakAreas}`] : []),
      ...(targetOutcomes ? [`• Target: ${targetOutcomes}`] : []),
      "",
      "SKILLS FOCUS",
      "-".repeat(40),
      ...selectedCompetencies.map((c) => `✔ ${c}`),
      "",
      "SMART ANALYSIS",
      "-".repeat(40),
      ...(weakAlerts.length > 0 ? ["🔴 WEAK SKILL ALERTS:"] : []),
      ...weakAlerts.map((a) => `  • ${a.area} → ${a.detail} (${a.weekPriority})`),
      ...(mediumAreas.length > 0 ? ["", "🟡 MEDIUM FOCUS AREAS:"] : []),
      ...mediumAreas.map((a) => `  • ${a.area} → ${a.detail} (${a.weekPriority})`),
      ...(strengthAreas.length > 0 ? ["", "🟢 STRENGTH AREAS:"] : []),
      ...strengthAreas.map((a) => `  • ${a.area} → ${a.detail} (${a.weekPriority})`),
      "",
      "TEACHER FEEDBACK SUMMARY",
      "-".repeat(40),
      `  Difficulty Level: ${teacherFeedback.difficultyLevel}`,
      `  Suggested Approach: ${teacherFeedback.teachingApproach}`,
      `  Classroom Tip: ${teacherFeedback.classroomFocusTip}`,
      "",
      "WEEKLY LEARNING TIMELINE",
      "-".repeat(40),
      ...weekPlan.flatMap((week) => [
        `\n${week.weekLabel}`,
        `  Focus Skill: ${week.focusSkill}`,
        `  Activities:`,
        ...week.activities.map((a) => `    • ${a}`),
        `  Practice: ${week.practiceTask}`,
        `  Assessment: ${week.miniAssessment}`,
        `  Project: ${week.project}`,
      ]),
      "",
      "ASSESSMENT PLAN",
      "-".repeat(40),
      ...(practiceTasks ? [`• Practice Tasks: ${practiceTasks}`] : ["• Practice tasks as outlined in weekly timeline"]),
      ...(projects ? [`• Projects: ${projects}`] : ["• Project-based learning activities"]),
      ...(assessments ? [`• Assessments: ${assessments}`] : ["• Weekly mini assessments and reflection"]),
      "",
      "=".repeat(60),
      "Generated with ToolForge — smart-tools-kit.vercel.app",
    ]
    navigator.clipboard.writeText(lines.join("\n"))
    trackToolUse("revision-planner", "copy")
    toast.success("Plan copied to clipboard")
  }, [learnerName, grade, school, term, startDate, numWeeks, learningArea, strand, subStrand, coreSkills, weakAreas, targetOutcomes, selectedCompetencies, weekPlan, practiceTasks, projects, assessments, weakAlerts, mediumAreas, strengthAreas, teacherFeedback])

  const handlePrint = useCallback(() => {
    trackToolUse("revision-planner", "print")
    window.print()
  }, [])

  const handlePDF = useCallback(async () => {
    try {
      const { default: jsPDF } = await import("jspdf")
      const doc = new jsPDF()
      let y = 20
      const margin = 20
      const lineHeight = 5

      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("CBC LEARNING & REVISION PLAN", margin, y)
      y += 7
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text("Kenya Institute of Curriculum Development — Competency-Based Curriculum", margin, y)
      y += 10

      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("LEARNER INFORMATION", margin, y)
      y += 6
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.text(`Learner: ${learnerName}  |  Grade: ${grade || "—"}  |  School: ${school || "—"}`, margin, y)
      y += 5
      doc.text(`Term: ${term}  |  Start: ${startDate}  |  Duration: ${numWeeks} weeks`, margin, y)
      y += 5
      doc.text(`Learning Area: ${learningArea || "—"}  |  Strand: ${strand || "—"}  |  Sub-Strand: ${subStrand || "—"}`, margin, y)
      y += 8

      if (coreSkills || weakAreas || targetOutcomes) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.text("REVISION OBJECTIVES", margin, y)
        y += 6
        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        if (coreSkills) {
          const lines = doc.splitTextToSize(`• Core Skills: ${coreSkills}`, 170)
          lines.forEach((l: string) => { if (y > 275) { doc.addPage(); y = 20 }; doc.text(l, margin, y); y += lineHeight })
        }
        if (weakAreas) {
          const lines = doc.splitTextToSize(`• Weak Areas: ${weakAreas}`, 170)
          lines.forEach((l: string) => { if (y > 275) { doc.addPage(); y = 20 }; doc.text(l, margin, y); y += lineHeight })
        }
        if (targetOutcomes) {
          const lines = doc.splitTextToSize(`• Target: ${targetOutcomes}`, 170)
          lines.forEach((l: string) => { if (y > 275) { doc.addPage(); y = 20 }; doc.text(l, margin, y); y += lineHeight })
        }
        y += 4
      }

      if (selectedCompetencies.length > 0) {
        if (y > 260) { doc.addPage(); y = 20 }
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.text("SKILLS FOCUS", margin, y)
        y += 6
        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        selectedCompetencies.forEach((c) => {
          if (y > 275) { doc.addPage(); y = 20 }
          doc.text(`✔  ${c}`, margin, y)
          y += 5
        })
        y += 4
      }

      if (analysisItems.length > 0) {
        if (y > 250) { doc.addPage(); y = 20 }
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.text("SMART ANALYSIS", margin, y)
        y += 6
        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        analysisItems.forEach((item) => {
          if (y > 275) { doc.addPage(); y = 20 }
          const prefix = item.category === "weak" ? "🔴" : item.category === "medium" ? "🟡" : "🟢"
          const lines = doc.splitTextToSize(`${prefix} ${item.area} — ${item.detail} (${item.weekPriority})`, 170)
          lines.forEach((l: string) => { if (y > 275) { doc.addPage(); y = 20 }; doc.text(l, margin, y); y += lineHeight })
        })
        y += 4
      }

      if (y > 250) { doc.addPage(); y = 20 }
      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.text("TEACHER FEEDBACK SUMMARY", margin, y)
      y += 6
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.text(`Difficulty Level: ${teacherFeedback.difficultyLevel}`, margin, y)
      y += 5
      const approachLines = doc.splitTextToSize(`Suggested Approach: ${teacherFeedback.teachingApproach}`, 170)
      approachLines.forEach((l: string) => { if (y > 275) { doc.addPage(); y = 20 }; doc.text(l, margin, y); y += lineHeight })
      const tipLines = doc.splitTextToSize(`Classroom Tip: ${teacherFeedback.classroomFocusTip}`, 170)
      tipLines.forEach((l: string) => { if (y > 275) { doc.addPage(); y = 20 }; doc.text(l, margin, y); y += lineHeight })
      y += 4

      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.text("WEEKLY LEARNING TIMELINE", margin, y)
      y += 7

      weekPlan.forEach((week) => {
        if (y > 245) { doc.addPage(); y = 20 }
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        doc.text(`${week.weekLabel} — Focus: ${week.focusSkill}`, margin, y)
        y += 5
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.text(`Activities:`, margin + 3, y)
        y += 4.5
        week.activities.forEach((a) => {
          if (y > 275) { doc.addPage(); y = 20 }
          const lines = doc.splitTextToSize(`   • ${a}`, 160)
          lines.forEach((l: string) => { if (y > 275) { doc.addPage(); y = 20 }; doc.text(l, margin + 3, y); y += lineHeight })
        })
        if (y > 270) { doc.addPage(); y = 20 }
        doc.text(`Practice: ${week.practiceTask}`, margin + 3, y)
        y += lineHeight + 1
        if (y > 270) { doc.addPage(); y = 20 }
        doc.text(`Assessment: ${week.miniAssessment}`, margin + 3, y)
        y += lineHeight + 1
        if (y > 270) { doc.addPage(); y = 20 }
        doc.text(`Project: ${week.project}`, margin + 3, y)
        y += 5
      })

      if (practiceTasks || projects || assessments) {
        if (y > 255) { doc.addPage(); y = 20 }
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.text("ASSESSMENT PLAN", margin, y)
        y += 6
        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        if (practiceTasks) {
          const lines = doc.splitTextToSize(`• Practice: ${practiceTasks}`, 170)
          lines.forEach((l: string) => { if (y > 275) { doc.addPage(); y = 20 }; doc.text(l, margin, y); y += lineHeight })
        }
        if (projects) {
          const lines = doc.splitTextToSize(`• Projects: ${projects}`, 170)
          lines.forEach((l: string) => { if (y > 275) { doc.addPage(); y = 20 }; doc.text(l, margin, y); y += lineHeight })
        }
        if (assessments) {
          const lines = doc.splitTextToSize(`• Assessments: ${assessments}`, 170)
          lines.forEach((l: string) => { if (y > 275) { doc.addPage(); y = 20 }; doc.text(l, margin, y); y += lineHeight })
        }
      }

      doc.save("cbc-learning-revision-plan.pdf")
      trackDownload("revision-planner", "pdf")
      toast.success("PDF downloaded")
    } catch {
      toast.error("Failed to generate PDF")
    }
  }, [learnerName, grade, school, term, startDate, numWeeks, learningArea, strand, subStrand, coreSkills, weakAreas, targetOutcomes, selectedCompetencies, weekPlan, practiceTasks, projects, assessments, analysisItems, teacherFeedback])

  const sectionClass = "space-y-4 p-5 rounded-xl border bg-card"
  const labelClass = "text-xs font-medium text-muted-foreground flex items-center gap-1.5"

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── HEADER ── */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-1">
          <Zap className="size-3.5" /> Intelligent Curriculum Planning Engine
        </div>
        <h2 className="text-2xl font-bold tracking-tight">CBC Learning & Revision Planner</h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Analyze, plan, and track competency-based learning with intelligent diagnostics, weekly timelines, and auto-generated revision plans
        </p>
      </div>

      {/* ── MAIN FORM ── */}
      <Card>
        <CardContent className="p-5 md:p-6 space-y-6">
          {/* 🧾 LEARNER DETAILS */}
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <User className="size-4 text-primary" /> Learner Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className={labelClass}><User className="size-3" /> Learner Name</label>
                <Input value={learnerName} onChange={(e) => setLearnerName(e.target.value)}
                  placeholder="e.g. John Kamau" className="h-10 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}><GraduationCap className="size-3" /> Grade / Class</label>
                <select value={grade} onChange={(e) => setGrade(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                  <option value="">Select grade...</option>
                  {gradeOptions.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}><School className="size-3" /> School (optional)</label>
                <Input value={school} onChange={(e) => setSchool(e.target.value)}
                  placeholder="e.g. Moi Primary School" className="h-10 text-sm" />
              </div>
            </div>
          </div>

          {/* 📅 PLANNING PERIOD */}
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="size-4 text-primary" /> Planning Period
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className={labelClass}><Calendar className="size-3" /> Start Date</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-10 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}><Clock className="size-3" /> Duration (weeks)</label>
                <Input type="number" value={weeks} onChange={(e) => setWeeks(e.target.value)} min="1" max="12" className="h-10 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}><BookOpen className="size-3" /> Term</label>
                <select value={term} onChange={(e) => setTerm(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                  {termOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* 📘 CURRICULUM MAPPING */}
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="size-4 text-primary" /> Curriculum Mapping
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Learning Area</label>
                <select value={learningArea} onChange={(e) => { setLearningArea(e.target.value); setStrand(""); setSubStrand("") }}
                  className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                  <option value="">Select learning area...</option>
                  {Object.keys(cbcLearningAreas).map((area) => <option key={area} value={area}>{area}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Strand</label>
                <select value={strand} onChange={(e) => { setStrand(e.target.value); setSubStrand("") }}
                  disabled={!learningArea}
                  className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-40">
                  <option value="">Select strand...</option>
                  {selectedStrands.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Sub-Strand</label>
                <select value={subStrand} onChange={(e) => setSubStrand(e.target.value)}
                  disabled={!strand}
                  className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-40">
                  <option value="">Select sub-strand...</option>
                  {selectedSubStrands.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Key Competencies Focus</label>
              <textarea value={keyCompetenciesFocus}
                onChange={(e) => setKeyCompetenciesFocus(e.target.value)}
                placeholder={autoSuggestFocus || "Describe the key competencies to focus on in this plan..."}
                className="flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
              />
              {autoSuggestFocus && (
                <p className="text-[10px] text-muted-foreground italic">💡 Suggested: {autoSuggestFocus}</p>
              )}
            </div>
          </div>

          {/* 🎯 REVISION GOALS */}
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Target className="size-4 text-primary" /> Revision Goals
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className={labelClass}><Brain className="size-3" /> Core Skills to Reinforce</label>
                <textarea value={coreSkills}
                  onChange={(e) => setCoreSkills(e.target.value)}
                  placeholder="e.g. Place value, reading comprehension, fractions..."
                  className="flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}><AlertCircle className="size-3" /> Weak Areas (optional)</label>
                <textarea value={weakAreas}
                  onChange={(e) => setWeakAreas(e.target.value)}
                  placeholder="e.g. Division, grammar, essay writing..."
                  className="flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}><Target className="size-3" /> Target Outcomes</label>
                <textarea value={targetOutcomes}
                  onChange={(e) => setTargetOutcomes(e.target.value)}
                  placeholder="e.g. Score 80% on end-of-term assessment..."
                  className="flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
                />
              </div>
            </div>
          </div>

          {/* 🧠 COMPETENCY TRACKING */}
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ListChecks className="size-4 text-primary" /> Competency Tracking
            </h3>
            <p className="text-xs text-muted-foreground">Select the core competencies this revision plan will focus on:</p>
            <div className="flex flex-wrap gap-2">
              {coreCompetencyOptions.map((comp) => (
                <button key={comp}
                  onClick={() => toggleCompetency(comp)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    selectedCompetencies.includes(comp)
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {selectedCompetencies.includes(comp) && "✓ "}{comp}
                </button>
              ))}
            </div>
          </div>

          {/* 📌 ACTIVITY PLANNER */}
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Activity Planner
            </h3>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border">
              <div className="flex items-center gap-2 flex-1">
                <Sparkles className="size-4 text-amber-500" />
                <span className="text-xs font-medium">Auto-generate weekly activities</span>
              </div>
              <button
                onClick={() => setAutoGenerate(!autoGenerate)}
                className={cn(
                  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                  autoGenerate ? "bg-primary" : "bg-muted-foreground/30"
                )}
              >
                <span className={cn(
                  "inline-block size-3.5 rounded-full bg-white transition-transform",
                  autoGenerate ? "translate-x-4.5" : "translate-x-1"
                )} />
              </button>
            </div>

            {autoGenerate ? (
              <div className="p-4 rounded-lg bg-muted/20 border border-dashed">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="size-3.5 text-amber-500" />
                  <span>Smart mode: Weekly activities, practice tasks, and assessments will be auto-generated from the curriculum data and competency focus.</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClass}>Week 1 Activities</label>
                  <textarea value={week1Activities}
                    onChange={(e) => setWeek1Activities(e.target.value)}
                    placeholder={autoSuggestActivities || "e.g. Review number concepts, practice addition"}
                    className="flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Week 2 Activities</label>
                  <textarea value={week2Activities}
                    onChange={(e) => setWeek2Activities(e.target.value)}
                    placeholder="e.g. Apply concepts, solve practice problems"
                    className="flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Practice Tasks</label>
                  <textarea value={practiceTasks}
                    onChange={(e) => setPracticeTasks(e.target.value)}
                    placeholder="e.g. Workbook exercises, revision questions"
                    className="flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Projects</label>
                  <textarea value={projects}
                    onChange={(e) => setProjects(e.target.value)}
                    placeholder="e.g. Design a model, conduct a survey"
                    className="flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className={labelClass}>Assessments</label>
                  <textarea value={assessments}
                    onChange={(e) => setAssessments(e.target.value)}
                    placeholder="e.g. End-of-week quiz, oral assessment, project presentation"
                    className="flex min-h-[60px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── ACTION BUTTONS ── */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={autoFillPlan} size="lg" className="flex-1 gap-2" disabled={isGenerating}>
              {isGenerating ? (
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Generate Complete Revision Plan
            </Button>
            <Button onClick={generate} variant="outline" size="lg" className="flex-1">
              <CalendarDays className="h-4 w-4" /> Generate with Current Inputs
            </Button>
            {plannerGenerated && (
              <Button variant="ghost" size="lg" onClick={resetForm}>
                <Trash2 className="h-4 w-4" /> Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── SMART ANALYSIS PANEL ── */}
      {plannerGenerated && analysisItems.length > 0 && (
        <Card className="border-primary/20 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-primary/20 px-6 py-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="size-5 text-amber-500" />
              <h3 className="text-sm font-bold">Revision Intelligence Engine</h3>
              <Badge variant="secondary" className="text-[10px] ml-auto">AI-Powered Analysis</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Diagnostic feedback generated from your curriculum mapping, weak areas, and duration settings
            </p>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {/* 🔴 Weak Skill Alerts */}
              {weakAlerts.length > 0 && (
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="size-6 rounded-full bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle className="size-3.5 text-red-500" />
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                      Weak Skill Alerts ({weakAlerts.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {weakAlerts.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                        <div className="size-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{item.area}</p>
                          <p className="text-xs text-muted-foreground">{item.detail}</p>
                          <Badge variant="outline" className="mt-1 text-[10px] text-red-500 border-red-500/20 bg-red-500/5">
                            {item.weekPriority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 🟡 Medium Focus Areas */}
              {mediumAreas.length > 0 && (
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="size-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <AlertCircle className="size-3.5 text-amber-500" />
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Medium Focus Areas ({mediumAreas.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {mediumAreas.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <div className="size-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{item.area}</p>
                          <p className="text-xs text-muted-foreground">{item.detail}</p>
                          <Badge variant="outline" className="mt-1 text-[10px] text-amber-500 border-amber-500/20 bg-amber-500/5">
                            {item.weekPriority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 🟢 Strength Areas */}
              {strengthAreas.length > 0 && (
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="size-6 rounded-full bg-green-500/10 flex items-center justify-center">
                      <TrendingUp className="size-3.5 text-green-500" />
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                      Strength Areas ({strengthAreas.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {strengthAreas.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                        <div className="size-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{item.area}</p>
                          <p className="text-xs text-muted-foreground">{item.detail}</p>
                          <Badge variant="outline" className="mt-1 text-[10px] text-green-500 border-green-500/20 bg-green-500/5">
                            {item.weekPriority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysisItems.length === 0 && (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                  <Lightbulb className="size-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p>Add weak areas and core skills in the form above to generate diagnostic insights.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── TEACHER FEEDBACK SUMMARY PANEL ── */}
      {plannerGenerated && (
        <Card className="border-amber-200/40 dark:border-amber-800/30 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 via-amber-100/30 to-amber-50 dark:from-amber-950/20 dark:via-amber-900/10 dark:to-amber-950/20 border-b border-amber-200/40 dark:border-amber-800/30 px-6 py-4">
            <div className="flex items-center gap-2">
              <UserCheck className="size-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-bold">🧑‍🏫 Feedback Summary Panel</h3>
              <Badge variant="secondary" className="text-[10px] ml-auto">Instructional Assistant</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              AI-generated teaching recommendations based on curriculum mapping and learner profile
            </p>
          </div>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border bg-background p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="size-4 text-amber-500" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Teaching Difficulty</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold",
                    teacherFeedback.difficultyLevel === "Easy" && "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20",
                    teacherFeedback.difficultyLevel === "Moderate" && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
                    teacherFeedback.difficultyLevel === "Advanced" && "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
                  )}>
                    {teacherFeedback.difficultyLevel}
                  </span>
                </div>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="size-4 text-amber-500" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suggested Approach</span>
                </div>
                <p className="text-sm leading-relaxed">{teacherFeedback.teachingApproach}</p>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="size-4 text-amber-500" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Classroom Focus Tip</span>
                </div>
                <p className="text-sm leading-relaxed">{teacherFeedback.classroomFocusTip}</p>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button variant="ghost" size="xs" onClick={changeTeacherFeedback} className="text-[10px] gap-1 h-7">
                <RefreshCw className="size-3" /> Refresh Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── WEEKLY LEARNING TIMELINE ── */}
      {plannerGenerated && weekPlan.length > 0 && (
        <Card className={cn("border-primary/20 overflow-hidden", flowPreviewMode && "border-primary/40")}>
          {/* KICD Document Header */}
          <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-primary/20 px-6 py-5 text-center">
            {/* Flow Preview Toggle */}
            <div className="flex items-center justify-between mb-3">
              <div />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFlowPreviewMode(!flowPreviewMode)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    flowPreviewMode
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  <Eye className="size-3.5" />
                  {flowPreviewMode ? "Flow Preview" : "Card View"}
                </button>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium mb-2">
              <GraduationCap className="size-3" /> KICD Competency-Based Curriculum
            </div>
            <h3 className="text-lg font-bold tracking-tight">CBC LEARNING & REVISION PLAN</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Kenya Institute of Curriculum Development</p>
          </div>

          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {/* Learner Info */}
              <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Learner</span>
                  <p className="font-medium mt-0.5">{learnerName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Grade</span>
                  <p className="font-medium mt-0.5">{grade || "—"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Term</span>
                  <p className="font-medium mt-0.5">{term}</p>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Duration</span>
                  <p className="font-medium mt-0.5">{numWeeks} weeks (from {startDate})</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Learning Area</span>
                  <p className="font-medium mt-0.5">{learningArea || "—"}{strand ? ` — ${strand}` : ""}{subStrand ? ` — ${subStrand}` : ""}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">School</span>
                  <p className="font-medium mt-0.5">{school || "—"}</p>
                </div>
              </div>

              {/* Revision Objectives */}
              {(coreSkills || weakAreas || targetOutcomes) && (
                <div className="px-6 py-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
                    <Target className="size-3.5" /> Revision Objectives
                  </h4>
                  <div className="space-y-1.5">
                    {coreSkills && (
                      <div className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="size-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span><span className="font-medium">Core Skills:</span> {coreSkills}</span>
                      </div>
                    )}
                    {weakAreas && (
                      <div className="flex items-start gap-2 text-sm">
                        <AlertCircle className="size-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span><span className="font-medium">Weak Areas:</span> {weakAreas}</span>
                      </div>
                    )}
                    {targetOutcomes && (
                      <div className="flex items-start gap-2 text-sm">
                        <Target className="size-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span><span className="font-medium">Target Outcomes:</span> {targetOutcomes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Skills Focus */}
              {selectedCompetencies.length > 0 && (
                <div className="px-6 py-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
                    <ListChecks className="size-3.5" /> Skills Focus
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompetencies.map((comp) => (
                      <Badge key={comp} variant="secondary" className="gap-1 text-xs">
                        <CheckCircle2 className="size-3 text-green-500" /> {comp}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Weekly Learning Timeline */}
              <div className="px-6 py-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" /> Weekly Learning Timeline
                </h4>

                {flowPreviewMode ? (
                  /* ── FLOW PREVIEW MODE ── */
                  <div className="relative">
                    {weekPlan.map((week, wi) => {
                      const isWeakWeek = weakAlerts.some((a) => a.weekPriority.includes(`Week ${wi + 1}`))
                      const isLast = wi === weekPlan.length - 1
                      return (
                        <div key={wi} className="relative">
                          {/* Connection arrow to next week */}
                          {!isLast && (
                            <div className="flex flex-col items-center py-2">
                              <div className="text-primary/40">
                                <ArrowDown className="size-5" />
                              </div>
                              <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
                                {flowConnections[wi]?.label || "Continues to"}
                              </span>
                            </div>
                          )}

                          <div className={cn(
                            "rounded-xl border bg-background p-5 transition-all hover:shadow-md",
                            isWeakWeek
                              ? "border-l-4 border-l-red-400 border-t border-r border-b border-red-100 dark:border-red-900/30"
                              : "border-l-4 border-l-primary/50"
                          )}>
                            {/* Week Header - Flow Style */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "size-9 rounded-xl flex items-center justify-center text-sm font-bold",
                                  isWeakWeek
                                    ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                    : "bg-primary/10 text-primary"
                                )}>
                                  {wi + 1}
                                </div>
                                <div>
                                  <h5 className="text-sm font-semibold">{week.weekLabel}</h5>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <Badge variant="outline" className="text-[9px] gap-1 px-1.5 py-0">
                                      <Brain className="size-2.5" /> {week.focusSkill}
                                    </Badge>
                                    {isWeakWeek && (
                                      <Badge variant="outline" className="text-[9px] text-red-500 border-red-500/20 bg-red-500/5">
                                        Weak Area Focus
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {/* Skill progression indicator */}
                              {!isLast && (
                                <div className="hidden sm:flex items-center gap-1 text-[9px] text-muted-foreground">
                                  <span className="font-medium text-primary/60">{flowConnections[wi]?.label}</span>
                                  <ArrowRight className="size-3 text-primary/40" />
                                  <span>Week {wi + 2}</span>
                                </div>
                              )}
                            </div>

                            {/* Flow Content - single column for readability */}
                            <div className="space-y-3">
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-dashed">
                                <Sparkles className="size-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Activities</span>
                                  <ul className="space-y-0.5">
                                    {week.activities.map((a, ai) => (
                                      <li key={ai} className="text-xs leading-relaxed text-muted-foreground flex items-start gap-1">
                                        <ArrowRight className="size-2.5 mt-0.5 flex-shrink-0 text-primary/60" />
                                        {a}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-dashed">
                                  <ListChecks className="size-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Practice</span>
                                    <p className="text-xs text-muted-foreground">{week.practiceTask}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-dashed">
                                  <Target className="size-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Assessment</span>
                                    <p className="text-xs text-muted-foreground">{week.miniAssessment}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                <span className="text-xs mt-0.5">⭐</span>
                                <div>
                                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">Project</span>
                                  <p className="text-xs text-amber-700 dark:text-amber-300">{week.project}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* Learning Path Summary */}
                    <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="size-4 text-primary" />
                        <h5 className="text-xs font-bold uppercase tracking-wider text-primary">Learning Journey Summary</h5>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        This {numWeeks}-week structured plan progresses from <strong>{weekPlan[0]?.focusSkill || "foundational concepts"}</strong> towards <strong>{weekPlan[weekPlan.length - 1]?.focusSkill || "advanced application"}</strong>.
                        {weakAlerts.length > 0 && ` Special attention is given to ${weakAlerts.length} identified weak area${weakAlerts.length > 1 ? "s" : ""} throughout the journey.`}
                        The pathway emphasizes continuous skill building, with each week building on the previous through {flowConnections.length} progressive connections.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* ── CARD VIEW (DEFAULT) ── */
                  <div className="space-y-4">
                    {weekPlan.map((week, wi) => {
                      const isWeakWeek = weakAlerts.some((a) => a.weekPriority.includes(`Week ${wi + 1}`))
                      return (
                        <div key={wi} className={cn(
                          "rounded-lg border border-l-4 bg-muted/5 p-4",
                          isWeakWeek ? "border-l-red-400" : "border-l-primary/40"
                        )}>
                          {/* Week Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "size-7 rounded-full flex items-center justify-center text-xs font-bold",
                                isWeakWeek ? "bg-red-500/10 text-red-600" : "bg-primary/10 text-primary"
                              )}>
                                {wi + 1}
                              </div>
                              <h5 className="text-sm font-semibold">{week.weekLabel}</h5>
                              {isWeakWeek && (
                                <Badge variant="outline" className="text-[9px] text-red-500 border-red-500/20 bg-red-500/5 ml-1">
                                  Weak Area
                                </Badge>
                              )}
                            </div>
                            <Badge variant="outline" className="text-[10px] gap-1">
                              <Brain className="size-3" /> {week.focusSkill}
                            </Badge>
                          </div>

                          {/* Week Content */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="rounded-md bg-background border p-3">
                              <div className="flex items-center gap-1.5 mb-2">
                                <Sparkles className="size-3 text-amber-500" />
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Activities</span>
                              </div>
                              <ul className="space-y-1">
                                {week.activities.map((a, ai) => (
                                  <li key={ai} className="text-[10px] leading-relaxed text-muted-foreground flex items-start gap-1">
                                    <ArrowRight className="size-2.5 mt-0.5 flex-shrink-0 text-primary/60" />
                                    {a}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="rounded-md bg-background border p-3">
                              <div className="flex items-center gap-1.5 mb-2">
                                <ListChecks className="size-3 text-blue-500" />
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Practice</span>
                              </div>
                              <p className="text-[10px] leading-relaxed text-muted-foreground">{week.practiceTask}</p>
                            </div>
                            <div className="rounded-md bg-background border p-3">
                              <div className="flex items-center gap-1.5 mb-2">
                                <Target className="size-3 text-purple-500" />
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Assessment</span>
                              </div>
                              <p className="text-[10px] leading-relaxed text-muted-foreground">{week.miniAssessment}</p>
                            </div>
                          </div>

                          <div className="mt-2 text-[10px] leading-relaxed text-amber-600 dark:text-amber-400">
                            ⭐ <span className="font-medium">Project:</span> {week.project}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Assessment Plan */}
              <div className="px-6 py-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
                  <FileDown className="size-3.5" /> Assessment Plan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg border bg-muted/10 p-3">
                    <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Practice Tasks</div>
                    <p className="text-xs">{practiceTasks || "Auto-generated from weekly timeline"}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/10 p-3">
                    <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Projects</div>
                    <p className="text-xs">{projects || "Project-based learning integrated into weekly plan"}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/10 p-3">
                    <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Assessments</div>
                    <p className="text-xs">{assessments || "Weekly mini assessment and reflection"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-border/40 bg-muted/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={regenerateWeakAreas}
                  disabled={isRegenerating || weakAlerts.length === 0}
                  className="gap-1"
                >
                  <RefreshCw className={cn("size-3", isRegenerating && "animate-spin")} />
                  Regenerate Weak Areas Only
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="xs" onClick={handleCopy}><Copy className="h-3 w-3" /> Copy</Button>
                <Button variant="outline" size="xs" onClick={handlePDF}><FileDown className="h-3 w-3" /> PDF</Button>
                <Button variant="outline" size="xs" onClick={handlePrint}><Printer className="h-3 w-3" /> Print</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

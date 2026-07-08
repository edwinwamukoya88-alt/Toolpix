"use client"

import { useState, useCallback, useMemo } from "react"
import { ClipboardCheck, Copy, Printer, FileDown, RefreshCw, GraduationCap, BookOpen, BarChart3, ListChecks, Brain, Target, Sparkles, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { trackToolUse, trackDownload } from "@/lib/analytics"

type TaskType = "project" | "practical" | "observation" | "problem-solving" | "group-work"

const taskBanks: Record<string, Record<TaskType, { title: string; description: string; materials?: string; criteria: string[] }[]>> = {
  "Science and Technology": {
    "project": [
      { title: "Water Conservation System", description: "Design a simple water harvesting system using local materials to collect rainwater for household use.", materials: "Guttering, container, mesh, pipe connectors", criteria: ["Functionality of design", "Use of local materials", "Clear labelled diagram", "Written explanation"] },
      { title: "Energy Sources Model", description: "Create a model showing three different sources of energy used in your community.", materials: "Cardboard, markers, small LED bulbs, wires", criteria: ["Accuracy of energy sources", "Quality of model", "Labels and descriptions", "Presentation"] },
      { title: "Plant Growth Investigation", description: "Grow two types of seeds under different conditions and document their growth over 14 days.", materials: "Seeds, soil, containers, water, sunlight", criteria: ["Daily observation records", "Measurement accuracy", "Comparison of results", "Conclusion drawn"] },
    ],
    "practical": [
      { title: "Magnetic Properties", description: "Test various objects to determine which materials are attracted to a magnet and classify them.", materials: "Bar magnet, paper clips, coins, plastic, wood, cloth", criteria: ["Correct classification", "Recording of results", "Safety during activity", "Clean-up procedure"] },
      { title: "Simple Circuit", description: "Construct a simple electrical circuit that lights a bulb using a battery, wires, and a switch.", materials: "Battery, wires, bulb, switch holder", criteria: ["Circuit completeness", "Bulb lights successfully", "Correct use of switch", "Safety awareness"] },
      { title: "Floating and Sinking", description: "Test various objects to predict and observe which float and which sink in water.", materials: "Basin of water, various objects (sponge, stone, coin, cork, plastic)", criteria: ["Prediction accuracy", "Observation recording", "Classification of objects", "Explanation of results"] },
    ],
    "observation": [
      { title: "Weather Patterns", description: "Observe and record weather conditions daily for one week, including temperature, rainfall, and cloud cover.", criteria: ["Daily consistency", "Use of symbols/chart", "Accuracy of observations", "Weekly summary"] },
      { title: "Living Things in the Environment", description: "Observe and record five different living things found in the school compound.", criteria: ["Identification accuracy", "Detailed description", "Habitat recording", "Drawing/sketch included"] },
    ],
    "problem-solving": [
      { title: "Waste Management Solution", description: "Identify a waste problem in your school and propose a practical solution for managing it.", criteria: ["Problem identification", "Practical solution", "Use of local resources", "Feasibility"] },
      { title: "Clean Water Challenge", description: "Design a simple water filtration system using household materials to clean muddy water.", materials: "Plastic bottle, sand, charcoal, cloth, gravel", criteria: ["Filtration effectiveness", "Use of materials", "Process documentation", "Improvement suggestions"] },
    ],
    "group-work": [
      { title: "Environmental Conservation Campaign", description: "In groups, plan and present a campaign to promote tree planting in the local community.", criteria: ["Group collaboration", "Quality of presentation", "Creativity", "Community focus"] },
      { title: "Healthy Living Skit", description: "Create and perform a short skit about healthy eating habits and physical exercise.", criteria: ["Teamwork", "Message clarity", "Creativity", "Confidence in presentation"] },
    ],
  },
  "Mathematics": {
    "project": [
      { title: "Budget Planning", description: "Plan a budget for a small family event, including income, expenses, and savings calculations.", materials: "Paper, calculator, price lists", criteria: ["Accurate calculations", "Realistic budget", "Clear presentation", "Reflection on choices"] },
      { title: "Shape City", description: "Create a model of a city using different geometric shapes, labelling each shape correctly.", materials: "Cardboard, scissors, glue, markers", criteria: ["Variety of shapes used", "Correct labelling", "Quality of model", "Creativity"] },
      { title: "Data Collection Survey", description: "Conduct a survey on a topic of interest, collect data from 20 people, and present it in a chart.", materials: "Survey form, graph paper, markers", criteria: ["Data collection method", "Accuracy of tally", "Appropriate chart type", "Analysis of findings"] },
    ],
    "practical": [
      { title: "Measurement Hunt", description: "Measure the length, width, and height of five different objects in the classroom using a ruler or tape measure.", materials: "Ruler, measuring tape, recording sheet", criteria: ["Correct use of measuring tool", "Accuracy of measurements", "Unit recording (cm/m)", "Comparison of sizes"] },
      { title: "Fraction Pizza", description: "Create a paper 'pizza' divided into equal parts and label the fractions represented.", materials: "Coloured paper, scissors, glue, markers", criteria: ["Equal division", "Correct fraction labels", "Visual clarity", "Understanding shown"] },
      { title: "Telling Time", description: "Create a clock face and demonstrate telling time to the nearest hour, half-hour, and quarter-hour.", materials: "Paper plate, cardboard hands, split pin", criteria: ["Clock construction", "Accuracy of time shown", "Variety of times demonstrated", "Verbal explanation"] },
    ],
    "observation": [
      { title: "Pattern Hunt", description: "Observe and record five different patterns found in the classroom or school environment.", criteria: ["Pattern identification", "Drawing of patterns", "Pattern rule explanation", "Creativity in finding patterns"] },
      { title: "Traffic Count", description: "Observe and count vehicles passing the school for 30 minutes, categorising by type.", criteria: ["Organised tally", "Categories used", "Accuracy of count", "Data representation"] },
    ],
    "problem-solving": [
      { title: "Sharing Equally", description: "Solve a real-life sharing problem: divide 24 sweets among 4 children fairly. Show three different ways.", materials: "Counters, paper", criteria: ["Correct division", "Multiple strategies shown", "Clear explanation", "Real-life connection"] },
      { title: "Classroom Reorganisation", description: "The classroom has 30 desks that need to be arranged in equal rows. Find all possible arrangements.", criteria: ["Finding all factors", "Systematic approach", "Visual arrangement", "Explanation of findings"] },
    ],
    "group-work": [
      { title: "Market Day Maths", description: "In groups, set up a mock market stall with prices and practice buying and selling items.", criteria: ["Pricing accuracy", "Correct change giving", "Team collaboration", "Realistic scenario"] },
      { title: "Maths Board Game", description: "Design and create a board game that teaches a mathematical concept to younger learners.", criteria: ["Game rules clarity", "Maths concept integration", "Creativity", "Playability"] },
    ],
  },
  "English": {
    "project": [
      { title: "Story Book Creation", description: "Write and illustrate a short story (minimum 5 pages) with a clear beginning, middle, and end.", materials: "Paper, markers, stapler", criteria: ["Story structure", "Use of vocabulary", "Illustrations", "Creativity"] },
      { title: "Community News Report", description: "Write a news report about a recent event in your school or community.", materials: "Paper, pen, interview notes", criteria: ["Factual accuracy", "Report structure", "Use of quotes", "Clarity of writing"] },
    ],
    "practical": [
      { title: "Oral Presentation", description: "Prepare and deliver a 2-minute talk about your favourite book or hobby.", criteria: ["Confidence", "Clear pronunciation", "Organisation of ideas", "Eye contact"] },
      { title: "Recipe Writing", description: "Write a simple recipe for a traditional Kenyan meal, including ingredients and step-by-step instructions.", materials: "Paper, pen", criteria: ["Clear instructions", "List of ingredients", "Step sequencing", "Use of imperative verbs"] },
    ],
    "observation": [
      { title: "Environmental Description", description: "Observe a place in the school compound and write a descriptive paragraph about what you see, hear, and smell.", criteria: ["Use of sensory details", "Descriptive vocabulary", "Paragraph structure", "Originality"] },
    ],
    "problem-solving": [
      { title: "Letter to the Principal", description: "Write a formal letter to the principal suggesting one improvement for the school.", criteria: ["Letter format", "Clear argument", "Polite tone", "Persuasive language"] },
    ],
    "group-work": [
      { title: "Debate Preparation", description: "In groups, prepare and present arguments for or against a given motion.", criteria: ["Teamwork", "Quality of arguments", "Respectful listening", "Confident delivery"] },
      { title: "Role Play", description: "In groups, create and perform a role play about a visit to a health centre.", criteria: ["Realistic scenario", "Use of dialogue", "Team coordination", "Audience engagement"] },
    ],
  },
  "Kiswahili": {
    "project": [
      { title: "Hadithi Fupi", description: "Andika hadithi fupi yenye mwanzo, katikati na mwisho kuhusu maisha ya shule.", materials: "Karatasi, kalamu, picha", criteria: ["Muundo wa hadithi", "Matumizi ya msamiati", "Ubunifu", "Wasilisho"] },
    ],
    "practical": [
      { title: "Mazungumzo", description: "Andaa mazungumzo kati ya wanafunzi wawili kuhusu usafi wa mazingira ya shule.", criteria: ["Matumizi sahihi ya lugha", "Muundo wa mazungumzo", "Uhalisia", "Kujiamini"] },
    ],
    "observation": [
      { title: "Uchunguzi wa Mazingira", description: "Chunguza mazingira ya shule yako na andika maelezo kuhusu kile unachokiona, kusikia na kunusa.", criteria: ["Matumizi ya hisi", "Msamiati sahihi", "Muundo wa maelezo", "Usahihi"] },
    ],
    "problem-solving": [
      { title: "Suluhisho la Tatizo", description: "Tambua tatizo moja shuleni kwako na pendekeza suluhisho la vitendo.", criteria: ["Utambuzi wa tatizo", "Suluhisho la vitendo", "Uhalisia", "Uwasilishaji"] },
    ],
    "group-work": [
      { title: "Sajili", description: "Kwa vikundi, andaa sajili fupi yenye mandhari ya utunzaji wa mazingira.", criteria: ["Ushirikiano", "Ubunifu", "Ufasaha wa lugha", "Wasilisho"] },
    ],
  },
  "Social Studies": {
    "project": [
      { title: "Community Map", description: "Draw a map of your local community showing key features such as roads, rivers, schools, and markets.", materials: "Paper, markers, ruler", criteria: ["Map key and symbols", "Accuracy of features", "Compass direction", "Neatness"] },
      { title: "Family History Timeline", description: "Create a timeline showing important events in your family's history across three generations.", materials: "Paper, photos, markers", criteria: ["Chronological order", "Historical accuracy", "Visual presentation", "Family involvement"] },
    ],
    "practical": [
      { title: "Cultural Artefact", description: "Create a traditional artefact from one Kenyan community and explain its cultural significance.", materials: "Clay, wood, beads, fabric", criteria: ["Authenticity", "Cultural accuracy", "Craftsmanship", "Explanation"] },
    ],
    "observation": [
      { title: "Weather and Climate", description: "Observe and record weather patterns in your area for one week, noting how they affect daily activities.", criteria: ["Daily recording", "Impact analysis", "Use of symbols", "Weekly summary"] },
    ],
    "problem-solving": [
      { title: "Road Safety Solution", description: "Identify a road safety issue near your school and propose a practical solution.", criteria: ["Problem identification", "Practical solution", "Community consideration", "Feasibility"] },
    ],
    "group-work": [
      { title: "Cultural Festival", description: "In groups, plan and present a mini cultural festival showcasing traditions from different Kenyan communities.", criteria: ["Research quality", "Teamwork", "Authenticity", "Engagement"] },
    ],
  },
}

const learningAreas = ["Science and Technology", "Mathematics", "English", "Kiswahili", "Social Studies"]
const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9"]

const taskIntentLabels: Record<string, string> = {
  project: "Knowledge-Based Task / Practical Application Task",
  practical: "Practical Application Task",
  observation: "Observation Task",
  "problem-solving": "Knowledge-Based Task / Practical Application Task",
  "group-work": "Collaborative Task",
}

const competencyMappingPerTask: Record<string, { competency: string; level: "High" | "Medium" | "Low" }[]> = {
  project: [
    { competency: "Creativity & Imagination", level: "High" },
    { competency: "Critical Thinking & Problem Solving", level: "High" },
    { competency: "Communication & Collaboration", level: "Medium" },
  ],
  practical: [
    { competency: "Self-Efficacy", level: "High" },
    { competency: "Digital Literacy", level: "Medium" },
    { competency: "Critical Thinking & Problem Solving", level: "Medium" },
  ],
  observation: [
    { competency: "Learning to Learn", level: "High" },
    { competency: "Communication & Collaboration", level: "Medium" },
    { competency: "Critical Thinking & Problem Solving", level: "Low" },
  ],
  "problem-solving": [
    { competency: "Critical Thinking & Problem Solving", level: "High" },
    { competency: "Creativity & Imagination", level: "High" },
    { competency: "Self-Efficacy", level: "Medium" },
  ],
  "group-work": [
    { competency: "Communication & Collaboration", level: "High" },
    { competency: "Citizenship", level: "High" },
    { competency: "Creativity & Imagination", level: "Medium" },
  ],
}

const rubricLevels = [
  {
    code: "EE",
    label: "Exceeds Expectation",
    description: "Demonstrates exceptional understanding; exceeds grade-level expectations with independence and creativity.",
  },
  {
    code: "ME",
    label: "Meets Expectation",
    description: "Demonstrates adequate understanding; meets grade-level expectations with minimal support.",
  },
  {
    code: "AE",
    label: "Approaching Expectation",
    description: "Demonstrates partial understanding; requires guidance to meet grade-level expectations.",
  },
  {
    code: "BE",
    label: "Below Expectation",
    description: "Demonstrates limited understanding; requires significant intervention and scaffolded support.",
  },
]

const assessmentTypeSummaryLabels: Record<string, { icon: string; label: string }> = {
  project: { icon: "📐", label: "Project-Based Assessment" },
  practical: { icon: "🔬", label: "Practical Activity Assessment" },
  observation: { icon: "👁", label: "Observation-Based Assessment" },
  "problem-solving": { icon: "🧩", label: "Problem-Solving Assessment" },
  "group-work": { icon: "👥", label: "Collaborative Group Assessment" },
}

export default function CBCAssessmentTool() {
  const [grade, setGrade] = useState("Grade 4")
  const [learningArea, setLearningArea] = useState("Science and Technology")
  const [numTasks, setNumTasks] = useState("4")
  const [generated, setGenerated] = useState(false)
  const [tasks, setTasks] = useState<{ type: TaskType; task: { title: string; description: string; materials?: string; criteria: string[] } }[]>([])
  const [blueprintData, setBlueprintData] = useState<{
    typeDistribution: Record<string, number>
    competencyFocus: { name: string; percentage: number }[]
  } | null>(null)

  const taskTypes: TaskType[] = ["project", "practical", "observation", "problem-solving", "group-work"]

  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const generate = () => {
    const bank = taskBanks[learningArea]
    if (!bank) {
      toast.error(`Task bank for ${learningArea} not available`)
      return
    }

    const count = Math.max(1, Math.min(Number(numTasks) || 4, 12))
    const allTasks: { type: TaskType; task: typeof bank[TaskType][0] }[] = []

    taskTypes.forEach((type) => {
      if (bank[type]) {
        bank[type].forEach((task) => {
          allTasks.push({ type, task })
        })
      }
    })

    const shuffled = shuffle(allTasks)
    const selected = shuffled.slice(0, count)

    const chosen = selected.map((s) => ({ type: s.type, task: s.task }))
    setTasks(chosen)

    const dist: Record<string, number> = {}
    chosen.forEach((t) => { dist[t.type] = (dist[t.type] || 0) + 1 })
    const allComp = new Map<string, number>()
    chosen.forEach((t) => {
      (competencyMappingPerTask[t.type] || []).forEach((c) => {
        const weight = c.level === "High" ? 3 : c.level === "Medium" ? 2 : 1
        allComp.set(c.competency, (allComp.get(c.competency) || 0) + weight)
      })
    })
    const totalWeight = [...allComp.values()].reduce((a, b) => a + b, 0) || 1
    const competencyFocus = [...allComp.entries()]
      .map(([name, weight]) => ({ name, percentage: Math.round((weight / totalWeight) * 100) }))
      .sort((a, b) => b.percentage - a.percentage)

    setBlueprintData({ typeDistribution: dist, competencyFocus })
    setGenerated(true)
    trackToolUse("exam-generator", "generate")
    toast.success("CBC performance assessment generated")
  }

  const typeLabels = useMemo((): Record<TaskType, string> => ({
    "project": "Project",
    "practical": "Practical Activity",
    "observation": "Observation Task",
    "problem-solving": "Problem-Solving Task",
    "group-work": "Group Work Assignment",
  }), [])

  const handleCopy = useCallback(() => {
    const lines = [
      "=".repeat(65),
      "REPUBLIC OF KENYA",
      "MINISTRY OF EDUCATION",
      "KENYA INSTITUTE OF CURRICULUM DEVELOPMENT",
      "COMPETENCY-BASED CURRICULUM",
      "PERFORMANCE-BASED ASSESSMENT DOCUMENT",
      "=".repeat(65),
      "",
      `Learning Area: ${learningArea}`,
      `Grade: ${grade}`,
      `Number of Tasks: ${tasks.length}`,
      "",
      "--- ASSESSMENT BLUEPRINT ---",
      "",
      "Assessment Type Distribution:",
      ...Object.entries(blueprintData?.typeDistribution || {}).map(([type, count]) =>
        `  ${typeLabels[type as TaskType]}: ${count} task(s) (${Math.round((count / tasks.length) * 100)}%)`
      ),
      "",
      "Competency Focus Distribution:",
      ...(blueprintData?.competencyFocus || []).map((c) =>
        `  ${c.name}: ${c.percentage}% focus`
      ),
      "",
      "=".repeat(65),
      "ASSESSMENT TASKS",
      "=".repeat(65),
      "",
      ...tasks.map((t, i) => [
        `TASK ${i + 1}: ${t.task.title}`,
        `Type: ${typeLabels[t.type]}`,
        `Intent: ${taskIntentLabels[t.type] || "General Assessment Task"}`,
        "",
        "Description:",
        `  ${t.task.description}`,
        ...(t.task.materials ? ["", "Materials:", ...t.task.materials.split(",").map((m) => `  • ${m.trim()}`)] : []),
        "",
        "Assessment Criteria:",
        ...t.task.criteria.map((c) => `  • ${c}`),
        "",
        "Competency Mapping:",
        ...(competencyMappingPerTask[t.type] || []).map((cm) =>
          `  • ${cm.competency} (${cm.level})`
        ),
        "",
        "Performance Rubric:",
        ...rubricLevels.map((r) =>
          `  ${r.code} (${r.label}): ${r.description}`
        ),
        "",
      ]).flat(),
      "=".repeat(65),
      "END OF ASSESSMENT DOCUMENT",
      "=".repeat(65),
    ]
    navigator.clipboard.writeText(lines.join("\n"))
    trackToolUse("exam-generator", "copy")
    toast.success("Assessment copied to clipboard")
  }, [learningArea, grade, tasks, blueprintData, typeLabels])

  const handlePrint = useCallback(() => {
    trackToolUse("exam-generator", "print")
    window.print()
  }, [])

  const handlePDF = useCallback(async () => {
    try {
      const { default: jsPDF } = await import("jspdf")
      const doc = new jsPDF()
      let y = 20
      const margin = 20
      const maxWidth = 170
      const lineHeight = 5

      const addPageIfNeeded = (limit = 265) => { if (y > limit) { doc.addPage(); y = 20 } }

      // ── Document Header ──
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text("REPUBLIC OF KENYA — MINISTRY OF EDUCATION", margin, y); y += 4
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text("KENYA INSTITUTE OF CURRICULUM DEVELOPMENT", margin, y); y += 5
      doc.setFontSize(10)
      doc.text("PERFORMANCE-BASED ASSESSMENT DOCUMENT", margin, y); y += 8
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)

      // ── Blueprint ──
      doc.setFont("helvetica", "bold")
      doc.text("ASSESSMENT BLUEPRINT", margin, y); y += 5
      doc.setFont("helvetica", "normal")
      doc.text(`Learning Area: ${learningArea}    Grade: ${grade}    Number of Tasks: ${tasks.length}`, margin, y); y += 5
      doc.text("Assessment Type Distribution:", margin, y); y += 4
      doc.setFontSize(8)
      Object.entries(blueprintData?.typeDistribution || {}).forEach(([type, count]) => {
        addPageIfNeeded()
        doc.text(`  ${typeLabels[type as TaskType]}: ${count} task(s) (${Math.round((count / tasks.length) * 100)}%)`, margin, y)
        y += 4
      })
      y += 2
      doc.setFontSize(9)
      doc.setFont("helvetica", "bold")
      doc.text("Competency Focus Distribution:", margin, y); y += 4
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      ;(blueprintData?.competencyFocus || []).forEach((c) => {
        addPageIfNeeded()
        doc.text(`  ${c.name}: ${c.percentage}%`, margin, y)
        y += 4
      })
      y += 4

      // ── Tasks ──
      tasks.forEach((t, i) => {
        addPageIfNeeded(250)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.text(`TASK ${i + 1}: ${t.task.title}`, margin, y); y += 5
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.text(`Type: ${typeLabels[t.type]}`, margin, y); y += 4
        doc.text(`Intent: ${taskIntentLabels[t.type] || "General Assessment Task"}`, margin, y); y += 5

        // Description
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.text("Description:", margin, y); y += 4
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        const descLines = doc.splitTextToSize(t.task.description, maxWidth)
        descLines.forEach((l: string) => {
          addPageIfNeeded()
          doc.text(l, margin + 3, y); y += lineHeight
        })
        y += 1

        // Materials
        if (t.task.materials) {
          addPageIfNeeded()
          doc.setFont("helvetica", "bold")
          doc.setFontSize(9)
          doc.text("Materials:", margin, y); y += 4
          doc.setFont("helvetica", "normal")
          doc.setFontSize(8)
          t.task.materials.split(",").forEach((m) => {
            addPageIfNeeded()
            doc.text(`  • ${m.trim()}`, margin, y); y += lineHeight
          })
          y += 1
        }

        // Assessment Criteria
        addPageIfNeeded()
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.text("Assessment Criteria:", margin, y); y += 4
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        t.task.criteria.forEach((c) => {
          addPageIfNeeded()
          doc.text(`  • ${c}`, margin, y); y += lineHeight
        })
        y += 1

        // Competency Mapping
        addPageIfNeeded()
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.text("Competency Mapping:", margin, y); y += 4
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        ;(competencyMappingPerTask[t.type] || []).forEach((cm) => {
          addPageIfNeeded()
          doc.text(`  • ${cm.competency} (${cm.level})`, margin, y); y += lineHeight
        })
        y += 1

        // Rubric
        addPageIfNeeded()
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.text("Performance Rubric:", margin, y); y += 4
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        rubricLevels.forEach((r) => {
          addPageIfNeeded()
          const rubricText = `${r.code} (${r.label}): ${r.description}`
          const rLines = doc.splitTextToSize(rubricText, maxWidth - 5)
          rLines.forEach((l: string) => {
            addPageIfNeeded()
            doc.text(l, margin + 3, y); y += lineHeight
          })
        })
        y += 3
      })

      doc.text("— END OF ASSESSMENT DOCUMENT —", margin, y)
      doc.save("cbc-assessment.pdf")
      trackDownload("exam-generator", "pdf")
      toast.success("PDF downloaded")
    } catch {
      toast.error("Failed to generate PDF")
    }
  }, [learningArea, grade, tasks, blueprintData, typeLabels])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">CBC Assessment Tool</h2>
        <p className="text-sm text-muted-foreground">Generate performance-based assessments — projects, practical tasks, observations, and group work</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Grade</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)}
                className="h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring dark:bg-input/30">
                {grades.map((g) => (<option key={g} value={g}>{g}</option>))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Learning Area</label>
              <select value={learningArea} onChange={(e) => setLearningArea(e.target.value)}
                className="h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring dark:bg-input/30">
                {learningAreas.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Number of Tasks</label>
              <Input type="number" value={numTasks} onChange={(e) => setNumTasks(e.target.value)} min="1" max="12" className="h-10 text-sm" />
            </div>
          </div>

          <Button onClick={generate} className="w-full">
            <ClipboardCheck className="h-4 w-4" /> Generate Performance Assessment
          </Button>
        </CardContent>
      </Card>

      {!generated && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted/30 p-4 mb-4">
            <ClipboardCheck className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No assessment generated yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1.5 max-w-[280px]">
            Configure your assessment settings above and click Generate
          </p>
        </div>
      )}
      {generated && blueprintData && (
        <>
          {/* ── KICD DOCUMENT ── */}
          <div className="border border-border/60 rounded-xl overflow-hidden bg-card shadow-sm">
            {/* Document Header */}
            <div className="bg-gradient-to-b from-primary/5 via-primary/[0.03] to-background border-b border-border/40 px-6 py-6 text-center">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.15em] mb-2">
                Republic of Kenya — Ministry of Education
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
                <GraduationCap className="size-3.5" /> KICD Competency-Based Curriculum
              </div>
              <h3 className="text-lg font-bold tracking-tight">PERFORMANCE-BASED ASSESSMENT DOCUMENT</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Kenya Institute of Curriculum Development</p>
            </div>

            <div className="divide-y divide-border/40">
              {/* ── ASSESSMENT BLUEPRINT ── */}
              <div className="px-6 py-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-6 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="size-3.5 text-primary" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Assessment Blueprint</h4>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="rounded-lg border bg-muted/10 p-3">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Learning Area</span>
                    <p className="text-sm font-semibold mt-0.5">{learningArea}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/10 p-3">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Grade</span>
                    <p className="text-sm font-semibold mt-0.5">{grade}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/10 p-3">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Number of Tasks</span>
                    <p className="text-sm font-semibold mt-0.5">{tasks.length}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/10 p-3">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Document Type</span>
                    <p className="text-sm font-semibold mt-0.5">Performance Assessment</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Assessment Type Distribution */}
                  <div className="rounded-lg border bg-muted/10 p-4">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                      <ListChecks className="size-3" /> Assessment Type Summary
                    </h5>
                    <div className="space-y-2">
                      {Object.entries(blueprintData.typeDistribution).map(([type, count]) => {
                        const pct = Math.round((count / tasks.length) * 100)
                        return (
                          <div key={type} className="flex items-center gap-3">
                            <span className="text-xs w-6 text-center font-medium">{pct}%</span>
                            <div className="flex-1 h-4 rounded-full bg-muted-foreground/10 overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  type === "project" && "bg-blue-500",
                                  type === "practical" && "bg-green-500",
                                  type === "observation" && "bg-amber-500",
                                  type === "problem-solving" && "bg-purple-500",
                                  type === "group-work" && "bg-rose-500",
                                )}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground w-28 text-right">
                              {typeLabels[type as TaskType]}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Competency Focus Distribution */}
                  <div className="rounded-lg border bg-muted/10 p-4">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Brain className="size-3" /> Competency Focus Distribution
                    </h5>
                    <div className="space-y-2">
                      {blueprintData.competencyFocus.map((comp) => (
                        <div key={comp.name} className="flex items-center gap-3">
                          <span className="text-[10px] text-muted-foreground w-32 text-right">{comp.name}</span>
                          <div className="flex-1 h-4 rounded-full bg-muted-foreground/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary/60 transition-all"
                              style={{ width: `${comp.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-10 text-right">{comp.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── ASSESSMENT TASKS ── */}
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="size-3.5 text-primary" />
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Assessment Tasks</h4>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="xs" onClick={generate}>
                      <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                    </Button>
                    <Button variant="outline" size="xs" onClick={handleCopy}>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                    <Button variant="outline" size="xs" onClick={handlePDF}>
                      <FileDown className="h-3.5 w-3.5" /> PDF
                    </Button>
                    <Button variant="outline" size="xs" onClick={handlePrint}>
                      <Printer className="h-3.5 w-3.5" /> Print
                    </Button>
                  </div>
                </div>

                <div className="space-y-5">
                  {tasks.map((t, i) => {
                    const compList = competencyMappingPerTask[t.type] || []
                    return (
                      <div key={i} className="rounded-xl border overflow-hidden">
                        {/* Task Header */}
                        <div className={cn(
                          "px-5 py-3 border-b flex items-center justify-between",
                          t.type === "project" && "bg-blue-500/5 border-blue-200/30 dark:border-blue-800/30",
                          t.type === "practical" && "bg-green-500/5 border-green-200/30 dark:border-green-800/30",
                          t.type === "observation" && "bg-amber-500/5 border-amber-200/30 dark:border-amber-800/30",
                          t.type === "problem-solving" && "bg-purple-500/5 border-purple-200/30 dark:border-purple-800/30",
                          t.type === "group-work" && "bg-rose-500/5 border-rose-200/30 dark:border-rose-800/30",
                        )}>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "size-8 rounded-lg flex items-center justify-center text-sm font-bold",
                              t.type === "project" && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                              t.type === "practical" && "bg-green-500/10 text-green-600 dark:text-green-400",
                              t.type === "observation" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                              t.type === "problem-solving" && "bg-purple-500/10 text-purple-600 dark:text-purple-400",
                              t.type === "group-work" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                            )}>
                              {i + 1}
                            </div>
                            <div>
                              <h5 className="text-sm font-bold">TASK {i + 1}: {t.task.title}</h5>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                                  {typeLabels[t.type]}
                                </Badge>
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-muted-foreground">
                                  {taskIntentLabels[t.type] || "Assessment Task"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Task Body */}
                        <div className="p-5 space-y-4">
                          {/* Description */}
                          <div className="flex items-start gap-3">
                            <Sparkles className="size-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Description</span>
                              <p className="text-sm leading-relaxed text-foreground/90">{t.task.description}</p>
                            </div>
                          </div>

                          {/* Materials */}
                          {t.task.materials && (
                            <div className="flex items-start gap-3">
                              <ListChecks className="size-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Materials</span>
                                <ul className="space-y-0.5">
                                  {t.task.materials.split(",").map((m, mi) => (
                                    <li key={mi} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                      <span className="size-1 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />
                                      {m.trim()}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Assessment Criteria */}
                          <div className="flex items-start gap-3">
                            <Target className="size-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Assessment Criteria</span>
                              <ul className="space-y-0.5">
                                {t.task.criteria.map((c, ci) => (
                                  <li key={ci} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                    <CheckCircle2 className="size-3 text-green-500 mt-0.5 flex-shrink-0" />
                                    {c}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Competency Mapping */}
                          <div className="flex items-start gap-3">
                            <Brain className="size-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Competency Mapping</span>
                              <div className="flex flex-wrap gap-2">
                                {compList.map((cm, ci) => (
                                  <Badge key={ci} variant="outline" className={cn(
                                    "text-[10px] gap-1",
                                    cm.level === "High" && "border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/5",
                                    cm.level === "Medium" && "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5",
                                    cm.level === "Low" && "border-muted-foreground/30 text-muted-foreground",
                                  )}>
                                    {cm.competency} <span className="font-medium">({cm.level})</span>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Performance Rubric */}
                          <div className="flex items-start gap-3">
                            <BarChart3 className="size-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Performance Rubric</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {rubricLevels.map((r, ri) => (
                                  <div key={ri} className={cn(
                                    "rounded-lg border p-2.5",
                                    r.code === "EE" && "border-green-300/40 dark:border-green-700/40 bg-green-500/[0.03]",
                                    r.code === "ME" && "border-blue-300/40 dark:border-blue-700/40 bg-blue-500/[0.03]",
                                    r.code === "AE" && "border-amber-300/40 dark:border-amber-700/40 bg-amber-500/[0.03]",
                                    r.code === "BE" && "border-red-300/40 dark:border-red-700/40 bg-red-500/[0.03]",
                                  )}>
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <span className={cn(
                                        "text-[10px] font-bold px-1.5 py-0.5 rounded",
                                        r.code === "EE" && "bg-green-500/10 text-green-600 dark:text-green-400",
                                        r.code === "ME" && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                                        r.code === "AE" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                                        r.code === "BE" && "bg-red-500/10 text-red-600 dark:text-red-400",
                                      )}>
                                        {r.code}
                                      </span>
                                      <span className="text-[10px] font-semibold text-foreground/80">{r.label}</span>
                                    </div>
                                    <p className="text-[9px] leading-relaxed text-muted-foreground">{r.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-muted/10 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>KICD Competency-Based Curriculum — Performance Assessment</span>
                <span>Generated with Zilita</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

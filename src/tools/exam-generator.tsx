"use client"

import { useState, useCallback, useMemo } from "react"
import { ClipboardCheck, Copy, Printer, FileDown, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
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

export default function CBCAssessmentTool() {
  const [grade, setGrade] = useState("Grade 4")
  const [learningArea, setLearningArea] = useState("Science and Technology")
  const [numTasks, setNumTasks] = useState("4")
  const [generated, setGenerated] = useState(false)
  const [tasks, setTasks] = useState<{ type: TaskType; task: { title: string; description: string; materials?: string; criteria: string[] } }[]>([])

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

    setTasks(selected.map((s) => ({ type: s.type, task: s.task })))
    setGenerated(true)
    trackToolUse("exam-generator", "generate")
    toast.success("CBC performance assessment generated")
  }

  const typeLabels: Record<TaskType, string> = {
    "project": "Project",
    "practical": "Practical Activity",
    "observation": "Observation Task",
    "problem-solving": "Problem-Solving Task",
    "group-work": "Group Work Assignment",
  }

  const typeColors: Record<TaskType, string> = {
    "project": "border-blue-500/30 bg-blue-500/10",
    "practical": "border-green-500/30 bg-green-500/10",
    "observation": "border-amber-500/30 bg-amber-500/10",
    "problem-solving": "border-purple-500/30 bg-purple-500/10",
    "group-work": "border-rose-500/30 bg-rose-500/10",
  }

  const handleCopy = useCallback(() => {
    const lines = [
      "CBC PERFORMANCE-BASED ASSESSMENT",
      "=".repeat(50),
      `Learning Area: ${learningArea}`,
      `Grade: ${grade}`,
      `Total Tasks: ${tasks.length}`,
      "",
      ...tasks.map((t, i) => [
        `Task ${i + 1}: ${typeLabels[t.type]}`,
        `Title: ${t.task.title}`,
        `Description: ${t.task.description}`,
        ...(t.task.materials ? [`Materials: ${t.task.materials}`] : []),
        "Assessment Criteria:",
        ...t.task.criteria.map((c) => `   • ${c}`),
        "",
      ]).flat(),
    ]
    navigator.clipboard.writeText(lines.join("\n"))
    trackToolUse("exam-generator", "copy")
    toast.success("Assessment copied")
  }, [learningArea, grade, tasks])

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
      const lineHeight = 6

      doc.setFontSize(14)
      doc.text("CBC PERFORMANCE-BASED ASSESSMENT", margin, y)
      y += 9
      doc.setFontSize(10)
      doc.text(`Learning Area: ${learningArea}    Grade: ${grade}    Tasks: ${tasks.length}`, margin, y)
      y += 10

      tasks.forEach((t, i) => {
        if (y > 260) { doc.addPage(); y = 20 }
        doc.setFont("helvetica", "bold")
        doc.setFontSize(11)
        doc.text(`Task ${i + 1}: ${typeLabels[t.type]}`, margin, y)
        y += 7
        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        doc.text(`Title: ${t.task.title}`, margin, y)
        y += 6
        const descLines = doc.splitTextToSize(t.task.description, maxWidth)
        descLines.forEach((l: string) => {
          if (y > 270) { doc.addPage(); y = 20 }
          doc.text(l, margin, y)
          y += lineHeight
        })
        y += 2
        if (t.task.materials) {
          doc.text(`Materials: ${t.task.materials}`, margin, y)
          y += 6
        }
        doc.setFont("helvetica", "bold")
        doc.text("Assessment Criteria:", margin, y)
        y += 5
        doc.setFont("helvetica", "normal")
        t.task.criteria.forEach((c) => {
          if (y > 275) { doc.addPage(); y = 20 }
          doc.text(`   • ${c}`, margin, y)
          y += lineHeight
        })
        y += 5
      })

      doc.save("cbc-assessment.pdf")
      trackDownload("exam-generator", "pdf")
      toast.success("PDF downloaded")
    } catch {
      toast.error("Failed to generate PDF")
    }
  }, [learningArea, grade, tasks])

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

      {generated && (
        <>
          <Card className="border-primary/30">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Performance-Based Assessment</h3>
                  <p className="text-xs text-muted-foreground">
                    {learningArea} &middot; Grade {grade} &middot; {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                  </p>
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

              <Separator />

              <div className="space-y-4">
                {tasks.map((t, i) => (
                  <Card key={i} className={`border ${typeColors[t.type]}`}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColors[t.type]}`}>
                          {typeLabels[t.type]}
                        </span>
                        <span className="text-[10px] text-muted-foreground">Task {i + 1}</span>
                      </div>
                      <h4 className="font-semibold text-sm">{t.task.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{t.task.description}</p>
                      {t.task.materials && (
                        <p className="text-[10px] text-muted-foreground/70">
                          <span className="font-medium">Materials:</span> {t.task.materials}
                        </p>
                      )}
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">Assessment Criteria:</p>
                        <ul className="list-disc list-inside text-[10px] text-muted-foreground space-y-0.5">
                          {t.task.criteria.map((c, ci) => (
                            <li key={ci}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-sm">CBC Competency Mapping</h3>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-blue-500" /> Projects — Creativity, Critical Thinking</div>
                <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-green-500" /> Practical — Self-Efficacy, Digital Literacy</div>
                <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-amber-500" /> Observation — Learning to Learn, Communication</div>
                <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-purple-500" /> Problem-Solving — Critical Thinking, Creativity</div>
                <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-rose-500" /> Group Work — Collaboration, Citizenship</div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

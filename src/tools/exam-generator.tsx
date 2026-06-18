"use client"

import { useState, useCallback, useMemo } from "react"
import { FileSpreadsheet, Copy, Printer, FileDown, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { trackToolUse, trackDownload } from "@/lib/analytics"

type Difficulty = "easy" | "medium" | "hard"

const questionBanks: Record<string, Record<Difficulty, { mcq: { question: string; options: string[]; answer: string }[]; shortAnswer: { question: string; answer: string }[] }>> = {
  Mathematics: {
    easy: {
      mcq: [
        { question: "What is 5 + 3?", options: ["6", "7", "8", "9"], answer: "8" },
        { question: "What is 12 - 4?", options: ["6", "7", "8", "9"], answer: "8" },
        { question: "What is 3 × 4?", options: ["10", "11", "12", "14"], answer: "12" },
        { question: "What is 15 ÷ 3?", options: ["3", "4", "5", "6"], answer: "5" },
        { question: "What is the next number: 2, 4, 6, ?", options: ["7", "8", "9", "10"], answer: "8" },
        { question: "How many sides does a triangle have?", options: ["2", "3", "4", "5"], answer: "3" },
        { question: "What is 10 × 10?", options: ["50", "100", "150", "200"], answer: "100" },
        { question: "What is half of 20?", options: ["5", "10", "15", "20"], answer: "10" },
      ],
      shortAnswer: [
        { question: "What is 7 + 8?", answer: "15" },
        { question: "What is 20 - 9?", answer: "11" },
        { question: "How many corners does a square have?", answer: "4" },
        { question: "What is 6 × 5?", answer: "30" },
      ],
    },
    medium: {
      mcq: [
        { question: "What is 45 + 37?", options: ["72", "82", "92", "102"], answer: "82" },
        { question: "What is 100 - 63?", options: ["27", "37", "47", "57"], answer: "37" },
        { question: "What is 12 × 8?", options: ["86", "96", "106", "116"], answer: "96" },
        { question: "What is 144 ÷ 12?", options: ["10", "11", "12", "13"], answer: "12" },
        { question: "What is the perimeter of a 5cm square?", options: ["15cm", "20cm", "25cm", "30cm"], answer: "20cm" },
        { question: "What is 3/4 as a decimal?", options: ["0.25", "0.5", "0.75", "1.25"], answer: "0.75" },
        { question: "What is 25% of 80?", options: ["15", "20", "25", "30"], answer: "20" },
        { question: "How many degrees in a right angle?", options: ["45°", "60°", "90°", "180°"], answer: "90°" },
      ],
      shortAnswer: [
        { question: "What is 156 + 89?", answer: "245" },
        { question: "What is 250 - 178?", answer: "72" },
        { question: "What is 15 × 15?", answer: "225" },
        { question: "What is the area of a 6cm by 4cm rectangle?", answer: "24cm²" },
      ],
    },
    hard: {
      mcq: [
        { question: "What is 15% of 240?", options: ["26", "30", "36", "40"], answer: "36" },
        { question: "Solve: 3x + 7 = 22. What is x?", options: ["3", "5", "7", "9"], answer: "5" },
        { question: "What is the square root of 169?", options: ["11", "12", "13", "14"], answer: "13" },
        { question: "What is 2⁵?", options: ["16", "24", "32", "64"], answer: "32" },
        { question: "What is the LCM of 6 and 8?", options: ["12", "16", "24", "48"], answer: "24" },
        { question: "What is the GCF of 36 and 54?", options: ["6", "9", "12", "18"], answer: "18" },
        { question: "What is (a² - b²) equal to?", options: ["(a-b)²", "(a+b)(a-b)", "(a+b)²", "a²-2ab+b²"], answer: "(a+b)(a-b)" },
        { question: "What is 7! (7 factorial)?", options: ["720", "5040", "40320", "840"], answer: "5040" },
      ],
      shortAnswer: [
        { question: "Solve: 2x - 5 = 15. What is x?", answer: "10" },
        { question: "What is the area of a circle with radius 7cm? (use π=22/7)", answer: "154cm²" },
        { question: "What is 12.5% as a fraction in simplest form?", answer: "1/8" },
        { question: "What is the volume of a 3cm cube?", answer: "27cm³" },
      ],
    },
  },
  English: {
    easy: {
      mcq: [
        { question: "Which is a noun?", options: ["run", "beautiful", "book", "quickly"], answer: "book" },
        { question: "What is the opposite of 'hot'?", options: ["warm", "cold", "cool", "mild"], answer: "cold" },
        { question: "Which word is a verb?", options: ["happy", "jump", "blue", "house"], answer: "jump" },
        { question: "What is the plural of 'child'?", options: ["childs", "childes", "children", "child's"], answer: "children" },
        { question: "Which sentence is correct?", options: ["She go to school", "She goes to school", "She going school", "She go school"], answer: "She goes to school" },
        { question: "What is an adjective?", options: ["A doing word", "A describing word", "A naming word", "A connecting word"], answer: "A describing word" },
        { question: "Which word is a pronoun?", options: ["table", "she", "quickly", "and"], answer: "she" },
        { question: "What is the past tense of 'walk'?", options: ["walked", "walking", "walks", "walk"], answer: "walked" },
      ],
      shortAnswer: [
        { question: "What is the opposite of 'big'?", answer: "small" },
        { question: "How many letters are in the word 'education'?", answer: "9" },
        { question: "What is the plural of 'box'?", answer: "boxes" },
        { question: "Which is correct: 'a apple' or 'an apple'?", answer: "an apple" },
      ],
    },
    medium: {
      mcq: [
        { question: "Which sentence uses correct punctuation?", options: ["Hi how are you", "Hi, how are you?", "Hi how are you?", "Hi, how are you"], answer: "Hi, how are you?" },
        { question: "What is a synonym of 'happy'?", options: ["sad", "angry", "joyful", "tired"], answer: "joyful" },
        { question: "Identify the conjunction: 'I like tea and coffee.'", options: ["like", "and", "tea", "coffee"], answer: "and" },
        { question: "What tense is 'She has eaten'?", options: ["past", "present", "present perfect", "future"], answer: "present perfect" },
        { question: "Which is a compound word?", options: ["table", "sunflower", "quickly", "happiness"], answer: "sunflower" },
        { question: "What is an antonym of 'beautiful'?", options: ["pretty", "ugly", "charming", "lovely"], answer: "ugly" },
        { question: "Which is a proper noun?", options: ["city", "dog", "London", "book"], answer: "London" },
        { question: "What is the comparative form of 'good'?", options: ["gooder", "more good", "better", "best"], answer: "better" },
      ],
      shortAnswer: [
        { question: "Give the past tense of 'write'", answer: "wrote" },
        { question: "What is the prefix in 'unhappy'?", answer: "un" },
        { question: "How many syllables in 'elephant'?", answer: "3" },
        { question: "What is the feminine form of 'actor'?", answer: "actress" },
      ],
    },
    hard: {
      mcq: [
        { question: "Identify the figure of speech: 'The world is a stage.'", options: ["simile", "metaphor", "personification", "alliteration"], answer: "metaphor" },
        { question: "Which sentence is in passive voice?", options: ["The cat chased the mouse", "The mouse was chased by the cat", "The cat is chasing", "The mouse runs"], answer: "The mouse was chased by the cat" },
        { question: "What is the correct spelling?", options: ["accomodate", "accommodate", "acommodate", "accomoddate"], answer: "accommodate" },
        { question: "Which is a dangling modifier?", options: ["Walking home, the rain started", "Walking home, I got wet", "While walking home, it rained", "I walked home in the rain"], answer: "Walking home, the rain started" },
        { question: "What type of clause is 'because she was tired'?", options: ["independent", "dependent", "relative", "noun"], answer: "dependent" },
        { question: "Identify the literary device: 'bang', 'hiss', 'pop'", options: ["metaphor", "simile", "onomatopoeia", "oxymoron"], answer: "onomatopoeia" },
        { question: "What is the subjunctive form? 'If I ___ you...'", options: ["was", "am", "were", "be"], answer: "were" },
        { question: "Which word is a gerund?", options: ["running", "runs", "ran", "runner"], answer: "running" },
      ],
      shortAnswer: [
        { question: "What is the difference between 'affect' and 'effect'? (brief)", answer: "Affect is a verb, effect is a noun" },
        { question: "Identify the error: 'Me and John went to the store'", answer: "Should be 'John and I'" },
        { question: "What is the past participle of 'sing'?", answer: "sung" },
        { question: "Define an oxymoron with an example", answer: "A figure of speech combining contradictory terms (e.g., 'deafening silence')" },
      ],
    },
  },
  Science: {
    easy: {
      mcq: [
        { question: "What is H₂O?", options: ["Salt", "Water", "Sugar", "Oxygen"], answer: "Water" },
        { question: "Which planet is closest to the sun?", options: ["Venus", "Earth", "Mercury", "Mars"], answer: "Mercury" },
        { question: "What do plants need for photosynthesis?", options: ["Water only", "Sunlight only", "Sunlight and water", "Soil only"], answer: "Sunlight and water" },
        { question: "What is the largest organ in the human body?", options: ["Liver", "Heart", "Skin", "Brain"], answer: "Skin" },
        { question: "What gas do we breathe out?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], answer: "Carbon dioxide" },
        { question: "How many bones are in the adult human body?", options: ["106", "206", "306", "406"], answer: "206" },
        { question: "What is the boiling point of water?", options: ["90°C", "100°C", "110°C", "120°C"], answer: "100°C" },
        { question: "Which animal is known as the 'king of the jungle'?", options: ["Tiger", "Lion", "Elephant", "Gorilla"], answer: "Lion" },
      ],
      shortAnswer: [
        { question: "What are the three states of matter?", answer: "Solid, liquid, gas" },
        { question: "What planet is known as the Red Planet?", answer: "Mars" },
        { question: "What is the sense organ for sight?", answer: "Eyes" },
        { question: "What do roots of a plant do?", answer: "Absorb water and nutrients from soil" },
      ],
    },
    medium: {
      mcq: [
        { question: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], answer: "Au" },
        { question: "What is the speed of light approximately?", options: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "100,000 km/s"], answer: "300,000 km/s" },
        { question: "Which blood type is the universal donor?", options: ["A", "B", "AB", "O"], answer: "O" },
        { question: "What process converts sugar into energy in cells?", options: ["Photosynthesis", "Respiration", "Digestion", "Fermentation"], answer: "Respiration" },
        { question: "What is the pH of pure water?", options: ["5", "6", "7", "8"], answer: "7" },
        { question: "Which vitamin is produced when skin is exposed to sunlight?", options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], answer: "Vitamin D" },
        { question: "What is the smallest unit of life?", options: ["Atom", "Cell", "Tissue", "Organ"], answer: "Cell" },
        { question: "What type of rock is formed from magma?", options: ["Sedimentary", "Igneous", "Metamorphic", "Fossilized"], answer: "Igneous" },
      ],
      shortAnswer: [
        { question: "What is the function of the mitochondria?", answer: "Powerhouse of the cell; produces energy" },
        { question: "What causes tides on Earth?", answer: "Gravitational pull of the moon" },
        { question: "What is the chemical formula for table salt?", answer: "NaCl" },
        { question: "What is metamorphosis?", answer: "Transformation in body structure (e.g., caterpillar to butterfly)" },
      ],
    },
    hard: {
      mcq: [
        { question: "What is the half-life of Carbon-14?", options: ["2,730 years", "5,730 years", "11,460 years", "22,920 years"], answer: "5,730 years" },
        { question: "Which particle is responsible for electrical current?", options: ["Proton", "Neutron", "Electron", "Photon"], answer: "Electron" },
        { question: "What is the function of the Golgi apparatus?", options: ["Protein synthesis", "Energy production", "Packaging and transport", "Cell division"], answer: "Packaging and transport" },
        { question: "What is the Heisenberg Uncertainty Principle?", options: ["Energy equals mass", "Position and momentum cannot both be perfectly known", "Light is both wave and particle", "Entropy always increases"], answer: "Position and momentum cannot both be perfectly known" },
        { question: "What is the unit of electrical resistance?", options: ["Volt", "Ampere", "Ohm", "Watt"], answer: "Ohm" },
        { question: "Which hormone regulates blood sugar?", options: ["Adrenaline", "Insulin", "Thyroxine", "Estrogen"], answer: "Insulin" },
        { question: "What is the difference between DNA and RNA?", options: ["RNA has uracil instead of thymine", "DNA has uracil", "RNA is double-stranded", "They are identical"], answer: "RNA has uracil instead of thymine" },
        { question: "What is absolute zero in Celsius?", options: ["-100°C", "-200°C", "-273.15°C", "-373.15°C"], answer: "-273.15°C" },
      ],
      shortAnswer: [
        { question: "What is the theory of general relativity about?", answer: "Gravity as the curvature of spacetime" },
        { question: "What is the role of the enzyme helicase in DNA replication?", answer: "Unwinds the DNA double helix" },
        { question: "What is stoichiometry?", answer: "Calculation of reactants and products in chemical reactions" },
        { question: "What is the photoelectric effect?", answer: "Emission of electrons from a material when light shines on it" },
      ],
    },
  },
}

const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"]
const subjectsList = ["Mathematics", "English", "Science"]

export default function ExamGenerator() {
  const [grade, setGrade] = useState("Grade 4")
  const [subject, setSubject] = useState("Mathematics")
  const [numQuestions, setNumQuestions] = useState("10")
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [examGenerated, setExamGenerated] = useState(false)
  const [mcqs, setMcqs] = useState<{ question: string; options: string[]; answer: string }[]>([])
  const [shortAnswers, setShortAnswers] = useState<{ question: string; answer: string }[]>([])

  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const generate = () => {
    const bank = questionBanks[subject]
    if (!bank) {
      toast.error(`Question bank for ${subject} not available`)
      return
    }

    const diffBank = bank[difficulty]
    const total = Math.max(1, Math.min(Number(numQuestions) || 10, 50))
    const mcqCount = Math.ceil(total * 0.6)
    const saCount = total - mcqCount

    const shuffledMcq = shuffle(diffBank.mcq).slice(0, mcqCount)
    const shuffledSa = shuffle(diffBank.shortAnswer).slice(0, saCount)

    setMcqs(shuffledMcq)
    setShortAnswers(shuffledSa)
    setExamGenerated(true)
    trackToolUse("exam-generator", "generate")
    toast.success("Exam generated")
  }

  const handleCopy = useCallback(() => {
    const lines = [
      `${subject} EXAMINATION`,
      `Grade: ${grade}  |  Difficulty: ${difficulty}  |  Total Questions: ${mcqs.length + shortAnswers.length}`,
      "",
      "SECTION A: MULTIPLE CHOICE",
      ...mcqs.map((q, i) => `${i + 1}. ${q.question}\n   ${q.options.map((o, j) => `${String.fromCharCode(97 + j)}) ${o}`).join("  ")}`),
      "",
      "SECTION B: SHORT ANSWER",
      ...shortAnswers.map((q, i) => `${i + 1}. ${q.question}`),
      "",
      "--- ANSWER KEY ---",
      "Multiple Choice:",
      ...mcqs.map((q, i) => `${i + 1}. ${q.answer}`),
      "Short Answer:",
      ...shortAnswers.map((q, i) => `${i + 1}. ${q.answer}`),
    ]
    navigator.clipboard.writeText(lines.join("\n"))
    trackToolUse("exam-generator", "copy")
    toast.success("Exam copied")
  }, [subject, grade, difficulty, mcqs, shortAnswers])

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
      const pageWidth = doc.internal.pageSize.getWidth()
      const maxWidth = pageWidth - margin * 2
      const lineHeight = 7

      doc.setFontSize(16)
      doc.text(`${subject} EXAMINATION`, margin, y)
      y += 9
      doc.setFontSize(10)
      doc.text(`Grade: ${grade}  |  Difficulty: ${difficulty}`, margin, y)
      y += 14

      const writeLine = (text: string) => {
        if (y > 275) { doc.addPage(); y = 20 }
        doc.text(text, margin, y)
        y += lineHeight
      }

      doc.setFontSize(12)
      writeLine("SECTION A: MULTIPLE CHOICE")
      doc.setFontSize(10)
      y += 3

      mcqs.forEach((q, i) => {
        if (y > 260) { doc.addPage(); y = 20; doc.setFontSize(10) }
        const lines = doc.splitTextToSize(`${i + 1}. ${q.question}`, maxWidth)
        lines.forEach((l: string) => writeLine(l))
        q.options.forEach((opt, j) => {
          writeLine(`   ${String.fromCharCode(97 + j)}) ${opt}`)
        })
        y += 3
      })

      y += 5
      if (y > 260) { doc.addPage(); y = 20 }
      doc.setFontSize(12)
      writeLine("SECTION B: SHORT ANSWER")
      doc.setFontSize(10)
      y += 3

      shortAnswers.forEach((q, i) => {
        if (y > 270) { doc.addPage(); y = 20 }
        const lines = doc.splitTextToSize(`${i + 1}. ${q.question}`, maxWidth)
        lines.forEach((l: string) => writeLine(l))
        y += 5
      })

      doc.addPage()
      y = 20
      doc.setFontSize(14)
      writeLine("ANSWER KEY")
      y += 5
      doc.setFontSize(11)
      writeLine("Section A: Multiple Choice")
      doc.setFontSize(10)
      mcqs.forEach((q, i) => writeLine(`${i + 1}. ${q.answer}`))
      y += 5
      doc.setFontSize(11)
      writeLine("Section B: Short Answer")
      doc.setFontSize(10)
      shortAnswers.forEach((q, i) => {
        const lines = doc.splitTextToSize(`${i + 1}. ${q.answer}`, maxWidth)
        lines.forEach((l: string) => writeLine(l))
      })

      doc.save(`${subject.toLowerCase()}-exam.pdf`)
      trackDownload("exam-generator", "pdf")
      toast.success("PDF downloaded")
    } catch {
      toast.error("Failed to generate PDF")
    }
  }, [subject, grade, difficulty, mcqs, shortAnswers])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Exam Generator</h2>
        <p className="text-sm text-muted-foreground">Generate structured exams from predefined question banks</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                {grades.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                {subjectsList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Questions</label>
              <Input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                min="1"
                max="50"
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <Button onClick={generate} className="w-full">
            <FileSpreadsheet className="h-4 w-4" /> Generate Exam
          </Button>
        </CardContent>
      </Card>

      {examGenerated && (
        <>
          <Card className="border-primary/30">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{subject} Examination</h3>
                  <p className="text-xs text-muted-foreground">
                    Grade: {grade} &middot; Difficulty: {difficulty} &middot; Total: {mcqs.length + shortAnswers.length} questions
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

              <div>
                <h4 className="text-sm font-semibold mb-2">Section A: Multiple Choice ({mcqs.length} questions)</h4>
                <div className="space-y-3">
                  {mcqs.map((q, i) => (
                    <div key={i} className="rounded-lg border bg-muted/10 p-3 text-sm">
                      <p className="font-medium mb-2">{i + 1}. {q.question}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {q.options.map((opt, j) => (
                          <label key={j} className="flex items-center gap-2 text-xs text-muted-foreground py-0.5">
                            <input type="radio" name={`mcq-${i}`} className="accent-primary" />
                            <span>{String.fromCharCode(97 + j)}) {opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-semibold mb-2">Section B: Short Answer ({shortAnswers.length} questions)</h4>
                <div className="space-y-2">
                  {shortAnswers.map((q, i) => (
                    <div key={i} className="rounded-lg border bg-muted/10 p-3 text-sm">
                      <p className="font-medium">{mcqs.length + i + 1}. {q.question}</p>
                      <div className="mt-2 border-b border-dashed border-muted-foreground/20 h-6" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-sm">Answer Key</h3>
              <Separator />
              <div className="text-xs space-y-2">
                <p className="font-medium text-muted-foreground">Section A: Multiple Choice</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                  {mcqs.map((q, i) => (
                    <div key={i} className="font-mono"><span className="text-muted-foreground">{i + 1}.</span> {q.answer}</div>
                  ))}
                </div>
                <p className="font-medium text-muted-foreground mt-3">Section B: Short Answer (Model Answers)</p>
                <div className="space-y-1">
                  {shortAnswers.map((q, i) => (
                    <div key={i} className="font-mono">
                      <span className="text-muted-foreground">{mcqs.length + i + 1}.</span> {q.answer}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

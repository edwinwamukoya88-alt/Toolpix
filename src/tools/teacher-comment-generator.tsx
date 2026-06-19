"use client"

import { useState, useCallback } from "react"
import { MessageSquare, Copy, RefreshCw, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { trackToolUse } from "@/lib/analytics"

type CBCLevel = "BE" | "ME" | "AE" | "EE"

const cbcLabels: Record<CBCLevel, string> = {
  BE: "Below Expectation",
  ME: "Meeting Expectation",
  AE: "Approaching Expectation",
  EE: "Exceeding Expectation",
}

const competencyBanks: Record<CBCLevel, string[]> = {
  BE: [
    "Demonstrates exceptional collaboration and communication skills during group tasks.",
    "Consistently applies critical thinking to solve real-life problems independently.",
    "Shows outstanding creativity and imagination in all learning activities.",
    "Exhibits strong leadership qualities and guides peers effectively.",
    "Demonstrates exemplary digital literacy skills beyond the expected level.",
    "Takes initiative in learning and explores concepts beyond the curriculum.",
    "Shows remarkable self-efficacy and confidence in presenting ideas.",
    "Applies learned competencies to new situations with minimal guidance.",
    "Demonstrates a deep understanding of citizenship and community responsibility.",
    "Consistently produces work that exceeds the expected competency standards.",
  ],
  ME: [
    "Collaborates well with peers and communicates ideas clearly.",
    "Demonstrates satisfactory critical thinking skills in problem-solving tasks.",
    "Shows creativity and applies imagination in assigned activities.",
    "Works effectively in group settings and respects others' opinions.",
    "Demonstrates developing digital literacy skills across learning areas.",
    "Shows good self-efficacy and completes tasks with minimal support.",
    "Understands and applies citizenship values in daily interactions.",
    "Meets the expected competency standards for this learning area.",
    "Participates actively in learning activities and shows steady progress.",
    "Demonstrates the ability to apply learning to familiar situations.",
  ],
  AE: [
    "Is developing collaboration skills and benefits from guided group work.",
    "Shows emerging critical thinking and needs support to solve problems.",
    "Requires encouragement to express creative ideas and explore new approaches.",
    "Is learning to work with others and follow instructions in group tasks.",
    "Shows basic digital literacy skills that need further reinforcement.",
    "Requires regular encouragement to build confidence and self-efficacy.",
    "Is developing an understanding of citizenship values and community roles.",
    "Approaching expected competency standards with additional learning support.",
    "Benefits from simplified tasks to build foundational understanding.",
    "Shows willingness to learn but needs more practice to meet expectations.",
  ],
  EE: [
    "Requires significant support to develop collaboration and communication skills.",
    "Needs targeted interventions to develop basic critical thinking abilities.",
    "Benefiting from one-on-one support to build foundational creativity skills.",
    "Requires structured guidance to participate in group learning activities.",
    "Needs intensive support to develop basic digital literacy competencies.",
    "Requires consistent positive reinforcement to build learning confidence.",
    "Is building foundational understanding of citizenship and social values.",
    "Below expected competency level and needs additional learning time.",
    "Requires adapted learning materials to access the curriculum content.",
    "Making slow progress and needs a modified learning programme.",
  ],
}

const behaviourBanks: Record<CBCLevel, string[]> = {
  BE: [
    "Consistently demonstrates exemplary behaviour and is a role model to peers.",
    "Shows outstanding respect, responsibility, and integrity in all interactions.",
  ],
  ME: [
    "Demonstrates good behaviour and follows school rules consistently.",
    "Shows respect for others and maintains positive relationships.",
  ],
  AE: [
    "Is learning to follow classroom routines and needs occasional reminders.",
    "Benefiting from guidance on respectful behaviour and self-regulation.",
  ],
  EE: [
    "Requires consistent support to develop appropriate classroom behaviour.",
    "Benefiting from a structured behaviour support plan.",
  ],
}

const learningAreas = [
  "General",
  "Mathematics",
  "English",
  "Kiswahili",
  "Science and Technology",
  "Social Studies",
  "Creative Arts",
  "Physical Education",
  "Religious Education",
  "Indigenous Languages",
  "Agriculture",
  "Home Science",
]

export default function CBCTeacherCommentGenerator() {
  const [level, setLevel] = useState<CBCLevel>("ME")
  const [behaviour, setBehaviour] = useState<CBCLevel>("ME")
  const [learningArea, setLearningArea] = useState("General")
  const [generatedComment, setGeneratedComment] = useState("")
  const [options, setOptions] = useState<string[]>([])

  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

  const generate = () => {
    const comp = pick(competencyBanks[level])
    const beh = pick(behaviourBanks[behaviour])
    const comment = `${comp} ${beh}`
    setGeneratedComment(comment)

    const opts = Array.from({ length: 3 }, () => {
      const c = pick(competencyBanks[level])
      const b = pick(behaviourBanks[behaviour])
      return `${c} ${b}`
    })
    setOptions(opts)

    trackToolUse("teacher-comment-generator", "generate")
  }

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    trackToolUse("teacher-comment-generator", "copy")
    toast.success("Comment copied")
  }, [])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">CBC Teacher Comment Generator</h2>
        <p className="text-sm text-muted-foreground">Generate competency-based feedback aligned to CBC performance levels</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">CBC Competency Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as CBCLevel)}
                className="h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring dark:bg-input/30"
              >
                {Object.entries(cbcLabels).map(([k, v]) => (
                  <option key={k} value={k}>{k} — {v}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Behaviour / Attitude</label>
              <select
                value={behaviour}
                onChange={(e) => setBehaviour(e.target.value as CBCLevel)}
                className="h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring dark:bg-input/30"
              >
                {Object.entries(cbcLabels).map(([k, v]) => (
                  <option key={k} value={k}>{k} — {v}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Learning Area</label>
              <select
                value={learningArea}
                onChange={(e) => setLearningArea(e.target.value)}
                className="h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring dark:bg-input/30"
              >
                {learningAreas.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <Button onClick={generate} className="w-full">
            <Sparkles className="h-4 w-4" /> Generate CBC Comment
          </Button>
        </CardContent>
      </Card>

      {generatedComment && (
        <>
          <Card className="border-primary/30">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Generated CBC Comment</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="xs" onClick={() => handleCopy(generatedComment)}>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </Button>
                  <Button variant="outline" size="xs" onClick={generate}>
                    <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border bg-muted/20 p-4 text-sm italic leading-relaxed">
                {learningArea !== "General" && (
                  <span className="font-medium not-italic text-primary">[{learningArea}] </span>
                )}
                {generatedComment}
              </div>
              <div className="flex gap-2 text-[10px] text-muted-foreground">
                <span className="px-2 py-0.5 rounded-full border">Competency: {level} ({cbcLabels[level]})</span>
                <span className="px-2 py-0.5 rounded-full border">Behaviour: {behaviour} ({cbcLabels[behaviour]})</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">More Options</h3>
              <Separator />
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="group flex items-start gap-2 rounded-lg border bg-muted/10 p-3 text-sm">
                    <span className="text-xs text-muted-foreground mt-0.5 shrink-0">#{i + 1}</span>
                    <p className="flex-1 italic leading-relaxed text-muted-foreground">{opt}</p>
                    <button
                      onClick={() => handleCopy(opt)}
                      className="shrink-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

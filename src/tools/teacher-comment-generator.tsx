"use client"

import { useState, useCallback } from "react"
import { MessageSquare, Copy, RefreshCw, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { trackToolUse } from "@/lib/analytics"

type PerformanceLevel = "excellent" | "good" | "average" | "needs-improvement"
type BehaviourLevel = "excellent" | "good" | "average"

const performanceLabels: Record<PerformanceLevel, string> = {
  excellent: "Excellent",
  good: "Good",
  average: "Average",
  "needs-improvement": "Needs Improvement",
}

const behaviourLabels: Record<BehaviourLevel, string> = {
  excellent: "Excellent",
  good: "Good",
  average: "Average",
}

const commentBank: Record<PerformanceLevel, string[]> = {
  excellent: [
    "Shows excellent understanding of concepts and participates actively in class.",
    "Consistently produces high-quality work and demonstrates exceptional analytical skills.",
    "Demonstrates outstanding mastery of the subject matter and goes beyond expectations.",
    "Exhibits remarkable creativity and critical thinking in all assignments.",
    "Shows exceptional dedication to learning and consistently achieves top grades.",
    "Displays a thorough grasp of complex concepts and applies them effectively.",
    "Demonstrates exemplary leadership skills during group activities and discussions.",
    "Consistently exceeds grade-level expectations across all competencies.",
  ],
  good: [
    "Demonstrates good progress and should continue practicing regularly.",
    "Shows a solid understanding of key concepts and completes work diligently.",
    "Performs well in most areas and is developing strong foundational skills.",
    "Works hard and shows steady improvement across all subject areas.",
    "Demonstrates good comprehension and applies learning to new situations effectively.",
    "Shows consistent effort and produces satisfactory work on a regular basis.",
    "Has made notable progress and shows potential for even greater achievement.",
    "Approaches tasks with enthusiasm and demonstrates good problem-solving skills.",
  ],
  average: [
    "Shows average performance and would benefit from additional practice at home.",
    "Is developing foundational skills and needs more time to master key concepts.",
    "Demonstrates satisfactory progress but would benefit from more focused attention.",
    "Shows potential but needs to work on consistency and attention to detail.",
    "Is making steady progress and should focus on strengthening core competencies.",
    "Would benefit from reviewing class materials regularly to reinforce learning.",
    "Shows understanding of basic concepts but struggles with more complex applications.",
    "Has room for improvement and would benefit from additional learning support.",
  ],
  "needs-improvement": [
    "Needs additional support to strengthen key competencies.",
    "Is struggling to keep up with grade-level expectations and requires extra intervention.",
    "Would benefit significantly from one-on-one tutoring and additional practice.",
    "Requires more focused attention on foundational concepts to build confidence.",
    "Needs to develop better study habits and complete assignments more consistently.",
    "Shows gaps in understanding that need to be addressed through targeted support.",
    "Would benefit from a structured learning plan to address specific areas of weakness.",
    "Requires additional time and resources to achieve the expected learning outcomes.",
  ],
}

const behaviourComments: Record<PerformanceLevel, Record<BehaviourLevel, string[]>> = {
  excellent: {
    excellent: [
      "Additionally, their behaviour is exemplary and they are a positive role model for peers.",
      "Furthermore, they demonstrate outstanding self-discipline and respect for others.",
    ],
    good: [
      "Additionally, their behaviour in class is generally good and cooperative.",
      "They interact well with peers and follow classroom rules consistently.",
    ],
    average: [
      "They are encouraged to improve their focus and follow classroom rules more consistently.",
      "With better attention to classroom expectations, their performance could improve further.",
    ],
  },
  good: {
    excellent: [
      "Additionally, their positive attitude and excellent behaviour contribute to a productive learning environment.",
      "They demonstrate good character and are respectful towards teachers and peers.",
    ],
    good: [
      "They maintain a positive attitude and cooperate well with others in class.",
      "Their behaviour is satisfactory and they contribute positively to class discussions.",
    ],
    average: [
      "They are encouraged to stay focused and avoid distractions during lessons.",
      "With improved concentration, they can achieve even better academic results.",
    ],
  },
  average: {
    excellent: [
      "Despite average academic performance, their behaviour and effort in class are commendable.",
      "They show good character and a willingness to learn, which will serve them well.",
    ],
    good: [
      "They cooperate well in class and follow instructions when given clear guidance.",
      "Their conduct is generally acceptable and they respond well to positive reinforcement.",
    ],
    average: [
      "They need to work on both their academic focus and classroom behaviour.",
      "With better self-regulation and attention, they can make meaningful progress.",
    ],
  },
  "needs-improvement": {
    excellent: [
      "Despite academic challenges, they show a positive attitude and respect for others.",
      "Their behaviour remains commendable even as they work to improve academically.",
    ],
    good: [
      "They respond well to guidance and show willingness to improve their performance.",
      "With continued support, they can develop both academically and behaviourally.",
    ],
    average: [
      "They need support in both academic performance and maintaining focus in class.",
      "A structured approach to learning and behaviour would benefit their progress.",
    ],
  },
}

const subjects = [
  "General",
  "Mathematics",
  "English",
  "Kiswahili",
  "Science",
  "Social Studies",
  "Creative Arts",
  "Physical Education",
  "Religious Education",
  "Indigenous Languages",
]

export default function TeacherCommentGenerator() {
  const [performance, setPerformance] = useState<PerformanceLevel>("good")
  const [behaviour, setBehaviour] = useState<BehaviourLevel>("good")
  const [subject, setSubject] = useState("General")
  const [generatedComment, setGeneratedComment] = useState("")
  const [options, setOptions] = useState<string[]>([])

  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

  const generate = () => {
    const acad = pick(commentBank[performance])
    const beh = pick(behaviourComments[performance][behaviour])
    const comment = `${acad} ${beh}`
    setGeneratedComment(comment)

    const opts = Array.from({ length: 3 }, () => {
      const a = pick(commentBank[performance])
      const b = pick(behaviourComments[performance][behaviour])
      return `${a} ${b}`
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
        <h2 className="text-2xl font-bold tracking-tight">Teacher Comment Generator</h2>
        <p className="text-sm text-muted-foreground">Generate professional report card comments from predefined banks</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Performance Level</label>
              <select
                value={performance}
                onChange={(e) => setPerformance(e.target.value as PerformanceLevel)}
                className="h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                {Object.entries(performanceLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Behaviour</label>
              <select
                value={behaviour}
                onChange={(e) => setBehaviour(e.target.value as BehaviourLevel)}
                className="h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                {Object.entries(behaviourLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
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
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <Button onClick={generate} className="w-full">
            <Sparkles className="h-4 w-4" /> Generate Comment
          </Button>
        </CardContent>
      </Card>

      {generatedComment && (
        <>
          <Card className="border-primary/30">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Generated Comment</h3>
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
                {generatedComment}
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

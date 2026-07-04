"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Sparkles, ClipboardList, CalendarDays, FileSpreadsheet,
  MessageSquarePlus, BookOpen, Loader2, Send, History,
  Star, FileText, Trash2, Clock, PanelRightOpen, PanelRightClose,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useWorkspace, type SettingDef } from "../workspace-context"
import { processAI } from "@/tools/ai-workspace/modules/ai-processor"
import { CbcDocument } from "./cbc-document"

interface EducationFeature {
  id: string
  label: string
  icon: typeof ClipboardList
  description: string
  starterPrompt: string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

interface HistoryItem {
  id: string
  prompt: string
  feature: string
  featureLabel: string
  output: string
  timestamp: number
  favourited: boolean
}

const STORAGE_KEY = "toolforge-education-history"

const features: EducationFeature[] = [
  {
    id: "lesson-planner",
    label: "Lesson Plan",
    icon: ClipboardList,
    description: "Create a KICD-compliant CBC lesson plan",
    starterPrompt: "Create a CBC Lesson Plan for Grade 5 Mathematics on Fractions. 80-minute lesson. Include learning outcomes, lesson development steps, assessment, core competencies, values, PCIs, learning resources and differentiation.",
  },
  {
    id: "scheme-of-work",
    label: "Scheme of Work",
    icon: CalendarDays,
    description: "Generate a termly scheme of work",
    starterPrompt: "Create a CBC Scheme of Work for Grade 4 Science, Term 2. 10 weeks. Include weekly strands, sub-strands, learning objectives, resources and assessment methods.",
  },
  {
    id: "assessment",
    label: "Assessment",
    icon: FileSpreadsheet,
    description: "Design CBC competency-based assessments",
    starterPrompt: "Create a CBC Performance Task assessment for Grade 6 English on Creative Writing. Include the task description, a detailed rubric with EE/ME/AE/BE levels, and competency alignment.",
  },
  {
    id: "comment-generator",
    label: "Comments",
    icon: MessageSquarePlus,
    description: "Generate personalised report card comments",
    starterPrompt: "Generate CBC report card comments for a Grade 3 learner in Mathematics. Competency level: Meeting Expectations. Tone: Encouraging. Include strengths, areas for improvement, and next steps.",
  },
  {
    id: "revision-planner",
    label: "Revision Planner",
    icon: BookOpen,
    description: "Plan structured revision timetables",
    starterPrompt: "Create a 4-week CBC revision plan for Grade 8 Science covering all strands. Include a weekly topic breakdown, daily study timetable, practice activities and self-assessment checkpoints.",
  },
]

const featureSettingsMap: SettingDef[] = [
  { key: "grade", label: "Grade", type: "select", options: [
    { label: "Pre-Primary 1", value: "Pre-Primary 1" },
    { label: "Pre-Primary 2", value: "Pre-Primary 2" },
    { label: "Grade 1", value: "Grade 1" },
    { label: "Grade 2", value: "Grade 2" },
    { label: "Grade 3", value: "Grade 3" },
    { label: "Grade 4", value: "Grade 4" },
    { label: "Grade 5", value: "Grade 5" },
    { label: "Grade 6", value: "Grade 6" },
    { label: "Grade 7", value: "Grade 7" },
    { label: "Grade 8", value: "Grade 8" },
    { label: "Grade 9", value: "Grade 9" },
  ]},
  { key: "learningArea", label: "Learning Area", type: "select", options: [
    { label: "Mathematics", value: "Mathematics" },
    { label: "English", value: "English" },
    { label: "Kiswahili", value: "Kiswahili" },
    { label: "Science", value: "Science" },
    { label: "Social Studies", value: "Social Studies" },
    { label: "CRE", value: "CRE" },
    { label: "Homescience", value: "Homescience" },
    { label: "Agriculture", value: "Agriculture" },
    { label: "Physical Education", value: "Physical Education" },
    { label: "Music", value: "Music" },
    { label: "Art & Craft", value: "Art & Craft" },
  ]},
  { key: "strand", label: "Strand", type: "text" },
  { key: "subStrand", label: "Sub-Strand", type: "text" },
  { key: "duration", label: "Lesson Duration", type: "select", options: [
    { label: "30 minutes", value: "30" },
    { label: "40 minutes", value: "40" },
    { label: "60 minutes", value: "60" },
    { label: "80 minutes", value: "80" },
    { label: "120 minutes", value: "120" },
  ]},
  { key: "learners", label: "Number of Learners", type: "text" },
  { key: "environment", label: "Learning Environment", type: "select", options: [
    { label: "Classroom", value: "Classroom" },
    { label: "Outdoor", value: "Outdoor" },
    { label: "Laboratory", value: "Laboratory" },
    { label: "Library", value: "Library" },
    { label: "Computer Lab", value: "Computer Lab" },
    { label: "Field Trip", value: "Field Trip" },
  ]},
  { key: "competencyLevel", label: "Competency Level", type: "select", options: [
    { label: "All Levels", value: "All Levels" },
    { label: "Emerging (EE)", value: "EE" },
    { label: "Meeting (ME)", value: "ME" },
    { label: "Above (AE)", value: "AE" },
    { label: "Beyond (BE)", value: "BE" },
  ]},
  { key: "language", label: "Language", type: "select", options: [
    { label: "English", value: "English" },
    { label: "Kiswahili", value: "Kiswahili" },
    { label: "English & Kiswahili", value: "English & Kiswahili" },
  ]},
  { key: "curriculumVersion", label: "Curriculum Version", type: "select", options: [
    { label: "CBC", value: "CBC" },
    { label: "Competency-Based", value: "Competency-Based" },
  ]},
]

const quickPrompts = [
  { label: "Lesson Plan", icon: ClipboardList, feature: "lesson-planner", prompt: "Create a CBC Lesson Plan. Include learning outcomes, lesson development steps with timed phases, assessment criteria, core competencies, values, PCIs, learning resources and differentiation strategies for diverse learners." },
  { label: "Scheme of Work", icon: CalendarDays, feature: "scheme-of-work", prompt: "Create a CBC Scheme of Work for one term. Include weekly strands, sub-strands, specific learning outcomes, core competencies, learning resources and assessment methods in a clear table format." },
  { label: "Assessment", icon: FileSpreadsheet, feature: "assessment", prompt: "Create a CBC Assessment. Include the assessment type, task description, scoring rubric with EE/ME/AE/BE performance descriptors, and competency alignment." },
  { label: "Teacher Comments", icon: MessageSquarePlus, feature: "comment-generator", prompt: "Generate CBC report card comments that are personalised and competency-based. Include learner strengths, areas for improvement, and actionable next steps." },
  { label: "Revision Planner", icon: BookOpen, feature: "revision-planner", prompt: "Create a CBC Revision Plan with weekly topic breakdown, daily study timetable, practice activities and self-assessment checkpoints." },
  { label: "Rubric", icon: ClipboardList, feature: "assessment", prompt: "Create a detailed CBC assessment rubric. Include at least 4 assessment criteria with clear descriptors for each performance level: EE (Emerging), ME (Meeting Expectations), AE (Above Expectations), BE (Beyond Expectations)." },
  { label: "Project", icon: ClipboardList, feature: "lesson-planner", prompt: "Create a CBC Project-based Learning plan. Include the project title, description, learning outcomes, timeline with milestones, deliverables, assessment rubric and differentiation strategies." },
  { label: "Exam", icon: FileSpreadsheet, feature: "assessment", prompt: "Create a CBC end-of-term examination. Include a mix of objective questions, structured questions and open-ended items. Provide a complete marking scheme with clear answer guidelines." },
  { label: "Worksheet", icon: FileText, feature: "lesson-planner", prompt: "Create a CBC learner worksheet with engaging activities. Include clear instructions, a variety of exercise types, a self-assessment section and space for teacher feedback." },
  { label: "Learning Activities", icon: BookOpen, feature: "lesson-planner", prompt: "Design engaging CBC learning activities for a lesson. Include a starter activity, main activities (group work, pair work, individual tasks), and a plenary. Align activities to core competencies." },
]

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(items: HistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)))
  } catch {}
}

function getFeatureLabel(featureId: string): string {
  return features.find((f) => f.id === featureId)?.label ?? featureId
}



function buildConversationContext(
  originalInput: string,
  currentOutput: string,
  conversation: ChatMessage[],
  followUp: string,
): string {
  const parts = [
    "ORIGINAL REQUEST:",
    originalInput,
    "",
    "PREVIOUSLY GENERATED OUTPUT:",
    currentOutput,
    "",
  ]

  if (conversation.length > 0) {
    parts.push("PREVIOUS CONVERSATION:")
    for (const msg of conversation) {
      parts.push(`${msg.role === "user" ? "Teacher" : "Assistant"}: ${msg.content}`)
    }
    parts.push("")
  }

  parts.push("REQUESTED MODIFICATION:")
  parts.push(followUp)
  parts.push("")
  parts.push("Modify the output above based on the requested modification while maintaining KICD/CBC compliance. Return the COMPLETE updated document with all modifications applied. Do not summarize or describe changes — return the full revised document.")

  return parts.join("\n")
}

export default function EducationPage() {
  const {
    input, setInput, output, setOutput, outputHtml, setOutputHtml,
    processing, activeFeature, setActiveFeature,
    featureSettings, remaining, registerSettings, handleProcess,
    outputRef,
  } = useWorkspace()

  const [conversation, setConversation] = useState<ChatMessage[]>([])
  const [followUpInput, setFollowUpInput] = useState("")
  const [followUpProcessing, setFollowUpProcessing] = useState(false)
  const [promptHistory, setPromptHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showFollowUp, setShowFollowUp] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const followUpRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    registerSettings(featureSettingsMap)
  }, [])

  useEffect(() => {
    setPromptHistory(loadHistory())
  }, [])

  const currentFeature = features.find((f) => f.id === activeFeature) ?? features[0]

  const handleFeatureChange = useCallback((featureId: string) => {
    setActiveFeature(featureId)
    setOutput("")
    setOutputHtml(undefined)
    setConversation([])
    setShowFollowUp(false)
  }, [setActiveFeature, setOutput, setOutputHtml])

  const handleChipClick = useCallback((chip: typeof quickPrompts[number]) => {
    handleFeatureChange(chip.feature)
    setInput(chip.prompt)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [handleFeatureChange, setInput])

  const handleGenerate = useCallback(async () => {
    if (!input.trim()) {
      return
    }
    setConversation([])
    setShowFollowUp(false)
    await handleProcess()
  }, [input, handleProcess])

  const handleRegenerate = useCallback(async () => {
    if (!input.trim()) return
    setOutput("")
    setOutputHtml(undefined)
    setConversation([])
    setShowFollowUp(false)
    await handleProcess()
  }, [input, handleProcess, setOutput, setOutputHtml])

  const handleEdit = useCallback(() => {
    setInput(output)
    setOutput("")
    setOutputHtml(undefined)
    setShowFollowUp(false)
  }, [output, setInput, setOutput, setOutputHtml])



  const handleFollowUp = useCallback(async () => {
    const msg = followUpInput.trim()
    if (!msg) return

    setFollowUpProcessing(true)
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: msg, timestamp: Date.now() }
    setConversation((prev) => [...prev, userMsg])
    setFollowUpInput("")

    const conversationContext = buildConversationContext(input, output, conversation, msg)

    try {
      const result = await processAI("education-followup", conversationContext, featureSettings)
      setOutput(result.output)
      if (result.html) setOutputHtml(result.html)
      const assistantMsg: ChatMessage = { id: `a-${Date.now()}`, role: "assistant", content: "Document updated.", timestamp: Date.now() }
      setConversation((prev) => [...prev, assistantMsg])
    } catch {
      setConversation((prev) => prev.filter((m) => m.id !== userMsg.id))
    } finally {
      setFollowUpProcessing(false)
    }
  }, [followUpInput, input, output, conversation, featureSettings, setOutput, setOutputHtml])

  useEffect(() => {
    if (output && output.trim()) {
      setShowFollowUp(true)
      const history: HistoryItem = {
        id: `h-${Date.now()}`,
        prompt: input,
        feature: activeFeature,
        featureLabel: currentFeature.label,
        output,
        timestamp: Date.now(),
        favourited: false,
      }
      setPromptHistory((prev) => {
        const updated = [history, ...prev.filter((h) => h.id !== history.id)].slice(0, 50)
        saveHistory(updated)
        return updated
      })
    }
  }, [output])

  const restoreFromHistory = useCallback((item: HistoryItem) => {
    setActiveFeature(item.feature)
    setInput(item.prompt)
    setOutput(item.output)
  }, [setActiveFeature, setInput, setOutput])

  const toggleFavourite = useCallback((id: string) => {
    setPromptHistory((prev) => {
      const updated = prev.map((h) => h.id === id ? { ...h, favourited: !h.favourited } : h)
      saveHistory(updated)
      return updated
    })
  }, [])

  const deleteHistory = useCallback((id: string) => {
    setPromptHistory((prev) => {
      const updated = prev.filter((h) => h.id !== id)
      saveHistory(updated)
      return updated
    })
  }, [])

  const hasOutput = output && output.trim().length > 0

  return (
    <>
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1">
          <GraduationCap className="h-5 w-5 text-primary/70" />
          <h2 className="text-sm font-semibold text-foreground/90">AI Teaching Assistant</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-muted-foreground/60 hover:text-foreground hover:bg-card/50 transition-all"
        >
          <History className="h-3.5 w-3.5" />
          History
          {showHistory ? <PanelRightClose className="h-3 w-3" /> : <PanelRightOpen className="h-3 w-3" />}
        </button>
      </div>

      {showHistory && (
        <Card className="border-white/[0.06] bg-card/20">
          <CardContent className="p-3">
            {promptHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground/40 text-center py-4">No history yet. Generate something first.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-auto">
                {promptHistory.map((item) => (
                  <div key={item.id} className="group flex items-center gap-2 rounded-xl bg-card/30 px-3 py-2 text-xs hover:bg-card/50 transition-all cursor-pointer" onClick={() => restoreFromHistory(item)}>
                    <Clock className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-foreground/80">{item.prompt}</p>
                      <p className="text-muted-foreground/40">{item.featureLabel} &middot; {new Date(item.timestamp).toLocaleDateString()}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleFavourite(item.id) }}
                      className={`opacity-0 group-hover:opacity-100 transition-opacity ${item.favourited ? "text-yellow-400" : "text-muted-foreground/40 hover:text-yellow-400"}`}
                    >
                      <Star className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); deleteHistory(item.id) }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {features.map((feat) => {
          const Icon = feat.icon
          const isActive = activeFeature === feat.id
          return (
            <button
              key={feat.id}
              type="button"
              onClick={() => handleFeatureChange(feat.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                isActive ? "bg-primary/10 text-primary shadow-sm" : "bg-card/30 text-muted-foreground/60 hover:bg-card/50 hover:text-muted-foreground"
              }`}
              title={feat.description}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="truncate">{feat.label}</span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {quickPrompts.map((chip) => {
          const Icon = chip.icon
          return (
            <button
              key={chip.label}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-card/20 px-2.5 py-1 text-[11px] font-medium text-muted-foreground/70 hover:bg-card/40 hover:text-foreground hover:border-white/[0.10] transition-all"
            >
              <Icon className="h-3 w-3" />
              {chip.label}
            </button>
          )
        })}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground/60">
            Describe what you need
          </label>
          {input && (
            <button
              type="button"
              onClick={() => setInput("")}
              className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Create a Grade 5 Mathematics CBC lesson plan on Fractions for an 80-minute lesson. Include learner activities, assessment, core competencies, values, PCIs, learning resources and differentiation.`}
          className="min-h-[140px] w-full resize-y rounded-2xl border border-white/[0.06] bg-card/30 p-4 text-sm text-foreground placeholder:text-muted-foreground/20 focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              handleGenerate()
            }
          }}
        />
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground/30">
            {input ? `${input.trim().split(/\s+/).length} words` : ""}
          </p>
          <p className="text-[11px] text-muted-foreground/30">
            {navigator.platform?.includes("Mac") ? "Cmd" : "Ctrl"}+Enter to generate
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
          <p className="flex-1">Optional context enriches the AI prompt &mdash; set in the right panel</p>
        </div>
      </div>

      {remaining > 0 && !hasOutput ? (
        <Button className="w-full" size="lg" onClick={handleGenerate} disabled={processing || !input.trim()}>
          {processing ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" /> Generate with AI</>
          )}
        </Button>
      ) : remaining <= 0 && !hasOutput ? (
        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardContent className="p-5 text-center space-y-2">
            <p className="font-semibold text-sm">Daily Limit Reached</p>
            <p className="text-xs text-muted-foreground/70">You&apos;ve used all 5 free AI requests today. Come back tomorrow.</p>
          </CardContent>
        </Card>
      ) : null}

      {hasOutput && (
        <div className="ai-document-area">
          <CbcDocument
            text={output}
            featureLabel={currentFeature.label}
            onEdit={handleEdit}
            onRegenerate={handleRegenerate}
            isProcessing={processing}
          />
        </div>
      )}

      {showFollowUp && hasOutput && (
        <div className="follow-up-area space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-white/[0.05]" />
            <span className="text-[11px] font-medium text-muted-foreground/40 uppercase tracking-wider">Follow-up</span>
            <div className="h-px flex-1 bg-white/[0.05]" />
          </div>

          {conversation.length > 0 && (
            <div className="space-y-1.5 max-h-32 overflow-auto">
              {conversation.map((msg) => (
                <div key={msg.id} className={`flex gap-2 text-xs ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`rounded-xl px-3 py-1.5 max-w-[85%] ${msg.role === "user" ? "bg-primary/10 text-primary/90" : "bg-card/40 text-muted-foreground/70"}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                ref={followUpRef}
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                placeholder="Make it learner-centred, reduce to 40 minutes, translate to Kiswahili..."
                className="w-full rounded-xl border border-white/[0.06] bg-card/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleFollowUp()
                  }
                }}
                disabled={followUpProcessing}
              />
            </div>
            <Button size="icon" onClick={handleFollowUp} disabled={!followUpInput.trim() || followUpProcessing} className="shrink-0">
              {followUpProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {["Make it learner-centred", "Reduce to 40 minutes", "Use locally available materials", "Add practical activities", "Include more assessment questions", "Translate into Kiswahili", "Generate a worksheet"].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setFollowUpInput(suggestion)
                  if (followUpRef.current) followUpRef.current.focus()
                }}
                className="rounded-lg border border-white/[0.04] bg-card/20 px-2 py-1 text-[11px] text-muted-foreground/50 hover:text-foreground hover:bg-card/40 transition-all"
              >
                <Plus className="h-2.5 w-2.5 inline mr-0.5" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function GraduationCap(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  )
}

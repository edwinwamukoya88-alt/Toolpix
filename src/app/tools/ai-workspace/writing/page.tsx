"use client"

import { useCallback, useEffect, useRef } from "react"
import {
  Sparkles, Wand2, Eye, Check, RefreshCw, FileText,
  Languages, MessageSquare, Mail, BookOpen, Briefcase,
  AlertCircle, Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useWorkspace, type SettingDef } from "../workspace-context"

interface WritingFeature {
  id: string
  label: string
  icon: typeof Wand2
}

const features: WritingFeature[] = [
  { id: "humanize", label: "Humanize AI Text", icon: Wand2 },
  { id: "detector", label: "AI Content Detector", icon: Eye },
  { id: "grammar", label: "Grammar & Spelling Fix", icon: Check },
  { id: "rewrite", label: "Rewrite Text", icon: RefreshCw },
  { id: "summarize", label: "Summarize Text", icon: FileText },
  { id: "translate", label: "Translate Text", icon: Languages },
  { id: "change-tone", label: "Change Tone", icon: MessageSquare },
  { id: "email-writer", label: "Email Writer", icon: Mail },
  { id: "essay-improver", label: "Essay Improver", icon: BookOpen },
  { id: "resume-rewriter", label: "Resume Bullet Rewriter", icon: Briefcase },
]

const settingsMap: Record<string, SettingDef[]> = {
  summarize: [{ key: "length", label: "Summary Length", type: "select", options: [{ label: "Short", value: "short" }, { label: "Medium", value: "medium" }, { label: "Detailed", value: "detailed" }] }],
  translate: [{ key: "language", label: "Target Language", type: "select", options: [
    { label: "Spanish", value: "Spanish" }, { label: "French", value: "French" }, { label: "German", value: "German" },
    { label: "Italian", value: "Italian" }, { label: "Portuguese", value: "Portuguese" }, { label: "Dutch", value: "Dutch" },
    { label: "Russian", value: "Russian" }, { label: "Japanese", value: "Japanese" }, { label: "Chinese", value: "Chinese" },
    { label: "Arabic", value: "Arabic" }, { label: "Swahili", value: "Swahili" },
  ] }],
  "change-tone": [{ key: "tone", label: "Tone", type: "select", options: [
    { label: "Professional", value: "Professional" }, { label: "Friendly", value: "Friendly" }, { label: "Casual", value: "Casual" },
    { label: "Formal", value: "Formal" }, { label: "Persuasive", value: "Persuasive" }, { label: "Confident", value: "Confident" }, { label: "Academic", value: "Academic" },
  ] }],
  "email-writer": [{ key: "emailType", label: "Email Type", type: "select", options: [
    { label: "Business", value: "Business" }, { label: "Customer Support", value: "Customer Support" }, { label: "Follow-up", value: "Follow-up" },
    { label: "Complaint", value: "Complaint" }, { label: "Request", value: "Request" }, { label: "Thank You", value: "Thank You" }, { label: "Job Application", value: "Job Application" },
  ] }],
  rewrite: [{ key: "style", label: "Style", type: "select", options: [{ label: "Clear", value: "clear" }, { label: "Concise", value: "concise" }, { label: "Creative", value: "creative" }] }],
}

function getSettings(featureId: string): SettingDef[] {
  return settingsMap[featureId] || []
}

function needsTextInput(featureId: string): boolean {
  return !["lesson-planner", "scheme-of-work", "assessment", "revision-planner", "design-cards", "social-media", "flyer", "poster", "certificate", "business-card"].includes(featureId)
}

export default function WritingPage() {
  const {
    input, setInput, output, outputHtml, processing, activeFeature,
    setActiveFeature, remaining, registerSettings, handleProcess,
    outputRef,
  } = useWorkspace()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentFeature = features.find((f) => f.id === activeFeature) ?? features[0]

  const handleFeatureChange = useCallback((featureId: string) => {
    setActiveFeature(featureId)
    registerSettings(getSettings(featureId))
  }, [setActiveFeature, registerSettings])

  useEffect(() => {
    registerSettings(getSettings(activeFeature))
  }, [])

  return (
    <>
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
                isActive ? "bg-primary/10 text-primary" : "bg-card/30 text-muted-foreground/60 hover:bg-card/50 hover:text-muted-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="truncate">{feat.label}</span>
            </button>
          )
        })}
      </div>

      {needsTextInput(activeFeature) ? (
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste or type your text here..."
          className="min-h-[200px] w-full resize-y rounded-2xl border border-white/[0.06] bg-card/30 p-4 text-sm text-foreground placeholder:text-muted-foreground/30 focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
        />
      ) : (
        <div className="rounded-2xl border border-white/[0.06] bg-card/30 p-6 text-center">
          <p className="text-sm text-muted-foreground/50">Configure settings in the right panel, then click Generate</p>
        </div>
      )}

      {remaining > 0 ? (
        <Button className="w-full" size="lg" onClick={handleProcess} disabled={processing}>
          {processing ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" /> {needsTextInput(activeFeature) ? "Process with AI" : "Generate"}</>
          )}
        </Button>
      ) : (
        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardContent className="p-6 text-center space-y-2">
            <AlertCircle className="h-8 w-8 text-primary/40 mx-auto" />
            <p className="font-semibold">Daily Limit Reached</p>
            <p className="text-xs text-muted-foreground/70 max-w-sm mx-auto">
              You&apos;ve used all 5 free AI requests today. Come back tomorrow for more free usage or contact us for higher limits.
            </p>
          </CardContent>
        </Card>
      )}

      {(output || outputHtml) && (
        <Card className="border-primary/10">
          <CardContent className="p-4">
            <div ref={outputRef}>
              {outputHtml ? (
                <div dangerouslySetInnerHTML={{ __html: outputHtml }} />
              ) : (
                <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{output}</pre>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

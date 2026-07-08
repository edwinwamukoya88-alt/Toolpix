"use client"

import { useCallback, useEffect, useRef, memo } from "react"
import {
  Sparkles, Wand2, Eye, Check, RefreshCw, FileText,
  Languages, MessageSquare, Mail, BookOpen, Briefcase,
  AlertCircle, Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
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

const LoadingState = memo(function LoadingState() {
  return (
    <div className="space-y-3" aria-label="Loading">
      <div className="h-10 w-full rounded-xl bg-muted/30 animate-pulse" />
      <div className="h-32 w-full rounded-2xl bg-muted/30 animate-pulse" />
      <div className="h-12 w-full rounded-xl bg-muted/30 animate-pulse" />
    </div>
  )
})

function WritingPage() {
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
  }, [activeFeature, registerSettings])

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Feature grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {features.map((feat) => {
          const Icon = feat.icon
          const isActive = activeFeature === feat.id
          return (
            <button
              key={feat.id}
              type="button"
              onClick={() => handleFeatureChange(feat.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-3 text-xs sm:text-sm font-medium transition-all min-h-[48px] touch-manipulation border active:scale-[0.97]",
                isActive
                  ? "bg-primary/12 text-primary border-primary/25 shadow-sm ring-1 ring-primary/20"
                  : "bg-card/50 text-muted-foreground/70 hover:text-foreground hover:bg-card/80 hover:border-border/60 border-border/30"
              )}
              aria-pressed={isActive}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground/60")} />
              <span className="truncate leading-tight">{feat.label}</span>
            </button>
          )
        })}
      </div>

      {needsTextInput(activeFeature) ? (
        <div className="space-y-2 sm:space-y-3">
          <div className="relative rounded-2xl border border-border/25 bg-card/40 shadow-sm overflow-hidden focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15 focus-within:shadow-lg focus-within:shadow-primary/5 transition-all duration-200">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI Assistant anything or paste text to rewrite, humanize, summarize, translate, improve, or generate professional content."
              className="min-h-[200px] sm:min-h-[220px] w-full resize-y bg-transparent px-5 sm:px-6 pt-5 sm:pt-6 pb-3 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/25 leading-relaxed outline-none transition-all"
              style={{ WebkitTextSizeAdjust: "100%" }}
              aria-label="Input text"
            />
            <div className="flex items-center justify-between border-t border-border/15 px-5 sm:px-6 py-2">
              <span className="text-[11px] tabular-nums text-muted-foreground/40">
                {input.length} <span className="hidden sm:inline">characters</span><span className="sm:hidden">ch</span>
              </span>
              <span className="text-[11px] tabular-nums text-muted-foreground/40">
                {input.trim() ? input.trim().split(/\s+/).length : 0} <span className="hidden sm:inline">words</span><span className="sm:hidden">w</span>
              </span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground/35 px-1">
            AI responses may contain mistakes. Review important information before using it.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/20 bg-card/30 p-8 sm:p-10 text-center space-y-2">
          <Sparkles className="h-5 w-5 text-muted-foreground/30 mx-auto" />
          <p className="text-sm font-medium text-muted-foreground/70">Configure settings in the panel, then click Generate</p>
          <p className="text-xs text-muted-foreground/40">Your generated content will appear here.</p>
        </div>
      )}

      {remaining > 0 ? (
        <button
          type="button"
          onClick={handleProcess}
          disabled={processing}
          className={cn(
            "relative w-full flex items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-semibold transition-all min-h-[52px] touch-manipulation border",
            "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
            "shadow-lg shadow-primary/25",
          )}
          aria-label={processing ? "Processing..." : (needsTextInput(activeFeature) ? "Process with AI" : "Generate")}
        >
          {processing ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
          ) : (
            <><Sparkles className="h-5 w-5" /> {needsTextInput(activeFeature) ? "Process with AI" : "Generate"}</>
          )}
        </button>
      ) : (
        <div className="rounded-2xl border border-primary/15 bg-primary/[0.03] p-6 sm:p-8 text-center space-y-3">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-primary/[0.08]">
            <AlertCircle className="h-5 w-5 text-primary/50" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-sm text-foreground/80">Daily Limit Reached</p>
            <p className="text-xs text-muted-foreground/60 max-w-xs mx-auto leading-relaxed">
              You&apos;ve used all 5 free AI requests today. Come back tomorrow for more free usage or contact us for higher limits.
            </p>
          </div>
        </div>
      )}

      {(output || outputHtml) && (
        <div className="rounded-2xl border border-border/20 bg-card shadow-sm overflow-hidden">
          <div ref={outputRef} className="p-4 sm:p-6 text-sm leading-relaxed text-foreground/85">
            {outputHtml ? (
              <div dangerouslySetInnerHTML={{ __html: outputHtml }} />
            ) : (
              <pre className="whitespace-pre-wrap font-sans leading-[1.75] m-0">{output}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(WritingPage)

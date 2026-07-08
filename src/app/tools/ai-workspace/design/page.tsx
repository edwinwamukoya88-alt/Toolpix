"use client"

import { useCallback, useEffect, memo } from "react"
import {
  Sparkles, CreditCard, Share2, Image, Printer,
  FileText, AlertCircle, Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useWorkspace, type SettingDef } from "../workspace-context"

interface DesignFeature {
  id: string
  label: string
  icon: typeof CreditCard
}

const features: DesignFeature[] = [
  { id: "design-cards", label: "Design Cards Studio", icon: CreditCard },
  { id: "social-media", label: "Social Media Designer", icon: Share2 },
  { id: "flyer", label: "Flyer Designer", icon: Image },
  { id: "poster", label: "Poster Designer", icon: Printer },
  { id: "certificate", label: "Certificate Designer", icon: FileText },
  { id: "business-card", label: "Business Card Designer", icon: CreditCard },
]

const settingsMap: Record<string, SettingDef[]> = {
  "design-cards": [
    { key: "cardType", label: "Card Type", type: "select", options: [
      { label: "Business Card", value: "Business Card" }, { label: "Certificate", value: "Certificate" },
      { label: "Invitation", value: "Invitation" }, { label: "Event Card", value: "Event Card" },
      { label: "Wedding Card", value: "Wedding Card" }, { label: "Birthday Card", value: "Birthday Card" },
      { label: "Thank You Card", value: "Thank You Card" },
    ]},
    { key: "name", label: "Name", type: "text" },
    { key: "title", label: "Title", type: "text" },
    { key: "company", label: "Company", type: "text" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "email", label: "Email", type: "text" },
  ],
  "social-media": [
    { key: "platform", label: "Platform", type: "select", options: [
      { label: "Instagram", value: "Instagram" }, { label: "Facebook", value: "Facebook" },
      { label: "LinkedIn", value: "LinkedIn" }, { label: "X (Twitter)", value: "X" }, { label: "Pinterest", value: "Pinterest" },
    ]},
    { key: "content", label: "Post Content", type: "text" },
  ],
  flyer: [
    { key: "event", label: "Event Name", type: "text" },
    { key: "date", label: "Date", type: "text" },
    { key: "location", label: "Location", type: "text" },
  ],
  poster: [
    { key: "posterTitle", label: "Poster Title", type: "text" },
    { key: "description", label: "Description", type: "text" },
    { key: "organization", label: "Organization", type: "text" },
  ],
  certificate: [
    { key: "certName", label: "Recipient Name", type: "text" },
    { key: "certTitle", label: "Certificate Title", type: "text" },
    { key: "issuedBy", label: "Issued By", type: "text" },
  ],
  "business-card": [
    { key: "name", label: "Name", type: "text" },
    { key: "role", label: "Role/Title", type: "text" },
    { key: "company", label: "Company", type: "text" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "email", label: "Email", type: "text" },
  ],
}

function getSettings(featureId: string): SettingDef[] {
  return settingsMap[featureId] || []
}

function DesignPage() {
  const {
    input, setInput, output, outputHtml, processing, activeFeature,
    setActiveFeature, remaining, registerSettings, handleProcess,
    outputRef,
  } = useWorkspace()

  const currentFeature = features.find((f) => f.id === activeFeature) ?? features[0]

  const handleFeatureChange = useCallback((featureId: string) => {
    setActiveFeature(featureId)
    registerSettings(getSettings(featureId))
    setInput("")
  }, [setActiveFeature, registerSettings, setInput])

  useEffect(() => {
    registerSettings(getSettings(activeFeature))
  }, [activeFeature, registerSettings])

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Feature grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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

      <div className="rounded-2xl border border-dashed border-border/20 bg-card/20 p-8 sm:p-10 text-center space-y-3">
        <div className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-primary/[0.06]">
          <Sparkles className="h-4 w-4 text-primary/40" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground/70">Configure settings in the panel, then click Generate</p>
          <p className="text-xs text-muted-foreground/40">Your generated content will appear here.</p>
        </div>
      </div>

      {remaining > 0 ? (
        <button
          type="button"
          onClick={handleProcess}
          disabled={processing}
          className="relative w-full flex items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-semibold transition-all min-h-[52px] touch-manipulation border bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-primary/25"
          aria-label={processing ? "Generating..." : "Generate"}
        >
          {processing ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="h-5 w-5" /> Generate</>
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

export default memo(DesignPage)

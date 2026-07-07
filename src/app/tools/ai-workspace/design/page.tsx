"use client"

import { useCallback, useEffect } from "react"
import {
  Sparkles, CreditCard, Share2, Image, Printer,
  FileText, AlertCircle, Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

export default function DesignPage() {
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

      <div className="rounded-2xl border border-white/[0.06] bg-card/30 p-6 text-center">
        <p className="text-sm text-muted-foreground/50">Configure settings in the right panel, then click Generate</p>
      </div>

      {remaining > 0 ? (
        <Button className="w-full" size="lg" onClick={handleProcess} disabled={processing}>
          {processing ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" /> Generate</>
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

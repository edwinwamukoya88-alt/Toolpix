"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { CardType } from "./cardTypes"
import type { DesignSettings, Template } from "./templates"
import { templatesByType, defaultDesign, fontOptions, fontWeightOptions, letterSpacingOptions, borderRadiusOptions, borderStyleOptions, shadowOptions, spacingOptions, alignOptions, logoPositionOptions, bgStyleOptions } from "./templates"

interface TemplateSelectorProps {
  cardType: CardType
  design: DesignSettings
  selectedTemplate: string
  onSelectTemplate: (id: string) => void
  onDesignChange: (design: DesignSettings) => void
}

export default function TemplateSelector({
  cardType,
  design,
  selectedTemplate,
  onSelectTemplate,
  onDesignChange,
}: TemplateSelectorProps) {
  const templates = templatesByType[cardType]

  const updateDesign = (partial: Partial<DesignSettings>) => {
    onDesignChange({ ...design, ...partial })
  }

  return (
    <div className="space-y-5">
      {/* Templates Section */}
      <div>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Templates</span>
        <div className="grid grid-cols-1 gap-1.5 mt-1.5">
          {templates.map((tmpl: Template) => (
            <button
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl.id)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all ${
                selectedTemplate === tmpl.id
                  ? "bg-primary/10 text-primary border border-primary/30 shadow-sm"
                  : "bg-card hover:bg-accent/40 text-muted-foreground border border-border/40"
              }`}
            >
              <span
                className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0 border border-border/30"
                style={{
                  background: tmpl.design.bgStyle === "gradient"
                    ? `linear-gradient(135deg, ${tmpl.design.gradientStart}, ${tmpl.design.gradientEnd})`
                    : tmpl.design.bgColor || "#fff",
                  color: tmpl.design.textColor || "#000",
                }}
              >
                {tmpl.name.charAt(0)}
              </span>
              <div className="text-left flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{tmpl.name}</div>
                <div className="text-[9px] text-muted-foreground truncate">{tmpl.description}</div>
              </div>
              {selectedTemplate === tmpl.id && <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Customization Sections */}
      <AccordionSection title="Background & Colors" defaultOpen>
        <div className="space-y-2.5">
          <ControlSelect label="Style" value={design.bgStyle} options={bgStyleOptions} onChange={(v) => updateDesign({ bgStyle: v as DesignSettings["bgStyle"] })} />
          {design.bgStyle === "solid" ? (
            <ColorControl label="Background" value={design.bgColor} onChange={(v) => updateDesign({ bgColor: v })} />
          ) : (
            <div className="flex gap-2">
              <ColorControl label="From" value={design.gradientStart} onChange={(v) => updateDesign({ gradientStart: v })} />
              <ColorControl label="To" value={design.gradientEnd} onChange={(v) => updateDesign({ gradientEnd: v })} />
            </div>
          )}
          <ColorControl label="Text Color" value={design.textColor} onChange={(v) => updateDesign({ textColor: v })} />
          <ColorControl label="Accent" value={design.accentColor} onChange={(v) => updateDesign({ accentColor: v })} />
        </div>
      </AccordionSection>

      <AccordionSection title="Typography" defaultOpen>
        <div className="space-y-2.5">
          <ControlSelect label="Font" value={design.fontFamily} options={fontOptions} onChange={(v) => updateDesign({ fontFamily: v })} />
          <ControlSelect label="Weight" value={design.fontWeight} options={fontWeightOptions} onChange={(v) => updateDesign({ fontWeight: v })} />
          <ControlSelect label="Letter Spacing" value={design.letterSpacing} options={letterSpacingOptions} onChange={(v) => updateDesign({ letterSpacing: v })} />
          <ControlSelect label="Alignment" value={design.textAlign} options={alignOptions} onChange={(v) => updateDesign({ textAlign: v as DesignSettings["textAlign"] })} />
        </div>
      </AccordionSection>

      <AccordionSection title="Card Style" defaultOpen>
        <div className="space-y-2.5">
          <ControlSelect label="Border" value={design.borderStyle} options={borderStyleOptions} onChange={(v) => updateDesign({ borderStyle: v as DesignSettings["borderStyle"] })} />
          <ControlSelect label="Corners" value={design.borderRadius} options={borderRadiusOptions} onChange={(v) => updateDesign({ borderRadius: v as DesignSettings["borderRadius"] })} />
          <ControlSelect label="Shadow" value={design.shadowLevel} options={shadowOptions} onChange={(v) => updateDesign({ shadowLevel: v as DesignSettings["shadowLevel"] })} />
          <ControlSelect label="Spacing" value={design.spacing} options={spacingOptions} onChange={(v) => updateDesign({ spacing: v as DesignSettings["spacing"] })} />
        </div>
      </AccordionSection>

      <AccordionSection title="Logo & Extras">
        <div className="space-y-2.5">
          <ControlSelect label="Logo Position" value={design.logoPosition} options={logoPositionOptions} onChange={(v) => updateDesign({ logoPosition: v as DesignSettings["logoPosition"] })} />
          <ControlSelect label="Decoration Icon" value={design.iconStyle} options={[
            { value: "none", label: "None" },
            { value: "star", label: "Star" },
            { value: "diamond", label: "Diamond" },
            { value: "crown", label: "Crown" },
            { value: "heart", label: "Heart" },
            { value: "leaf", label: "Leaf" },
            { value: "bolt", label: "Bolt" },
          ]} onChange={(v) => updateDesign({ iconStyle: v })} />
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={design.paperTexture}
              onChange={(e) => updateDesign({ paperTexture: e.target.checked })}
              className="rounded border-border"
            />
            Paper Texture
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={design.showWatermark}
              onChange={(e) => updateDesign({ showWatermark: e.target.checked })}
              className="rounded border-border"
            />
            Show Watermark
          </label>
        </div>
      </AccordionSection>
    </div>
  )
}

function AccordionSection({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  return (
    <div className="border border-border/30 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        {title}
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && <div className="p-3">{children}</div>}
    </div>
  )
}

function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] text-muted-foreground font-mono">{value}</span>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-6 h-6 rounded cursor-pointer border border-border p-0" />
      </div>
    </div>
  )
}

function ControlSelect({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={(v) => v && onChange(v)}>
        <SelectTrigger className="h-6 text-[10px] w-[110px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-[10px]">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

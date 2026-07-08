"use client"

import { useCallback, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RotateCcw, Upload } from "lucide-react"
import type { CardType, FormData, FieldConfig } from "./cardTypes"
import { cardTypeConfigs, initialFormData, cardTypeOptions, industryOptions } from "./cardTypes"

interface CardFormProps {
  cardType: CardType
  formData: FormData
  onChange: (data: FormData) => void
  onTypeChange: (type: CardType) => void
  onLogoChange: (logo: string | null) => void
  logo: string | null
}

export default function CardForm({ cardType, formData, onChange, onTypeChange, onLogoChange, logo }: CardFormProps) {
  const config = cardTypeConfigs[cardType]
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFieldChange = useCallback((name: string, value: string) => {
    onChange({ ...formData, [name]: value } as FormData)
  }, [formData, onChange])

  const resetForm = useCallback(() => {
    onChange(initialFormData[cardType])
  }, [cardType, onChange])

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onLogoChange(ev.target?.result as string)
    reader.readAsDataURL(file)
  }, [onLogoChange])

  const clearLogo = useCallback(() => {
    onLogoChange(null)
    if (fileRef.current) fileRef.current.value = ""
  }, [onLogoChange])

  return (
    <div className="space-y-4">
      {/* Card Type Selector */}
      <div>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Card Type</span>
        <div className="grid grid-cols-1 gap-1 mt-1.5">
          {cardTypeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onTypeChange(opt.value)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                cardType === opt.value
                  ? "bg-primary/10 text-primary border border-primary/30 shadow-sm"
                  : "bg-card hover:bg-accent/40 text-muted-foreground border border-border/40"
              }`}
            >
              <span className="text-base">{opt.icon}</span>
              <span>{opt.label}</span>
              {cardType === opt.value && <span className="ml-auto w-1 h-1 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      </div>

      {/* Logo Upload */}
      <div>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Logo</span>
        <div className="flex items-center gap-2 mt-1.5">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          {!logo ? (
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 w-full" onClick={() => fileRef.current?.click()}>
              <Upload className="w-3 h-3" /> Upload Logo
            </Button>
          ) : (
            <div className="flex items-center gap-2 w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt="Logo" className="h-8 w-auto rounded border border-border" />
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={clearLogo}>
                Remove
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground">{config.label} Details</h3>
        <Button variant="ghost" size="sm" onClick={resetForm} className="h-6 text-[10px] gap-1 text-muted-foreground px-1">
          <RotateCcw className="w-2.5 h-2.5" /> Reset
        </Button>
      </div>

      <div className="space-y-2.5">
        {config.fields.map((field: FieldConfig) => (
          <FieldInput
            key={field.name}
            field={field}
            value={String((formData as unknown as Record<string, string>)[field.name] || "")}
            onChange={(v) => handleFieldChange(field.name, v)}
          />
        ))}
      </div>
    </div>
  )
}

function FieldInput({ field, value, onChange }: { field: FieldConfig; value: string; onChange: (v: string) => void }) {
  if (field.type === "textarea") {
    return (
      <div className="space-y-1">
        <span className="text-[10px] font-medium text-muted-foreground">{field.label}</span>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="flex min-h-[64px] w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </div>
    )
  }
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-medium text-muted-foreground">{field.label}</span>
      <Input
        type={field.type === "date" ? "date" : field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="h-8 text-xs"
      />
    </div>
  )
}

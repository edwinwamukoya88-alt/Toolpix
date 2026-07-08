"use client"

import { useCallback } from "react"
import { Copy, Share2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

function getToolNameFromSlug(slug?: string): string {
  if (typeof window === "undefined") return ""
  const path = window.location.pathname
  const parts = path.split("/")
  const s = parts[parts.length - 1] || slug || ""
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function CalculatorHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center space-y-1">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export function CalculatorCard({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5 space-y-5">{children}</CardContent>
    </Card>
  )
}

interface NumberInputProps {
  label: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  icon?: React.ReactNode
  step?: string
  min?: string
  suffix?: string
}

export function NumberInput({ label, value, onChange, placeholder, icon, step, min, suffix }: NumberInputProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
      </div>
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 text-base tabular-nums"
          step={step}
          min={min}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

interface ResultCardProps {
  label: string
  value: string
  accent?: "green" | "red" | "amber" | "neutral" | "blue"
  icon?: React.ReactNode
  subtitle?: string
}

const accentColors: Record<string, string> = {
  green: "text-green-600 dark:text-green-400",
  red: "text-red-600 dark:text-red-400",
  amber: "text-amber-600 dark:text-amber-400",
  blue: "text-blue-600 dark:text-blue-400",
  neutral: "text-foreground",
}

export function ResultCard({ label, value, accent = "neutral", icon, subtitle }: ResultCardProps) {
  return (
    <Card className="border shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4 text-center space-y-1.5">
        {icon && <div className="flex justify-center text-muted-foreground">{icon}</div>}
        <div className={`text-2xl sm:text-3xl font-bold tabular-nums tracking-tight ${accentColors[accent]}`}>
          {value}
        </div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {subtitle && <p className="text-[10px] text-muted-foreground/70">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const copy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => toast.success("Copied to clipboard"))
  }, [value])
  return (
    <Button variant="outline" size="sm" onClick={copy} className="gap-1.5">
      <Copy className="h-3.5 w-3.5" /> {label}
    </Button>
  )
}

export function ShareButton() {
  const share = useCallback(() => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ url, title: getToolNameFromSlug() })
    } else {
      navigator.clipboard.writeText(url).then(() => toast.success("Link copied to clipboard"))
    }
  }, [])
  return (
    <Button variant="outline" size="sm" onClick={share} className="gap-1.5">
      <Share2 className="h-3.5 w-3.5" /> Share
    </Button>
  )
}

export function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="gap-1.5 text-muted-foreground">
      <RotateCcw className="h-3.5 w-3.5" /> Reset
    </Button>
  )
}

export function ActionBar({ onReset, result }: { onReset: () => void; result?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      {result && <CopyButton value={result} />}
      <ShareButton />
      <ResetButton onClick={onReset} />
    </div>
  )
}

export function Bar({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted-foreground/10 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function ProgressBar({ value, max, color = "bg-primary" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="h-2 w-full rounded-full bg-muted-foreground/10 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function InfoBox({ children, variant = "info" }: { children: React.ReactNode; variant?: "info" | "warning" | "success" | "error" }) {
  const styles = {
    info: "bg-primary/5 border-primary/20 text-primary",
    warning: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200",
    success: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    error: "bg-destructive/10 border-destructive/20 text-destructive",
  }
  return (
    <div className={`flex items-center gap-2 rounded-xl border p-3 text-sm ${styles[variant]}`}>
      {children}
    </div>
  )
}

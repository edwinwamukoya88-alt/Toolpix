"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

function hexToRgb(hex: string) {
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  return `rgb(${r}, ${g}, ${b})`
}

function hexToHsl(hex: string) {
  let r = Number.parseInt(hex.slice(1, 3), 16) / 255
  let g = Number.parseInt(hex.slice(3, 5), 16) / 255
  let b = Number.parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

const presets = ["#ff6b6b", "#f59e0b", "#22c55e", "#00f2fe", "#4facfe", "#a855f7", "#ec4899", "#64748b", "#0f172a", "#ffffff"]

export default function ColorPicker() {
  const [hex, setHex] = useState("#4facfe")
  const [copied, setCopied] = useState("")

  function copy(val: string, label: string) {
    navigator.clipboard.writeText(val)
    setCopied(label)
    toast.success(`${label} copied!`)
    setTimeout(() => setCopied(""), 1500)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl h-48 flex items-end p-4 transition-colors duration-200" style={{ background: hex }}>
        <span className="font-mono text-xl font-bold bg-black/40 backdrop-blur-sm px-3 py-1 rounded">{hex}</span>
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Hex Color</label>
          <Input value={hex} onChange={(e) => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && setHex(e.target.value)} maxLength={7} className="font-mono" />
        </div>
        <Input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="w-14 h-11 p-1 cursor-pointer" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "HEX", value: hex },
          { label: "RGB", value: hexToRgb(hex) },
          { label: "HSL", value: hexToHsl(hex) },
        ].map(({ label, value }) => (
          <Card key={label} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => copy(value, label)}>
            <CardContent className="p-4 relative">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
              <p className="font-mono text-sm mt-1 truncate">{value}</p>
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6">
                {copied === label ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Quick Palette</label>
        <div className="flex gap-2 flex-wrap">
          {presets.map((c) => (
            <button
              key={c}
              className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 ${hex === c ? "border-primary scale-110" : "border-transparent"}`}
              style={{ background: c }}
              onClick={() => setHex(c)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

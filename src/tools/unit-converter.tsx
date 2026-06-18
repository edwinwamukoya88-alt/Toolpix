"use client"

import { useState } from "react"
import { ArrowRightLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const converters: Record<string, { units: string[]; convert: (v: number, f: string, t: string) => number }> = {
  Length: {
    units: ["Meters", "Kilometers", "Miles", "Feet", "Inches", "Centimeters"],
    convert: (v, f, t) => { const m: Record<string, number> = { Meters: 1, Kilometers: 1000, Miles: 1609.344, Feet: 0.3048, Inches: 0.0254, Centimeters: 0.01 }; return v * m[f]! / m[t]! },
  },
  Weight: {
    units: ["Kilograms", "Grams", "Pounds", "Ounces"],
    convert: (v, f, t) => { const m: Record<string, number> = { Kilograms: 1, Grams: 0.001, Pounds: 0.453592, Ounces: 0.0283495 }; return v * m[f]! / m[t]! },
  },
  Temperature: {
    units: ["Celsius", "Fahrenheit", "Kelvin"],
    convert: (v, f, t) => {
      let c = f === "Celsius" ? v : f === "Fahrenheit" ? (v - 32) * 5 / 9 : v - 273.15
      return t === "Celsius" ? c : t === "Fahrenheit" ? c * 9 / 5 + 32 : c + 273.15
    },
  },
}

export default function UnitConverter() {
  const [category, setCategory] = useState("Length")
  const [from, setFrom] = useState("Meters")
  const [to, setTo] = useState("Feet")
  const [value, setValue] = useState("1")
  const cat = converters[category]!

  const result = value && !isNaN(Number(value)) ? cat.convert(Number(value), from, to) : ""

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex gap-2">
        {Object.keys(converters).map((cat) => (
          <button
            key={cat}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${category === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            onClick={() => { setCategory(cat); setFrom(converters[cat]!.units[0]!); setTo(converters[cat]!.units[1]!) }}
          >
            {cat}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Value</label>
              <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">From</label>
              <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full h-9 rounded-md border bg-background px-3 text-sm">
                {cat.units.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">To</label>
              <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full h-9 rounded-md border bg-background px-3 text-sm">
                {cat.units.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Result</label>
              <div className="h-9 rounded-md border bg-muted px-3 flex items-center text-sm font-mono">
                {result !== "" ? `${Number(value)} ${from} = ${(result as number).toFixed(4)} ${to}` : "—"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

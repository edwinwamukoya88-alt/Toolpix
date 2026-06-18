"use client"

import { useState } from "react"
import { Copy, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz"
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const DIGITS = "0123456789"
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~"

export default function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [uppercase, setUppercase] = useState(true)
  const [lowercase, setLowercase] = useState(true)
  const [digits, setDigits] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [password, setPassword] = useState("")

  function generate() {
    let chars = ""
    if (lowercase) chars += LOWERCASE
    if (uppercase) chars += UPPERCASE
    if (digits) chars += DIGITS
    if (symbols) chars += SYMBOLS
    if (!chars) return

    let result = ""
    const array = new Uint32Array(length)
    crypto.getRandomValues(array)
    for (let i = 0; i < length; i++) {
      result += chars[array[i]! % chars.length]
    }
    setPassword(result)
  }

  function copy() {
    navigator.clipboard.writeText(password)
    toast.success("Password copied!")
  }

  function strength() {
    let score = 0
    if (lowercase) score += 1
    if (uppercase) score += 1
    if (digits) score += 1
    if (symbols) score += 1
    if (length >= 12) score += 1
    if (length >= 16) score += 1
    return score <= 2 ? "Weak" : score <= 4 ? "Good" : "Strong"
  }

  const strengthColors = { Weak: "bg-red-500", Good: "bg-yellow-500", Strong: "bg-green-500" }
  const str = strength()

  return (
    <div className="space-y-6 max-w-lg">
      <Card>
        <CardContent className="p-6 space-y-6">
          {password && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-muted font-mono text-lg break-all">
              <span className="flex-1">{password}</span>
              <Button variant="ghost" size="icon" onClick={copy}><Copy className="h-4 w-4" /></Button>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Length: {length}</span>
              <span className={str === "Strong" ? "text-green-500" : str === "Good" ? "text-yellow-500" : "text-red-500"}>{str}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className={`h-full transition-all ${strengthColors[str]}`} style={{ width: `${(str === "Weak" ? 33 : str === "Good" ? 66 : 100)}%` }} />
            </div>
            <input type="range" min={6} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full" />
          </div>

          <div className="space-y-3">
            {[
              { label: "Uppercase (A-Z)", value: uppercase, set: setUppercase },
              { label: "Lowercase (a-z)", value: lowercase, set: setLowercase },
              { label: "Digits (0-9)", value: digits, set: setDigits },
              { label: "Symbols (!@#$)", value: symbols, set: setSymbols },
            ].map(({ label, value, set }) => (
              <label key={label} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={value} onChange={() => set(!value)} className="rounded" />
                {label}
              </label>
            ))}
          </div>

          <Button className="w-full" onClick={generate}>
            <RefreshCw className="h-4 w-4 mr-2" /> Generate Password
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

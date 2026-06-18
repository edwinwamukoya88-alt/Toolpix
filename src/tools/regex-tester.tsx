"use client"

import { useState } from "react"
import { Regex } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function RegexTester() {
  const [pattern, setPattern] = useState("")
  const [flags, setFlags] = useState("gi")
  const [test, setTest] = useState("")
  const [replacement, setReplacement] = useState("")
  const [replaceResult, setReplaceResult] = useState("")

  let regex: RegExp | null = null
  let error = ""
  let matches: string[] = []

  try {
    if (pattern) {
      regex = new RegExp(pattern, flags)
      const found = test.match(regex)
      if (found) matches = found
    }
  } catch (e) {
    error = (e as Error).message
  }

  function handleReplace() {
    if (!regex) return
    try {
      setReplaceResult(test.replace(regex, replacement))
    } catch {
      setReplaceResult("Invalid replacement")
    }
  }

  function highlight(text: string) {
    if (!regex) return text
    const parts: React.ReactNode[] = []
    let last = 0, match: RegExpExecArray | null
    const g = new RegExp(regex.source, regex.flags.includes("g") ? flags : flags + "g")
    while ((match = g.exec(text)) !== null) {
      if (match.index > last) parts.push(text.slice(last, match.index))
      parts.push(<mark key={match.index} className="bg-primary/30 text-primary rounded px-0.5">{match[0]}</mark>)
      last = match.index + match[0].length
    }
    if (last < text.length) parts.push(text.slice(last))
    return parts.length ? parts : text
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-2 items-center">
            <div className="flex-1 flex items-center">
              <span className="text-muted-foreground font-mono text-lg px-2">/</span>
              <Input value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="[a-z]+" className="font-mono rounded-none" />
              <span className="text-muted-foreground font-mono text-lg px-2">/</span>
              <Input value={flags} onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ""))} className="w-16 font-mono rounded-l-none" placeholder="gi" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Test String</label>
            <textarea value={test} onChange={(e) => setTest(e.target.value)} rows={6} className="w-full rounded-md border bg-background p-3 text-sm font-mono resize-y" />
          </div>

          {error && <pre className="text-sm text-red-500 font-mono p-3 rounded-lg bg-red-500/10">{error}</pre>}

          {pattern && !error && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Matches: {matches.length}</label>
              {test && (
                <div className="p-4 rounded-lg bg-muted text-sm font-mono leading-relaxed whitespace-pre-wrap">
                  {highlight(test)}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-sm">Replace</h3>
          <div className="flex gap-2">
            <Input value={replacement} onChange={(e) => setReplacement(e.target.value)} placeholder="Replacement..." />
            <Button size="sm" onClick={handleReplace}>Replace</Button>
          </div>
          {replaceResult && (
            <pre className="p-3 rounded-lg bg-green-500/10 text-sm whitespace-pre-wrap">{replaceResult}</pre>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

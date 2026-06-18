"use client"

import { useState } from "react"
import { Copy, Eraser } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

export default function TextCleaner() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")

  function removeExtraSpaces() {
    setOutput(input.replace(/\s+/g, " ").trim())
  }

  function removeDuplicateLines() {
    setOutput([...new Set(input.split("\n"))].join("\n"))
  }

  function removeEmptyLines() {
    setOutput(input.split("\n").filter((l) => l.trim()).join("\n"))
  }

  function trimAll() {
    setOutput(input.split("\n").map((l) => l.trim()).join("\n"))
  }

  function copy() {
    navigator.clipboard.writeText(output)
    toast.success("Copied!")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={8} placeholder="Paste your text here..." className="w-full rounded-md border bg-background p-3 text-sm resize-y" />
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" onClick={removeExtraSpaces}><Eraser className="h-4 w-4 mr-1" /> Extra Spaces</Button>
            <Button size="sm" variant="outline" onClick={removeDuplicateLines}>Duplicate Lines</Button>
            <Button size="sm" variant="outline" onClick={removeEmptyLines}>Empty Lines</Button>
            <Button size="sm" variant="outline" onClick={trimAll}>Trim All</Button>
          </div>
        </CardContent>
      </Card>

      {output && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-sm">Output</h3>
              <Button variant="ghost" size="icon" onClick={copy}><Copy className="h-4 w-4" /></Button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans">{output}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Copy, FileJson } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

export default function JsonFormatter() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")

  function format() {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, 2))
      setError("")
    } catch (e) {
      setError((e as Error).message)
    }
  }

  function minify() {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
      setError("")
    } catch (e) {
      setError((e as Error).message)
    }
  }

  function validate() {
    try {
      JSON.parse(input)
      setOutput("✓ Valid JSON")
      setError("")
    } catch (e) {
      setError((e as Error).message)
    }
  }

  function copy() {
    navigator.clipboard.writeText(output)
    toast.success("Copied!")
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-sm">Input</h3>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={14} placeholder='{"key": "value"}' className="w-full rounded-md border bg-background p-3 text-sm font-mono resize-y" />
          <div className="flex gap-2">
            <Button size="sm" onClick={format}>Beautify</Button>
            <Button size="sm" variant="outline" onClick={minify}>Minify</Button>
            <Button size="sm" variant="outline" onClick={validate}>Validate</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">Output</h3>
            {output && <Button variant="ghost" size="icon" onClick={copy}><Copy className="h-4 w-4" /></Button>}
          </div>
          {error ? (
            <pre className="w-full min-h-[300px] rounded-md border bg-red-500/10 p-3 text-sm font-mono text-red-500 whitespace-pre-wrap">{error}</pre>
          ) : (
            <pre className="w-full min-h-[300px] rounded-md border bg-muted p-3 text-sm font-mono overflow-auto whitespace-pre-wrap">{output || "Result will appear here"}</pre>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

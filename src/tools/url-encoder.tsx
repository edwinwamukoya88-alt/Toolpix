"use client"

import { useState } from "react"
import { Copy, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

export default function UrlEncoder() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [mode, setMode] = useState<"encode" | "decode">("encode")

  function process() {
    try {
      if (mode === "encode") {
        setOutput(encodeURIComponent(input))
      } else {
        setOutput(decodeURIComponent(input))
      }
    } catch {
      toast.error("Invalid URL encoding")
    }
  }

  function copy() {
    navigator.clipboard.writeText(output)
    toast.success("Copied!")
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button variant={mode === "encode" ? "default" : "outline"} size="sm" onClick={() => setMode("encode")}>Encode</Button>
        <Button variant={mode === "decode" ? "default" : "outline"} size="sm" onClick={() => setMode("decode")}>Decode</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 space-y-4">
            <label className="text-xs font-medium text-muted-foreground">Input</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={6} placeholder={mode === "encode" ? "https://example.com/?name=John Doe" : "https%3A%2F%2Fexample.com"} className="w-full rounded-md border bg-background p-3 text-sm font-mono resize-y" />
            <Button onClick={process}><ArrowRight className="h-4 w-4 mr-2" /> {mode === "encode" ? "Encode" : "Decode"}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-muted-foreground">Output</label>
              {output && <Button variant="ghost" size="icon" onClick={copy}><Copy className="h-4 w-4" /></Button>}
            </div>
            <pre className="w-full min-h-[120px] rounded-md border bg-muted p-3 text-sm font-mono break-all whitespace-pre-wrap">{output || "Result will appear here"}</pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

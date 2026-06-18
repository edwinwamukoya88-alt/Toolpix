"use client"

import { useState } from "react"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

export default function LoremIpsum() {
  const [paragraphs, setParagraphs] = useState(3)
  const [text, setText] = useState("")

  function generate() {
    setText(Array.from({ length: paragraphs }, () => lorem).join("\n\n"))
  }

  function copy() {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Paragraphs:</label>
            <input
              type="number"
              min={1}
              max={20}
              value={paragraphs}
              onChange={(e) => setParagraphs(Number(e.target.value))}
              className="w-16 h-9 rounded-md border bg-background px-3 text-sm"
            />
          </div>
          <Button onClick={generate}>Generate</Button>
          {text && (
            <Button variant="outline" onClick={copy}>
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
          )}
        </CardContent>
      </Card>

      {text && (
        <Card>
          <CardContent className="p-6">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground font-sans">{text}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

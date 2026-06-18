"use client"

import { useState } from "react"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

// Simple markdown parser
function parseMarkdown(text: string): string {
  let html = text
    .replace(/### (.+)/g, "<h3 class='text-lg font-bold mt-4 mb-2'>$1</h3>")
    .replace(/## (.+)/g, "<h2 class='text-xl font-bold mt-5 mb-2'>$1</h2>")
    .replace(/# (.+)/g, "<h1 class='text-2xl font-bold mt-6 mb-3'>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code class='bg-muted px-1 rounded text-sm font-mono'>$1</code>")
    .replace(/^- (.+)/gm, "<li class='ml-4 list-disc'>$1</li>")
    .replace(/\d+\. (.+)/g, "<li class='ml-4 list-decimal'>$1</li>")
    .replace(/\n\n/g, "</p><p class='mb-2'>")
    .replace(/\n/g, "<br/>")
  return `<p>${html}</p>`
}

export default function MarkdownPreview() {
  const [markdown, setMarkdown] = useState("# Hello\n\nThis is **bold** and *italic*.\n\n## Features\n- Lists\n- Code `inline`\n- Headers")

  const html = parseMarkdown(markdown)

  function copy() {
    navigator.clipboard.writeText(markdown)
    toast.success("Copied!")
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">Markdown</h3>
            <Button variant="ghost" size="icon" onClick={copy}><Copy className="h-4 w-4" /></Button>
          </div>
          <textarea value={markdown} onChange={(e) => setMarkdown(e.target.value)} rows={16} className="w-full rounded-md border bg-background p-3 text-sm font-mono resize-y" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-sm">Preview</h3>
          <div className="prose prose-sm dark:prose-invert max-w-none min-h-[400px] rounded-md border bg-background p-4 overflow-auto" dangerouslySetInnerHTML={{ __html: html }} />
        </CardContent>
      </Card>
    </div>
  )
}

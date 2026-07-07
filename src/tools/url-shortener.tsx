"use client"

import { useState } from "react"
import { Copy, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function UrlShortener() {
  const [url, setUrl] = useState("")
  const [short, setShort] = useState("")

  function shorten() {
    if (!url.trim()) return
    const id = Math.random().toString(36).slice(2, 7)
    setShort(`https://smart-tools-kit.vercel.app/${id}`)
    toast.success("Short URL generated (local demo)")
  }

  function copyShort() {
    navigator.clipboard.writeText(short)
    toast.success("Copied!")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Enter URL</label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/long-url" />
            </div>
          </div>
          <Button onClick={shorten}>
            <Link className="h-4 w-4 mr-2" /> Shorten (Demo)
          </Button>

          {short && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
              <code className="flex-1 text-sm">{short}</code>
              <Button variant="ghost" size="icon" onClick={copyShort}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

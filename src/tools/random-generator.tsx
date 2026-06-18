"use client"

import { useState } from "react"
import { Copy, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

const NAMES = ["Alice Johnson", "Bob Smith", "Charlie Brown", "Diana Prince", "Eve Williams", "Frank Castle", "Grace Hopper", "Henry Ford"]

export default function RandomGenerator() {
  const [mode, setMode] = useState<"uuid" | "number" | "name">("uuid")
  const [result, setResult] = useState("")

  function generate() {
    switch (mode) {
      case "uuid":
        setResult(crypto.randomUUID())
        break
      case "number": {
        const min = 1, max = 1000
        setResult(String(Math.floor(Math.random() * (max - min + 1)) + min))
        break
      }
      case "name":
        setResult(NAMES[Math.floor(Math.random() * NAMES.length)])
        break
    }
  }

  function copy() {
    navigator.clipboard.writeText(result)
    toast.success("Copied!")
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex gap-2">
        {(["uuid", "number", "name"] as const).map((m) => (
          <Button key={m} variant={mode === m ? "default" : "outline"} size="sm" onClick={() => setMode(m)} className="capitalize">{m}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {result && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-muted font-mono text-sm break-all">
              <span className="flex-1">{result}</span>
              <Button variant="ghost" size="icon" onClick={copy}><Copy className="h-4 w-4" /></Button>
            </div>
          )}

          <Button className="w-full" onClick={generate}>
            <Shuffle className="h-4 w-4 mr-2" /> Generate
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

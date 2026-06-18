"use client"

import { useState, useRef } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function ImagePlaceholder() {
  const [width, setWidth] = useState(400)
  const [height, setHeight] = useState(300)
  const [text, setText] = useState("400 × 300")
  const [bgColor, setBgColor] = useState("#64748b")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  function generate() {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = "#ffffff"
    ctx.font = `bold ${Math.min(width, height) * 0.08}px system-ui`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(text || `${width} × ${height}`, width / 2, height / 2)
  }

  function download() {
    generate()
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.download = `placeholder-${width}x${height}.png`
    link.href = canvas.toDataURL()
    link.click()
    toast.success("Placeholder downloaded!")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Width (px)</label>
              <Input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} min={1} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Height (px)</label>
              <Input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} min={1} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Text</label>
              <Input value={text} onChange={(e) => setText(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Color</label>
              <Input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-14 h-11 p-1 cursor-pointer" />
            </div>
          </div>
          <Button onClick={generate}>Generate</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex flex-col items-center gap-4">
          <canvas ref={canvasRef} style={{ maxWidth: "100%" }} className="rounded-lg border" />
          <Button variant="outline" onClick={download}>
            <Download className="h-4 w-4 mr-2" /> Download
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { trackDownload } from "@/lib/analytics"

const DEFAULT_TEXT = `${process.env.NEXT_PUBLIC_APP_URL || "https://smart-tools-kit.vercel.app"}/tools/qr-generator`

export default function QrGenerator() {
  const [text, setText] = useState(DEFAULT_TEXT)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && text.trim()) {
      QRCode.toCanvas(canvasRef.current, text.trim(), {
        width: 280,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      })
    }
  }, [text])

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.download = "qrcode.png"
    link.href = canvas.toDataURL()
    link.click()
    trackDownload("qr_generator", "png")
    toast.success("QR Code downloaded!")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Text or URL</label>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="https://example.com" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex flex-col items-center gap-4">
          <canvas ref={canvasRef} width={280} height={280} className="border rounded-lg" />
          {!text && <p className="text-sm text-muted-foreground">Enter text to generate QR code</p>}
          {text && (
            <Button variant="outline" onClick={download}>
              <Download className="h-4 w-4 mr-2" /> Download PNG
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

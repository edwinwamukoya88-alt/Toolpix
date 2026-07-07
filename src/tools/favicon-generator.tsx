"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Download, Check, Palette, Type, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface FaviconConfig {
  text: string
  bgColor: string
  gradientTo: string | null
  shape: "circle" | "rounded-square" | "square"
  textColor: string
}

interface Template {
  id: string
  name: string
  description: string
  shape: "circle" | "rounded-square" | "square"
  bgColor: string
  gradientTo: string | null
  textColor: string
}

const SIZES = [16, 32, 48, 64] as const

const TEMPLATES: Template[] = [
  { id: "minimal-circle", name: "Minimal Circle", description: "Clean circular badge", shape: "circle", bgColor: "#4facfe", gradientTo: null, textColor: "#ffffff" },
  { id: "rounded-square", name: "Rounded Square", description: "Modern app icon style", shape: "rounded-square", bgColor: "#6c5ce7", gradientTo: null, textColor: "#ffffff" },
  { id: "gradient-badge", name: "Gradient Badge", description: "Vibrant dual-color style", shape: "rounded-square", bgColor: "#f093fb", gradientTo: "#f5576c", textColor: "#ffffff" },
  { id: "bold-lettermark", name: "Bold Lettermark", description: "Strong letter with depth", shape: "square", bgColor: "#2d3436", gradientTo: null, textColor: "#ffffff" },
  { id: "emoji-style", name: "Emoji Icon", description: "Full emoji on gradient", shape: "square", bgColor: "#00b894", gradientTo: "#00cec9", textColor: "#ffffff" },
]

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawFavicon(canvas: HTMLCanvasElement, size: number, config: FaviconConfig): void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  canvas.width = size
  canvas.height = size

  const half = size / 2
  const pad = 0.5

  ctx.clearRect(0, 0, size, size)

  if (config.shape === "circle") {
    ctx.beginPath()
    ctx.arc(half, half, half - pad, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.beginPath()
    ctx.rect(0, 0, size, size)
  } else if (config.shape === "rounded-square") {
    roundRect(ctx, pad, pad, size - pad * 2, size - pad * 2, size * 0.22)
  } else {
    ctx.rect(pad, pad, size - pad * 2, size - pad * 2)
  }

  if (config.gradientTo) {
    const grad = ctx.createLinearGradient(0, 0, size, size)
    grad.addColorStop(0, config.bgColor)
    grad.addColorStop(1, config.gradientTo)
    ctx.fillStyle = grad
  } else {
    ctx.fillStyle = config.bgColor
  }
  ctx.fill()

  ctx.fillStyle = config.textColor
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  const char = config.text.charAt(0) || "?"
  const fontSize = Math.round(size * (char.length > 1 ? 0.35 : 0.52))
  ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`

  ctx.save()
  ctx.shadowColor = "rgba(0,0,0,0.15)"
  ctx.shadowBlur = Math.max(1, Math.round(size * 0.06))
  ctx.shadowOffsetY = Math.max(1, Math.round(size * 0.04))
  ctx.fillText(char.toUpperCase(), half, half + Math.round(size * 0.02))
  ctx.restore()
  ctx.fillText(char.toUpperCase(), half, half + Math.round(size * 0.02))
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"))
}

function createICO(pngBuffer: ArrayBuffer, size: number): Blob {
  const pngBytes = new Uint8Array(pngBuffer)
  const headerSize = 6
  const dirSize = 16
  const dataOffset = headerSize + dirSize
  const totalSize = dataOffset + pngBytes.length

  const ico = new Uint8Array(totalSize)
  const dv = new DataView(ico.buffer)

  dv.setUint16(0, 0, true)
  dv.setUint16(2, 1, true)
  dv.setUint16(4, 1, true)

  const w = size >= 256 ? 0 : size
  dv.setUint8(6, w)
  dv.setUint8(7, w)
  dv.setUint8(8, 0)
  dv.setUint8(9, 0)
  dv.setUint16(10, 1, true)
  dv.setUint16(12, 32, true)
  dv.setUint32(14, pngBytes.length, true)
  dv.setUint32(18, dataOffset, true)

  ico.set(pngBytes, dataOffset)

  return new Blob([ico], { type: "image/x-icon" })
}

export default function FaviconGenerator() {
  const [config, setConfig] = useState<FaviconConfig>({
    text: "T",
    bgColor: "#4facfe",
    gradientTo: null,
    shape: "circle",
    textColor: "#ffffff",
  })
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>("minimal-circle")
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({})
  const [isGenerating, setIsGenerating] = useState(true)

  const drawCanvasRef = useRef<HTMLCanvasElement>(null)

  const renderAll = useCallback(() => {
    const urls: Record<number, string> = {}
    for (const size of SIZES) {
      const c = document.createElement("canvas")
      drawFavicon(c, size, config)
      urls[size] = c.toDataURL()
    }
    setPreviewUrls(urls)
    setIsGenerating(false)
  }, [config])

  useEffect(() => {
    const id = requestAnimationFrame(() => renderAll())
    return () => cancelAnimationFrame(id)
  }, [renderAll])

  function selectTemplate(t: Template) {
    setSelectedTemplate(t.id)
    setConfig((prev) => ({
      ...prev,
      bgColor: t.bgColor,
      gradientTo: t.gradientTo,
      shape: t.shape,
      textColor: t.textColor,
    }))
  }

  function setText(value: string) {
    setSelectedTemplate(null)
    setConfig((prev) => ({ ...prev, text: value }))
  }

  function setBgColor(value: string) {
    setSelectedTemplate(null)
    setConfig((prev) => ({ ...prev, bgColor: value }))
  }

  async function downloadPNG(size: number) {
    const c = document.createElement("canvas")
    drawFavicon(c, size, config)
    const link = document.createElement("a")
    link.download = `favicon-${size}x${size}.png`
    link.href = c.toDataURL()
    link.click()
    toast.success(`Downloaded ${size}x${size} PNG`)
  }

  async function downloadICO() {
    const c = document.createElement("canvas")
    drawFavicon(c, 32, config)
    const blob = await canvasToBlob(c)
    const buffer = await blob.arrayBuffer()
    const icoBlob = createICO(buffer, 32)
    const url = URL.createObjectURL(icoBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "favicon.ico"
    link.click()
    URL.revokeObjectURL(url)
    toast.success("Downloaded favicon.ico")
  }

  async function downloadAll() {
    const { default: JSZip } = await import("jszip")
    const zip = new JSZip()

    for (const size of SIZES) {
      const c = document.createElement("canvas")
      drawFavicon(c, size, config)
      const blob = await canvasToBlob(c)
      zip.file(`favicon-${size}x${size}.png`, blob)
    }

    const icoCanvas = document.createElement("canvas")
    drawFavicon(icoCanvas, 32, config)
    const icoBlob = await canvasToBlob(icoCanvas)
    const icoBuffer = await icoBlob.arrayBuffer()
    zip.file("favicon.ico", createICO(icoBuffer, 32))

    const content = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(content)
    const link = document.createElement("a")
    link.href = url
    link.download = "favicons.zip"
    link.click()
    URL.revokeObjectURL(url)
    toast.success("Downloaded all favicon sizes")
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Favicon Generator</h2>
        <p className="text-sm text-muted-foreground">Generate favicons from text, emoji, or icons</p>
      </div>

      <canvas ref={drawCanvasRef} className="hidden" />

      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Templates</h3>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {TEMPLATES.map((t) => {
                const isSelected = selectedTemplate === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => selectTemplate(t)}
                    className={`rounded-xl border-2 p-2.5 text-center transition-all hover:shadow-sm ${
                      isSelected
                        ? "border-primary ring-1 ring-primary/20 bg-primary/[0.04]"
                        : "border-muted hover:border-muted-foreground/30"
                    }`}
                  >
                    <svg viewBox="0 0 32 32" className="w-8 h-8 mx-auto mb-1" aria-hidden="true">
                      {t.shape === "circle" ? (
                        <circle cx="16" cy="16" r="15" fill="url(#g)" />
                      ) : t.shape === "rounded-square" ? (
                        <rect x="1" y="1" width="30" height="30" rx="7" fill="url(#g)" />
                      ) : (
                        <rect x="1" y="1" width="30" height="30" rx="2" fill="url(#g)" />
                      )}
                      <defs>
                        <linearGradient id="g" x1="0" y1="0" x2="32" y2="32">
                          <stop offset="0%" stopColor={t.bgColor} />
                          <stop offset="100%" stopColor={t.gradientTo || t.bgColor} />
                        </linearGradient>
                      </defs>
                      <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight="bold" fill={t.textColor}>
                        {t.name === "Emoji Icon" ? "😊" : "A"}
                      </text>
                    </svg>
                    <span className="block text-[10px] leading-tight text-muted-foreground">{t.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5 text-muted-foreground" />
                <label className="text-xs font-medium text-muted-foreground">Text or Emoji</label>
              </div>
              <Input
                value={config.text}
                onChange={(e) => setText(e.target.value.slice(0, 3))}
                maxLength={3}
                placeholder="Enter text or emoji"
                className="h-11 text-base text-center font-semibold tracking-wide"
              />
              <p className="text-[10px] text-muted-foreground/70">First character will be used</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                <label className="text-xs font-medium text-muted-foreground">Background</label>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="color"
                    value={config.bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Pick background color"
                  />
                  <div
                    className="w-11 h-11 rounded-lg border shadow-sm cursor-pointer"
                    style={{ backgroundColor: config.bgColor }}
                  />
                </div>
                {config.gradientTo && (
                  <div className="relative">
                    <input
                      type="color"
                      value={config.gradientTo}
                      onChange={(e) => setConfig((p) => ({ ...p, gradientTo: e.target.value }))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title="Pick gradient end color"
                    />
                    <div
                      className="w-11 h-11 rounded-lg border shadow-sm cursor-pointer"
                      style={{ backgroundColor: config.gradientTo }}
                    />
                  </div>
                )}
              </div>
              {config.gradientTo && (
                <p className="text-[10px] text-muted-foreground/70">Gradient active</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="text-sm font-semibold">Preview</h3>

          {isGenerating && (
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
              <span>Generating favicon...</span>
            </div>
          )}

          {!isGenerating && (
            <div className="grid grid-cols-4 gap-4">
              {SIZES.map((size) => (
                <div key={size} className="text-center space-y-2">
                  <div className="mx-auto rounded-xl border bg-card shadow-sm p-3 inline-flex">
                    {previewUrls[size] && (
                      <img
                        src={previewUrls[size]}
                        alt={`${size}x${size}`}
                        width={size}
                        height={size}
                        className="image-rendering-pixelated"
                        style={{ imageRendering: "pixelated" }}
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium tabular-nums">{size}x{size}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs w-full"
                    onClick={() => downloadPNG(size)}
                  >
                    <Download className="h-3 w-3 mr-1" /> PNG
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1" onClick={downloadICO} disabled={isGenerating}>
              <Download className="h-4 w-4 mr-1.5" /> Download ICO
            </Button>
            <Button size="sm" className="flex-1" onClick={downloadAll} disabled={isGenerating}>
              <Download className="h-4 w-4 mr-1.5" /> Download All (.zip)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

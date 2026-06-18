"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, Download, ImageIcon, RotateCcw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

const FORMAT_OPTIONS: { value: string; label: string; ext: string }[] = [
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/jpeg", label: "JPG", ext: "jpg" },
  { value: "image/webp", label: "WEBP", ext: "webp" },
]

type AppState = "idle" | "dragging" | "selected" | "converted"

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [selectedFormat, setSelectedFormat] = useState("image/png")
  const [quality, setQuality] = useState(0.9)
  const [state, setState] = useState<AppState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const formatRef = useRef("image/png")
  const qualityRef = useRef(0.9)

  function dataURLToBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(",")
    const mime = arr[0].match(/:(.*?);/)![1]
    const bstr = atob(arr[1])
    const n = bstr.length
    const u8arr = new Uint8Array(n)
    for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i)
    return new Blob([u8arr], { type: mime })
  }

  const cleanOutput = useCallback(() => {
    if (outputUrl) {
      URL.revokeObjectURL(outputUrl)
      setOutputUrl(null)
    }
  }, [outputUrl])

  useEffect(() => cleanOutput, [cleanOutput])

  const loadFile = useCallback((f: File) => {
    setError(null)
    if (!f.type.startsWith("image/")) {
      setError("Please select a valid image file.")
      return
    }
    cleanOutput()
    setFile(f)
    setState("selected")
    setOutputUrl(null)

    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.onerror = () => {
      setError("Failed to read the image file.")
      toast.error("Failed to read the image file.")
    }
    reader.readAsDataURL(f)
    toast.success(`Loaded: ${f.name}`)
  }, [cleanOutput])

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) loadFile(f)
    if (e.target) e.target.value = ""
  }

  function handleFormatChange(newFormat: string) {
    formatRef.current = newFormat
    setSelectedFormat(newFormat)
    setState("selected")
  }

  function handleQualityChange(newQ: number) {
    qualityRef.current = newQ
    setQuality(newQ)
  }

  const dragHandlers = {
    onDragEnter(e: React.DragEvent) {
      e.preventDefault()
      e.stopPropagation()
      setState("dragging")
    },
    onDragOver(e: React.DragEvent) {
      e.preventDefault()
      e.stopPropagation()
    },
    onDragLeave(e: React.DragEvent) {
      e.preventDefault()
      e.stopPropagation()
      setState(file ? "selected" : "idle")
    },
    onDrop(e: React.DragEvent) {
      e.preventDefault()
      e.stopPropagation()
      const f = e.dataTransfer.files?.[0]
      if (f) loadFile(f)
      else setState(file ? "selected" : "idle")
    },
  }

  function convert() {
    if (!preview) return

    const fmt = formatRef.current
    const q = qualityRef.current
    const fmtOpt = FORMAT_OPTIONS.find((o) => o.value === fmt)

    if (!fmtOpt) {
      setError(`Unsupported format: ${fmt}`)
      toast.error(`Unsupported format: ${fmt}`)
      return
    }

    setIsConverting(true)
    setError(null)

    const img = new Image()
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext("2d")
        if (!ctx) throw new Error("Could not get canvas context")

        if (fmt === "image/jpeg") {
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        ctx.drawImage(img, 0, 0)
        const qualityArg = fmt === "image/png" ? undefined : q
        const dataUrl = canvas.toDataURL(fmt, qualityArg)
        const blob = dataURLToBlob(dataUrl)

        cleanOutput()
        const url = URL.createObjectURL(blob)
        setOutputUrl(url)
        setState("converted")
        setIsConverting(false)
        toast.success("Image converted!")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Conversion error")
        setIsConverting(false)
      }
    }
    img.onerror = () => {
      setError("Failed to decode image")
      setIsConverting(false)
    }
    img.src = preview
  }

  function download() {
    if (!outputUrl || !file) return

    const fmt = formatRef.current
    const opt = FORMAT_OPTIONS.find((o) => o.value === fmt)
    if (!opt) {
      setError(`Unknown format: ${fmt}`)
      return
    }
    const base = file.name.replace(/\.[^.]+$/, "")
    const link = document.createElement("a")
    link.href = outputUrl
    link.download = `${base}-converted.${opt.ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Image downloaded!")
  }

  function reset() {
    qualityRef.current = 0.9
    setFile(null)
    setPreview(null)
    cleanOutput()
    setError(null)
    setState("idle")
    setQuality(0.9)
  }

  const isDragging = state === "dragging"

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div
            ref={dropRef}
            {...dragHandlers}
            data-dragging={isDragging || undefined}
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors
              ${isDragging ? "border-primary bg-primary/5" : "hover:border-primary/50"}
              ${state !== "idle" ? "hidden" : ""}`}
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">Upload an image</p>
            <p className="text-xs text-muted-foreground mb-4">PNG, JPG, WEBP supported</p>
            <Button variant="outline" className="relative" onClick={() => inputRef.current?.click()}>
              Choose Image
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={pickFile}
              />
            </Button>
          </div>

          {state !== "idle" && preview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm truncate">{file?.name}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={reset} title="Reset">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="relative rounded-lg overflow-hidden border bg-muted/30 flex items-center justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 w-auto object-contain"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Format</label>
                  <select
                    value={selectedFormat}
                    onChange={(e) => handleFormatChange(e.target.value)}
                    className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {FORMAT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Quality: {quality.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.1}
                    value={quality}
                    onChange={(e) => handleQualityChange(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    className="w-full"
                    onClick={convert}
                    disabled={isConverting || state === "converted"}
                  >
                    {isConverting ? "Converting…" : "Convert"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {state === "converted" && outputUrl && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <p className="text-sm font-medium">Converted Image</p>
            <div className="relative rounded-lg overflow-hidden border bg-muted/30 flex items-center justify-center">
              <img
                src={outputUrl}
                alt="Converted"
                className="max-h-64 w-auto object-contain"
              />
            </div>
            <Button onClick={download}>
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

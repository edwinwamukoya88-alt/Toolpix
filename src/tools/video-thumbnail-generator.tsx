"use client"

import { useState, useRef } from "react"
import { Upload, Download, ImagePlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

const formats = [
  { value: "png", label: "PNG", mime: "image/png", ext: ".png" },
  { value: "jpeg", label: "JPEG", mime: "image/jpeg", ext: ".jpg" },
  { value: "webp", label: "WebP", mime: "image/webp", ext: ".webp" },
]

export default function ThumbnailGenerator() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [thumbUrl, setThumbUrl] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [format, setFormat] = useState("png")
  const [quality, setQuality] = useState(90)
  const [capturing, setCapturing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreviewUrl(url)
    setThumbUrl(null)
  }

  function handleMetadata() {
    if (videoRef.current) {
      setDuration(Math.floor(videoRef.current.duration))
    }
  }

  function handleTimeUpdate() {
    if (videoRef.current) {
      setCurrentTime(Math.floor(videoRef.current.currentTime))
    }
  }

  function capture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    setCapturing(true)
    try {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const fmt = formats.find((f) => f.value === format)!
      const qualityVal = format === "png" ? undefined : quality / 100
      const dataUrl = canvas.toDataURL(fmt.mime, qualityVal)
      setThumbUrl(dataUrl)
      toast.success("Thumbnail captured!")
    } catch {
      toast.error("Failed to capture frame")
    } finally {
      setCapturing(false)
    }
  }

  function formatTime(s: number): string {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4 text-xs text-muted-foreground">
        Your files never leave your device. All processing happens locally in your browser.
      </div>

      <Card>
        <CardContent className="p-6">
          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm font-medium">{file ? file.name : "Upload Video"}</span>
            <span className="text-xs text-muted-foreground mt-1">Drop a video to capture a frame</span>
            <input type="file" accept="video/*" onChange={handleFile} className="hidden" />
          </label>
        </CardContent>
      </Card>

      {previewUrl && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <video
              ref={videoRef}
              src={previewUrl}
              controls
              onLoadedMetadata={handleMetadata}
              onTimeUpdate={handleTimeUpdate}
              className="w-full max-h-64 rounded-xl"
            />

            <div className="text-xs text-muted-foreground">
              Duration: {formatTime(duration)} &middot; Current: {formatTime(currentTime)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Format</label>
                <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                  {formats.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              {format !== "png" && (
                <div className="space-y-2">
                  <label className="text-xs font-medium">Quality: {quality}%</label>
                  <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full" />
                </div>
              )}
            </div>

            <Button onClick={capture} disabled={capturing} className="w-full">
              {capturing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Capturing...</> : <><ImagePlus className="h-4 w-4 mr-2" /> Capture Frame</>}
            </Button>

            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>
      )}

      {thumbUrl && (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbUrl} alt="Thumbnail preview" className="w-full max-h-80 rounded-xl object-contain bg-black" />
          <Button onClick={() => {
            const a = document.createElement("a"); a.href = thumbUrl; const fmt = formats.find((f) => f.value === format)!; a.download = "thumbnail" + fmt.ext; a.click()
          }} className="w-full"><Download className="h-4 w-4 mr-2" /> Download Thumbnail</Button>
        </div>
      )}
    </div>
  )
}

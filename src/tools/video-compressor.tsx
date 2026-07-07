"use client"

import { useState, useRef } from "react"
import { Upload, Download, Film, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchFile } from "@ffmpeg/util"
import { useFFmpeg } from "@/hooks/use-ffmpeg"
import { toast } from "sonner"

type QualityPreset = "veryhigh" | "high" | "medium" | "low"
type ResolutionPreset = "original" | "1080p" | "720p" | "480p" | "360p"

const qualityPresets: Record<QualityPreset, { label: string; crf: number }> = {
  veryhigh: { label: "Very High (lossless)", crf: 18 },
  high: { label: "High", crf: 23 },
  medium: { label: "Medium", crf: 28 },
  low: { label: "Low", crf: 35 },
}

const resolutionPresets: Record<ResolutionPreset, { label: string; scale: string }> = {
  original: { label: "Original", scale: "" },
  "1080p": { label: "1080p (1920x1080)", scale: "1920:1080" },
  "720p": { label: "720p (1280x720)", scale: "1280:720" },
  "480p": { label: "480p (854x480)", scale: "854:480" },
  "360p": { label: "360p (640x360)", scale: "640:360" },
}

export default function VideoCompressor() {
  const { loaded, loading: ffLoading, progress, load, getFFmpeg } = useFFmpeg()
  const [file, setFile] = useState<File | null>(null)
  const [quality, setQuality] = useState<QualityPreset>("high")
  const [resolution, setResolution] = useState<ResolutionPreset>("original")
  const [processing, setProcessing] = useState(false)
  const [procProgress, setProcProgress] = useState(0)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setOutputUrl(null)
  }

  async function compress() {
    if (!file) return
    if (!loaded) await load()
    setProcessing(true)
    setProcProgress(0)

    try {
      const ffmpeg = getFFmpeg()
      const inputName = "input" + getExtension(file.name)
      const outputName = "compressed" + getExtension(file.name)

      await ffmpeg.writeFile(inputName, await fetchFile(file))

      const args = ["-i", inputName]
      if (resolution !== "original") {
        args.push("-vf", `scale=${resolutionPresets[resolution].scale}`)
      }
      args.push("-crf", String(qualityPresets[quality].crf), "-preset", "medium")
      args.push("-y", outputName)

      ffmpeg.on("progress", ({ progress: p }) => {
        setProcProgress(Math.round(p * 100))
      })

      await ffmpeg.exec(args)

      const data = await ffmpeg.readFile(outputName)
      const blob = new Blob([new Uint8Array(data instanceof Uint8Array ? data : [])], { type: file.type })
      setOutputUrl(URL.createObjectURL(blob))
      await ffmpeg.deleteFile(inputName)
      await ffmpeg.deleteFile(outputName)
      toast.success("Video compressed successfully!")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Compression failed")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4 text-xs text-muted-foreground">
        Your files never leave your device. All processing happens locally in your browser.
      </div>

      {!loaded && !ffLoading && (
        <Button onClick={load} className="w-full">
          <Film className="h-4 w-4 mr-2" /> Load FFmpeg Engine
        </Button>
      )}

      {ffLoading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading FFmpeg... {progress}%</div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {loaded && (
        <>
          <Card>
            <CardContent className="p-6 space-y-4">
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm font-medium">{file ? file.name : "Upload Video"}</span>
                <span className="text-xs text-muted-foreground mt-1">MP4, MOV, WebM supported</span>
                <input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleFile} className="hidden" />
              </label>
            </CardContent>
          </Card>

          {previewUrl && (
            <video ref={videoRef} src={previewUrl} controls className="w-full max-h-64 rounded-xl" />
          )}

          {file && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Quality Preset</label>
                    <select value={quality} onChange={(e) => setQuality(e.target.value as QualityPreset)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                      {Object.entries(qualityPresets).map(([k, v]) => (
                        <option key={k} value={k}>{v.label} (CRF {v.crf})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Resolution</label>
                    <select value={resolution} onChange={(e) => setResolution(e.target.value as ResolutionPreset)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                      {Object.entries(resolutionPresets).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button onClick={compress} disabled={processing} className="w-full">
                  {processing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Compressing... {procProgress}%</> : "Compress Video"}
                </Button>

                {processing && (
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${procProgress}%` }} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {outputUrl && (
            <Button onClick={() => {
              const a = document.createElement("a")
              a.href = outputUrl
              a.download = "compressed-" + file!.name
              a.click()
            }} className="w-full">
              <Download className="h-4 w-4 mr-2" /> Download Compressed Video
            </Button>
          )}
        </>
      )}
    </div>
  )
}

function getExtension(name: string): string {
  const i = name.lastIndexOf(".")
  return i >= 0 ? name.slice(i) : ".mp4"
}

"use client"

import { useState, useRef } from "react"
import { Upload, Download, Crop, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchFile } from "@ffmpeg/util"
import { useFFmpeg } from "@/hooks/use-ffmpeg"
import { toast } from "sonner"

interface Preset {
  label: string
  width: number
  height: number
}

const presets: Record<string, Preset> = {
  "1080p": { label: "1080p (1920x1080)", width: 1920, height: 1080 },
  "720p": { label: "720p (1280x720)", width: 1280, height: 720 },
  "480p": { label: "480p (854x480)", width: 854, height: 480 },
  instagram: { label: "Instagram Square (1080x1080)", width: 1080, height: 1080 },
  tiktok: { label: "TikTok (1080x1920)", width: 1080, height: 1920 },
  shorts: { label: "YouTube Shorts (1080x1920)", width: 1080, height: 1920 },
}

export default function VideoResizer() {
  const { loaded, loading: ffLoading, progress, load, getFFmpeg } = useFFmpeg()
  const [file, setFile] = useState<File | null>(null)
  const [preset, setPreset] = useState("720p")
  const [cropX, setCropX] = useState(0)
  const [cropY, setCropY] = useState(0)
  const [cropW, setCropW] = useState(1920)
  const [cropH, setCropH] = useState(1080)
  const [keepAspect, setKeepAspect] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [procProgress, setProcProgress] = useState(0)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [useCrop, setUseCrop] = useState(false)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setOutputUrl(null)
  }

  async function process() {
    if (!file) return
    if (!loaded) await load()
    setProcessing(true)
    setProcProgress(0)

    try {
      const ffmpeg = getFFmpeg()
      const ext = getExtension(file.name)
      const inputName = "input" + ext
      const outputName = "resized" + ext
      const p = presets[preset]

      await ffmpeg.writeFile(inputName, await fetchFile(file))

      let vf = ""
      if (useCrop && cropW > 0 && cropH > 0) {
        vf = `crop=${cropW}:${cropH}:${cropX}:${cropY}`
      }
      if (keepAspect) {
        const scale = `scale=${p.width}:${p.height}:force_original_aspect_ratio=decrease,pad=${p.width}:${p.height}:(ow-iw)/2:(oh-ih)/2`
        vf = vf ? `${vf},${scale}` : scale
      } else {
        const scale = `scale=${p.width}:${p.height}`
        vf = vf ? `${vf},${scale}` : scale
      }

      const args = ["-i", inputName, "-vf", vf, "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-y", outputName]

      ffmpeg.on("progress", ({ progress: pct }) => {
        setProcProgress(Math.round(pct * 100))
      })

      await ffmpeg.exec(args)

      const data = await ffmpeg.readFile(outputName)
      const blob = new Blob([new Uint8Array(data instanceof Uint8Array ? data : [])], { type: "video/mp4" })
      setOutputUrl(URL.createObjectURL(blob))
      await ffmpeg.deleteFile(inputName)
      await ffmpeg.deleteFile(outputName)
      toast.success("Video resized successfully!")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Resize failed")
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
        <Button onClick={load} className="w-full"><Crop className="h-4 w-4 mr-2" /> Load FFmpeg Engine</Button>
      )}

      {ffLoading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading FFmpeg... {progress}%</div>
          <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      )}

      {loaded && (
        <>
          <Card>
            <CardContent className="p-6">
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm font-medium">{file ? file.name : "Upload Video"}</span>
                <span className="text-xs text-muted-foreground mt-1">Drop a video to resize or crop</span>
                <input type="file" accept="video/*" onChange={handleFile} className="hidden" />
              </label>
            </CardContent>
          </Card>

          {previewUrl && (
            <video src={previewUrl} controls className="w-full max-h-64 rounded-xl" />
          )}

          {file && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Resize Preset</label>
                  <select value={preset} onChange={(e) => setPreset(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    {Object.entries(presets).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={keepAspect} onChange={(e) => setKeepAspect(e.target.checked)} />
                  Maintain aspect ratio
                </label>

                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={useCrop} onChange={(e) => setUseCrop(e.target.checked)} />
                  Enable crop
                </label>

                {useCrop && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">X offset</label>
                      <input type="number" value={cropX} onChange={(e) => setCropX(Number(e.target.value))} className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Y offset</label>
                      <input type="number" value={cropY} onChange={(e) => setCropY(Number(e.target.value))} className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Width</label>
                      <input type="number" value={cropW} onChange={(e) => setCropW(Number(e.target.value))} className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Height</label>
                      <input type="number" value={cropH} onChange={(e) => setCropH(Number(e.target.value))} className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm" />
                    </div>
                  </div>
                )}

                <Button onClick={process} disabled={processing} className="w-full">
                  {processing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing... {procProgress}%</> : "Resize Video"}
                </Button>

                {processing && (
                  <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${procProgress}%` }} /></div>
                )}
              </CardContent>
            </Card>
          )}

          {outputUrl && (
            <Button onClick={() => {
              const a = document.createElement("a"); a.href = outputUrl; a.download = "resized-" + file!.name; a.click()
            }} className="w-full"><Download className="h-4 w-4 mr-2" /> Download Resized Video</Button>
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

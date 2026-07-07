"use client"

import { useState, useRef } from "react"
import { Upload, Download, Image, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchFile } from "@ffmpeg/util"
import { useFFmpeg } from "@/hooks/use-ffmpeg"
import { toast } from "sonner"

export default function VideoToGif() {
  const { loaded, loading: ffLoading, progress, load, getFFmpeg } = useFFmpeg()
  const [file, setFile] = useState<File | null>(null)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(5)
  const [fps, setFps] = useState(10)
  const [width, setWidth] = useState(480)
  const [duration, setDuration] = useState(10)
  const [processing, setProcessing] = useState(false)
  const [procProgress, setProcProgress] = useState(0)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreviewUrl(url)
    setOutputUrl(null)
    const video = document.createElement("video")
    video.preload = "metadata"
    video.src = url
    video.onloadedmetadata = () => {
      setDuration(Math.floor(video.duration))
      setEndTime(Math.min(5, Math.floor(video.duration)))
    }
  }

  function formatTime(s: number): string {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  async function convert() {
    if (!file || startTime >= endTime) return
    if (!loaded) await load()
    setProcessing(true)
    setProcProgress(0)

    try {
      const ffmpeg = getFFmpeg()
      const ext = getExtension(file.name)
      const inputName = "input" + ext
      const outputName = "output.gif"

      await ffmpeg.writeFile(inputName, await fetchFile(file))

      const paletteName = "palette.png"
      await ffmpeg.exec([
        "-ss", String(startTime), "-t", String(endTime - startTime),
        "-i", inputName,
        "-vf", `fps=${fps},scale=${width}:-1:flags=lanczos,palettegen=stats_mode=diff`,
        "-y", paletteName,
      ])

      await ffmpeg.exec([
        "-ss", String(startTime), "-t", String(endTime - startTime),
        "-i", inputName,
        "-i", paletteName,
        "-lavfi", `fps=${fps},scale=${width}:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5`,
        "-y", outputName,
      ])

      const data = await ffmpeg.readFile(outputName)
      const blob = new Blob([new Uint8Array(data instanceof Uint8Array ? data : [])], { type: "image/gif" })
      setOutputUrl(URL.createObjectURL(blob))
      await ffmpeg.deleteFile(inputName)
      await ffmpeg.deleteFile(paletteName)
      await ffmpeg.deleteFile(outputName)
      toast.success("GIF created successfully!")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "GIF creation failed")
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
        <Button onClick={load} className="w-full"><Image className="h-4 w-4 mr-2" /> Load FFmpeg Engine</Button>
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
                <span className="text-xs text-muted-foreground mt-1">Drop a video to convert to GIF</span>
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
                <div className="text-xs text-muted-foreground">Duration: {formatTime(duration)}</div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Start: {formatTime(startTime)}</label>
                  <input type="range" min={0} max={duration} value={startTime} onChange={(e) => setStartTime(Math.min(Number(e.target.value), endTime - 1))} className="w-full" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">End: {formatTime(endTime)}</label>
                  <input type="range" min={1} max={duration} value={endTime} onChange={(e) => setEndTime(Math.max(Number(e.target.value), startTime + 1))} className="w-full" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">FPS: {fps}</label>
                    <input type="range" min={5} max={30} value={fps} onChange={(e) => setFps(Number(e.target.value))} className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Width: {width}px</label>
                    <input type="range" min={120} max={1920} step={10} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full" />
                  </div>
                </div>

                <Button onClick={convert} disabled={processing || startTime >= endTime} className="w-full">
                  {processing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating GIF... {procProgress}%</> : "Create GIF"}
                </Button>

                {processing && (
                  <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${procProgress}%` }} /></div>
                )}
              </CardContent>
            </Card>
          )}

          {outputUrl && (
            <Button onClick={() => {
              const a = document.createElement("a"); a.href = outputUrl; a.download = "output.gif"; a.click()
            }} className="w-full"><Download className="h-4 w-4 mr-2" /> Download GIF</Button>
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

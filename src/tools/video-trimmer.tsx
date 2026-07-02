"use client"

import { useState, useRef } from "react"
import { Upload, Download, Scissors, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchFile } from "@ffmpeg/util"
import { useFFmpeg } from "@/hooks/use-ffmpeg"
import { toast } from "sonner"

export default function VideoTrimmer() {
  const { loaded, loading: ffLoading, progress, load, getFFmpeg } = useFFmpeg()
  const [file, setFile] = useState<File | null>(null)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(30)
  const [duration, setDuration] = useState(60)
  const [processing, setProcessing] = useState(false)
  const [procProgress, setProcProgress] = useState(0)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

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
      setEndTime(Math.min(30, Math.floor(video.duration)))
    }
  }

  function formatTime(s: number): string {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  async function trim() {
    if (!file || startTime >= endTime) return
    if (!loaded) await load()
    setProcessing(true)
    setProcProgress(0)

    try {
      const ffmpeg = getFFmpeg()
      const ext = getExtension(file.name)
      const inputName = "input" + ext
      const outputName = "trimmed" + ext

      await ffmpeg.writeFile(inputName, await fetchFile(file))

      const args = [
        "-ss", String(startTime), "-i", inputName,
        "-t", String(endTime - startTime),
        "-c", "copy", "-y", outputName,
      ]

      ffmpeg.on("progress", ({ progress: p }) => {
        setProcProgress(Math.round(p * 100))
      })

      await ffmpeg.exec(args)

      const data = await ffmpeg.readFile(outputName)
      const blob = new Blob([new Uint8Array(data instanceof Uint8Array ? data : [])], { type: file.type })
      setOutputUrl(URL.createObjectURL(blob))
      await ffmpeg.deleteFile(inputName)
      await ffmpeg.deleteFile(outputName)
      toast.success("Video trimmed successfully!")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Trimming failed")
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
        <Button onClick={load} className="w-full"><Scissors className="h-4 w-4 mr-2" /> Load FFmpeg Engine</Button>
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
                <span className="text-xs text-muted-foreground mt-1">Drop a video to trim</span>
                <input type="file" accept="video/*" onChange={handleFile} className="hidden" />
              </label>
            </CardContent>
          </Card>

          {previewUrl && (
            <video ref={videoRef} src={previewUrl} controls className="w-full max-h-64 rounded-xl" />
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

                <div className="text-xs text-muted-foreground">Selected: {formatTime(endTime - startTime)}</div>

                <Button onClick={trim} disabled={processing || startTime >= endTime} className="w-full">
                  {processing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Trimming... {procProgress}%</> : "Trim Video"}
                </Button>

                {processing && (
                  <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${procProgress}%` }} /></div>
                )}
              </CardContent>
            </Card>
          )}

          {outputUrl && (
            <Button onClick={() => {
              const a = document.createElement("a"); a.href = outputUrl; a.download = "trimmed-" + file!.name; a.click()
            }} className="w-full"><Download className="h-4 w-4 mr-2" /> Download Trimmed Video</Button>
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

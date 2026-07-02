"use client"

import { useState } from "react"
import { Upload, Download, Clapperboard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchFile } from "@ffmpeg/util"
import { useFFmpeg } from "@/hooks/use-ffmpeg"
import { toast } from "sonner"

const formats = [
  { value: "mp4", label: "MP4", mime: "video/mp4", ext: ".mp4" },
  { value: "mov", label: "MOV", mime: "video/quicktime", ext: ".mov" },
  { value: "avi", label: "AVI", mime: "video/x-msvideo", ext: ".avi" },
  { value: "mkv", label: "MKV", mime: "video/x-matroska", ext: ".mkv" },
  { value: "webm", label: "WebM", mime: "video/webm", ext: ".webm" },
]

const codecPresets: Record<string, { vcodec: string; acodec: string }> = {
  h264: { vcodec: "libx264", acodec: "aac" },
  h265: { vcodec: "libx265", acodec: "aac" },
  vp9: { vcodec: "libvpx-vp9", acodec: "libopus" },
  vp8: { vcodec: "libvpx", acodec: "libvorbis" },
}

export default function VideoConverter() {
  const { loaded, loading: ffLoading, progress, load, getFFmpeg } = useFFmpeg()
  const [file, setFile] = useState<File | null>(null)
  const [outputFormat, setOutputFormat] = useState("mp4")
  const [codec, setCodec] = useState("h264")
  const [processing, setProcessing] = useState(false)
  const [procProgress, setProcProgress] = useState(0)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setOutputUrl(null)
  }

  async function convert() {
    if (!file) return
    if (!loaded) await load()
    setProcessing(true)
    setProcProgress(0)

    try {
      const ffmpeg = getFFmpeg()
      const fmt = formats.find((f) => f.value === outputFormat)!
      const codecCfg = codecPresets[codec]
      const inputName = "input" + getExtension(file.name)
      const outputName = "output" + fmt.ext

      await ffmpeg.writeFile(inputName, await fetchFile(file))

      const args = ["-i", inputName, "-c:v", codecCfg.vcodec, "-c:a", codecCfg.acodec, "-y", outputName]

      ffmpeg.on("progress", ({ progress: p }) => {
        setProcProgress(Math.round(p * 100))
      })

      await ffmpeg.exec(args)

      const data = await ffmpeg.readFile(outputName)
      const blob = new Blob([new Uint8Array(data instanceof Uint8Array ? data : [])], { type: fmt.mime })
      setOutputUrl(URL.createObjectURL(blob))
      await ffmpeg.deleteFile(inputName)
      await ffmpeg.deleteFile(outputName)
      toast.success("Video converted successfully!")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Conversion failed")
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
          <Clapperboard className="h-4 w-4 mr-2" /> Load FFmpeg Engine
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
                <span className="text-xs text-muted-foreground mt-1">Drop a video file to convert</span>
                <input type="file" accept="video/*" onChange={handleFile} className="hidden" />
              </label>
            </CardContent>
          </Card>

          {file && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Output Format</label>
                    <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                      {formats.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Codec Preset</label>
                    <select value={codec} onChange={(e) => setCodec(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                      <option value="h264">H.264</option>
                      <option value="h265">H.265 / HEVC</option>
                      <option value="vp9">VP9 (WebM)</option>
                      <option value="vp8">VP8 (WebM)</option>
                    </select>
                  </div>
                </div>

                <Button onClick={convert} disabled={processing} className="w-full">
                  {processing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Converting... {procProgress}%</> : "Convert Video"}
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
              const fmt = formats.find((f) => f.value === outputFormat)!
              a.download = "converted" + fmt.ext
              a.click()
            }} className="w-full">
              <Download className="h-4 w-4 mr-2" /> Download Converted Video
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

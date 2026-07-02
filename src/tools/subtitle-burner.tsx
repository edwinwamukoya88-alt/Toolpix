"use client"

import { useState } from "react"
import { Upload, Download, Subtitles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchFile } from "@ffmpeg/util"
import { useFFmpeg } from "@/hooks/use-ffmpeg"
import { toast } from "sonner"

export default function SubtitleBurner() {
  const { loaded, loading: ffLoading, progress, load, getFFmpeg } = useFFmpeg()
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [subFile, setSubFile] = useState<File | null>(null)
  const [fontSize, setFontSize] = useState(24)
  const [fontColor, setFontColor] = useState("#FFFFFF")
  const [position, setPosition] = useState("bottom")
  const [processing, setProcessing] = useState(false)
  const [procProgress, setProcProgress] = useState(0)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)

  function handleSubFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setSubFile(f)
    setOutputUrl(null)
  }

  function getSubExtension(name: string): string {
    const i = name.lastIndexOf(".")
    return i >= 0 ? name.slice(i).toLowerCase() : ".srt"
  }

  function getPosFilter(pos: string): string {
    switch (pos) {
      case "top": return "x=(w-text_w)/2:y=24"
      case "bottom": return "x=(w-text_w)/2:y=h-text_h-24"
      case "left": return "x=24:y=(h-text_h)/2"
      case "right": return "x=w-text_w-24:y=(h-text_h)/2"
      default: return "x=(w-text_w)/2:y=h-text_h-24"
    }
  }

  async function burn() {
    if (!videoFile || !subFile) return
    if (!loaded) await load()
    setProcessing(true)
    setProcProgress(0)

    try {
      const ffmpeg = getFFmpeg()
      const videoExt = getExtension(videoFile.name)
      const subExt = getSubExtension(subFile.name)
      const inputVideo = "input" + videoExt
      const inputSub = "subtitles" + subExt
      const outputName = "with-subtitles.mp4"

      await ffmpeg.writeFile(inputVideo, await fetchFile(videoFile))
      await ffmpeg.writeFile(inputSub, await fetchFile(subFile))

      const colorHex = fontColor.replace("#", "")
      const posFilter = getPosFilter(position)
      const vf = `subtitles=${inputSub}:force_style='FontSize=${fontSize},PrimaryColour=&H${colorHex}&,Alignment=2'`
      const drawtext = `drawtext=text='':fontsize=${fontSize}:fontcolor=${fontColor}:${posFilter}`
      const filter = `${vf}`

      const args = [
        "-i", inputVideo,
        "-vf", filter,
        "-c:v", "libx264", "-preset", "medium", "-crf", "23",
        "-c:a", "aac", "-b:a", "128k",
        "-y", outputName,
      ]

      ffmpeg.on("progress", ({ progress: p }) => {
        setProcProgress(Math.round(p * 100))
      })

      await ffmpeg.exec(args)

      const data = await ffmpeg.readFile(outputName)
      const blob = new Blob([new Uint8Array(data instanceof Uint8Array ? data : [])], { type: "video/mp4" })
      setOutputUrl(URL.createObjectURL(blob))
      await ffmpeg.deleteFile(inputVideo)
      await ffmpeg.deleteFile(inputSub)
      await ffmpeg.deleteFile(outputName)
      toast.success("Subtitles burned successfully!")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to burn subtitles")
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
        <Button onClick={load} className="w-full"><Subtitles className="h-4 w-4 mr-2" /> Load FFmpeg Engine</Button>
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
            <CardContent className="p-6 space-y-4">
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm font-medium">{videoFile ? videoFile.name : "Upload Video"}</span>
                <input type="file" accept="video/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setVideoFile(f); setOutputUrl(null) } }} className="hidden" />
              </label>

              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm font-medium">{subFile ? subFile.name : "Upload Subtitles (SRT/VTT)"}</span>
                <input type="file" accept=".srt,.vtt" onChange={handleSubFile} className="hidden" />
              </label>
            </CardContent>
          </Card>

          {videoFile && subFile && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Font Size</label>
                    <input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} min={8} max={72} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Font Color</label>
                    <input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} className="w-full h-9 rounded-lg border bg-background px-1" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Position</label>
                  <select value={position} onChange={(e) => setPosition(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    <option value="bottom">Bottom</option>
                    <option value="top">Top</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <Button onClick={burn} disabled={processing} className="w-full">
                  {processing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Burning subtitles... {procProgress}%</> : "Burn Subtitles"}
                </Button>

                {processing && (
                  <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${procProgress}%` }} /></div>
                )}
              </CardContent>
            </Card>
          )}

          {outputUrl && (
            <Button onClick={() => {
              const a = document.createElement("a"); a.href = outputUrl; a.download = "with-subtitles.mp4"; a.click()
            }} className="w-full"><Download className="h-4 w-4 mr-2" /> Download Video with Subtitles</Button>
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

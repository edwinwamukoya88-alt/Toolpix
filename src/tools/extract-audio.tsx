"use client"

import { useState } from "react"
import { Upload, Download, Music, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchFile } from "@ffmpeg/util"
import { useFFmpeg } from "@/hooks/use-ffmpeg"
import { toast } from "sonner"

const audioFormats = [
  { value: "mp3", label: "MP3", mime: "audio/mpeg", ext: ".mp3", codec: "libmp3lame" },
  { value: "wav", label: "WAV", mime: "audio/wav", ext: ".wav", codec: "pcm_s16le" },
  { value: "aac", label: "AAC", mime: "audio/aac", ext: ".aac", codec: "aac" },
]

export default function ExtractAudio() {
  const { loaded, loading: ffLoading, progress, load, getFFmpeg } = useFFmpeg()
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState("mp3")
  const [processing, setProcessing] = useState(false)
  const [procProgress, setProcProgress] = useState(0)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setOutputUrl(null)
  }

  async function extract() {
    if (!file) return
    if (!loaded) await load()
    setProcessing(true)
    setProcProgress(0)

    try {
      const ffmpeg = getFFmpeg()
      const fmt = audioFormats.find((f) => f.value === format)!
      const ext = getExtension(file.name)
      const inputName = "input" + ext
      const outputName = "audio" + fmt.ext

      await ffmpeg.writeFile(inputName, await fetchFile(file))

      const args = ["-i", inputName, "-vn", "-c:a", fmt.codec, "-y", outputName]

      ffmpeg.on("progress", ({ progress: p }) => {
        setProcProgress(Math.round(p * 100))
      })

      await ffmpeg.exec(args)

      const data = await ffmpeg.readFile(outputName)
      const blob = new Blob([new Uint8Array(data instanceof Uint8Array ? data : [])], { type: fmt.mime })
      setOutputUrl(URL.createObjectURL(blob))
      await ffmpeg.deleteFile(inputName)
      await ffmpeg.deleteFile(outputName)
      toast.success("Audio extracted successfully!")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Extraction failed")
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
        <Button onClick={load} className="w-full"><Music className="h-4 w-4 mr-2" /> Load FFmpeg Engine</Button>
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
                <span className="text-xs text-muted-foreground mt-1">Any video format supported</span>
                <input type="file" accept="video/*" onChange={handleFile} className="hidden" />
              </label>
            </CardContent>
          </Card>

          {file && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Audio Format</label>
                  <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    {audioFormats.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>

                <Button onClick={extract} disabled={processing} className="w-full">
                  {processing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Extracting... {procProgress}%</> : "Extract Audio"}
                </Button>

                {processing && (
                  <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${procProgress}%` }} /></div>
                )}
              </CardContent>
            </Card>
          )}

          {outputUrl && (
            <Button onClick={() => {
              const a = document.createElement("a")
              a.href = outputUrl
              const fmt = audioFormats.find((f) => f.value === format)!
              a.download = "extracted-audio" + fmt.ext
              a.click()
            }} className="w-full"><Download className="h-4 w-4 mr-2" /> Download Audio</Button>
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

"use client"

import { useState } from "react"
import { Upload, Download, Layers, Loader2, ArrowUp, ArrowDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchFile } from "@ffmpeg/util"
import { useFFmpeg } from "@/hooks/use-ffmpeg"
import { toast } from "sonner"

export default function MergeVideos() {
  const { loaded, loading: ffLoading, progress, load, getFFmpeg } = useFFmpeg()
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [procProgress, setProcProgress] = useState(0)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const f = Array.from(e.target.files || [])
    if (f.length === 0) return
    setFiles((prev) => [...prev, ...f])
    setOutputUrl(null)
  }

  function moveUp(i: number) {
    if (i === 0) return
    setFiles((prev) => {
      const next = [...prev]; [next[i - 1], next[i]] = [next[i], next[i - 1]]; return next
    })
  }

  function moveDown(i: number) {
    if (i === files.length - 1) return
    setFiles((prev) => {
      const next = [...prev]; [next[i], next[i + 1]] = [next[i + 1], next[i]]; return next
    })
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function merge() {
    if (files.length < 2) return
    if (!loaded) await load()
    setProcessing(true)
    setProcProgress(0)

    try {
      const ffmpeg = getFFmpeg()
      const listName = "files.txt"
      const lines: string[] = []

      for (let i = 0; i < files.length; i++) {
        const ext = getExtension(files[i].name)
        const name = `input${i}${ext}`
        await ffmpeg.writeFile(name, await fetchFile(files[i]))
        lines.push(`file '${name}'`)
      }

      await ffmpeg.writeFile(listName, new TextEncoder().encode(lines.join("\n")))

      const args = ["-f", "concat", "-safe", "0", "-i", listName, "-c", "copy", "-y", "merged.mp4"]

      ffmpeg.on("progress", ({ progress: p }) => {
        setProcProgress(Math.round(p * 100))
      })

      await ffmpeg.exec(args)

      const data = await ffmpeg.readFile("merged.mp4")
      const blob = new Blob([new Uint8Array(data instanceof Uint8Array ? data : [])], { type: "video/mp4" })
      setOutputUrl(URL.createObjectURL(blob))

      for (let i = 0; i < files.length; i++) {
        await ffmpeg.deleteFile(`input${i}${getExtension(files[i].name)}`)
      }
      await ffmpeg.deleteFile(listName)
      await ffmpeg.deleteFile("merged.mp4")
      toast.success("Videos merged successfully!")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Merge failed")
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
        <Button onClick={load} className="w-full"><Layers className="h-4 w-4 mr-2" /> Load FFmpeg Engine</Button>
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
                <span className="text-sm font-medium">{files.length > 0 ? `${files.length} file(s) selected` : "Upload Videos"}</span>
                <span className="text-xs text-muted-foreground mt-1">Select multiple video files to merge</span>
                <input type="file" accept="video/*" multiple onChange={handleFiles} className="hidden" />
              </label>
            </CardContent>
          </Card>

          {files.length > 0 && (
            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="text-xs font-medium mb-2">Video Order ({files.length} files)</div>
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2 text-sm">
                    <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
                    <span className="flex-1 truncate">{f.name}</span>
                    <button onClick={() => moveUp(i)} disabled={i === 0} className="disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
                    <button onClick={() => moveDown(i)} disabled={i === files.length - 1} className="disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
                    <button onClick={() => removeFile(i)}><X className="h-3.5 w-3.5 text-destructive" /></button>
                  </div>
                ))}

                <Button onClick={merge} disabled={processing || files.length < 2} className="w-full mt-2">
                  {processing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Merging... {procProgress}%</> : `Merge ${files.length} Videos`}
                </Button>

                {processing && (
                  <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${procProgress}%` }} /></div>
                )}
              </CardContent>
            </Card>
          )}

          {outputUrl && (
            <Button onClick={() => {
              const a = document.createElement("a"); a.href = outputUrl; a.download = "merged.mp4"; a.click()
            }} className="w-full"><Download className="h-4 w-4 mr-2" /> Download Merged MP4</Button>
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

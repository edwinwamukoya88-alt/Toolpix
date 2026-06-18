"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, Download, Loader2, AlertCircle, Music, Play, Pause, Volume2, Scissors } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import type { FFmpeg } from "@ffmpeg/ffmpeg"

let ffmpegInstance: FFmpeg | null = null

async function getFFmpeg(): Promise<FFmpeg> {
  if (!ffmpegInstance) {
    const { FFmpeg: FF } = await import("@ffmpeg/ffmpeg")
    ffmpegInstance = new FF()
  }
  return ffmpegInstance
}

interface FormatOption {
  value: string
  label: string
  ext: string
  mime: string
  codec: string
}

const FORMATS: FormatOption[] = [
  { value: "mp3", label: "MP3", ext: "mp3", mime: "audio/mpeg", codec: "libmp3lame" },
  { value: "wav", label: "WAV", ext: "wav", mime: "audio/wav", codec: "pcm_s16le" },
  { value: "ogg", label: "OGG", ext: "ogg", mime: "audio/ogg", codec: "libvorbis" },
  { value: "flac", label: "FLAC", ext: "flac", mime: "audio/flac", codec: "flac" },
]

type Status = "idle" | "loading-waveform" | "loading-ffmpeg" | "converting" | "generating" | "ready" | "error"

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toFixed(2).padStart(5, "0")}`
}

function getExtension(name: string): string {
  const i = name.lastIndexOf(".")
  return i >= 0 ? name.slice(i) : ""
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function AudioConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [waveUrl, setWaveUrl] = useState<string | null>(null)
  const [selectedFormat, setSelectedFormat] = useState("mp3")
  const [volume, setVolume] = useState(1)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)
  const [duration, setDuration] = useState(0)
  const [status, setStatus] = useState<Status>("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const [statusError, setStatusError] = useState<string | null>(null)
  const [waveformReady, setWaveformReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<any>(null)
  const regionRef = useRef<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isProcessing =
    status === "loading-waveform" ||
    status === "loading-ffmpeg" ||
    status === "converting" ||
    status === "generating"

  useEffect(() => {
    if (!waveUrl || !waveformRef.current) return

    let cancelled = false

    async function initWaveform() {
      const WaveSurfer = (await import("wavesurfer.js")).default
      const RegionsPlugin = (await import("wavesurfer.js/plugins/regions")).default

      if (cancelled) return

      const ws = WaveSurfer.create({
        container: waveformRef.current!,
        waveColor: "#8b5cf6",
        progressColor: "#a78bfa",
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        height: 120,
        url: waveUrl!,
        minPxPerSec: 1,
        fillParent: true,
        normalize: true,
      })

      const regionsPlugin = ws.registerPlugin(RegionsPlugin.create())

      ws.on("ready", () => {
        if (cancelled) {
          ws.destroy()
          return
        }
        const dur = ws.getDuration()
        setDuration(dur)
        setTrimStart(0)
        setTrimEnd(dur)
        setWaveformReady(true)
        setStatus("idle")

        const region = regionsPlugin.addRegion({
          start: 0,
          end: dur,
          color: "rgba(139, 92, 246, 0.15)",
          resize: true,
          drag: true,
          minLength: 0.1,
        })

        region.on("update-end", () => {
          setTrimStart(region.start)
          setTrimEnd(region.end)
        })

        regionRef.current = region
      })

      ws.on("play", () => setIsPlaying(true))
      ws.on("pause", () => setIsPlaying(false))
      ws.on("finish", () => setIsPlaying(false))

      wavesurferRef.current = ws
    }

    setWaveformReady(false)
    setStatus("loading-waveform")
    setStatusMessage("Loading waveform…")

    initWaveform()

    return () => {
      cancelled = true
      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.destroy()
        } catch {
          /* ignore */
        }
        wavesurferRef.current = null
      }
    }
  }, [waveUrl])

  useEffect(() => {
    if (!file) return
    getFFmpeg().then((ff) => {
      if (!ff.loaded) {
        ff.load({
          coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js",
          wasmURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.wasm",
        }).catch(() => {})
      }
    })
  }, [file])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return

    if (wavesurferRef.current) {
      try {
        wavesurferRef.current.destroy()
      } catch {
        /* ignore */
      }
      wavesurferRef.current = null
    }
    if (waveUrl) URL.revokeObjectURL(waveUrl)

    setFile(f)
    setWaveUrl(URL.createObjectURL(f))
    setStatus("loading-waveform")
    setStatusMessage("Loading waveform…")
    setStatusError(null)
    setWaveformReady(false)
    setIsPlaying(false)
    setDuration(0)
    setTrimStart(0)
    setTrimEnd(0)

    toast.success(`Loaded: ${f.name}`)
    if (e.target) e.target.value = ""
  }

  function togglePlay() {
    const ws = wavesurferRef.current
    if (!ws) return
    if (isPlaying) {
      ws.pause()
    } else {
      ws.play()
    }
  }

  const convert = useCallback(async () => {
    if (!file) return

    const fmt = FORMATS.find((f) => f.value === selectedFormat)
    if (!fmt) {
      setStatusError("Invalid format selected")
      toast.error("Invalid format selected")
      return
    }

    setStatusError(null)

    try {
      const ff = await getFFmpeg()

      if (!ff.loaded) {
        setStatus("loading-ffmpeg")
        setStatusMessage("Loading FFmpeg…")
        await ff.load({
          coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js",
          wasmURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.wasm",
        })
      }

      setStatus("converting")
      setStatusMessage("Converting audio…")

      const inputName = `input${getExtension(file.name)}`
      const outputName = `output.${fmt.ext}`

      const fileData = new Uint8Array(await file.arrayBuffer())
      await ff.writeFile(inputName, fileData)

      const args = ["-i", inputName]

      const filters: string[] = []
      const hasTrim = duration > 0 && (trimStart > 0 || trimEnd < duration)
      const hasVolume = volume !== 1.0

      if (hasTrim) {
        filters.push(`atrim=start=${trimStart}:end=${trimEnd}`)
      }
      if (hasVolume) {
        filters.push(`volume=${volume.toFixed(2)}`)
      }
      if (filters.length > 0) {
        args.push("-af", filters.join(","))
      }

      args.push("-codec:a", fmt.codec, "-y", outputName)

      await ff.exec(args)

      setStatus("generating")
      setStatusMessage("Generating file…")

      const result = await ff.readFile(outputName)
      const blob = new Blob([result as BlobPart], { type: fmt.mime })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      const base = file.name.replace(/\.[^.]+$/, "")
      link.download = `${base}-converted.${fmt.ext}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      await ff.deleteFile(inputName)
      await ff.deleteFile(outputName)

      setStatus("ready")
      setStatusMessage("Download ready")
      toast.success(`Converted to ${fmt.label}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Conversion failed"
      setStatusError(msg)
      setStatus("error")
      setStatusMessage("Conversion failed")
      toast.error(msg)
    }
  }, [file, selectedFormat, volume, trimStart, trimEnd, duration])

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div
          className="relative border-2 border-dashed rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => !isProcessing && inputRef.current?.click()}
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">Upload audio file</p>
          <p className="text-xs text-muted-foreground mb-4">MP3, WAV, OGG, FLAC supported</p>
          <Button variant="outline" className="relative" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>
            Choose Audio
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.flac"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        {file && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <Music className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
              </div>
            </div>

            <div
              ref={waveformRef}
              className="rounded-lg overflow-hidden"
              style={{ minHeight: waveformReady ? 120 : 60 }}
            />
          </div>
        )}

        {!waveformReady && file && (
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading waveform…</span>
          </div>
        )}

        {waveformReady && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button size="sm" variant="outline" onClick={togglePlay} className="shrink-0">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Scissors className="h-3.5 w-3.5 shrink-0" />
                <span>{formatTime(trimStart)}</span>
                <span className="text-muted-foreground/50">–</span>
                <span>{formatTime(trimEnd)}</span>
                <span className="ml-1 text-muted-foreground/60">
                  ({(trimEnd - trimStart).toFixed(1)}s / {duration.toFixed(1)}s)
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-medium text-muted-foreground">Volume</span>
                <span className="text-xs ml-auto tabular-nums">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-muted-foreground/20 accent-[var(--primary)] cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm
                  [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Output Format</label>
                <select
                  value={selectedFormat}
                  onChange={(e) => { setSelectedFormat(e.target.value); setStatus("idle"); setStatusError(null) }}
                  className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  disabled={isProcessing}
                >
                  {FORMATS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end sm:col-span-3">
                <Button className="w-full" onClick={convert} disabled={isProcessing || !waveformReady}>
                  {isProcessing ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {statusMessage}</>
                  ) : status === "ready" ? (
                    <><Download className="h-4 w-4 mr-2" /> Convert Again</>
                  ) : (
                    <><Download className="h-4 w-4 mr-2" /> Convert</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 flex-1">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{statusMessage}</span>
            </div>
            {(status === "loading-ffmpeg" || status === "loading-waveform") && (
              <span className="text-xs text-muted-foreground">(first load may take a moment)</span>
            )}
          </div>
        )}

        {statusError && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{statusError}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

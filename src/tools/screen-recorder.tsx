"use client"

import { useState, useRef, useCallback } from "react"
import { Download, Camera, Mic, MicOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

export default function ScreenRecorder() {
  const [recording, setRecording] = useState(false)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [captureMode, setCaptureMode] = useState<"screen" | "window" | "tab">("screen")
  const [duration, setDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)

  const startRecording = useCallback(async () => {
    try {
      chunksRef.current = []

      const displayStream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: true,
        audio: audioEnabled,
        preferCurrentTab: captureMode === "tab",
      })

      let tracks: MediaStreamTrack[] = [...displayStream.getTracks()]

      if (audioEnabled) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          audioStream.getTracks().forEach((t) => tracks.push(t))
        } catch {
          // mic not available, continue without
        }
      }

      const stream = new MediaStream(tracks)
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm"
      const recorder = new MediaRecorder(stream, { mimeType })

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: "video/webm" })
        setOutputUrl(URL.createObjectURL(blob))
        if (timerRef.current) clearInterval(timerRef.current)
        setDuration(0)
      }

      mediaRecorderRef.current = recorder
      recorder.start(1000)
      setRecording(true)
      setOutputUrl(null)

      timerRef.current = window.setInterval(() => {
        setDuration((d) => d + 1)
      }, 1000)
    } catch (e) {
      if ((e as Error).name !== "NotAllowedError") {
        toast.error("Failed to start recording")
      }
    }
  }, [audioEnabled, captureMode])

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  function formatDuration(s: number): string {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4 text-xs text-muted-foreground">
        Your files never leave your device. All processing happens locally in your browser.
      </div>

      <div className="rounded-xl border bg-card p-4 text-xs text-muted-foreground">
        After clicking Start, you will be prompted to select which screen, window, or tab to share.
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-2">
            {(["screen", "window", "tab"] as const).map((mode) => (
              <Button
                key={mode}
                variant={captureMode === mode ? "default" : "outline"}
                size="sm"
                onClick={() => setCaptureMode(mode)}
                disabled={recording}
              >
                {mode === "screen" ? "Full Screen" : mode === "window" ? "Window" : "Tab"}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
              disabled={recording}
            >
              {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              {audioEnabled ? "Microphone On" : "Microphone Off"}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {!recording ? (
              <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700">
                <Camera className="h-4 w-4 mr-2" /> Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive">
                <Loader2 className="h-4 w-4 mr-2 animate-pulse" /> Stop Recording ({formatDuration(duration)})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {outputUrl && (
        <div className="space-y-2">
          <video src={outputUrl} controls className="w-full max-h-64 rounded-xl" />
          <Button onClick={() => {
            const a = document.createElement("a"); a.href = outputUrl; a.download = "recording.webm"; a.click()
          }} className="w-full"><Download className="h-4 w-4 mr-2" /> Download Recording</Button>
        </div>
      )}
    </div>
  )
}

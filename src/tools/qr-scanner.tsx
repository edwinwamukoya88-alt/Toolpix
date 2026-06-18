"use client"

import { useState, useRef } from "react"
import { Scan, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

export default function QrScanner() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setScanning(true)
    } catch {
      toast.error("Camera access denied or unavailable")
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
    }
    setScanning(false)
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setResult("QR image loaded. Decoding in browser would require a QR library.")
      toast.success("Image loaded successfully")
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-3">
            {!scanning ? (
              <Button onClick={startCamera}>
                <Scan className="h-4 w-4 mr-2" /> Start Camera
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopCamera}>
                Stop Camera
              </Button>
            )}
            <Button variant="outline" className="relative">
              <Upload className="h-4 w-4 mr-2" /> Upload Image
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
            </Button>
          </div>

          {scanning && (
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-md mx-auto rounded-lg border" />
          )}

          {result && (
            <div className="p-4 rounded-lg bg-muted text-sm break-all">
              <p className="font-medium mb-1">Result:</p>
              <p className="text-muted-foreground">{result}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

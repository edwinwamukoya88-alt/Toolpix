"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { ArrowLeft, Download, Pen, Type, Upload, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { signPdf, getPageCount } from "@/lib/pdf/engine"
import { downloadBytes } from "@/lib/pdf/download"

type SignatureSource = "draw" | "type" | "upload"

interface SignaturePlacement {
  id: string
  source: SignatureSource
  imageBytes: Uint8Array
  pageIndex: number
  label: string
}

export default function SignModule({
  files,
  onBack,
}: {
  files: File[]
  onBack: () => void
}) {
  const [pageCount, setPageCount] = useState(0)
  const [signatures, setSignatures] = useState<SignaturePlacement[]>([])
  const [sigSource, setSigSource] = useState<SignatureSource>("type")
  const [typedSig, setTypedSig] = useState("")
  const [uploadedSig, setUploadedSig] = useState<Uint8Array | null>(null)
  const [targetPage, setTargetPage] = useState(1)
  const [processing, setProcessing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const handleFileReady = useCallback(async () => {
    if (files.length === 0) return
    const bytes = await files[0].arrayBuffer()
    const count = await getPageCount(bytes)
    setPageCount(count)
  }, [files])

  useState(() => {
    handleFileReady()
  })

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
    ctx.beginPath()
    ctx.moveTo(x, y)
  }, [])

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.strokeStyle = "#ffffff"
    ctx.lineTo(x, y)
    ctx.stroke()
  }, [isDrawing])

  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
  }, [])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

  const addDrawSignature = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    )
    if (!blob) {
      toast.error("Failed to capture signature")
      return
    }
    const bytes = new Uint8Array(await blob.arrayBuffer())
    setSignatures((prev) => [
      ...prev,
      { id: crypto.randomUUID(), source: "draw", imageBytes: bytes, pageIndex: targetPage - 1, label: `Signature ${prev.length + 1}` },
    ])
    clearCanvas()
    toast.success("Signature added")
  }, [targetPage, clearCanvas])

  const addTypedSignature = useCallback(async () => {
    if (!typedSig.trim()) {
      toast.error("Please type your signature")
      return
    }
    const canvas = document.createElement("canvas")
    canvas.width = 400
    canvas.height = 120
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#000000"
    ctx.font = "48px 'Georgia', serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(typedSig, canvas.width / 2, canvas.height / 2)
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    )
    if (!blob) return
    const bytes = new Uint8Array(await blob.arrayBuffer())
    setSignatures((prev) => [
      ...prev,
      { id: crypto.randomUUID(), source: "type", imageBytes: bytes, pageIndex: targetPage - 1, label: typedSig },
    ])
    setTypedSig("")
    toast.success("Signature added")
  }, [typedSig, targetPage])

  const addUploadSignature = useCallback(async () => {
    if (!uploadedSig) {
      toast.error("Please upload a signature image")
      return
    }
    setSignatures((prev) => [
      ...prev,
      { id: crypto.randomUUID(), source: "upload", imageBytes: uploadedSig, pageIndex: targetPage - 1, label: `Signature ${prev.length + 1}` },
    ])
    toast.success("Signature added")
  }, [uploadedSig, targetPage])

  const removeSignature = useCallback((id: string) => {
    setSignatures((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const handleSign = useCallback(async () => {
    if (files.length === 0) {
      toast.error("No PDF file loaded")
      return
    }
    if (signatures.length === 0) {
      toast.error("Add at least one signature")
      return
    }

    setProcessing(true)
    try {
      const bytes = await files[0].arrayBuffer()
      const baseName = files[0].name.replace(/\.pdf$/i, "")
      const placements = signatures.map((s) => ({
        pageIndex: s.pageIndex,
        x: 50,
        y: 50,
        width: 200,
        height: 60,
        imageBytes: s.imageBytes,
      }))
      const result = await signPdf(bytes, placements)
      downloadBytes(result, `${baseName}_signed.pdf`)
      toast.success(`Signed with ${signatures.length} signature${signatures.length !== 1 ? "s" : ""}`)
    } catch {
      toast.error("Failed to sign PDF")
    } finally {
      setProcessing(false)
    }
  }, [files, signatures])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="text-lg font-semibold">Sign PDF</h3>
          <p className="text-sm text-muted-foreground">
            Add signatures to your PDF document
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {(["draw", "type", "upload"] as const).map((s) => (
          <Button
            key={s}
            variant={sigSource === s ? "default" : "outline"}
            size="sm"
            onClick={() => setSigSource(s)}
            className="flex-1"
          >
            {s === "draw" ? <Pen className="h-4 w-4 mr-1.5" /> : s === "type" ? <Type className="h-4 w-4 mr-1.5" /> : <Upload className="h-4 w-4 mr-1.5" />}
            {s === "draw" ? "Draw" : s === "type" ? "Type" : "Upload"}
          </Button>
        ))}
      </div>

      {sigSource === "draw" && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <canvas
              ref={canvasRef}
              width={400}
              height={150}
              className="w-full rounded-xl border border-border bg-black/40 touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearCanvas}>
                <Trash2 className="h-4 w-4 mr-1" /> Clear
              </Button>
              <div className="flex-1" />
              <Button size="sm" onClick={addDrawSignature}>
                Add to Document
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {sigSource === "type" && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <Input
              type="text"
              placeholder="Type your signature"
              value={typedSig}
              onChange={(e) => setTypedSig(e.target.value)}
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={addTypedSignature}>
                Add to Document
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {sigSource === "upload" && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card/30 p-6 cursor-pointer hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept="image/png,image/jpeg,image/gif"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const bytes = new Uint8Array(await file.arrayBuffer())
                    setUploadedSig(bytes)
                  }
                }}
              />
              <Upload className="h-6 w-6 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">Upload PNG, JPG, or GIF</p>
            </label>
            {uploadedSig && (
              <div className="flex justify-end">
                <Button size="sm" onClick={addUploadSignature}>
                  Add to Document
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Place signature on page
        </label>
        <Input
          type="number"
          min={1}
          max={pageCount || 1}
          value={targetPage}
          onChange={(e) => setTargetPage(Math.min(Math.max(parseInt(e.target.value, 10) || 1, 1), pageCount || 1))}
        />
      </div>

      {signatures.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {signatures.length} signature{signatures.length !== 1 ? "s" : ""} added
          </p>
          <ul className="space-y-2">
            {signatures.map((sig) => (
              <li
                key={sig.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card/30 p-3 text-sm"
              >
                <Pen className="h-4 w-4 text-primary/60 flex-shrink-0" />
                <span className="flex-1 truncate">{sig.label}</span>
                <span className="text-xs text-muted-foreground/50">
                  Page {sig.pageIndex + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeSignature(sig.id)}
                  className="text-muted-foreground/40 hover:text-destructive transition-colors"
                  aria-label="Remove signature"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={handleSign}
        disabled={processing || signatures.length === 0}
      >
        {processing ? "Signing..." : (
          <><Download className="h-4 w-4 mr-2" /> Sign & Download</>
        )}
      </Button>
    </div>
  )
}

"use client"

import { useState, useRef, useMemo, useCallback } from "react"
import { Upload, Download, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import JSZip from "jszip"

interface FileInfo {
  file: File
  originalSize: number
}

type Status = "idle" | "preparing" | "compressing" | "zipping" | "ready" | "error"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function levelToZipLevel(level: number): number {
  return Math.round((level / 100) * 8) + 1
}

function levelToLabel(level: number): string {
  if (level === 0) return "Store only"
  if (level <= 25) return "Low"
  if (level <= 50) return "Medium"
  if (level <= 70) return "Recommended"
  if (level <= 85) return "High"
  return "Maximum"
}

export default function FileCompressor() {
  const [fileInfos, setFileInfos] = useState<FileInfo[]>([])
  const [compressionLevel, setCompressionLevel] = useState(70)
  const [status, setStatus] = useState<Status>("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const [statusError, setStatusError] = useState<string | null>(null)
  const [totalCompressedSize, setTotalCompressedSize] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const totalOriginalSize = useMemo(
    () => fileInfos.reduce((sum, info) => sum + info.originalSize, 0),
    [fileInfos],
  )

  const reductionPercent = useMemo(() => {
    if (totalCompressedSize === null || totalOriginalSize === 0) return null
    return ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100
  }, [totalCompressedSize, totalOriginalSize])

  const isProcessing = status === "preparing" || status === "compressing" || status === "zipping"

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const fs = Array.from(e.target.files || [])
    if (fs.length === 0) return
    const infos: FileInfo[] = fs.map((f) => ({ file: f, originalSize: f.size }))
    setFileInfos((prev) => [...prev, ...infos])
    setTotalCompressedSize(null)
    setStatusError(null)
    if (status === "ready") setStatus("idle")
    toast.success(`${fs.length} file(s) added`)
    if (e.target) e.target.value = ""
  }

  function remove(i: number) {
    setFileInfos((prev) => prev.filter((_, idx) => idx !== i))
    setTotalCompressedSize(null)
    if (fileInfos.length <= 1) setStatus("idle")
  }

  async function compressImage(file: File, level: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(objectUrl)
        try {
          const canvas = document.createElement("canvas")
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          const ctx = canvas.getContext("2d")
          if (!ctx) return reject(new Error("Could not get canvas context"))
          ctx.drawImage(img, 0, 0)
          const quality = Math.max(0.1, 1.0 - (level / 100) * 0.9)
          const mime = file.type === "image/png" ? "image/png" : "image/jpeg"
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob)
              else reject(new Error("Canvas produced no blob"))
            },
            mime,
            mime === "image/png" ? undefined : quality,
          )
        } catch (err) {
          reject(err)
        }
      }
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error("Failed to decode image"))
      }
      img.src = objectUrl
    })
  }

  async function compress() {
    if (fileInfos.length === 0) return
    setStatusError(null)
    setTotalCompressedSize(null)

    setStatus("preparing")
    setStatusMessage("Preparing files…")
    await new Promise((r) => setTimeout(r, 50))

    const zip = new JSZip()
    const zipLevel = levelToZipLevel(compressionLevel)
    const useDeflate = compressionLevel > 0

    setStatus("compressing")
    setStatusMessage("Compressing…")

    try {
      for (const info of fileInfos) {
        const file = info.file
        const isImage = file.type.startsWith("image/") && file.type !== "image/gif"

        if (isImage && compressionLevel > 0) {
          const compressedBlob = await compressImage(file, compressionLevel)
          zip.file(file.name, compressedBlob, {
            compression: "DEFLATE",
            compressionOptions: { level: zipLevel },
          })
        } else {
          zip.file(file.name, file, {
            compression: useDeflate ? "DEFLATE" : "STORE",
            compressionOptions: useDeflate ? { level: zipLevel } : undefined,
          })
        }
      }

      setStatus("zipping")
      setStatusMessage("Generating ZIP…")

      const zipBlob = await zip.generateAsync({ type: "blob" })
      setTotalCompressedSize(zipBlob.size)

      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = "compressed-files.zip"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setStatus("ready")
      setStatusMessage("Download ready")
      toast.success(`ZIP downloaded (${formatSize(zipBlob.size)})`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Compression failed"
      setStatusError(msg)
      setStatus("error")
      setStatusMessage("Compression failed")
      toast.error(msg)
    }
  }

  function resetAll() {
    setFileInfos([])
    setTotalCompressedSize(null)
    setStatusError(null)
    setStatus("idle")
    setStatusMessage("")
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div
          className="relative border-2 border-dashed rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => !isProcessing && inputRef.current?.click()}
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">Upload files to compress</p>
          <p className="text-xs text-muted-foreground mb-4">Creates a ZIP archive (browser-based)</p>
          <Button variant="outline" className="relative" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>
            Choose Files
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Recommended Compression Level</label>
            <span className="text-sm text-muted-foreground">{levelToLabel(compressionLevel)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={compressionLevel}
            onChange={(e) => {
              setCompressionLevel(Number(e.target.value))
              setTotalCompressedSize(null)
              if (status === "ready") setStatus("idle")
            }}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted accent-primary
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Smallest size</span>
            <span>Best quality</span>
          </div>
        </div>

        {fileInfos.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {fileInfos.map((info, i) => (
              <div
                key={`${info.file.name}-${i}`}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-sm truncate">{info.file.name}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatSize(info.originalSize)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="h-6 w-6 shrink-0"
                  onClick={() => remove(i)}
                  disabled={isProcessing}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {fileInfos.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Total: {formatSize(totalOriginalSize)}
              {totalCompressedSize !== null && (
                <>
                  {" → "}{formatSize(totalCompressedSize)}
                  {reductionPercent !== null && (
                    <span className="ml-1 font-medium text-green-600">
                      {reductionPercent >= 0
                        ? `-${reductionPercent.toFixed(1)}% smaller`
                        : `+${Math.abs(reductionPercent).toFixed(1)}% larger`}
                    </span>
                  )}
                </>
              )}
            </span>
            {status === "ready" && totalCompressedSize !== null && (
              <span className="flex items-center gap-1 text-green-600 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ready
              </span>
            )}
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{statusMessage}</span>
          </div>
        )}

        {statusError && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{statusError}</span>
          </div>
        )}

        {fileInfos.length > 0 && (
          <div className="flex gap-2">
            <Button className="flex-1" onClick={compress} disabled={isProcessing}>
              {isProcessing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {statusMessage}</>
              ) : status === "ready" ? (
                <><Download className="h-4 w-4 mr-2" /> Download ZIP Again</>
              ) : (
                <><Download className="h-4 w-4 mr-2" /> Compress & Download ZIP</>
              )}
            </Button>
            {(fileInfos.length > 0 || status === "ready") && (
              <Button variant="outline" onClick={resetAll} disabled={isProcessing}>
                Clear
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

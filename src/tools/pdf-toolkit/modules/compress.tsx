"use client"

import { useState, useCallback } from "react"
import { ArrowLeft, Download, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { compressPdf, bytesToSize } from "@/lib/pdf/engine"
import { downloadBytes } from "@/lib/pdf/download"

type CompressLevel = "low" | "medium" | "high"

const compressInfo: Record<CompressLevel, { label: string; desc: string; expected: string }> = {
  low: { label: "Low", desc: "Minimal size reduction, best quality", expected: "~5-10% smaller" },
  medium: { label: "Medium", desc: "Balanced compression", expected: "~15-30% smaller" },
  high: { label: "High", desc: "Maximum size reduction", expected: "~30-50% smaller" },
}

export default function CompressModule({
  files,
  onBack,
}: {
  files: File[]
  onBack: () => void
}) {
  const [level, setLevel] = useState<CompressLevel>("medium")
  const [processing, setProcessing] = useState(false)
  const [originalSize, setOriginalSize] = useState(0)
  const [resultSize, setResultSize] = useState<number | null>(null)

  useState(() => {
    if (files.length > 0) {
      setOriginalSize(files[0].size)
    }
  })

  const handleCompress = useCallback(async () => {
    if (files.length === 0) {
      toast.error("No PDF file loaded")
      return
    }

    setProcessing(true)
    setResultSize(null)
    try {
      const bytes = await files[0].arrayBuffer()
      const baseName = files[0].name.replace(/\.pdf$/i, "")
      const result = await compressPdf(bytes, { level })
      setResultSize(result.length)
      downloadBytes(result, `${baseName}_compressed.pdf`)
      const saved = ((bytes.byteLength - result.length) / bytes.byteLength * 100).toFixed(0)
      toast.success(`Reduced by ${saved}%`)
    } catch {
      toast.error("Failed to compress PDF")
    } finally {
      setProcessing(false)
    }
  }, [files, level])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="text-lg font-semibold">Compress PDF</h3>
          <p className="text-sm text-muted-foreground">
            Reduce file size while maintaining quality
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <FileDown className="h-4 w-4 text-primary/60" />
            <span className="text-muted-foreground">Original size:</span>
            <span className="font-semibold">{bytesToSize(originalSize)}</span>
          </div>

          {resultSize !== null && (
            <div className="flex items-center gap-2 text-sm">
              <FileDown className="h-4 w-4 text-green-400/60" />
              <span className="text-muted-foreground">Compressed size:</span>
              <span className="font-semibold text-green-400">{bytesToSize(resultSize)}</span>
              <span className="text-xs text-muted-foreground/50">
                ({((originalSize - resultSize) / originalSize * 100).toFixed(0)}% reduction)
              </span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(compressInfo) as [CompressLevel, typeof compressInfo["low"]][]).map(
              ([key, info]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setLevel(key)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    level === key
                      ? "border-primary/50 bg-primary/10"
                      : "border-border bg-card/30 hover:border-muted-foreground/30"
                  }`}
                >
                  <p className="text-sm font-medium">{info.label}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5 leading-relaxed">
                    {info.desc}
                  </p>
                  <p className="text-[10px] text-primary/60 mt-1">{info.expected}</p>
                </button>
              ),
            )}
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleCompress}
            disabled={processing || originalSize === 0}
          >
            {processing ? "Compressing..." : (
              <><Download className="h-4 w-4 mr-2" /> Compress & Download</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

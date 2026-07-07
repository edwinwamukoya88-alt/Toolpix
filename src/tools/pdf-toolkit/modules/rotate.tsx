"use client"

import { useState, useCallback } from "react"
import { ArrowLeft, RotateCw, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { getPageCount, rotateAllPages, rotateSelectedPages } from "@/lib/pdf/engine"
import { downloadBytes } from "@/lib/pdf/download"

export default function RotateModule({
  files,
  onBack,
}: {
  files: File[]
  onBack: () => void
}) {
  const [pageCount, setPageCount] = useState(0)
  const [rotateAll, setRotateAll] = useState(true)
  const [angle, setAngle] = useState<90 | 180 | 270>(90)
  const [selectedPages, setSelectedPages] = useState("")
  const [processing, setProcessing] = useState(false)

  const handleFileReady = useCallback(async () => {
    if (files.length === 0) return
    const bytes = await files[0].arrayBuffer()
    const count = await getPageCount(bytes)
    setPageCount(count)
  }, [files])

  useState(() => {
    handleFileReady()
  })

  const handleRotate = useCallback(async () => {
    if (files.length === 0) {
      toast.error("No PDF file loaded")
      return
    }

    setProcessing(true)
    try {
      const bytes = await files[0].arrayBuffer()
      const baseName = files[0].name.replace(/\.pdf$/i, "")

      let result: Uint8Array
      if (rotateAll) {
        result = await rotateAllPages(bytes, angle)
        toast.success(`Rotated all pages by ${angle}°`)
      } else {
        const indices = selectedPages
          .split(",")
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n) && n >= 1 && n <= pageCount)
        if (indices.length === 0) {
          toast.error("Enter valid page numbers")
          setProcessing(false)
          return
        }
        result = await rotateSelectedPages(bytes, indices.map((n) => n - 1), angle)
        toast.success(`Rotated ${indices.length} page${indices.length !== 1 ? "s" : ""}`)
      }

      downloadBytes(result, `${baseName}_rotated.pdf`)
    } catch {
      toast.error("Failed to rotate PDF")
    } finally {
      setProcessing(false)
    }
  }, [files, rotateAll, angle, selectedPages, pageCount])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="text-lg font-semibold">Rotate PDF</h3>
          <p className="text-sm text-muted-foreground">
            Rotate pages by 90°, 180°, or 270°
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Document has <span className="font-semibold text-foreground">{pageCount}</span> page{pageCount !== 1 ? "s" : ""}
          </p>

          <div className="flex gap-2">
            {([90, 180, 270] as const).map((a) => (
              <Button
                key={a}
                variant={angle === a ? "default" : "outline"}
                size="sm"
                onClick={() => setAngle(a)}
                className="flex-1"
              >
                <RotateCw className={`h-4 w-4 mr-1.5 ${a === 270 ? "scale-x-[-1]" : ""}`} />
                {a}°
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={rotateAll ? "default" : "outline"}
              size="sm"
              onClick={() => setRotateAll(true)}
              className="flex-1"
            >
              All Pages
            </Button>
            <Button
              variant={!rotateAll ? "default" : "outline"}
              size="sm"
              onClick={() => setRotateAll(false)}
              className="flex-1"
            >
              Selected Pages
            </Button>
          </div>

          {!rotateAll && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Page numbers (comma-separated, e.g. 1,3,5)
              </label>
              <Input
                type="text"
                placeholder={`1-${pageCount}`}
                value={selectedPages}
                onChange={(e) => setSelectedPages(e.target.value)}
              />
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleRotate}
            disabled={processing || pageCount === 0}
          >
            {processing ? "Rotating..." : (
              <><Download className="h-4 w-4 mr-2" /> Rotate & Download</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useCallback } from "react"
import { ArrowLeft, Download, FileOutput } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { getPageCount, splitByPageRange, extractPages, splitEveryPage } from "@/lib/pdf/engine"
import { downloadBytes, downloadAsZip } from "@/lib/pdf/download"

type SplitMode = "range" | "extract" | "all"

export default function SplitModule({
  files,
  onBack,
}: {
  files: File[]
  onBack: () => void
}) {
  const [mode, setMode] = useState<SplitMode>("range")
  const [pageCount, setPageCount] = useState(0)
  const [rangeStart, setRangeStart] = useState("1")
  const [rangeEnd, setRangeEnd] = useState("1")
  const [extractPagesInput, setExtractPagesInput] = useState("")
  const [processing, setProcessing] = useState(false)

  const handleFileReady = useCallback(async () => {
    if (files.length === 0) return
    const bytes = await files[0].arrayBuffer()
    const count = await getPageCount(bytes)
    setPageCount(count)
    setRangeEnd(String(count))
  }, [files])

  useState(() => {
    handleFileReady()
  })

  const handleSplit = useCallback(async () => {
    if (files.length === 0) {
      toast.error("No PDF file loaded")
      return
    }

    setProcessing(true)
    try {
      const bytes = await files[0].arrayBuffer()
      const baseName = files[0].name.replace(/\.pdf$/i, "")

      if (mode === "range") {
        const start = Math.max(1, parseInt(rangeStart, 10) || 1)
        const end = Math.min(pageCount, parseInt(rangeEnd, 10) || pageCount)
        if (start > end || start < 1 || end > pageCount) {
          toast.error("Invalid page range")
          setProcessing(false)
          return
        }
        const result = await splitByPageRange(bytes, start - 1, end - 1)
        downloadBytes(result, `${baseName}_pages-${start}-${end}.pdf`)
        toast.success(`Extracted pages ${start}-${end}`)
      } else if (mode === "extract") {
        const indices = extractPagesInput
          .split(",")
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n) && n >= 1 && n <= pageCount)
        if (indices.length === 0) {
          toast.error("Enter valid page numbers")
          setProcessing(false)
          return
        }
        const unique = [...new Set(indices)].map((n) => n - 1)
        const result = await extractPages(bytes, unique)
        downloadBytes(result, `${baseName}_extracted.pdf`)
        toast.success(`Extracted ${unique.length} page${unique.length !== 1 ? "s" : ""}`)
      } else {
        const results = await splitEveryPage(bytes)
        const zipFiles = results.map((b, i) => ({
          bytes: b,
          filename: `${baseName}_page-${i + 1}.pdf`,
        }))
        await downloadAsZip(zipFiles, `${baseName}_all-pages.zip`)
        toast.success(`Split into ${results.length} pages`)
      }
    } catch {
      toast.error("Failed to split PDF")
    } finally {
      setProcessing(false)
    }
  }, [files, mode, rangeStart, rangeEnd, extractPagesInput, pageCount])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="text-lg font-semibold">Split PDF</h3>
          <p className="text-sm text-muted-foreground">
            Extract pages or split into multiple documents
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <FileOutput className="h-4 w-4 text-primary/60" />
            <span className="text-muted-foreground">Document has</span>
            <span className="font-semibold">{pageCount}</span>
            <span className="text-muted-foreground">page{pageCount !== 1 ? "s" : ""}</span>
          </div>

          <div className="flex gap-2">
            {(["range", "extract", "all"] as const).map((m) => (
              <Button
                key={m}
                variant={mode === m ? "default" : "outline"}
                size="sm"
                onClick={() => setMode(m)}
                className="flex-1"
              >
                {m === "range" ? "Page Range" : m === "extract" ? "Extract" : "All Pages"}
              </Button>
            ))}
          </div>

          {mode === "range" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">From</label>
                <Input
                  type="number"
                  min={1}
                  max={pageCount}
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">To</label>
                <Input
                  type="number"
                  min={1}
                  max={pageCount}
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                />
              </div>
            </div>
          )}

          {mode === "extract" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Page numbers (comma-separated, e.g. 1,3,5)
              </label>
              <Input
                type="text"
                placeholder="1, 3, 5-7"
                value={extractPagesInput}
                onChange={(e) => setExtractPagesInput(e.target.value)}
              />
            </div>
          )}

          {mode === "all" && (
            <p className="text-sm text-muted-foreground">
              Split every page into a separate PDF file and download as ZIP.
            </p>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleSplit}
            disabled={processing || pageCount === 0}
          >
            {processing ? "Splitting..." : (
              <><Download className="h-4 w-4 mr-2" /> Split & Download</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

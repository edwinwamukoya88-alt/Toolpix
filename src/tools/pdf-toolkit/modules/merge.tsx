"use client"

import { useState, useCallback } from "react"
import { Upload, X, GripVertical, ArrowLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { mergePdfs, bytesToSize } from "@/lib/pdf/engine"
import { downloadBytes } from "@/lib/pdf/download"

interface FileItem {
  id: string
  file: File
  bytes: ArrayBuffer
}

export default function MergeModule({ onBack }: { onBack: () => void }) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [processing, setProcessing] = useState(false)

  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const items: FileItem[] = []
    for (const f of Array.from(newFiles)) {
      if (f.type !== "application/pdf") {
        toast.error(`${f.name} is not a PDF file`)
        continue
      }
      const bytes = await f.arrayBuffer()
      items.push({ id: crypto.randomUUID(), file: f, bytes })
    }
    setFiles((prev) => [...prev, ...items])
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const moveFile = useCallback((fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }, [])

  const handleMerge = useCallback(async () => {
    if (files.length < 2) {
      toast.error("Please add at least 2 PDF files to merge")
      return
    }
    setProcessing(true)
    try {
      const merged = await mergePdfs(files.map((f) => ({ name: f.file.name, bytes: f.bytes })))
      downloadBytes(merged, "merged-output.pdf")
      toast.success(`Merged ${files.length} PDFs successfully`)
    } catch {
      toast.error("Failed to merge PDFs")
    } finally {
      setProcessing(false)
    }
  }, [files])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="text-lg font-semibold">Merge PDF</h3>
          <p className="text-sm text-muted-foreground">
            Combine multiple PDFs into one document
          </p>
        </div>
      </div>

      <label className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card/50 p-8 cursor-pointer hover:border-primary/50 hover:bg-card/80 transition-colors group">
        <input
          type="file"
          accept="application/pdf"
          multiple
          className="sr-only"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <Upload className="h-8 w-8 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
        <div className="text-center">
          <p className="text-sm font-medium">Drop PDF files here or click to browse</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Multiple files supported</p>
        </div>
      </label>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {files.length} file{files.length !== 1 ? "s" : ""} selected
          </p>
          <ul className="space-y-2">
            {files.map((item, index) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card/30 p-3 text-sm"
              >
                <button
                  type="button"
                  className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                  onMouseDown={() => {
                    const target = index
                    const dropIndex = prompt(
                      `Move "${item.file.name}" to position (1-${files.length}):`,
                      String(index + 1),
                    )
                    if (dropIndex) {
                      const newIndex = Math.min(Math.max(parseInt(dropIndex, 10) - 1, 0), files.length - 1)
                      if (newIndex !== target) moveFile(target, newIndex)
                    }
                  }}
                  aria-label="Reorder file"
                >
                  <GripVertical className="h-4 w-4" />
                </button>
                <FileText className="h-4 w-4 text-primary/60 flex-shrink-0" />
                <span className="flex-1 truncate">{item.file.name}</span>
                <span className="text-xs text-muted-foreground/50">
                  {bytesToSize(item.file.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(item.id)}
                  className="text-muted-foreground/40 hover:text-destructive transition-colors"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={handleMerge}
        disabled={files.length < 2 || processing}
      >
        {processing ? "Merging..." : `Merge ${files.length} PDF${files.length !== 1 ? "s" : ""}`}
      </Button>
    </div>
  )
}

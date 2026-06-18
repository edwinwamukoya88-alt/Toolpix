"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, FileText, AlertCircle, Loader2, CheckCircle2, X, FileDown, File as FileIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

type PageState = "idle" | "dragging" | "processing" | "success" | "error"

export default function DocumentConverter() {
  const [pageState, setPageState] = useState<PageState>("idle")
  const [file, setFile] = useState<File | null>(null)
  const [output, setOutput] = useState<string>("")
  const [error, setError] = useState<string>("")
  const inputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  const reset = useCallback(() => {
    setPageState("idle")
    setFile(null)
    setOutput("")
    setError("")
    if (inputRef.current) inputRef.current.value = ""
  }, [])

  const processFile = useCallback(async (f: File) => {
    if (!f.name.toLowerCase().endsWith(".docx")) {
      setFile(f)
      setPageState("error")
      setError("Unsupported file type. Only .docx files are accepted.")
      return
    }

    setFile(f)
    setPageState("processing")
    setOutput("")
    setError("")

    try {
      const buffer = await f.arrayBuffer()
      const mammoth = await import("mammoth")
      const result = await mammoth.convertToHtml({ arrayBuffer: buffer })
      setOutput(result.value)
      setPageState("success")
    } catch {
      setPageState("error")
      setError("Failed to convert document. The file may be corrupted or incompatible.")
    }
  }, [])

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (dragCounter.current === 1) setPageState("dragging")
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) setPageState("idle")
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = "copy"
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current = 0
    setPageState("idle")
    const f = e.dataTransfer.files?.[0]
    if (f) processFile(f)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) processFile(f)
    if (inputRef.current) inputRef.current.value = ""
  }

  function stripHtml(html: string): string {
    const doc = new DOMParser().parseFromString(html, "text/html")
    return doc.body.textContent || ""
  }

  function downloadAsTxt() {
    const text = stripHtml(output)
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = (file?.name || "document").replace(/\.docx$/i, "") + "-converted.txt"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Text file downloaded")
  }

  async function downloadAsPdf() {
    try {
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF()
      const text = stripHtml(output)
      const lines = doc.splitTextToSize(text, 180)
      let y = 20
      const pageHeight = doc.internal.pageSize.getHeight()
      for (const line of lines) {
        if (y > pageHeight - 20) {
          doc.addPage()
          y = 20
        }
        doc.text(line, 15, y)
        y += 6
      }
      doc.save((file?.name || "document").replace(/\.docx$/i, "") + "-converted.pdf")
      toast.success("PDF downloaded")
    } catch {
      toast.error("Failed to generate PDF")
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept=".docx"
        id="docx-input"
        className="hidden"
        onChange={handleFileSelect}
      />

      {pageState === "success" ? (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm min-w-0">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <span className="font-medium truncate">{file?.name}</span>
                <span className="text-muted-foreground shrink-0">converted</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={downloadAsTxt}>
                  <FileDown className="h-3 w-3 mr-1" /> .txt
                </Button>
                <Button variant="outline" size="sm" onClick={downloadAsPdf}>
                  <FileIcon className="h-3 w-3 mr-1" /> .pdf
                </Button>
                <Button variant="ghost" size="sm" onClick={reset}>
                  <Upload className="h-3 w-3 mr-1" /> New
                </Button>
              </div>
            </div>
            <div
              className="prose prose-sm dark:prose-invert max-w-none border rounded-lg p-4 bg-muted/30 max-h-[500px] overflow-y-auto break-words"
              dangerouslySetInnerHTML={{ __html: output }}
            />
          </CardContent>
        </Card>
      ) : null}

      {pageState === "error" && file && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm min-w-0">
              <FileText className="h-4 w-4 text-destructive shrink-0" />
              <span className="truncate">{file.name}</span>
              <span className="text-xs text-destructive shrink-0">failed</span>
            </div>
            <Button variant="ghost" size="icon" onClick={reset} className="shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 rounded-xl p-12 text-center cursor-pointer transition-all duration-200 select-none
          ${pageState === "dragging"
            ? "border-primary bg-primary/5 scale-[1.02]"
            : pageState === "processing"
            ? "border-muted-foreground/20 bg-muted/10 pointer-events-none"
            : pageState === "error"
            ? "border-destructive/40 bg-destructive/5"
            : "border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/10"
          }
        `}
      >
        {pageState === "processing" ? (
          <div className="space-y-4">
            <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Converting document...</p>
              <p className="text-xs text-muted-foreground truncate max-w-[300px] mx-auto">{file?.name}</p>
            </div>
          </div>
        ) : pageState === "error" ? (
          <div className="space-y-4">
            <AlertCircle className="h-10 w-10 mx-auto text-destructive" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">Conversion failed</p>
              <p className="text-xs text-muted-foreground max-w-[400px] mx-auto">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); reset() }}>
              Try again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className={`h-10 w-10 mx-auto transition-colors ${pageState === "dragging" ? "text-primary" : "text-muted-foreground"}`} />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {pageState === "dragging" ? "Drop your file here" : "Drag & drop your document here"}
              </p>
              <p className="text-xs text-muted-foreground">
                or <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} className="text-primary underline underline-offset-2 hover:no-underline">browse files</button> &middot; .docx only
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

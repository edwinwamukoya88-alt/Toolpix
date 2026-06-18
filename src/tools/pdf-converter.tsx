"use client"

import { useState, useRef, useCallback } from "react"
import { FileText, Type, Loader2, Download, AlertCircle, CheckCircle2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

type PageState = "idle" | "processing" | "success" | "error"

type InputMode = "text" | "file"

export default function PdfConverter() {
  const [pageState, setPageState] = useState<PageState>("idle")
  const [inputMode, setInputMode] = useState<InputMode>("text")
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const reset = useCallback(() => {
    setPageState("idle")
    setText("")
    setFile(null)
    setError("")
    if (inputRef.current) inputRef.current.value = ""
  }, [])

  async function convertToPdf(content: string, fileName: string) {
    setPageState("processing")
    setError("")

    try {
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF()
      const lines = doc.splitTextToSize(content || "(empty content)", 180)
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
      doc.save(fileName.replace(/\.\w+$/, "") + ".pdf")
      setPageState("success")
      toast.success("PDF generated successfully")
    } catch {
      setPageState("error")
      setError("Failed to generate PDF. Please try again.")
    }
  }

  function handleTextConvert() {
    if (!text.trim()) {
      setPageState("error")
      setError("Please enter or paste some text to convert.")
      return
    }
    convertToPdf(text, "text-output")
  }

  async function handleFileConvert() {
    if (!file) return

    try {
      let content = ""
      const ext = file.name.toLowerCase().split(".").pop()

      if (ext === "txt") {
        content = await file.text()
      } else if (ext === "docx") {
        const buffer = await file.arrayBuffer()
        const mammoth = await import("mammoth")
        const result = await mammoth.extractRawText({ arrayBuffer: buffer })
        content = result.value
      } else {
        setPageState("error")
        setError("Unsupported file type. Please upload a .txt or .docx file.")
        return
      }

      convertToPdf(content, file.name)
    } catch {
      setPageState("error")
      setError("Failed to process file. The file may be corrupted or incompatible.")
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    const f = e.dataTransfer.files?.[0]
    if (f) {
      setInputMode("file")
      setFile(f)
      setPageState("idle")
      setError("")
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = "copy"
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) {
      setInputMode("file")
      setFile(f)
      setPageState("idle")
      setError("")
    }
    if (inputRef.current) inputRef.current.value = ""
  }

  const showDropZone = inputMode === "file" && !file
  const showFileInfo = inputMode === "file" && file && pageState !== "processing"

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.docx"
        id="pdf-file-input"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="flex gap-1 rounded-lg border p-1 w-fit bg-muted/30">
        <button
          type="button"
          onClick={() => { setInputMode("text"); setFile(null); setError("") }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${inputMode === "text" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Type className="h-3.5 w-3.5" /> Text
        </button>
        <button
          type="button"
          onClick={() => { setInputMode("file"); setText(""); setError("") }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${inputMode === "file" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}
        >
          <FileText className="h-3.5 w-3.5" /> File
        </button>
      </div>

      {pageState === "success" ? (
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <CheckCircle2 className="h-10 w-10 mx-auto text-green-500" />
            <div className="space-y-1">
              <p className="text-sm font-medium">PDF generated successfully</p>
              <p className="text-xs text-muted-foreground">
                {inputMode === "text" ? "Text has been converted" : `${file?.name} has been converted`}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={reset}>
              <Upload className="h-3 w-3 mr-1" /> Convert another
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {pageState === "error" && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm min-w-0">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <span className="truncate">{error}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setPageState("idle")} className="shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {pageState === "processing" ? (
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Generating PDF...</p>
              <p className="text-xs text-muted-foreground">
                {inputMode === "text" ? "Converting text to PDF" : `Processing ${file?.name}`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : pageState === "idle" && inputMode === "text" ? (
        <Card>
          <CardContent className="p-6 space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here..."
              className="w-full h-48 rounded-lg border bg-muted/30 p-4 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button onClick={handleTextConvert} disabled={!text.trim()}>
              <Download className="h-4 w-4 mr-2" /> Convert to PDF
            </Button>
          </CardContent>
        </Card>
      ) : pageState === "idle" && inputMode === "file" && showDropZone ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 hover:border-primary/50 hover:bg-muted/10 select-none"
        >
          <div className="space-y-4">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Upload a .txt or .docx file</p>
              <p className="text-xs text-muted-foreground">
                or <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} className="text-primary underline underline-offset-2 hover:no-underline">browse files</button>
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {showFileInfo && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm min-w-0">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">{file?.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={handleFileConvert}>
                <Download className="h-3 w-3 mr-1" /> Convert to PDF
              </Button>
              <Button variant="ghost" size="icon" onClick={() => { setFile(null); setError("") }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

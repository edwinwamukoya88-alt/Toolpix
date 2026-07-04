"use client"

import { useState, useCallback, DragEvent } from "react"
import { useParams } from "next/navigation"
import {
  FileSymlink,
  Scissors,
  RotateCw,
  FileDown,
  Lock,
  Unlock,
  Pen,
  Upload,
  FileText,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import MergeModule from "./modules/merge"
import SplitModule from "./modules/split"
import RotateModule from "./modules/rotate"
import CompressModule from "./modules/compress"
import ProtectModule from "./modules/protect"
import UnlockModule from "./modules/unlock"
import SignModule from "./modules/sign"

type FeatureKey =
  | "merge"
  | "split"
  | "rotate"
  | "compress"
  | "protect"
  | "unlock"
  | "sign"

interface FeatureDef {
  key: FeatureKey
  icon: typeof FileSymlink
  name: string
  description: string
}

const features: FeatureDef[] = [
  { key: "merge", icon: FileSymlink, name: "Merge PDF", description: "Combine multiple PDFs into one document" },
  { key: "split", icon: Scissors, name: "Split PDF", description: "Extract pages or split into separate files" },
  { key: "rotate", icon: RotateCw, name: "Rotate PDF", description: "Rotate pages by 90°, 180°, or 270°" },
  { key: "compress", icon: FileDown, name: "Compress PDF", description: "Reduce file size while maintaining quality" },
  { key: "protect", icon: Lock, name: "Protect PDF", description: "Encrypt with a password" },
  { key: "unlock", icon: Unlock, name: "Unlock PDF", description: "Remove password protection" },
  { key: "sign", icon: Pen, name: "Sign PDF", description: "Add drawn, typed, or uploaded signatures" },
]

const slugToFeature: Record<string, FeatureKey> = {
  "pdf-merger": "merge",
  "pdf-splitter": "split",
  "pdf-rotator": "rotate",
  "pdf-compressor": "compress",
  "protect-pdf": "protect",
  "unlock-pdf": "unlock",
  "sign-pdf": "sign",
}

export default function PdfToolkit() {
  const params = useParams()
  const slug = typeof params.slug === "string" ? params.slug : "pdf-merger"
  const defaultFeature = slugToFeature[slug] || "merge"

  const [files, setFiles] = useState<File[]>([])
  const [selectedFeature, setSelectedFeature] = useState<FeatureKey | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const hasFiles = files.length > 0

  const handleFiles = useCallback((fileList: FileList) => {
    const pdfs = Array.from(fileList).filter((f) => f.type === "application/pdf")
    if (pdfs.length === 0) {
      toast.error("Please upload PDF files only")
      return
    }
    setFiles((prev) => [...prev, ...pdfs])
    setSelectedFeature(defaultFeature)
  }, [defaultFeature])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleReset = useCallback(() => {
    setFiles([])
    setSelectedFeature(null)
  }, [])

  const handleFeatureSelect = useCallback((key: FeatureKey) => {
    setSelectedFeature(key)
  }, [])

  if (selectedFeature && hasFiles) {
    const moduleProps = { files, onBack: () => setSelectedFeature(null) }

    switch (selectedFeature) {
      case "merge":
        return <MergeModule onBack={() => setSelectedFeature(null)} />
      case "split":
        return <SplitModule {...moduleProps} />
      case "rotate":
        return <RotateModule {...moduleProps} />
      case "compress":
        return <CompressModule {...moduleProps} />
      case "protect":
        return <ProtectModule {...moduleProps} />
      case "unlock":
        return <UnlockModule {...moduleProps} />
      case "sign":
        return <SignModule {...moduleProps} />
    }
  }

  return (
    <div className="space-y-8">
      {!hasFiles ? (
        <div
          className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 md:p-16 transition-all ${
            dragOver
              ? "border-primary/60 bg-primary/[0.04]"
              : "border-border hover:border-primary/40 hover:bg-card/30"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Upload className="h-8 w-8 text-primary/60" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-lg font-semibold">Drop your PDF here</p>
            <p className="text-sm text-muted-foreground/70">or click to browse files</p>
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="application/pdf"
              multiple
              className="sr-only"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
            <span className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
              <Upload className="h-4 w-4" />
              Select PDF Files
            </span>
          </label>
          <p className="text-xs text-muted-foreground/40">All processing happens locally in your browser</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary/60" />
              </div>
              <div>
                <p className="text-sm font-medium">{files.length} PDF file{files.length !== 1 ? "s" : ""} loaded</p>
                <p className="text-xs text-muted-foreground/60">
                  {files.map((f) => f.name).join(", ").length > 60
                    ? files.map((f) => f.name).join(", ").slice(0, 60) + "..."
                    : files.map((f) => f.name).join(", ")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors underline underline-offset-2"
            >
              Upload different
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <button
                  key={feature.key}
                  type="button"
                  onClick={() => handleFeatureSelect(feature.key)}
                  className="group relative flex flex-col items-start gap-3 rounded-2xl border border-border bg-card/50 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/[0.08] group-hover:bg-primary/[0.12] transition-colors">
                    <Icon className="h-5 w-5 text-primary/60" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{feature.name}</p>
                    <p className="text-xs text-muted-foreground/60 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { Copy, Download, Printer, CheckCheck, Hash, Type, FileText } from "lucide-react"

interface BottomToolbarProps {
  show: boolean
  onCopy: () => void
  onDownload: () => void
  onDownloadDocx: () => void
  onPrint: () => void
  wordCount: number
  charCount: number
  copySuccess: boolean
}

export default function BottomToolbar({
  show,
  onCopy,
  onDownload,
  onDownloadDocx,
  onPrint,
  wordCount,
  charCount,
  copySuccess,
}: BottomToolbarProps) {
  if (!show) return null

  return (
    <div className="sticky bottom-0 z-30 border-t border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-3 py-2.5 scrollbar-none">
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0 min-h-[44px] touch-manipulation"
          aria-label={copySuccess ? "Copied" : "Copy to clipboard"}
        >
          {copySuccess ? (
            <CheckCheck className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{copySuccess ? "Copied" : "Copy"}</span>
        </button>

        <div className="h-6 w-px bg-border/50 shrink-0" />

        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0 min-h-[44px] touch-manipulation"
          aria-label="Download as PDF"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">PDF</span>
        </button>

        <button
          onClick={onDownloadDocx}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0 min-h-[44px] touch-manipulation"
          aria-label="Download as DOCX"
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">DOCX</span>
        </button>

        <div className="h-6 w-px bg-border/50 shrink-0" />

        <button
          onClick={onPrint}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0 min-h-[44px] touch-manipulation"
          aria-label="Print"
        >
          <Printer className="h-4 w-4" />
          <span className="hidden sm:inline">Print</span>
        </button>

        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground shrink-0">
          <span className="flex items-center gap-1" title="Word count">
            <Hash className="h-3.5 w-3.5" />
            <span className="font-medium">{wordCount}</span>
          </span>
          <span className="flex items-center gap-1" title="Character count">
            <Type className="h-3.5 w-3.5" />
            <span className="font-medium">{charCount}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

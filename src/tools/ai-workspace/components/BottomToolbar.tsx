"use client"

import { memo } from "react"
import { Copy, Download, Printer, CheckCheck, Hash, Type, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

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

export default memo(function BottomToolbar({
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
    <div className="sticky bottom-0 z-30 border-t border-border/30 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 safe-bottom">
      <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-2 sm:px-3 py-2 scrollbar-none">
        <div className="flex items-center gap-1 mx-auto sm:mx-0">
          <button
            type="button"
            onClick={onCopy}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all shrink-0 min-w-[44px] min-h-[44px] touch-manipulation border",
              copySuccess
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 scale-[0.97]"
                : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/30 border-border/30 hover:border-border/60"
            )}
            aria-label={copySuccess ? "Copied" : "Copy to clipboard"}
          >
            {copySuccess ? <CheckCheck className="h-4 w-4 transition-transform duration-200 scale-110" /> : <Copy className="h-4 w-4" />}
            <span className="hidden sm:inline">{copySuccess ? "Copied" : "Copy"}</span>
          </button>

          <div className="h-5 w-px bg-border/20 shrink-0" />

          <button
            type="button"
            onClick={onDownload}
            className="flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-medium text-muted-foreground/70 hover:text-foreground hover:bg-muted/30 transition-all shrink-0 min-w-[44px] min-h-[44px] touch-manipulation border border-border/30 hover:border-border/60"
            aria-label="Download as PDF"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          <button
            type="button"
            onClick={onDownloadDocx}
            className="flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-medium text-muted-foreground/70 hover:text-foreground hover:bg-muted/30 transition-all shrink-0 min-w-[44px] min-h-[44px] touch-manipulation border border-border/30 hover:border-border/60"
            aria-label="Download as DOCX"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">DOCX</span>
          </button>

          <div className="h-5 w-px bg-border/20 shrink-0" />

          <button
            type="button"
            onClick={onPrint}
            className="flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-medium text-muted-foreground/70 hover:text-foreground hover:bg-muted/30 transition-all shrink-0 min-w-[44px] min-h-[44px] touch-manipulation border border-border/30 hover:border-border/60"
            aria-label="Print"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>

        <div className="ml-auto hidden sm:flex items-center gap-4 text-xs text-muted-foreground/50 shrink-0">
          <span className="flex items-center gap-1.5 tabular-nums" title="Word count">
            <Hash className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground/60">{wordCount}</span>
          </span>
          <span className="flex items-center gap-1.5 tabular-nums" title="Character count">
            <Type className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground/60">{charCount}</span>
          </span>
        </div>
      </div>
    </div>
  )
})

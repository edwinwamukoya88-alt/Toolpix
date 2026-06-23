"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Image, FileText, Copy, MessageSquare, Globe, ZoomIn } from "lucide-react"
import { toast } from "sonner"
import type { CardType, FormData } from "./cardTypes"
import { cardTypeConfigs } from "./cardTypes"
import { exportPNG, exportPDF, getShareText, shareWhatsApp, shareLinkedIn } from "./utils"

interface ExportPanelProps {
  cardType: CardType
  formData: FormData
  onFullscreen?: () => void
}

export default function ExportPanel({ cardType, formData, onFullscreen }: ExportPanelProps) {
  const config = cardTypeConfigs[cardType]

  const handleExport2x = useCallback(async () => {
    const el = document.getElementById("design-cards-preview")
    if (!el) { toast.error("Preview not found"); return }
    try {
      await exportPNG(el, `${cardType}-card`, config.previewWidth, config.previewHeight, 2)
      toast.success("Exported at 2x resolution")
    } catch {
      toast.error("Export failed")
    }
  }, [cardType, config])

  const handleExport4x = useCallback(async () => {
    const el = document.getElementById("design-cards-preview")
    if (!el) { toast.error("Preview not found"); return }
    try {
      await exportPNG(el, `${cardType}-card`, config.previewWidth, config.previewHeight, 4)
      toast.success("Exported at 4x resolution — print ready")
    } catch {
      toast.error("Export failed")
    }
  }, [cardType, config])

  const handleExportPDF = useCallback(() => {
    const el = document.getElementById("design-cards-preview")
    if (!el) { toast.error("Preview not found"); return }
    try {
      exportPDF(el, `${cardType}-card`, config.previewWidth, config.previewHeight)
      toast.success("PDF exported")
    } catch {
      toast.error("PDF export failed")
    }
  }, [cardType, config])

  const handleCopy = useCallback(() => {
    const text = getShareText(cardType, formData)
    navigator.clipboard.writeText(text)
    toast.success("Text copied")
  }, [cardType, formData])

  const handleWhatsApp = useCallback(() => {
    const text = getShareText(cardType, formData)
    shareWhatsApp(text)
  }, [cardType, formData])

  const handleLinkedIn = useCallback(() => {
    const text = getShareText(cardType, formData)
    shareLinkedIn(text)
  }, [cardType, formData])

  return (
    <div className="space-y-3">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Export</span>

      <div className="grid grid-cols-2 gap-1.5">
        <Button variant="outline" size="sm" className="h-7 gap-1 text-[10px]" onClick={handleExport2x}>
          <Image className="w-3 h-3" /> PNG 2x
        </Button>
        <Button variant="outline" size="sm" className="h-7 gap-1 text-[10px]" onClick={handleExport4x}>
          <Image className="w-3 h-3" /> PNG 4x
        </Button>
        <Button variant="outline" size="sm" className="h-7 gap-1 text-[10px]" onClick={handleExportPDF}>
          <FileText className="w-3 h-3" /> Print PDF
        </Button>
        {onFullscreen && (
          <Button variant="outline" size="sm" className="h-7 gap-1 text-[10px]" onClick={onFullscreen}>
            <ZoomIn className="w-3 h-3" /> Fullscreen
          </Button>
        )}
      </div>

      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest pt-1 block">Share</span>

      <div className="grid grid-cols-3 gap-1.5">
        <Button variant="outline" size="sm" className="h-7 gap-1 text-[10px]" onClick={handleCopy}>
          <Copy className="w-3 h-3" /> Copy
        </Button>
        <Button variant="outline" size="sm" className="h-7 gap-1 text-[10px]" onClick={handleWhatsApp}>
          <MessageSquare className="w-3 h-3" /> Chat
        </Button>
        <Button variant="outline" size="sm" className="h-7 gap-1 text-[10px]" onClick={handleLinkedIn}>
          <Globe className="w-3 h-3" /> In
        </Button>
      </div>

      <div className="pt-1 border-t border-border/30">
        <p className="text-[9px] text-muted-foreground leading-relaxed">
          PNG exports at high resolution for crisp printing. PDF uses print-ready layout.
        </p>
      </div>
    </div>
  )
}

"use client"

import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Maximize2, Minimize2, PanelLeft, PanelRight } from "lucide-react"
import type { CardType, FormData } from "./components/cardTypes"
import { initialFormData, cardTypeConfigs } from "./components/cardTypes"
import type { DesignSettings } from "./components/templates"
import { templatesByType, defaultDesign } from "./components/templates"
import CardForm from "./components/CardForm"
import CardPreview from "./components/CardPreview"
import TemplateSelector from "./components/TemplateSelector"
import ExportPanel from "./components/ExportPanel"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

export default function DesignCardsStudio() {
  const [cardType, setCardType] = useState<CardType>("business")
  const [formData, setFormData] = useState<FormData>(initialFormData.business)
  const [design, setDesign] = useState<DesignSettings>({ ...defaultDesign, ...templatesByType.business[0].design })
  const [selectedTemplate, setSelectedTemplate] = useState(templatesByType.business[0].id)
  const [logo, setLogo] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [templatesOpen, setTemplatesOpen] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)

  const handleTypeChange = useCallback((type: CardType) => {
    setCardType(type)
    setFormData(initialFormData[type])
    const firstTmpl = templatesByType[type][0]
    setSelectedTemplate(firstTmpl.id)
    setDesign({ ...defaultDesign, ...firstTmpl.design })
  }, [])

  const handleSelectTemplate = useCallback((id: string) => {
    setSelectedTemplate(id)
    const tmpl = templatesByType[cardType].find((t) => t.id === id)
    if (tmpl) {
      setDesign({ ...defaultDesign, ...tmpl.design })
    }
  }, [cardType])

  const config = cardTypeConfigs[cardType]

  const zoomIn = () => setZoom((z) => Math.min(z + 25, 200))
  const zoomOut = () => setZoom((z) => Math.max(z - 25, 50))

  const previewContent = (
    <CardPreview cardType={cardType} formData={formData} design={design} logo={logo} zoom={zoom} />
  )

  // Fullscreen dialog
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-white">{config.label} Preview</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-zinc-400" onClick={zoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs text-zinc-400 w-8 text-center">{zoom}%</span>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-zinc-400" onClick={zoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-zinc-400 gap-1" onClick={() => setFullscreen(false)}>
            <Minimize2 className="w-4 h-4" /> Exit
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          {previewContent}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Top toolbar */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/40">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground">{config.label}</h2>
          <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">{config.aspectRatio}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-muted/40 rounded-lg px-2 py-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground" onClick={zoomOut}>
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <span className="text-[11px] text-muted-foreground w-8 text-center font-medium">{zoom}%</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground" onClick={zoomIn}>
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
          </div>
          {/* Sidebar toggles */}
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <PanelLeft className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground" onClick={() => setTemplatesOpen(!templatesOpen)}>
            <PanelRight className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground" onClick={() => setFullscreen(true)}>
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Sidebar — Inputs */}
        {sidebarOpen && (
          <div className="w-full lg:w-[280px] xl:w-[300px] flex-shrink-0 transition-all duration-200">
            <Card className="border-border/40 shadow-sm">
              <CardContent className="p-3.5 space-y-4">
                <CardForm
                  cardType={cardType}
                  formData={formData}
                  onChange={setFormData}
                  onTypeChange={handleTypeChange}
                  onLogoChange={setLogo}
                  logo={logo}
                />
                <div className="border-t border-border/30 pt-4">
                  <ExportPanel cardType={cardType} formData={formData} onFullscreen={() => setFullscreen(true)} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Center — Preview */}
        <div className="flex-1 min-w-0">
          <Card className="border-border/40 shadow-sm h-full">
            <CardContent className="p-0 overflow-hidden rounded-lg">
              {previewContent}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel — Templates + Styles */}
        {templatesOpen && (
          <div className="w-full lg:w-[240px] xl:w-[260px] flex-shrink-0 transition-all duration-200">
            <Card className="border-border/40 shadow-sm">
              <CardContent className="p-3.5 space-y-4">
                <TemplateSelector
                  cardType={cardType}
                  design={design}
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={handleSelectTemplate}
                  onDesignChange={setDesign}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useMemo, type CSSProperties } from "react"
import { cn } from "@/lib/utils"
import type { CardType, FormData, BusinessFormData, WeddingFormData, EventFormData, SocialFormData, CertificateFormData } from "./cardTypes"
import { cardTypeConfigs } from "./cardTypes"
import type { DesignSettings } from "./templates"
import { getCardStyle, getFormDataByType, formatDate, getShadowStyle, getPaperTextureSvg } from "./utils"

interface CardPreviewProps {
  cardType: CardType
  formData: FormData
  design: DesignSettings
  logo?: string | null
  zoom: number
}

export default function CardPreview({ cardType, formData, design, logo, zoom }: CardPreviewProps) {
  const config = cardTypeConfigs[cardType]
  const data = getFormDataByType(cardType, formData)
  const cardStyle = useMemo(() => getCardStyle(design), [design])
  const shadowStyle = useMemo(() => getShadowStyle(design.shadowLevel), [design.shadowLevel])

  const baseW = config.previewWidth
  const baseH = config.previewHeight

  const previewScale = Math.min(zoom / 100, 2)

  return (
    <div className="flex items-center justify-center w-full h-full min-h-[420px] bg-gradient-to-br from-slate-50/60 to-slate-100/60 dark:from-slate-900/60 dark:to-slate-800/60 rounded-xl relative overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
        backgroundImage: `linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)`,
        backgroundSize: `${20 / previewScale}px ${20 / previewScale}px`,
      }} />

      {/* Card frame */}
      <div
        id="design-cards-preview"
        className="relative transition-all duration-200"
        style={{
          width: baseW,
          height: baseH,
          maxWidth: "95%",
          maxHeight: "95%",
          transform: `scale(${previewScale})`,
          transformOrigin: "center center",
        }}
      >
        {/* Shadow layer */}
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{ ...shadowStyle, borderRadius: cardStyle.borderRadius }}
        />

        {/* Lighting effect overlay */}
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none z-10"
          style={{
            background: `linear-gradient(145deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(0,0,0,0.04) 80%)`,
            borderRadius: cardStyle.borderRadius,
          }}
        />

        {/* Paper texture */}
        {design.paperTexture && (
          <div
            className="absolute inset-0 rounded-[inherit] pointer-events-none z-20 mix-blend-multiply"
            style={{
              backgroundImage: `url("${getPaperTextureSvg(design.bgColor)}")`,
              backgroundSize: "200px 200px",
              borderRadius: cardStyle.borderRadius,
              opacity: 0.4,
            }}
          />
        )}

        {/* Card content */}
        <div style={cardStyle} className="relative z-5">
          <CardContentRenderer cardType={cardType} data={data} design={design} logo={logo} />
        </div>

        {/* Watermark */}
        {design.showWatermark && (
          <div
            className="absolute bottom-2 right-3 text-[8px] tracking-[0.5px] opacity-30 pointer-events-none z-30"
            style={{ color: design.textColor, fontFamily: "system-ui, sans-serif" }}
          >
            Design Cards Studio
          </div>
        )}
      </div>
    </div>
  )
}

function CardContentRenderer({
  cardType,
  data,
  design,
  logo,
}: {
  cardType: CardType
  data: BusinessFormData | WeddingFormData | EventFormData | SocialFormData | CertificateFormData
  design: DesignSettings
  logo?: string | null
}) {
  const accentStyle: CSSProperties = { color: design.accentColor }
  const iconColor = design.accentColor

  const renderIcon = () => {
    if (design.iconStyle === "none") return null
    const iconMap: Record<string, string> = { star: "★", diamond: "◆", crown: "♛", heart: "♥", leaf: "☘", bolt: "⚡" }
    const icon = iconMap[design.iconStyle]
    if (!icon) return null
    return <div className="text-2xl mb-1" style={{ color: iconColor }}>{icon}</div>
  }

  const renderLogo = () => {
    if (design.logoPosition === "none") return null
    if (logo) {
      return (
        <div className={cn("mb-2", design.logoPosition === "center" ? "flex justify-center" : "flex justify-start")}>
          <img src={logo} alt="Logo" className="h-8 w-auto object-contain" />
        </div>
      )
    }
    return null
  }

  switch (cardType) {
    case "business": {
      const d = data as BusinessFormData
      return (
        <div className="flex flex-col h-full">
          {renderLogo()}
          <div className="flex-1 flex flex-col justify-center gap-0.5">
            {renderIcon()}
            <div className="text-lg font-bold" style={{ fontFamily: "inherit", fontWeight: 700 }}>{d.name}</div>
            <div className="text-xs font-medium" style={{ ...accentStyle, fontFamily: "inherit" }}>{d.jobTitle}</div>
            <div className="text-[10px] opacity-60" style={{ fontFamily: "inherit" }}>{d.company}</div>
            <div className="mt-1.5 text-[10px] space-y-0.5 opacity-55" style={{ fontFamily: "inherit" }}>
              {d.email && <div>{d.email}</div>}
              {d.phone && <div>{d.phone}</div>}
              {d.website && <div>{d.website}</div>}
              {d.address && <div>{d.address}</div>}
            </div>
          </div>
        </div>
      )
    }
    case "wedding": {
      const d = data as WeddingFormData
      return (
        <div className="flex flex-col items-center justify-center h-full gap-1">
          {renderLogo()}
          {renderIcon()}
          <div className="text-2xl font-bold tracking-wider" style={{ fontFamily: "inherit" }}>{d.coupleNames}</div>
          <div className="w-12 h-px" style={{ background: design.accentColor, opacity: 0.5 }} />
          <div className="text-xs" style={{ fontFamily: "inherit", opacity: 0.8 }}>{formatDate(d.weddingDate)}</div>
          <div className="text-[10px]" style={{ fontFamily: "inherit", opacity: 0.6 }}>{d.venue}</div>
          {d.message && <div className="text-[10px] mt-0.5 max-w-[85%] text-center italic" style={{ fontFamily: "inherit", opacity: 0.7 }}>{d.message}</div>}
          {d.rsvpContact && <div className="text-[10px] mt-0.5" style={{ ...accentStyle, fontFamily: "inherit" }}>RSVP: {d.rsvpContact}</div>}
        </div>
      )
    }
    case "event": {
      const d = data as EventFormData
      return (
        <div className="flex flex-col items-center justify-center h-full gap-1">
          {renderLogo()}
          {renderIcon()}
          <div className="text-xl font-bold" style={{ fontFamily: "inherit" }}>{d.eventName}</div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: design.accentColor + "20", color: design.accentColor, fontFamily: "inherit" }}>
            {d.dateTime}
          </div>
          <div className="text-[10px] opacity-60" style={{ fontFamily: "inherit" }}>{d.location}</div>
          {d.description && <div className="text-[10px] mt-0.5 max-w-[85%] text-center opacity-70" style={{ fontFamily: "inherit" }}>{d.description}</div>}
        </div>
      )
    }
    case "social": {
      const d = data as SocialFormData
      return (
        <div className="flex flex-col items-center justify-center h-full gap-1 px-3">
          {renderLogo()}
          {renderIcon()}
          <div className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: "inherit" }}>{d.title}</div>
          <div className="text-xs opacity-80 max-w-[90%] text-center" style={{ fontFamily: "inherit" }}>{d.message}</div>
          {d.ctaText && (
            <div className="mt-1 px-4 py-1 rounded-full text-xs font-semibold" style={{ background: design.accentColor, color: "#ffffff", fontFamily: "inherit" }}>
              {d.ctaText}
            </div>
          )}
        </div>
      )
    }
    case "certificate": {
      const d = data as CertificateFormData
      return (
        <div className="flex flex-col items-center justify-center h-full gap-0.5 px-5">
          {renderLogo()}
          {renderIcon()}
          <div className="text-[9px] uppercase tracking-[2px] opacity-40" style={{ fontFamily: "inherit" }}>Certificate of Achievement</div>
          <div className="w-14 h-px my-0.5" style={{ background: design.accentColor, opacity: 0.4 }} />
          <div className="text-xl font-bold" style={{ fontFamily: "inherit" }}>{d.recipientName}</div>
          <div className="text-xs text-center max-w-[90%]" style={{ fontFamily: "inherit", opacity: 0.8 }}>{d.achievementTitle}</div>
          <div className="w-12 h-px my-0.5" style={{ background: design.accentColor, opacity: 0.3 }} />
          <div className="text-[10px]" style={{ fontFamily: "inherit", opacity: 0.5 }}>Issued by {d.issuerName}</div>
          <div className="text-[10px]" style={{ fontFamily: "inherit", opacity: 0.5 }}>{formatDate(d.date)}</div>
        </div>
      )
    }
    default:
      return null
  }
}

import type { CardType, FormData } from "./cardTypes"
import type { BusinessFormData, WeddingFormData, EventFormData, SocialFormData, CertificateFormData } from "./cardTypes"
import type { DesignSettings } from "./templates"

const fontStacks: Record<string, string> = {
  sans: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  serif: '"Playfair Display", Georgia, "Times New Roman", serif',
  montserrat: '"Montserrat", "Helvetica Neue", Arial, sans-serif',
  poppins: '"Poppins", system-ui, sans-serif',
}

const fontWeightMap: Record<string, string> = {
  light: "300",
  normal: "400",
  medium: "500",
  bold: "700",
}

const letterSpacingMap: Record<string, string> = {
  tight: "-0.02em",
  normal: "0em",
  wide: "0.05em",
  wider: "0.1em",
}

const spacingMap: Record<string, string> = {
  compact: "0.5rem",
  normal: "1rem",
  spacious: "1.75rem",
}

const borderMap: Record<string, string> = {
  none: "none",
  thin: `2px solid var(--accent, #3b82f6)`,
  double: `4px double var(--accent, #3b82f6)`,
  luxury: `3px solid var(--accent, #d97706)`,
}

const radiusMap: Record<string, string> = {
  none: "0px",
  small: "8px",
  medium: "16px",
  premium: "24px",
}

const shadowMap: Record<string, string> = {
  none: "none",
  light: "0 2px 12px rgba(0,0,0,0.08)",
  medium: "0 8px 32px rgba(0,0,0,0.12)",
  deep: "0 16px 48px rgba(0,0,0,0.2)",
}

export function getFontStack(fontFamily: string): string {
  return fontStacks[fontFamily] || fontStacks.sans
}

export function getFontWeight(fontWeight: string): string {
  return fontWeightMap[fontWeight] || fontWeightMap.normal
}

export function getLetterSpacing(letterSpacing: string): string {
  return letterSpacingMap[letterSpacing] || letterSpacingMap.normal
}

export function getCardStyle(design: DesignSettings): React.CSSProperties {
  const bg = design.bgStyle === "gradient"
    ? `linear-gradient(135deg, ${design.gradientStart}, ${design.gradientEnd})`
    : design.bgColor

  const border = borderMap[design.borderStyle] || borderMap.none
    .replace("var(--accent)", design.accentColor)

  const borderColor = design.borderStyle === "luxury"
    ? design.accentColor
    : design.borderStyle !== "none" ? design.accentColor : undefined

  return {
    background: bg,
    color: design.textColor,
    fontFamily: getFontStack(design.fontFamily),
    fontWeight: getFontWeight(design.fontWeight),
    letterSpacing: getLetterSpacing(design.letterSpacing),
    textAlign: design.textAlign as React.CSSProperties["textAlign"],
    border: design.borderStyle !== "none" ? `${borderMap[design.borderStyle]?.replace("var(--accent)", design.accentColor) || "none"}` : "none",
    borderColor: borderColor,
    borderRadius: radiusMap[design.borderRadius] || radiusMap.small,
    boxShadow: shadowMap[design.shadowLevel] || shadowMap.medium,
    padding: spacingMap[design.spacing] || spacingMap.normal,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxSizing: "border-box",
    overflow: "hidden",
    position: "relative",
  }
}

export function getPaperTextureSvg(bgColor: string): string {
  return `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E`
}

export function getShadowStyle(level: string): React.CSSProperties {
  switch (level) {
    case "none": return { boxShadow: "none" }
    case "light": return { boxShadow: "0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)" }
    case "medium": return { boxShadow: "0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)" }
    case "deep": return { boxShadow: "0 16px 48px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)" }
    default: return {}
  }
}

export function getFormDataByType(cardType: CardType, formData: FormData) {
  switch (cardType) {
    case "business": return formData as BusinessFormData
    case "wedding": return formData as WeddingFormData
    case "event": return formData as EventFormData
    case "social": return formData as SocialFormData
    case "certificate": return formData as CertificateFormData
  }
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return ""
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  } catch {
    return dateStr
  }
}

export function getShareText(cardType: CardType, formData: FormData): string {
  switch (cardType) {
    case "business": {
      const d = formData as BusinessFormData
      return `${d.name} · ${d.jobTitle} at ${d.company}\n📧 ${d.email} · 📞 ${d.phone}`
    }
    case "wedding": {
      const d = formData as WeddingFormData
      return `💍 ${d.coupleNames} · ${formatDate(d.weddingDate)} 📍 ${d.venue}`
    }
    case "event": {
      const d = formData as EventFormData
      return `📅 ${d.eventName} · ${d.dateTime} 📍 ${d.location}`
    }
    case "social": {
      const d = formData as SocialFormData
      return `${d.title}\n\n${d.message}\n\n${d.ctaText}`
    }
    case "certificate": {
      const d = formData as CertificateFormData
      return `🏆 ${d.recipientName} · ${d.achievementTitle} · ${d.issuerName}`
    }
  }
}

export function exportPNG(
  element: HTMLElement | null,
  filename: string,
  width: number,
  height: number,
  scale: number = 2
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!element) { reject(new Error("No element")); return }

    const canvas = document.createElement("canvas")
    canvas.width = width * scale
    canvas.height = height * scale
    const ctx = canvas.getContext("2d")
    if (!ctx) { reject(new Error("No context")); return }

    const html = element.outerHTML
      .replace(/style="[^"]*"/g, (match) => {
        return match.replace(/font-family:\s*[^;]+;?/g, (fm) => {
          return fm.includes("font-family") ? fm : match
        })
      })

    const svgData = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;transform-origin:top left;transform:scale(${scale})">
            ${html}
          </div>
        </foreignObject>
      </svg>
    `

    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const img = new Image()

    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      const link = document.createElement("a")
      link.download = `${filename}${scale > 1 ? `@${scale}x` : ""}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      resolve()
    }
    img.onerror = reject
    img.src = url
  })
}

export function exportPDF(
  element: HTMLElement | null,
  filename: string,
  width: number,
  height: number
): void {
  if (!element) return

  const canvas = document.createElement("canvas")
  const scale = 4
  canvas.width = width * scale
  canvas.height = height * scale
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const html = element.outerHTML
  const svgData = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;transform-origin:top left;transform:scale(${scale})">
          ${html}
        </div>
      </foreignObject>
    </svg>
  `

  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const img = new Image()

  img.onload = () => {
    ctx.drawImage(img, 0, 0)
    URL.revokeObjectURL(url)

    import("jspdf").then(({ default: jsPDF }) => {
      const orient = width > height ? "landscape" : "portrait"
      const pdf = new jsPDF({ orientation: orient, unit: "px", format: [width, height] })
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, width, height)
      pdf.save(`${filename}.pdf`)
    })
  }
  img.src = url
}

export function shareWhatsApp(text: string): void {
  const encoded = encodeURIComponent(text)
  window.open(`https://wa.me/?text=${encoded}`, "_blank")
}

export function shareLinkedIn(text: string): void {
  const encoded = encodeURIComponent(text)
  window.open(`https://www.linkedin.com/sharing/share-offsite/?summary=${encoded}`, "_blank")
}

import { ImageResponse } from "next/og"

export const runtime = "edge"

const categoryColors: Record<string, { bg: string; accent: string }> = {
  Productivity: { bg: "#1e40af", accent: "#7c3aed" },
  "CBC Education": { bg: "#047857", accent: "#2563eb" },
  Education: { bg: "#047857", accent: "#2563eb" },
  Technology: { bg: "#1e293b", accent: "#0891b2" },
  Finance: { bg: "#065f46", accent: "#d97706" },
  Design: { bg: "#be185d", accent: "#7c3aed" },
  Business: { bg: "#312e81", accent: "#d97706" },
  Security: { bg: "#1e293b", accent: "#3b82f6" },
  "File Conversion": { bg: "#0d9488", accent: "#4f46e5" },
  "Education & CBC Tools": { bg: "#047857", accent: "#2563eb" },
  "Security & Text": { bg: "#1e293b", accent: "#3b82f6" },
  "QR & Connectivity": { bg: "#0d9488", accent: "#0891b2" },
  "Developer Tools": { bg: "#1e293b", accent: "#6366f1" },
  "Design & Creative": { bg: "#be185d", accent: "#7c3aed" },
  "Finance Tools": { bg: "#065f46", accent: "#d97706" },
  Tool: { bg: "#1e40af", accent: "#7c3aed" },
}

function getCategoryColor(category: string) {
  return categoryColors[category] || { bg: "#1f2937", accent: "#3b82f6" }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get("title") || "ToolForge"
  const category = searchParams.get("category") || "Tool"
  const type = searchParams.get("type") || "blog"

  const colors = getCategoryColor(category)
  const subtitle = type === "tool" ? "ToolForge Tools" : "ToolForge Blog"

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.accent} 100%)`,
          fontFamily: '"Inter"',
          padding: "60px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "8px 20px",
              borderRadius: "9999px",
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.9)",
              fontSize: "24px",
              fontWeight: 500,
              backdropFilter: "blur(8px)",
            }}
          >
            {category}
          </span>
        </div>
        <h1
          style={{
            fontSize: "52px",
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.2,
            textShadow: "0 2px 20px rgba(0,0,0,0.3)",
            margin: 0,
            maxWidth: "900px",
          }}
        >
          {title}
        </h1>
        <div
          style={{
            marginTop: "40px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "rgba(255,255,255,0.6)",
            fontSize: "20px",
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "40px",
            display: "flex",
            gap: "8px",
            opacity: 0.15,
          }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "white",
              }}
            />
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}

import { ImageResponse } from "next/og"
import { getBlogCategoryStyle } from "@/lib/blog-og-config"

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
  "Network Monitoring": { bg: "#0e7490", accent: "#06b6d4" },
  "Essential Calculators": { bg: "#065f46", accent: "#d97706" },
  Multimedia: { bg: "#dc2626", accent: "#9333ea" },
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

  if (type === "blog") {
    return generateBlogOG(title, category)
  }

  return generateToolOG(title, category)
}

async function generateBlogOG(title: string, category: string) {
  const style = getBlogCategoryStyle(category)
  const { from, to } = style.gradient

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
          fontFamily: '"Inter"',
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Abstract geometric background shapes */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-200px",
            left: "-100px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "-60px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 60%)`,
          }}
        />

        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            opacity: "0.06",
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Decorative floating shapes */}
        <div
          style={{
            position: "absolute",
            top: "60px",
            right: "80px",
            width: "80px",
            height: "80px",
            border: "2px solid rgba(255,255,255,0.1)",
            borderRadius: "16px",
            transform: "rotate(15deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "100px",
            right: "200px",
            width: "40px",
            height: "40px",
            border: "2px solid rgba(255,255,255,0.08)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "200px",
            left: "80px",
            width: "60px",
            height: "60px",
            border: "2px solid rgba(255,255,255,0.06)",
            borderRadius: "12px",
            transform: "rotate(-10deg)",
          }}
        />

        {/* Content container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "60px 80px",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Top bar: Logo + Category badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  color: "white",
                }}
              >
                T
              </div>
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: "-0.5px",
                }}
              >
                ToolForge
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 20px",
                borderRadius: "9999px",
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span style={{ fontSize: "18px" }}>{style.icon}</span>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {category}
              </span>
            </div>
          </div>

          {/* Center: Icon + Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              gap: "32px",
            }}
          >
            {/* Decorative icon container */}
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "24px",
                background: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                dangerouslySetInnerHTML={{ __html: style.iconSvg }}
              />
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: title.length > 50 ? "38px" : "48px",
                fontWeight: 800,
                color: "#ffffff",
                textAlign: "center",
                lineHeight: 1.2,
                letterSpacing: "-1px",
                maxWidth: "900px",
                margin: 0,
                textShadow: "0 2px 24px rgba(0,0,0,0.2)",
              }}
            >
              {title}
            </h1>
          </div>

          {/* Bottom: Branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: "rgba(255,255,255,0.4)",
              fontSize: "16px",
              fontWeight: 500,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            <span>toolforge.app</span>
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
            <span>Privacy-First Browser Tools</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}

async function generateToolOG(title: string, category: string) {
  const colors = getCategoryColor(category)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.accent} 100%)`,
          fontFamily: '"Inter"',
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorations */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-100px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 70%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-50px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "0",
            opacity: "0.05",
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "60px 80px",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                color: "white",
              }}
            >
              T
            </div>
            <span style={{ fontSize: "20px", fontWeight: 700, color: "white" }}>
              ToolForge
            </span>
          </div>

          {/* Center */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              gap: "20px",
            }}
          >
            <div
              style={{
                padding: "8px 24px",
                borderRadius: "9999px",
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.1)",
                fontSize: "20px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.9)",
              }}
            >
              {category}
            </div>
            <h1
              style={{
                fontSize: "52px",
                fontWeight: 800,
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
                marginTop: "16px",
                color: "rgba(255,255,255,0.6)",
                fontSize: "20px",
                fontWeight: 500,
              }}
            >
              ToolForge Tools
            </div>
          </div>

          {/* Bottom */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.35)",
              fontSize: "14px",
              fontWeight: 500,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            toolforge.app
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}

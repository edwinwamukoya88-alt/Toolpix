"use client"

import { cn } from "@/lib/utils"
import { deserializeCover, type CoverPattern } from "@/lib/blog-types"
import { useMemo, useId } from "react"

const legacyGradients: Record<string, string> = {
  "gradient-1": "from-blue-600/20 via-purple-600/10 to-cyan-600/20",
  "gradient-2": "from-emerald-600/20 via-teal-600/10 to-green-600/20",
  "gradient-3": "from-orange-600/20 via-amber-600/10 to-yellow-600/20",
  "gradient-4": "from-pink-600/20 via-rose-600/10 to-red-600/20",
  "gradient-5": "from-indigo-600/20 via-violet-600/10 to-blue-600/20",
  "gradient-6": "from-slate-600/20 via-gray-600/10 to-zinc-600/20",
}

const legacyIcons: Record<string, string> = {
  "gradient-1": "📘",
  "gradient-2": "⚡",
  "gradient-3": "🔐",
  "gradient-4": "🎨",
  "gradient-5": "📄",
  "gradient-6": "📁",
}

const legacyLabels: Record<string, string> = {
  "gradient-1": "CBC Education",
  "gradient-2": "Productivity",
  "gradient-3": "Security",
  "gradient-4": "Design",
  "gradient-5": "Guide",
  "gradient-6": "File Tools",
}

const tailwindColors: Record<string, string> = {
  "blue-600": "#2563eb", "blue-500": "#3b82f6", "blue-800": "#1e40af", "blue-900": "#1e3a5f",
  "purple-600": "#9333ea", "purple-500": "#a855f7",
  "cyan-600": "#0891b2", "cyan-500": "#06b6d4", "cyan-800": "#155e75", "cyan-900": "#164e63",
  "indigo-600": "#4f46e5", "indigo-500": "#6366f1", "indigo-700": "#4338ca", "indigo-800": "#3730a3",
  "violet-600": "#7c3aed", "violet-500": "#8b5cf6",
  "emerald-600": "#059669", "emerald-700": "#047857",
  "teal-600": "#0d9488", "teal-500": "#14b8a6",
  "green-600": "#16a34a", "green-700": "#15803d", "green-800": "#166534",
  "amber-600": "#d97706", "amber-700": "#b45309", "amber-800": "#92400e",
  "yellow-600": "#ca8a04", "yellow-700": "#a16207",
  "pink-600": "#db2777", "pink-500": "#ec4899",
  "rose-600": "#e11d48", "rose-500": "#f43f5e",
  "fuchsia-600": "#c026d3",
  "orange-600": "#ea580c",
  "slate-600": "#475569", "slate-700": "#334155", "slate-800": "#1e293b", "slate-900": "#0f172a",
  "gray-500": "#6b7280", "gray-600": "#4b5563", "gray-700": "#374151", "gray-800": "#1f2937", "gray-900": "#111827",
  "zinc-600": "#52525b",
  "sky-500": "#0ea5e9",
  "black": "#000000",
}

function extractColor(tailwindClass: string): string {
  const parts = tailwindClass.replace(/^(from|to|via)-/, "").split("/")
  return tailwindColors[parts[0]] || "#4b5563"
}

function buildGradientStyle(fromClass: string, toClass: string): string {
  const from = extractColor(fromClass)
  const to = extractColor(toClass)
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`
}

function PatternOverlay({ pattern, id }: { pattern: CoverPattern; id: string }) {
  const patternId = `pattern-${id}`

  const patternEl = useMemo(() => {
    switch (pattern) {
      case "calendar-grid":
        return (
          <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id={patternId} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                <rect width="15" height="15" fill="none" stroke="white" strokeWidth="0.5" rx="2" />
                <rect x="2" y="2" width="11" height="3" fill="white" opacity="0.15" rx="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill={`url(#${patternId})`} />
          </svg>
        )
      case "book-lines":
        return (
          <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id={patternId} x="0" y="0" width="20" height="24" patternUnits="userSpaceOnUse">
                <line x1="4" y1="6" x2="16" y2="6" stroke="white" strokeWidth="0.5" opacity="0.6" />
                <line x1="4" y1="10" x2="16" y2="10" stroke="white" strokeWidth="0.5" opacity="0.4" />
                <line x1="4" y1="14" x2="16" y2="14" stroke="white" strokeWidth="0.5" opacity="0.6" />
                <line x1="4" y1="18" x2="16" y2="18" stroke="white" strokeWidth="0.5" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill={`url(#${patternId})`} />
          </svg>
        )
      case "dot-grid":
        return (
          <svg className="absolute inset-0 w-full h-full opacity-[0.1]" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id={patternId} x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle cx="6" cy="6" r="1" fill="white" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill={`url(#${patternId})`} />
          </svg>
        )
      case "bar-chart":
        return (
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id={patternId} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect x="2" y="8" width="4" height="10" fill="white" opacity="0.5" rx="1" />
                <rect x="8" y="4" width="4" height="14" fill="white" opacity="0.7" rx="1" />
                <rect x="14" y="10" width="4" height="8" fill="white" opacity="0.4" rx="1" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill={`url(#${patternId})`} />
          </svg>
        )
      case "circles":
        return (
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id={patternId} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="8" fill="none" stroke="white" strokeWidth="0.5" opacity="0.6" />
                <circle cx="12" cy="12" r="4" fill="white" opacity="0.15" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill={`url(#${patternId})`} />
          </svg>
        )
      case "checker":
        return (
          <svg className="absolute inset-0 w-full h-full opacity-[0.05]" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id={patternId} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                <rect width="8" height="8" fill="white" opacity="0.4" />
                <rect x="8" y="8" width="8" height="8" fill="white" opacity="0.4" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill={`url(#${patternId})`} />
          </svg>
        )
      case "crosshatch":
        return (
          <svg className="absolute inset-0 w-full h-full opacity-[0.05]" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id={patternId} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="20" y2="20" stroke="white" strokeWidth="0.5" opacity="0.4" />
                <line x1="20" y1="0" x2="0" y2="20" stroke="white" strokeWidth="0.5" opacity="0.4" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill={`url(#${patternId})`} />
          </svg>
        )
      case "diamond":
        return (
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id={patternId} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <polygon points="12,0 24,12 12,24 0,12" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill={`url(#${patternId})`} />
          </svg>
        )
      case "waves":
        return (
          <svg className="absolute inset-0 w-full h-full opacity-[0.05]" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id={patternId} x="0" y="0" width="30" height="20" patternUnits="userSpaceOnUse">
                <path d="M0,10 Q7.5,0 15,10 Q22.5,20 30,10" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill={`url(#${patternId})`} />
          </svg>
        )
      case "stars":
        return (
          <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id={patternId} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                <polygon points="15,2 18,11 27,11 20,17 23,26 15,21 7,26 10,17 3,11 12,11" fill="white" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill={`url(#${patternId})`} />
          </svg>
        )
    }
  }, [pattern, patternId])

  return patternEl
}

interface BlogCoverImageProps {
  coverImage: string
  title?: string
  className?: string
  size?: "card" | "featured" | "article"
}

export default function BlogCoverImage({ coverImage, title, className, size = "card" }: BlogCoverImageProps) {
  const uid = useId()
  const parsed = deserializeCover(coverImage)

  if (parsed) {
    const [fromClass, toClass] = parsed.gradient
    const gradientStyle = buildGradientStyle(fromClass, toClass)
    const shadowStyle = {
      boxShadow: `inset 0 0 60px ${parsed.shadowColor}, 0 4px 20px ${parsed.shadowColor}40`,
    }

    return (
      <div
        className={cn(
          "group relative overflow-hidden",
          size === "article" ? "rounded-2xl" : size === "featured" ? "rounded-2xl" : "rounded-xl",
          className,
        )}
        style={{ aspectRatio: "16/9" }}
      >
        <div className="absolute inset-0" style={{ background: gradientStyle }} />
        <div className="absolute inset-0" style={shadowStyle} />
        <PatternOverlay pattern={parsed.pattern} id={uid} />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 py-8 text-center">
          <span className={cn(
            "mb-2 drop-shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
            size === "article" ? "text-5xl md:text-6xl" : size === "featured" ? "text-4xl md:text-5xl" : "text-3xl",
          )}>
            {parsed.icon}
          </span>
          {title && (
            <h3 className={cn(
              "font-bold leading-tight drop-shadow-lg",
              size === "article" ? "text-xl md:text-2xl lg:text-3xl max-w-2xl" :
              size === "featured" ? "text-base md:text-lg max-w-md" :
              "text-xs max-w-[95%]",
              parsed.textColor,
            )}>
              {title}
            </h3>
          )}
        </div>

        <div className={cn("absolute z-10", size === "article" ? "top-4 left-4" : "bottom-3 left-3")}>
          <span className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium backdrop-blur-sm",
            parsed.badgeClass,
          )}>
            {parsed.label}
          </span>
        </div>
      </div>
    )
  }

  if (coverImage.startsWith("/")) {
    return (
      <div
        className={cn(
          "relative overflow-hidden",
          size === "article" ? "rounded-2xl" : size === "featured" ? "rounded-2xl" : "rounded-xl",
          className,
        )}
        style={{ aspectRatio: "16/9" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coverImage} alt={title || "Cover image"} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
      </div>
    )
  }

  const gradient = legacyGradients[coverImage]
  if (gradient) {
    return (
      <div
        className={cn(
          "group relative flex items-center justify-center overflow-hidden",
          size === "article" ? "rounded-2xl" : size === "featured" ? "rounded-2xl" : "rounded-xl",
          className,
        )}
        style={{ aspectRatio: "16/9" }}
      >
        <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        <div className="relative flex flex-col items-center gap-2 z-10">
          <span className="text-4xl md:text-5xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">{legacyIcons[coverImage] || "📄"}</span>
          {size !== "card" && title && (
            <span className="text-xs text-muted-foreground max-w-[80%] text-center truncate">{title}</span>
          )}
        </div>
        <div className={cn("absolute z-10", size === "article" ? "top-4 left-4" : "bottom-4 left-4")}>
          <span className="inline-flex items-center rounded-full border bg-background/80 backdrop-blur-sm px-3 py-0.5 text-xs font-medium text-muted-foreground">
            {legacyLabels[coverImage] || "Guide"}
          </span>
        </div>
      </div>
    )
  }

  return null
}

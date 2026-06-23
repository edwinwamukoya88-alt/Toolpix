export interface BlogAI {
  score: number
  badge: string
  internalLinks: number
  aiType: string
  aiTags: string[]
  aiConfidenceBoost: boolean
  signals: {
    contentType: string
    intent: string
    depth: string
    readability: string
    extractable: boolean
  }
}

export interface ImageMeta {
  imagePrompt: string
  imageAlt: string
  imageTitle: string
  imageKeywords: string
}

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author: string
  category: string
  tags: string[]
  featured: boolean
  coverImage: string
  content: string
  readingTime: number
  ai: BlogAI
  imagePrompt: string
  imageAlt: string
  imageTitle: string
  imageKeywords: string
}

export interface BlogMeta {
  slug: string
  title: string
  description: string
  date: string
  author: string
  category: string
  tags: string[]
  featured: boolean
  coverImage: string
  readingTime: number
  ai: BlogAI
  imagePrompt: string
  imageAlt: string
  imageTitle: string
  imageKeywords: string
}

export type CoverPattern =
  | "calendar-grid"
  | "book-lines"
  | "dot-grid"
  | "bar-chart"
  | "circles"
  | "checker"
  | "crosshatch"
  | "diamond"
  | "waves"
  | "stars"

export interface CoverConfig {
  gradient: [string, string]
  icon: string
  label: string
  pattern: CoverPattern
  textColor: string
  badgeClass: string
  shadowColor: string
}

export function serializeCover(config: CoverConfig): string {
  return JSON.stringify({
    g: config.gradient.join(","),
    i: config.icon,
    l: config.label,
    p: config.pattern,
    t: config.textColor,
    b: config.badgeClass,
    s: config.shadowColor,
  })
}

export function deserializeCover(value: string): CoverConfig | null {
  if (!value || !value.startsWith("{")) return null
  try {
    const parsed = JSON.parse(value)
    const gradients = (parsed.g as string).split(",")
    return {
      gradient: [gradients[0] || "gray-500", gradients[1] || "blue-600"] as [string, string],
      icon: parsed.i || "📄",
      label: parsed.l || "Guide",
      pattern: (parsed.p as CoverPattern) || "diamond",
      textColor: parsed.t || "text-white",
      badgeClass: parsed.b || "bg-gray-500/20 text-gray-200 border-gray-400/30",
      shadowColor: parsed.s || "rgba(107,114,128,0.3)",
    }
  } catch {
    return null
  }
}

export const blogCategories = [
  "CBC Education",
  "Productivity",
  "Security",
  "Developer",
  "Finance",
  "Design",
  "File Conversion",
  "Technology",
  "Business",
]

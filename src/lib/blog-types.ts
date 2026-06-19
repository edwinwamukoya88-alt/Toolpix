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
}

export interface CoverConfig {
  gradient: [string, string]
  icon: string
  label: string
}

export function serializeCover(config: CoverConfig): string {
  return JSON.stringify({
    g: config.gradient.join(","),
    i: config.icon,
    l: config.label,
  })
}

export function deserializeCover(value: string): CoverConfig | null {
  if (!value.startsWith("{")) return null
  try {
    const parsed = JSON.parse(value)
    const gradients = (parsed.g as string).split(",")
    return {
      gradient: [gradients[0] || "gray-500", gradients[1] || "blue-600"] as [string, string],
      icon: parsed.i || "📄",
      label: parsed.l || "Guide",
    }
  } catch {
    return null
  }
}

export function generateCoverConfig(title: string, style: string): CoverConfig {
  const normalized = style.toLowerCase()

  if (normalized.includes("cbc") || normalized.includes("education")) {
    return { gradient: ["green-500", "blue-600"], icon: "📘", label: "CBC Education" }
  }
  if (normalized.includes("productivity")) {
    return { gradient: ["purple-500", "orange-500"], icon: "⚡", label: "Productivity" }
  }
  if (normalized.includes("security")) {
    return { gradient: ["blue-800", "black"], icon: "🔐", label: "Security" }
  }
  if (normalized.includes("developer")) {
    return { gradient: ["gray-700", "blue-600"], icon: "💻", label: "Developer" }
  }
  if (normalized.includes("finance")) {
    return { gradient: ["green-600", "yellow-600"], icon: "💰", label: "Finance" }
  }
  if (normalized.includes("design")) {
    return { gradient: ["pink-500", "purple-500"], icon: "🎨", label: "Design" }
  }
  if (normalized.includes("file") || normalized.includes("conversion")) {
    return { gradient: ["teal-500", "indigo-600"], icon: "📁", label: "File Tools" }
  }
  return { gradient: ["gray-500", "blue-500"], icon: "📄", label: "Guide" }
}

export const blogCategories = [
  "CBC Education",
  "Productivity",
  "Security",
  "Developer",
  "Finance",
  "Design",
  "File Conversion",
]

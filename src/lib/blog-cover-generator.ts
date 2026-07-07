import type { CoverPattern, CoverConfig, ImageMeta } from "./blog-types"

export interface CategoryDesign {
  gradients: [string, string, string][]
  icon: string
  label: string
  pattern: CoverPattern
  textColor: string
  badgeClass: string
  shadowColor: string
}

export const categoryDesigns: Record<string, CategoryDesign> = {
  Productivity: {
    gradients: [
      ["from-blue-600", "via-purple-600", "to-cyan-600"],
      ["from-indigo-600", "via-blue-600", "to-violet-600"],
      ["from-blue-500", "via-sky-500", "to-purple-600"],
    ],
    icon: "⚡",
    label: "Productivity",
    pattern: "calendar-grid",
    textColor: "text-white",
    badgeClass: "bg-blue-500/20 text-blue-200 border-blue-400/30",
    shadowColor: "rgba(59,130,246,0.3)",
  },
  "CBC Education": {
    gradients: [
      ["from-emerald-600", "via-teal-600", "to-blue-600"],
      ["from-green-600", "via-emerald-600", "to-cyan-600"],
      ["from-teal-600", "via-cyan-600", "to-blue-500"],
    ],
    icon: "📚",
    label: "Education",
    pattern: "book-lines",
    textColor: "text-white",
    badgeClass: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
    shadowColor: "rgba(16,185,129,0.3)",
  },
  Technology: {
    gradients: [
      ["from-slate-800", "via-gray-800", "to-cyan-900"],
      ["from-gray-900", "via-slate-800", "to-blue-900"],
      ["from-slate-700", "via-gray-800", "to-cyan-800"],
    ],
    icon: "💻",
    label: "Technology",
    pattern: "dot-grid",
    textColor: "text-white",
    badgeClass: "bg-cyan-500/20 text-cyan-200 border-cyan-400/30",
    shadowColor: "rgba(6,182,212,0.3)",
  },
  Finance: {
    gradients: [
      ["from-emerald-700", "via-green-700", "to-amber-700"],
      ["from-green-800", "via-emerald-700", "to-yellow-700"],
      ["from-emerald-600", "via-green-600", "to-amber-600"],
    ],
    icon: "📈",
    label: "Finance",
    pattern: "bar-chart",
    textColor: "text-white",
    badgeClass: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
    shadowColor: "rgba(52,211,153,0.3)",
  },
  Design: {
    gradients: [
      ["from-pink-600", "via-rose-600", "to-purple-600"],
      ["from-fuchsia-600", "via-pink-600", "to-violet-600"],
      ["from-rose-500", "via-pink-500", "to-purple-500"],
    ],
    icon: "🎨",
    label: "Design",
    pattern: "circles",
    textColor: "text-white",
    badgeClass: "bg-pink-500/20 text-pink-200 border-pink-400/30",
    shadowColor: "rgba(236,72,153,0.3)",
  },
  Business: {
    gradients: [
      ["from-indigo-800", "via-blue-800", "to-amber-800"],
      ["from-slate-800", "via-indigo-800", "to-amber-700"],
      ["from-indigo-700", "via-blue-700", "to-amber-600"],
    ],
    icon: "💼",
    label: "Business",
    pattern: "checker",
    textColor: "text-white",
    badgeClass: "bg-indigo-500/20 text-indigo-200 border-indigo-400/30",
    shadowColor: "rgba(99,102,241,0.3)",
  },
  Security: {
    gradients: [
      ["from-slate-700", "via-blue-800", "to-cyan-900"],
      ["from-gray-800", "via-slate-900", "to-blue-800"],
      ["from-slate-600", "via-blue-700", "to-cyan-800"],
    ],
    icon: "🛡️",
    label: "Security",
    pattern: "crosshatch",
    textColor: "text-white",
    badgeClass: "bg-slate-500/20 text-slate-200 border-slate-400/30",
    shadowColor: "rgba(100,116,139,0.3)",
  },
  "File Conversion": {
    gradients: [
      ["from-teal-600", "via-indigo-600", "to-violet-600"],
      ["from-cyan-600", "via-teal-600", "to-indigo-600"],
      ["from-teal-500", "via-indigo-500", "to-violet-500"],
    ],
    icon: "📁",
    label: "File Tools",
    pattern: "diamond",
    textColor: "text-white",
    badgeClass: "bg-teal-500/20 text-teal-200 border-teal-400/30",
    shadowColor: "rgba(45,212,191,0.3)",
  },
}

const defaultDesign: CategoryDesign = {
  gradients: [
    ["from-gray-600", "via-blue-600", "to-indigo-600"] as [string, string, string],
    ["from-slate-600", "via-gray-600", "to-blue-600"] as [string, string, string],
    ["from-gray-500", "via-blue-500", "to-indigo-500"] as [string, string, string],
  ],
  icon: "📄",
  label: "Guide",
  pattern: "diamond",
  textColor: "text-white",
  badgeClass: "bg-gray-500/20 text-gray-200 border-gray-400/30",
  shadowColor: "rgba(107,114,128,0.3)",
}

export function getCategoryDesign(category: string): CategoryDesign {
  const normalized = category.toLowerCase().trim()
  for (const [key, design] of Object.entries(categoryDesigns)) {
    if (key.toLowerCase() === normalized) return design
  }
  if (normalized.includes("productivity") || normalized.includes("time") || normalized.includes("routine")) {
    return categoryDesigns.Productivity
  }
  if (normalized.includes("education") || normalized.includes("cbc") || normalized.includes("learning") || normalized.includes("student") || normalized.includes("lesson") || normalized.includes("scheme")) {
    return categoryDesigns["CBC Education"]
  }
  if (normalized.includes("tech") || normalized.includes("developer") || normalized.includes("code") || normalized.includes("ai") || normalized.includes("software")) {
    return categoryDesigns.Technology
  }
  if (normalized.includes("finance") || normalized.includes("money") || normalized.includes("budget") || normalized.includes("invest")) {
    return categoryDesigns.Finance
  }
  if (normalized.includes("design") || normalized.includes("creative") || normalized.includes("art") || normalized.includes("ui") || normalized.includes("ux")) {
    return categoryDesigns.Design
  }
  if (normalized.includes("business") || normalized.includes("startup") || normalized.includes("corporate") || normalized.includes("management")) {
    return categoryDesigns.Business
  }
  if (normalized.includes("security") || normalized.includes("privacy") || normalized.includes("safe") || normalized.includes("protect")) {
    return categoryDesigns.Security
  }
  if (normalized.includes("file") || normalized.includes("conversion") || normalized.includes("convert") || normalized.includes("image") || normalized.includes("pdf")) {
    return categoryDesigns["File Conversion"]
  }
  return defaultDesign
}

function pickGradient(design: CategoryDesign, seed: string): [string, string] {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i)
  const index = Math.abs(hash) % design.gradients.length
  const g = design.gradients[index]
  return [g[0], g[2]]
}

export function generateCoverConfig(title: string, category: string, tags: string[] = []): CoverConfig {
  const design = getCategoryDesign(category)
  const seed = `${title}|${tags.join(",")}`
  const gradient = pickGradient(design, seed)

  return {
    gradient,
    icon: design.icon,
    label: design.label,
    pattern: design.pattern,
    textColor: design.textColor,
    badgeClass: design.badgeClass,
    shadowColor: design.shadowColor,
  }
}

export function generateImageMetadata(
  title: string,
  description: string,
  category: string,
  tags: string[],
): ImageMeta {
  const design = getCategoryDesign(category)
  const altText = `${title} ${design.label.toLowerCase()}`
  const promptParts: string[] = [
    ...buildPromptFromTitle(title, design.label),
    `professional ${design.label.toLowerCase()} theme`,
    `premium editorial illustration`,
  ]
  if (tags.length > 0) promptParts.push(tags.slice(0, 3).join(", "))

  return {
    imagePrompt: promptParts.join(", "),
    imageAlt: altText.slice(0, 120),
    imageTitle: `${title} - Featured Image`,
    imageKeywords: [title, design.label, ...tags.slice(0, 3)].join(", ").slice(0, 200),
  }
}

function buildPromptFromTitle(title: string, label: string): string[] {
  const lower = title.toLowerCase()
  const parts: string[] = []

  if (label === "Productivity") {
    parts.push("Professional productivity workspace with organized calendar blocks")
    if (lower.includes("time")) parts.push("laptop showing time-blocked schedule, focus mode environment")
    if (lower.includes("task") || lower.includes("todo") || lower.includes("routine")) parts.push("checklist and task management setup")
    parts.push("clean desk setup, modern productivity aesthetic, premium lighting")
    parts.push("blue and purple productivity theme")
  } else if (label === "Education") {
    parts.push("Modern educational environment with books and learning materials")
    if (lower.includes("cbc") || lower.includes("competency")) parts.push("competency-based curriculum materials, assessment tools")
    if (lower.includes("lesson") || lower.includes("scheme")) parts.push("lesson plan documents, teaching resources")
    if (lower.includes("revision") || lower.includes("exam")) parts.push("study materials, revision notes, exam preparation")
    parts.push("academic atmosphere, green and blue professional palette")
  } else if (label === "Technology") {
    parts.push("Modern technology workspace with code on screen")
    if (lower.includes("ai") || lower.includes("artificial")) parts.push("AI-powered dashboard, neural network visualization")
    if (lower.includes("tool") || lower.includes("app")) parts.push("digital tools interface, modern application design")
    parts.push("dark tech aesthetic, neon blue and cyan accents")
  } else if (label === "Finance") {
    parts.push("Professional financial workspace with charts and analytics")
    if (lower.includes("budget") || lower.includes("saving")) parts.push("budget planning documents, savings visualization")
    if (lower.includes("invest")) parts.push("investment portfolio dashboard, market data")
    parts.push("corporate professional style, green and blue premium palette")
  } else if (label === "Design") {
    parts.push("Creative design studio with color swatches and tools")
    if (lower.includes("card") || lower.includes("brand")) parts.push("brand identity materials, card designs")
    parts.push("artistic atmosphere, modern creative layout")
    parts.push("pink and purple artistic theme")
  } else if (label === "Business") {
    parts.push("Premium business environment with strategic documents")
    if (lower.includes("meeting") || lower.includes("team")) parts.push("collaborative meeting space, team strategy session")
    if (lower.includes("growth") || lower.includes("strategy")) parts.push("growth charts, strategic planning documents")
    parts.push("professional corporate setting, navy and gold premium styling")
  } else if (label === "Security") {
    parts.push("Modern security environment with protection systems")
    if (lower.includes("privacy")) parts.push("privacy protection tools, data security visualization")
    parts.push("professional cybersecurity aesthetic, slate and blue technical theme")
  } else {
    parts.push(`Professional ${label.toLowerCase()} workspace`)
    parts.push("clean modern design, premium quality")
  }

  return parts
}

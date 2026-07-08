export interface BlogCategoryStyle {
  gradient: { from: string; to: string }
  bg: string
  accent: string
  icon: string
  iconSvg: string
}

export const BLOG_CATEGORY_STYLES: Record<string, BlogCategoryStyle> = {
  Productivity: {
    gradient: { from: "#1e40af", to: "#7c3aed" },
    bg: "#1e40af",
    accent: "#7c3aed",
    icon: "⚡",
    iconSvg: `<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><path d="M36 4L12 36H28L24 60L52 26H36L40 4Z" fill="white" opacity="0.9"/></svg>`,
  },
  "CBC Education": {
    gradient: { from: "#047857", to: "#2563eb" },
    bg: "#047857",
    accent: "#2563eb",
    icon: "📚",
    iconSvg: `<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><rect x="8" y="12" width="48" height="6" rx="3" fill="white" opacity="0.9"/><rect x="8" y="24" width="40" height="6" rx="3" fill="white" opacity="0.7"/><rect x="8" y="36" width="44" height="6" rx="3" fill="white" opacity="0.5"/><rect x="8" y="48" width="36" height="6" rx="3" fill="white" opacity="0.3"/></svg>`,
  },
  Security: {
    gradient: { from: "#1e293b", to: "#3b82f6" },
    bg: "#1e293b",
    accent: "#3b82f6",
    icon: "🛡️",
    iconSvg: `<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><path d="M32 6L10 18V30C10 44 20 56 32 60C44 56 54 44 54 30V18L32 6Z" fill="white" opacity="0.2" stroke="white" stroke-width="3"/><path d="M26 32L30 36L38 28" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  Developer: {
    gradient: { from: "#1e293b", to: "#6366f1" },
    bg: "#1e293b",
    accent: "#6366f1",
    icon: "💻",
    iconSvg: `<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><rect x="6" y="14" width="52" height="32" rx="4" stroke="white" stroke-width="3" fill="none"/><path d="M22 26L16 32L22 38" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 26L48 32L42 38" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 20L30 44" stroke="white" stroke-width="3" stroke-linecap="round"/><line x1="20" y1="52" x2="44" y2="52" stroke="white" stroke-width="3" stroke-linecap="round"/></svg>`,
  },
  Finance: {
    gradient: { from: "#065f46", to: "#d97706" },
    bg: "#065f46",
    accent: "#d97706",
    icon: "📈",
    iconSvg: `<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><rect x="8" y="40" width="10" height="16" rx="2" fill="white" opacity="0.9"/><rect x="27" y="24" width="10" height="32" rx="2" fill="white" opacity="0.7"/><rect x="46" y="12" width="10" height="44" rx="2" fill="white" opacity="0.5"/><path d="M10 48L29 32L48 20" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  Design: {
    gradient: { from: "#be185d", to: "#7c3aed" },
    bg: "#be185d",
    accent: "#7c3aed",
    icon: "🎨",
    iconSvg: `<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="24" stroke="white" stroke-width="3" fill="none"/><circle cx="32" cy="32" r="8" fill="white" opacity="0.9"/><path d="M32 8V16" stroke="white" stroke-width="3" stroke-linecap="round"/><path d="M32 48V56" stroke="white" stroke-width="3" stroke-linecap="round"/><path d="M8 32H16" stroke="white" stroke-width="3" stroke-linecap="round"/><path d="M48 32H56" stroke="white" stroke-width="3" stroke-linecap="round"/></svg>`,
  },
  "File Conversion": {
    gradient: { from: "#0d9488", to: "#4f46e5" },
    bg: "#0d9488",
    accent: "#4f46e5",
    icon: "📁",
    iconSvg: `<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><path d="M6 16C6 12.6863 8.68629 10 12 10H24L28 16H52C55.3137 16 58 18.6863 58 22V50C58 53.3137 55.3137 56 52 56H12C8.68629 56 6 53.3137 6 50V16Z" stroke="white" stroke-width="3" fill="none"/><path d="M20 34L28 42L44 28" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  Technology: {
    gradient: { from: "#1e293b", to: "#0891b2" },
    bg: "#1e293b",
    accent: "#0891b2",
    icon: "🔧",
    iconSvg: `<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="22" stroke="white" stroke-width="3" fill="none"/><path d="M32 10V22M32 42V54" stroke="white" stroke-width="3" stroke-linecap="round"/><path d="M10 32H22M42 32H54" stroke="white" stroke-width="3" stroke-linecap="round"/></svg>`,
  },
  Business: {
    gradient: { from: "#312e81", to: "#d97706" },
    bg: "#312e81",
    accent: "#d97706",
    icon: "💼",
    iconSvg: `<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><rect x="8" y="24" width="48" height="34" rx="4" stroke="white" stroke-width="3" fill="none"/><path d="M22 24V16C22 12.6863 24.6863 10 28 10H36C39.3137 10 42 12.6863 42 16V24" stroke="white" stroke-width="3" fill="none"/><rect x="24" y="34" width="16" height="8" rx="2" fill="white" opacity="0.3"/></svg>`,
  },
  Network: {
    gradient: { from: "#0e7490", to: "#06b6d4" },
    bg: "#0e7490",
    accent: "#06b6d4",
    icon: "🌐",
    iconSvg: `<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="6" fill="white" opacity="0.9"/><path d="M32 12C44 12 54 22 54 32" stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M32 52C44 52 54 42 54 32" stroke="white" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.6"/><path d="M10 32C10 22 20 12 32 12" stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M10 32C10 42 20 52 32 52" stroke="white" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.6"/></svg>`,
  },
  Multimedia: {
    gradient: { from: "#dc2626", to: "#9333ea" },
    bg: "#dc2626",
    accent: "#9333ea",
    icon: "🎬",
    iconSvg: `<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><rect x="6" y="14" width="52" height="36" rx="6" stroke="white" stroke-width="3" fill="none"/><polygon points="28,22 28,42 44,32" fill="white" opacity="0.9"/></svg>`,
  },
}

const defaultStyle: BlogCategoryStyle = {
  gradient: { from: "#1f2937", to: "#3b82f6" },
  bg: "#1f2937",
  accent: "#3b82f6",
  icon: "📄",
  iconSvg: `<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><rect x="10" y="6" width="44" height="52" rx="4" stroke="white" stroke-width="3" fill="none"/><line x1="20" y1="22" x2="44" y2="22" stroke="white" stroke-width="3" stroke-linecap="round"/><line x1="20" y1="32" x2="40" y2="32" stroke="white" stroke-width="3" stroke-linecap="round"/><line x1="20" y1="42" x2="36" y2="42" stroke="white" stroke-width="3" stroke-linecap="round"/></svg>`,
}

export function getBlogCategoryStyle(category: string): BlogCategoryStyle {
  const normalized = category.toLowerCase().trim()
  for (const [key, style] of Object.entries(BLOG_CATEGORY_STYLES)) {
    if (key.toLowerCase() === normalized) return style
  }
  if (normalized.includes("productivity") || normalized.includes("time") || normalized.includes("routine"))
    return BLOG_CATEGORY_STYLES.Productivity
  if (normalized.includes("education") || normalized.includes("cbc") || normalized.includes("learning") || normalized.includes("student") || normalized.includes("lesson") || normalized.includes("scheme"))
    return BLOG_CATEGORY_STYLES["CBC Education"]
  if (normalized.includes("security") || normalized.includes("privacy") || normalized.includes("safe") || normalized.includes("protect"))
    return BLOG_CATEGORY_STYLES.Security
  if (normalized.includes("developer") || normalized.includes("code") || normalized.includes("tech") || normalized.includes("software") || normalized.includes("ai"))
    return BLOG_CATEGORY_STYLES.Developer
  if (normalized.includes("finance") || normalized.includes("money") || normalized.includes("budget") || normalized.includes("invest"))
    return BLOG_CATEGORY_STYLES.Finance
  if (normalized.includes("design") || normalized.includes("creative") || normalized.includes("art") || normalized.includes("ui") || normalized.includes("ux"))
    return BLOG_CATEGORY_STYLES.Design
  if (normalized.includes("file") || normalized.includes("conversion") || normalized.includes("convert") || normalized.includes("image") || normalized.includes("pdf"))
    return BLOG_CATEGORY_STYLES["File Conversion"]
  if (normalized.includes("business") || normalized.includes("startup") || normalized.includes("corporate") || normalized.includes("management"))
    return BLOG_CATEGORY_STYLES.Business
  if (normalized.includes("network") || normalized.includes("speed") || normalized.includes("ip") || normalized.includes("dns") || normalized.includes("ping"))
    return BLOG_CATEGORY_STYLES.Network
  if (normalized.includes("multimedia") || normalized.includes("video") || normalized.includes("audio") || normalized.includes("screen") || normalized.includes("gif"))
    return BLOG_CATEGORY_STYLES.Multimedia
  return defaultStyle
}

export function getBlogCoverUrl(title: string, category: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://zilita.com"
  return `${base}/api/og?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}&type=blog`
}

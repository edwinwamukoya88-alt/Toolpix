const SETTINGS_KEY = "tf_site_settings"

export interface SiteSettings {
  heroTitle: string
  heroSubtitle: string
  ctaPrimary: string
  ctaPrimaryLink: string
  ctaSecondary: string
  ctaSecondaryLink: string
  defaultTitle: string
  defaultDescription: string
  keywords: string
  ogImage: string
  logo: string
  favicon: string
  twitterUrl: string
  githubUrl: string
  linkedinUrl: string
  footerText: string
}

const defaultSettings: SiteSettings = {
  heroTitle: "Smart Tools for Productivity & CBC Education",
  heroSubtitle: "Free, privacy-first utilities for students, teachers, and professionals.",
  ctaPrimary: "Explore Tools",
  ctaPrimaryLink: "/tools",
  ctaSecondary: "Read Blog",
  ctaSecondaryLink: "/blog",
  defaultTitle: "ToolForge — Smart Tools for Productivity & Education",
  defaultDescription: "Free online tools for students, teachers, and professionals. Privacy-first, no sign-up required.",
  keywords: "productivity tools, cbc tools, education tools, free online tools",
  ogImage: "/og-image.png",
  logo: "/logo.png",
  favicon: "/favicon.ico",
  twitterUrl: "https://twitter.com/toolforge",
  githubUrl: "https://github.com/edwinwamukoya88-alt",
  linkedinUrl: "https://linkedin.com",
  footerText: "© 2026 ToolForge. All rights reserved.",
}

export function loadSettings(): SiteSettings {
  if (typeof window === "undefined") return defaultSettings
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

export function saveSettings(settings: Partial<SiteSettings>): SiteSettings {
  const current = loadSettings()
  const updated = { ...current, ...settings }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
  return updated
}

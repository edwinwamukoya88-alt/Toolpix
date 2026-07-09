import type { SiteSettings } from "./settings-types"

export type { SiteSettings }

const defaultSettings: SiteSettings = {
  heroTitle: "Smart Tools for Productivity & CBC Education",
  heroSubtitle: "Free, privacy-first utilities for students, teachers, and professionals.",
  ctaPrimary: "Explore Tools",
  ctaPrimaryLink: "/tools",
  ctaSecondary: "Read Blog",
  ctaSecondaryLink: "/blog",
  defaultTitle: "Zilita — Smart Tools for Productivity & Education",
  defaultDescription: "Free online tools for students, teachers, and professionals. Privacy-first, no sign-up required.",
  keywords: "productivity tools, cbc tools, education tools, free online tools",
  ogImage: "/og-image.png",
  logo: "/logo-dark.svg",
  favicon: "/favicon.ico",
  twitterUrl: "https://twitter.com/zilita",
  githubUrl: "https://github.com/edwinwamukoya88-alt",
  linkedinUrl: "https://linkedin.com",
  footerText: "© 2026 Zilita. All rights reserved.",
}

export async function loadSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch("/api/admin/settings")
    if (!res.ok) return defaultSettings
    const data = await res.json()
    return { ...defaultSettings, ...data }
  } catch {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("zil_site_settings")
        if (raw) return { ...defaultSettings, ...JSON.parse(raw) }
      }
    } catch {}
    return defaultSettings
  }
}

export async function saveSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  try {
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    })
    if (!res.ok) throw new Error("Save failed")
    return res.json()
  } catch {
    try {
      if (typeof window !== "undefined") {
        const current = JSON.parse(localStorage.getItem("zil_site_settings") ?? "{}")
        const updated = { ...current, ...settings }
        localStorage.setItem("zil_site_settings", JSON.stringify(updated))
        return updated
      }
    } catch {}
    return { ...defaultSettings, ...settings }
  }
}

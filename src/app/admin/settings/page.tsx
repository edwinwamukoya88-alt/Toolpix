"use client"

import { useState, useEffect } from "react"
import { Save, Globe, Home, Navigation, Image, Link2, Hash } from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs"
import { loadSettings, saveSettings, type SiteSettings } from "@/lib/settings"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadSettings().then(setSettings)
  }, [])

  if (!settings) {
    return (
      <div className="container py-6 md:py-8">
        <AdminBreadcrumbs />
        <div className="h-[400px] rounded-xl bg-muted/30 animate-pulse" />
      </div>
    )
  }

  function update(field: keyof SiteSettings, value: string) {
    setSettings((prev) => prev ? { ...prev, [field]: value } : prev)
  }

  async function handleSave() {
    if (!settings) return
    await saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const sections = [
    {
      title: "Homepage",
      icon: Home,
      fields: [
        { key: "heroTitle", label: "Hero Title" },
        { key: "heroSubtitle", label: "Hero Subtitle" },
        { key: "ctaPrimary", label: "Primary CTA Label" },
        { key: "ctaPrimaryLink", label: "Primary CTA Link" },
        { key: "ctaSecondary", label: "Secondary CTA Label" },
        { key: "ctaSecondaryLink", label: "Secondary CTA Link" },
      ] as const,
    },
    {
      title: "SEO",
      icon: Globe,
      fields: [
        { key: "defaultTitle", label: "Default Meta Title" },
        { key: "defaultDescription", label: "Default Meta Description" },
        { key: "keywords", label: "Keywords (comma separated)" },
        { key: "ogImage", label: "Open Graph Image URL" },
      ] as const,
    },
    {
      title: "Branding",
      icon: Image,
      fields: [
        { key: "logo", label: "Logo URL" },
        { key: "favicon", label: "Favicon URL" },
      ] as const,
    },
    {
      title: "Social Links",
      icon: Link2,
      fields: [
        { key: "twitterUrl", label: "Twitter URL" },
        { key: "githubUrl", label: "GitHub URL" },
        { key: "linkedinUrl", label: "LinkedIn URL" },
      ] as const,
    },
    {
      title: "Footer",
      icon: Navigation,
      fields: [
        { key: "footerText", label: "Footer Text" },
      ] as const,
    },
  ]

  return (
    <div className="container py-6 md:py-8">
      <AdminBreadcrumbs />

      <PageHeader
        title="Site Settings"
        description="Manage site-wide configuration"
        actions={
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Save className="h-4 w-4" />
            {saved ? "Saved!" : "Save Changes"}
          </button>
        }
      />

      <div className="space-y-6 max-w-3xl">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <div key={section.title} className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">{section.title}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
                    <input
                      type="text"
                      value={settings[field.key]}
                      onChange={(e) => update(field.key, e.target.value)}
                      className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

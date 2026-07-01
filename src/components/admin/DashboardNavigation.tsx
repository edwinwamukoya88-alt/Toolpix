"use client"

import { useEffect, useState } from "react"
import { BarChart3, TrendingUp, Wrench, FileText, Search, Users, Activity, Sparkles } from "lucide-react"

export type TabId = "overview" | "traffic" | "tools" | "content" | "seo" | "users" | "live" | "insights"

const tabs: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "traffic", label: "Traffic", icon: TrendingUp },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "content", label: "Content", icon: FileText },
  { id: "seo", label: "SEO", icon: Search },
  { id: "users", label: "Users", icon: Users },
  { id: "live", label: "Live", icon: Activity },
  { id: "insights", label: "AI Insights", icon: Sparkles },
]

const STORAGE_KEY = "tf_dashboard_tab"

export default function DashboardNavigation({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}) {
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as TabId | null
    if (saved && tabs.some(t => t.id === saved)) {
      onTabChange(saved)
    }
  }, [])

  function handleChange(tab: TabId) {
    onTabChange(tab)
    localStorage.setItem(STORAGE_KEY, tab)
  }

  return (
    <nav className="flex flex-wrap gap-1 border-b pb-0.5" role="tablist" aria-label="Dashboard tabs">
      {tabs.map(tab => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            role="tab"
            aria-selected={isActive}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all border-b-2 -mb-px ${
              isActive
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}

"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Pen, GraduationCap, Palette, Sparkles,
  Copy, Download, Trash2, Type, FileText, X, Loader2, Clock,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { WorkspaceProvider, useWorkspace } from "./workspace-context"

function Sidebar() {
  const pathname = usePathname()
  const { remaining, queueItems, cancelQueued } = useWorkspace()

  const tabs = [
    { id: "writing", label: "Writing", icon: Pen, href: "/tools/ai-workspace/writing" },
    { id: "education", label: "Education (CBC)", icon: GraduationCap, href: "/tools/ai-workspace/education" },
    { id: "design", label: "Design", icon: Palette, href: "/tools/ai-workspace/design" },
  ] as const

  const activeTab = tabs.find((t) => pathname.startsWith(t.href))?.id ?? "writing"
  const queuedItems = queueItems.filter((i) => i.status === "queued")
  const activeItem = queueItems.find((i) => i.status === "processing")
  const hasQueueItems = queuedItems.length > 0 || activeItem

  return (
    <div className="flex w-56 flex-shrink-0 flex-col border-r border-white/[0.05] bg-card/30 overflow-hidden">
      <div className="flex-1 overflow-auto p-3 space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground/70 hover:bg-card/50 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{tab.label}</span>
            </Link>
          )
        })}
      </div>

      {hasQueueItems && (
        <div className="px-3 pb-1 space-y-1">
          <div className="rounded-xl border border-white/[0.05] bg-card/50 p-2.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
              <Loader2 className="h-3 w-3 animate-spin text-primary/60" />
              <span className="font-medium text-foreground/80 text-[11px]">Processing...</span>
              {queuedItems.length > 0 && (
                <span className="ml-auto text-[11px]">+{queuedItems.length} queued</span>
              )}
            </div>
            {activeItem && (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 truncate">
                <Clock className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{activeItem.feature}</span>
              </div>
            )}
            {queuedItems.slice(0, 2).map((item) => (
              <div key={item.id} className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 group">
                <Clock className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate flex-1">{item.feature}</span>
                <button
                  type="button"
                  onClick={() => cancelQueued(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                  aria-label="Cancel request"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 pt-1">
        <div className="rounded-xl border border-white/[0.05] bg-card/50 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
            <Sparkles className="h-3.5 w-3.5 text-primary/60" />
            <span className="flex-1">AI Requests</span>
            <span className="font-medium text-foreground/80">{remaining}/{5}</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-muted/30 overflow-hidden">
            <div className="h-full rounded-full bg-primary/40 transition-all" style={{ width: `${(remaining / 5) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsPanel() {
  const { settingsDefs, featureSettings, updateSetting } = useWorkspace()

  return (
    <div className="flex w-64 flex-shrink-0 flex-col border-l border-white/[0.05] bg-card/20 overflow-hidden">
      <div className="overflow-auto p-4 space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Settings</h3>
        {settingsDefs.map((setting) => (
          <div key={setting.key} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{setting.label}</label>
            {setting.type === "select" && setting.options ? (
              <select
                value={featureSettings[setting.key] || setting.options[0]?.value || ""}
                onChange={(e) => updateSetting(setting.key, e.target.value)}
                className="w-full rounded-xl border border-white/[0.06] bg-card/50 px-3 py-2 text-sm text-foreground focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20"
              >
                {setting.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <Input
                type="text"
                placeholder={`Enter ${setting.label.toLowerCase()}`}
                value={featureSettings[setting.key] || ""}
                onChange={(e) => updateSetting(setting.key, e.target.value)}
              />
            )}
          </div>
        ))}
        {settingsDefs.length === 0 && (
          <p className="text-xs text-muted-foreground/40">No additional settings for this feature.</p>
        )}
      </div>
    </div>
  )
}

function Toolbar() {
  const { input, output, handleCopy, handleDownload, handleClear, wordCount, charCount } = useWorkspace()

  return (
    <div className="flex items-center gap-3 border-t border-white/[0.05] px-4 py-2 text-xs text-muted-foreground/50">
      <button type="button" onClick={handleCopy} disabled={!output} className="flex items-center gap-1 hover:text-foreground transition-colors disabled:opacity-30">
        <Copy className="h-3.5 w-3.5" /> Copy
      </button>
      <button type="button" onClick={handleDownload} disabled={!output} className="flex items-center gap-1 hover:text-foreground transition-colors disabled:opacity-30">
        <Download className="h-3.5 w-3.5" /> Download
      </button>
      <button type="button" onClick={handleClear} disabled={!input && !output} className="flex items-center gap-1 hover:text-foreground transition-colors disabled:opacity-30">
        <Trash2 className="h-3.5 w-3.5" /> Clear
      </button>
      <span className="flex-1" />
      <span className="flex items-center gap-1"><Type className="h-3 w-3" /> {wordCount} words</span>
      <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {charCount} chars</span>
    </div>
  )
}

export default function AiWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isEducation = pathname?.startsWith("/tools/ai-workspace/education")

  if (isEducation) {
    return (
      <WorkspaceProvider>
        {children}
      </WorkspaceProvider>
    )
  }

  return (
    <WorkspaceProvider>
      <div className="flex h-[calc(100vh-4rem)] gap-0 overflow-hidden rounded-2xl border border-white/[0.05] bg-background/80 backdrop-blur-sm">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {children}
          </div>
          <Toolbar />
        </div>
        <SettingsPanel />
      </div>
    </WorkspaceProvider>
  )
}

"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import {
  Pen, GraduationCap, Palette, Sparkles,
  Copy, Download, Trash2, Type, FileText, X, Loader2, Clock,
  Settings2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { WorkspaceProvider, useWorkspace } from "./workspace-context"

function Sidebar({ onClose }: { onClose?: () => void }) {
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
    <div className="flex h-full w-full flex-col overflow-hidden lg:w-56 lg:border-r lg:border-border/50 lg:bg-card/20">
      <div className="flex items-center justify-between border-b border-border/20 px-4 py-3 lg:hidden">
        <h2 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Menu</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted/50 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto p-2 space-y-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={onClose}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all min-h-[44px]",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground/60 hover:bg-muted/20 hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </Link>
          )
        })}
      </div>

      <div className="p-2 pt-1 border-t border-border/20">
        <div className="rounded-xl bg-card/40 px-3 py-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground/60 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-primary/50" />
              Daily requests
            </span>
            <span className="font-medium text-foreground/70">{remaining}/5</span>
          </div>
          <div className="mt-2 h-1 rounded-full bg-muted/30 overflow-hidden" role="progressbar" aria-valuenow={remaining} aria-valuemin={0} aria-valuemax={5} aria-label="AI requests remaining">
            <div className="h-full rounded-full bg-primary/40 transition-all" style={{ width: `${(remaining / 5) * 100}%` }} />
          </div>
        </div>
      </div>

      {hasQueueItems && (
        <div className="px-2 pb-2">
          <div className="rounded-xl border border-border/30 bg-card/30 p-2.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <Loader2 className="h-3 w-3 animate-spin text-primary/50" />
              <span className="font-medium text-foreground/60 text-[11px]">Processing...</span>
              {queuedItems.length > 0 && (
                <span className="ml-auto text-[11px] text-muted-foreground/50">+{queuedItems.length}</span>
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
    </div>
  )
}

function SettingsPanel({ onClose }: { onClose?: () => void }) {
  const { settingsDefs, featureSettings, updateSetting } = useWorkspace()

  return (
    <div className="flex h-full w-full flex-col overflow-hidden lg:w-64 lg:border-l lg:border-border/50 lg:bg-card/20">
      <div className="flex items-center justify-between border-b border-border/30 px-4 py-3 lg:hidden">
        <h2 className="text-sm font-semibold">Settings</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted/50"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="overflow-auto p-4 space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Settings</h3>
        {settingsDefs.map((setting) => (
          <div key={setting.key} className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{setting.label}</label>
            {setting.type === "select" && setting.options ? (
              <select
                value={featureSettings[setting.key] || setting.options[0]?.value || ""}
                onChange={(e) => updateSetting(setting.key, e.target.value)}
                className="w-full rounded-xl border border-border/40 bg-card/50 px-3 py-2.5 text-sm text-foreground focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20 min-h-[44px]"
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
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            <Sparkles className="h-6 w-6 text-muted-foreground/20" />
            <p className="text-xs text-muted-foreground/50 leading-relaxed max-w-[180px]">
              No additional settings are required for this assistant.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function Toolbar() {
  const { input, output, handleCopy, handleDownload, handleClear, wordCount, charCount } = useWorkspace()

  return (
    <div className="flex items-center gap-1 border-t border-border/30 px-2 py-1.5 text-xs text-muted-foreground/50 overflow-x-auto scrollbar-none">
      <button type="button" onClick={handleCopy} disabled={!output} className="flex items-center gap-1.5 rounded-xl px-3 py-2 hover:text-foreground hover:bg-muted/30 transition-all disabled:opacity-30 shrink-0 min-h-[44px] border border-transparent hover:border-border/40">
        <Copy className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Copy</span>
      </button>
      <div className="h-5 w-px bg-border/20 shrink-0" />
      <button type="button" onClick={handleDownload} disabled={!output} className="flex items-center gap-1.5 rounded-xl px-3 py-2 hover:text-foreground hover:bg-muted/30 transition-all disabled:opacity-30 shrink-0 min-h-[44px] border border-transparent hover:border-border/40">
        <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">PDF</span>
      </button>
      <button type="button" onClick={handleClear} disabled={!input && !output} className="flex items-center gap-1.5 rounded-xl px-3 py-2 hover:text-foreground hover:bg-muted/30 transition-all disabled:opacity-30 shrink-0 min-h-[44px] border border-transparent hover:border-border/40">
        <Trash2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Clear</span>
      </button>
      <span className="flex-1" />
      <span className="flex items-center gap-1.5 shrink-0 tabular-nums"><Type className="h-3 w-3" /> {wordCount} <span className="hidden sm:inline">words</span></span>
      <span className="flex items-center gap-1.5 shrink-0 tabular-nums"><FileText className="h-3 w-3" /> {charCount} <span className="hidden sm:inline">chars</span></span>
    </div>
  )
}

export default function AiWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isEducation = pathname?.startsWith("/tools/ai-workspace/education")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (isEducation) {
    return (
      <WorkspaceProvider>
        {children}
      </WorkspaceProvider>
    )
  }

  return (
    <WorkspaceProvider>
      <div className="flex h-dvh lg:h-[calc(100dvh-3.5rem)] flex-col lg:flex-row overflow-hidden lg:rounded-2xl lg:border lg:border-border/40 lg:bg-background/80 lg:backdrop-blur-sm">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:shrink-0">
          <Sidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
            <aside className="relative z-10 w-72 max-w-[80vw] bg-background border-r border-border/40 animate-in slide-in-from-left duration-200">
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </aside>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Mobile top bar */}
          <div className="flex items-center gap-2 border-b border-border/30 px-3 py-2 lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted/50"
              aria-label="Open sidebar"
            >
              <Pen className="h-4 w-4 text-muted-foreground" />
            </button>
            <span className="text-sm font-semibold">AI Assistant</span>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted/50"
              aria-label="Open settings"
            >
              <Settings2 className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
              {/* Premium header */}
              <div className="text-center space-y-4 sm:space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-4 py-1.5 backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-medium text-muted-foreground tracking-wide">AI-Powered Assistant</span>
                </div>
                <h1 className="text-[1.625rem] sm:text-3xl md:text-[2.5rem] font-bold tracking-tight text-balance leading-[1.1]">
                  AI Assistant
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground/60 max-w-xl mx-auto leading-relaxed text-balance">
                  Your all-in-one AI companion for writing, education, design, productivity, and professional work.
                </p>
              </div>

              {/* Category tabs */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                {[
                  { id: "writing", label: "Writing", icon: Pen, href: "/tools/ai-workspace/writing" },
                  { id: "education", label: "Education", icon: GraduationCap, href: "/tools/ai-workspace/education" },
                  { id: "design", label: "Design", icon: Palette, href: "/tools/ai-workspace/design" },
                ].map((cat) => {
                  const Icon = cat.icon
                  const isActive = pathname?.startsWith(cat.href)
                  return (
                    <Link
                      key={cat.id}
                      href={cat.href}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-medium transition-all min-h-[44px] border active:scale-[0.97]",
                        isActive
                          ? "bg-primary/12 text-primary border-primary/25 shadow-sm ring-1 ring-primary/20"
                          : "bg-card/50 text-muted-foreground/60 hover:text-foreground hover:bg-card/80 border-border/30 hover:border-border/50",
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{cat.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {children}
          </div>

          <Toolbar />
        </div>

        {/* Desktop settings panel */}
        <div className="hidden lg:flex lg:shrink-0">
          <SettingsPanel />
        </div>

        {/* Mobile settings overlay */}
        {settingsOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSettingsOpen(false)} aria-hidden="true" />
            <aside className="relative ml-auto z-10 w-72 max-w-[80vw] bg-background border-l border-border/40 animate-in slide-in-from-right duration-200">
              <SettingsPanel onClose={() => setSettingsOpen(false)} />
            </aside>
          </div>
        )}
      </div>
    </WorkspaceProvider>
  )
}

import { event } from "./ga"

type EventParams = Record<string, string | number | boolean | undefined>

function isAnalyticsEnabled(): boolean {
  if (typeof window === "undefined") return false
  try {
    return localStorage.getItem("analytics_disabled") !== "true"
  } catch {
    return false
  }
}

function gtag(...args: unknown[]) {
  try {
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      ;(window as any).gtag(...args)
    }
  } catch {
    // silently fail
  }
}

export function trackEvent(name: string, params?: EventParams) {
  if (!isAnalyticsEnabled()) return
  gtag("event", name, params)
}

export function trackToolOpen(toolName: string, category?: string) {
  trackEvent("tool_open", { tool_name: toolName, tool_category: category })
  event({ action: "tool_open", category, label: toolName })
}

export function trackToolUse(toolName: string, action: string, category?: string) {
  trackEvent("tool_use", { tool_name: toolName, tool_action: action, tool_category: category })
  event({ action: "tool_use", category, label: toolName })
}

export function trackDownload(toolName: string, fileType: string) {
  trackEvent("tool_download", { tool_name: toolName, file_type: fileType })
  event({ action: "tool_download", category: fileType, label: toolName })
}

export function trackSearch(query: string) {
  const q = query.trim()
  if (!q) return
  trackEvent("search", { search_term: q })
  event({ action: "search", label: q })
}

type EventParams = Record<string, string | number | boolean | undefined>

function isAnalyticsEnabled(): boolean {
  if (typeof window === "undefined") return false
  try {
    return localStorage.getItem("analytics_disabled") !== "true"
  } catch {
    return false
  }
}

function pushGtag(...args: unknown[]) {
  try {
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag(...args)
    }
  } catch {
    // silently fail — never crash over analytics
  }
}

export function trackEvent(name: string, params?: EventParams) {
  if (!isAnalyticsEnabled()) return
  pushGtag("event", name, params)
}

export function trackToolOpen(toolName: string, category?: string) {
  trackEvent("tool_open", { tool_name: toolName, tool_category: category })
}

export function trackToolUse(toolName: string, action: string, category?: string) {
  trackEvent("tool_use", { tool_name: toolName, tool_action: action, tool_category: category })
}

export function trackDownload(toolName: string, fileType: string) {
  trackEvent("tool_download", { tool_name: toolName, file_type: fileType })
}

export function trackSearch(query: string) {
  const q = query.trim()
  if (!q) return
  trackEvent("search", { search_term: q })
}

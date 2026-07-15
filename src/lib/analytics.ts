import { event } from "./ga"

export function trackToolUse(toolName: string, action: string, category?: string) {
  event({ action: "tool_use", category, label: toolName })
}

export function trackDownload(toolName: string, fileType: string) {
  event({ action: "tool_download", category: fileType, label: toolName })
}

export function trackSearch(query: string) {
  const q = query.trim()
  if (!q) return
  event({ action: "search", label: q })
}

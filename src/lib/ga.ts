export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_ID || "G-W75ZWVJVFB"

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}

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
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag(...args)
    }
  } catch {
    // silently fail
  }
}

export function pageview(url: string) {
  if (!isAnalyticsEnabled()) return
  gtag("config", GA_MEASUREMENT_ID, { page_path: url })
}

export function event({
  action,
  category,
  label,
  value,
}: {
  action: string
  category?: string
  label?: string
  value?: number
}) {
  if (!isAnalyticsEnabled()) return
  gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  })
}

export function trackEngagement(timeMs: number) {
  if (!isAnalyticsEnabled() || timeMs < 1000) return
  gtag("event", "user_engagement", { engagement_time_msec: timeMs })
}

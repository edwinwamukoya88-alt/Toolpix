/* ─── Client-Side Analytics SDK ─────────────────────────────────────
 * Sends events to the server-side analytics pipeline.
 * Handles batching, deduplication, visitor/session management,
 * and automatic page view tracking.
 * ────────────────────────────────────────────────────────────────── */

"use client"

/* ─── Visitor & Session IDs ──────────────────────── */

function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

function getVisitorId(): string {
  if (typeof window === "undefined") return ""
  let vid = localStorage.getItem("zil_visitor_id")
  if (!vid) {
    vid = generateId()
    localStorage.setItem("zil_visitor_id", vid)
  }
  return vid
}

function getSessionId(): string {
  if (typeof window === "undefined") return ""
  let sid = sessionStorage.getItem("zil_session_id")
  if (!sid) {
    sid = `s_${generateId()}`
    sessionStorage.setItem("zil_session_id", sid)
  }
  return sid
}

/* ─── Device Detection ───────────────────────────── */

function getDevice(): string {
  if (typeof navigator === "undefined") return "unknown"
  const ua = navigator.userAgent
  if (/mobile|android|iphone/i.test(ua)) return "mobile"
  if (/tablet|ipad/i.test(ua)) return "tablet"
  return "desktop"
}

function getBrowser(): string {
  if (typeof navigator === "undefined") return "unknown"
  const ua = navigator.userAgent
  if (/chrome/i.test(ua) && !/edge|opr/i.test(ua)) return "chrome"
  if (/firefox/i.test(ua)) return "firefox"
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "safari"
  if (/edge/i.test(ua)) return "edge"
  if (/opr|opera/i.test(ua)) return "opera"
  return "other"
}

function getOS(): string {
  if (typeof navigator === "undefined") return "unknown"
  const ua = navigator.userAgent
  if (/windows/i.test(ua)) return "windows"
  if (/macintosh|mac os/i.test(ua)) return "macos"
  if (/linux/i.test(ua)) return "linux"
  if (/android/i.test(ua)) return "android"
  if (/iphone|ipad|ipod/i.test(ua)) return "ios"
  return "other"
}

/* ─── Event Queue & Batching ─────────────────────── */

interface QueuedEvent {
  eventType: string
  category?: string
  name?: string
  sessionId: string
  visitorId: string
  path: string
  referrer: string
  device: string
  browser: string
  os: string
  country?: string
  properties?: Record<string, unknown>
  duration?: number
  value?: number
}

let eventQueue: QueuedEvent[] = []
let flushTimeout: ReturnType<typeof setTimeout> | null = null
let isFlushing = false
const BATCH_SIZE = 10
const FLUSH_INTERVAL = 5000
const MAX_QUEUE_SIZE = 200

function queueEvent(event: QueuedEvent): void {
  eventQueue.push(event)
  if (eventQueue.length >= MAX_QUEUE_SIZE) {
    eventQueue = eventQueue.slice(-MAX_QUEUE_SIZE)
  }
  if (eventQueue.length >= BATCH_SIZE) {
    flushEvents()
  } else if (!flushTimeout) {
    flushTimeout = setTimeout(flushEvents, FLUSH_INTERVAL)
  }
}

async function flushEvents(): Promise<void> {
  if (isFlushing || eventQueue.length === 0) return
  isFlushing = true
  if (flushTimeout) { clearTimeout(flushTimeout); flushTimeout = null }

  const batch = eventQueue.splice(0, BATCH_SIZE)
  try {
    await fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: batch }),
      keepalive: true,
    })
  } catch {
    eventQueue.push(...batch)
  } finally {
    isFlushing = false
    if (eventQueue.length > 0 && !flushTimeout) {
      flushTimeout = setTimeout(flushEvents, FLUSH_INTERVAL)
    }
  }
}

/* ─── Page View Deduplication ────────────────────── */

let lastPageViewPath = ""
let lastPageViewTime = 0

/* ─── Core Tracking Functions ────────────────────── */

function makeBaseEvent(): Omit<QueuedEvent, "eventType"> {
  return {
    sessionId: getSessionId(),
    visitorId: getVisitorId(),
    path: typeof window !== "undefined" ? window.location.pathname : "",
    referrer: typeof document !== "undefined" ? document.referrer || "direct" : "direct",
    device: getDevice(),
    browser: getBrowser(),
    os: getOS(),
  }
}

export function trackPageView(path?: string, title?: string): void {
  if (typeof window === "undefined") return
  const currentPath = path || window.location.pathname
  const now = Date.now()

  if (currentPath === lastPageViewPath && now - lastPageViewTime < 2000) return
  lastPageViewPath = currentPath
  lastPageViewTime = now

  queueEvent({
    ...makeBaseEvent(),
    eventType: "page_view",
    name: title || document.title || "",
    path: currentPath,
  })
}

export function trackToolOpened(toolSlug: string, toolName: string, category: string): void {
  queueEvent({
    ...makeBaseEvent(),
    eventType: "tool_opened",
    name: toolName,
    category,
    path: `/tools/${toolSlug}`,
  })
}

export function trackToolUsed(toolSlug: string, toolName: string, category: string, action: string, duration?: number): void {
  queueEvent({
    ...makeBaseEvent(),
    eventType: "tool_used",
    name: toolName,
    category,
    path: `/tools/${toolSlug}`,
    duration,
    properties: { action },
  })
}

export function trackToolCompleted(toolSlug: string, toolName: string, category: string, duration?: number): void {
  queueEvent({
    ...makeBaseEvent(),
    eventType: "tool_completed",
    name: toolName,
    category,
    path: `/tools/${toolSlug}`,
    duration,
  })
}

export function trackToolError(toolSlug: string, toolName: string, category: string, errorMessage: string): void {
  queueEvent({
    ...makeBaseEvent(),
    eventType: "tool_error",
    name: toolName,
    category,
    path: `/tools/${toolSlug}`,
    properties: { error: errorMessage },
  })
}

export function trackAIPromptSubmitted(feature: string, model: string, promptTokens: number): void {
  queueEvent({
    ...makeBaseEvent(),
    eventType: "ai_prompt_submitted",
    name: feature,
    category: "ai",
    properties: { model, promptTokens },
  })
}

export function trackAICompletionReturned(feature: string, model: string, latencyMs: number, totalTokens: number): void {
  queueEvent({
    ...makeBaseEvent(),
    eventType: "ai_completion_returned",
    name: feature,
    category: "ai",
    duration: latencyMs,
    properties: { model, totalTokens },
  })
}

export function trackAIError(feature: string, errorMessage: string): void {
  queueEvent({
    ...makeBaseEvent(),
    eventType: "ai_error",
    name: feature,
    category: "ai",
    properties: { error: errorMessage },
  })
}

export function trackAIRateLimited(feature: string): void {
  queueEvent({
    ...makeBaseEvent(),
    eventType: "ai_rate_limited",
    name: feature,
    category: "ai",
  })
}

export function trackBlogArticleView(slug: string, title: string): void {
  queueEvent({
    ...makeBaseEvent(),
    eventType: "blog_article_view",
    name: title,
    path: `/blog/${slug}`,
  })
}

export function trackBlogScrollDepth(slug: string, title: string, depth: number): void {
  queueEvent({
    ...makeBaseEvent(),
    eventType: "blog_scroll_depth",
    name: title,
    path: `/blog/${slug}`,
    value: depth,
  })
}

export function trackBlogCTAClick(slug: string, title: string): void {
  queueEvent({
    ...makeBaseEvent(),
    eventType: "blog_cta_click",
    name: title,
    path: `/blog/${slug}`,
  })
}

export function trackBlogInternalLinkClick(slug: string, title: string, targetPath: string): void {
  queueEvent({
    ...makeBaseEvent(),
    eventType: "blog_internal_link_click",
    name: title,
    path: `/blog/${slug}`,
    properties: { targetPath },
  })
}

export function trackBlogExit(slug: string, title: string, readTime: number): void {
  queueEvent({
    ...makeBaseEvent(),
    eventType: "blog_exit",
    name: title,
    path: `/blog/${slug}`,
    duration: readTime,
  })
}

export function trackBlogBounce(slug: string, title: string): void {
  queueEvent({
    ...makeBaseEvent(),
    eventType: "blog_bounce",
    name: title,
    path: `/blog/${slug}`,
  })
}

export function trackSearch(query: string): void {
  queueEvent({
    ...makeBaseEvent(),
    eventType: "search",
    name: query,
  })
}

/* ─── Lifecycle Hooks ────────────────────────────── */

export function initAnalytics(): void {
  if (typeof window === "undefined") return

  trackPageView()

  window.addEventListener("beforeunload", () => {
    flushEvents()
  })

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushEvents()
    }
  })

  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => { flushEvents() }, { timeout: 10000 })
  }
}

export function flushNow(): Promise<void> {
  return flushEvents()
}

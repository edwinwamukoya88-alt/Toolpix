/* ─── Client-Side Analytics SDK ─────────────────────────────────────
 * Sends events to the server-side analytics pipeline.
 * Handles batching, deduplication, visitor/session management,
 * UTM extraction, web vitals, scroll depth, and automatic page view tracking.
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

function getScreenSize(): string {
  if (typeof window === "undefined") return ""
  return `${window.screen.width}x${window.screen.height}`
}

function getViewportSize(): string {
  if (typeof window === "undefined") return ""
  return `${window.innerWidth}x${window.innerHeight}`
}

function getLanguage(): string {
  if (typeof navigator === "undefined") return ""
  return (navigator.language || "").slice(0, 10)
}

function getTimezone(): string {
  if (typeof Intl === "undefined") return ""
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || ""
  } catch {
    return ""
  }
}

/* ─── UTM Extraction ────────────────────────────── */

interface UTMParams {
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmContent: string
  utmTerm: string
}

let cachedUTM: UTMParams | null = null

function extractUTM(): UTMParams {
  if (cachedUTM) return cachedUTM
  if (typeof window === "undefined") {
    return { utmSource: "", utmMedium: "", utmCampaign: "", utmContent: "", utmTerm: "" }
  }

  const params = new URLSearchParams(window.location.search)
  const utm: UTMParams = {
    utmSource: (params.get("utm_source") || "").slice(0, 100),
    utmMedium: (params.get("utm_medium") || "").slice(0, 100),
    utmCampaign: (params.get("utm_campaign") || "").slice(0, 100),
    utmContent: (params.get("utm_content") || "").slice(0, 100),
    utmTerm: (params.get("utm_term") || "").slice(0, 100),
  }

  const hasUTM = utm.utmSource || utm.utmMedium || utm.utmCampaign
  if (hasUTM) {
    try { sessionStorage.setItem("zil_utm", JSON.stringify(utm)) } catch {}
  } else {
    try {
      const stored = sessionStorage.getItem("zil_utm")
      if (stored) {
        const parsed = JSON.parse(stored) as UTMParams
        const entryTime = sessionStorage.getItem("zil_utm_time")
        if (entryTime && Date.now() - Number(entryTime) < 30 * 60 * 1000) {
          Object.assign(utm, parsed)
        }
      }
    } catch {}
  }

  cachedUTM = utm
  return utm
}

/* ─── Bot Detection ──────────────────────────────── */

function isBot(): boolean {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent.toLowerCase()
  return /bot|crawler|spider|scraper|curl|wget|python-requests|headless/i.test(ua)
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
  region?: string
  city?: string
  screen?: string
  viewport?: string
  language?: string
  timezone?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
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

/* ─── Scroll Depth Tracking ──────────────────────── */

let maxScrollDepth = 0
let scrollTrackingActive = false
let scrollDebounceTimer: ReturnType<typeof setTimeout> | null = null

function initScrollTracking(): void {
  if (typeof window === "undefined" || scrollTrackingActive) return
  scrollTrackingActive = true

  const onScroll = () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    if (docHeight <= 0) return
    const depth = Math.round((window.scrollY / docHeight) * 100)
    if (depth > maxScrollDepth) {
      maxScrollDepth = depth
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true, capture: true })

  const reportInterval = setInterval(() => {
    if (maxScrollDepth > 0 && document.visibilityState === "hidden") {
      reportScrollDepth()
    }
  }, 10000)

  const onUnload = () => {
    clearInterval(reportInterval)
    reportScrollDepth()
  }
  window.addEventListener("beforeunload", onUnload)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      clearInterval(reportInterval)
      reportScrollDepth()
    }
  })
}

function reportScrollDepth(): void {
  if (maxScrollDepth <= 0) return
  const depth = maxScrollDepth
  maxScrollDepth = 0
  queueEvent({
    ...makeBaseEvent(),
    eventType: "scroll_depth",
    name: document.title || "",
    value: depth,
  })
}

/* ─── Core Tracking Functions ────────────────────── */

function makeBaseEvent(): Omit<QueuedEvent, "eventType"> {
  const utm = extractUTM()
  return {
    sessionId: getSessionId(),
    visitorId: getVisitorId(),
    path: typeof window !== "undefined" ? window.location.pathname : "",
    referrer: typeof document !== "undefined" ? document.referrer || "direct" : "direct",
    device: getDevice(),
    browser: getBrowser(),
    os: getOS(),
    screen: getScreenSize(),
    viewport: getViewportSize(),
    language: getLanguage(),
    timezone: getTimezone(),
    ...utm,
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

/* ─── Web Vitals ─────────────────────────────────── */

let vitalsReported = false

function reportWebVitals(): void {
  if (vitalsReported || typeof window === "undefined") return

  const metrics: Record<string, number> = {}

  try {
    const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[]
    if (navEntries.length > 0) {
      const nav = navEntries[0]
      if (nav.responseStart > 0) metrics.TTFB = Math.round(nav.responseStart)
      if (nav.domContentLoadedEventEnd > 0) metrics.FCP = Math.round(nav.domContentLoadedEventEnd)
    }
  } catch {}

  try {
    const paintEntries = performance.getEntriesByType("paint") as PerformancePaintTiming[]
    for (const entry of paintEntries) {
      if (entry.name === "first-contentful-paint") metrics.FCP = Math.round(entry.startTime)
    }
  } catch {}

  try {
    const clsObserver = new PerformanceObserver((list) => {
      let cls = 0
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) cls += (entry as any).value
      }
      metrics.CLS = Math.round(cls * 1000) / 1000
    })
    clsObserver.observe({ type: "layout-shift", buffered: true })
  } catch {}

  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      if (entries.length > 0) {
        const last = entries[entries.length - 1]
        metrics.LCP = Math.round(last.startTime)
      }
    })
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true })
  } catch {}

  if (Object.keys(metrics).length > 0) {
    vitalsReported = true
    queueEvent({
      ...makeBaseEvent(),
      eventType: "web_vitals",
      properties: metrics,
    })
  }
}

/* ─── Funnel Tracking ────────────────────────────── */

export function trackFunnelStep(funnelName: string, step: number, path?: string, properties?: Record<string, unknown>): void {
  queueEvent({
    ...makeBaseEvent(),
    eventType: "page_view",
    name: `funnel:${funnelName}:${step}`,
    path: path || window.location.pathname,
    properties: { funnel: funnelName, step, ...properties },
  })
}

/* ─── Lifecycle Hooks ────────────────────────────── */

function trackSessionEnd(): void {
  if (typeof window === "undefined") return
  reportScrollDepth()
  queueEvent({
    ...makeBaseEvent(),
    eventType: "session_end",
  })
  flushEvents()
}

export function initAnalytics(): void {
  if (typeof window === "undefined") return

  extractUTM()

  trackPageView()

  setTimeout(() => {
    reportWebVitals()
    initScrollTracking()
  }, 1000)

  window.addEventListener("beforeunload", () => {
    trackSessionEnd()
  })

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      reportScrollDepth()
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

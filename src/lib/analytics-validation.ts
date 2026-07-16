import { z } from "zod"

/* ─── Valid Event Types ────────────────────────── */

export const VALID_EVENT_TYPES = [
  // Page events
  "page_view",
  "page_exit",
  "first_visit",
  "returning_visit",
  "404_page",
  // Session events
  "session_start",
  "session_end",
  // Tool events
  "tool_opened",
  "tool_used",
  "tool_completed",
  "tool_error",
  // AI events
  "ai_prompt_submitted",
  "ai_completion_returned",
  "ai_error",
  "ai_rate_limited",
  // Blog events
  "blog_article_view",
  "blog_scroll_depth",
  "blog_exit",
  "blog_bounce",
  "blog_cta_click",
  "blog_internal_link_click",
  // Search events
  "search",
  "internal_search",
  "search_no_results",
  // Interaction events
  "outbound_link_click",
  "download",
  "scroll_depth",
  "navigation",
  // Ad events
  "ad_impression",
  "ad_click",
  // Performance events
  "web_vitals",
  "performance_metric",
] as const

export type ValidEventType = (typeof VALID_EVENT_TYPES)[number]

export const VALID_EVENT_TYPE_SET = new Set<string>(VALID_EVENT_TYPES)

/* ─── Event Payload Schema ─────────────────────── */

export const EventPropertiesSchema = z.record(z.string(), z.unknown()).optional()

export const AnalyticsEventSchema = z.object({
  eventType: z.string().min(1).max(50),
  category: z.string().max(100).optional().default(""),
  name: z.string().max(200).optional().default(""),
  sessionId: z.string().max(100).optional().default(""),
  visitorId: z.string().max(100).optional().default(""),
  path: z.string().max(500).optional().default(""),
  referrer: z.string().max(500).optional().default(""),
  device: z.string().max(50).optional().default("unknown"),
  browser: z.string().max(50).optional().default("unknown"),
  os: z.string().max(50).optional().default("unknown"),
  country: z.string().max(100).optional().default(""),
  region: z.string().max(100).optional().default(""),
  city: z.string().max(100).optional().default(""),
  screen: z.string().max(20).optional().default(""),
  viewport: z.string().max(20).optional().default(""),
  language: z.string().max(10).optional().default(""),
  timezone: z.string().max(50).optional().default(""),
  utmSource: z.string().max(100).optional().default(""),
  utmMedium: z.string().max(100).optional().default(""),
  utmCampaign: z.string().max(100).optional().default(""),
  utmContent: z.string().max(100).optional().default(""),
  utmTerm: z.string().max(100).optional().default(""),
  properties: EventPropertiesSchema,
  duration: z.number().min(0).max(86400000).optional().default(0),
  value: z.number().optional().default(0),
})

export type ValidatedAnalyticsEvent = z.infer<typeof AnalyticsEventSchema>

export const AnalyticsBatchSchema = z.object({
  events: z.array(AnalyticsEventSchema).min(1).max(100),
})

export type ValidatedBatch = z.infer<typeof AnalyticsBatchSchema>

/* ─── Funnel Schema ────────────────────────────── */

export const FunnelStepSchema = z.object({
  funnelName: z.string().min(1).max(100),
  step: z.number().int().min(1),
  path: z.string().max(500).optional().default(""),
  eventType: z.string().max(50).optional().default(""),
})

export const FunnelCompleteSchema = z.object({
  funnelName: z.string().min(1).max(100),
  visitorId: z.string().max(100).optional().default(""),
  sessionId: z.string().max(100).optional().default(""),
  stepsCompleted: z.number().int().min(0),
  totalSteps: z.number().int().min(1),
  completed: z.boolean().optional().default(false),
  duration: z.number().int().min(0).optional().default(0),
  dropoffStep: z.number().int().min(0).optional().default(0),
  properties: EventPropertiesSchema,
})

/* ─── Validation Helpers ───────────────────────── */

export function validateEvent(data: unknown) {
  return AnalyticsEventSchema.safeParse(data)
}

export function validateBatch(data: unknown) {
  return AnalyticsBatchSchema.safeParse(data)
}

export function sanitizeEvent(raw: ValidatedAnalyticsEvent) {
  return {
    eventType: raw.eventType.slice(0, 50),
    category: (raw.category || "").slice(0, 100),
    name: (raw.name || "").slice(0, 200),
    sessionId: (raw.sessionId || "").slice(0, 100),
    visitorId: (raw.visitorId || "").slice(0, 100),
    path: (raw.path || "").slice(0, 500),
    referrer: (raw.referrer || "").slice(0, 500),
    device: (raw.device || "unknown").slice(0, 50),
    browser: (raw.browser || "unknown").slice(0, 50),
    os: (raw.os || "unknown").slice(0, 50),
    country: (raw.country || "").slice(0, 100),
    region: (raw.region || "").slice(0, 100),
    city: (raw.city || "").slice(0, 100),
    screen: (raw.screen || "").slice(0, 20),
    viewport: (raw.viewport || "").slice(0, 20),
    language: (raw.language || "").slice(0, 10),
    timezone: (raw.timezone || "").slice(0, 50),
    utmSource: (raw.utmSource || "").slice(0, 100),
    utmMedium: (raw.utmMedium || "").slice(0, 100),
    utmCampaign: (raw.utmCampaign || "").slice(0, 100),
    utmContent: (raw.utmContent || "").slice(0, 100),
    utmTerm: (raw.utmTerm || "").slice(0, 100),
    properties: typeof raw.properties === "object" && raw.properties !== null ? raw.properties : {},
    duration: typeof raw.duration === "number" ? Math.min(raw.duration, 86400000) : 0,
    value: typeof raw.value === "number" ? raw.value : 0,
  }
}

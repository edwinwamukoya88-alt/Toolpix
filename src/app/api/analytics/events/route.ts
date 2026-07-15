import { NextRequest, NextResponse } from "next/server"
import { ingestEvents } from "@/lib/analytics-db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 60
const RATE_WINDOW = 60000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

const VALID_EVENT_TYPES = new Set([
  "page_view",
  "session_start",
  "tool_opened",
  "tool_used",
  "tool_completed",
  "tool_error",
  "ai_prompt_submitted",
  "ai_completion_returned",
  "ai_error",
  "ai_rate_limited",
  "blog_article_view",
  "blog_scroll_depth",
  "blog_exit",
  "blog_bounce",
  "blog_cta_click",
  "blog_internal_link_click",
  "search",
])

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  try {
    const body = await request.json()
    const events = Array.isArray(body.events) ? body.events : [body]

    if (events.length > 100) {
      return NextResponse.json({ error: "Too many events (max 100)" }, { status: 400 })
    }

    const sanitized = events
      .filter((e: any) => e && typeof e.eventType === "string" && VALID_EVENT_TYPES.has(e.eventType))
      .map((e: any) => ({
        eventType: String(e.eventType).slice(0, 50),
        category: String(e.category || "").slice(0, 100),
        name: String(e.name || "").slice(0, 200),
        sessionId: String(e.sessionId || "").slice(0, 100),
        visitorId: String(e.visitorId || "").slice(0, 100),
        path: String(e.path || "").slice(0, 500),
        referrer: String(e.referrer || "").slice(0, 500),
        device: String(e.device || "unknown").slice(0, 50),
        browser: String(e.browser || "unknown").slice(0, 50),
        os: String(e.os || "unknown").slice(0, 50),
        country: String(e.country || "").slice(0, 100),
        properties: typeof e.properties === "object" ? e.properties : {},
        duration: typeof e.duration === "number" ? Math.min(e.duration, 86400000) : 0,
        value: typeof e.value === "number" ? e.value : 0,
      }))

    if (sanitized.length === 0) {
      return NextResponse.json({ ingested: 0 })
    }

    const result = await ingestEvents(sanitized)
    return NextResponse.json({ ingested: result.ingested })
  } catch (e) {
    console.error("[analytics/events] Error:", e)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

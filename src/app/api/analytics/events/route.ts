import { NextRequest, NextResponse } from "next/server"
import { ingestEvents, AnalyticsPersistenceError } from "@/lib/analytics-db"
import { validateBatch, sanitizeEvent, VALID_EVENT_TYPE_SET } from "@/lib/analytics-validation"
import { extractLocationFromRequest } from "@/lib/analytics-location-service"

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

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  try {
    const body = await request.json()
    const input = Array.isArray(body.events) ? body : { events: [body] }

    const parsed = validateBatch(input)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      )
    }

    const validEvents = parsed.data.events.filter(e => VALID_EVENT_TYPE_SET.has(e.eventType))

    if (validEvents.length === 0) {
      return NextResponse.json({ ingested: 0 })
    }

    const sanitized = validEvents.map(sanitizeEvent)

    const location = extractLocationFromRequest(request)
    const enriched = sanitized.map(event => ({
      ...event,
      country: event.country || location.country,
      region: event.region || location.region,
      city: event.city || location.city,
    }))

    const result = await ingestEvents(enriched)
    return NextResponse.json({ ingested: result.ingested })
  } catch (e) {
    if (e instanceof AnalyticsPersistenceError) {
      console.error("[analytics/events] Persistence failed:", e.message, e.cause)
      return NextResponse.json(
        { error: "Failed to store analytics events", detail: e.message },
        { status: 500 }
      )
    }
    console.error("[analytics/events] Error:", e)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { generateGeminiResponse } from "@/lib/ai/gemini"
import { validateToken, checkDailyLimit, incrementDailyUsage } from "@/lib/ai/auth"

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-ai-token")
  if (!token) {
    return NextResponse.json({ error: "UNAUTHORIZED", code: 401 }, { status: 401 })
  }

  const validation = validateToken(token)
  if (!validation.valid) {
    return NextResponse.json({ error: "UNAUTHORIZED", code: 401 }, { status: 401 })
  }

  const limit = checkDailyLimit(token)
  if (!limit.allowed) {
    return NextResponse.json({ error: "DAILY_LIMIT_REACHED" }, { status: 429 })
  }

  try {
    const body = await request.json()
    const { feature, input, settings } = body as {
      feature: string
      input: string
      settings: Record<string, string>
    }

    if (!feature) {
      return NextResponse.json({ error: "BAD_REQUEST", code: 400 }, { status: 400 })
    }

    const result = await generateGeminiResponse({ feature, input: input || "", settings: settings || {} })

    incrementDailyUsage(token)

    return NextResponse.json({ ...result, remaining: limit.remaining - 1 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "INTERNAL_ERROR"
    const status = msg.startsWith("QUOTA_EXCEEDED") ? 429 : 500
    console.error("[AI Route] Error:", msg)
    return NextResponse.json({ error: msg, code: status }, { status })
  }
}

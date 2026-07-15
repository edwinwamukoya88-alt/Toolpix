import { NextRequest, NextResponse } from "next/server"
import { generateGeminiResponse } from "@/lib/ai/gemini"
import { validateToken, checkDailyLimit, incrementDailyUsage } from "@/lib/ai/auth"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

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
    try {
      await prisma.aIUsageLog.create({
        data: {
          provider: "gemini",
          feature: "unknown",
          success: false,
          rateLimited: true,
          errorMessage: "Daily limit reached",
        },
      })
    } catch {}
    return NextResponse.json({ error: "DAILY_LIMIT_REACHED" }, { status: 429 })
  }

  const startTime = Date.now()

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

    const latencyMs = Date.now() - startTime
    const promptTokens = Math.ceil((input || "").length / 4)
    const completionTokens = Math.ceil(JSON.stringify(result).length / 4)

    try {
      await prisma.aIUsageLog.create({
        data: {
          provider: "gemini",
          model: "gemini",
          feature,
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
          estimatedCost: 0,
          latencyMs,
          success: true,
        },
      })
    } catch {}

    incrementDailyUsage(token)

    return NextResponse.json({ ...result, remaining: limit.remaining - 1 })
  } catch (error) {
    const latencyMs = Date.now() - startTime
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("[AI Route] Error:", err.message)

    try {
      await prisma.aIUsageLog.create({
        data: {
          provider: "gemini",
          feature: "unknown",
          latencyMs,
          success: false,
          errorMessage: err.message.slice(0, 500),
          rateLimited: err.message.includes("QUOTA"),
        },
      })
    } catch {}

    const msg = err.message
    const status = msg.startsWith("QUOTA_EXCEEDED") ? 429 : 500
    return NextResponse.json({ error: msg, code: status }, { status })
  }
}

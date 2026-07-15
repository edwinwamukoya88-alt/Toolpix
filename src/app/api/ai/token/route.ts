import { NextResponse } from "next/server"
import { generateToken } from "@/lib/ai/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const tokenRequests = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(): boolean {
  const now = Date.now()
  const key = "global"
  const record = tokenRequests.get(key)
  if (!record || now > record.resetAt) {
    tokenRequests.set(key, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (record.count >= 10) return false
  record.count++
  return true
}

export async function GET() {
  try {
    if (!checkRateLimit()) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const { token, expiresAt } = generateToken()
    return NextResponse.json({ token, expiresAt })
  } catch {
    console.error("[Token] Generation failed")
    return NextResponse.json(
      { error: "Failed to generate access token" },
      { status: 500 },
    )
  }
}

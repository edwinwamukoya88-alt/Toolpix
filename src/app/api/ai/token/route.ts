import { NextResponse } from "next/server"
import { generateToken } from "@/lib/ai/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { token, expiresAt } = generateToken()
    return NextResponse.json({ token, expiresAt })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : ""
    const env = process.env.NODE_ENV || "unknown"
    const diag = JSON.stringify({
      route: "/api/ai/token",
      variable: "AI_GATEWAY_SECRET",
      present: !!process.env.AI_GATEWAY_SECRET,
      runtime: "nodejs",
      NODE_ENV: env,
    })
    console.error("Token generation error:", msg)
    console.error("[Token] Diagnostics:", diag)
    if (stack) console.error("Token generation stack:", stack)
    return NextResponse.json(
      { error: `Failed to generate access token: ${msg}`, diag: JSON.parse(diag) },
      { status: 500 },
    )
  }
}

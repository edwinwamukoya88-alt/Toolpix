import { NextResponse } from "next/server"
import { generateToken } from "@/lib/ai/auth"

export async function GET() {
  try {
    const { token, expiresAt } = generateToken()
    return NextResponse.json({ token, expiresAt })
  } catch (error) {
    console.error("Token generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate access token. Check AI_GATEWAY_SECRET configuration." },
      { status: 500 },
    )
  }
}

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
    console.error("Token generation error:", msg)
    if (stack) console.error("Token generation stack:", stack)
    return NextResponse.json(
      { error: `Failed to generate access token: ${msg}` },
      { status: 500 },
    )
  }
}

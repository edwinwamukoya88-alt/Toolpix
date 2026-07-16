import { NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/auth-guard"
import { getSystemStatus } from "@/lib/system-status"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const authResponse = await requireApiAuth()
  if (authResponse) return authResponse

  try {
    const { searchParams } = new URL(request.url)
    const force = searchParams.get("force") === "true"

    const status = await getSystemStatus(force)
    return NextResponse.json({ success: true, data: status })
  } catch (e) {
    console.error("[api/admin/system-status] Error:", e)
    return NextResponse.json(
      { error: "Failed to fetch system status", detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    )
  }
}

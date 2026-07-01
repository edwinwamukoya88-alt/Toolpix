import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

const AUTHORIZED_EMAIL = "edwinwamukoya88@gmail.com"

export async function requireAuth() {
  const session = await auth()

  if (!session?.user?.email) {
    const h = await headers()
    const pathname = h.get("x-invoke-path") || h.get("next-url") || "/"
    redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`)
  }

  if (session.user.email !== AUTHORIZED_EMAIL) {
    redirect("/")
  }
}

export async function requireApiAuth() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    )
  }

  if (session.user.email !== AUTHORIZED_EMAIL) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 },
    )
  }
}

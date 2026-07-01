import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"
import { isAdmin } from "./roles"

export async function requireAuth() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent("/admin")}`)
  }

  if (!isAdmin(session.user.email)) {
    redirect("/access-denied")
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

  if (!isAdmin(session.user.email)) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 },
    )
  }
}

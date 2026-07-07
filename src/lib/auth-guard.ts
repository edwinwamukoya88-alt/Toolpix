import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"
import { checkAdminRole } from "./roles"

export async function requireAuth() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent("/admin")}`)
  }

  const { isAdmin } = await checkAdminRole(session.user.email)
  if (!isAdmin) {
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

  const { isAdmin } = await checkAdminRole(session.user.email)
  if (!isAdmin) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 },
    )
  }
}

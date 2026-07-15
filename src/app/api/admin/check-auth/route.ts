import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireApiAuth } from "@/lib/auth-guard"

export async function POST(request: Request) {
  try {
    const authResponse = await requireApiAuth()
    if (authResponse) return authResponse

    const body = await request.json()
    const email = body.email
    if (!email) {
      return NextResponse.json({ role: null, isAdmin: false })
    }
    let user = await prisma.adminUser.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ role: null, isAdmin: false })
    }
    if (user.status === "active") {
      await prisma.adminUser.update({
        where: { email },
        data: { lastLogin: new Date() },
      })
    }
    return NextResponse.json({
      role: user.status === "active" ? user.role : null,
      isAdmin: user.status === "active" && user.role === "admin",
    })
  } catch (error) {
    return NextResponse.json({ error: "Auth check failed" }, { status: 500 })
  }
}

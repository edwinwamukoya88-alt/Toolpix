import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireApiAuth } from "@/lib/auth-guard"

export async function GET() {
  const authResponse = await requireApiAuth()
  if (authResponse) return authResponse
  try {
    const users = await prisma.adminUser.findMany({
      orderBy: { email: "asc" },
    })
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authResponse = await requireApiAuth()
  if (authResponse) return authResponse
  try {
    const body = await request.json()
    const existing = await prisma.adminUser.findUnique({ where: { email: body.email } })
    if (existing) {
      await prisma.adminUser.update({
        where: { email: body.email },
        data: { role: body.role ?? existing.role, status: "invited" },
      })
    } else {
      await prisma.adminUser.create({
        data: {
          email: body.email,
          role: body.role ?? "viewer",
          status: "invited",
        },
      })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to invite user" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const authResponse = await requireApiAuth()
  if (authResponse) return authResponse
  try {
    const body = await request.json()
    if (body.email === "edwinwamukoya88@gmail.com" && body.role) {
      return NextResponse.json({ error: "Cannot change super admin role" }, { status: 403 })
    }
    await prisma.adminUser.upsert({
      where: { email: body.email },
      create: {
        email: body.email,
        role: body.role ?? "viewer",
        status: body.status ?? "active",
      },
      update: {
        role: body.role !== undefined ? body.role : undefined,
        status: body.status !== undefined ? body.status : undefined,
      },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const authResponse = await requireApiAuth()
  if (authResponse) return authResponse
  try {
    const body = await request.json()
    if (body.email === "edwinwamukoya88@gmail.com") {
      return NextResponse.json({ error: "Cannot remove super admin" }, { status: 403 })
    }
    await prisma.adminUser.delete({ where: { email: body.email } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove user" }, { status: 500 })
  }
}

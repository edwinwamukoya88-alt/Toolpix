import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireApiAuth } from "@/lib/auth-guard"

export async function GET() {
  const authResponse = await requireApiAuth()
  if (authResponse) return authResponse
  try {
    let settings = await prisma.siteSetting.findUnique({ where: { id: 1 } })
    if (!settings) {
      settings = await prisma.siteSetting.create({ data: { id: 1 } })
    }
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const authResponse = await requireApiAuth()
  if (authResponse) return authResponse
  try {
    const body = await request.json()
    const settings = await prisma.siteSetting.upsert({
      where: { id: 1 },
      create: { id: 1, ...body },
      update: body,
    })
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}

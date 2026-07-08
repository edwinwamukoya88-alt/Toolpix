import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireApiAuth } from "@/lib/auth-guard"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResponse = await requireApiAuth()
  if (authResponse) return authResponse
  try {
    const { id } = await params
    const body = await request.json()
    const ad = await prisma.sponsoredAd.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.image !== undefined ? { image: body.image } : {}),
        ...(body.link !== undefined ? { link: body.link } : {}),
        ...(body.slot !== undefined ? { slot: body.slot } : {}),
        ...(body.active !== undefined ? { active: body.active } : {}),
      },
    })
    return NextResponse.json(ad)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update ad" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResponse = await requireApiAuth()
  if (authResponse) return authResponse
  try {
    const { id } = await params
    await prisma.sponsoredAd.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete ad" }, { status: 500 })
  }
}

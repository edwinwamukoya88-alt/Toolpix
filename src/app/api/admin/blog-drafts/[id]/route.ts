import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireApiAuth } from "@/lib/auth-guard"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResponse = await requireApiAuth()
  if (authResponse) return authResponse
  try {
    const { id } = await params
    const draft = await prisma.blogDraft.findUnique({ where: { id } })
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 })
    }
    return NextResponse.json(draft)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load draft" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResponse = await requireApiAuth()
  if (authResponse) return authResponse
  try {
    const { id } = await params
    const body = await request.json()
    const updateData: Record<string, unknown> = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.description !== undefined) updateData.description = body.description
    if (body.content !== undefined) updateData.content = body.content
    if (body.category !== undefined) updateData.category = body.category
    if (body.tags !== undefined) updateData.tags = JSON.stringify(body.tags)
    if (body.author !== undefined) updateData.author = body.author
    if (body.featured !== undefined) updateData.featured = body.featured
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage
    if (body.status !== undefined) updateData.status = body.status
    if (body.scheduledDate !== undefined) {
      updateData.scheduledDate = body.scheduledDate ? new Date(body.scheduledDate) : null
    }
    updateData.updatedAt = new Date()

    const draft = await prisma.blogDraft.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(draft)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update draft" }, { status: 500 })
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
    await prisma.blogDraft.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete draft" }, { status: 500 })
  }
}

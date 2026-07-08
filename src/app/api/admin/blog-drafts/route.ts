import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireApiAuth } from "@/lib/auth-guard"

export async function GET() {
  const authResponse = await requireApiAuth()
  if (authResponse) return authResponse
  try {
    const drafts = await prisma.blogDraft.findMany({
      orderBy: { updatedAt: "desc" },
    })
    return NextResponse.json(drafts)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load drafts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authResponse = await requireApiAuth()
  if (authResponse) return authResponse
  try {
    const body = await request.json()
    const now = new Date()
    const draft = await prisma.blogDraft.create({
      data: {
        id: body.id ?? Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        title: body.title,
        slug: body.slug,
        description: body.description ?? "",
        content: body.content ?? "",
        category: body.category ?? "Uncategorized",
        tags: JSON.stringify(body.tags ?? []),
        author: body.author ?? "Zilita Team",
        featured: body.featured ?? false,
        coverImage: body.coverImage ?? "",
        status: body.status ?? "draft",
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
        createdAt: now,
        updatedAt: now,
      },
    })
    return NextResponse.json(draft, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create draft" }, { status: 500 })
  }
}

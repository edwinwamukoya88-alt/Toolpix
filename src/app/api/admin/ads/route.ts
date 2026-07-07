import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const ads = await prisma.sponsoredAd.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(ads)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load ads" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const now = new Date()
    const ad = await prisma.sponsoredAd.create({
      data: {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        title: body.title,
        description: body.description ?? "",
        image: body.image ?? null,
        link: body.link,
        slot: body.slot ?? "hero",
        active: body.active ?? true,
        clicks: 0,
        impressions: 0,
        createdAt: now,
      },
    })
    return NextResponse.json(ad, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create ad" }, { status: 500 })
  }
}

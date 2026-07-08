import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { tools, categories, type Tool } from "@/lib/tools-data"
import { requireApiAuth } from "@/lib/auth-guard"

export interface ToolWithConfig extends Tool {
  enabled: boolean
  featured: boolean
  popular: boolean
  new: boolean
}

export async function GET() {
  const authResponse = await requireApiAuth()
  if (authResponse) return authResponse
  try {
    const configs = await prisma.toolConfig.findMany()
    const configMap = new Map(configs.map((c) => [c.slug, c]))
    const result: ToolWithConfig[] = tools.map((tool) => {
      const cfg = configMap.get(tool.slug)
      return {
        ...tool,
        enabled: cfg?.enabled ?? true,
        featured: cfg?.featured ?? false,
        popular: cfg?.popular ?? false,
        new: cfg?.new ?? false,
      }
    })
    return NextResponse.json({ tools: result, categories })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load tools" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const authResponse = await requireApiAuth()
  if (authResponse) return authResponse
  try {
    const body = await request.json()
    const { slug, updates } = body
    if (!slug || !updates) {
      return NextResponse.json({ error: "slug and updates required" }, { status: 400 })
    }
    await prisma.toolConfig.upsert({
      where: { slug },
      create: { slug, enabled: true, featured: false, popular: false, new: false, ...updates },
      update: updates,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update tool config" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authResponse = await requireApiAuth()
  if (authResponse) return authResponse
  try {
    const body = await request.json()
    const { slugs, updates } = body
    if (!slugs || !updates) {
      return NextResponse.json({ error: "slugs and updates required" }, { status: 400 })
    }
    for (const slug of slugs) {
      await prisma.toolConfig.upsert({
        where: { slug },
        create: { slug, enabled: true, featured: false, popular: false, new: false, ...updates },
        update: updates,
      })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to bulk update tools" }, { status: 500 })
  }
}

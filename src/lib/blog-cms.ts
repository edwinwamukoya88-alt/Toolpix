import { blogCategories } from "./blog-types"

const DRAFTS_API = "/api/admin/blog-drafts"

export interface BlogDraft {
  id: string
  title: string
  slug: string
  description: string
  content: string
  category: string
  tags: string[]
  author: string
  featured: boolean
  coverImage: string
  status: "draft" | "published" | "scheduled"
  scheduledDate?: string
  createdAt: number
  updatedAt: number
}

export interface BlogListItem {
  slug: string
  title: string
  description: string
  date: string
  category: string
  tags: string[]
  featured: boolean
  readingTime: number
  status: "published" | "draft" | "scheduled"
  aiScore: number
}

export { blogCategories }

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .replace(/^-+|-+$/g, "")
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

function parseDraft(d: any): BlogDraft {
  return {
    ...d,
    tags: typeof d.tags === "string" ? JSON.parse(d.tags) : d.tags ?? [],
    createdAt: new Date(d.createdAt).getTime(),
    updatedAt: new Date(d.updatedAt).getTime(),
    scheduledDate: d.scheduledDate ? new Date(d.scheduledDate).toISOString() : undefined,
  }
}

export async function getDrafts(): Promise<BlogDraft[]> {
  try {
    const res = await fetch(DRAFTS_API)
    if (!res.ok) return []
    const data = await res.json()
    return data.map(parseDraft)
  } catch {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("zil_blog_drafts")
        return raw ? (JSON.parse(raw) as BlogDraft[]).sort((a, b) => b.updatedAt - a.updatedAt) : []
      }
    } catch {}
    return []
  }
}

export async function getDraftById(id: string): Promise<BlogDraft | null> {
  try {
    const res = await fetch(`${DRAFTS_API}/${encodeURIComponent(id)}`)
    if (!res.ok) return null
    const data = await res.json()
    return parseDraft(data)
  } catch {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("zil_blog_drafts")
        const drafts: BlogDraft[] = raw ? JSON.parse(raw) : []
        return drafts.find((d) => d.id === id) ?? null
      }
    } catch {}
    return null
  }
}

export async function getDraftBySlug(slug: string): Promise<BlogDraft | null> {
  const drafts = await getDrafts()
  return drafts.find((d) => d.slug === slug) ?? null
}

export async function createDraft(data: {
  title: string
  description?: string
  content?: string
  category?: string
  tags?: string[]
  author?: string
  featured?: boolean
  coverImage?: string
  status?: string
  scheduledDate?: string
}): Promise<BlogDraft> {
  const now = Date.now()
  const draftData = {
    id: generateId(),
    title: data.title,
    slug: slugify(data.title),
    description: data.description ?? "",
    content: data.content ?? "",
    category: data.category ?? "Uncategorized",
    tags: data.tags ?? [],
    author: data.author ?? "Zilita Team",
    featured: data.featured ?? false,
    coverImage: data.coverImage ?? "",
    status: (data.status ?? "draft") as BlogDraft["status"],
    scheduledDate: data.scheduledDate ?? undefined,
    createdAt: now,
    updatedAt: now,
  }

  try {
    const res = await fetch(DRAFTS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draftData),
    })
    if (res.ok) {
      const created = await res.json()
      return parseDraft(created)
    }
  } catch {}

  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("zil_blog_drafts")
      const drafts: BlogDraft[] = raw ? JSON.parse(raw) : []
      const draft: BlogDraft = { ...draftData, tags: draftData.tags }
      drafts.push(draft)
      localStorage.setItem("zil_blog_drafts", JSON.stringify(drafts))
      return draft
    }
  } catch {}

  return draftData as BlogDraft
}

export async function updateDraft(
  id: string,
  data: Partial<Omit<BlogDraft, "id" | "createdAt" | "updatedAt">>,
): Promise<BlogDraft | null> {
  try {
    const res = await fetch(`${DRAFTS_API}/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) return parseDraft(await res.json())
  } catch {}

  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("zil_blog_drafts")
      const drafts: BlogDraft[] = raw ? JSON.parse(raw) : []
      const index = drafts.findIndex((d) => d.id === id)
      if (index === -1) return null
      drafts[index] = { ...drafts[index], ...data, updatedAt: Date.now() }
      localStorage.setItem("zil_blog_drafts", JSON.stringify(drafts))
      return drafts[index]
    }
  } catch {}

  return null
}

export async function deleteDraft(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${DRAFTS_API}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
    return res.ok
  } catch {}

  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("zil_blog_drafts")
      const drafts: BlogDraft[] = raw ? JSON.parse(raw) : []
      const filtered = drafts.filter((d) => d.id !== id)
      if (filtered.length === drafts.length) return false
      localStorage.setItem("zil_blog_drafts", JSON.stringify(filtered))
      return true
    }
  } catch {}

  return false
}

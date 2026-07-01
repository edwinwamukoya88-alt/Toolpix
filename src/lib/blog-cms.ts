import { blogCategories } from "./blog-types"

const DRAFTS_KEY = "tf_blog_drafts"

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

function loadDrafts(): BlogDraft[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(DRAFTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveDrafts(drafts: BlogDraft[]) {
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
}

export function getDrafts(): BlogDraft[] {
  return loadDrafts().sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getDraftById(id: string): BlogDraft | null {
  return loadDrafts().find((d) => d.id === id) ?? null
}

export function getDraftBySlug(slug: string): BlogDraft | null {
  return loadDrafts().find((d) => d.slug === slug) ?? null
}

export function createDraft(data: {
  title: string
  description?: string
  content?: string
  category?: string
  tags?: string[]
  author?: string
  featured?: boolean
  coverImage?: string
}): BlogDraft {
  const drafts = loadDrafts()
  const draft: BlogDraft = {
    id: generateId(),
    title: data.title,
    slug: slugify(data.title),
    description: data.description ?? "",
    content: data.content ?? "",
    category: data.category ?? "Uncategorized",
    tags: data.tags ?? [],
    author: data.author ?? "ToolForge Team",
    featured: data.featured ?? false,
    coverImage: data.coverImage ?? "",
    status: "draft",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  drafts.push(draft)
  saveDrafts(drafts)
  return draft
}

export function updateDraft(
  id: string,
  data: Partial<Omit<BlogDraft, "id" | "createdAt" | "updatedAt">>,
): BlogDraft | null {
  const drafts = loadDrafts()
  const index = drafts.findIndex((d) => d.id === id)
  if (index === -1) return null

  const update: Partial<BlogDraft> = {}
  if (data.title !== undefined) update.title = data.title
  if (data.slug !== undefined) update.slug = data.slug
  if (data.description !== undefined) update.description = data.description
  if (data.content !== undefined) update.content = data.content
  if (data.category !== undefined) update.category = data.category
  if (data.tags !== undefined) update.tags = data.tags
  if (data.author !== undefined) update.author = data.author
  if (data.featured !== undefined) update.featured = data.featured
  if (data.coverImage !== undefined) update.coverImage = data.coverImage
  if (data.status !== undefined) update.status = data.status
  if (data.scheduledDate !== undefined) update.scheduledDate = data.scheduledDate

  drafts[index] = { ...drafts[index], ...update, updatedAt: Date.now() }
  saveDrafts(drafts)
  return drafts[index]
}

export function deleteDraft(id: string): boolean {
  const drafts = loadDrafts()
  const filtered = drafts.filter((d) => d.id !== id)
  if (filtered.length === drafts.length) return false
  saveDrafts(filtered)
  return true
}

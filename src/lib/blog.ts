import fs from "fs"
import path from "path"
import matter from "gray-matter"
import type { BlogPost, BlogMeta } from "./blog-types"
import { calculateAIVisibilityScore, aiImprovementTips } from "./ai-score"
import { generateAIMeta } from "./ai-meta"
import { countInternalLinks } from "./ai-links"
import { AISignals } from "./ai-signals"
export type { BlogPost, BlogMeta }
export { blogCategories } from "./blog-types"
export { aiImprovementTips }

const BLOG_DIR = path.join(process.cwd(), "content", "blog")

export const articleToolMapping: Record<string, string[]> = {
  "cbc-competency-assessment": ["grade-calculator", "exam-generator", "teacher-comment-generator"],
  "cbc-grade-calculator-guide": ["grade-calculator"],
  "kicd-lesson-plan-guide": ["lesson-plan-generator", "scheme-of-work-generator"],
  "revision-planning-techniques": ["revision-planner"],
  "pomodoro-technique-guide": ["pomodoro"],
  "privacy-first-tools": [],
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

function getAIBadgeLabel(score: number): string {
  if (score >= 80) return "AI Search Ready"
  if (score >= 50) return "Improving"
  return "Needs Optimization"
}

function makeBlogAI(title: string, description: string, tags: string[], content: string) {
  const score = calculateAIVisibilityScore(content)
  const meta = generateAIMeta(title, description, tags)
  return {
    score,
    badge: getAIBadgeLabel(score),
    internalLinks: countInternalLinks(content),
    aiType: meta.aiType,
    aiTags: meta.aiTags,
    aiConfidenceBoost: meta.aiConfidenceBoost,
    signals: {
      contentType: AISignals.contentType,
      intent: AISignals.intent,
      depth: AISignals.depth,
      readability: AISignals.readability,
      extractable: AISignals.extractable,
    },
  }
}

function buildMeta(fm: Record<string, unknown>, content: string, slug: string): BlogMeta {
  const title = String(fm.title || slug)
  const description = String(fm.description || "")
  const tags = (fm.tags as string[]) || []
  return {
    slug,
    title,
    description,
    date: String(fm.date || new Date().toISOString()),
    author: String(fm.author || "ToolForge Team"),
    category: String(fm.category || "Uncategorized"),
    tags,
    featured: Boolean(fm.featured),
    coverImage: String(fm.coverImage || ""),
    readingTime: calculateReadingTime(content),
    ai: makeBlogAI(title, description, tags, content),
  }
}

function buildPost(fm: Record<string, unknown>, content: string, slug: string): BlogPost {
  const title = String(fm.title || slug)
  const description = String(fm.description || "")
  const tags = (fm.tags as string[]) || []
  return {
    slug,
    title,
    description,
    date: String(fm.date || new Date().toISOString()),
    author: String(fm.author || "ToolForge Team"),
    category: String(fm.category || "Uncategorized"),
    tags,
    featured: Boolean(fm.featured),
    coverImage: String(fm.coverImage || ""),
    content,
    readingTime: calculateReadingTime(content),
    ai: makeBlogAI(title, description, tags, content),
  }
}

export function getAllPosts(): BlogMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return []

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"))

  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, "")
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8")
    const { data, content } = matter(raw)
    return buildMeta(data, content, slug)
  })

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getFeaturedPost(): BlogMeta | null {
  const posts = getAllPosts()
  return posts.find((p) => p.featured) || posts[0] || null
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)

  return buildPost(data, content, slug)
}

export function getRelatedPosts(currentSlug: string, category: string, limit = 3): BlogMeta[] {
  const posts = getAllPosts().filter((p) => p.slug !== currentSlug)
  const sameCategory = posts.filter((p) => p.category === category)
  const related = sameCategory.length >= limit ? sameCategory : posts
  return related.slice(0, limit)
}

export function getPostsByCategory(category: string): BlogMeta[] {
  return getAllPosts().filter((p) => p.category === category)
}

export function getToolSlugsForArticle(slug: string): string[] {
  return articleToolMapping[slug] || []
}

export function getLatestPosts(limit = 3): BlogMeta[] {
  return getAllPosts().slice(0, limit)
}

export function getBlogSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs.readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""))
}

export function getAllBlogs(): BlogMeta[] {
  return getAllPosts()
}

export function getBlogBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (fs.existsSync(filePath)) return getPostBySlug(slug)

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"))
  for (const file of files) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8")
    const { data } = matter(raw)
    const fmSlug = data.slug
    if (fmSlug === slug) {
      return getPostBySlug(file.replace(/\.mdx$/, ""))
    }
  }

  return null
}

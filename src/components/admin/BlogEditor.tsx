"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Save, Send, Clock, Sparkles, Eye, ArrowLeft,
  Image as ImageIcon, Tag, Hash,
} from "lucide-react"
import {
  slugify, calculateReadingTime, createDraft, updateDraft,
  blogCategories, type BlogDraft,
} from "@/lib/blog-cms"

interface BlogEditorProps {
  draft?: BlogDraft | null
}

export function BlogEditor({ draft }: BlogEditorProps) {
  const router = useRouter()
  const isEditing = !!draft

  const [title, setTitle] = useState(draft?.title ?? "")
  const [slug, setSlug] = useState(draft?.slug ?? "")
  const [content, setContent] = useState(draft?.content ?? "")
  const [description, setDescription] = useState(draft?.description ?? "")
  const [category, setCategory] = useState(draft?.category ?? "Uncategorized")
  const [tagsInput, setTagsInput] = useState(draft?.tags?.join(", ") ?? "")
  const [featured, setFeatured] = useState(draft?.featured ?? false)
  const [coverImage, setCoverImage] = useState(draft?.coverImage ?? "")
  const [author, setAuthor] = useState(draft?.author ?? "ToolForge Team")
  const [status, setStatus] = useState(draft?.status ?? "draft")
  const [saving, setSaving] = useState(false)
  const [autoSlug, setAutoSlug] = useState(!draft)

  const handleTitleChange = useCallback((value: string) => {
    setTitle(value)
    if (autoSlug) {
      setSlug(slugify(value))
    }
  }, [autoSlug])

  const readingTime = calculateReadingTime(content)

  const tags = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)

  async function handleSave(publishStatus: "draft" | "published") {
    setSaving(true)
    try {
      const data = {
        title,
        slug,
        description,
        content,
        category,
        tags,
        author,
        featured,
        coverImage,
        status: publishStatus,
      }

      if (isEditing && draft) {
        await updateDraft(draft.id, data)
      } else {
        await createDraft(data)
      }

      router.push("/admin/blog")
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/admin/blog")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to articles
        </button>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {readingTime} min read
          </span>
          <button
            onClick={() => handleSave("draft")}
            disabled={saving || !title.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving || !title.trim() || !content.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {isEditing ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter article title"
              className="w-full rounded-lg border border-border/50 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Hash className="h-3 w-3" />
              Slug
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setAutoSlug(false) }}
                placeholder="article-url-slug"
                className="flex-1 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 font-mono"
              />
              {!autoSlug && (
                <button
                  onClick={() => { setSlug(slugify(title)); setAutoSlug(true) }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Auto
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description for search engines and previews"
              rows={2}
              className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Content * <span className="text-muted-foreground/60 font-normal">(Markdown supported)</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article content in Markdown..."
              rows={20}
              className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 font-mono resize-y leading-relaxed"
            />
          </div>

          {content && (
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Preview</span>
              </div>
              <div className="prose prose-sm prose-invert max-w-none">
                <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {content}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border/50 bg-card p-4 space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Settings</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              >
                {blogCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="productivity, cbc, education"
                className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                Cover Image URL
              </label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded border-border/50"
              />
              <span className="text-sm">Featured article</span>
            </label>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SEO Preview</h3>
            <div className="space-y-1 p-3 rounded-lg border border-border/30 bg-background">
              <p className="text-xs text-blue-500 truncate">
                https://toolforge.vercel.app/blog/{slug || "article-slug"}
              </p>
              <p className="text-sm font-semibold text-foreground leading-tight truncate">
                {title || "Article Title"}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {description || "Article description will appear here..."}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span>AI Score: — (available after publishing)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

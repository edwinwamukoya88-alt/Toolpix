"use client"

import { getAIBadge } from "@/lib/ai-badge"

interface SEOInspectorProps {
  post: {
    title: string
    slug: string
    aiScore?: number
    internalLinks?: number
    aiStatus?: string
  }
}

export default function SEOInspector({ post }: SEOInspectorProps) {
  const score = post.aiScore ?? 0
  const badge = getAIBadge(score)

  return (
    <div className="rounded-lg border bg-background/40 p-3 space-y-2 text-xs">
      <div className="font-medium text-sm truncate mb-2" title={post.title}>
        {post.title}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">AI Score</span>
        <span className={`font-medium ${badge.color}`}>{score}/100</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Internal Links</span>
        <span className="font-medium">{post.internalLinks ?? 0}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">AI Status</span>
        <span className={`inline-flex items-center gap-1 ${badge.color}`}>
          {badge.emoji} {badge.label}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Slug</span>
        <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[180px]">
          {post.slug}
        </span>
      </div>
    </div>
  )
}

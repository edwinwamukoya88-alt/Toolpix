"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TocItem {
  id: string
  text: string
  level: number
}

export default function TableOfContents() {
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const headings = document.querySelectorAll(".blog-content h2, .blog-content h3")
    const tocItems: TocItem[] = Array.from(headings).map((h) => ({
      id: h.id,
      text: h.textContent || "",
      level: h.tagName === "H2" ? 2 : 3,
    }))
    const rafId = requestAnimationFrame(() => setItems(tocItems))

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    )

    headings.forEach((h) => observer.observe(h))
    return () => { cancelAnimationFrame(rafId); observer.disconnect() }
  }, [])

  if (items.length === 0) return null

  return (
    <nav className="space-y-1">
      <h4 className="text-sm font-semibold mb-3">On this page</h4>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={cn(
            "block text-sm transition-colors py-1 border-l-2 pl-3",
            activeId === item.id
              ? "text-primary border-primary font-medium"
              : "text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground",
            item.level === 3 && "pl-6"
          )}
        >
          {item.text}
        </a>
      ))}
    </nav>
  )
}

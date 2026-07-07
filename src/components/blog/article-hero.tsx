"use client"

import Link from "next/link"
import { ArrowLeft, Calendar, User } from "lucide-react"
import BlogCoverImage from "./blog-cover-image"
import CategoryBadge from "./category-badge"
import ReadingTimeBadge from "./reading-time-badge"
import { formatDate, cn } from "@/lib/utils"

interface ArticleHeroProps {
  title: string
  description: string
  coverImage: string
  category: string
  author: string
  date: string
  readingTime: number
  className?: string
}

export default function ArticleHero({
  title,
  description,
  coverImage,
  category,
  author,
  date,
  readingTime,
  className,
}: ArticleHeroProps) {
  return (
    <div className={cn("relative", className)}>
      <BlogCoverImage coverImage={coverImage} title={title} size="article" className="rounded-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 container pb-8 md:pb-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-muted-foreground mb-3">
            <CategoryBadge category={category} showIcon />
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(date, "long")}
            </span>
            <ReadingTimeBadge minutes={readingTime} className="text-xs md:text-sm" />
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {author}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl">{description}</p>
        </div>
      </div>
    </div>
  )
}

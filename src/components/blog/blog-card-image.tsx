"use client"

import { cn } from "@/lib/utils"
import BlogCoverImage from "./blog-cover-image"

interface BlogCardImageProps {
  coverImage: string
  title?: string
  className?: string
}

export default function BlogCardImage({ coverImage, title, className }: BlogCardImageProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl",
        "group/image",
        className,
      )}
      style={{ aspectRatio: "16/9" }}
    >
      <div className="absolute inset-0 transition-transform duration-700 group-hover/image:scale-110">
        <BlogCoverImage
          coverImage={coverImage}
          title={title}
          size="card"
          className="h-full w-full rounded-none"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-500" />
    </div>
  )
}

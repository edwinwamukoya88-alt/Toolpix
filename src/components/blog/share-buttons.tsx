"use client"

import { Link2, X, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ShareButtonsProps {
  title: string
  slug: string
}

const BASE_URL = "https://smart-tools-kit.vercel.app"

export default function ShareButtons({ title, slug }: ShareButtonsProps) {
  const blogUrl = `${BASE_URL}/blog/${slug}`
  const encodedUrl = encodeURIComponent(blogUrl)
  const encodedTitle = encodeURIComponent(title)

  const copyLink = () => {
    navigator.clipboard.writeText(blogUrl)
    toast.success("Link copied to clipboard")
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground mr-1">Share:</span>
      <Button variant="ghost" size="icon" onClick={copyLink} className="h-8 w-8" title="Copy link">
        <Link2 className="h-4 w-4" />
      </Button>
      <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer">
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Share on Twitter/X">
          <X className="h-4 w-4" />
        </Button>
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer">
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Share on LinkedIn">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </a>
    </div>
  )
}

import type { Metadata } from "next"
import { getAllPosts, getFeaturedPost } from "@/lib/blog"
import BlogHomeClient from "./blog-home-client"
import type { BlogMeta } from "@/lib/blog-types"

export const metadata: Metadata = {
  title: "Blog - ToolForge | Privacy-First Productivity & Education Guides",
  description: "Read guides on CBC education, productivity techniques, privacy tips, and tool tutorials. All content from the ToolForge team.",
  openGraph: {
    title: "Blog - ToolForge",
    description: "Guides on CBC education, productivity, privacy, and more.",
    url: "https://toolforge.app/blog",
    siteName: "ToolForge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - ToolForge",
    description: "Guides on CBC education, productivity, privacy, and more.",
  },
}

export default function BlogPage() {
  const posts = getAllPosts()
  const featured = getFeaturedPost()

  const postsJson: BlogMeta[] = posts.map((p) => ({
    ...p,
    date: p.date,
  }))

  return <BlogHomeClient posts={postsJson} featured={featured} />
}

import type { Metadata } from "next"
import { getAllBlogs, getFeaturedPost } from "@/lib/blog"
import BlogHomeClient from "./blog-home-client"
import type { BlogMeta } from "@/lib/blog-types"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://smart-tools-kit.vercel.app"

export const metadata: Metadata = {
  title: "Blog",
  description: "Read guides on CBC education, productivity techniques, privacy tips, and tool tutorials. All content from the ToolForge team.",
  openGraph: {
    title: "Blog - ToolForge",
    description: "Guides on CBC education, productivity, privacy, and more.",
    url: `${siteUrl}/blog`,
    siteName: "ToolForge",
    type: "website",
    images: [{ url: `${siteUrl}/api/og?title=ToolForge+Blog&category=Productivity&type=site`, width: 1200, height: 630, alt: "ToolForge Blog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - ToolForge",
    description: "Guides on CBC education, productivity, privacy, and more.",
  },
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
}

export default function BlogPage() {
  const posts = getAllBlogs()
  const featured = getFeaturedPost()

  const postsJson: BlogMeta[] = posts.map((p) => ({
    ...p,
    date: p.date,
  }))

  return <BlogHomeClient posts={postsJson} featured={featured} />
}

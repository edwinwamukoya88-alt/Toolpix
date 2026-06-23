import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBlogBySlug, getAllBlogs, getBlogSlugs, getRelatedPosts, getToolSlugsForArticle } from "@/lib/blog"
import BlogArticleClient from "./blog-article-client"

export async function generateStaticParams() {
  const slugs = getBlogSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogBySlug(slug)
  if (!post) return {}

  const ogImageUrl = `https://toolforge.app/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category)}`

  return {
    title: `${post.title} - ToolForge Blog`,
    description: post.description,
    keywords: [post.imageKeywords, post.tags.join(", ")].filter(Boolean).join(", "),
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://toolforge.app/blog/${post.slug}`,
      siteName: "ToolForge",
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `https://toolforge.app/blog/${post.slug}`,
    },
    other: {
      "image-prompt": post.imagePrompt,
      "image-keywords": post.imageKeywords,
    },
  }
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getBlogBySlug(slug)

  if (!post) notFound()

  const relatedPosts = getRelatedPosts(post.slug, post.category)
  const toolSlugs = getToolSlugsForArticle(post.slug)

  return (
    <BlogArticleClient
      post={post}
      relatedPosts={relatedPosts}
      toolSlugs={toolSlugs}
    />
  )
}

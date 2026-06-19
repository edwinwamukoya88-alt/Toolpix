import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAllPosts, getPostBySlug, getRelatedPosts, getToolSlugsForArticle } from "@/lib/blog"
import BlogArticleClient from "./blog-article-client"

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  return {
    title: `${post.title} - ToolForge Blog`,
    description: post.description,
    keywords: post.tags.join(", "),
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
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `https://toolforge.app/blog/${post.slug}`,
    },
  }
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)

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

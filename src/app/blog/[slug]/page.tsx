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

  const ogImageUrl = `https://smart-tools-kit.vercel.app/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category)}`

  return {
    title: `${post.title} - ToolForge Blog`,
    description: post.description,
    keywords: [post.imageKeywords, post.tags.join(", ")].filter(Boolean).join(", "),
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://smart-tools-kit.vercel.app/blog/${post.slug}`,
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
      canonical: `https://smart-tools-kit.vercel.app/blog/${post.slug}`,
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

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    author: {
      "@type": "Person",
      name: post.author,
    },
    datePublished: post.date,
    dateModified: post.date,
    image: `https://smart-tools-kit.vercel.app/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category)}`,
    publisher: {
      "@type": "Organization",
      name: "ToolForge",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://smart-tools-kit.vercel.app/blog/${post.slug}`,
    },
    keywords: post.tags.join(", "),
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://smart-tools-kit.vercel.app" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://smart-tools-kit.vercel.app/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://smart-tools-kit.vercel.app/blog/${post.slug}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BlogArticleClient
        post={post}
        relatedPosts={relatedPosts}
        toolSlugs={toolSlugs}
      />
    </>
  )
}

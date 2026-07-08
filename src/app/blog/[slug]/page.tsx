import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBlogBySlug, getAllBlogs, getBlogSlugs, getRelatedPosts, getToolSlugsForArticle } from "@/lib/blog"
import { getBlogCoverUrl } from "@/lib/blog-og-config"
import { getAppUrl } from "@/lib/app-url"
import BlogArticleClient from "./blog-article-client"

export async function generateStaticParams() {
  const slugs = getBlogSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogBySlug(slug)
  if (!post) return {}

  const ogImageUrl = getBlogCoverUrl(post.title, post.category)
  const canonicalUrl = getAppUrl(`/blog/${post.slug}`)

  return {
    title: `${post.title} - Zilita Blog`,
    description: post.description,
    keywords: [post.imageKeywords, post.tags.join(", ")].filter(Boolean).join(", "),
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonicalUrl,
      siteName: "Zilita",
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.imageAlt || `${post.title} - Zilita Blog`,
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
      canonical: canonicalUrl,
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
  const ogImageUrl = getBlogCoverUrl(post.title, post.category)
  const canonicalUrl = getAppUrl(`/blog/${post.slug}`)
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zilita.com"

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
    image: ogImageUrl,
    publisher: {
      "@type": "Organization",
      name: "Zilita",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    keywords: post.tags.join(", "),
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl },
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

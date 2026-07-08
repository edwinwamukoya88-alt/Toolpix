import type { Metadata } from "next"
import { tools } from "@/lib/tools-data"
import { notFound } from "next/navigation"
import { getAppUrl } from "@/lib/app-url"
import ToolPageClient from "./tool-client"

const slugAliases: Record<string, string> = {
  todo: "planner",
}

export function generateStaticParams() {
  return [...tools.filter((tool) => tool.slug !== "ai-workspace").map((tool) => ({ slug: tool.slug })), { slug: "todo" }]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const resolvedSlug = slugAliases[slug] || slug
  const tool = tools.find((t) => t.slug === resolvedSlug)
  if (!tool) return {}
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zilita.com"
  const ogImageUrl = `${siteUrl}/api/og?title=${encodeURIComponent(tool.name)}&category=${encodeURIComponent(tool.category)}&type=tool`
  const canonicalUrl = getAppUrl(`/tools/${tool.slug}`)
  return {
    title: tool.name,
    description: tool.description,
    openGraph: {
      title: `${tool.name} - Zilita`,
      description: tool.description,
      url: canonicalUrl,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: tool.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} - Zilita`,
      description: tool.description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const resolvedSlug = slugAliases[slug] || slug
  const tool = tools.find((t) => t.slug === resolvedSlug)
  if (!tool) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zilita.com"

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Tools", item: `${siteUrl}/tools` },
      { "@type": "ListItem", position: 3, name: tool.name, item: `${siteUrl}/tools/${tool.slug}` },
    ],
  }

  const toolJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    applicationCategory: "Utility",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd) }}
      />
      <ToolPageClient slug={slug} tool={tool} />
    </>
  )
}

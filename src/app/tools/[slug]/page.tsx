import type { Metadata } from "next"
import { tools } from "@/lib/tools-data"
import { notFound } from "next/navigation"
import ToolPageClient from "./tool-client"

const slugAliases: Record<string, string> = {
  todo: "planner",
}

export function generateStaticParams() {
  return [...tools.map((tool) => ({ slug: tool.slug })), { slug: "todo" }]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const resolvedSlug = slugAliases[slug] || slug
  const tool = tools.find((t) => t.slug === resolvedSlug)
  if (!tool) return {}
  const ogImageUrl = `https://toolforge.app/api/og?title=${encodeURIComponent(tool.name)}&category=${encodeURIComponent(tool.category)}&type=tool`
  return {
    title: tool.name,
    description: tool.description,
    openGraph: {
      title: `${tool.name} - ToolForge`,
      description: tool.description,
      url: `https://toolforge.app/tools/${tool.slug}`,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: tool.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} - ToolForge`,
      description: tool.description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `https://toolforge.app/tools/${tool.slug}`,
    },
  }
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const resolvedSlug = slugAliases[slug] || slug
  const tool = tools.find((t) => t.slug === resolvedSlug)
  if (!tool) notFound()

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://toolforge.app" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://toolforge.app/tools" },
      { "@type": "ListItem", position: 3, name: tool.name, item: `https://toolforge.app/tools/${tool.slug}` },
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

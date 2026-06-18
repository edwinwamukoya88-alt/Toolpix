import { tools } from "@/lib/tools-data"
import { notFound } from "next/navigation"
import ToolPageClient from "./tool-client"

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }))
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tool = tools.find((t) => t.slug === slug)
  if (!tool) notFound()
  return <ToolPageClient slug={slug} tool={tool} />
}

import { tools } from "@/lib/tools-data"
import { notFound } from "next/navigation"
import ToolPageClient from "./tool-client"

const slugAliases: Record<string, string> = {
  todo: "planner",
}

export function generateStaticParams() {
  return [...tools.map((tool) => ({ slug: tool.slug })), { slug: "todo" }]
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const resolvedSlug = slugAliases[slug] || slug
  const tool = tools.find((t) => t.slug === resolvedSlug)
  if (!tool) notFound()
  return <ToolPageClient slug={slug} tool={tool} />
}

import { renderKicdPrintHtml, type RenderOptions } from "./document-renderer"

export function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/(\*{1,3})(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1")
    .replace(/^---+/gm, "")
    .replace(/^\*\*\*+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/^\|/gm, "")
    .replace(/\|$/gm, "")
    .replace(/^[\s\-:\|]+\n/gm, "")
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export function markdownToPrintHtml(
  markdown: string,
  title: string,
  featureName: string,
  featureId?: string,
  settings?: Record<string, string>,
): string {
  const opts: RenderOptions = {
    markdown,
    settings: settings || {},
    featureName,
    featureId: featureId || "lesson-planner",
    generatedAt: new Date(),
  }
  return renderKicdPrintHtml(opts)
}

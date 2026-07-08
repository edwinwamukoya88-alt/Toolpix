import { calculateAIVisibilityScore, aiImprovementTips } from "./ai-score"
import { findAILinks, countInternalLinks } from "./ai-links"
import { generateAIMeta } from "./ai-meta"
import { tools } from "./tools-data"

export type ContentType = "blog" | "tool" | "landing"

function ensureQuickAnswerBlock(content: string, title: string): string {
  if (content.includes("Quick AI Answer") || content.includes("Quick Answer")) return content
  const block = [
    "## Quick AI Answer",
    "",
    `- **One-line definition**: ${title} helps users accomplish their goals more efficiently.`,
    `- **Simple explanation**: This guide breaks down the key concepts and provides actionable steps you can follow.`,
    `- **Practical use case**: Apply these strategies to improve your workflow and achieve better results.`,
    `- **Related Zilita tools**: Use our free tools to put these concepts into practice.`,
    "",
  ].join("\n")

  const headingMatch = content.match(/^(#+\s+.+)$/m)
  if (headingMatch && headingMatch.index !== undefined) {
    const insertAt = headingMatch.index + headingMatch[0].length
    return content.slice(0, insertAt) + "\n\n" + block + content.slice(insertAt)
  }
  return block + "\n" + content
}

function ensureKeyTakeawayBlock(content: string, title: string): string {
  if (content.includes("Key Takeaway") || content.includes("Key Takeaway")) return content
  const block = [
    "## Key Takeaway",
    "",
    `- **One sentence summary**: ${title} provides clear strategies and practical steps to help you succeed.`,
    `- **Core insight**: Success comes from consistent application of the right techniques and tools.`,
    `- **Practical result**: Apply what you learn to see measurable improvements in your daily workflow.`,
    "",
  ].join("\n")

  const headingMatch = content.match(/^(#+\s+.+)$/m)
  if (headingMatch && headingMatch.index !== undefined) {
    const insertAt = headingMatch.index + headingMatch[0].length
    return content.slice(0, insertAt) + "\n\n" + block + content.slice(insertAt)
  }
  return block + "\n" + content
}

function strengthenHeadings(content: string): string {
  return content.replace(/^##\s+(?!🧠|📌)(.+)$/gm, (match, heading) => {
    const trimmed = heading.trim()
    const lower = trimmed.toLowerCase()
    if (lower.startsWith("how ") || lower.startsWith("what ") || lower.startsWith("why ")) {
      return `## ${trimmed.endsWith("?") ? trimmed : `${trimmed}?`}`
    }
    if (
      !lower.includes("definition") &&
      !lower.includes("summary") &&
      !lower.includes("answer") &&
      !lower.includes("takeaway") &&
      !lower.includes("tools") &&
      trimmed.length < 60 &&
      !trimmed.endsWith("?")
    ) {
      return `## How to ${trimmed[0]?.toLowerCase() ?? ""}${trimmed.slice(1)}?`
    }
    return match
  })
}

function addBulletPoints(content: string): string {
  const paragraphs = content.split("\n\n")
  const result: string[] = []
  for (const para of paragraphs) {
    const trimmed = para.trim()
    if (
      trimmed.length > 120 &&
      !trimmed.startsWith("-") &&
      !trimmed.startsWith("*") &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith(">") &&
      !trimmed.startsWith("1.") &&
      !trimmed.includes("\n-") &&
      (trimmed.includes(" steps ") || trimmed.includes(" tips ") || trimmed.includes(" ways ") || trimmed.includes(" strategies ") || trimmed.includes(" methods ") || trimmed.includes(" techniques "))
    ) {
      const sentences = trimmed.split(/(?<=\.)\s+/)
      if (sentences.length >= 3) {
        const bulleted = sentences.slice(0, 5).map((s) => {
          const clean = s.replace(/^[-\s]*/, "")
          return `- ${clean}`
        }).join("\n")
        result.push(bulleted)
        continue
      }
    }
    result.push(trimmed)
  }
  return result.join("\n\n")
}

function injectToolLinks(content: string): string {
  const existingCount = countInternalLinks(content)
  if (existingCount >= 3) return content

  const aiLinks = findAILinks(content)
  const seen = new Set<string>()
  let result = content
  for (const link of aiLinks) {
    if (seen.has(link.url)) continue
    seen.add(link.url)
    const tool = tools.find((t) => `/tools/${t.slug}` === link.url)
    if (tool) {
      const line = `\n- [${tool.name}](${link.url}) — ${tool.description}`
      const toolsSection = result.match(/## Tools You Can Use[\s\S]*?(?=## |$)/)
      if (toolsSection && toolsSection.index !== undefined) {
        const sectionEnd = toolsSection.index + toolsSection[0].length
        result = result.slice(0, sectionEnd) + line + result.slice(sectionEnd)
      } else {
        const summaryMatch = result.match(/## Summary/)
        if (summaryMatch && summaryMatch.index !== undefined) {
          result = result.slice(0, summaryMatch.index) + "## Tools You Can Use\n\nUse these free Zilita tools to get started:\n" + line + "\n\n" + result.slice(summaryMatch.index)
        }
      }
    }
  }
  return result
}

function addMetaDescription(title: string): string {
  const meta = generateAIMeta(title, title, [])
  return meta.aiSummary
}

export function improvePageContent(content: string, type: ContentType, title?: string): string {
  let improved = content

  if (type === "blog" || type === "landing") {
    improved = ensureQuickAnswerBlock(improved, title || "This guide")
    improved = ensureKeyTakeawayBlock(improved, title || "This guide")
    improved = strengthenHeadings(improved)
    improved = addBulletPoints(improved)
  }

  improved = injectToolLinks(improved)

  const score = calculateAIVisibilityScore(improved)
  const tips = aiImprovementTips(score)

  return improved
}

export function getPageOptimizationScore(content: string, type: ContentType): { score: number; tips: string[] } {
  const score = calculateAIVisibilityScore(content)
  const tips = aiImprovementTips(score)
  return { score, tips }
}

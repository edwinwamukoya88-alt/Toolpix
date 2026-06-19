const STRUCTURED_SECTIONS = ["Definition", "Steps", "Summary", "Quick Answer", "How It Works", "Step-by-Step Guide", "Examples", "Tools You Can Use"]

const ENTITY_KEYWORDS = [
  "CBC", "KICD", "Competency", "Curriculum", "Assessment",
  "Productivity", "Study", "Teacher", "Student", "Lesson",
  "Planning", "Revision", "Exam", "Grade", "Learning",
]

function countOccurrences(text: string, keywords: string[]): number {
  let count = 0
  for (const kw of keywords) {
    const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
    const matches = text.match(regex)
    if (matches) count += matches.length
  }
  return count
}

export function calculateAIVisibilityScore(content: string): number {
  let score = 0

  const headingRegex = /^##\s+(.+)$/gm
  const headings: string[] = []
  let match
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push(match[1].trim())
  }

  const structuredCount = STRUCTURED_SECTIONS.filter((s) =>
    headings.some((h) => h.toLowerCase().includes(s.toLowerCase()))
  ).length
  score += Math.min(structuredCount * 12, 36)

  const internalLinks = (content.match(/\(\/tools\/[^)]+\)/g) || []).length
  score += Math.min(internalLinks * 5, 20)

  const bulletPoints = (content.match(/^\s*[-*+]\s/gm) || []).length
  const numberedSteps = (content.match(/^\s*\d+\.\s/gm) || []).length
  const formattingScore = Math.min(Math.floor((bulletPoints + numberedSteps) / 2), 15)
  score += formattingScore

  const entityCount = countOccurrences(content, ENTITY_KEYWORDS)
  score += Math.min(entityCount * 2, 20)

  const totalWords = content.split(/\s+/).length
  if (totalWords >= 800) score += 5
  else if (totalWords >= 500) score += 3
  else if (totalWords >= 300) score += 1

  const hasQuickAnswer = headings.some((h) => /quick\s*answer/i.test(h))
  if (hasQuickAnswer) score += 4

  const hasKeyTakeaway = headings.some((h) => /key takeaway/i.test(h))
  if (hasKeyTakeaway) score += 3

  return Math.min(Math.max(Math.round(score), 0), 100)
}

export function aiImprovementTips(score: number): string[] {
  if (score >= 70) return ["Content is AI-ready"]
  const tips: string[] = []
  if (score < 40) tips.push("Add Quick Answer section")
  if (score < 50) tips.push("Increase bullet points")
  if (score < 60) tips.push("Add internal tool links")
  if (score < 70) tips.push("Simplify paragraphs")
  return tips
}

export interface AIMeta {
  aiTitle: string
  aiSummary: string
  aiTags: string[]
  aiType: "guide" | "how-to" | "definition"
  aiConfidenceBoost: boolean
}

const AI_TYPE_KEYWORDS: Record<string, "guide" | "how-to" | "definition"> = {
  "what is": "definition",
  "what are": "definition",
  "definition": "definition",
  "meaning": "definition",
  "how to": "how-to",
  "how do": "how-to",
  "step by step": "how-to",
  "steps": "how-to",
  "guide": "guide",
  "tips": "guide",
  "strategies": "guide",
  "best practices": "guide",
}

export function generateAIMeta(title: string, description: string, tags: string[]): AIMeta {
  const lower = `${title} ${description}`.toLowerCase()

  let aiType: "guide" | "how-to" | "definition" = "guide"
  for (const [keyword, type] of Object.entries(AI_TYPE_KEYWORDS)) {
    if (lower.includes(keyword)) {
      aiType = type
      break
    }
  }

  const aiTitle = title.length > 60 ? title.slice(0, 57) + "..." : title

  const aiSummary = description.length > 160 ? description.slice(0, 157) + "..." : description

  const baseTags = [...new Set(tags.map((t) => t.toLowerCase().trim()))]
  const extraTags: string[] = []
  const tagMap: Record<string, string[]> = {
    guide: ["tutorial", "walkthrough"],
    "how-to": ["tutorial", "instructions"],
    definition: ["explanation", "overview"],
  }
  if (tagMap[aiType]) {
    for (const t of tagMap[aiType]) {
      if (!baseTags.includes(t)) extraTags.push(t)
    }
  }

  if (/cbc|kicd|competency|curriculum/i.test(lower)) {
    if (!baseTags.includes("cbc")) extraTags.push("cbc")
    if (!baseTags.includes("education")) extraTags.push("education")
  }
  if (/productivity|time management|focus/i.test(lower)) {
    if (!baseTags.includes("productivity")) extraTags.push("productivity")
  }
  if (/teacher|lesson|classroom/i.test(lower)) {
    if (!baseTags.includes("teachers")) extraTags.push("teachers")
  }
  if (/student|study|revision|exam/i.test(lower)) {
    if (!baseTags.includes("students")) extraTags.push("students")
  }

  const aiTags = [...baseTags, ...extraTags]

  const confidenceBoost = aiType !== "definition" || internalLinksExist(lower)

  return { aiTitle, aiSummary, aiTags, aiType, aiConfidenceBoost: confidenceBoost }
}

function internalLinksExist(text: string): boolean {
  return /\/tools\//i.test(text)
}

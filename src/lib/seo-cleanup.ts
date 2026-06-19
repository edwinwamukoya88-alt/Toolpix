const SPELLING_CORRECTIONS: [RegExp, string][] = [
  [/easly/gi, "easily"],
  [/cnovertion/gi, "conversion"],
  [/managemant/gi, "management"],
  [/studnet/gi, "student"],
  [/tehcnique/gi, "technique"],
  [/acheive/gi, "achieve"],
  [/recieve/gi, "receive"],
  [/occured/gi, "occurred"],
  [/occuring/gi, "occurring"],
  [/ocurrence/gi, "occurrence"],
  [/definately/gi, "definitely"],
  [/seperate/gi, "separate"],
  [/begining/gi, "beginning"],
  [/neccessary/gi, "necessary"],
  [/embeded/gi, "embedded"],
  [/priviledge/gi, "privilege"],
  [/publically/gi, "publicly"],
  [/accomodate/gi, "accommodate"],
  [/wether/gi, "whether"],
  [/alot/gi, "a lot"],
  [/cant/gi, "cannot"],
  [/dont/gi, "do not"],
  [/wont/gi, "will not"],
  [/didnt/gi, "did not"],
  [/doesnt/gi, "does not"],
  [/isnt/gi, "is not"],
  [/arent/gi, "are not"],
  [/wasnt/gi, "was not"],
  [/wouldnt/gi, "would not"],
  [/couldnt/gi, "could not"],
  [/shouldnt/gi, "should not"],
  [/havent/gi, "have not"],
  [/hasnt/gi, "has not"],
  [/its a/gi, "it is a"],
  [/its an/gi, "it is an"],
  [/its the/gi, "it is the"],
]

const FILLER_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "it", "its", "are", "was",
  "were", "be", "been", "being", "have", "has", "had", "do", "does",
  "did", "will", "would", "can", "could", "should", "may", "might",
  "shall", "about", "into", "over", "after", "before", "between",
  "under", "again", "further", "then", "once", "here", "there",
  "when", "where", "why", "how", "all", "each", "every", "both",
  "few", "more", "most", "other", "some", "such", "no", "nor", "not",
  "only", "own", "same", "so", "than", "too", "very", "just",
  "because", "but", "also", "if", "then", "else", "thus",
])

export function correctSpelling(text: string): string {
  let result = text
  for (const [pattern, replacement] of SPELLING_CORRECTIONS) {
    result = result.replace(pattern, replacement)
  }
  return result
}

export function optimizeTitle(title: string): string {
  const trimmed = title.trim()
  const words = trimmed.split(/\s+/)
  const capitalized = words.map((word, i) => {
    const lower = word.toLowerCase()
    const minorWords = new Set([
      "a", "an", "the", "and", "or", "but", "in", "on", "at", "to",
      "for", "of", "with", "by", "from", "as", "is", "it", "its",
    ])
    if (i > 0 && minorWords.has(lower)) return lower
    return word[0]?.toUpperCase() + word.slice(1)
  })
  return capitalized.join(" ")
}

export function validateDescription(description: string): {
  valid: boolean
  issues: string[]
  fixed: string
} {
  const issues: string[] = []
  let fixed = description.trim()

  if (fixed.length < 120) {
    issues.push(`Too short (${fixed.length} chars, minimum 120)`)
  }
  if (fixed.length > 160) {
    issues.push(`Too long (${fixed.length} chars, maximum 160)`)
    fixed = fixed.slice(0, 157).replace(/\s+\S*$/, "") + "..."
  }

  if (!fixed.endsWith(".") && !fixed.endsWith("!") && !fixed.endsWith("?")) {
    issues.push("Description does not end with sentence-ending punctuation")
    fixed = fixed + "."
  }

  const lower = fixed[0] ?? ""
  if (lower && lower !== lower.toUpperCase()) {
    issues.push("Description should start with a capital letter")
    fixed = fixed[0].toUpperCase() + fixed.slice(1)
  }

  return { valid: issues.length === 0, issues, fixed: fixed.slice(0, 160) }
}

export function cleanTags(tags: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const raw of tags) {
    let tag = raw.trim().replace(/[^a-zA-Z0-9\s-]/g, "")
    tag = tag.replace(/\s+/g, " ")
    if (!tag) continue
    tag = tag.split(/\s+/).map((w) => w[0]?.toUpperCase() + w.slice(1).toLowerCase()).join(" ")
    const key = tag.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      result.push(tag)
    }
  }
  return result
}

export function optimizeSlug(slug: string): string {
  let result = slug.toLowerCase().replace(/[^a-z0-9\s-]/g, "")
  const words = result.split(/[\s-]+/).filter((w) => w && !FILLER_WORDS.has(w))
  const seen = new Set<string>()
  const deduped = words.filter((w) => {
    const key = w.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  return deduped.join("-").replace(/-{2,}/g, "-").replace(/(^-|-$)/g, "")
}

export function computeContentQualityScore(content: string): number {
  let score = 100

  const commonErrors = SPELLING_CORRECTIONS.map(([re]) => {
    const matches = content.match(re)
    return matches ? matches.length : 0
  }).reduce((a, b) => a + b, 0)
  score -= commonErrors * 5

  const sentences = content.split(/[.!?]+\s*/).filter((s) => s.trim().length > 0)
  const avgWordsPerSentence = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / Math.max(sentences.length, 1)
  if (avgWordsPerSentence > 30) score -= 10
  if (avgWordsPerSentence < 5) score -= 5

  const totalWords = content.split(/\s+/).length
  if (totalWords < 200) score -= 10
  if (totalWords < 100) score -= 20

  const hasTitle = /^#\s+\S+/m.test(content)
  if (!hasTitle) score -= 5

  const headings = content.match(/^##\s+\S+/gm) || []
  if (headings.length < 3) score -= 10

  const internalLinks = (content.match(/\(\/tools\/[^)]+\)/g) || []).length
  score += Math.min(internalLinks * 3, 15)

  const aiScore = (content.match(/quick\s*answer/i) ? 5 : 0) +
    (content.match(/key takeaway/i) ? 5 : 0) +
    (content.match(/summary/i) ? 3 : 0)
  score += aiScore

  return Math.min(Math.max(Math.round(score), 0), 100)
}

export function getQualityBadge(score: number): { label: string; color: string; className: string } {
  if (score >= 90) return { label: "Excellent", color: "text-green-600 dark:text-green-400", className: "border-green-500/30 bg-green-500/10" }
  if (score >= 70) return { label: "Good", color: "text-yellow-600 dark:text-yellow-400", className: "border-yellow-500/30 bg-yellow-500/10" }
  return { label: "Needs Improvement", color: "text-red-600 dark:text-red-400", className: "border-red-500/30 bg-red-500/10" }
}

export interface ValidationIssue {
  field: string
  severity: "error" | "warning"
  message: string
}

export function runPrePublishValidation(data: {
  title: string
  description: string
  tags: string[]
  slug: string
  content: string
}): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (!data.title.trim()) {
    issues.push({ field: "title", severity: "error", message: "Title is required" })
  } else if (data.title.length < 10) {
    issues.push({ field: "title", severity: "warning", message: "Title is too short (min 10 characters)" })
  } else if (data.title.length > 120) {
    issues.push({ field: "title", severity: "warning", message: "Title is too long (max 120 characters)" })
  }

  const descResult = validateDescription(data.description)
  if (!descResult.valid) {
    for (const issue of descResult.issues) {
      issues.push({ field: "description", severity: "warning", message: issue })
    }
  }

  if (data.tags.length === 0) {
    issues.push({ field: "tags", severity: "warning", message: "No tags provided" })
  } else if (data.tags.length > 10) {
    issues.push({ field: "tags", severity: "warning", message: "Too many tags (max 10)" })
  }

  if (!data.slug.trim()) {
    issues.push({ field: "slug", severity: "error", message: "Slug is required" })
  } else if (data.slug.length < 3) {
    issues.push({ field: "slug", severity: "error", message: "Slug is too short (min 3 characters)" })
  }

  if (!data.content.trim()) {
    issues.push({ field: "content", severity: "error", message: "Content is required" })
  } else {
    const qualityScore = computeContentQualityScore(data.content)
    if (qualityScore < 70) {
      issues.push({ field: "content", severity: "warning", message: `Content quality score is low (${qualityScore}/100)` })
    }
  }

  return issues
}

export interface AutoFixResult {
  title: string
  description: string
  tags: string[]
  slug: string
  content: string
  fixesApplied: string[]
}

export function autoFixAll(data: {
  title: string
  description: string
  tags: string[]
  slug: string
  content: string
}): AutoFixResult {
  const fixesApplied: string[] = []
  let title = data.title.trim()
  let description = data.description.trim()
  let tags = [...data.tags]
  let slug = data.slug.trim()
  let content = data.content

  const correctedTitle = correctSpelling(title)
  if (correctedTitle !== title) {
    fixesApplied.push("Fixed spelling in title")
    title = correctedTitle
  }
  const optimizedTitle = optimizeTitle(title)
  if (optimizedTitle !== title) {
    fixesApplied.push("Optimized title case")
    title = optimizedTitle
  }

  const correctedDesc = correctSpelling(description)
  if (correctedDesc !== description) {
    fixesApplied.push("Fixed spelling in description")
    description = correctedDesc
  }
  const descValidation = validateDescription(description)
  if (descValidation.fixed !== description) {
    fixesApplied.push("Fixed description length/punctuation")
    description = descValidation.fixed
  }

  const cleanedTags = cleanTags(tags)
  if (JSON.stringify(cleanedTags) !== JSON.stringify(tags)) {
    fixesApplied.push("Cleaned and deduplicated tags")
    tags = cleanedTags
  }

  const correctedContent = correctSpelling(content)
  if (correctedContent !== content) {
    fixesApplied.push("Fixed spelling in content")
    content = correctedContent
  }

  const optimizedSlugVal = optimizeSlug(slug)
  if (optimizedSlugVal !== slug) {
    fixesApplied.push("Optimized slug")
    slug = optimizedSlugVal
  }

  return { title, description, tags, slug, content, fixesApplied }
}

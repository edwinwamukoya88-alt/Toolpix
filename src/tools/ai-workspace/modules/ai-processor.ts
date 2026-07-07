import { enqueue } from "@/lib/ai/queue-manager"

export type Feature =
  | "humanize" | "detector" | "grammar" | "rewrite" | "summarize"
  | "translate" | "change-tone" | "email-writer" | "essay-improver"
  | "resume-rewriter"
  | "lesson-planner" | "scheme-of-work" | "assessment"
  | "comment-generator" | "revision-planner"
  | "education-followup" | "generate-bulk-comments"
  | "design-cards" | "social-media" | "flyer" | "poster"
  | "certificate" | "business-card"

export async function processAI(
  feature: Feature,
  input: string,
  settings: Record<string, unknown>,
): Promise<{ output: string; html?: string }> {
  return enqueue(feature, input, settings)
}

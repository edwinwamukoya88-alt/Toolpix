export interface AIBadge {
  emoji: string
  label: string
  color: string
  className: string
}

export function getAIBadge(score: number): AIBadge {
  if (score >= 80) {
    return {
      emoji: "🟢",
      label: "AI Search Ready",
      color: "text-green-600",
      className: "bg-green-500/10 text-green-600 border-green-500/30",
    }
  }
  if (score >= 50) {
    return {
      emoji: "🟡",
      label: "Improving",
      color: "text-yellow-600",
      className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
    }
  }
  return {
    emoji: "🔴",
    label: "Needs Optimization",
    color: "text-red-600",
    className: "bg-red-500/10 text-red-600 border-red-500/30",
  }
}

export function formatAIScore(score: number): string {
  return `${score}/100`
}

export interface AILinkEntry {
  keyword: string
  weight: number
  tools: { name: string; url: string }[]
}

export const AI_LINK_GRAPH: AILinkEntry[] = [
  {
    keyword: "productivity",
    weight: 0.9,
    tools: [
      { name: "Pomodoro Timer", url: "/tools/pomodoro" },
      { name: "Todo List", url: "/tools/todo" },
      { name: "Notes App", url: "/tools/notes" },
      { name: "Kanban Board", url: "/tools/kanban" },
      { name: "Habit Tracker", url: "/tools/habit-tracker" },
    ],
  },
  {
    keyword: "students",
    weight: 0.85,
    tools: [
      { name: "Notes App", url: "/tools/notes" },
      { name: "CBC Revision Planner", url: "/tools/revision-planner" },
      { name: "Pomodoro Timer", url: "/tools/pomodoro" },
      { name: "CBC Grade Calculator", url: "/tools/grade-calculator" },
    ],
  },
  {
    keyword: "teachers",
    weight: 0.85,
    tools: [
      { name: "CBC Lesson Planner", url: "/tools/lesson-plan-generator" },
      { name: "CBC Scheme of Work Generator", url: "/tools/scheme-of-work-generator" },
      { name: "CBC Teacher Comment Generator", url: "/tools/teacher-comment-generator" },
      { name: "CBC Assessment Tool", url: "/tools/exam-generator" },
    ],
  },
  {
    keyword: "study",
    weight: 0.8,
    tools: [
      { name: "CBC Revision Planner", url: "/tools/revision-planner" },
      { name: "Notes App", url: "/tools/notes" },
      { name: "Pomodoro Timer", url: "/tools/pomodoro" },
    ],
  },
  {
    keyword: "time management",
    weight: 0.8,
    tools: [
      { name: "Pomodoro Timer", url: "/tools/pomodoro" },
      { name: "Day Planner", url: "/tools/day-planner" },
      { name: "Todo List", url: "/tools/todo" },
    ],
  },
  {
    keyword: "assessment",
    weight: 0.85,
    tools: [
      { name: "CBC Assessment Tool", url: "/tools/exam-generator" },
      { name: "CBC Grade Calculator", url: "/tools/grade-calculator" },
      { name: "CBC Teacher Comment Generator", url: "/tools/teacher-comment-generator" },
    ],
  },
  {
    keyword: "lesson plan",
    weight: 0.9,
    tools: [
      { name: "CBC Lesson Planner", url: "/tools/lesson-plan-generator" },
      { name: "CBC Scheme of Work Generator", url: "/tools/scheme-of-work-generator" },
    ],
  },
  {
    keyword: "notes",
    weight: 0.7,
    tools: [
      { name: "Notes App", url: "/tools/notes" },
      { name: "Todo List", url: "/tools/todo" },
    ],
  },
  {
    keyword: "focus",
    weight: 0.75,
    tools: [
      { name: "Pomodoro Timer", url: "/tools/pomodoro" },
      { name: "Habit Tracker", url: "/tools/habit-tracker" },
    ],
  },
  {
    keyword: "habit",
    weight: 0.7,
    tools: [
      { name: "Habit Tracker", url: "/tools/habit-tracker" },
      { name: "Todo List", url: "/tools/todo" },
    ],
  },
  {
    keyword: "password",
    weight: 0.6,
    tools: [
      { name: "Password Generator", url: "/tools/password-generator" },
    ],
  },
  {
    keyword: "qr",
    weight: 0.5,
    tools: [
      { name: "QR Code Generator", url: "/tools/qr-generator" },
      { name: "QR Scanner", url: "/tools/qr-scanner" },
    ],
  },
  {
    keyword: "convert",
    weight: 0.6,
    tools: [
      { name: "PDF Converter UI", url: "/tools/pdf-converter" },
      { name: "Image Converter UI", url: "/tools/image-converter" },
      { name: "Document Converter UI", url: "/tools/document-converter" },
    ],
  },
  {
    keyword: "color",
    weight: 0.5,
    tools: [
      { name: "Color Picker Pro", url: "/tools/color-picker" },
    ],
  },
  {
    keyword: "json",
    weight: 0.5,
    tools: [
      { name: "JSON Formatter & Validator", url: "/tools/json-formatter" },
    ],
  },
  {
    keyword: "regex",
    weight: 0.5,
    tools: [
      { name: "Regex Tester", url: "/tools/regex-tester" },
    ],
  },
  {
    keyword: "finance",
    weight: 0.6,
    tools: [
      { name: "Loan / EMI Calculator", url: "/tools/loan-calculator" },
      { name: "Profit Calculator", url: "/tools/profit-calculator" },
      { name: "Expense Tracker", url: "/tools/expense-tracker" },
    ],
  },
]

export function findAILinks(text: string): { name: string; url: string }[] {
  const matched = new Map<string, { name: string; url: string }>()
  const scored: { entry: AILinkEntry; score: number }[] = []
  const lower = text.toLowerCase()
  for (const entry of AI_LINK_GRAPH) {
    let score = 0
    const regex = new RegExp(entry.keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
    const matches = lower.match(regex)
    if (matches) {
      score = matches.length * entry.weight
    }
    if (score > 0) {
      scored.push({ entry, score })
    }
  }
  scored.sort((a, b) => b.score - a.score)
  for (const { entry } of scored) {
    for (const tool of entry.tools) {
      matched.set(tool.url, tool)
    }
  }
  return Array.from(matched.values())
}

export function countInternalLinks(content: string): number {
  return (content.match(/\(\/tools\/[^)]+\)/g) || []).length
}

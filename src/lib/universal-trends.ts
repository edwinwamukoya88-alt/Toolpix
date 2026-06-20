export interface TrendItem {
  title: string
  description: string
  category: string
  type: "blog" | "tool-guide"
  relatedTools: string[]
  href?: string
}

function seedHash(dateStr: string, category: string): number {
  let hash = 0
  const str = `${dateStr}:${category}`
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

function pick<T>(arr: T[], hash: number, offset: number): T {
  return arr[(hash + offset) % arr.length]
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = (seed + i) % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const TREND_POOLS: Record<string, TrendItem[]> = {
  Productivity: [
    { title: "Best way to manage daily tasks efficiently", description: "Discover task management strategies that actually work for busy professionals and students.", category: "Productivity", type: "blog", relatedTools: ["todo", "kanban", "day-planner"] },
    { title: "How to stay focused for 2 hours straight", description: "Deep focus techniques using the Pomodoro method and distraction-free workflows.", category: "Productivity", type: "blog", relatedTools: ["pomodoro", "habit-tracker", "stopwatch"] },
    { title: "Build a morning routine that boosts productivity", description: "Structure your mornings for maximum output with these simple habit-building strategies.", category: "Productivity", type: "blog", relatedTools: ["habit-tracker", "day-planner", "todo"] },
    { title: "Note-taking methods for better retention", description: "Compare Cornell, mind-mapping, and digital note-taking to find what works for you.", category: "Productivity", type: "blog", relatedTools: ["notes", "markdown-preview", "todo"] },
    { title: "Kanban for personal task management", description: "Use visual boards to track personal projects and reduce overwhelm.", category: "Productivity", type: "tool-guide", relatedTools: ["kanban", "todo", "day-planner"] },
  ],
  "Education & CBC Tools": [
    { title: "How teachers can improve lesson planning with tools", description: "Streamline lesson preparation using digital planners aligned to the CBC curriculum.", category: "Education & CBC Tools", type: "blog", relatedTools: ["lesson-plan-generator", "scheme-of-work-generator", "exam-generator"] },
    { title: "CBC assessment strategies for modern classrooms", description: "Practical approaches to competency-based assessment that save time and improve outcomes.", category: "Education & CBC Tools", type: "blog", relatedTools: ["exam-generator", "grade-calculator", "teacher-comment-generator"] },
    { title: "Guide to KICD curriculum compliance", description: "Ensure your lesson plans and schemes of work meet KICD standards with these tips.", category: "Education & CBC Tools", type: "blog", relatedTools: ["lesson-plan-generator", "scheme-of-work-generator"] },
    { title: "Writing effective CBC report card comments", description: "Generate personalized, competency-aligned feedback for every student quickly.", category: "Education & CBC Tools", type: "tool-guide", relatedTools: ["teacher-comment-generator", "grade-calculator"] },
  ],
  "Developer Tools": [
    { title: "Top debugging workflow for JavaScript apps", description: "Streamline your debugging process with structured tools and consistent practices.", category: "Developer Tools", type: "blog", relatedTools: ["json-formatter", "regex-tester", "url-encoder"] },
    { title: "How to optimize Next.js performance", description: "Improve Core Web Vitals and build times with these Next.js optimization techniques.", category: "Developer Tools", type: "blog", relatedTools: ["json-formatter", "markdown-preview", "unit-converter"] },
    { title: "Mastering regular expressions for text processing", description: "Learn regex patterns for common text extraction and validation tasks.", category: "Developer Tools", type: "tool-guide", relatedTools: ["regex-tester", "text-cleaner", "base64"] },
    { title: "JSON formatting best practices for APIs", description: "Keep your JSON clean, valid, and consistent across API responses and config files.", category: "Developer Tools", type: "blog", relatedTools: ["json-formatter", "url-encoder", "random-generator"] },
  ],
  "Design & Creative": [
    { title: "Color theory fundamentals for non-designers", description: "Understand hue, saturation, and contrast to make better design decisions.", category: "Design & Creative", type: "blog", relatedTools: ["color-picker", "image-placeholder", "favicon-generator"] },
    { title: "Creating consistent brand visuals with free tools", description: "Build a cohesive brand identity using color palettes, placeholders, and favicon generators.", category: "Design & Creative", type: "blog", relatedTools: ["color-picker", "favicon-generator", "lorem-ipsum"] },
    { title: "How to pick the perfect color palette", description: "Use color theory and digital tools to create harmonious palettes for any project.", category: "Design & Creative", type: "tool-guide", relatedTools: ["color-picker", "image-placeholder"] },
  ],
  "Finance Tools": [
    { title: "Simple budgeting system for beginners", description: "Track income and expenses with a straightforward budgeting approach anyone can follow.", category: "Finance Tools", type: "blog", relatedTools: ["expense-tracker", "profit-calculator", "loan-calculator"] },
    { title: "How to compare loan options effectively", description: "Use EMI calculators and total-cost analysis to choose the right loan for your needs.", category: "Finance Tools", type: "blog", relatedTools: ["loan-calculator", "profit-calculator", "currency-converter"] },
    { title: "Track business profitability with simple tools", description: "Monitor margins, ROI, and costs using browser-based calculation tools.", category: "Finance Tools", type: "tool-guide", relatedTools: ["profit-calculator", "expense-tracker", "currency-converter"] },
  ],
  "File Conversion": [
    { title: "Ultimate guide to file format compatibility", description: "Know when to use PDF, DOCX, PNG, JPEG, and MP3 for maximum compatibility.", category: "File Conversion", type: "blog", relatedTools: ["pdf-converter", "image-converter", "document-converter"] },
    { title: "Batch convert documents without uploading", description: "Process multiple files at once using privacy-first local conversion tools.", category: "File Conversion", type: "tool-guide", relatedTools: ["document-converter", "image-converter", "file-compressor"] },
    { title: "Image optimization for web performance", description: "Reduce image file sizes without visible quality loss to speed up your website.", category: "File Conversion", type: "blog", relatedTools: ["image-converter", "file-compressor", "pdf-converter"] },
  ],
  "Security & Text": [
    { title: "Password security best practices in 2026", description: "Create and manage strong passwords that protect your accounts from breaches.", category: "Security & Text", type: "blog", relatedTools: ["password-generator", "text-cleaner", "base64"] },
    { title: "How to safely scan QR codes", description: "Avoid malicious QR codes by previewing destinations before opening links.", category: "Security & Text", type: "blog", relatedTools: ["qr-scanner", "qr-generator", "url-encoder"] },
    { title: "Clean and format text data efficiently", description: "Remove duplicates, extra spaces, and format text for consistent data processing.", category: "Security & Text", type: "tool-guide", relatedTools: ["text-cleaner", "base64", "regex-tester"] },
  ],
  "QR & Connectivity": [
    { title: "Creative ways to use QR codes in marketing", description: "Engage customers with QR codes that link to offers, menus, and digital content.", category: "QR & Connectivity", type: "blog", relatedTools: ["qr-generator", "url-shortener", "qr-scanner"] },
    { title: "Generate and decode QR codes offline", description: "Create and read QR codes entirely in your browser with no data uploads.", category: "QR & Connectivity", type: "tool-guide", relatedTools: ["qr-generator", "qr-scanner", "qr-extractor"] },
  ],
  "General Utilities": [
    { title: "Everyday online tools you didn't know you needed", description: "Discover hidden-gem browser tools for random generation, unit conversion, and more.", category: "General Utilities", type: "blog", relatedTools: ["random-generator", "unit-converter", "stopwatch"] },
    { title: "How to use URL encoding for web development", description: "Encode special characters in URLs safely for APIs and web applications.", category: "General Utilities", type: "tool-guide", relatedTools: ["url-encoder", "base64", "markdown-preview"] },
    { title: "Markdown for quick documentation", description: "Write formatted docs, notes, and README files using lightweight markdown syntax.", category: "General Utilities", type: "blog", relatedTools: ["markdown-preview", "notes", "text-cleaner"] },
  ],
}

export function generateUniversalTrends(): TrendItem[] {
  const dateStr = new Date().toISOString().split("T")[0]
  const allTrends: TrendItem[] = []

  for (const [category, pool] of Object.entries(TREND_POOLS)) {
    const hash = seedHash(dateStr, category)
    const count = 3 + (hash % 3)
    const shuffled = shuffle(pool, hash)
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      const item = shuffled[i]
      allTrends.push({
        ...item,
        href: item.relatedTools.length > 0 ? `/tools/${item.relatedTools[0]}` : "/tools",
      })
    }
  }

  return allTrends
}

export function getTrendsByCategory(category: string): TrendItem[] {
  return generateUniversalTrends().filter((t) => t.category === category)
}

export function getTrendsByType(type: "blog" | "tool-guide"): TrendItem[] {
  return generateUniversalTrends().filter((t) => t.type === type)
}

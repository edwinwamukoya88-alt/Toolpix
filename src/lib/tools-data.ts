export interface Tool {
  slug: string
  name: string
  description: string
  icon: string
  category: string
  badge: string
  comingSoon?: boolean
}

export const tools: Tool[] = [
  // 1. PRODUCTIVITY (HIGHEST PRIORITY)
  { slug: "planner", name: "Task Planner", description: "Organize tasks, reminders, calendars, and productivity workflows in a powerful privacy-first planner.", icon: "CheckSquare", category: "Productivity", badge: "Free" },
  { slug: "pomodoro", name: "Pomodoro Timer", description: "Stay focused with customizable timers", icon: "Timer", category: "Productivity", badge: "Free" },
  { slug: "notes", name: "Notes App", description: "Write and organize notes with local storage", icon: "StickyNote", category: "Productivity", badge: "Free" },
  { slug: "day-planner", name: "Day Planner", description: "Plan your day hour by hour", icon: "Calendar", category: "Productivity", badge: "Free" },
  { slug: "habit-tracker", name: "Habit Tracker", description: "Build daily streaks and track habits", icon: "Target", category: "Productivity", badge: "Free" },
  { slug: "stopwatch", name: "Stopwatch", description: "Track time with lap recording", icon: "Clock", category: "Productivity", badge: "Fast" },
  { slug: "kanban", name: "Kanban Board", description: "Organize tasks with drag-and-drop boards", icon: "Columns3", category: "Productivity", badge: "Free" },

  // 2. EDUCATION & CBC TOOLS (HIGH PRIORITY NICHE)
  { slug: "grade-calculator", name: "CBC Grade Calculator", description: "Calculate scores and competency levels (EE/ME/AE/BE) per KICD", icon: "Percent", category: "Education & CBC Tools", badge: "Free" },
  { slug: "revision-planner", name: "CBC Learning & Revision Planner", description: "Plan skill-based practice, projects, and competency reinforcement with structured curriculum mapping", icon: "CalendarDays", category: "Education & CBC Tools", badge: "Free" },
  { slug: "lesson-plan-generator", name: "CBC Lesson Planner", description: "Generate full KICD-compliant lesson plans with competencies and PCIs", icon: "BookOpen", category: "Education & CBC Tools", badge: "Free" },
  { slug: "exam-generator", name: "CBC Assessment Tool", description: "Generate performance-based assessments — projects, tasks, observations", icon: "FileSpreadsheet", category: "Education & CBC Tools", badge: "Free" },
  { slug: "teacher-comment-generator", name: "CBC Teacher Comment Generator", description: "Generate competency-based feedback aligned to CBC levels", icon: "MessageSquare", category: "Education & CBC Tools", badge: "Free" },
  { slug: "scheme-of-work-generator", name: "CBC Scheme of Work Generator", description: "Create KICD schemes of work with inquiry questions and competencies", icon: "ClipboardList", category: "Education & CBC Tools", badge: "Free" },

  // 3. SECURITY & TEXT TOOLS
  { slug: "password-generator", name: "Password Generator", description: "Generate strong, secure passwords", icon: "Key", category: "Security & Text", badge: "Secure" },
  { slug: "text-cleaner", name: "Text Cleaner", description: "Remove extra spaces and duplicate lines", icon: "Eraser", category: "Security & Text", badge: "Fast" },
  { slug: "base64", name: "Base64 Encoder/Decoder", description: "Encode and decode Base64 strings", icon: "FileCode", category: "Security & Text", badge: "Fast" },
  { slug: "url-encoder", name: "URL Encoder/Decoder", description: "Encode and decode URLs safely", icon: "Link2", category: "Security & Text", badge: "Fast" },
  { slug: "random-generator", name: "Random Generator", description: "Generate random UUIDs, numbers, names", icon: "Shuffle", category: "Security & Text", badge: "Free" },

  // 4. QR & CONNECTIVITY TOOLS
  { slug: "qr-generator", name: "QR Code Generator", description: "Generate QR codes from text or URLs", icon: "QrCode", category: "QR & Connectivity", badge: "Free" },
  { slug: "qr-scanner", name: "QR Scanner", description: "Scan QR codes using your camera", icon: "Scan", category: "QR & Connectivity", badge: "Secure" },
  { slug: "qr-extractor", name: "QR to Link Extractor", description: "Decode QR codes from images", icon: "ImageDown", category: "QR & Connectivity", badge: "Secure" },
  { slug: "url-shortener", name: "URL Shortener", description: "Generate short URLs locally", icon: "Link", category: "QR & Connectivity", badge: "Fast" },

  // 5. FILE CONVERSION TOOLS
  { slug: "pdf-converter", name: "PDF Converter UI", description: "Convert files to and from PDF format", icon: "File", category: "File Conversion", badge: "Secure" },
  { slug: "image-converter", name: "Image Converter UI", description: "Convert images between popular formats", icon: "ImagePlus", category: "File Conversion", badge: "Secure" },
  { slug: "document-converter", name: "Document Converter UI", description: "Convert documents between formats", icon: "FileText", category: "File Conversion", badge: "Secure" },
  { slug: "audio-converter", name: "Audio Converter UI", description: "Convert audio files between formats", icon: "Music", category: "File Conversion", badge: "Secure" },
  { slug: "file-compressor", name: "File Compressor UI", description: "Compress and archive files", icon: "FileArchive", category: "File Conversion", badge: "Free" },

  // 6. DEVELOPER TOOLS
  { slug: "json-formatter", name: "JSON Formatter & Validator", description: "Format, validate, and beautify JSON", icon: "Braces", category: "Developer Tools", badge: "Fast" },
  { slug: "regex-tester", name: "Regex Tester", description: "Test regular expressions with live matching", icon: "Regex", category: "Developer Tools", badge: "Free" },
  { slug: "markdown-preview", name: "Markdown Preview", description: "Write markdown and preview in real-time", icon: "FileText", category: "Developer Tools", badge: "Free" },
  { slug: "unit-converter", name: "Unit Converter", description: "Convert length, weight, temperature, and more", icon: "Ruler", category: "Developer Tools", badge: "Free" },

  // 7. DESIGN & CREATIVE TOOLS (LOW PRIORITY)
  { slug: "color-picker", name: "Color Picker Pro", description: "Pick, convert, and copy colors in HEX, RGB, HSL", icon: "Palette", category: "Design & Creative", badge: "Free" },
  { slug: "lorem-ipsum", name: "Lorem Ipsum Generator", description: "Generate placeholder text for your designs", icon: "TextQuote", category: "Design & Creative", badge: "Free" },
  { slug: "favicon-generator", name: "Favicon Generator", description: "Generate favicons from text or emoji", icon: "Image", category: "Design & Creative", badge: "Free" },
  { slug: "image-placeholder", name: "Image Placeholder", description: "Create custom sized placeholder images", icon: "Frame", category: "Design & Creative", badge: "Free" },
  { slug: "design-cards-studio", name: "Design Cards Studio", description: "Create business cards, wedding invites, event cards, social media posts, and certificates", icon: "CreditCard", category: "Design & Creative", badge: "Free" },

  // 8. FINANCE TOOLS (LOW PRIORITY / OCCASIONAL USE)
  { slug: "currency-converter", name: "Currency Converter", description: "Convert between world currencies (manual rates)", icon: "DollarSign", category: "Finance Tools", badge: "Fast" },
  { slug: "loan-calculator", name: "Loan / EMI Calculator", description: "Calculate loan payments and EMI schedules", icon: "Landmark", category: "Finance Tools", badge: "Free" },
  { slug: "profit-calculator", name: "Profit Calculator", description: "Calculate profit margins and ROI", icon: "TrendingUp", category: "Finance Tools", badge: "Free" },
  { slug: "expense-tracker", name: "Expense Tracker", description: "Track and analyze your monthly spending", icon: "Wallet", category: "Finance Tools", badge: "Free" },
  { slug: "blog-generator", name: "Blog Generator", description: "Generate SEO-optimized MDX blog posts instantly from a title", icon: "FileText", category: "Productivity", badge: "Free" },
]

export const categories = [
  "Productivity",
  "Education & CBC Tools",
  "Security & Text",
  "QR & Connectivity",
  "File Conversion",
  "Developer Tools",
  "Design & Creative",
  "Finance Tools",
]

export const categoryIcons: Record<string, string> = {
  Productivity: "Zap",
  "Education & CBC Tools": "GraduationCap",
  "Security & Text": "Shield",
  "QR & Connectivity": "QrCode",
  "File Conversion": "FileUp",
  "Developer Tools": "Code",
  "Design & Creative": "Palette",
  "Finance Tools": "DollarSign",
}

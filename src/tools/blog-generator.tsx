"use client"

import { useState, useCallback, useMemo } from "react"
import {
  FileText, Copy, Download, Sparkles, RotateCcw, Check,
  Eye, Code, Cpu, Globe, ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import BlogCoverImage from "@/components/blog/blog-cover-image"
import { serializeCover } from "@/lib/blog-types"
import { generateCoverConfig } from "@/lib/blog-cover-generator"
import { calculateAIVisibilityScore, aiImprovementTips } from "@/lib/ai-score"
import { getAIBadge, formatAIScore } from "@/lib/ai-badge"
import { countInternalLinks } from "@/lib/ai-links"
import { AISignals } from "@/lib/ai-signals"
import { computeContentQualityScore, getQualityBadge, runPrePublishValidation, autoFixAll } from "@/lib/seo-cleanup"
import type { ValidationIssue, AutoFixResult } from "@/lib/seo-cleanup"

type BlogCategory = "CBC Education" | "Productivity" | "Teaching Resources" | "Study Skills" | "General"
type ContentStyle = "Auto" | "CBC Education" | "Productivity" | "Security" | "Developer" | "Finance" | "Design" | "File Conversion" | "General"
type TargetAudience = "Teachers" | "Students" | "General Users"

const categories: BlogCategory[] = ["CBC Education", "Productivity", "Teaching Resources", "Study Skills", "General"]
const contentStyles: ContentStyle[] = ["Auto", "CBC Education", "Productivity", "Security", "Developer", "Finance", "Design", "File Conversion", "General"]
const audiences: TargetAudience[] = ["Teachers", "Students", "General Users"]

interface GeneratedBlog {
  title: string
  description: string
  slug: string
  category: BlogCategory
  styleEngine: ContentStyle
  tags: string[]
  audience: TargetAudience
  content: string
  frontmatter: string
  mdx: string
  coverSerialized: string
  aiOptimizedTitle?: string
}

interface ToolEntry {
  name: string
  url: string
}

const categoryToolMap: Record<string, ToolEntry[]> = {
  "CBC Education": [
    { name: "CBC Grade Calculator", url: "/tools/grade-calculator" },
    { name: "CBC Lesson Planner", url: "/tools/lesson-plan-generator" },
    { name: "CBC Learning & Revision Planner", url: "/tools/revision-planner" },
    { name: "CBC Assessment Tool", url: "/tools/exam-generator" },
    { name: "CBC Teacher Comment Generator", url: "/tools/teacher-comment-generator" },
    { name: "CBC Scheme of Work Generator", url: "/tools/scheme-of-work-generator" },
  ],
  Productivity: [
    { name: "Pomodoro Timer", url: "/tools/pomodoro" },
    { name: "Task Planner", url: "/tools/planner" },
    { name: "Notes App", url: "/tools/notes" },
    { name: "Kanban Board", url: "/tools/kanban" },
    { name: "Day Planner", url: "/tools/day-planner" },
    { name: "Habit Tracker", url: "/tools/habit-tracker" },
  ],
  Security: [
    { name: "Password Generator", url: "/tools/password-generator" },
    { name: "QR Scanner", url: "/tools/qr-scanner" },
    { name: "QR Code Generator", url: "/tools/qr-generator" },
    { name: "Text Cleaner", url: "/tools/text-cleaner" },
    { name: "Base64 Encoder/Decoder", url: "/tools/base64" },
  ],
  Developer: [
    { name: "JSON Formatter & Validator", url: "/tools/json-formatter" },
    { name: "Regex Tester", url: "/tools/regex-tester" },
    { name: "URL Encoder/Decoder", url: "/tools/url-encoder" },
    { name: "Markdown Preview", url: "/tools/markdown-preview" },
    { name: "Unit Converter", url: "/tools/unit-converter" },
    { name: "Random Generator", url: "/tools/random-generator" },
  ],
  Finance: [
    { name: "Loan / EMI Calculator", url: "/tools/loan-calculator" },
    { name: "Profit Calculator", url: "/tools/profit-calculator" },
    { name: "Currency Converter", url: "/tools/currency-converter" },
    { name: "Expense Tracker", url: "/tools/expense-tracker" },
  ],
  Design: [
    { name: "Color Picker Pro", url: "/tools/color-picker" },
    { name: "Image Placeholder", url: "/tools/image-placeholder" },
    { name: "Favicon Generator", url: "/tools/favicon-generator" },
    { name: "Lorem Ipsum Generator", url: "/tools/lorem-ipsum" },
  ],
  "File Conversion": [
    { name: "PDF Converter UI", url: "/tools/pdf-converter" },
    { name: "Image Converter UI", url: "/tools/image-converter" },
    { name: "Document Converter UI", url: "/tools/document-converter" },
    { name: "Audio Converter UI", url: "/tools/audio-converter" },
    { name: "File Compressor UI", url: "/tools/file-compressor" },
  ],
  General: [
    { name: "Task Planner", url: "/tools/planner" },
    { name: "Notes App", url: "/tools/notes" },
    { name: "Pomodoro Timer", url: "/tools/pomodoro" },
    { name: "Password Generator", url: "/tools/password-generator" },
    { name: "QR Code Generator", url: "/tools/qr-generator" },
  ],
}

const smartKeywordMap: [RegExp, ToolEntry[]][] = [
  [/calculator/i, [{ name: "CBC Grade Calculator", url: "/tools/grade-calculator" }]],
  [/plan(ner)?|lesson|scheme/i, [
    { name: "CBC Lesson Planner", url: "/tools/lesson-plan-generator" },
    { name: "CBC Scheme of Work Generator", url: "/tools/scheme-of-work-generator" },
  ]],
  [/revis(e|ion)|study/i, [{ name: "CBC Learning & Revision Planner", url: "/tools/revision-planner" }]],
  [/assess|exam|test|quiz/i, [{ name: "CBC Assessment Tool", url: "/tools/exam-generator" }]],
  [/comment|feedback|report/i, [{ name: "CBC Teacher Comment Generator", url: "/tools/teacher-comment-generator" }]],
  [/pdf|document|convert/i, [
    { name: "PDF Converter UI", url: "/tools/pdf-converter" },
    { name: "Document Converter UI", url: "/tools/document-converter" },
  ]],
  [/qr/i, [
    { name: "QR Code Generator", url: "/tools/qr-generator" },
    { name: "QR Scanner", url: "/tools/qr-scanner" },
  ]],
  [/password|secure|encrypt/i, [{ name: "Password Generator", url: "/tools/password-generator" }]],
  [/color|colour|palette|pick/i, [{ name: "Color Picker Pro", url: "/tools/color-picker" }]],
  [/image|photo|picture/i, [
    { name: "Image Converter UI", url: "/tools/image-converter" },
    { name: "Image Placeholder", url: "/tools/image-placeholder" },
  ]],
  [/json|format/i, [{ name: "JSON Formatter & Validator", url: "/tools/json-formatter" }]],
  [/regex|regular expression/i, [{ name: "Regex Tester", url: "/tools/regex-tester" }]],
  [/url|encode|link/i, [{ name: "URL Encoder/Decoder", url: "/tools/url-encoder" }]],
  [/loan|emi|mortgage/i, [{ name: "Loan / EMI Calculator", url: "/tools/loan-calculator" }]],
  [/profit|margin|roi/i, [{ name: "Profit Calculator", url: "/tools/profit-calculator" }]],
  [/currency|money|exchange/i, [{ name: "Currency Converter", url: "/tools/currency-converter" }]],
  [/expense|budget|spend/i, [{ name: "Expense Tracker", url: "/tools/expense-tracker" }]],
  [/pomodoro|timer|focus/i, [{ name: "Pomodoro Timer", url: "/tools/pomodoro" }]],
  [/todo|task|checklist/i, [{ name: "Task Planner", url: "/tools/planner" }]],
  [/note|journal|diary/i, [{ name: "Notes App", url: "/tools/notes" }]],
  [/kanban|board|column/i, [{ name: "Kanban Board", url: "/tools/kanban" }]],
  [/favicon/i, [{ name: "Favicon Generator", url: "/tools/favicon-generator" }]],
  [/habit|tracker|streak/i, [{ name: "Habit Tracker", url: "/tools/habit-tracker" }]],
  [/placeholder|lorem ipsum/i, [
    { name: "Image Placeholder", url: "/tools/image-placeholder" },
    { name: "Lorem Ipsum Generator", url: "/tools/lorem-ipsum" },
  ]],
  [/compress|zip|archive/i, [{ name: "File Compressor UI", url: "/tools/file-compressor" }]],
  [/audio|sound|music/i, [{ name: "Audio Converter UI", url: "/tools/audio-converter" }]],
  [/schedule|plan.*day|daily/i, [{ name: "Day Planner", url: "/tools/day-planner" }]],
  [/markdown|md/i, [{ name: "Markdown Preview", url: "/tools/markdown-preview" }]],
  [/random|uuid/i, [{ name: "Random Generator", url: "/tools/random-generator" }]],
  [/unit|convert.*(length|weight|temp)/i, [{ name: "Unit Converter", url: "/tools/unit-converter" }]],
]

function optimizeTitle(title: string): string {
  const trimmed = title.trim()
  const lower = trimmed.toLowerCase()
  if (lower.startsWith("how ") || lower.startsWith("what ") || lower.startsWith("why ") || lower.startsWith("can ")) {
    return trimmed.endsWith("?") ? trimmed : `${trimmed}?`
  }
  return `How to ${lower[0]?.toLowerCase() ?? ""}${trimmed.slice(1)}`
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function inferStyleFromTitle(title: string, category: BlogCategory): ContentStyle {
  if (category === "CBC Education") return "CBC Education"
  if (category === "Productivity") return "Productivity"
  if (category === "Study Skills") return "Productivity"
  if (category === "Teaching Resources") return "CBC Education"

  const lower = title.toLowerCase()
  if (/password|secure|privacy|encrypt|tracking|data.*protect|qr.*code/i.test(lower)) return "Security"
  if (/json|regex|developer|code|program|api|markdown|url.*encode/i.test(lower)) return "Developer"
  if (/loan|profit|currency|expense|finance|money|budget|invest/i.test(lower)) return "Finance"
  if (/color|design|favicon|palette|ui.*ux|brand|creative/i.test(lower)) return "Design"
  if (/convert|pdf|image|file|audio|compress|format/i.test(lower)) return "File Conversion"
  if (/pomodoro|todo|note|productivity|task|habit|planner|schedule|kanban/i.test(lower)) return "Productivity"
  if (/cbc|competency|lesson|grade.*calculator|teacher|student|curriculum|kicd|assessment|revision|exam|scheme/i.test(lower)) return "CBC Education"
  return "General"
}

function getSmartTools(title: string): ToolEntry[] {
  const matched = new Map<string, ToolEntry>()
  for (const [pattern, tools] of smartKeywordMap) {
    if (pattern.test(title)) {
      for (const tool of tools) {
        matched.set(tool.url, tool)
      }
    }
  }

  if (matched.size === 0) {
    return [{ name: "Task Planner", url: "/tools/planner" }]
  }
  return Array.from(matched.values()).slice(0, 5)
}

function getCategoryTools(style: ContentStyle, title: string): ToolEntry[] {
  const baseTools = style === "Auto" || style === "General"
    ? categoryToolMap.General
    : (categoryToolMap[style] || categoryToolMap.General)

  const smartHits = getSmartTools(title)
  const combined = [...smartHits]
  const seen = new Set(combined.map((t) => t.url))
  for (const tool of baseTools) {
    if (!seen.has(tool.url)) {
      combined.push(tool)
      seen.add(tool.url)
    }
  }
  return combined.slice(0, 6)
}

function generateDescription(title: string, style: ContentStyle, audience: TargetAudience, keyword: string): string {
  const lower = title.toLowerCase()
  const prefix = audience === "Teachers" ? "A complete guide for teachers on " :
    audience === "Students" ? "A helpful guide for students on " : "An informative guide on "
  const suffix = keyword ? ` Optimized for "${keyword}".` : ""

  const styleDesc: Record<string, string> = {
    "CBC Education": `${prefix}${lower} in the CBC curriculum. Includes competency-based approaches, assessment strategies, and classroom activities.`,
    Productivity: `${prefix}${lower}. Discover practical productivity strategies, time-saving techniques, and workflow optimization tips.`,
    Security: `${prefix}${lower}. Learn privacy-first practices, data safety tips, and how to protect your digital life with browser-based tools.`,
    Developer: `${prefix}${lower}. A technical guide covering key concepts, use cases, and best practices for developers and technical professionals.`,
    Finance: `${prefix}${lower}. Learn essential financial concepts, budgeting strategies, and tools to manage your money effectively.`,
    Design: `${prefix}${lower}. Explore design principles, color theory, branding workflows, and creative techniques for better visual outcomes.`,
    "File Conversion": `${prefix}${lower}. Learn efficient file management workflows, format conversion tips, and productivity best practices.`,
  }

  let desc = styleDesc[style] || `${prefix}${lower}. Learn practical strategies, tips, and best practices.`
  desc = desc.slice(0, 155) + suffix
  return desc.slice(0, 160)
}

function generateContent(
  title: string,
  style: ContentStyle,
  audience: TargetAudience,
  tags: string[],
  keyword: string,
  autoLink: boolean,
  smartTools: ToolEntry[],
): string {
  const sections: string[] = []
  const lower = title.toLowerCase()
  const effectiveStyle = style === "Auto" ? inferStyleFromTitle(title, "General") : style

  sections.push(`# ${title}`)
  sections.push("")
  sections.push(`> This article is structured for AI search engines and answer extraction systems.`)
  sections.push("")

  const intro = audience === "Teachers"
    ? `As educators, finding effective ways to teach ${lower} is essential for student success. This guide provides practical strategies, ready-to-use activities, and evidence-based approaches to help your learners master this topic.`
    : audience === "Students"
      ? `Mastering ${lower} is easier with the right approach. This guide breaks down everything you need to know, from key concepts to practical tips that will help you succeed.`
      : `Whether you are a teacher, student, or lifelong learner, this guide to ${lower} will provide valuable insights, practical strategies, and actionable tips to help you get the most out of this topic.`

  sections.push(intro)
  sections.push("")

  sections.push("## 📌 Key Takeaway (AI Extract Block)")
  sections.push("")
  sections.push(`- **One sentence summary**: This guide provides a comprehensive overview of ${lower}, covering key concepts, practical strategies, and actionable steps you can apply immediately.`)
  sections.push(`- **Core insight**: Mastering ${lower} requires a combination of understanding fundamental principles, consistent practice, and using the right tools to reinforce learning.`)
  sections.push(`- **Practical result**: By following this guide, you will be able to ${audience === "Teachers" ? "design effective lessons and assessments that align with curriculum goals" : audience === "Students" ? "improve your study habits, retain more information, and achieve better academic results" : "apply proven strategies to improve your workflow, save time, and achieve your goals"} using ToolForge's free privacy-first tools.`)
  sections.push("")

  sections.push("## 🧠 Quick AI Answer")
  sections.push("")
  sections.push(`- **One-line definition**: ${title} is a key concept that helps users improve their workflow and achieve better results.`)
  sections.push(`- **Simple explanation**: This guide breaks down ${lower} into easy-to-understand steps, providing practical strategies you can apply immediately.`)
  sections.push(`- **Practical use case**: Whether you are studying, teaching, or working, mastering ${lower} helps you save time, reduce errors, and accomplish more.`)
  sections.push(`- **Related ToolForge tools**: Use our free tools to put these concepts into practice.`)
  sections.push("")

  sections.push("## Definition")
  sections.push("")
  sections.push(`${title} refers to the process and techniques involved in ${lower}. It encompasses the tools, strategies, and best practices that help individuals and organizations achieve their goals more effectively.`)
  sections.push("")

  if (effectiveStyle === "CBC Education") {
    sections.push("## Understanding the CBC Framework")
    sections.push("")
    sections.push(`The Competency-Based Curriculum (CBC) emphasizes practical knowledge and skills over rote memorization. When teaching ${lower}, focus on these core competencies:`)
    sections.push("")
    sections.push("- **Communication and Collaboration**: Encourage group discussions and peer learning")
    sections.push("- **Critical Thinking and Problem Solving**: Use real-world problems that relate to the topic")
    sections.push("- **Creativity and Imagination**: Allow learners to explore multiple solutions")
    sections.push("- **Digital Literacy**: Integrate technology tools where appropriate")
    sections.push("")
    sections.push("### Key Learning Outcomes")
    sections.push("")
    sections.push(`By the end of this topic, learners should be able to:`)
    sections.push("")
    sections.push(`1. Understand the core concepts of ${lower}`)
    sections.push("2. Apply knowledge to real-world situations")
    sections.push("3. Demonstrate competency through practical tasks")
    sections.push("4. Reflect on their learning progress")
    sections.push("")
    sections.push("### Teaching Strategies for CBC Classrooms")
    sections.push("")
    sections.push(`Here are effective strategies for teaching ${lower} in a CBC-aligned classroom:`)
    sections.push("")
    sections.push("#### 1. Interactive Learning Stations")
    sections.push(`Set up different stations where learners rotate and engage with ${lower} through hands-on activities. This caters to diverse learning styles and keeps students engaged.`)
    sections.push("")
    sections.push("#### 2. Project-Based Assessment")
    sections.push(`Design projects that require learners to apply their knowledge of ${lower} to solve real problems. This aligns with CBC's emphasis on practical competency demonstration.`)
    sections.push("")
    sections.push("#### 3. Differentiated Instruction")
    sections.push("Provide varied levels of support and challenge based on individual learner needs. Use the CBC Lesson Planner to create differentiated lesson plans quickly.")
    sections.push("")
  } else if (effectiveStyle === "Productivity") {
    sections.push("## Why Productivity Matters")
    sections.push("")
    sections.push(`In today's fast-paced world, mastering ${lower} can transform how you work and study. The right productivity approach helps you accomplish more in less time, reduces stress, and creates space for what truly matters.`)
    sections.push("")
    sections.push("### Key Strategies")
    sections.push("")
    sections.push("#### 1. Time Block Your Day")
    sections.push(`Schedule dedicated blocks for ${lower} using focused work intervals. The Pomodoro Technique — 25 minutes of focused work followed by 5-minute breaks — is highly effective for maintaining concentration.`)
    sections.push("")
    sections.push("#### 2. Organize with Lists")
    sections.push(`Break down ${lower} into actionable tasks and track your progress. A well-maintained todo list keeps you accountable and provides a sense of accomplishment as you complete each item.`)
    sections.push("")
    sections.push("#### 3. Create a System")
    sections.push(`Develop a consistent workflow around ${lower}. Whether it is a morning routine, a weekly review, or a project board, having a repeatable system eliminates decision fatigue and builds momentum.`)
    sections.push("")
  } else if (effectiveStyle === "Security") {
    sections.push("## Why Privacy and Security Matter")
    sections.push("")
    sections.push(`In an era of increasing digital surveillance and data breaches, understanding ${lower} is more important than ever. Your personal data is valuable — protecting it should be a priority.`)
    sections.push("")
    sections.push("### Key Principles")
    sections.push("")
    sections.push("#### 1. Keep Data Local")
    sections.push(`Whenever possible, use tools that process data locally in your browser rather than uploading to servers. This eliminates the risk of data breaches, unauthorized access, and third-party tracking.`)
    sections.push("")
    sections.push("#### 2. Use Strong Authentication")
    sections.push(`Generate and store strong, unique passwords for every service. Never reuse passwords across sites, and consider using a password generator to create complex credentials that are difficult to crack.`)
    sections.push("")
    sections.push("#### 3. Verify Before You Trust")
    sections.push(`Be cautious with QR codes, shortened URLs, and unknown links. Always preview the destination before opening, and use tools that let you verify content before taking action.`)
    sections.push("")
  } else if (effectiveStyle === "Developer") {
    sections.push("## Overview for Developers")
    sections.push("")
    sections.push(`For developers working with ${lower}, having the right tools and understanding best practices can significantly improve productivity and code quality. This section covers the essential concepts and practical applications.`)
    sections.push("")
    sections.push("### Key Concepts")
    sections.push("")
    sections.push("#### 1. Understanding the Basics")
    sections.push(`Start by mastering the fundamental principles of ${lower}. A solid foundation will make advanced topics easier to grasp and apply in real projects.`)
    sections.push("")
    sections.push("#### 2. Practical Use Cases")
    sections.push(`Apply ${lower} in common development scenarios: debugging, data transformation, API integration, and automation. Each use case reinforces understanding and builds practical experience.`)
    sections.push("")
    sections.push("#### 3. Best Practices")
    sections.push(`Follow established conventions and patterns when working with ${lower}. Consistent approaches lead to more maintainable code, fewer bugs, and better collaboration with team members.`)
    sections.push("")
  } else if (effectiveStyle === "Finance") {
    sections.push("## Why Financial Literacy Matters")
    sections.push("")
    sections.push(`Understanding ${lower} is essential for making informed financial decisions. Whether you are managing personal finances, running a business, or planning for the future, financial knowledge empowers better choices.`)
    sections.push("")
    sections.push("### Key Concepts")
    sections.push("")
    sections.push("#### 1. Know Your Numbers")
    sections.push(`Start by understanding the key metrics related to ${lower}. Track income, expenses, and other financial data to get a clear picture of your financial situation. Knowledge is the first step toward improvement.`)
    sections.push("")
    sections.push("#### 2. Plan and Budget")
    sections.push(`Create a financial plan that accounts for your goals and constraints. Budgeting is not about restriction — it is about alignment. When your spending matches your priorities, financial stress decreases.`)
    sections.push("")
    sections.push("#### 3. Use the Right Tools")
    sections.push(`Financial calculators and trackers eliminate guesswork. Instead of manual calculations that are prone to error, let specialized tools handle the math so you can focus on strategy and decisions.`)
    sections.push("")
  } else if (effectiveStyle === "Design") {
    sections.push("## Why Design Matters")
    sections.push("")
    sections.push(`Great design is about more than aesthetics — it is about communication, usability, and emotional connection. Understanding ${lower} helps you create more effective and appealing visual work.`)
    sections.push("")
    sections.push("### Key Principles")
    sections.push("")
    sections.push("#### 1. Start with a Strong Foundation")
    sections.push(`Master the fundamentals of ${lower} before moving to advanced techniques. Color theory, typography, spacing, and composition form the building blocks of all great design work.`)
    sections.push("")
    sections.push("#### 2. Build a Consistent Workflow")
    sections.push(`Develop a repeatable design process for ${lower}. From initial concept through wireframing, prototyping, and final delivery, a structured workflow improves both speed and quality.`)
    sections.push("")
    sections.push("#### 3. Test and Iterate")
    sections.push(`Design is an iterative process. Create prototypes, gather feedback, and refine your work. The best designs emerge through cycles of creation, evaluation, and improvement.`)
    sections.push("")
  } else if (effectiveStyle === "File Conversion") {
    sections.push("## Why File Management Matters")
    sections.push("")
    sections.push(`Efficient file management is a cornerstone of digital productivity. Understanding ${lower} helps you work faster, reduce errors, and maintain organized workflows across different file formats and platforms.`)
    sections.push("")
    sections.push("### Key Strategies")
    sections.push("")
    sections.push("#### 1. Choose the Right Format")
    sections.push(`Different use cases require different file formats. Understanding when to use PDF versus DOCX, PNG versus JPEG, or MP3 versus WAV ensures compatibility and optimal quality for your specific needs.`)
    sections.push("")
    sections.push("#### 2. Batch Process When Possible")
    sections.push(`Converting or processing files one at a time is inefficient. Look for tools that support batch operations to handle multiple files simultaneously, saving time and reducing repetitive work.`)
    sections.push("")
    sections.push("#### 3. Maintain Quality")
    sections.push(`File conversion should not mean quality loss. Choose conversion settings that balance file size with quality, and always verify the output before sharing or archiving important files.`)
    sections.push("")
  } else {
    sections.push("## Why This Matters")
    sections.push("")
    sections.push(`Understanding ${lower} is important because it builds foundational skills that apply across multiple areas. Whether you are studying, teaching, or simply expanding your knowledge, mastering this topic opens doors to deeper understanding and better results.`)
    sections.push("")
    sections.push("### Key Concepts and Strategies")
    sections.push("")
    sections.push("#### 1. Start with the Basics")
    sections.push(`Build a strong foundation by understanding the core principles of ${lower}. Take time to master fundamental concepts before moving to advanced topics.`)
    sections.push("")
    sections.push("#### 2. Practice Consistently")
    sections.push(`Regular practice is key to mastery. Set aside dedicated time each day or week to work on ${lower} and track your progress over time.`)
    sections.push("")
    sections.push("#### 3. Apply What You Learn")
    sections.push(`Theory without practice has limited value. Find opportunities to apply your knowledge of ${lower} in real-world scenarios. This reinforces learning and builds confidence.`)
    sections.push("")
  }

  sections.push("## How It Works")
  sections.push("")
  sections.push(`Understanding and applying ${lower} involves a systematic approach. Here is how the process works:`)
  sections.push("")
  sections.push("1. **Identify your goals** — Determine what you want to achieve with this topic")
  sections.push("2. **Learn the fundamentals** — Build a solid foundation of core concepts")
  sections.push("3. **Apply with tools** — Use practical tools to implement what you learn")
  sections.push("4. **Review and refine** — Continuously improve your approach based on results")
  sections.push("")

  sections.push("## Step-by-Step Guide")
  sections.push("")
  sections.push(`Follow these steps to get started with ${lower}:`)
  sections.push("")
  sections.push("### Step 1: Understand the Basics")
  sections.push(`Begin by familiarizing yourself with the core concepts of ${lower}. Take time to research and understand the fundamental principles before moving forward.`)
  sections.push("")
  sections.push("### Step 2: Set Up Your Workflow")
  sections.push(`Create a system that supports your work with ${lower}. Choose the right tools and establish routines that make it easy to stay consistent.`)
  sections.push("")
  sections.push("### Step 3: Practice Regularly")
  sections.push(`Dedicate focused time each day to work on ${lower}. Consistency matters more than intensity — even 15 minutes daily leads to significant progress over time.`)
  sections.push("")
  sections.push("### Step 4: Track Your Progress")
  sections.push(`Monitor your improvements and adjust your approach as needed. Use measurable criteria to evaluate your progress and identify areas for improvement.`)
  sections.push("")

  const keywordSection = keyword.trim()
  if (keywordSection) {
    sections.push(`## Optimizing for "${keywordSection}"`)
    sections.push("")
    sections.push(`When focusing on "${keywordSection}" within ${lower}, consider these targeted strategies:`)
    sections.push("")
    sections.push(`- Align your learning objectives with "${keywordSection}" outcomes`)
    sections.push("- Use specific examples that demonstrate key principles")
    sections.push("- Create practice activities that reinforce understanding")
    sections.push("- Track progress using measurable criteria")
    sections.push("")
  }

  sections.push("## Examples")
  sections.push("")
  sections.push(`Here are practical examples related to ${lower}:`)
  sections.push("")

  if (effectiveStyle === "CBC Education") {
    sections.push("### Classroom Activity")
    sections.push(`Design a group activity where learners work together to solve problems related to ${lower}. Use rubrics to evaluate group work and provide competency-based feedback.`)
    sections.push("")
    sections.push("### Individual Project")
    sections.push(`Assign a project where each learner researches and presents on a specific aspect of ${lower}. This develops research skills, public speaking confidence, and deepens understanding.`)
    sections.push("")
  } else if (effectiveStyle === "Productivity") {
    sections.push("### Daily Workflow")
    sections.push(`Start each day by reviewing your priorities for ${lower}. Use a kanban board to visualize your workflow, moving tasks from "To Do" to "In Progress" to "Done". End each day with a brief reflection.`)
    sections.push("")
    sections.push("### Weekly Review")
    sections.push(`Set aside 30 minutes each week to review what worked and what didn't. Adjust your approach to ${lower} based on actual results rather than assumptions.`)
    sections.push("")
  } else if (effectiveStyle === "Security") {
    sections.push("### Password Audit")
    sections.push(`Review all your online accounts and ensure each uses a unique, strong password. Use a password generator to create complex passwords that mix letters, numbers, and symbols.`)
    sections.push("")
    sections.push("### QR Safety Check")
    sections.push(`Before scanning a QR code, inspect it visually for tampering. Use a QR scanner that shows the destination URL before opening it, so you can verify the link is legitimate.`)
    sections.push("")
  } else if (effectiveStyle === "Developer") {
    sections.push("### Debugging Workflow")
    sections.push(`When debugging issues related to ${lower}, start by isolating the problem. Use structured data formatters and validators to verify inputs and outputs, then narrow down the root cause systematically.`)
    sections.push("")
    sections.push("### Automation Script")
    sections.push(`Create a script that automates common tasks related to ${lower}. This could include data transformation, URL encoding/decoding, or regex-based text processing. Automate repetitive work to focus on higher-value tasks.`)
    sections.push("")
  } else if (effectiveStyle === "Finance") {
    sections.push("### Monthly Budget Review")
    sections.push(`Track all income and expenses for a month. Categorize each transaction and compare actual spending to your budget. Use an expense tracker to visualize patterns and identify areas for adjustment.`)
    sections.push("")
    sections.push("### Loan Comparison")
    sections.push(`When comparing loan options, use a loan calculator to evaluate total cost, monthly payments, and interest over time. This helps you make an informed decision based on numbers, not emotions.`)
    sections.push("")
  } else if (effectiveStyle === "Design") {
    sections.push("### Color Palette Creation")
    sections.push(`Start a design project by building a cohesive color palette. Use a color picker to explore hues, adjust saturation and lightness, and export colors in HEX, RGB, and HSL formats for consistent use across your project.`)
    sections.push("")
    sections.push("### Placeholder Workflow")
    sections.push(`When wireframing or prototyping, use placeholder images and text to maintain focus on layout and structure. Replace placeholders with final assets as the design matures.`)
    sections.push("")
  } else if (effectiveStyle === "File Conversion") {
    sections.push("### Document Workflow")
    sections.push(`When preparing documents for distribution, convert them to PDF to ensure consistent formatting across devices. For team collaboration, keep source files in editable formats like DOCX and convert to PDF only for final delivery.`)
    sections.push("")
    sections.push("### Image Optimization")
    sections.push(`Before uploading images to a website, convert them to web-optimized formats. Reduce file size without visible quality loss to improve page load times and user experience.`)
    sections.push("")
  } else {
    sections.push("### Real-World Application")
    sections.push(`Consider how ${lower} applies in everyday situations. Look for examples in your daily life that illustrate the key concepts you are learning.`)
    sections.push("")
    sections.push("### Problem-Solving Scenario")
    sections.push(`Work through a problem that requires applying multiple concepts from ${lower}. Break it down step by step and reflect on what you learned.`)
    sections.push("")
  }

  sections.push("## Tools You Can Use")
  sections.push("")
  sections.push(`ToolForge offers a suite of free, privacy-first tools that support your work with ${lower}. All tools run entirely in your browser — nothing is uploaded to any server, and no account is required.`)
  sections.push("")
  sections.push("Key benefits of using ToolForge tools:")
  sections.push("")
  sections.push("- **Zero data leaving your device**: All processing happens locally")
  sections.push("- **No account or login**: Start using tools instantly")
  sections.push("- **No tracking or analytics**: Your usage stays private")
  sections.push("- **Works offline**: Many tools function without internet")
  sections.push("")

  if (smartTools.length > 0) {
    sections.push("### Recommended Tools for This Topic")
    sections.push("")
    for (const tool of smartTools) {
      const shortDesc = getToolShortDesc(tool.url)
      sections.push(`- [${tool.name}](${tool.url}) — ${shortDesc}`)
    }
    sections.push("")
  }

  sections.push("## Summary")
  sections.push("")
  sections.push(`Mastering ${lower} is a journey that requires dedication, practice, and the right resources. By following the strategies outlined in this guide, you can build a strong understanding and apply your knowledge effectively.`)
  sections.push("")
  sections.push("Remember:")
  sections.push("")
  sections.push("- Start with the fundamentals and build progressively")
  sections.push("- Practice consistently and track your progress")
  sections.push("- Use available tools and resources to support your learning")
  sections.push("- Reflect regularly on what you have learned and adjust your approach")
  sections.push("")
  sections.push("---")
  sections.push("")
  sections.push(`*This guide was generated by ToolForge Blog Generator using ${effectiveStyle} style. All tools mentioned are free, privacy-first, and require no login. Try them today at [toolforge.app](https://smart-tools-kit.vercel.app).*`)

  return sections.join("\n")
}

function getToolShortDesc(url: string): string {
  const descs: Record<string, string> = {
    "/tools/grade-calculator": "Calculate scores and competency levels (EE/ME/AE/BE)",
    "/tools/lesson-plan-generator": "Create KICD-compliant lesson plans",
    "/tools/revision-planner": "Plan and track curriculum-aligned revision sessions",
    "/tools/exam-generator": "Generate performance-based assessments",
    "/tools/teacher-comment-generator": "Write competency-based report comments",
    "/tools/scheme-of-work-generator": "Create termly schemes of work",
    "/tools/pomodoro": "Stay focused with timed work intervals",
    "/tools/todo": "Organize tasks and track progress",
    "/tools/notes": "Write and organize notes with local storage",
    "/tools/kanban": "Visualize workflows with drag-and-drop boards",
    "/tools/day-planner": "Plan your day hour by hour",
    "/tools/habit-tracker": "Build and maintain daily habits",
    "/tools/stopwatch": "Track time with lap recording",
    "/tools/password-generator": "Generate strong secure passwords",
    "/tools/qr-scanner": "Scan QR codes safely with preview",
    "/tools/qr-generator": "Create QR codes from text or URLs",
    "/tools/qr-extractor": "Decode QR codes from images",
    "/tools/text-cleaner": "Remove extra spaces and duplicates",
    "/tools/base64": "Encode and decode Base64 strings",
    "/tools/url-encoder": "Encode and decode URLs safely",
    "/tools/random-generator": "Generate random UUIDs and numbers",
    "/tools/json-formatter": "Format, validate, and beautify JSON",
    "/tools/regex-tester": "Test regular expressions live",
    "/tools/markdown-preview": "Preview markdown in real-time",
    "/tools/unit-converter": "Convert length, weight, temperature",
    "/tools/pdf-converter": "Convert files to and from PDF",
    "/tools/image-converter": "Convert images between formats",
    "/tools/document-converter": "Convert documents between formats",
    "/tools/audio-converter": "Convert audio files between formats",
    "/tools/file-compressor": "Compress and archive files",
    "/tools/color-picker": "Pick and convert colors in HEX, RGB, HSL",
    "/tools/image-placeholder": "Create custom sized placeholder images",
    "/tools/favicon-generator": "Generate favicons from text or emoji",
    "/tools/lorem-ipsum": "Generate placeholder text for designs",
    "/tools/loan-calculator": "Calculate loan payments and EMI schedules",
    "/tools/profit-calculator": "Calculate profit margins and ROI",
    "/tools/currency-converter": "Convert between world currencies",
    "/tools/expense-tracker": "Track and analyze monthly spending",
  }
  return descs[url] || "Free privacy-first browser tool"
}

function generateFrontmatter(
  title: string,
  description: string,
  category: BlogCategory,
  tags: string[],
  slug: string,
  audience: TargetAudience,
  styleEngine: string,
  coverSerialized?: string,
  signals?: typeof AISignals,
): string {
  const date = new Date().toISOString().split("T")[0]
  const tagsStr = tags.length > 0
    ? `\n${tags.map((t) => `  - ${t.trim()}`).join("\n")}`
    : " []"
  const coverLine = coverSerialized ? `\ncoverImage: "${coverSerialized.replace(/"/g, '\\"')}"` : ""
  const signalsBlock = signals ? `\naiContentType: "${signals.contentType}"\naiIntent: "${signals.intent}"\naiDepth: "${signals.depth}"\naiReadability: "${signals.readability}"\naiExtractable: ${signals.extractable}` : ""

  return `---
title: "${title}"
description: "${description}"
date: "${date}"
category: "${category}"
audience: "${audience}"
styleEngine: "${styleEngine}"${coverLine}
tags:${tagsStr}
slug: "${slug}"
lastModified: "${date}"${signalsBlock}
---`
}

function AIScoreBadge({ content }: { content: string }) {
  const score = calculateAIVisibilityScore(content)
  const badge = getAIBadge(score)
  const links = countInternalLinks(content)
  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium">
        <span className="text-muted-foreground">AI Score:</span>
        <span className={badge.color}>{formatAIScore(score)}</span>
      </span>
      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
        {badge.emoji} {badge.label}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        {links} internal {links === 1 ? "link" : "links"}
      </span>
    </div>
  )
}

export default function BlogGenerator() {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<BlogCategory>("General")
  const [contentStyle, setContentStyle] = useState<ContentStyle>("Auto")
  const [tagsInput, setTagsInput] = useState("")
  const [audience, setAudience] = useState<TargetAudience>("General Users")
  const [keyword, setKeyword] = useState("")
  const [autoLink, setAutoLink] = useState(true)
  const [result, setResult] = useState<GeneratedBlog | null>(null)
  const [copied, setCopied] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [publishedPath, setPublishedPath] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<"mdx" | "preview">("mdx")
  const [qualityScore, setQualityScore] = useState<number | null>(null)
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([])
  const [showValidation, setShowValidation] = useState(false)
  const [autoFixing, setAutoFixing] = useState(false)
  const [autoFixResult, setAutoFixResult] = useState<AutoFixResult | null>(null)

  const descCharCount = useMemo(() => {
    if (!keyword && !title) return 0
    const effectiveStyle = contentStyle === "Auto" ? inferStyleFromTitle(title || "guide", category) : contentStyle
    return generateDescription(title || "Your blog title", effectiveStyle, audience, keyword).length
  }, [title, category, contentStyle, audience, keyword])

  const currentStyleLabel = useMemo(() => {
    if (contentStyle === "Auto") {
      const inferred = title ? inferStyleFromTitle(title, category) : "General"
      return `Auto (detected: ${inferred})`
    }
    return contentStyle
  }, [contentStyle, title, category])

  const handleGenerate = useCallback(() => {
    if (!title.trim()) {
      toast.error("Please enter a blog title")
      return
    }

    const slug = generateSlug(title)
    const effectiveStyle = contentStyle === "Auto"
      ? inferStyleFromTitle(title, category)
      : contentStyle

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    if (!tags.includes(effectiveStyle)) {
      tags.unshift(effectiveStyle)
    }

    const aiOptimizedTitle = optimizeTitle(title)
    const smartTools = autoLink ? getCategoryTools(effectiveStyle, title) : []
    const description = generateDescription(title, effectiveStyle, audience, keyword)
    const content = generateContent(title, effectiveStyle, audience, tags, keyword, autoLink, smartTools)
    const coverConfig = generateCoverConfig(title, effectiveStyle)
    const coverSerialized = serializeCover(coverConfig)
    const signals = AISignals
    const frontmatter = generateFrontmatter(title, description, category, tags, slug, audience, effectiveStyle, coverSerialized, signals)
    const mdx = `${frontmatter}\n\n${content}`

    const tips = aiImprovementTips(calculateAIVisibilityScore(content))

    setResult({
      title,
      description,
      slug,
      category,
      styleEngine: effectiveStyle,
      tags,
      audience,
      content,
      frontmatter,
      mdx,
      coverSerialized,
      aiOptimizedTitle,
    })
    const qScore = computeContentQualityScore(content)
    setQualityScore(qScore)
    const issues = runPrePublishValidation({ title, description, tags, slug, content })
    setValidationIssues(issues)
    setAutoFixResult(null)
    if (tips.length > 0 && tips[0] !== "Content is AI-ready") {
      toast.info(`AI tips: ${tips.join(", ")}`)
    }
    setCopied(false)
    toast.success(`Blog post generated! (${effectiveStyle} style)${qScore < 70 ? " Quality score: " + qScore + "/100" : ""}`)
  }, [title, category, contentStyle, audience, keyword, tagsInput, autoLink])

  const handleCopy = useCallback(async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.mdx)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [result])

  const handleDownload = useCallback(() => {
    if (!result) return
    const blob = new Blob([result.mdx], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${result.slug}.mdx`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("File downloaded")
  }, [result])

  const handleReset = useCallback(() => {
    setTitle("")
    setCategory("General")
    setContentStyle("Auto")
    setTagsInput("")
    setAudience("General Users")
    setKeyword("")
    setAutoLink(true)
    setResult(null)
    setCopied(false)
    setPublishedPath(null)
    setQualityScore(null)
    setValidationIssues([])
    setShowValidation(false)
    setAutoFixResult(null)
  }, [])

  const handleRunValidation = useCallback(() => {
    if (!result) return
    const issues = runPrePublishValidation({
      title: result.title,
      description: result.description,
      tags: result.tags,
      slug: result.slug,
      content: result.content,
    })
    setValidationIssues(issues)
    setShowValidation(true)
    if (issues.length === 0) {
      toast.success("No validation issues found")
    } else {
      const errors = issues.filter((i) => i.severity === "error")
      const warnings = issues.filter((i) => i.severity === "warning")
      toast.info(`${errors.length} errors, ${warnings.length} warnings`)
    }
  }, [result])

  const handleAutoFix = useCallback(() => {
    if (!result) return
    setAutoFixing(true)
    try {
      const fix = autoFixAll({
        title: result.title,
        description: result.description,
        tags: result.tags,
        slug: result.slug,
        content: result.content,
      })
      setAutoFixResult(fix)
      const fixedContent = fix.content
      const fixedMdx = result.mdx
        .replace(result.title, fix.title)
        .replace(result.description, fix.description)
      const frontmatterLines = fixedMdx.split("\n")
      const newFrontmatter = frontmatterLines.map((line) => {
        if (line.startsWith("title: ")) return `title: "${fix.title}"`
        if (line.startsWith("description: ")) return `description: "${fix.description}"`
        if (line.startsWith("slug: ")) return `slug: "${fix.slug}"`
        return line
      }).join("\n")
      const tagsLines = fix.tags.map((t) => `  - ${t}`).join("\n")
      const withTags = newFrontmatter.replace(
        /tags:\n(?:  - .+\n)*/,
        `tags:\n${tagsLines}\n`,
      )
      setResult({ ...result, mdx: withTags })
      setQualityScore(computeContentQualityScore(fix.content))
      const updatedIssues = runPrePublishValidation({
        title: fix.title,
        description: fix.description,
        tags: fix.tags,
        slug: fix.slug,
        content: fix.content,
      })
      setValidationIssues(updatedIssues)
      if (fix.fixesApplied.length > 0) {
        toast.success(`Applied ${fix.fixesApplied.length} fixes: ${fix.fixesApplied.join(", ")}`)
      } else {
        toast.success("No fixes needed")
      }
    } catch {
      toast.error("Auto-fix failed")
    } finally {
      setAutoFixing(false)
    }
  }, [result])

  const handlePublish = useCallback(async () => {
    if (!result) return
    setPublishing(true)
    try {
      const res = await fetch("/api/publish-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: result.slug,
          content: result.mdx,
          title: result.title,
          description: result.description,
          tags: result.tags,
          skipValidation: true,
          skipAutoFix: true,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setPublishedPath(data.filePath || data.path)
        toast.success(`Published to GitHub! ${data.url || data.filePath}`)
      } else {
        const step = data.step ? ` [${data.step}]` : ""
        const detail = data.details ? ` — ${data.details}` : ""
        toast.error(`${data.error || data.message || "Failed to publish"}${step}${detail}`)
      }
    } catch {
      toast.error("Network error — could not publish")
    } finally {
      setPublishing(false)
    }
  }, [result])

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-background/40 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">AI Blog Engine</h2>
            <p className="text-sm text-muted-foreground">
              Generate SEO-optimized MDX blog posts for any category
            </p>
          </div>
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Cpu className="h-4 w-4" />
            </div>
            <div className="text-sm font-medium">Content Style Engine</div>
          </div>
          <select
            value={contentStyle}
            onChange={(e) => setContentStyle(e.target.value as ContentStyle)}
            className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {contentStyles.map((s) => (
              <option key={s} value={s} className="dark:bg-background">
                {s === "Auto" ? `${s} (Recommended)` : s}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            {contentStyle === "Auto"
              ? "Automatically detects the best content style based on your title and category."
              : `Content will be tailored for the ${contentStyle} category with relevant examples and tools.`}
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-lg border p-3">
          <button
            onClick={() => setAutoLink(!autoLink)}
            className="flex items-center gap-2 text-sm"
            type="button"
          >
            <div className={`h-5 w-10 rounded-full transition-colors ${autoLink ? "bg-primary" : "bg-muted"} relative`}>
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${autoLink ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className={autoLink ? "text-foreground font-medium" : "text-muted-foreground"}>
              Auto Link Tools
            </span>
          </button>
          {autoLink && (
            <span className="text-xs text-muted-foreground">
              Smart tool links based on title keywords
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Blog Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How to stay productive as a student"
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BlogCategory)}
                className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="dark:bg-background">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as TargetAudience)}
                className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {audiences.map((a) => (
                  <option key={a} value={a} className="dark:bg-background">
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (comma-separated, optional)</label>
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. productivity, study tips, time management"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                SEO Focus Keyword (optional)
                {keyword && (
                  <span className="text-xs text-muted-foreground ml-2">
                    Description: {descCharCount}/160 chars
                  </span>
                )}
              </label>
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. student productivity tips"
                className="h-11"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleGenerate} size="lg" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Blog Post
          </Button>
          <Button variant="outline" size="lg" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="rounded-xl border bg-background/40 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Preview</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant={previewMode === "preview" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode("preview")}
                  className="gap-1.5"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </Button>
                <Button
                  variant={previewMode === "mdx" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode("mdx")}
                  className="gap-1.5"
                >
                  <Code className="h-3.5 w-3.5" />
                  MDX
                </Button>
              </div>
            </div>

            {previewMode === "preview" ? (
              <div className="space-y-4">
                <BlogCoverImage
                  coverImage={result.coverSerialized}
                  title={result.title}
                  size="article"
                  className="mb-4"
                />
                <div>
                  <h4 className="text-lg font-bold">{result.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
                    {result.category}
                  </span>
                  <span className="inline-flex items-center rounded-full border bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                    {result.styleEngine}
                  </span>
                  {result.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border bg-background/40 px-2.5 py-0.5 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  Slug: /blog/{result.slug} &middot; Audience: {result.audience}
                </div>
                <AIScoreBadge content={result.content} />
                {qualityScore !== null && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium">
                      <span className="text-muted-foreground">Content Quality:</span>
                      <span className={getQualityBadge(qualityScore).color}>{qualityScore}/100</span>
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getQualityBadge(qualityScore).className}`}>
                      {qualityScore >= 90 ? "🟢" : qualityScore >= 70 ? "🟡" : "🔴"} {getQualityBadge(qualityScore).label}
                    </span>
                  </div>
                )}
                {showValidation && validationIssues.length > 0 && (
                  <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                      <span>⚠</span>
                      <span>Pre-Publish Validation Issues</span>
                    </div>
                    {validationIssues.map((issue, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className={issue.severity === "error" ? "text-red-500" : "text-yellow-500"}>
                          {issue.severity === "error" ? "✕" : "!"}
                        </span>
                        <span className="text-muted-foreground">
                          <span className="font-medium">{issue.field}:</span> {issue.message}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={handleCopy}
                    className="gap-1"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={handleDownload}
                    className="gap-1"
                  >
                    <Download className="h-3.5 w-3.5" />
                    .mdx
                  </Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={handleRunValidation}
                    className="gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Validate
                  </Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={handleAutoFix}
                    disabled={autoFixing}
                    className="gap-1"
                  >
                    {autoFixing ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    {autoFixing ? "Fixing..." : "Fix SEO"}
                  </Button>
                  <Button
                    variant={publishedPath ? "default" : "secondary"}
                    size="xs"
                    onClick={handlePublish}
                    disabled={publishing || !!publishedPath}
                    className="gap-1"
                  >
                    {publishing ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : publishedPath ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Globe className="h-3.5 w-3.5" />
                    )}
                    {publishing ? "Publishing..." : publishedPath ? "Published" : "Publish"}
                  </Button>
                </div>
                {publishedPath && (
                  <div className="absolute top-12 right-3 z-10">
                    <div className="flex items-center gap-2 rounded-lg border bg-background/95 backdrop-blur-sm px-3 py-1.5 text-xs">
                      <ExternalLink className="h-3 w-3 text-green-500" />
                      <span className="text-muted-foreground truncate max-w-[200px]">{publishedPath}</span>
                    </div>
                  </div>
                )}
                <pre className="rounded-xl border bg-muted/30 p-4 pt-12 overflow-x-auto text-sm font-mono leading-relaxed max-h-[500px] overflow-y-auto">
                  <code>{result.mdx}</code>
                </pre>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleGenerate} variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Regenerate
            </Button>
            <Button onClick={handleReset} variant="ghost" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Create Another
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-background/40 p-4">
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Privacy Notice</p>
          <p>All content is generated locally in your browser. No data is sent to any server. No tracking, no analytics, no storage of your inputs.</p>
        </div>
      </div>
    </div>
  )
}

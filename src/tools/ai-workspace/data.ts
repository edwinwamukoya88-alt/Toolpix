import {
  MessageSquare, Search, Edit3, Shuffle, AlignLeft, Languages,
  Mic, Mail, BookOpen, Pen, FileSpreadsheet, CalendarDays,
  ClipboardList, MessageSquareText, Repeat, Pencil, Palette,
  Share2, Image, Award, CreditCard, GraduationCap,
  PenTool,
} from "lucide-react"
import type { FeatureDef, CategoryDef, FeatureCategory } from "./types"

export const WRITING_FEATURES: FeatureDef[] = [
  { id: "humanize", name: "Humanize", description: "Make AI text sound natural and human", icon: MessageSquare, color: "text-blue-400", category: "writing", promptPlaceholder: "Paste AI-generated text to make it sound more human..." },
  { id: "detector", name: "AI Detector", description: "Detect AI-generated content", icon: Search, color: "text-red-400", category: "writing", promptPlaceholder: "Paste text to check if it's AI-generated..." },
  { id: "grammar", name: "Grammar Check", description: "Fix grammar, spelling, and punctuation", icon: Edit3, color: "text-emerald-400", category: "writing", promptPlaceholder: "Paste text to check for grammar issues..." },
  { id: "rewrite", name: "Rewrite", description: "Rewrite text in any style", icon: Shuffle, color: "text-violet-400", category: "writing", settings: [{ key: "style", label: "Style", type: "select", options: [{ value: "clear", label: "Clear" }, { value: "concise", label: "Concise" }, { value: "creative", label: "Creative" }], defaultValue: "clear" }], promptPlaceholder: "Paste text to rewrite..." },
  { id: "summarize", name: "Summarize", description: "Summarize text at any length", icon: AlignLeft, color: "text-amber-400", category: "writing", settings: [{ key: "length", label: "Length", type: "select", options: [{ value: "short", label: "Short (2-3 sentences)" }, { value: "medium", label: "Medium (1 paragraph)" }, { value: "detailed", label: "Detailed (2-3 paragraphs)" }], defaultValue: "medium" }], promptPlaceholder: "Paste text to summarize..." },
  { id: "translate", name: "Translate", description: "Translate text to any language", icon: Languages, color: "text-cyan-400", category: "writing", settings: [{ key: "language", label: "Language", type: "select", options: [{ value: "Spanish", label: "Spanish" }, { value: "French", label: "French" }, { value: "German", label: "German" }, { value: "Italian", label: "Italian" }, { value: "Portuguese", label: "Portuguese" }, { value: "Russian", label: "Russian" }, { value: "Arabic", label: "Arabic" }, { value: "Chinese", label: "Chinese" }, { value: "Japanese", label: "Japanese" }, { value: "Swahili", label: "Swahili" }], defaultValue: "Spanish" }], promptPlaceholder: "Paste text to translate..." },
  { id: "change-tone", name: "Change Tone", description: "Adapt tone while preserving meaning", icon: Mic, color: "text-pink-400", category: "writing", settings: [{ key: "tone", label: "Tone", type: "select", options: [{ value: "Professional", label: "Professional" }, { value: "Friendly", label: "Friendly" }, { value: "Casual", label: "Casual" }, { value: "Formal", label: "Formal" }, { value: "Persuasive", label: "Persuasive" }, { value: "Confident", label: "Confident" }, { value: "Academic", label: "Academic" }], defaultValue: "Professional" }], promptPlaceholder: "Paste text to change its tone..." },
  { id: "email-writer", name: "Email Writer", description: "Compose professional emails", icon: Mail, color: "text-sky-400", category: "writing", settings: [{ key: "emailType", label: "Email Type", type: "select", options: [{ value: "Business", label: "Business" }, { value: "Customer Support", label: "Customer Support" }, { value: "Follow-up", label: "Follow-up" }, { value: "Complaint", label: "Complaint" }, { value: "Request", label: "Request" }, { value: "Thank You", label: "Thank You" }, { value: "Job Application", label: "Job Application" }], defaultValue: "Business" }], promptPlaceholder: "Describe the email you want to write..." },
  { id: "essay-improver", name: "Essay Improver", description: "Improve vocabulary, structure, and flow", icon: BookOpen, color: "text-indigo-400", category: "writing", promptPlaceholder: "Paste your essay to improve..." },
  { id: "resume-rewriter", name: "Resume Rewriter", description: "Rewrite resume bullets with impact", icon: Pen, color: "text-orange-400", category: "writing", promptPlaceholder: "Paste resume bullet points to rewrite..." },
]

const GRADE_OPTIONS = [
  { value: "Pre-Primary 1", label: "Pre-Primary 1" }, { value: "Pre-Primary 2", label: "Pre-Primary 2" },
  { value: "Grade 1", label: "Grade 1" }, { value: "Grade 2", label: "Grade 2" }, { value: "Grade 3", label: "Grade 3" },
  { value: "Grade 4", label: "Grade 4" }, { value: "Grade 5", label: "Grade 5" }, { value: "Grade 6", label: "Grade 6" },
  { value: "Grade 7", label: "Grade 7" }, { value: "Grade 8", label: "Grade 8" }, { value: "Grade 9", label: "Grade 9" },
]

const DURATION_OPTIONS = [
  { value: "30", label: "30 Minutes" },
  { value: "40", label: "40 Minutes" },
  { value: "60", label: "60 Minutes" },
  { value: "80", label: "80 Minutes" },
]

const EDUCATION_BASE_SETTINGS = [
  { key: "grade", label: "Grade", type: "select" as const, options: GRADE_OPTIONS },
  { key: "learningArea", label: "Learning Area", type: "text" as const, placeholder: "e.g., Mathematics, English" },
  { key: "strand", label: "Strand", type: "text" as const, placeholder: "e.g., Numbers, Grammar" },
  { key: "subStrand", label: "Sub-Strand", type: "text" as const, placeholder: "e.g., Addition, Tenses" },
  { key: "duration", label: "Lesson Duration", type: "select" as const, options: DURATION_OPTIONS, defaultValue: "40" },
]

export const EDUCATION_FEATURES: FeatureDef[] = [
  { id: "lesson-planner", name: "Lesson Plan", description: "Generate KICD-compliant lesson plans", icon: FileSpreadsheet, color: "text-emerald-400", category: "education", settings: [...EDUCATION_BASE_SETTINGS], promptPlaceholder: "Describe the lesson topic and any specific requirements..." },
  { id: "scheme-of-work", name: "Scheme of Work", description: "Generate termly scheme of work", icon: CalendarDays, color: "text-blue-400", category: "education", settings: [...EDUCATION_BASE_SETTINGS], promptPlaceholder: "Describe the subject and any specific requirements for the term..." },
  { id: "assessment", name: "Assessment", description: "Design competency-based assessments", icon: ClipboardList, color: "text-amber-400", category: "education", settings: [...EDUCATION_BASE_SETTINGS], promptPlaceholder: "Describe the assessment topic and requirements..." },
  { id: "comment-generator", name: "Comments", description: "Generate CBC report card comments", icon: MessageSquareText, color: "text-purple-400", category: "education", settings: [...EDUCATION_BASE_SETTINGS], promptPlaceholder: "Describe the student's performance or areas to comment on..." },
  { id: "revision-planner", name: "Revision", description: "Create structured revision plans", icon: Repeat, color: "text-rose-400", category: "education", settings: [...EDUCATION_BASE_SETTINGS], promptPlaceholder: "Describe the subject and topics to revise..." },
  { id: "generate-bulk-comments", name: "Bulk Comments", description: "Generate 20 class comments at once", icon: Pencil, color: "text-teal-400", category: "education", settings: [...EDUCATION_BASE_SETTINGS], promptPlaceholder: "Describe the class performance or subject context..." },
  { id: "education-followup", name: "Follow-up", description: "Modify a previously generated document", icon: Repeat, color: "text-sky-400", category: "education", settings: [...EDUCATION_BASE_SETTINGS], promptPlaceholder: "Paste the previous document and describe what changes you want..." },
]

export const DESIGN_FEATURES: FeatureDef[] = [
  { id: "design-cards", name: "Design Cards", description: "Create cards, invitations, and certificates", icon: Palette, color: "text-pink-400", category: "design", settings: [{ key: "cardType", label: "Card Type", type: "select", options: [{ value: "Business Card", label: "Business Card" }, { value: "Certificate", label: "Certificate" }, { value: "Invitation", label: "Invitation" }, { value: "Event Card", label: "Event Card" }, { value: "Wedding Card", label: "Wedding Card" }, { value: "Birthday Card", label: "Birthday Card" }, { value: "Thank You Card", label: "Thank You Card" }] }, { key: "name", label: "Name", type: "text", placeholder: "Full name" }, { key: "title", label: "Title/Role", type: "text", placeholder: "Optional" }, { key: "company", label: "Company", type: "text", placeholder: "Optional" }, { key: "phone", label: "Phone", type: "text", placeholder: "Optional" }, { key: "email", label: "Email", type: "text", placeholder: "Optional" }], promptPlaceholder: "Describe the card you want to design..." },
  { id: "social-media", name: "Social Media", description: "Create platform-optimized posts", icon: Share2, color: "text-blue-400", category: "design", settings: [{ key: "platform", label: "Platform", type: "select", options: [{ value: "Instagram", label: "Instagram" }, { value: "Facebook", label: "Facebook" }, { value: "LinkedIn", label: "LinkedIn" }, { value: "X/Twitter", label: "X/Twitter" }, { value: "Pinterest", label: "Pinterest" }] }, { key: "content", label: "Content Description", type: "text", placeholder: "What is your post about?" }], promptPlaceholder: "Describe the social media post you want to create..." },
  { id: "flyer", name: "Flyer", description: "Design promotional flyers with HTML", icon: Image, color: "text-amber-400", category: "design", settings: [{ key: "event", label: "Event Name", type: "text", placeholder: "e.g., Annual Science Fair" }, { key: "date", label: "Date", type: "text", placeholder: "e.g., March 15, 2025" }, { key: "location", label: "Location", type: "text", placeholder: "e.g., School Hall" }], promptPlaceholder: "Describe the flyer you want to design..." },
  { id: "poster", name: "Poster", description: "Design posters with HTML preview", icon: Image, color: "text-violet-400", category: "design", settings: [{ key: "posterTitle", label: "Poster Title", type: "text", placeholder: "e.g., School Open Day" }, { key: "description", label: "Description", type: "text", placeholder: "Brief description" }, { key: "organization", label: "Organization", type: "text", placeholder: "e.g., ToolForge Academy" }], promptPlaceholder: "Describe the poster you want to design..." },
  { id: "certificate", name: "Certificate", description: "Design elegant certificates", icon: Award, color: "text-yellow-400", category: "design", settings: [{ key: "certName", label: "Recipient Name", type: "text", placeholder: "Full name" }, { key: "certTitle", label: "Certificate Title", type: "text", placeholder: "e.g., Certificate of Achievement" }, { key: "issuedBy", label: "Issuing Organization", type: "text", placeholder: "e.g., ToolForge" }], promptPlaceholder: "Describe the certificate you want to design..." },
  { id: "business-card", name: "Business Card", description: "Design professional business cards", icon: CreditCard, color: "text-cyan-400", category: "design", settings: [{ key: "name", label: "Full Name", type: "text", placeholder: "John Doe" }, { key: "role", label: "Job Title", type: "text", placeholder: "e.g., Software Engineer" }, { key: "company", label: "Company", type: "text", placeholder: "e.g., Acme Inc." }, { key: "phone", label: "Phone", type: "text", placeholder: "+254 700 000 000" }, { key: "email", label: "Email", type: "text", placeholder: "john@acme.com" }], promptPlaceholder: "Describe the business card you want to design..." },
]

export const ALL_FEATURES = [...WRITING_FEATURES, ...EDUCATION_FEATURES, ...DESIGN_FEATURES]

export const CATEGORIES: CategoryDef[] = [
  { id: "writing", label: "Writing", icon: PenTool, color: "text-blue-400" },
  { id: "education", label: "Education", icon: GraduationCap, color: "text-emerald-400" },
  { id: "design", label: "Design", icon: Palette, color: "text-pink-400" },
]

export function getFeaturesByCategory(cat: FeatureCategory): FeatureDef[] {
  switch (cat) {
    case "writing": return WRITING_FEATURES
    case "education": return EDUCATION_FEATURES
    case "design": return DESIGN_FEATURES
  }
}

export function getFeature(id: string): FeatureDef | undefined {
  return ALL_FEATURES.find((f) => f.id === id)
}

export function getDefaultSettings(feature: FeatureDef): Record<string, string> {
  const settings: Record<string, string> = {}
  if (feature.settings) {
    for (const field of feature.settings) {
      settings[field.key] = field.defaultValue || ""
    }
  }
  return settings
}

export function formatWordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export function formatCharCount(text: string): number {
  return text.length
}

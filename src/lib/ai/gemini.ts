import { GoogleGenerativeAI } from "@google/generative-ai"

const API_KEY = process.env.GEMINI_API_KEY || ""
const CONFIGURED_MODEL = process.env.GEMINI_MODEL || ""

let resolvedModel = ""
let modelInitialized = false

const MODEL_PRIORITY = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-pro",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash-8b",
]

const genAI = new GoogleGenerativeAI(API_KEY)

function sanitizeError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  return msg.replace(/key=[A-Za-z0-9._-]+/gi, "key=***")
}

async function initModel(): Promise<void> {
  if (modelInitialized) return
  modelInitialized = true

  if (!API_KEY) {
    console.log("[Gemini] No API key configured")
    return
  }

  if (CONFIGURED_MODEL) {
    resolvedModel = CONFIGURED_MODEL
    console.log(`[Gemini] Using configured model: ${resolvedModel}`)
    return
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    const res = await fetch(url)
    if (!res.ok) {
      console.warn(`[Gemini] Model list fetch failed (HTTP ${res.status})`)
      return
    }
    const data = await res.json() as { models?: Array<{ name: string; supportedGenerationMethods?: string[] }> }
    const available = (data.models || [])
      .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
      .map((m) => m.name.replace("models/", ""))

    const found = MODEL_PRIORITY.find((m) => available.includes(m))
    if (found) {
      resolvedModel = found
      console.log(`[Gemini] Auto-selected: ${resolvedModel}`)
      return
    }

    if (available.length > 0) {
      resolvedModel = available[0]
      console.log(`[Gemini] Fallback: ${resolvedModel}`)
      return
    }

    console.warn("[Gemini] No available models in API response")
  } catch (err) {
    console.warn(`[Gemini] Model discovery error: ${sanitizeError(err)}`)
  }
}

function getModel(): string {
  return resolvedModel || CONFIGURED_MODEL || MODEL_PRIORITY[0]
}

interface GenerateParams {
  feature: string
  input: string
  settings: Record<string, string>
}

interface FeaturePrompt {
  system: string
  user: (input: string, settings: Record<string, string>) => string
}

function sanitizeHTML(raw: string): string {
  const allowedTags = new Set([
    "div", "span", "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "b", "i", "br", "hr", "ul", "ol", "li",
    "img", "svg", "path", "circle", "text", "line",
    "defs", "linearGradient", "stop", "mask", "rect", "g", "use",
    "table", "thead", "tbody", "tr", "th", "td",
  ])

  const allowedAttrs = new Set([
    "class", "style", "src", "alt", "href",
    "stroke", "fill", "viewbox", "d", "width", "height",
    "x", "y", "r", "cx", "cy", "stroke-width", "stroke-dasharray",
    "stroke-linecap", "id", "xmlns", "gradientunits",
    "x1", "y1", "x2", "y2", "offset", "stop-color",
  ])

  const eventPattern = /^on/i

  return raw.replace(/<(\/)?(\w+)([^>]*)>/gi, (match, closing, tagName, attrs) => {
    const tag = tagName.toLowerCase()
    if (!allowedTags.has(tag)) {
      const encoded = match
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
      return encoded
    }

    if (closing) return `<${closing}${tag}>`

    const safeAttrs = attrs.replace(/(\S+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/gi, (_: string, name: string, dq: string, sq: string, uq: string) => {
      const value = dq ?? sq ?? uq ?? ""
      const lowerName = name.toLowerCase()
      if (eventPattern.test(lowerName)) return ""
      if (lowerName === "href" || lowerName === "src") {
        if (/^javascript:/i.test(value)) return ""
        if (lowerName === "src" && !/^https?:\/\//i.test(value) && !value.startsWith("/")) return ""
      }
      if (!allowedAttrs.has(lowerName)) return ""
      if (value.includes('"')) {
        return ` ${lowerName}='${value.replace(/'/g, "&apos;")}'`
      }
      return ` ${lowerName}="${value.replace(/"/g, "&quot;")}"`
    })

    return `<${tag}${safeAttrs}>`
  })
}

function getPrompt(feature: string, input: string, settings: Record<string, string>): { system: string; user: string } {
  const prompts: Record<string, FeaturePrompt> = {
    humanize: {
      system: "You are a professional writing assistant that transforms formal, stiff, or AI-sounding text into natural, conversational human writing. Preserve all facts, meaning, and structure. Use contractions, varied sentence length, and natural phrasing. Never indicate you are an AI or mention the transformation.",
      user: (text) => `Rewrite the following text to sound more natural and human:\n\n${text}`,
    },
    detector: {
      system: "You are an AI content detection analyst. Analyze the provided text and return a JSON object with exactly these fields: score (integer 0-100), verdict (one of: 'Likely AI-generated', 'Possibly AI-generated', 'Likely human-written'), signals (array of strings, 2-5 items describing patterns detected). Only return the JSON object, no other text.",
      user: (text) => `Analyze this text for AI-generated patterns and return a JSON analysis:\n\n${text}`,
    },
    grammar: {
      system: "You are a professional grammar and spelling editor. Correct all grammar, spelling, punctuation, and style errors. Preserve the original meaning and tone. Return the corrected text followed by a bullet list of the changes made.",
      user: (text) => `Fix all grammar and spelling errors in this text. Show the corrected version and list each fix:\n\n${text}`,
    },
    rewrite: {
      system: "You are a professional rewriting assistant. Rewrite text according to the requested style: clear (improve clarity and readability), concise (shorten while preserving meaning), or creative (use vivid language and varied sentence structure). Preserve all key information.",
      user: (text, s) => `Rewrite this text in a "${s.style || "clear"}" style:\n\n${text}`,
    },
    summarize: {
      system: "You are a professional summarizer. Create a concise summary that captures all key points. Adjust length based on the requested level: short (2-3 sentences), medium (1 paragraph), or detailed (2-3 paragraphs). Include the word count reduction percentage.",
      user: (text, s) => `Provide a "${s.length || "medium"}" summary of the following text. Include word count comparison:\n\n${text}`,
    },
    translate: {
      system: "You are a professional translator. Translate the text accurately while preserving tone, style, and cultural nuances. Only return the translated text with a brief note about the translation approach.",
      user: (text, s) => `Translate the following text into ${s.language || "Spanish"}:\n\n${text}`,
    },
    "change-tone": {
      system: "You are a tone-adaptation specialist. Rewrite text to match the requested tone while preserving all facts and meaning. Available tones: Professional (formal, business-appropriate), Friendly (warm and approachable), Casual (conversational, relaxed), Formal (traditional, dignified), Persuasive (convincing, compelling), Confident (assertive, assured), Academic (scholarly, evidence-based).",
      user: (text, s) => `Rewrite the following text in a "${s.tone || "Professional"}" tone:\n\n${text}`,
    },
    "email-writer": {
      system: "You are a professional email writer. Compose complete, ready-to-send emails based on the user's prompt and requested type. Include a subject line, appropriate greeting, body, and closing. Types: Business, Customer Support, Follow-up, Complaint, Request, Thank You, Job Application.",
      user: (text, s) => `Write a "${s.emailType || "Business"}" email based on this prompt. Include subject line:\n\n${text}`,
    },
    "essay-improver": {
      system: "You are an academic writing coach. Improve the essay by enhancing vocabulary, sentence structure, transitions, thesis clarity, and argument flow. List specific improvements made. Preserve the author's voice and argument.",
      user: (text) => `Improve this essay. Show the enhanced version followed by a numbered list of improvements made:\n\n${text}`,
    },
    "resume-rewriter": {
      system: "You are a professional resume writer. Rewrite resume bullet points using strong action verbs, quantifiable achievements, and impact-focused language. Use industry-standard resume language. Each bullet should start with a powerful action verb and include measurable results.",
      user: (text) => `Rewrite these resume bullet points with strong action verbs and measurable impact. Preserve each bullet as a separate line:\n\n${text}`,
    },
    "lesson-planner": {
      system: "You are a KICD-certified CBC curriculum specialist. Generate a complete, KICD-compliant CBC lesson plan with ALL of the following sections: Learning Area, Grade, Strand, Sub-Strand, Lesson Duration, Number of Learners, Learning Environment, Learning Outcomes (specific, measurable), Success Criteria, Key Inquiry Questions, Core Competencies (communication, collaboration, critical thinking, creativity), Values, Pertinent and Contemporary Issues (PCIs), Learning Resources (including locally available materials), Lesson Development with clear timed phases (Introduction 5min, Lesson Development 30min, Conclusion 5min — adjust for lesson duration), Assessment Methods (formative/summative), Differentiation strategies for diverse learners, and Teacher Reflection. Use professional CBC terminology. Return the complete lesson plan as a well-structured document with clear headings and tables where appropriate.",
      user: (input, s) => {
        const ctx = []
        if (input) ctx.push(`Teacher's Request: ${input}`)
        if (s.grade) ctx.push(`Grade: ${s.grade}`)
        if (s.learningArea || s.subject) ctx.push(`Learning Area: ${s.learningArea || s.subject}`)
        if (s.strand) ctx.push(`Strand: ${s.strand}`)
        if (s.subStrand) ctx.push(`Sub-Strand: ${s.subStrand}`)
        if (s.duration) ctx.push(`Lesson Duration: ${s.duration} minutes`)
        if (s.learners) ctx.push(`Number of Learners: ${s.learners}`)
        if (s.environment) ctx.push(`Learning Environment: ${s.environment}`)
        if (s.competencyLevel) ctx.push(`Target Competency Level: ${s.competencyLevel}`)
        if (s.language) ctx.push(`Language of Instruction: ${s.language}`)
        if (s.curriculumVersion) ctx.push(`Curriculum Version: ${s.curriculumVersion}`)
        return `Generate a detailed KICD-compliant CBC lesson plan.\n\nCONTEXT:\n${ctx.join("\n")}\n\nStructure the lesson plan with clear headings and a professional layout. Include every standard CBC section.`
      },
    },
    "scheme-of-work": {
      system: "You are a KICD-certified CBC curriculum specialist. Generate a comprehensive CBC Scheme of Work as a structured table covering one term (approximately 10-13 weeks). Include columns: Week, Strand, Sub-Strand, Specific Learning Outcomes, Key Inquiry Questions, Core Competencies, Learning Resources, Assessment Methods, and Reflections. Ensure content progression across weeks is logical and builds on prior knowledge. Use professional CBC terminology.",
      user: (input, s) => {
        const ctx = []
        if (input) ctx.push(`Teacher's Request: ${input}`)
        if (s.learningArea || s.subject) ctx.push(`Learning Area: ${s.learningArea || s.subject}`)
        if (s.grade) ctx.push(`Grade: ${s.grade}`)
        if (s.strand) ctx.push(`Strand: ${s.strand}`)
        if (s.term) ctx.push(`Term: ${s.term}`)
        if (s.language) ctx.push(`Language of Instruction: ${s.language}`)
        if (s.curriculumVersion) ctx.push(`Curriculum Version: ${s.curriculumVersion}`)
        return `Generate a comprehensive CBC Scheme of Work.\n\nCONTEXT:\n${ctx.join("\n")}\n\nProvide a detailed weekly breakdown in table format with clear columns and proper CBC alignment.`
      },
    },
    assessment: {
      system: "You are a KICD-certified CBC assessment specialist. Design competency-based CBC assessments aligned to learning outcomes. Structure with: Assessment Type, Learning Area, Grade, Competency Assessed, Assessment Task Description, Scoring Rubric with performance levels (EE, ME, AE, BE), and Feedback Guidelines. Use CBC competency-based language. For rubrics, include clear descriptors for each performance level.",
      user: (input, s) => {
        const ctx = []
        if (input) ctx.push(`Teacher's Request: ${input}`)
        if (s.learningArea || s.subject) ctx.push(`Learning Area: ${s.learningArea || s.subject}`)
        if (s.grade) ctx.push(`Grade: ${s.grade}`)
        if (s.strand) ctx.push(`Strand: ${s.strand}`)
        if (s.subStrand) ctx.push(`Sub-Strand: ${s.subStrand}`)
        if (s.type) ctx.push(`Assessment Type: ${s.type}`)
        if (s.competencyLevel) ctx.push(`Target Competency Level: ${s.competencyLevel}`)
        if (s.language) ctx.push(`Language: ${s.language}`)
        return `Design a CBC competency-based assessment.\n\nCONTEXT:\n${ctx.join("\n")}\n\nInclude the assessment task, detailed scoring rubric with EE/ME/AE/BE descriptors, and alignment to CBC competencies.`
      },
    },
    "comment-generator": {
      system: "You are a KICD-certified CBC teacher writing end-of-term report card comments. Generate ONE concise paragraph (40-80 words) for the specified competency level only. Do NOT include introductory phrases ('Here is...', 'I have generated...'), parent letters, teacher reflections, areas for growth, or next steps unless explicitly requested. The comment must be a single ready-to-copy paragraph suitable for pasting directly into a report card. Focus on specific learner strengths, competency demonstration, and the designated performance level. Use professional but warm language.",
      user: (input, s) => {
        const ctx = []
        if (input) ctx.push(`Teacher's Request: ${input}`)
        if (s.studentName) ctx.push(`Student Name: ${s.studentName}`)
        if (s.learningArea || s.subject) ctx.push(`Learning Area: ${s.learningArea || s.subject}`)
        if (s.grade) ctx.push(`Grade: ${s.grade}`)
        if (s.level) ctx.push(`Competency Level: ${s.level}`)
        if (s.tone) ctx.push(`Tone: ${s.tone}`)
        if (s.language) ctx.push(`Language: ${s.language}`)
        const mode = s.outputMode || "short"
        const lengthGuide = mode === "short" ? "40-60 words" : mode === "standard" ? "50-80 words" : "80-120 words with specific evidence"
        return `Generate ONE concise CBC report card comment (${lengthGuide}) for the specified competency level only. Ready to copy into a report card.\n\nCONTEXT:\n${ctx.join("\n")}\n\nReturn only the comment paragraph — no labels, no headers, no introductions, no multiple versions.`
      },
    },
    "generate-bulk-comments": {
      system: "You are a KICD-certified CBC teacher writing end-of-term report card comments for an entire class. Generate 20 concise report-card-ready comments with a natural mix of EE, ME, AE, and BE competency levels. Each comment must be 40-80 words, single paragraph, ready to copy and paste. Do not include introductory phrases, labels, or numbering. Just return each comment separated by a blank line. Focus on specific learner strengths, competency demonstration, and constructive feedback appropriate to each level.",
      user: (input, s) => {
        const ctx = []
        if (input) ctx.push(`Teacher's Request: ${input}`)
        if (s.learningArea || s.subject) ctx.push(`Learning Area: ${s.learningArea || s.subject}`)
        if (s.grade) ctx.push(`Grade: ${s.grade}`)
        if (s.tone) ctx.push(`Tone: ${s.tone}`)
        if (s.language) ctx.push(`Language: ${s.language}`)
        return `Generate 20 report-card-ready CBC comments for a class.\n\nCONTEXT:\n${ctx.join("\n")}\n\nReturn 20 single-paragraph comments (40-80 words each) separated by blank lines. Mix competency levels naturally. Ready to copy and paste.`
      },
    },
    "revision-planner": {
      system: "You are a CBC curriculum coach and revision specialist. Create structured revision/study plans aligned to CBC learning outcomes. Include: weekly topic breakdown with specific strands/sub-strands, daily study timetable with time allocations, competency reinforcement activities, practice exercises with self-assessment checkpoints, study tips and strategies, and recommended resources. Ensure the plan is realistic and learner-friendly.",
      user: (input, s) => {
        const ctx = []
        if (input) ctx.push(`Teacher's Request: ${input}`)
        if (s.learningArea || s.subject) ctx.push(`Learning Area: ${s.learningArea || s.subject}`)
        if (s.grade) ctx.push(`Grade: ${s.grade}`)
        if (s.weeks) ctx.push(`Duration: ${s.weeks} weeks`)
        if (s.language) ctx.push(`Language: ${s.language}`)
        if (s.environment) ctx.push(`Learning Environment: ${s.environment}`)
        return `Create a structured CBC revision plan.\n\nCONTEXT:\n${ctx.join("\n")}\n\nInclude weekly breakdown, daily study timetable, practice activities, and self-assessment checkpoints. Make it practical and learner-friendly.`
      },
    },
    "education-followup": {
      system: "You are a KICD-certified CBC curriculum specialist continuing a previous conversation. The teacher has already received a CBC education document and now wants to modify it. Return the COMPLETE updated document with all modifications applied — do not say 'here is the modified version' or summarize changes, just return the full revised document, preserving the same professional format, headings, tables and structure. Maintain KICD/CBC compliance throughout.",
      user: (input) => input,
    },
    "design-cards": {
      system: "You are a professional graphic designer specializing in card design. Generate a detailed design brief and visual HTML preview for the requested card type (Business Card, Certificate, Invitation, Event Card, Wedding Card, Birthday Card, Thank You Card). Include: color palette, typography suggestions, layout description, and an HTML preview using Tailwind CSS classes. The HTML should use inline styles and Tailwind-compatible classes for a modern glassmorphism design.",
      user: (_, s) => {
        const details = [`Card Type: ${s.cardType || "Business Card"}`]
        if (s.name) details.push(`Name: ${s.name}`)
        if (s.title) details.push(`Title: ${s.title}`)
        if (s.company) details.push(`Company: ${s.company}`)
        if (s.phone) details.push(`Phone: ${s.phone}`)
        if (s.email) details.push(`Email: ${s.email}`)
        return `Design a ${s.cardType || "Business Card"} with the following details:\n${details.join("\n")}\n\nProvide a design description AND an HTML preview using Tailwind CSS classes. Wrap the HTML in \`\`\`html blocks.`
      },
    },
    "social-media": {
      system: "You are a social media content strategist. Create engaging, platform-optimized social media posts. Adapt tone, length, and format to the platform (Instagram, Facebook, LinkedIn, X/Twitter, Pinterest). Include relevant hashtags and engagement prompts.",
      user: (_, s) => `Create a ${s.platform || "Instagram"} post for:\n${s.content || "Your post content"}\n\nInclude the post text, hashtags, and engagement strategy.`,
    },
    flyer: {
      system: "You are a professional flyer designer. Generate a complete flyer design with: headline, event details, visual layout description, and an HTML preview using Tailwind CSS classes. Include color suggestions and typography recommendations. The HTML should be visually striking with gradient backgrounds and modern styling.",
      user: (_, s) => `Design a flyer for:\nEvent: ${s.event || "Event Name"}\nDate: ${s.date || "Date"}\nLocation: ${s.location || "Location"}\n\nProvide a design description AND an HTML preview using Tailwind CSS. Wrap the HTML in \`\`\`html blocks.`,
    },
    poster: {
      system: "You are a professional poster designer. Generate a complete poster design with: striking headline, description, visual layout, and an HTML preview using Tailwind CSS classes. Use dramatic typography, gradient backgrounds, and modern design principles. The poster should be attention-grabbing.",
      user: (_, s) => `Design a poster for:\nTitle: ${s.posterTitle || "Event Title"}\nDescription: ${s.description || "Event description"}\nOrganization: ${s.organization || "Organization"}\n\nProvide a design description AND an HTML preview using Tailwind CSS. Wrap the HTML in \`\`\`html blocks.`,
    },
    certificate: {
      system: "You are a professional certificate designer. Generate an elegant certificate design with: recipient name, certificate title, issuing organization, description of design elements, and an HTML preview using Tailwind CSS classes. Use formal, prestigious styling with borders, seals, and signatures.",
      user: (_, s) => `Design a certificate for:\nRecipient: ${s.certName || "Recipient Name"}\nCertificate Title: ${s.certTitle || "Certificate of Achievement"}\nIssued By: ${s.issuedBy || "Organization"}\n\nProvide a design description AND an HTML preview using Tailwind CSS. Wrap the HTML in \`\`\`html blocks.`,
    },
    "business-card": {
      system: "You are a professional business card designer. Generate a complete business card design with: name, role/title, company, contact details, design description, and an HTML preview using Tailwind CSS classes. Use modern, clean styling with a professional color scheme.",
      user: (_, s) => `Design a business card for:\nName: ${s.name || "Name"}\nRole: ${s.role || "Role"}\nCompany: ${s.company || "Company"}\nPhone: ${s.phone || "Phone"}\nEmail: ${s.email || "Email"}\n\nProvide a design description AND an HTML preview using Tailwind CSS. Wrap the HTML in \`\`\`html blocks.`,
    },
  }

  const prompt = prompts[feature]
  if (!prompt) {
    return {
      system: "You are a helpful AI assistant.",
      user: input || "Please process the following.",
    }
  }

  return { system: prompt.system, user: prompt.user(input, settings) }
}

const designFeatures = new Set([
  "design-cards", "flyer", "poster", "certificate", "business-card",
])

function classifyError(error: unknown): string {
  const err = error as { message?: string; status?: number } | undefined
  const message = err?.message || "Unknown error"

  if (message.includes("not found") || message.includes("not supported") || message.includes("not available")) return "model"
  if (message.includes("API_KEY_INVALID") || message.includes("API key") || message.includes("API_KEY_NOT_FOUND")) return "auth"
  if (message.includes("SAFETY")) return "safety"
  if (message.includes("quota") || message.includes("RATE_LIMIT") || err?.status === 429) return "quota"
  if (err?.status === 503 || message.includes("503") || message.includes("Service Unavailable") || message.includes("high demand")) return "busy"
  return "unknown"
}

export async function generateGeminiResponse(params: GenerateParams): Promise<{ output: string; html?: string }> {
  const { feature, input, settings } = params

  const { system, user } = getPrompt(feature, input, settings)

  if (!API_KEY) {
    return { output: "Gemini API key is not configured. Please set GEMINI_API_KEY in your environment variables." }
  }

  await initModel()
  const activeModel = getModel()
  if (!activeModel) {
    throw new Error("AI service is temporarily unavailable. Please try again later.")
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: activeModel, systemInstruction: system })

      const result = await model.generateContent(user)
      const response = result.response
      let text = response.text()

      let html: string | undefined

      const htmlMatch = text.match(/```html\n?([\s\S]*?)```/)
      if (htmlMatch) {
        html = sanitizeHTML(htmlMatch[1].trim())
        text = text.replace(/```html\n?[\s\S]*?```/, "").trim()
      }

      if (feature === "detector") {
        try {
          const json = JSON.parse(text)
          if (json.score !== undefined) {
            const score = json.score
            const verdict = json.verdict || "Analyzed"
            const signals = json.signals || []
            const color = score > 75 ? "#ef4444" : score > 50 ? "#f59e0b" : "#22c55e"
            html = `<div class="space-y-4"><div class="flex items-center gap-4"><div class="relative h-20 w-20"><svg class="w-20 h-20 -rotate-90" viewBox="0 0 36 36"><path class="text-muted-foreground/20" stroke-width="3" stroke="currentColor" fill="none" d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32"/><path stroke="${color}" stroke-width="3" fill="none" stroke-dasharray="${score}, 100" d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32"/></svg><span class="absolute inset-0 flex items-center justify-center text-lg font-bold">${score}%</span></div><div><p class="font-semibold text-lg">${verdict}</p><p class="text-sm text-muted-foreground">AI-Generation Probability</p></div></div>${signals.length > 0 ? `<div class="space-y-1.5"><p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Detected Signals</p>${signals.map((s: string) => `<div class="flex items-center gap-2 text-sm"><span class="h-1.5 w-1.5 rounded-full bg-${score > 75 ? "red" : "yellow"}-400/60 flex-shrink-0"/>${s}</div>`).join("")}</div>` : ""}</div>`
          }
        } catch {}
      }

      return { output: text, html }
    } catch (error: unknown) {
      console.error("[Gemini] API error:", error)
      const category = classifyError(error)

      if (attempt === 0 && category === "model") {
        console.warn("[Gemini] Model may be deprecated, re-discovering...")
        modelInitialized = false
        resolvedModel = ""
        await initModel()
        const newModel = getModel()
        if (newModel !== activeModel) continue
      }

      switch (category) {
        case "model":
          throw new Error("AI model unavailable. The feature uses a model that is no longer available. Please contact support.")
        case "auth":
          throw new Error("AI service not configured. The API key is invalid or missing.")
        case "safety":
          throw new Error("Your request was blocked by content safety filters. Try rephrasing.")
        case "quota":
          throw new Error("AI service is busy. Please try again later.")
        case "busy":
          throw new Error("AI service is temporarily unavailable due to high demand. Please wait a moment and try again.")
        default:
          throw new Error("AI service error. Please try again.")
      }
    }
  }

  throw new Error("AI service error. Please try again.")
}

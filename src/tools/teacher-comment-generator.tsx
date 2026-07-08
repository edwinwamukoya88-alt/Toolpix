"use client"

import { useState, useCallback, useRef } from "react"
import { Sparkles, Copy, RefreshCw, FileDown, FileText, Printer, ChevronDown, Star, Target, BookOpen, Users, Brain, Heart, AlignLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { trackToolUse, trackDownload } from "@/lib/analytics"

type CBCLevel = "BE" | "ME" | "AE" | "EE"
type ToneMode = "professional" | "encouraging" | "supportive" | "excellence"
type LengthMode = "short" | "standard" | "detailed"
type StyleProfile = "balanced" | "strict-academic" | "encouraging-mentor" | "headteacher-formal" | "cbc-examiner"

const cbcLabels: Record<CBCLevel, string> = {
  BE: "Below Expectation",
  ME: "Meeting Expectation",
  AE: "Approaching Expectation",
  EE: "Exceeding Expectation",
}

const toneLabels: Record<ToneMode, string> = {
  professional: "Professional",
  encouraging: "Encouraging",
  supportive: "Supportive",
  excellence: "Excellence",
}

const lengthLabels: Record<LengthMode, string> = {
  short: "Short (40-60 words)",
  standard: "Standard (60-90 words)",
  detailed: "Detailed (90-130 words)",
}

const lengthLimits: Record<LengthMode, { min: number; max: number }> = {
  short: { min: 40, max: 60 },
  standard: { min: 60, max: 90 },
  detailed: { min: 90, max: 130 },
}

const styleLabels: Record<StyleProfile, string> = {
  balanced: "Balanced Professional",
  "strict-academic": "Strict Academic",
  "encouraging-mentor": "Encouraging Mentor",
  "headteacher-formal": "Headteacher Formal",
  "cbc-examiner": "CBC Examiner Style",
}

const styleDescriptions: Record<StyleProfile, string> = {
  balanced: "Neutral formal CBC report tone with standard praise distribution",
  "strict-academic": "Formal tone with minimal praise and highly structured language",
  "encouraging-mentor": "Warm tone with balanced praise and supportive phrasing",
  "headteacher-formal": "Very formal, authoritative tone with longer structured sentences",
  "cbc-examiner": "Analytical tone focused on competency evidence with less emotional language",
}

type StructureMode = "standard" | "strengths-first" | "conduct-first" | "merged-ss"

const structureLabels: Record<StructureMode, string> = {
  standard: "Standard",
  "strengths-first": "Strengths First",
  "conduct-first": "Conduct First",
  "merged-ss": "Subject + Strengths Merged",
}

const learningAreas = [
  "General",
  "Mathematics",
  "English",
  "Kiswahili",
  "Science and Technology",
  "Social Studies",
  "Creative Arts",
  "Physical Education",
  "Religious Education",
  "Indigenous Languages",
  "Agriculture",
  "Home Science",
]

function limitWords(text: string, min: number, max: number): string {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length <= max) return text
  const truncated = words.slice(0, max).join(" ")
  const lastPeriod = truncated.lastIndexOf(".")
  if (lastPeriod > words.slice(0, min).join(" ").length) {
    return truncated.slice(0, lastPeriod + 1)
  }
  return truncated + "."
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function varyText(text: string): string {
  const rules: [RegExp, string[]][] = [
    [/\bconsistently demonstrates exceptional\b/gi,
      ["consistently demonstrates exceptional", "consistently displays outstanding", "regularly exhibits remarkable"]],
    [/\bcontinues to demonstrate\b/gi,
      ["continues to demonstrate", "continues to show", "keeps demonstrating"]],
    [/\bconsistently exceeds expectations\b/gi,
      ["consistently exceeds expectations", "regularly surpasses expectations", "consistently goes beyond expectations"]],
    [/\bis exemplary\b/gi,
      ["is exemplary", "is outstanding", "is exceptional", "is admirable"]],
    [/\bdemonstrates understanding of\b/gi,
      ["demonstrates understanding of", "shows sound grasp of", "applies knowledge of", "exhibits growing ability in"]],
    [/\bdemonstrates competence in\b/gi,
      ["demonstrates competence in", "shows proficiency in", "displays capability in", "exhibits growing competence in"]],
    [/\bdemonstrates strong\b/gi,
      ["demonstrates strong", "shows solid", "exhibits robust", "displays firm"]],
    [/\bdemonstrates satisfactory\b/gi,
      ["demonstrates satisfactory", "shows adequate", "exhibits satisfactory", "displays acceptable"]],
    [/\bdemonstrates emerging\b/gi,
      ["demonstrates emerging", "shows early", "exhibits beginning", "displays initial"]],
    [/\bdemonstrates good\b/gi,
      ["demonstrates good", "shows sound", "exhibits commendable", "displays solid"]],
    [/\bshows good\b/gi,
      ["shows good", "demonstrates solid", "exhibits commendable", "displays satisfactory"]],
    [/\bshows developing\b/gi,
      ["shows developing", "demonstrates growing", "exhibits emerging", "displays evolving"]],
    [/\bis beginning to\b/gi,
      ["is beginning to", "is starting to", "is learning to", "is taking first steps in"]],
    [/\bis working towards\b/gi,
      ["is working towards", "is making progress towards", "is striving towards", "is moving towards"]],
    [/\brequires support\b/gi,
      ["requires support", "needs guidance", "benefits from assistance", "needs additional help"]],
    [/\brequires consistent support\b/gi,
      ["requires consistent support", "needs ongoing guidance", "benefits from regular assistance", "needs steady help"]],
    [/\bis developing\b/gi,
      ["is developing", "is building", "is strengthening", "is growing in"]],
    [/\bwith teacher guidance\b/gi,
      ["with teacher guidance", "with teacher support", "with guided instruction", "when supported by the teacher"]],
    [/\bwith growing confidence\b/gi,
      ["with growing confidence", "with increasing assurance", "with developing self-belief", "with mounting certainty"]],
    [/\bis evident\b/gi,
      ["is evident", "can be seen", "is apparent", "is clearly observable"]],
    [/\bclearly evident\b/gi,
      ["clearly evident", "readily apparent", "easily observed", "unmistakably clear"]],
    [/\benthusiasm for\b/gi,
      ["enthusiasm for", "interest in", "passion for", "eagerness in"]],
    [/\bwillingness to learn\b/gi,
      ["willingness to learn", "readiness to engage", "positive attitude towards learning", "motivation to improve"]],
    [/\bconsistent effort\b/gi,
      ["consistent effort", "steady application", "regular diligence", "sustained commitment"]],
  ]
  let result = text
  for (const [pattern, options] of rules) {
    result = result.replace(pattern, () => pick(options))
  }
  return result
}

function naturalizeRhythm(text: string, seed?: number): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g)
  if (!sentences || sentences.length <= 1) return text

  const cleaned = sentences.map(s => s.trim()).filter(Boolean)

  const patterns = ["long-medium-short", "short-long-medium", "medium-medium-short", "single-strong"]
  const pattern = pick(patterns)

  const withLengths = cleaned.map(s => ({ text: s, words: s.split(/\s+/).length }))

  if (pattern === "single-strong") {
    withLengths.sort((a, b) => b.words - a.words)
    const strong = withLengths[0].text
    const explanatory = withLengths.length > 1 ? withLengths.slice(1).map(s => s.text).join(" ") : ""
    return explanatory ? `${strong} ${explanatory}` : strong
  }

  switch (pattern) {
    case "long-medium-short":
      withLengths.sort((a, b) => b.words - a.words)
      break
    case "short-long-medium":
      withLengths.sort((a, b) => {
        if (a.words <= 10 && b.words > 10) return -1
        if (a.words > 10 && b.words <= 10) return 1
        if (a.words > 20 && b.words <= 20) return -1
        if (a.words <= 20 && b.words > 20) return 1
        return 0
      })
      break
    case "medium-medium-short":
      withLengths.sort((a, b) => {
        const aIsMedium = a.words > 10 && a.words <= 20
        const bIsMedium = b.words > 10 && b.words <= 20
        if (aIsMedium && !bIsMedium) return -1
        if (!aIsMedium && bIsMedium) return 1
        return a.words - b.words
      })
      break
  }

  let result = withLengths.map(s => s.text).join(" ")

  if (Math.random() < 0.2 && result.length > 60) {
    result = result.replace(/\. (?=[A-Z])/, "; ")
  }

  if (Math.random() < 0.15) {
    result = result.replace(/\b(However|Additionally|Furthermore|Moreover)\b, /gi, (m) => {
      const word = m.replace(/[, ]/g, "")
      const connectors: Record<string, string> = {
        However: "Nonetheless",
        Additionally: "What is more",
        Furthermore: "Beyond this",
        Moreover: "In addition",
      }
      return connectors[word] ? `${connectors[word]}, ` : m
    })
  }

  return result
}

function sanitizeFinalOutput(text: string): string {
  const blocklist = [
    /^Competency:/mi,
    /^Behaviour:/mi,
    /^English$/mi,
    /^To\b/mi,
  ]
  const allowlist = [
    "Subject Performance:",
    "Conduct and Attitude:",
    "Notable Strengths:",
    "Areas for Growth:",
  ]

  const lines = text.split("\n")
  const filtered = lines.filter(line => {
    const trimmed = line.trim()
    if (!trimmed) return false
    if (allowlist.some(a => trimmed.startsWith(a))) return true
    return !blocklist.some(re => re.test(trimmed))
  })

  let result = filtered.join("\n").trim()
  result = result.replace(/\n{3,}/g, "\n\n")
  if (!result) return text
  return result
}

function limitToLastSentence(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return text

  const lastMatch = trimmed.match(/.*[.!?]/)
  if (lastMatch) {
    return lastMatch[0].trim()
  }

  const words = trimmed.split(/\s+/)
  if (words.length <= 2) return ""

  words.pop()
  return words.join(" ") + "."
}

function applyStyleProfile(text: string, profile: StyleProfile, tone: ToneMode): string {
  if (profile === "balanced") return text

  type RuleMap = Record<StyleProfile, [RegExp, string][]>

  const rules: RuleMap = {
    balanced: [],
    "strict-academic": [
      [/\boutstanding\b/gi, "notable"],
      [/\bexceptional\b/gi, "distinct"],
      [/\bexcellent\b/gi, "strong"],
      [/\bimpressive\b/gi, "noteworthy"],
      [/\bcommendable\b/gi, "acceptable"],
      [/\bremarkable\b/gi, "notable"],
      [/\bwonderful\b/gi, "acceptable"],
      [/\bpassion\b/gi, "interest"],
      [/\benthusiasm\b/gi, "engagement"],
      [/\btruly\b/gi, ""],
      [/\bvery\b/gi, ""],
      [/\bclearly\b/gi, ""],
      [/\bgenuine\b/gi, ""],
      [/\bpositive model for peers\b/gi, "acceptable standard of conduct"],
      [/\boutstanding quality\b/gi, "notable standard"],
      [/\bthe school celebrates\b/gi, "it is noted that"],
    ],
    "encouraging-mentor": [
      [/\badequate\b/gi, "commendable"],
      [/\bsatisfactory\b/gi, "encouraging"],
      [/\bacceptable\b/gi, "positive"],
      [/\bconsistent effort\b/gi, "wonderful dedication"],
      [/\bis making\b/gi, "is making wonderful"],
      [/\bshows\b/gi, "shows such"],
      [/\bdemonstrates\b/gi, "demonstrates lovely"],
      [/\bwillingness to learn\b/gi, "beautiful willingness to learn"],
      [/\bfurther development\b/gi, "continued growth"],
      [/\bwould benefit from\b/gi, "will thrive with"],
      [/\bneeds guidance\b/gi, "will flourish with gentle guidance"],
      [/\bis encouraged to\b/gi, "is warmly encouraged to"],
      [/\bis working towards\b/gi, "is making steady progress towards"],
    ],
    "headteacher-formal": [
      [/\bis\b(?=\s+(?:able|beginning|building|developing|demonstrating|showing|exhibiting|working))/gi, "is observed to be"],
      [/\bshows\b/gi, "exhibits"],
      [/\bgood\b/gi, "commendable"],
      [/\bgreat\b/gi, "significant"],
      [/\bright\b/gi, "appropriate"],
      [/\bhelp\b/gi, "assistance"],
      [/\bhelping\b/gi, "facilitating"],
      [/\bcontinues\b/gi, "continues to demonstrate"],
      [/\bcontinued\b/gi, "sustained"],
      [/\bcontinuing\b/gi, "persisting"],
      [/\breally\b/gi, ""],
      [/\bquite\b/gi, ""],
      [/\ba bit\b/gi, ""],
      [/\bjust\b/gi, ""],
      [/\blittle\b/gi, "modest"],
      [/\bongoing\b/gi, "continued"],
      [/\bwith teacher support\b/gi, "under teacher supervision"],
      [/\bwith teacher guidance\b/gi, "as directed by the teacher"],
      [/\bclassroom\b/gi, "instructional"],
      [/\bschool\b/gi, "institutional"],
    ],
    "cbc-examiner": [
      [/\bThe learner demonstrates\b/gi, "Evidence indicates that the learner demonstrates"],
      [/\bThe learner shows\b/gi, "Assessment evidence suggests the learner shows"],
      [/\bis developing\b/gi, "is progressing in developing"],
      [/\bhas met\b/gi, "has satisfactorily met"],
      [/\bconsistently exceeds\b/gi, "consistently surpasses the expected"],
      [/\bis evident\b/gi, "is evidenced by work samples"],
      [/\bclearly evident\b/gi, "substantiated by learning evidence"],
      [/\bis beginning to\b/gi, "is at the initial stage of"],
      [/\bis working towards\b/gi, "is progressing towards"],
      [/\bI am\b/gi, "it is"],
      [/\bwe celebrate\b/gi, "this is acknowledged"],
      [/\bwe look forward to\b/gi, "targeted intervention will support"],
      [/\bgreat work\b/gi, "satisfactory competency demonstration"],
    ],
  }

  const profileRules = rules[profile]
  let result = text
  for (const [pattern, replacement] of profileRules) {
    result = result.replace(pattern, replacement)
  }

  if (profile === "cbc-examiner") {
    result = result.replace(/\. /, ". Competency evidence shows that ")
  }

  if (profile === "headteacher-formal") {
    result = result.replace(/\. /, ". Furthermore, it is noted that ")
  }

  result = result.replace(/\s{2,}/g, " ").replace(/\.\./g, ".").replace(/\. \./g, ".").trim()

  return result
}

// ====== SUBJECT-AWARE COMMENT BANKS ======

interface SubjectCommentBank {
  BE: Record<ToneMode, string[]>
  ME: Record<ToneMode, string[]>
  AE: Record<ToneMode, string[]>
  EE: Record<ToneMode, string[]>
}

function buildBank(be: string[], me: string[], ae: string[], ee: string[]): SubjectCommentBank {
  const wrap = (arr: string[]) => ({
    professional: arr,
    encouraging: arr.map((s) => s.replace(/demonstrates|shows|exhibits|applies/g, (m) =>
      m === "demonstrates" ? "continues to demonstrate" : m === "shows" ? "continues to show" : m === "exhibits" ? "continues to exhibit" : "continues to apply"
    )),
    supportive: arr.map((s) => s.replace(/demonstrates|shows|exhibits|applies/g, "is developing the ability to").replace(/consistently|effectively|independently/g, "with growing confidence")),
    excellence: arr.map((s) => s.replace(/demonstrates|shows|exhibits|applies/g, "consistently demonstrates exceptional").replace(/well|good|satisfactory|developing/g, "outstanding")),
  })
  return { BE: wrap(be), ME: wrap(me), AE: wrap(ae), EE: wrap(ee) }
}

const COMMENT_BANKS: Record<string, SubjectCommentBank> = {
  Mathematics: buildBank([
    "The learner demonstrates emerging numeracy skills and can identify and count numbers with guidance. Additionally, hands-on activities and visual supports are helping to build understanding of basic mathematical concepts.",
    "The learner shows developing ability in solving simple mathematical problems and recognises basic patterns with teacher support. This is evident in their growing confidence during guided counting exercises and number recognition tasks.",
    "The learner requires targeted support to grasp mathematical concepts and would benefit from additional practice with number recognition and basic operations. There is a clear willingness to learn, and they respond positively to one-on-one guidance.",
    "The learner needs consistent support to engage with mathematical tasks and is working towards recognising numbers and simple patterns. Simplified instructions and repeated practice are helping to build foundational numeracy skills step by step.",
  ], [
    "The learner demonstrates satisfactory numeracy skills and applies mathematical concepts to solve routine problems with minimal guidance. Their work shows steady progress in understanding number operations and measurement concepts.",
    "The learner shows good understanding of mathematical concepts and applies problem-solving strategies effectively in familiar contexts. They work with accuracy and are developing greater confidence in tackling new challenges.",
    "The learner applies basic mathematical skills to solve problems and is developing competence in number operations and measurements. Consistent effort is evident, and they continue to make steady progress toward meeting expectations.",
    "The learner has met the expected competency level in Mathematics and applies concepts to solve problems accurately. Logical thinking is evident in their approach to calculations and data handling tasks.",
  ], [
    "The learner demonstrates competence in mathematical concepts and applies problem-solving strategies effectively to both routine and non-routine problems. Strong numeracy skills are evident, and they work with increasing independence on complex tasks.",
    "The learner shows strong analytical skills and applies mathematical reasoning to solve problems with accuracy and confidence. Additionally, they demonstrate good understanding of mathematical language and can explain their thinking clearly.",
    "The learner is approaching expectations with growing confidence in Mathematics. They apply mathematical skills effectively, and continued practice will further strengthen their accuracy and problem-solving speed.",
    "The learner makes good progress in Mathematics and applies learned concepts to new situations with confidence. Enthusiasm for mathematical challenges is evident, and strong problem-solving abilities continue to develop.",
  ], [
    "The learner demonstrates exceptional numeracy skills and consistently applies advanced problem-solving strategies to complex mathematical tasks with confidence and accuracy. Their deep understanding of mathematical concepts is evident in the clarity with which they explain their reasoning.",
    "The learner consistently exceeds expectations in Mathematics, demonstrating outstanding analytical thinking and creative application of concepts to solve complex problems independently. Their work is consistently accurate, well-reasoned, and reflects strong mastery.",
    "The learner shows exceptional ability in Mathematics and demonstrates mastery of concepts beyond the expected level. They use mathematical language fluently and apply knowledge to real-world situations with creativity and insight.",
    "The learner excels in Mathematics, consistently producing work of outstanding quality. Advanced problem-solving skills are evident, and they show initiative in exploring mathematical concepts beyond the curriculum requirements.",
  ]),

  English: buildBank([
    "The learner demonstrates emerging reading and writing skills and is beginning to recognise letters and simple words. Guided practice is helping to develop phonemic awareness and build vocabulary, and continued reading support at home will be beneficial.",
    "The learner shows developing ability in oral communication and can express basic ideas with teacher support. Simple sentence construction is emerging, and regular reading practice continues to strengthen comprehension skills.",
    "The learner requires support to develop foundational literacy skills including letter recognition, phonics, and basic reading comprehension. Visual aids and one-on-one reading activities are proving effective in building confidence.",
    "The learner needs consistent support to develop early literacy skills and is working towards recognising letters and sounds. Multi-sensory approaches to language learning are helping to build foundational skills gradually.",
  ], [
    "The learner demonstrates satisfactory reading and writing skills and reads simple texts with understanding. They communicate ideas clearly in both oral and written work, and competence in grammar and vocabulary continues to develop.",
    "The learner shows good progress in English and comprehends age-appropriate texts with understanding. They write clearly in an organised manner, and growing confidence in language use is evident in their classroom contributions.",
    "The learner is developing competence in reading, writing, and oral communication. Meaningful sentence construction is evident, and vocabulary continues to build steadily through regular reading practice.",
    "The learner has met the expected competency level in English, reading fluently with comprehension and writing well-structured texts. Appropriate vocabulary and correct grammatical structures are used consistently in their work.",
  ], [
    "The learner demonstrates strong literacy skills and reads with fluency and comprehension across a range of texts. They write clearly and creatively, using varied vocabulary and correct grammatical structures, and show confidence in oral presentations.",
    "The learner shows excellent communication skills and expresses ideas articulately in both written and oral forms. Wide reading is evident, and they demonstrate critical thinking in responding to texts with depth and insight.",
    "The learner is approaching expectations with confidence in English, communicating effectively with good reading comprehension and writing skills. Continued exposure to diverse texts will further enrich their vocabulary and expression.",
    "The learner shows commendable progress in English, analysing texts and expressing ideas with clarity and creativity. A strong command of language conventions continues to develop across both written and oral work.",
  ], [
    "The learner demonstrates exceptional literacy skills and reads widely with deep comprehension and critical analysis. They produce well-crafted written work that shows creativity, sophistication, and mastery of language conventions across different genres.",
    "The learner consistently exceeds expectations in English, demonstrating outstanding reading comprehension and advanced vocabulary usage. They write with fluency, creativity, and precision, producing work of exceptional quality across different genres.",
    "The learner shows exceptional ability in English and demonstrates mastery of language skills beyond the expected level. Critical engagement with complex texts is evident, and they produce written work of outstanding quality and originality.",
    "The learner excels in English, consistently producing work of outstanding quality. Advanced literacy skills are evident, and they show initiative in exploring literature and language concepts beyond the curriculum.",
  ]),

  Kiswahili: buildBank([
    "The learner demonstrates emerging awareness of Kiswahili sounds and words and is beginning to recognise simple vocabulary. Guided practice through songs and conversational activities is helping to develop listening and speaking skills.",
    "The learner shows developing ability to understand and use basic Kiswahili greetings and common expressions. Oral repetition and visual aids continue to strengthen foundational language skills and build confidence.",
    "The learner requires support to develop foundational Kiswahili language skills including basic vocabulary and pronunciation. Storytelling and interactive language games are proving effective in building engagement and understanding.",
    "The learner needs consistent exposure to Kiswahili to develop basic listening and speaking skills. Songs, rhymes, and repeated practice in a supportive environment are helping to build foundational language awareness.",
  ], [
    "The learner demonstrates satisfactory ability to communicate in Kiswahili using everyday expressions and simple sentences. Basic oral instructions are understood, and they participate in simple conversations with growing confidence.",
    "The learner shows good progress in Kiswahili and uses appropriate vocabulary in familiar contexts. Understanding of cultural stories and traditions conveyed through the language is also developing well.",
    "The learner is developing competence in Kiswahili, constructing simple sentences and responding to basic questions with growing confidence. Everyday communication in the language continues to improve steadily.",
    "The learner has met the expected competency level in Kiswahili and communicates effectively within familiar contexts. Appreciation for the cultural heritage embedded in the language is evident in their engagement.",
  ], [
    "The learner demonstrates strong communication skills in Kiswahili and engages in conversations with growing fluency and confidence. Cultural stories and proverbs are understood and retold with appreciation for oral traditions.",
    "The learner shows excellent proficiency in Kiswahili, using varied vocabulary and grammatical structures accurately. Understanding of cultural values and traditions expressed through the language is also well developed.",
    "The learner is approaching expectations with confidence in Kiswahili, communicating effectively with growing fluency. Continued immersion in the language will further strengthen proficiency and cultural connection.",
    "The learner shows commendable progress in Kiswahili and uses the language creatively in speaking and writing. Pride in preserving and promoting the language and culture is clearly evident in their work.",
  ], [
    "The learner demonstrates exceptional fluency in Kiswahili and communicates with sophistication and cultural appropriateness. Oral traditions are analysed critically, and outstanding commitment to language development is clearly evident.",
    "The learner consistently exceeds expectations in Kiswahili, demonstrating outstanding proficiency and cultural sensitivity. They use the language with fluency and accuracy, showing leadership in promoting language use within the school community.",
    "The learner shows exceptional ability in Kiswahili beyond the expected level, demonstrating mastery of the language. Deep engagement with oral literature, traditions, and cultural expressions is consistently evident in their work.",
    "The learner excels in Kiswahili, consistently demonstrating outstanding communication skills. Advanced understanding of the language's cultural significance is evident, and they actively promote its use in the community.",
  ]),

  "Science and Technology": buildBank([
    "The learner demonstrates emerging awareness of the environment and basic scientific concepts, identifying common objects and living things with teacher guidance. Hands-on activities are helping to build understanding of simple scientific ideas and processes.",
    "The learner shows developing curiosity about the natural world and is beginning to ask questions about everyday phenomena. Practical activities and visual demonstrations continue to strengthen foundational scientific concepts and observation skills.",
    "The learner requires support to develop basic scientific inquiry skills and is beginning to observe and describe simple patterns in nature. Guided exploration and concrete learning experiences are proving effective in building engagement.",
    "The learner needs consistent support to engage with scientific concepts and is working towards identifying basic features of the environment. Structured hands-on activities are helping to develop foundational awareness of the natural world.",
  ], [
    "The learner demonstrates satisfactory understanding of scientific concepts and carries out simple investigations with teacher guidance. Curiosity about the environment is evident, and basic observations are recorded with increasing accuracy.",
    "The learner shows good understanding of scientific ideas and applies the scientific method to carry out investigations. Skills in observation, recording, and drawing simple conclusions from experiments continue to develop well.",
    "The learner is developing competence in scientific inquiry and participates in simple experiments with growing confidence. Interest in discovering how things work is evident, and foundational scientific vocabulary continues to expand.",
    "The learner has met the expected competency level in Science and Technology, demonstrating good observational skills and the ability to carry out investigations. Findings are recorded and communicated with clarity.",
  ], [
    "The learner demonstrates strong scientific inquiry skills and carries out investigations systematically, analysing information critically to draw well-reasoned conclusions. Enthusiasm for exploring scientific concepts and applying them to real-life situations is clearly evident.",
    "The learner shows excellent understanding of scientific concepts and applies investigative skills effectively. Critical thinking is evident in analysing results, and findings are communicated with clarity and growing confidence.",
    "The learner is approaching expectations with growing confidence in Science and Technology, participating actively in investigations. Ability to analyse and interpret data accurately continues to develop steadily.",
    "The learner shows commendable progress in Science and Technology, applying scientific knowledge to solve practical problems. Initiative in exploring scientific ideas independently is clearly evident in their work.",
  ], [
    "The learner demonstrates exceptional scientific inquiry skills and consistently applies advanced investigative techniques to analyse complex data critically. Insights are drawn with precision, and findings are communicated with outstanding clarity and enthusiasm for scientific exploration.",
    "The learner consistently exceeds expectations in Science and Technology, demonstrating outstanding analytical skills and creative application of scientific knowledge. Work reflects depth of understanding and independent thinking of a high order.",
    "The learner shows exceptional ability in Science and Technology beyond the expected level, engaging in independent research with initiative. Mastery of scientific concepts is evident in their exploration of advanced ideas.",
    "The learner excels in Science and Technology, consistently producing work of outstanding quality. Advanced investigative skills and a genuine passion for scientific discovery beyond the curriculum are clearly evident.",
  ]),

  "Social Studies": buildBank([
    "The learner demonstrates emerging awareness of self, family, and immediate environment, identifying basic social roles and community helpers with guidance. Understanding of citizenship concepts continues to develop through structured learning activities.",
    "The learner shows developing awareness of the community and its structures, identifying familiar places and people in the locality. Basic social responsibilities are beginning to be understood with growing interest.",
    "The learner requires support to develop understanding of social concepts and community roles. Visual materials and stories are helping to build awareness of the environment and social relationships.",
    "The learner needs consistent support to engage with social studies concepts and is working towards identifying basic features of the home and school environment. Concrete learning experiences continue to build foundational understanding.",
  ], [
    "The learner demonstrates satisfactory understanding of social concepts and identifies key features of the community, including roles, resources, and cultural practices. Awareness of citizenship responsibilities and respect for diversity are developing well.",
    "The learner shows good understanding of social studies concepts and describes relationships within the family, school, and community. Awareness of cultural diversity and respect for different backgrounds are clearly evident.",
    "The learner is developing competence in social studies, identifying basic social structures and community resources. Growing awareness of citizenship values and environmental responsibility continues to develop steadily.",
    "The learner has met the expected competency level in Social Studies, demonstrating good understanding of social concepts. Respect for cultural diversity and community values is consistently evident in their participation.",
  ], [
    "The learner demonstrates strong understanding of social concepts and analyses relationships within society critically. Deep awareness of citizenship, governance, and environmental issues is evident, and they discuss these topics with confidence.",
    "The learner shows excellent awareness of social and environmental issues, analysing their impact on the community with understanding. Strong citizenship values are demonstrated through active participation in discussions on social topics.",
    "The learner is approaching expectations with confidence in Social Studies, demonstrating good understanding of social structures. Growing awareness of national values and responsible citizenship continues to develop well.",
    "The learner shows commendable progress in Social Studies, connecting classroom learning with real-world social issues. Initiative in exploring topics related to community development is clearly evident.",
  ], [
    "The learner demonstrates exceptional understanding of social concepts and analyses complex societal issues with depth and insight. Outstanding awareness of governance, citizenship, and global perspectives is evident, and ideas are articulated persuasively.",
    "The learner consistently exceeds expectations in Social Studies, demonstrating outstanding awareness of social, cultural, and environmental issues. Critical thinking is applied to evaluate diverse perspectives on community matters with sophistication.",
    "The learner shows exceptional ability in Social Studies beyond the expected level, engaging with complex social issues. Initiative in promoting positive community values and demonstrating leadership is clearly evident.",
    "The learner excels in Social Studies, consistently producing work of outstanding quality. Advanced understanding of citizenship and leadership in promoting social responsibility and cultural awareness are clearly evident.",
  ]),

  "Creative Arts": buildBank([
    "The learner demonstrates emerging creativity and is beginning to explore basic art elements such as colour, line, and shape. Encouragement to express ideas through drawing, modelling, and simple craft activities continues to build confidence.",
    "The learner shows developing interest in creative activities and is beginning to participate in songs, movement, and dramatic play. Structured opportunities to explore different art forms with teacher guidance are helping to build skills.",
    "The learner requires support to engage with creative arts activities and would benefit from exposure to varied art materials and techniques. Step-by-step instructions are helping them participate with growing willingness.",
    "The learner needs consistent encouragement to participate in creative arts and is beginning to explore basic art materials. A supportive environment that values individual expression is helping to build foundational creative confidence.",
  ], [
    "The learner demonstrates satisfactory creative expression and creates simple artworks using basic elements of art. Participation in music and movement activities is growing in confidence, and appreciation for creative works is developing well.",
    "The learner shows good creativity and imagination in producing artworks and participating in dramatic activities. Experimentation with different materials and techniques is evident, and artistic skills continue to develop steadily.",
    "The learner is developing competence in creative arts, expressing ideas through various art forms with growing confidence. Interest in exploring different artistic techniques and materials is clearly evident.",
    "The learner has met the expected competency level in Creative Arts, creating original artworks and participating actively in music, dance, and drama activities. Enthusiasm and confidence are consistently demonstrated.",
  ], [
    "The learner demonstrates strong creative ability and produces imaginative artworks with attention to detail and thoughtful use of art elements. Confidence in creative performances is evident, and appreciation for diverse art forms continues to grow.",
    "The learner shows excellent artistic skills and creativity across multiple art forms, experimenting with techniques confidently. Work produced reflects personal expression and growing technical proficiency of a good standard.",
    "The learner is approaching expectations with confidence in Creative Arts, demonstrating good artistic skills and enthusiastic participation. Continued exploration of different media will further enrich their artistic expression.",
    "The learner shows commendable progress in Creative Arts, expressing ideas through art, music, and movement with creativity and confidence. Initiative in exploring new artistic techniques is clearly evident in their work.",
  ], [
    "The learner demonstrates exceptional creativity and artistic talent across multiple art forms, producing sophisticated original work that shows mastery of techniques. Deep artistic sensitivity and outstanding confidence in performances are consistently evident.",
    "The learner consistently exceeds expectations in Creative Arts, demonstrating outstanding artistic ability and producing work of exceptional quality and originality. Advanced understanding of art elements and creative processes is clearly evident.",
    "The learner shows exceptional artistic ability beyond the expected level, engaging with complex creative processes independently. Work produced demonstrates originality, technical skill, and deep artistic understanding of a high order.",
    "The learner excels in Creative Arts, consistently producing outstanding creative work with advanced artistic skills. Initiative in exploring creative expression beyond the curriculum is driven by genuine passion and dedication.",
  ]),

  "Physical Education": buildBank([
    "The learner demonstrates emerging gross motor skills and participates in basic physical activities with guidance. Support to develop coordination, balance, and spatial awareness during games and exercises continues to show progress.",
    "The learner shows developing physical coordination and follows simple movement instructions with growing confidence. Structured play activities are helping to build fundamental motor skills and body awareness.",
    "The learner requires support to engage fully in physical activities and would benefit from additional practice to develop basic movement skills. Adapted activities are helping them participate with growing willingness.",
    "The learner needs consistent encouragement to participate in physical education activities and is working towards developing basic motor skills. A supportive and non-competitive environment is helping to build confidence gradually.",
  ], [
    "The learner demonstrates satisfactory physical skills and participates in games and activities with growing confidence. Developing coordination is evident, and they follow basic rules and safety guidelines during physical education sessions.",
    "The learner shows good participation in physical activities, demonstrating developing motor skills in games, athletics, and movement routines. They work well with others during team activities and show good sportsmanship.",
    "The learner is developing competence in physical education, performing basic movement skills with control. Active participation and understanding of safety rules and the importance of physical fitness are evident.",
    "The learner has met the expected competency level in Physical Education, demonstrating good coordination and confident participation in a range of activities. Understanding of teamwork and fair play is consistently demonstrated.",
  ], [
    "The learner demonstrates strong physical skills and performs movement sequences with control, balance, and coordination. Tactical awareness in games and excellent sportsmanship during competitive activities are clearly evident.",
    "The learner shows excellent physical ability and participates skillfully in a range of sports and activities. Leadership in team settings and understanding of the principles of healthy living through activity are evident.",
    "The learner is approaching expectations with confidence in Physical Education, demonstrating good motor skills and active participation. Continued practice will further refine technique and build endurance over time.",
    "The learner shows commendable progress in Physical Education, applying movement skills effectively in various physical activities. Initiative in leading warm-ups and encouraging peers is clearly evident.",
  ], [
    "The learner demonstrates exceptional physical skills and performs complex movement sequences with precision, control, and agility. Outstanding sportsmanship, leadership, and tactical awareness in both competitive and cooperative activities are consistently demonstrated.",
    "The learner consistently exceeds expectations in Physical Education, demonstrating outstanding athletic ability and applying advanced movement skills with confidence. Exceptional leadership and teamwork are evident in all physical activities.",
    "The learner shows exceptional physical ability beyond the expected level, demonstrating mastery of movement skills and initiative in designing and leading activities for peers. Enthusiasm and skill are consistently displayed.",
    "The learner excels in Physical Education, consistently demonstrating outstanding performance in sports and activities. Advanced motor skills and a deep understanding of fitness, health, and active living are clearly evident.",
  ]),

  "Religious Education": buildBank([
    "The learner demonstrates emerging awareness of religious concepts and is beginning to recognise basic stories and symbols from the Bible. Guidance to understand moral lessons and their application to daily life continues to build foundational understanding.",
    "The learner shows developing interest in religious stories and retells simple Bible narratives with teacher support. Connection of moral values to everyday situations is beginning, and willingness to learn is evident.",
    "The learner requires support to understand religious concepts and moral teachings. Visual aids and simple storytelling are helping to build foundational understanding of faith and values.",
    "The learner needs consistent support to engage with religious education content and is working towards recognising basic religious symbols and stories. A patient and nurturing approach is helping to build engagement gradually.",
  ], [
    "The learner demonstrates satisfactory understanding of religious concepts and retells key Bible stories with understanding. Awareness of moral values such as honesty, kindness, and respect is evident, and these are applied in familiar situations.",
    "The learner shows good understanding of religious teachings and discusses moral lessons from Bible stories with growing insight. Respect for diverse beliefs and ability to reflect on personal values are developing well.",
    "The learner is developing competence in religious education, identifying key teachings from the Bible and relating them to daily life. Growing awareness of the importance of faith and moral living continues to develop.",
    "The learner has met the expected competency level in Religious Education, demonstrating good understanding of biblical teachings. Moral values are applied consistently in interactions with peers and adults.",
  ], [
    "The learner demonstrates strong understanding of religious concepts and analyses biblical teachings critically, relating them to contemporary issues. Deep respect for diverse religious perspectives and mature moral reasoning are clearly evident.",
    "The learner shows excellent understanding of religious education content and engages thoughtfully with questions of faith, values, and ethics. Empathy and respect for others' beliefs are demonstrated while articulating personal views clearly.",
    "The learner is approaching expectations with confidence in Religious Education, demonstrating good understanding of biblical teachings and consistent application of moral values. Growing ability to reflect on faith and ethics is evident.",
    "The learner shows commendable progress in Religious Education, connecting biblical teachings with real-world moral and ethical issues. Initiative in exploring questions of faith and values is clearly evident.",
  ], [
    "The learner demonstrates exceptional understanding of religious concepts and engages with theological ideas with depth and insight. Well-reasoned perspectives on faith, ethics, and morality are articulated, and outstanding respect for diverse beliefs is demonstrated.",
    "The learner consistently exceeds expectations in Religious Education, demonstrating outstanding understanding of biblical teachings and sophisticated ethical reasoning. Leadership in promoting moral values within the school community is clearly evident.",
    "The learner shows exceptional ability in Religious Education beyond the expected level, engaging critically with religious texts and theological concepts. Initiative in exploring faith traditions with depth is clearly demonstrated.",
    "The learner excels in Religious Education, consistently producing work of outstanding quality. Advanced understanding of religious concepts and leadership in fostering respect, empathy, and moral responsibility are clearly evident.",
  ]),

  Agriculture: buildBank([
    "The learner demonstrates emerging awareness of plants, animals, and the environment, identifying common crops and domestic animals with teacher guidance. Hands-on activities are helping to build understanding of basic agricultural concepts and practices.",
    "The learner shows developing interest in growing plants and caring for animals, naming common farming tools and beginning to understand where food comes from. Practical gardening activities continue to strengthen this growing awareness.",
    "The learner requires support to develop basic agricultural concepts including plant growth and animal care. Practical gardening activities and visual learning materials are proving effective in building engagement.",
    "The learner needs consistent support to engage with agricultural concepts and is working towards identifying common plants and animals in the locality. Concrete learning experiences are helping to build foundational understanding gradually.",
  ], [
    "The learner demonstrates satisfactory understanding of agricultural concepts, identifying common crops, farming tools, and basic farming practices. Participation in simple gardening activities is evident, and care for plants and animals is developing well.",
    "The learner shows good understanding of agricultural practices, describing basic processes of plant growth and animal care. Responsibility in caring for school garden projects and interest in food production are clearly evident.",
    "The learner is developing competence in agriculture, applying basic farming skills such as planting, watering, and weeding with growing confidence. Awareness of the importance of agriculture in daily life continues to develop.",
    "The learner has met the expected competency level in Agriculture, demonstrating good practical skills in gardening and understanding of sustainable farming practices. Environmental stewardship is clearly evident in their work.",
  ], [
    "The learner demonstrates strong agricultural knowledge and applies farming techniques effectively in practical activities. Understanding of sustainable agriculture, soil conservation, and the economic value of farming in the community is clearly evident.",
    "The learner shows excellent practical skills in agriculture, demonstrating understanding of crop production, animal husbandry, and environmental conservation. Initiative in maintaining school farm projects is consistently demonstrated.",
    "The learner is approaching expectations with confidence in Agriculture, demonstrating good practical skills and growing understanding of modern farming techniques. Interest in agricultural entrepreneurship continues to develop.",
    "The learner shows commendable progress in Agriculture, applying agricultural knowledge to solve practical farming problems. Initiative in exploring innovative farming methods is clearly evident in their work.",
  ], [
    "The learner demonstrates exceptional agricultural knowledge and applies advanced farming techniques with independence and skill. Outstanding understanding of sustainable agriculture, agribusiness, and environmental conservation is clearly evident in their work.",
    "The learner consistently exceeds expectations in Agriculture, demonstrating outstanding practical farming skills and innovative techniques. Leadership in school farming projects and community agricultural initiatives is clearly demonstrated.",
    "The learner shows exceptional ability in Agriculture beyond the expected level, demonstrating mastery of agricultural concepts. Initiative in exploring advanced topics such as agribusiness and food security is clearly evident.",
    "The learner excels in Agriculture, consistently producing work of outstanding quality with advanced farming skills. A genuine passion for agricultural innovation and environmental sustainability drives their continued success.",
  ]),

  "Home Science": buildBank([
    "The learner demonstrates emerging awareness of personal hygiene, nutrition, and basic home care, identifying healthy foods and simple safety rules with teacher guidance. Practical demonstrations are helping to build foundational life skills and understanding.",
    "The learner shows developing interest in home science activities, performing simple tasks such as hand washing and basic food recognition. Guided practice and visual demonstrations continue to strengthen everyday living skills.",
    "The learner requires support to develop understanding of personal care, nutrition, and home safety. Hands-on activities that make learning relevant to everyday life are proving effective in building engagement.",
    "The learner needs consistent support to engage with home science concepts and is working towards identifying basic hygiene practices and safe behaviours. A nurturing approach is helping to build foundational skills gradually.",
  ], [
    "The learner demonstrates satisfactory understanding of home science concepts, identifying nutritious foods and practising basic hygiene routines independently. Developing life skills in personal care and home management continue to improve steadily.",
    "The learner shows good understanding of nutrition, hygiene, and home safety, preparing simple healthy meals with supervision. Responsibility in caring for personal belongings and living spaces is clearly evident.",
    "The learner is developing competence in home science, applying basic life skills such as food selection, hygiene practices, and simple sewing with growing confidence. Independence in daily living tasks continues to develop.",
    "The learner has met the expected competency level in Home Science, demonstrating good understanding of nutrition, personal hygiene, and home management. These skills are applied consistently in daily life with growing confidence.",
  ], [
    "The learner demonstrates strong understanding of home science concepts and applies life skills effectively in practical situations, preparing nutritious meals independently. Thorough understanding of hygiene, safety, and family living is clearly evident.",
    "The learner shows excellent practical skills in home science and demonstrates creativity in meal planning and preparation. Household tasks are managed responsibly, and understanding of budgeting and resource management is developing well.",
    "The learner is approaching expectations with confidence in Home Science, demonstrating good life skills and growing competence in meal preparation and home care. Personal management skills continue to improve steadily.",
    "The learner shows commendable progress in Home Science, applying home management skills creatively and taking initiative in exploring topics related to nutrition, family health, and sustainable living.",
  ], [
    "The learner demonstrates exceptional understanding of home science concepts and applies advanced life skills with independence and creativity, showing outstanding ability in meal planning and nutrition analysis. Home management skills are of a very high standard.",
    "The learner consistently exceeds expectations in Home Science, demonstrating outstanding practical skills in food preparation, home care, and family management. Leadership in promoting healthy living practices within the school is clearly evident.",
    "The learner shows exceptional ability in Home Science beyond the expected level, demonstrating mastery of life skills and initiative in exploring advanced topics. Interest in community nutrition and family resource management is clearly evident.",
    "The learner excels in Home Science, consistently producing work of outstanding quality with advanced home management skills. A genuine passion for promoting health, nutrition, and sustainable family living drives their continued success.",
  ]),

  "Indigenous Languages": buildBank([
    "The learner demonstrates emerging awareness of the indigenous language and is beginning to recognise basic words and phrases, developing listening and speaking skills through guided practice. Oral traditions, stories, and songs are helping to build vocabulary and cultural understanding.",
    "The learner shows developing ability to understand and use simple greetings and common expressions in the indigenous language. Storytelling and cultural activities are making language learning meaningful and engaging.",
    "The learner requires support to develop foundational skills in the indigenous language and responds well to storytelling and cultural activities. These approaches continue to make language learning meaningful and engaging.",
    "The learner needs consistent exposure to the indigenous language to develop basic listening and speaking skills. Songs, rhymes, and repeated practice in a supportive environment are helping to build foundational language awareness.",
  ], [
    "The learner demonstrates satisfactory ability to communicate in the indigenous language using everyday expressions and simple sentences, understanding basic oral instructions with teacher support. Participation in simple conversations is growing in confidence.",
    "The learner shows good progress in learning the indigenous language, using appropriate vocabulary in familiar contexts. Understanding of cultural stories and traditions conveyed through the language continues to develop well.",
    "The learner is developing competence in the indigenous language, constructing simple sentences and responding to basic questions with growing confidence. Everyday communication in the language continues to improve steadily.",
    "The learner has met the expected competency level in Indigenous Languages, communicating effectively within familiar contexts. Appreciation for the cultural heritage embedded in the language is clearly evident.",
  ], [
    "The learner demonstrates strong communication skills in the indigenous language, engaging in conversations with fluency and confidence. Cultural stories and proverbs are understood and retold with deep appreciation of oral traditions.",
    "The learner shows excellent proficiency in the indigenous language, using varied vocabulary and grammatical structures accurately. Understanding of cultural values and traditions expressed through the language is also well developed.",
    "The learner is approaching expectations with confidence in Indigenous Languages, communicating effectively with growing fluency. Continued immersion in the language will further strengthen proficiency and cultural connection.",
    "The learner shows commendable progress in Indigenous Languages, using the language creatively in speaking and writing. Pride in preserving and promoting the language and culture is clearly evident in their work.",
  ], [
    "The learner demonstrates exceptional fluency in the indigenous language and communicates with sophistication and cultural appropriateness, analysing oral traditions critically. Outstanding commitment to language preservation is clearly evident in their engagement.",
    "The learner consistently exceeds expectations in Indigenous Languages, demonstrating outstanding proficiency and cultural sensitivity. They use the language with fluency and accuracy, showing leadership in promoting language revitalisation.",
    "The learner shows exceptional ability in Indigenous Languages beyond the expected level, demonstrating mastery of the language. Deep engagement with oral literature, traditions, and cultural expressions is consistently evident.",
    "The learner excels in Indigenous Languages, consistently demonstrating outstanding communication skills. Advanced understanding of the language's cultural significance is evident, and they actively promote its use in the community.",
  ]),
}

function buildGeneralComment(level: CBCLevel, tone: ToneMode, parentFriendly: boolean): string {
  const banks: Record<string, Record<ToneMode, string[]>> = {
    BE: {
      professional: [
        "The learner demonstrates emerging foundational skills across learning areas and is beginning to engage with basic concepts with teacher support. Continued guidance and targeted practice will help build confidence and competence in meeting expected learning outcomes.",
        "The learner shows developing awareness of core competencies and benefits from structured support to access learning content. Gradual progress toward meeting expectations continues with consistent encouragement and differentiated instruction.",
      ],
      encouraging: [
        "The learner continues to demonstrate emerging skills and shows willingness to participate in learning activities. With continued support and encouragement, confidence is building step by step, and every effort made represents a step forward.",
        "The learner is developing foundational skills at their own pace and responds positively to encouragement and support. The school celebrates each small victory and looks forward to continued growth throughout the term.",
      ],
      supportive: [
        "The learner is developing foundational abilities with growing confidence and benefits from a supportive learning environment. Gradual progress toward meeting learning goals continues with consistent guidance and differentiated instruction.",
        "The learner is building early foundational skills and requires a supportive learning environment to thrive. Structured routines and positive reinforcement are helping them engage more confidently with learning tasks.",
      ],
      excellence: [
        "The learner is building emerging skills with determination and shows potential for growth across learning areas. Foundational competencies are developing at a steady pace with continued guidance and encouragement.",
        "The learner demonstrates a willingness to learn and is developing foundational skills with teacher support. Continued effort and practice will help build the confidence needed to achieve expected learning outcomes.",
      ],
    },
    ME: {
      professional: [
        "The learner demonstrates satisfactory achievement of expected learning outcomes across core learning areas. Competencies are being developed effectively, and consistent effort and positive engagement in the learning process are clearly evident.",
        "The learner has met the expected competency levels and demonstrates solid understanding of core concepts. Active participation in learning activities is evident, and acquired skills are applied in familiar contexts with confidence.",
      ],
      encouraging: [
        "The learner continues to demonstrate good progress and shows consistent effort in all learning areas. Positive engagement with learning tasks is evident, and confidence and competence continue to build steadily.",
        "The learner shows steady progress and good understanding of core concepts. With continued effort and a positive attitude, they are well on the way to achieving even more.",
      ],
      supportive: [
        "The learner demonstrates satisfactory progress and is developing competencies at an appropriate pace. With continued support and encouragement, they will continue to build on these foundations and achieve learning goals.",
        "The learner is meeting expected learning outcomes and shows consistent engagement with learning tasks. Continued practice and reinforcement will help strengthen understanding and build further confidence.",
      ],
      excellence: [
        "The learner demonstrates solid achievement of expected outcomes and applies learning with good understanding. Further growth is possible, and additional challenges will help extend their learning further.",
        "The learner has met expectations with consistent quality of work, demonstrating good foundational skills. Readiness to engage with more advanced concepts will help stretch their abilities further.",
      ],
    },
    AE: {
      professional: [
        "The learner demonstrates competence across learning areas and applies skills and knowledge with increasing independence. Learning tasks are approached with confidence, and initiative in extending understanding is clearly evident.",
        "The learner is approaching expectations with confidence, demonstrating strong foundational skills across learning areas. Critical thinking is applied effectively, and challenging tasks are tackled independently with growing success.",
      ],
      encouraging: [
        "The learner demonstrates growing confidence and competence across learning areas, approaching tasks with enthusiasm and initiative. With continued effort, they are well positioned to exceed expectations.",
        "The learner continues to make impressive progress and demonstrates strong understanding of core concepts. A positive attitude and determination are commendable and will support continued growth.",
      ],
      supportive: [
        "The learner demonstrates growing independence and competence across learning areas, engaging confidently with challenging tasks. Willingness to apply learning in new contexts with minimal guidance continues to develop.",
        "The learner is approaching expectations with confidence and shows good problem-solving skills. Continued encouragement and opportunities for independent work will strengthen competence further.",
      ],
      excellence: [
        "The learner demonstrates competence beyond basic expectations and applies learning with growing sophistication. Potential for excellence is evident, and enrichment opportunities will help extend learning further.",
        "The learner is approaching expectations with confidence and demonstrates strong analytical skills. Readiness to engage with more complex tasks and benefit from additional challenges is clearly evident.",
      ],
    },
    EE: {
      professional: [
        "The learner consistently exceeds expected learning outcomes across all core areas, demonstrating exceptional understanding and application of competencies. Independent work, initiative, and outstanding quality are consistently evident in all they produce.",
        "The learner demonstrates exemplary performance across learning areas and consistently produces work of outstanding quality. Initiative in extending learning beyond the curriculum and leadership in collaborative tasks are clearly evident.",
      ],
      encouraging: [
        "The learner consistently exceeds expectations and demonstrates exceptional understanding across all learning areas, showing remarkable initiative and creativity in approaching tasks. These outstanding achievements are truly commendable.",
        "The learner continues to excel and demonstrates mastery of competencies beyond the expected level. Passion for learning is evident, and work of exceptional quality is produced consistently.",
      ],
      supportive: [
        "The learner demonstrates exceptional ability across learning areas and consistently produces work of outstanding quality. Independence, critical thinking, and creativity in approaching complex tasks are clearly evident.",
        "The learner is performing exceptionally well and demonstrates mastery of competencies across learning areas. Initiative in extending learning is evident, and enrichment opportunities will help them continue thriving.",
      ],
      excellence: [
        "The learner demonstrates exemplary performance and consistently exceeds expectations across all learning areas. Outstanding analytical skills, creativity, and leadership in academic pursuits are clearly evident in their work.",
        "The learner excels in all learning areas and consistently produces work of outstanding quality. Mastery of competencies and initiative in exploring concepts beyond the curriculum are demonstrated with depth and insight.",
      ],
    },
  }
  const options = banks[level][tone]
  const comment = options[Math.floor(Math.random() * options.length)]
  return parentFriendly ? simplifyComment(comment) : comment
}

function simplifyComment(comment: string): string {
  let result = comment
  result = result.replace(/demonstrates exceptional/g, "is doing very well in")
  result = result.replace(/demonstrates outstanding/g, "is doing very well in")
  result = result.replace(/demonstrates satisfactory/g, "is making good progress in")
  result = result.replace(/demonstrates emerging/g, "is beginning to develop")
  result = result.replace(/demonstrates strong/g, "shows good")
  result = result.replace(/demonstrates competence/g, "is doing well in")
  result = result.replace(/consistently exceeds/g, "always does well in")
  result = result.replace(/consistently demonstrates/g, "always shows")
  result = result.replace(/consistently/g, "regularly")
  result = result.replace(/competencies/g, "skills")
  result = result.replace(/learning outcomes/g, "learning goals")
  result = result.replace(/differentiated instruction/g, "extra support")
  result = result.replace(/foundational skills/g, "basic skills")
  result = result.replace(/consistent effort/g, "trying hard")
  result = result.replace(/requires support/g, "needs some extra help")
  result = result.replace(/demonstrates/g, "shows")
  return result
}

function getSubjectComment(subject: string, level: CBCLevel, tone: ToneMode, parentFriendly: boolean, lengthMode: LengthMode): string {
  const bank = COMMENT_BANKS[subject]
  if (!bank) return buildGeneralComment(level, tone, parentFriendly)
  const levelBank = bank[level]
  if (!levelBank) return buildGeneralComment(level, tone, parentFriendly)
  const toneArr = levelBank[tone]
  if (!toneArr || toneArr.length === 0) return buildGeneralComment(level, tone, parentFriendly)
  const comment = toneArr[Math.floor(Math.random() * toneArr.length)]
  const applied = parentFriendly ? simplifyComment(comment) : comment
  const varied = varyText(applied)
  const { min, max } = lengthLimits[lengthMode]
  return limitWords(varied, min, max)
}

function getBehaviourComment(behaviour: CBCLevel): string {
  const variants: Record<CBCLevel, string[]> = {
    EE: [
      "The learner demonstrates exemplary behaviour and consistently shows respect, responsibility, and self-discipline. Their conduct serves as a positive model for peers across all school settings.",
      "The learner maintains outstanding conduct, consistently showing respect for school rules and self-discipline. Their behaviour is a positive example for others to follow.",
      "The learner shows exceptional behaviour and takes full responsibility for their actions. Maturity and self-control are demonstrated consistently in all school settings.",
    ],
    AE: [
      "The learner demonstrates good behaviour and shows respect for school rules and authority. Conduct is generally positive, with occasional reminders needed to maintain consistent self-regulation.",
      "The learner maintains positive conduct and shows respect for school expectations. They respond well to guidance and continue to develop greater self-discipline over time.",
      "The learner behaves responsibly in most situations and respects school authority. With continued support, they are developing stronger self-regulation skills.",
    ],
    ME: [
      "The learner demonstrates acceptable behaviour and follows school rules with teacher guidance. Continued support will help develop greater self-regulation and responsibility over time.",
      "The learner shows satisfactory conduct and responds to teacher direction in following school expectations. Ongoing guidance is helping to build better self-management skills.",
      "The learner generally follows classroom and school rules with appropriate support. Further development in self-regulation and personal responsibility is encouraged.",
    ],
    BE: [
      "The learner requires consistent guidance to develop appropriate behaviour and self-regulation. They are working towards following classroom expectations and respecting others in the school environment.",
      "The learner needs regular support to develop positive behaviour patterns and self-control. With consistent guidance, progress towards expected conduct standards continues gradually.",
      "The learner benefits from structured routines and clear expectations to manage their behaviour. Continued support will help them develop greater responsibility and respect for others.",
    ],
  }
  return pick(variants[behaviour])
}

function generateStrengthsComment(strengths: string[]): string {
  if (strengths.length === 0) return ""
  const allPhrases: Record<string, string[]> = {
    Leadership: [
      "demonstrates strong leadership qualities and takes initiative in guiding peers during collaborative tasks",
      "shows natural leadership ability by organising group activities and motivating peers to work together",
      "exhibits leadership potential through confident decision-making and taking charge of group efforts",
    ],
    Collaboration: [
      "works collaboratively with peers and contributes positively to group discussions and activities",
      "cooperates well with others and builds positive working relationships within the classroom",
      "shows strong teamwork skills and supports peers during collaborative learning experiences",
    ],
    Creativity: [
      "shows creativity and imagination, bringing innovative ideas to learning tasks and projects",
      "demonstrates originality in thinking and approaches tasks with inventive and resourceful ideas",
      "exhibits creative flair and artistic sensitivity across various learning activities",
    ],
    Responsibility: [
      "demonstrates responsibility and takes ownership of learning tasks, completing work on time and to a good standard",
      "shows reliability in managing assignments and consistently meets deadlines with quality work",
      "takes personal accountability for their learning and maintains high standards in their work",
    ],
    Communication: [
      "communicates ideas clearly and effectively, showing confidence in both oral and written expression",
      "expresses thoughts articulately and engages meaningfully in discussions with peers and teachers",
      "shows strong communication skills through clear expression and active listening during exchanges",
    ],
  }
  const selected = strengths.map((s) => pick(allPhrases[s])).filter(Boolean)
  if (selected.length === 1) return `The learner ${selected[0]}.`
  if (selected.length === 2) return `The learner ${selected[0]} and ${selected[1]}.`
  const last = selected.pop()
  return `The learner ${selected.join(", ")}, and ${last}.`
}

function generateGrowthComment(growth: string[]): string {
  if (growth.length === 0) return ""
  const allPhrases: Record<string, string[]> = {
    Confidence: [
      "is encouraged to build greater confidence in expressing ideas and participating in class discussions",
      "would benefit from developing more self-assurance when contributing to group activities",
      "is working towards speaking up more confidently in class and sharing ideas with peers",
    ],
    Participation: [
      "is working towards increasing active participation in learning activities and group tasks",
      "would benefit from engaging more actively in class discussions and collaborative exercises",
      "is encouraged to take a more active role in group work and contribute ideas more freely",
    ],
    "Time Management": [
      "is developing better time management skills to complete tasks within given timelines",
      "would benefit from improving organisation skills to manage time more effectively on assignments",
      "is learning to plan and allocate time wisely to complete work by set deadlines",
    ],
    Reading: [
      "is strengthening reading fluency and comprehension through regular practice",
      "would benefit from consistent reading practice to build vocabulary and deepen understanding",
      "is encouraged to read widely and frequently to improve fluency and comprehension skills",
    ],
    "Independent Learning": [
      "is developing greater independence in approaching and completing learning tasks",
      "would benefit from building the ability to work through challenges without relying on teacher support",
      "is encouraged to take more initiative in solving problems and completing tasks independently",
    ],
  }
  const selected = growth.map((s) => pick(allPhrases[s])).filter(Boolean)
  if (selected.length === 1) return `The learner ${selected[0]}.`
  if (selected.length === 2) return `The learner ${selected[0]} and ${selected[1]}.`
  const last = selected.pop()
  return `The learner ${selected.join(", ")}, and ${last}.`
}

function generateCompetencyBreakdown(level: CBCLevel, tone: ToneMode, subjects: string[]): string[] {
  const breakdowns: Record<string, string[]> = {
    "Communication & Collaboration": [
      level === "EE" ? "The learner communicates with clarity and confidence, articulating ideas effectively in diverse settings. Outstanding collaboration skills are demonstrated through a consistently constructive role in group work." :
      level === "AE" ? "The learner communicates ideas clearly and collaborates well with peers in group settings. Growing confidence in expressing thoughts and contributing to discussions is clearly evident." :
      level === "ME" ? "The learner communicates adequately and participates in group activities with teacher guidance. Further development in expressing ideas with greater confidence would be beneficial." :
      "The learner is developing foundational communication skills and requires encouragement to participate in group discussions and collaborative tasks with peers.",
    ],
    "Critical Thinking & Problem Solving": [
      level === "EE" ? "The learner demonstrates exceptional critical thinking skills, analysing problems from multiple perspectives and generating innovative solutions independently." :
      level === "AE" ? "The learner applies critical thinking to solve problems effectively, analysing situations and making reasoned decisions with growing confidence." :
      level === "ME" ? "The learner demonstrates satisfactory problem-solving skills and applies known strategies to routine problems with minimal guidance." :
      "The learner is developing basic problem-solving skills and requires support to identify solutions and work through challenges step by step.",
    ],
    "Creativity & Imagination": [
      level === "EE" ? "The learner shows outstanding creativity and imagination, generating original ideas and approaching tasks with innovation and artistic sensitivity." :
      level === "AE" ? "The learner demonstrates creativity and applies imagination effectively in learning tasks, exploring new approaches with willingness and confidence." :
      level === "ME" ? "The learner shows developing creativity and applies imagination in familiar contexts with encouragement and guidance." :
      "The learner is beginning to explore creative expression and requires encouragement to develop imaginative thinking and generate original ideas.",
    ],
    Citizenship: [
      level === "EE" ? "The learner exemplifies outstanding citizenship values, showing deep respect for diversity, active community involvement, and a strong sense of social responsibility." :
      level === "AE" ? "The learner demonstrates good citizenship values, showing respect for others, cultural awareness, and a sense of responsibility toward the community." :
      level === "ME" ? "The learner shows developing citizenship values, learning to respect diversity, follow rules, and participate in community activities with growing understanding." :
      "The learner is beginning to understand basic citizenship values and requires guidance to develop respect for rules, others, and the community.",
    ],
    "Digital Literacy": [
      level === "EE" ? "The learner demonstrates exceptional digital literacy skills, applying technology creatively and responsibly across learning areas with minimal supervision." :
      level === "AE" ? "The learner applies digital literacy skills effectively and uses technology appropriately to support learning tasks and research activities." :
      level === "ME" ? "The learner demonstrates satisfactory digital literacy skills and uses basic digital tools for learning with teacher guidance." :
      "The learner is developing basic digital literacy skills and requires support to use technology tools effectively for learning purposes.",
    ],
    "Learning to Learn": [
      level === "EE" ? "The learner demonstrates exceptional ability to reflect on their own learning, set goals, and use feedback effectively to improve. Initiative in seeking new knowledge and challenges is clearly evident." :
      level === "AE" ? "The learner reflects on their learning and uses feedback constructively to improve. Growing ability to set goals and work toward them independently is evident." :
      level === "ME" ? "The learner is developing the ability to reflect on learning and responds positively to feedback. Willingness to improve and try new approaches is clearly evident." :
      "The learner is beginning to develop reflective learning habits and requires guidance to recognise progress and identify areas for improvement.",
    ],
    "Self-Efficacy": [
      level === "EE" ? "The learner demonstrates exceptional self-confidence and belief in their own abilities, tackling challenges with determination and showing resilience when facing difficulties." :
      level === "AE" ? "The learner shows strong self-confidence and believes in their ability to succeed, approaching new tasks with a positive attitude and perseverance." :
      level === "ME" ? "The learner shows developing confidence and is willing to attempt tasks independently. Continued encouragement will further strengthen self-belief over time." :
      "The learner is building self-confidence and requires consistent encouragement to develop belief in their own abilities and tackle challenges with growing independence.",
    ],
  }
  return Object.entries(breakdowns).map(([comp, comments]) => {
    const comment = comments[Math.floor(Math.random() * comments.length)]
    return `${comp}: ${comment}`
  })
}

const strengthOptions = ["Leadership", "Collaboration", "Creativity", "Responsibility", "Communication"] as const
const growthOptions = ["Confidence", "Participation", "Time Management", "Reading", "Independent Learning"] as const

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

export default function CBCTeacherCommentGenerator() {
  const [level, setLevel] = useState<CBCLevel>("ME")
  const [behaviour, setBehaviour] = useState<CBCLevel>("ME")
  const [learningArea, setLearningArea] = useState("General")
  const [tone, setTone] = useState<ToneMode>("professional")
  const [styleProfile, setStyleProfile] = useState<StyleProfile>("balanced")
  const [currentStructure, setCurrentStructure] = useState<StructureMode>("standard")
  const [length, setLength] = useState<LengthMode>("standard")
  const [parentFriendly, setParentFriendly] = useState(false)
  const [strengths, setStrengths] = useState<string[]>([])
  const [growth, setGrowth] = useState<string[]>([])
  const [showCompetencyBreakdown, setShowCompetencyBreakdown] = useState(false)

  const [generatedComment, setGeneratedComment] = useState("")
  const [editableComment, setEditableComment] = useState("")
  const [breakdownComments, setBreakdownComments] = useState<string[]>([])

  const [teacherName, setTeacherName] = useState("")
  const [learnerName, setLearnerName] = useState("")

  const printRef = useRef<HTMLDivElement>(null)

  const toggleStrength = (s: string) => {
    setStrengths((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
  }
  const toggleGrowth = (s: string) => {
    setGrowth((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
  }

  const generate = () => {
    const rawSubject = getSubjectComment(learningArea, level, tone, parentFriendly, length)
    const rawBehaviour = getBehaviourComment(behaviour)
    const rawStrengths = generateStrengthsComment(strengths)
    const rawGrowth = generateGrowthComment(growth)

    const subjectComment = naturalizeRhythm(rawSubject)
    const behaviourComment = naturalizeRhythm(rawBehaviour)
    const strengthsComment = rawStrengths ? naturalizeRhythm(rawStrengths) : ""
    const growthComment = rawGrowth ? naturalizeRhythm(rawGrowth) : ""

    const section = (label: string, text: string) => `${label}: ${text}`

    interface StructureVariant { mode: StructureMode; fn: () => string[] }
    const structures: StructureVariant[] = [
      // A: Subject → Conduct → Strengths → Growth (standard)
      { mode: "standard", fn: () => {
        const parts = [section("Subject Performance", subjectComment), section("Conduct and Attitude", behaviourComment)]
        if (strengthsComment) parts.push(section("Notable Strengths", strengthsComment))
        if (growthComment) parts.push(section("Areas for Growth", growthComment))
        return parts
      }},
      // B: Strengths → Subject → Conduct → Growth
      { mode: "strengths-first", fn: () => {
        const parts: string[] = []
        if (strengthsComment) parts.push(section("Notable Strengths", strengthsComment))
        parts.push(section("Subject Performance", subjectComment), section("Conduct and Attitude", behaviourComment))
        if (growthComment) parts.push(section("Areas for Growth", growthComment))
        return parts
      }},
      // C: Conduct → Subject → Strengths → Growth
      { mode: "conduct-first", fn: () => {
        const parts = [section("Conduct and Attitude", behaviourComment), section("Subject Performance", subjectComment)]
        if (strengthsComment) parts.push(section("Notable Strengths", strengthsComment))
        if (growthComment) parts.push(section("Areas for Growth", growthComment))
        return parts
      }},
      // D: Subject+Strengths merged → Conduct → Growth
      { mode: "merged-ss", fn: () => {
        const perfText = strengthsComment
          ? `${subjectComment} The learner also demonstrates notable strengths, including: ${strengthsComment.toLowerCase()}`
          : subjectComment
        const parts = [section("Subject Performance", perfText), section("Conduct and Attitude", behaviourComment)]
        if (growthComment) parts.push(section("Areas for Growth", growthComment))
        return parts
      }},
    ]

    const selected = pick(structures)
    setCurrentStructure(selected.mode)
    const sectionParts = selected.fn()
    const fullComment = sectionParts.join("\n\n")
    const styledComment = applyStyleProfile(fullComment, styleProfile, tone)

    const subjectPerfCount = (styledComment.match(/Subject Performance:/g) || []).length
    let safeComment = subjectPerfCount > 1
      ? styledComment.replace(/Subject Performance:[\s\S]*?(?=Conduct and Attitude:)/, "").replace(/^Subject Performance:/, "")
      : styledComment

    safeComment = sanitizeFinalOutput(safeComment)
    safeComment = limitToLastSentence(safeComment)

    setGeneratedComment(safeComment)
    setEditableComment(safeComment)

    if (showCompetencyBreakdown) {
      const subject = learningArea === "General" ? [] : [learningArea]
      const breakdown = generateCompetencyBreakdown(level, tone, subject)
      setBreakdownComments(breakdown)
    } else {
      setBreakdownComments([])
    }

    trackToolUse("teacher-comment-generator", "generate")
  }

  const handleImprove = () => {
    const current = editableComment || generatedComment
    const improved = current
      .replace(/is doing/g, "continues to demonstrate progress in")
      .replace(/shows/g, "demonstrates")
      .replace(/good/g, "commendable")
      .replace(/needs/g, "would benefit from")
      .replace(/trying hard/g, "applying consistent effort")
      .replace(/some extra help/g, "additional guidance and support")
    setEditableComment(improved)
    toast.success("Comment improved")
  }

  const handleShorten = () => {
    const current = editableComment || generatedComment
    const sentences = current.split(/(?<=[.!?])\s+/)
    const shortened = sentences.slice(0, Math.max(2, Math.ceil(sentences.length * 0.6))).join(" ")
    setEditableComment(limitWords(shortened, 30, 60))
    toast.success("Comment shortened")
  }

  const handleProfessional = () => {
    const current = editableComment || generatedComment
    const pro = current
      .replace(/is doing very well in/g, "is demonstrating commendable progress in")
      .replace(/is doing well/g, "is performing commendably")
      .replace(/really good/g, "satisfactory")
      .replace(/very well/g, "exceptionally well")
      .replace(/keep up/g, "continue")
      .replace(/shows/g, "demonstrates")
    setEditableComment(pro)
    toast.success("Comment rewritten in professional tone")
  }

  const handleEncouraging = () => {
    const current = editableComment || generatedComment
    const enc = current
      .replace(/requires support/g, "will thrive with continued encouragement")
      .replace(/needs to/g, "is encouraged to")
      .replace(/needs some extra help/g, "will benefit from continued encouragement and support")
      .replace(/but/g, "and")
    setEditableComment(enc)
    toast.success("Comment rewritten in encouraging tone")
  }

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    trackToolUse("teacher-comment-generator", "copy")
    toast.success("Comment copied to clipboard")
  }, [])

  const handlePDF = useCallback(async () => {
    try {
      const { default: jsPDF } = await import("jspdf")
      const doc = new jsPDF()
      const margin = 20
      const pageWidth = doc.internal.pageSize.getWidth()
      const maxWidth = pageWidth - margin * 2
      let y = 25
      const lineHeight = 7

      const write = (text: string, bold = false, size = 11) => {
        if (y > 270) { doc.addPage(); y = 20 }
        doc.setFontSize(size)
        doc.setFont("helvetica", bold ? "bold" : "normal")
        doc.text(text, margin, y)
        y += lineHeight
      }

      write("REPORT CARD COMMENT", true, 16)
      y += 4
      write("CBC Competency-Based Assessment", false, 10)
      y += 6
      doc.setDrawColor(200)
      doc.line(margin, y, pageWidth - margin, y)
      y += 6

      if (learnerName) write(`Learner: ${learnerName}`, false, 10)
      if (teacherName) write(`Teacher: ${teacherName}`, false, 10)
      if (learningArea !== "General") write(`Learning Area: ${learningArea}`, false, 10)
      write(`CBC Level: ${level} (${cbcLabels[level]})`, false, 10)
      write(`Behaviour: ${behaviour} (${cbcLabels[behaviour]})`, false, 10)
      write(`Date: ${new Date().toLocaleDateString()}`, false, 10)
      y += 6
      doc.line(margin, y, pageWidth - margin, y)
      y += 6

      if (breakdownComments.length > 0) {
        write("COMPETENCY BREAKDOWN", true, 12)
        y += 2
        breakdownComments.forEach((b) => {
          if (y > 260) { doc.addPage(); y = 20 }
          const lines = doc.splitTextToSize(b, maxWidth)
          lines.forEach((l: string) => write(l, false, 9))
          y += 1
        })
        y += 4
      }

      const commentText = editableComment || generatedComment
      write("TEACHER COMMENT", true, 12)
      y += 2
      const commentLines = doc.splitTextToSize(commentText, maxWidth)
      commentLines.forEach((l: string) => write(l, false, 10))
      y += 10
      doc.line(margin, y, pageWidth - margin, y)
      y += 4
      write(`Teacher Signature: ___________________________`, false, 10)
      write(`Date: ___________________________`, false, 10)
      doc.save("cbc-report-card-comment.pdf")
      trackDownload("teacher-comment-generator", "download_pdf")
      toast.success("PDF downloaded")
    } catch {
      toast.error("Failed to generate PDF")
    }
  }, [editableComment, generatedComment, learnerName, teacherName, learningArea, level, behaviour, breakdownComments])

  const handleDOCX = () => {
    const commentText = editableComment || generatedComment
    const breakdownHTML = breakdownComments.length > 0
      ? breakdownComments.map((b) => `<p style="font-size:11px;margin:2px 0">${b}</p>`).join("")
      : ""
    const content = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Report Card Comment</title>
<style>
  body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;padding:20px;color:#222;line-height:1.6}
  h1{text-align:center;font-size:18px;margin-bottom:4px}
  h2{font-size:14px;margin:16px 0 6px;border-bottom:1px solid #ccc;padding-bottom:4px}
  .meta{font-size:12px;margin:12px 0}
  .meta div{margin:2px 0}
  hr{border:none;border-top:1px solid #999;margin:12px 0}
  .footer{margin-top:30px;font-size:11px;color:#888}
  .signature{margin-top:20px;font-size:12px}
</style></head><body>
<h1>REPORT CARD COMMENT</h1>
<p style="text-align:center;font-size:11px;color:#666">CBC Competency-Based Assessment</p>
<hr>
<div class="meta">
  ${learnerName ? `<div><b>Learner:</b> ${learnerName}</div>` : ""}
  ${teacherName ? `<div><b>Teacher:</b> ${teacherName}</div>` : ""}
  ${learningArea !== "General" ? `<div><b>Learning Area:</b> ${learningArea}</div>` : ""}
  <div><b>CBC Level:</b> ${level} (${cbcLabels[level]})</div>
  <div><b>Behaviour:</b> ${behaviour} (${cbcLabels[behaviour]})</div>
  <div><b>Date:</b> ${new Date().toLocaleDateString()}</div>
</div>
<hr>
${breakdownHTML ? `<h2>Competency Breakdown</h2>${breakdownHTML}<hr>` : ""}
<h2>Teacher Comment</h2>
<p style="font-size:12px;line-height:1.8">${commentText.replace(/\n/g, "<br>")}</p>
<hr>
<div class="signature">
  <p><b>Teacher Signature:</b> ___________________________</p>
  <p><b>Date:</b> ___________________________</p>
</div>
<div class="footer">Generated by ToolForge CBC Report Card Comment Engine</div>
</body></html>`
    const blob = new Blob([content], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "cbc-report-card-comment.doc"
    a.click()
    URL.revokeObjectURL(url)
    trackDownload("teacher-comment-generator", "download_docx")
    toast.success("DOCX downloaded")
  }

  const handlePrint = () => {
    trackToolUse("teacher-comment-generator", "print")
    window.print()
  }

  const wordCount = countWords(editableComment || generatedComment)

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:space-y-4">
      <div className="text-center space-y-1 print:hidden">
        <h2 className="text-2xl font-bold tracking-tight">CBC Report Card Comment Engine</h2>
        <p className="text-sm text-muted-foreground">Professional teacher-quality report card comments aligned to CBC performance levels</p>
      </div>

      {/* Learner & Teacher Info */}
      <Card className="print:hidden">
        <CardContent className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" /> Learner & Teacher Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Learner Name</label>
              <input
                type="text"
                value={learnerName}
                onChange={(e) => setLearnerName(e.target.value)}
                placeholder="e.g. John Kamau"
                className="flex h-10 w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Teacher Name</label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="e.g. Ms. Jane Wanjiku"
                className="flex h-10 w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="print:hidden">
        <CardContent className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">CBC Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as CBCLevel)}
                className="flex h-10 w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors"
              >
                {Object.entries(cbcLabels).map(([k, v]) => (
                  <option key={k} value={k}>{k} — {v}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Behaviour / Attitude</label>
              <select
                value={behaviour}
                onChange={(e) => setBehaviour(e.target.value as CBCLevel)}
                className="flex h-10 w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors"
              >
                {Object.entries(cbcLabels).map(([k, v]) => (
                  <option key={k} value={k}>{k} — {v}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Learning Area</label>
              <select
                value={learningArea}
                onChange={(e) => setLearningArea(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors"
              >
                {learningAreas.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as ToneMode)}
                className="flex h-10 w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors"
              >
                {Object.entries(toneLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Teacher Style</label>
              <select
                value={styleProfile}
                onChange={(e) => setStyleProfile(e.target.value as StyleProfile)}
                className="flex h-10 w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors"
                title="Adjusts tone, vocabulary, and reporting style of generated CBC comments"
              >
                {Object.entries(styleLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground/60 leading-tight">{styleDescriptions[styleProfile]}</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Comment Length</label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value as LengthMode)}
                className="flex h-10 w-full rounded-lg border border-input bg-input/30 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-colors"
              >
                {Object.entries(lengthLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={parentFriendly}
                  onChange={(e) => setParentFriendly(e.target.checked)}
                  className="rounded border-border"
                />
                Parent-Friendly Mode
              </label>
            </div>
            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={showCompetencyBreakdown}
                  onChange={(e) => setShowCompetencyBreakdown(e.target.checked)}
                  className="rounded border-border"
                />
                Include CBC Competency Breakdown
              </label>
            </div>
          </div>

          {/* Strengths & Growth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Star className="h-3 w-3 text-amber-500" /> Strengths (optional)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {strengthOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleStrength(s)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${
                      strengths.includes(s)
                        ? "bg-green-500/20 border-green-500 text-green-600"
                        : "bg-muted/20 border-border text-muted-foreground hover:border-green-500/50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Target className="h-3 w-3 text-orange-500" /> Areas for Growth (optional)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {growthOptions.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGrowth(g)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${
                      growth.includes(g)
                        ? "bg-orange-500/20 border-orange-500 text-orange-600"
                        : "bg-muted/20 border-border text-muted-foreground hover:border-orange-500/50"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={generate} className="w-full" size="lg">
            <Sparkles className="h-4 w-4" /> Generate Report Card Comment
          </Button>
        </CardContent>
      </Card>

      {/* Generated Comment Panel */}
      {generatedComment ? (
        <>
          <Card className="border-primary/30 print:border-2">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Generated Comment
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <AlignLeft className="h-3 w-3" />
                    {wordCount} words
                    {length !== "standard" && (
                      <span className="text-muted-foreground/60">
                        ({lengthLabels[length].split(" ")[0]})
                      </span>
                    )}
                  </span>
                  <div className="flex gap-1.5 flex-wrap print:hidden">
                    <Button variant="outline" size="xs" onClick={() => handleCopy(editableComment)}>
                      <Copy className="h-3 w-3" /> Copy
                    </Button>
                    <Button variant="outline" size="xs" onClick={handlePDF}>
                      <FileDown className="h-3 w-3" /> PDF
                    </Button>
                    <Button variant="outline" size="xs" onClick={handleDOCX}>
                      <FileText className="h-3 w-3" /> DOCX
                    </Button>
                    <Button variant="outline" size="xs" onClick={handlePrint}>
                      <Printer className="h-3 w-3" /> Print
                    </Button>
                  </div>
                </div>
              </div>

              {/* Editable Comment */}
              <textarea
                value={editableComment}
                onChange={(e) => setEditableComment(e.target.value)}
                rows={8}
                className="w-full rounded-lg border bg-muted/20 p-4 text-sm leading-relaxed outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors resize-y"
              />

              {/* Competency Breakdown */}
              {breakdownComments.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t">
                  <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5" /> CBC Competency Breakdown
                  </h4>
                  <div className="grid grid-cols-1 gap-1.5">
                    {breakdownComments.map((b, i) => (
                      <p key={i} className="text-[11px] text-muted-foreground leading-relaxed">{b}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Edit Actions */}
              <div className="flex flex-wrap gap-1.5 print:hidden pt-2 border-t">
                <Button variant="outline" size="xs" onClick={handleImprove}>
                  <Sparkles className="h-3 w-3" /> Improve
                </Button>
                <Button variant="outline" size="xs" onClick={handleShorten}>
                  <ChevronDown className="h-3 w-3" /> Shorten
                </Button>
                <Button variant="outline" size="xs" onClick={handleProfessional}>
                  <Star className="h-3 w-3" /> Make Professional
                </Button>
                <Button variant="outline" size="xs" onClick={handleEncouraging}>
                  <Heart className="h-3 w-3" /> Make Encouraging
                </Button>
                <Button variant="outline" size="xs" onClick={generate}>
                  <RefreshCw className="h-3 w-3" /> Regenerate
                </Button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground pt-1">
                <span className="px-2 py-0.5 rounded-full border">Competency: {level} ({cbcLabels[level]})</span>
                <span className="px-2 py-0.5 rounded-full border">Behaviour: {behaviour} ({cbcLabels[behaviour]})</span>
                {learningArea !== "General" && <span className="px-2 py-0.5 rounded-full border">{learningArea}</span>}
                <span className="px-2 py-0.5 rounded-full border">Tone: {toneLabels[tone]}</span>
                <span className="px-2 py-0.5 rounded-full border">Style: {styleLabels[styleProfile]}</span>
                <span className="px-2 py-0.5 rounded-full border">Structure: {structureLabels[currentStructure]}</span>
                <span className="px-2 py-0.5 rounded-full border">Length: {lengthLabels[length]}</span>
                {parentFriendly && <span className="px-2 py-0.5 rounded-full border bg-blue-500/10 text-blue-600">Parent-Friendly</span>}
              </div>
            </CardContent>
          </Card>

          {/* Report Card Preview */}
          <div ref={printRef} className="hidden print:block border-2 p-6 rounded-lg space-y-4">
            <div className="text-center border-b pb-3">
              <h2 className="text-lg font-bold">REPORT CARD COMMENT</h2>
              <p className="text-xs text-muted-foreground">CBC Competency-Based Assessment</p>
            </div>
            <div className="space-y-1 text-xs">
              {learnerName && <p><span className="font-semibold">Learner:</span> {learnerName}</p>}
              {teacherName && <p><span className="font-semibold">Teacher:</span> {teacherName}</p>}
              {learningArea !== "General" && <p><span className="font-semibold">Learning Area:</span> {learningArea}</p>}
              <p><span className="font-semibold">CBC Level:</span> {level} ({cbcLabels[level]})</p>
              <p><span className="font-semibold">Behaviour:</span> {behaviour} ({cbcLabels[behaviour]})</p>
              <p><span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}</p>
            </div>
            <Separator />
            {breakdownComments.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-semibold">CBC Competency Breakdown</h4>
                {breakdownComments.map((b, i) => (
                  <p key={i} className="text-[11px] text-muted-foreground">{b}</p>
                ))}
              </div>
            )}
            <Separator />
            <div>
              <h4 className="text-xs font-semibold mb-1">Teacher Comment</h4>
              <p className="text-xs leading-relaxed whitespace-pre-wrap">{editableComment || generatedComment}</p>
            </div>
            <Separator />
            <div className="text-xs space-y-2 pt-2">
              <p><span className="font-semibold">Teacher Signature:</span> ___________________________</p>
              <p><span className="font-semibold">Date:</span> ___________________________</p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted/30 p-4 mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No comment generated yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1.5 max-w-[280px]">
            Configure options above and click Generate to create a report card comment
          </p>
        </div>
      )}
    </div>
  )
}

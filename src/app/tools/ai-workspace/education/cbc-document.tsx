"use client"

import { useMemo, useRef, useCallback, useState, useEffect } from "react"
import { generatePdfFromHtml } from "@/tools/ai-workspace/utils/pdf-html-generator"
import {
  Target, CheckCircle2, HelpCircle, Lightbulb, Heart,
  Globe, BookOpen, Clock, UserCheck, Users,
  ClipboardCheck, Table2, Layers, RotateCcw,
  Copy, Pencil, RotateCcw as RotateCcwIcon,
  Printer, Download, FileText, FileDown,
  Hash, CalendarDays, User, Building2, Minus, GitBranch,
  AlertTriangle, Sparkles, ChevronUp, ChevronDown,
} from "lucide-react"

interface CbcDocumentProps {
  text: string
  featureLabel: string
  onCopy?: () => void
  onEdit?: () => void
  onRegenerate?: () => void
  isProcessing?: boolean
}

interface CurriculumInfo {
  label: string
  value: string
  icon: typeof BookOpen
}

interface ParsedSection {
  heading: string
  headingLevel: number
  content: string
  type: "info" | "list" | "table" | "timeline" | "mixed" | "paragraph"
}

interface ParsedTable {
  headers: string[]
  rows: string[][]
}

interface ParsedDocument {
  curriculumInfo: CurriculumInfo[]
  sections: ParsedSection[]
}

const SECTION_META: Record<string, { icon: typeof BookOpen; color: string }> = {
  "learning outcomes": { icon: Target, color: "border-l-blue-500/40 bg-blue-500/[0.03]" },
  "success criteria": { icon: CheckCircle2, color: "border-l-emerald-500/40 bg-emerald-500/[0.03]" },
  "key inquiry questions": { icon: HelpCircle, color: "border-l-purple-500/40 bg-purple-500/[0.03]" },
  "core competencies": { icon: Lightbulb, color: "border-l-amber-500/40 bg-amber-500/[0.03]" },
  values: { icon: Heart, color: "border-l-rose-500/40 bg-rose-500/[0.03]" },
  "pertinent and contemporary issues": { icon: Globe, color: "border-l-teal-500/40 bg-teal-500/[0.03]" },
  pcis: { icon: Globe, color: "border-l-teal-500/40 bg-teal-500/[0.03]" },
  "learning resources": { icon: BookOpen, color: "border-l-indigo-500/40 bg-indigo-500/[0.03]" },
  resources: { icon: BookOpen, color: "border-l-indigo-500/40 bg-indigo-500/[0.03]" },
  "lesson development": { icon: Clock, color: "border-l-orange-500/40 bg-orange-500/[0.03]" },
  "teacher activities": { icon: UserCheck, color: "border-l-sky-500/40 bg-sky-500/[0.03]" },
  "learner activities": { icon: Users, color: "border-l-violet-500/40 bg-violet-500/[0.03]" },
  assessment: { icon: ClipboardCheck, color: "border-l-red-500/40 bg-red-500/[0.03]" },
  "assessment matrix": { icon: Table2, color: "border-l-cyan-500/40 bg-cyan-500/[0.03]" },
  "assessment methods": { icon: ClipboardCheck, color: "border-l-red-500/40 bg-red-500/[0.03]" },
  differentiation: { icon: Layers, color: "border-l-pink-500/40 bg-pink-500/[0.03]" },
  reflection: { icon: RotateCcw, color: "border-l-slate-500/40 bg-slate-500/[0.03]" },
  "teacher reflection": { icon: RotateCcw, color: "border-l-slate-500/40 bg-slate-500/[0.03]" },
}

const CURRICULUM_INFO_KEYS = [
  "learning area", "grade", "strand", "sub-strand",
  "lesson number", "week", "date", "duration",
  "teacher", "school", "term", "year",
  "number of learners", "learning environment",
]

const CURRICULUM_ICONS: Record<string, typeof BookOpen> = {
  "learning area": BookOpen,
  grade: Hash,
  strand: GitBranch,
  "sub-strand": Minus,
  "lesson number": Hash,
  week: CalendarDays,
  date: CalendarDays,
  duration: Clock,
  teacher: User,
  school: Building2,
  term: CalendarDays,
  year: CalendarDays,
  "number of learners": Users,
  "learning environment": Globe,
}

function normalizeHeading(s: string): string {
  return s.toLowerCase().replace(/^(lesson plan|scheme of work|assessment|revision plan).*/i, "").replace(/[^a-z0-9 ]/g, "").trim()
}

function classifyHeading(heading: string): string | null {
  const h = heading.toLowerCase().trim()
  for (const key of Object.keys(SECTION_META)) {
    if (h.includes(key)) return key
  }
  return null
}

function extractCurriculumInfo(lines: string[]): { info: CurriculumInfo[]; remaining: string[] } {
  const info: CurriculumInfo[] = []
  const remaining: string[] = []
  let inInfo = true

  for (const line of lines) {
    if (!line.trim()) { if (inInfo) continue; remaining.push(line); continue }

    const kvMatch = line.match(/^\*\*?(.+?)\*\*?:\s*(.+)/)
    if (kvMatch && inInfo) {
      const key = kvMatch[1].toLowerCase().trim()
      const val = kvMatch[2].trim()
      if (CURRICULUM_INFO_KEYS.some((k) => key.includes(k))) {
        const matchedKey = CURRICULUM_INFO_KEYS.find((k) => key.includes(k)) || key
        info.push({ label: kvMatch[1].trim(), value: val, icon: CURRICULUM_ICONS[matchedKey] || BookOpen })
        continue
      }
    }

    if (line.startsWith("## ") || line.startsWith("# ")) {
      inInfo = false
      remaining.push(line)
      continue
    }

    if (line.startsWith("**") && !kvMatch) {
      remaining.push(line)
      continue
    }

    if (inInfo) inInfo = false
    remaining.push(line)
  }

  return { info, remaining }
}

function parseTable(lines: string[], startIdx: number): { table: ParsedTable; endIdx: number } {
  const headers: string[] = []
  const rows: string[][] = []
  let idx = startIdx
  let headerRow: string[] | null = null

  while (idx < lines.length) {
    const line = lines[idx].trim()
    if (!line.startsWith("|") || !line.endsWith("|")) break

    const cells = line.split("|").slice(1, -1).map((c) => c.trim())
    if (cells.length < 2) break

    const isSeparator = cells.every((c) => /^[-:\s]+$/.test(c))
    if (isSeparator) { idx++; continue }

    if (headerRow === null) {
      headerRow = cells
    } else {
      rows.push(cells)
    }
    idx++
  }

  return {
    table: { headers: headerRow || [], rows },
    endIdx: idx,
  }
}

const TIMELINE_PHASES = ["introduction", "lesson development", "development", "conclusion", "plenary"]

function isTimelineSection(lines: string[]): boolean {
  const joined = lines.join(" ").toLowerCase()
  const hasPhase = TIMELINE_PHASES.some((p) => joined.includes(p))
  const hasTime = /\d+\s*(min|minutes?)/i.test(joined)
  return hasPhase && hasTime
}

function parseTimeline(lines: string[]): { phases: { name: string; time: string; content: string }[] } {
  const phases: { name: string; time: string; content: string }[] = []
  let current: { name: string; time: string; content: string } | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const timeMatch = trimmed.match(/^###?\s*(.+?)\s*\((\d+\s*min(?:utes?)?)\)/i)
    if (timeMatch) {
      if (current) phases.push(current)
      current = { name: timeMatch[1].trim(), time: timeMatch[2].trim(), content: "" }
      continue
    }

    const phaseTimeMatch = trimmed.match(/^(Introduction|Lesson Development|Development|Conclusion|Plenary)\s*[:(]\s*(\d+\s*min(?:utes?)?)/i)
    if (phaseTimeMatch) {
      if (current) phases.push(current)
      current = { name: phaseTimeMatch[1].trim(), time: phaseTimeMatch[2].trim(), content: "" }
      continue
    }

    const tableCell = trimmed.replace(/^\||\|$/g, "").trim()
    if (tableCell && current && TIMELINE_PHASES.some((p) => tableCell.toLowerCase().includes(p))) {
      if (current) phases.push(current)
      current = { name: tableCell, time: "", content: "" }
      continue
    }

    if (current) {
      if (current.content) current.content += " " + trimmed
      else current.content = trimmed
    }
  }

  if (current) phases.push(current)
  return { phases }
}

function parseSections(text: string): ParsedDocument {
  const cleaned = cleanRawText(text)
  const lines = cleaned.split("\n")
  const { info: curriculumInfo, remaining } = extractCurriculumInfo(lines)

  const sections: ParsedSection[] = []
  let currentHeading = ""
  let currentLevel = 0
  let currentContent: string[] = []

  function flushSection() {
    if (currentHeading || currentContent.length > 0) {
      const contentText = currentContent.join("\n").trim()
      if (contentText) {
        const sectionLines = currentContent
        const hasTable = sectionLines.some((l) => l.trim().startsWith("|"))
        const hasList = sectionLines.some((l) => /^\s*[-*]\s/.test(l.trim()) || /^\s*\d+[.)]\s/.test(l.trim()))
        const isTimeline = isTimelineSection(sectionLines)

        let type: ParsedSection["type"] = "paragraph"
        if (isTimeline) type = "timeline"
        else if (hasTable && !hasList) type = "table"
        else if (hasList && !hasTable) type = "list"
        else if (hasTable && hasList) type = "mixed"
        else if (contentText.length < 200 && contentText.split("\n").length <= 3) type = "info"

        sections.push({ heading: currentHeading, headingLevel: currentLevel, content: contentText, type })
      }
    }
  }

  for (const line of remaining) {
    const hMatch = line.match(/^(#{1,6})\s+(.+)/)
    if (hMatch) {
      flushSection()
      currentLevel = hMatch[1].length
      currentHeading = hMatch[2].trim()
      currentContent = []
    } else {
      currentContent.push(line)
    }
  }
  flushSection()

  return { curriculumInfo, sections }
}

const sectionCallouts: Record<string, string[]> = {
  "learning outcomes": [
    "Learning outcomes must be specific, measurable, and observable.",
    "Align each outcome to CBC core competencies.",
  ],
  "success criteria": [
    "Success criteria help learners self-assess their progress.",
    "Share success criteria at the start of the lesson.",
  ],
  "core competencies": [
    "CBC focuses on 7 core competencies: Communication, Collaboration, Critical Thinking, Creativity, Digital Literacy, Self-Efficacy, Citizenship.",
  ],
  values: [
    "Integrate values naturally into learning activities.",
    "Reference KICD core values: Love, Responsibility, Respect, Unity, Peace, Integrity, Patriotism.",
  ],
}

const PREAMBLE_PATTERNS = [
  /^Here('s| is) (a|the|an|your).*/i,
  /^Certainly[!.,].*/i,
  /^I'?d be happy to.*/i,
  /^This (report|document|comment|plan|assessment) (includes|contains|provides).*/i,
  /^Below are.*/i,
  /^I have generated.*/i,
  /^Here are (your|the).*/i,
  /^As requested,.*/i,
  /^Sure[!.,].*/i,
  /^Absolutely[!.,].*/i,
  /^Below is.*/i,
  /^Here is (a|the|my).*/i,
]

function cleanRawText(text: string): string {
  let cleaned = text
  for (const pattern of PREAMBLE_PATTERNS) {
    cleaned = cleaned.replace(new RegExp(pattern.source, "gm"), "")
  }
  cleaned = cleaned.replace(/^\s*[\r\n]/gm, "")
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n")
  return cleaned.trim()
}

function renderInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code class='rounded bg-muted/30 px-1 py-0.5 text-sm font-mono'>$1</code>")
}

function CbcTimeline({ phases }: { phases: { name: string; time: string; content: string }[] }) {
  if (phases.length === 0) return null
  return (
    <div className="relative py-3">
      <div className="absolute left-[31px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-primary/30 via-primary/20 to-primary/30" />
      <div className="space-y-4">
        {phases.map((phase, idx) => (
          <div key={idx} className="relative flex gap-5">
            <div className="relative z-10 mt-0.5 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 bg-card text-primary shadow-sm">
              <span className="text-base font-bold leading-none">{idx + 1}</span>
            </div>
            <div className="flex-1 min-w-0 rounded-xl border border-border/30 bg-card/50 p-4">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-lg font-semibold text-foreground/90">{phase.name}</span>
                {phase.time && (
                  <span className="shrink-0 rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary/80">{phase.time}</span>
                )}
              </div>
              {phase.content && (
                <p className="text-base text-muted-foreground/70 leading-[1.75]" dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(phase.content) }} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CbcTable({ headers, rows }: ParsedTable) {
  if (headers.length === 0 && rows.length === 0) return null
  return (
    <div className="overflow-x-auto my-3 rounded-xl border border-border/30">
      <table className="w-full border-collapse">
        {headers.length > 0 && (
          <thead>
            <tr className="bg-card/40">
              {headers.map((h, i) => (
                <th key={i} className="border-b border-r border-border/30 px-4 py-3 text-left font-bold text-foreground/85 text-base last:border-r-0">{h}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border/20 last:border-b-0 hover:bg-card/20 transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className="border-r border-border/20 px-4 py-3 text-muted-foreground/70 text-base leading-[1.7] last:border-r-0">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CbcChipList({ items, color }: { items: string[]; color: string }) {
  if (items.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2 my-3">
      {items.map((item, i) => (
        <span key={i} className={`inline-flex items-center gap-1.5 rounded-lg border ${color} px-3 py-1.5 text-sm font-medium text-foreground/80 bg-card/50`}>
          {item}
        </span>
      ))}
    </div>
  )
}

function CbcCallout({ type, children }: { type: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    tip: "border-l-amber-500/40 bg-amber-500/[0.04]",
    safety: "border-l-red-500/40 bg-red-500/[0.04]",
    reminder: "border-l-blue-500/40 bg-blue-500/[0.04]",
    assessment: "border-l-purple-500/40 bg-purple-500/[0.04]",
  }
  const icons: Record<string, typeof AlertTriangle> = {
    tip: Lightbulb,
    safety: AlertTriangle,
    reminder: AlertTriangle,
    assessment: ClipboardCheck,
  }
  const Icon = icons[type] || AlertTriangle
  return (
    <div className={`my-4 rounded-xl border-l-4 ${colors[type] || colors.tip} p-4`}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground/60" />
        <div className="text-base text-muted-foreground/70 leading-[1.75]">{children}</div>
      </div>
    </div>
  )
}

function renderSectionContent(section: ParsedSection): React.ReactNode {
  const lines = section.content.split("\n")

  if (section.type === "timeline") {
    const { phases } = parseTimeline(lines)
    if (phases.length > 1) return <CbcTimeline phases={phases} />
  }

  if (section.type === "table") {
    const tableStart = lines.findIndex((l) => l.trim().startsWith("|"))
    if (tableStart >= 0) {
      const { table } = parseTable(lines, tableStart)
      if (table.headers.length > 0 || table.rows.length > 0) {
        const beforeTable = lines.slice(0, tableStart).filter((l) => l.trim()).join("\n")
        return (
          <>
            {beforeTable && <p className="text-base text-muted-foreground/70 leading-[1.75] mb-3 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(beforeTable) }} />}
            <CbcTable {...table} />
          </>
        )
      }
    }
  }

  if (section.type === "list") {
    const items: string[] = []
    const nonListLines: string[] = []
    for (const line of lines) {
      const trimmed = line.trim()
      const listMatch = trimmed.match(/^[-*]\s+(.+)/)
      if (listMatch) {
        if (nonListLines.length > 0 && items.length > 0) {
          nonListLines.push(trimmed)
        } else {
          items.push(listMatch[1])
        }
      } else if (trimmed) {
        nonListLines.push(trimmed)
      }
    }

    const heading = section.heading.toLowerCase()
    const isChipStyle = heading.includes("competenc") || heading.includes("values") || heading.includes("pci") || heading.includes("pertinent")

    return (
      <>
        {nonListLines.length > 0 && (
          <p className="text-base text-muted-foreground/70 leading-[1.75] mb-3 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(nonListLines.join("\n")) }} />
        )}
        {items.length > 0 && isChipStyle ? (
          <CbcChipList items={items} color="border-white/[0.08]" />
        ) : items.length > 0 ? (
          <ul className="space-y-2 my-3">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-base text-muted-foreground/70 leading-[1.75]">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary/30" />
                <span dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(item) }} />
              </li>
            ))}
          </ul>
        ) : null}
      </>
    )
  }

  if (section.type === "mixed") {
    const segments: React.ReactNode[] = []
    let i = 0
    while (i < lines.length) {
      const line = lines[i].trim()
      if (!line) { i++; continue }

      if (line.startsWith("|")) {
        const { table, endIdx } = parseTable(lines, i)
        segments.push(<CbcTable key={`t${i}`} {...table} />)
        i = endIdx
      } else if (/^\s*[-*]\s/.test(line)) {
        const items: string[] = []
        while (i < lines.length && /^\s*[-*]\s/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^[-*]\s+/, ""))
          i++
        }
        const heading = section.heading.toLowerCase()
        const isChipStyle = heading.includes("competenc") || heading.includes("values") || heading.includes("pci")
        segments.push(
          isChipStyle
            ? <CbcChipList key={`l${i}`} items={items} color="border-white/[0.08]" />
            : <ul key={`l${i}`} className="space-y-2 my-3">{items.map((item, idx) => <li key={idx} className="flex items-start gap-3 text-base text-muted-foreground/70 leading-[1.75]"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary/30" /><span dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(item) }} /></li>)}</ul>
        )
      } else {
        const paras: string[] = []
        while (i < lines.length && line.trim() && !line.startsWith("|") && !/^\s*[-*]\s/.test(line)) {
          paras.push(lines[i])
          i++
        }
        segments.push(<p key={`p${i}`} className="text-base text-muted-foreground/70 leading-[1.75] whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(paras.join("\n")) }} />)
      }
    }
    return <div className="space-y-2">{segments}</div>
  }

  const text = section.content.trim()
  if (!text) return null
  return (
    <p className="text-base text-muted-foreground/70 leading-[1.75] whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(text) }} />
  )
}

function DocumentHeader({ title }: { title: string }) {
  return (
    <div className="text-center mb-8 pb-5 border-b-2 border-gray-200">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Sparkles className="h-5 w-5 text-primary/60" />
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/60">Zilita AI Assistant</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
    </div>
  )
}

function CurriculumInfoCard({ info }: { info: CurriculumInfo[] }) {
  if (info.length === 0) return null

  const leftCol = info.slice(0, Math.ceil(info.length / 2))
  const rightCol = info.slice(Math.ceil(info.length / 2))

  function renderCol(items: CurriculumInfo[]) {
    return items.map((item, i) => {
      const Icon = item.icon
      return (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-border/30 bg-card/40 px-4 py-3">
          <Icon className="h-5 w-5 shrink-0 text-primary/50" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground/50">{item.label}</p>
            <p className="text-base font-semibold text-foreground/90 truncate">{item.value}</p>
          </div>
        </div>
      )
    })
  }

  return (
    <div className="mb-6 rounded-xl border border-border/30 bg-card/20 p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/25">
        <BookOpen className="h-5 w-5 text-primary/60" />
        <h2 className="text-base font-semibold text-foreground/80 uppercase tracking-wider">Curriculum Information</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-3">{renderCol(leftCol)}</div>
        <div className="space-y-3">{renderCol(rightCol)}</div>
      </div>
    </div>
  )
}

const calloutContent: Record<string, string[]> = {
  "learning outcomes": ["Learning outcomes must be specific, measurable, and observable.", "Align each outcome to CBC core competencies."],
  "success criteria": ["Success criteria help learners self-assess their progress.", "Share success criteria at the start of the lesson."],
}

function SectionCard({ section }: { section: ParsedSection }) {
  const headingLower = section.heading.toLowerCase().trim()
  const classified = classifyHeading(headingLower)
  const meta = classified ? SECTION_META[classified] : null
  const Icon = meta?.icon || BookOpen

  const callouts = calloutContent[classified || ""]

  const rendered = renderSectionContent(section)
  if (!rendered) return null

  return (
    <div className={`mb-5 rounded-xl border border-border/30 ${meta?.color || "bg-card/20"} overflow-hidden`}>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border/20">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary/70" />
        </div>
        <h2 className="text-xl font-bold text-foreground/90">{section.heading}</h2>
      </div>
      <div className="px-5 py-4">
        {callouts && callouts.length > 0 && (
          <CbcCallout type="tip">{callouts.map((c, i) => <p key={i} className={i > 0 ? "mt-2" : ""}>{c}</p>)}</CbcCallout>
        )}
        {rendered}
      </div>
    </div>
  )
}

function DocumentFooter() {
  return (
    <div className="mt-8 pt-6 border-t-2 border-gray-200">
      <div className="mb-6 rounded-xl border border-border/30 bg-card/20 p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/25">
          <RotateCcw className="h-5 w-5 text-primary/60" />
          <h2 className="text-lg font-semibold text-foreground/80">Teacher Reflection</h2>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-base font-medium text-foreground/70 mb-1.5">What went well?</p>
            <div className="h-20 rounded-lg border border-dashed border-white/[0.08] bg-card/30" />
          </div>
          <div>
            <p className="text-base font-medium text-foreground/70 mb-1.5">Areas for improvement</p>
            <div className="h-20 rounded-lg border border-dashed border-white/[0.08] bg-card/30" />
          </div>
          <div>
            <p className="text-base font-medium text-foreground/70 mb-1.5">Next lesson focus</p>
            <div className="h-20 rounded-lg border border-dashed border-white/[0.08] bg-card/30" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-3">
            <div>
              <p className="text-base font-medium text-foreground/70 mb-1.5">Teacher Signature</p>
              <div className="h-10 rounded-lg border border-dashed border-white/[0.08] bg-card/30" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground/70 mb-1.5">Date</p>
              <div className="h-10 rounded-lg border border-dashed border-white/[0.08] bg-card/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CbcDocument({ text, featureLabel, onCopy, onEdit, onRegenerate, isProcessing }: CbcDocumentProps) {
  const document = useMemo(() => parseSections(text), [text])
  const paperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [needsCollapse, setNeedsCollapse] = useState(false)

  const handlePrint = useCallback(() => {
    const content = paperRef.current?.innerHTML
    if (!content) return
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(printHTML(content, featureLabel))
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 500)
  }, [featureLabel])

  const handlePdf = useCallback(async () => {
    const content = paperRef.current?.innerHTML
    if (!content) return
    const filename = `cbc-${featureLabel.toLowerCase().replace(/\s+/g, "-")}`
    try {
      await generatePdfFromHtml(content, featureLabel, filename)
    } catch (err) {
      console.error("PDF generation failed, falling back to browser print", err)
      const win = window.open("", "_blank")
      if (!win) return
      win.document.write(printHTML(content, featureLabel))
      win.document.close()
      win.focus()
      setTimeout(() => win.print(), 500)
    }
  }, [featureLabel])

  const handleDownloadHtml = useCallback(() => {
    const content = paperRef.current?.innerHTML
    if (!content) return
    const blob = new Blob([printHTML(content, featureLabel)], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const el = window.document.createElement("a")
    el.href = url
    el.download = `cbc-${featureLabel.toLowerCase().replace(/\s+/g, "-")}.html`
    el.click()
    URL.revokeObjectURL(url)
  }, [featureLabel])

  const handleDownloadDocx = useCallback(() => {
    const content = paperRef.current?.innerHTML
    if (!content) return
    const docxHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset="utf-8"><title>${featureLabel}</title>
<style>body{font-family:Calibri,sans-serif;max-width:794px;margin:40px auto;padding:0 20px;color:#111}h1{font-size:22pt;font-weight:700;text-align:center;margin-bottom:4pt}h2{font-size:14pt;font-weight:600;margin-top:16pt;margin-bottom:8pt}table{border-collapse:collapse;width:100%;margin:8pt 0;font-size:10pt}th,td{border:1px solid #999;padding:4pt 8pt;text-align:left}th{background:#f0f0f0}ul{padding-left:20pt}p{margin:4pt 0}hr{border:none;border-top:1px solid #ccc}.curriculum-grid{display:flex;flex-wrap:wrap;gap:4pt;margin:8pt 0}.curriculum-item{border:1px solid #ddd;padding:4pt 8pt;border-radius:4pt;flex:1 0 45%}@page{margin:2cm}@media print{body{margin:0}}</style></head>
<body>${content}</body></html>`
    const blob = new Blob([docxHtml], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const el = window.document.createElement("a")
    el.href = url
    el.download = `cbc-${featureLabel.toLowerCase().replace(/\s+/g, "-")}.doc`
    el.click()
    URL.revokeObjectURL(url)
  }, [featureLabel])

  const handleCopy = useCallback(() => {
    const text = paperRef.current?.textContent
    if (text) navigator.clipboard.writeText(text)
    onCopy?.()
  }, [onCopy])

  const COLLAPSE_THRESHOLD = 1200

  useEffect(() => {
    if (contentRef.current) {
      setNeedsCollapse(contentRef.current.scrollHeight > COLLAPSE_THRESHOLD)
    }
  }, [text])

  if (!text?.trim()) return null

  return (
    <div className="print-area">
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-4 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground/70">{featureLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          <ActionButton icon={Copy} label="Copy" onClick={handleCopy} />
          <ActionButton icon={Pencil} label="Edit" onClick={onEdit} />
          <ActionButton icon={RotateCcwIcon} label="Regenerate" onClick={onRegenerate} disabled={isProcessing} />
          <span className="mx-2 h-5 w-px bg-white/[0.08]" />
          <ActionButton icon={Printer} label="Print" onClick={handlePrint} />
          <ActionButton icon={FileDown} label="PDF" onClick={handlePdf} />
          <ActionButton icon={FileText} label="DOCX" onClick={handleDownloadDocx} />
          <ActionButton icon={Download} label="HTML" onClick={handleDownloadHtml} />
        </div>
      </div>

      {/* White Paper */}
      <div
        ref={paperRef}
        className="mx-auto max-w-[850px] rounded-2xl border border-border/30 bg-white shadow-xl dark:bg-white transition-all duration-300"
        style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
      >
        <div ref={contentRef} className={`px-10 py-8 sm:px-14 sm:py-10 text-gray-900 transition-all duration-300 ${!expanded && needsCollapse ? 'max-h-[1000px] overflow-hidden relative' : ''}`}>
          {!expanded && needsCollapse && (
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
          )}
          <div className={`${!expanded && needsCollapse ? 'space-y-0' : ''}`}>
            <DocumentHeader title={featureLabel} />
            <CurriculumInfoCard info={document.curriculumInfo} />
            {document.sections.map((section, idx) => (
              <SectionCard key={idx} section={section} />
            ))}
            <DocumentFooter />
          </div>
        </div>
        {needsCollapse && (
          <div className="flex justify-center pb-5 print:hidden">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-card/40 px-5 py-2 text-sm font-medium text-primary/80 hover:text-primary hover:bg-card/60 transition-all"
            >
              {expanded ? <>Show Less <ChevronUp className="h-4 w-4" /></> : <>Show More <ChevronDown className="h-4 w-4" /></>}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body { margin: 0; padding: 0; background: white; }
          .print-area { margin: 0 !important; }
          .print-area > :first-child { display: none !important; }
          .sidebar, .settings-panel, .toolbar, [class*="sidebar"],
          button, .follow-up-area, .history-panel { display: none !important; }
          .print-area [class*="rounded-2xl"] {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
          }
          table { page-break-inside: avoid; }
          h1, h2, h3 { page-break-after: avoid; }
          .print-area .overflow-hidden { overflow: visible !important; max-height: none !important; }
          .print-area [class*="max-h-"] { max-height: none !important; overflow: visible !important; }
          .print-area .from-white { display: none !important; }
          .print-area button { display: none !important; }
          .print-area .px-8, .print-area .px-10, .print-area .px-14 { padding: 0 !important; }
          .print-area .py-6, .print-area .py-8, .print-area .py-10 { padding-top: 0 !important; padding-bottom: 0 !important; }
          @page { margin: 2cm; size: A4; }
        }
      `}</style>
    </div>
  )
}

function ActionButton({ icon: Icon, label, onClick, disabled }: { icon: typeof Copy; label: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/60 hover:text-foreground hover:bg-card/50 transition-all disabled:opacity-30 disabled:pointer-events-none"
      title={label}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

function printHTML(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  @page { margin: 2cm; size: A4; }
  * { box-sizing: border-box; }

  /* Prevent browser from fading/lightening text on print */
  html, *, *::before, *::after {
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }

  /* Force solid white background and black text at root */
  html {
    background: #fff !important;
    color: #000 !important;
  }

  /* Disable all transitions and animations during printing */
  *, *::before, *::after {
    transition: none !important;
    animation: none !important;
    animation-duration: 0s !important;
    transition-duration: 0s !important;
  }

  /* Reset all problematic visual properties */
  *, *::before, *::after {
    opacity: 1 !important;
    filter: none !important;
    -webkit-filter: none !important;
    mix-blend-mode: normal !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  /* CSS custom properties for print (light mode) */
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 6%;
    --muted-foreground: 0 0% 20%;
    --primary: 217 91% 40%;
    --card: 0 0% 100%;
    --border: 0 0% 80%;
    --muted: 0 0% 90%;
    --secondary: 0 0% 85%;
    --accent: 0 0% 88%;
    --popover: 0 0% 100%;
    --card-foreground: 0 0% 6%;
    --secondary-foreground: 0 0% 6%;
    --accent-foreground: 0 0% 6%;
    --destructive: 0 70% 40%;
    --destructive-foreground: 0 0% 100%;
    --input: 0 0% 80%;
    --ring: 217 91% 40%;
    --radius: 0.5rem;
  }

  body {
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    font-size: 12pt;
    line-height: 1.75;
    color: #000 !important;
    max-width: 850px;
    margin: 0 auto;
    padding: 30px;
    background: #fff !important;
  }
  h1 { font-size: 24pt; font-weight: 700; text-align: center; margin-bottom: 8pt; color: #000 !important; }
  h2 { font-size: 16pt; font-weight: 700; margin-top: 20pt; margin-bottom: 10pt; color: #000 !important; }
  h3 { color: #000 !important; }
  h4, h5, h6 { color: #000 !important; }
  p { margin: 6pt 0; line-height: 1.75; color: #000 !important; }
  table { border-collapse: collapse; width: 100%; margin: 10pt 0; font-size: 12pt; }
  th, td { border: 1px solid #bbb; padding: 6pt 10pt; text-align: left; vertical-align: top; line-height: 1.7; color: #000 !important; }
  th { background: #f5f5f5; font-weight: 700; }
  ul { padding-left: 22pt; margin: 6pt 0; }
  li { margin-bottom: 4pt; line-height: 1.7; color: #000 !important; }
  hr { border: none; border-top: 1px solid #ccc; margin: 16pt 0; }
  label, small, pre, blockquote, figcaption, caption, legend, summary, mark, ins, del, sub, sup {
    color: #000 !important;
  }

  /* Override all Tailwind text color classes to solid black */
  [class*="text-foreground"],
  [class*="text-muted-foreground"],
  [class*="text-primary"],
  [class*="text-secondary"],
  [class*="text-card-foreground"],
  [class*="text-popover"],
  [class*="text-accent"],
  [class*="text-destructive"],
  [class*="text-gray"],
  [class*="text-white"],
  [class*="text-black"],
  [class*="text-slate"],
  [class*="text-zinc"],
  [class*="text-neutral"],
  [class*="text-stone"],
  [class*="text-red"],
  [class*="text-blue"],
  [class*="text-green"],
  [class*="text-yellow"],
  [class*="text-indigo"],
  [class*="text-purple"],
  [class*="text-pink"],
  [class*="text-amber"],
  [class*="text-teal"],
  [class*="text-cyan"],
  [class*="text-emerald"],
  [class*="text-orange"],
  [class*="text-violet"],
  [class*="text-rose"],
  [class*="text-sky"],
  [class*="text-lime"],
  [class*="text-fuchsia"],
  [class*="text-current"],
  [class*="text-inherit"] {
    color: #000 !important;
  }

  /* Override element-specific text colors */
  span, div, strong, em, code, a, b, i, u, s {
    color: #000 !important;
  }
  a { text-decoration: underline; }

  /* Make all backgrounds transparent/white for print */
  [class*="bg-card"],
  [class*="bg-primary"],
  [class*="bg-muted"],
  [class*="bg-secondary"],
  [class*="bg-accent"],
  [class*="bg-popover"],
  [class*="bg-destructive"],
  [class*="bg-background"],
  [class*="bg-white"],
  [class*="bg-black"],
  [class*="bg-transparent"],
  [class*="bg-blue"],
  [class*="bg-emerald"],
  [class*="bg-amber"],
  [class*="bg-rose"],
  [class*="bg-teal"],
  [class*="bg-indigo"],
  [class*="bg-orange"],
  [class*="bg-sky"],
  [class*="bg-violet"],
  [class*="bg-red"],
  [class*="bg-cyan"],
  [class*="bg-pink"],
  [class*="bg-slate"],
  [class*="bg-gray"],
  [class*="bg-green"],
  [class*="bg-yellow"],
  [class*="bg-purple"],
  [class*="bg-lime"],
  [class*="bg-fuchsia"],
  [class*="bg-stone"],
  [class*="bg-zinc"],
  [class*="bg-neutral"],
  [class*="bg-gradient"] {
    background: transparent !important;
  }

  /* Borders for print */
  [class*="border-border"],
  [class*="border-gray"],
  [class*="border-white"],
  [class*="border-black"],
  [class*="border-slate"],
  [class*="border-zinc"],
  [class*="border-neutral"],
  [class*="border-stone"],
  [class*="border-red"],
  [class*="border-blue"],
  [class*="border-green"],
  [class*="border-yellow"],
  [class*="border-indigo"],
  [class*="border-purple"],
  [class*="border-pink"],
  [class*="border-amber"],
  [class*="border-teal"],
  [class*="border-cyan"],
  [class*="border-emerald"],
  [class*="border-orange"],
  [class*="border-violet"],
  [class*="border-rose"],
  [class*="border-sky"],
  [class*="border-lime"],
  [class*="border-fuchsia"] {
    border-color: #ccc !important;
  }

  /* Remove opacity modifiers */
  [class*="/"],
  [style*="opacity"] {
    opacity: 1 !important;
  }

  /* Force all gradient backgrounds to be transparent */
  [class*="from-"],
  [class*="via-"],
  [class*="to-"] {
    background: transparent !important;
  }

  .curriculum-grid { display: flex; flex-wrap: wrap; gap: 6pt; margin: 8pt 0; }
  .curriculum-item { border: 1px solid #ddd; padding: 4pt 8pt; border-radius: 4pt; flex: 1 0 45%; }
  .chip-list { display: flex; flex-wrap: wrap; gap: 4pt; }
  .chip { border: 1px solid #ddd; padding: 2pt 8pt; border-radius: 4pt; font-size: 10pt; background: #fafafa; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  ${content}
</body>
</html>`
}

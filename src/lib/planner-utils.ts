import type { KICDPlan, VerseSuggestion, WeeklyPlan, DayKey } from "./planner-types"
import {
  STRAND_FALLBACK_OUTCOMES,
  VERSE_MAP_BY_STRAND,
  VERSE_MAP_BY_SUBSTRAND,
  VERSE_MAP_BY_VALUE,
  BIBLE_VERSES,
} from "./planner-data"

export function getSmartFallbackOutcomes(strand: string): string[] {
  const fallback = STRAND_FALLBACK_OUTCOMES[strand]
  if (fallback) return [...fallback]
  return [
    `Learners demonstrate understanding of key concepts in ${strand.toLowerCase()}`,
    `Learners apply ${strand.toLowerCase()} knowledge in real-life situations`,
    `Learners develop critical thinking skills through ${strand.toLowerCase()} activities`,
  ]
}

export function createEmptyPlan(): KICDPlan {
  return {
    grade: "", learningArea: "", strand: "", subStrand: "",
    lessonNumber: "", duration: "",
    schoolName: "", teacherName: "", lessonDate: "", term: "", week: "", topicTitle: "",
    outcomes: [],
    successCriteria: [],
    keyInquiryQuestion: "",
    competencies: [], values: [], pcis: [],
    teacherActivities: [], learnerActivities: [],
    resources: [], assessmentMethods: [], remarks: "",
    lessonDevelopment: "",
    customGrades: [], customLearningAreas: [], customStrands: [], customSubStrands: [],
  }
}

export function computeComplianceScore(plan: KICDPlan): number {
  return Math.min(100, [
    !!plan.grade ? 8 : 0,
    !!plan.learningArea ? 8 : 0,
    !!plan.strand ? 12 : 0,
    !!plan.subStrand ? 10 : 0,
    plan.outcomes.length >= 2 ? 12 : 0,
    plan.successCriteria.length >= 1 ? 6 : 0,
    !!plan.keyInquiryQuestion ? 6 : 0,
    plan.competencies.length >= 2 ? 8 : 0,
    plan.values.length >= 2 ? 6 : 0,
    plan.pcis.length >= 1 ? 6 : 0,
    plan.assessmentMethods.length >= 2 ? 8 : 0,
    !!plan.lessonDevelopment ? 6 : 0,
    !!plan.remarks ? 4 : 0,
  ].reduce((a, b) => a + b, 0))
}

export function suggestVerseForLesson(
  strand: string,
  subStrand: string,
  selectedValues: string[],
): { suggestion?: VerseSuggestion; matchSource: string } {
  let suggestion: VerseSuggestion | undefined
  let matchSource = "strand"

  if (strand && VERSE_MAP_BY_STRAND[strand]) {
    suggestion = VERSE_MAP_BY_STRAND[strand]
  }

  if (!suggestion && subStrand && VERSE_MAP_BY_SUBSTRAND[subStrand]) {
    suggestion = VERSE_MAP_BY_SUBSTRAND[subStrand]
    matchSource = "sub-strand"
  }

  if (!suggestion && selectedValues.length > 0) {
    for (const val of selectedValues) {
      if (VERSE_MAP_BY_VALUE[val]) {
        suggestion = VERSE_MAP_BY_VALUE[val]
        matchSource = "value"
        break
      }
    }
  }

  if (!suggestion) {
    const fallback = BIBLE_VERSES.find((v) => v.ref === "Proverbs 1:7") || BIBLE_VERSES[0]
    suggestion = {
      verseRef: fallback.ref,
      connection: "This lesson reinforces the pursuit of knowledge and wisdom as foundational to learning.",
      explanation: fallback.explanation,
    }
    matchSource = "fallback"
  }

  return { suggestion, matchSource }
}

export function formatPlan(
  p: KICDPlan,
  biblicalVerseEnabled: boolean,
  biblicalVerse: string,
  teacherReflectionNotes: string,
  curriculumConnection: string,
  verseExplanation: string,
  includeNotesInExport: boolean,
  teacherPrivateNotes: string,
): string {
  const info: string[] = []
  if (p.schoolName) info.push(`School: ${p.schoolName}`)
  if (p.teacherName) info.push(`Teacher: ${p.teacherName}`)
  if (p.lessonDate) info.push(`Date: ${p.lessonDate}`)
  if (p.term || p.week) info.push(`Term & Week: ${p.term || "\u2014"} / Week ${p.week || "\u2014"}`)
  if (p.topicTitle) info.push(`Topic: ${p.topicTitle}`)
  info.push(
    `Grade: ${p.grade}`,
    `Learning Area: ${p.learningArea}`,
    `Strand: ${p.strand}`,
    `Sub-Strand: ${p.subStrand || "\u2014"}`,
    `Lesson Number: ${p.lessonNumber}`,
    `Duration: ${p.duration} minutes`,
  )

  function ld(): string[] {
    if (!p.lessonDevelopment) return ["   \u2014"]
    return p.lessonDevelopment.split("\n").filter(l => l.trim()).map((l) => {
      const t = l.trim()
      if (/^(Introduction|Lesson Development|Conclusion)/i.test(t)) return `\n   ${t}`
      return `   ${t}`
    })
  }

  const lines = [
    "KICD COMPETENCY-BASED LESSON PLAN",
    "=".repeat(50),
    ...info,
    "",
    "1. LEARNING OUTCOMES",
    ...p.outcomes.map((o) => `   \u2022 ${o}`),
    "",
    "2. SUCCESS CRITERIA",
    ...(p.successCriteria.length ? p.successCriteria.map((s) => `   \u2022 ${s}`) : ["   \u2014"]),
    "",
    "3. KEY INQUIRY QUESTION",
    `   ${p.keyInquiryQuestion || "\u2014"}`,
    "",
    "4. CORE COMPETENCIES",
    ...(p.competencies.length ? p.competencies.map((c) => `   \u2022 ${c}`) : ["   \u2014"]),
    "",
    "5. VALUES",
    ...(p.values.length ? p.values.map((v) => `   \u2022 ${v}`) : ["   \u2014"]),
    "",
    "6. PERTINENT AND CONTEMPORARY ISSUES (PCIs)",
    ...(p.pcis.length ? p.pcis.map((pc) => `   \u2022 ${pc}`) : ["   \u2014"]),
    "",
    "7. LEARNING RESOURCES",
    ...p.resources.map((r) => `   \u2022 ${r}`),
    "",
    "8. LESSON DEVELOPMENT",
    ...ld(),
    "",
    "9. ASSESSMENT",
    ...p.assessmentMethods.map((a) => `   \u2022 ${a}`),
    "",
    "10. REFLECTION",
    `   ${p.remarks || "\u2014"}`,
  ]

  if (includeNotesInExport && teacherPrivateNotes.trim()) {
    lines.push("", "TEACHER NOTES (PRIVATE)", `   ${teacherPrivateNotes}`)
  }

  return lines.join("\n")
}

export function formatPlanHTML(
  p: KICDPlan,
  _biblicalVerseEnabled: boolean,
  _biblicalVerse: string,
  _teacherReflectionNotes: string,
  _curriculumConnection: string,
  _verseExplanation: string,
  includeNotesInExport: boolean,
  teacherPrivateNotes: string,
): string {
  function lessonDevHtml(): string {
    if (!p.lessonDevelopment) return "<p>\u2014</p>"
    const lines = p.lessonDevelopment.split("\n").filter(l => l.trim())
    return `<div style="font-size:13px;line-height:1.7;margin:8px 0">${lines.map((l) => {
      const t = l.trim()
      const isPhase = /^(Introduction|Lesson Development|Conclusion)/i.test(t)
      return isPhase
        ? `<p style="font-weight:700;margin:10px 0 4px;font-size:13px">${t}</p>`
        : `<p style="margin:4px 0;text-align:justify">${t}</p>`
    }).join("")}</div>`
  }

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>KICD Lesson Plan</title>
<style>
  body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#222;line-height:1.5}
  h1{text-align:center;font-size:17px;margin-bottom:2px}
  hr{border:none;border-top:1px solid #999;margin:10px 0}
  .meta{display:grid;grid-template-columns:1fr 1fr;gap:2px 20px;font-size:12px;margin:10px 0}
  h2{font-size:13px;margin:12px 0 4px;border-bottom:1px solid #ddd;padding-bottom:2px}
  ul{margin:2px 0;padding-left:18px}
  li{font-size:12px;margin:1px 0}
  .footer{margin-top:16px;text-align:center;font-size:10px;color:#aaa}
</style></head><body>
<h1>KICD COMPETENCY-BASED LESSON PLAN</h1>
<hr>
<div class="meta">
  ${p.schoolName ? `<div><b>School:</b> ${p.schoolName}</div>` : ""}
  ${p.teacherName ? `<div><b>Teacher:</b> ${p.teacherName}</div>` : ""}
  ${p.lessonDate ? `<div><b>Date:</b> ${p.lessonDate}</div>` : ""}
  ${p.term || p.week ? `<div><b>Term &amp; Week:</b> ${p.term || "\u2014"} / Week ${p.week || "\u2014"}</div>` : ""}
  ${p.topicTitle ? `<div><b>Topic:</b> ${p.topicTitle}</div>` : ""}
  <div><b>Grade:</b> ${p.grade}</div>
  <div><b>Learning Area:</b> ${p.learningArea}</div>
  <div><b>Strand:</b> ${p.strand}</div>
  <div><b>Sub-Strand:</b> ${p.subStrand || "\u2014"}</div>
  <div><b>Lesson No:</b> ${p.lessonNumber}</div>
  <div><b>Duration:</b> ${p.duration} min</div>
</div>
<h2>1. Learning Outcomes</h2>
<ul>${p.outcomes.map((o) => `<li>${o}</li>`).join("")}</ul>
<h2>2. Success Criteria</h2>
${p.successCriteria.length ? `<ul>${p.successCriteria.map((s) => `<li>${s}</li>`).join("")}</ul>` : "<p>\u2014</p>"}
<h2>3. Key Inquiry Question</h2>
<p>${p.keyInquiryQuestion || "\u2014"}</p>
<h2>4. Core Competencies</h2>
${p.competencies.length ? `<ul>${p.competencies.map((c) => `<li>${c}</li>`).join("")}</ul>` : "<p>\u2014</p>"}
<h2>5. Values</h2>
${p.values.length ? `<ul>${p.values.map((v) => `<li>${v}</li>`).join("")}</ul>` : "<p>\u2014</p>"}
<h2>6. Pertinent and Contemporary Issues (PCIs)</h2>
${p.pcis.length ? `<ul>${p.pcis.map((pc) => `<li>${pc}</li>`).join("")}</ul>` : "<p>\u2014</p>"}
<h2>7. Learning Resources</h2>
<ul>${p.resources.map((r) => `<li>${r}</li>`).join("")}</ul>
<h2>8. Lesson Development</h2>
${lessonDevHtml()}
<h2>9. Assessment</h2>
${p.assessmentMethods.length ? `<ul>${p.assessmentMethods.map((a) => `<li>${a}</li>`).join("")}</ul>` : "<p>\u2014</p>"}
<h2>10. Reflection</h2>
<p>${p.remarks || "\u2014"}</p>
${includeNotesInExport && teacherPrivateNotes.trim() ? `
<h2 style="color:#888">Teacher Notes (Private)</h2>
<p style="font-size:12px;color:#888;white-space:pre-wrap">${teacherPrivateNotes}</p>
` : ""}
<div class="footer">Generated by Zilita CBC Lesson Planner</div>
</body></html>`
}

export function generatePDF(
  plan: KICDPlan,
  weeklyMode: boolean,
  weeklyPlans: WeeklyPlan,
  _biblicalVerseEnabled: boolean,
  _biblicalVerse: string,
  _teacherReflectionNotes: string,
  _curriculumConnection: string,
  _verseExplanation: string,
  includeNotesInExport: boolean,
  teacherPrivateNotes: string,
  trackDownload: (category: string, action: string) => void,
  toastSuccess: (msg: string) => void,
  toastError: (msg: string) => void,
) {
  const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const

  const PAGE_HEIGHT = 297
  const MARGIN_TOP = 22
  const MARGIN_BOTTOM = 20
  const MARGIN_LEFT = 20
  const MARGIN_RIGHT = 20
  const LH = 6

  function writePlan(doc: any, p: KICDPlan, dayTitle?: string) {
    let y = MARGIN_TOP
    const pw = doc.internal.pageSize.getWidth()
    const mw = pw - MARGIN_LEFT - MARGIN_RIGHT

    function cp(n: number) { if (y + n > PAGE_HEIGHT - MARGIN_BOTTOM) { doc.addPage(); y = MARGIN_TOP } }

    function wl(text: string, sz = 10, bold = false, indent = 0) {
      const lines = doc.splitTextToSize(text, mw - indent)
      cp(lines.length * LH)
      lines.forEach((l: string) => {
        if (y > PAGE_HEIGHT - MARGIN_BOTTOM) { doc.addPage(); y = MARGIN_TOP }
        doc.setFontSize(sz)
        doc.setFont("helvetica", bold ? "bold" : "normal")
        doc.text(l, MARGIN_LEFT + indent, y)
        y += LH
      })
    }

    function bul(t: string, items: string[]) {
      if (items.length === 0) return
      cp(LH * 2)
      wl(t, 10, true)
      items.forEach((item) => {
        const wrapped = doc.splitTextToSize(`   \u2022 ${item}`, mw)
        cp(wrapped.length * LH)
        wrapped.forEach((l: string) => {
          if (y > PAGE_HEIGHT - MARGIN_BOTTOM) { doc.addPage(); y = MARGIN_TOP }
          doc.setFontSize(9)
          doc.setFont("helvetica", "normal")
          doc.text(l, MARGIN_LEFT, y)
          y += LH
        })
      })
      y += 1
    }

    if (dayTitle) { wl(dayTitle.toUpperCase(), 12, true); y += 1 }

    wl("REPUBLIC OF KENYA", 10, true)
    wl("KICD COMPETENCY-BASED LESSON PLAN", 11, true)
    y += 2

    const fields: [string, string][] = [
      ...(p.schoolName ? [["School", p.schoolName] as [string, string]] : []),
      ...(p.teacherName ? [["Teacher", p.teacherName] as [string, string]] : []),
      ...(p.lessonDate ? [["Date", p.lessonDate] as [string, string]] : []),
      ...(p.term || p.week ? [["Term & Week", `${p.term || "\u2014"} / Week ${p.week || "\u2014"}`] as [string, string]] : []),
      ...(p.topicTitle ? [["Topic", p.topicTitle] as [string, string]] : []),
      ["Grade", p.grade],
      ["Learning Area", p.learningArea],
      ["Strand", p.strand],
      ["Sub-Strand", p.subStrand || "\u2014"],
      ["Lesson No", p.lessonNumber],
      ["Duration", `${p.duration} min`],
    ]
    fields.forEach(([l, v]) => { wl(`${l}: ${v || "\u2014"}`, 9) })
    y += 2

    bul("1. Learning Outcomes", p.outcomes)

    if (p.successCriteria.length) bul("2. Success Criteria", p.successCriteria)

    cp(LH * 2)
    wl("3. Key Inquiry Question", 10, true)
    wl(`   ${p.keyInquiryQuestion || "\u2014"}`, 9)
    y += 1

    bul("4. Core Competencies", p.competencies)
    bul("5. Values", p.values)
    bul("6. Pertinent and Contemporary Issues (PCIs)", p.pcis)
    bul("7. Learning Resources", p.resources)

    if (p.lessonDevelopment.trim()) {
      cp(LH * 3)
      wl("8. Lesson Development", 10, true)
      p.lessonDevelopment.split("\n").filter(l => l.trim()).forEach((line) => {
        const t = line.trim()
        if (/^(Introduction|Lesson Development|Conclusion)/i.test(t)) {
          cp(LH * 2)
          wl(`   ${t}`, 9, true)
        } else {
          const wrapped = doc.splitTextToSize(`   ${t}`, mw)
          cp(wrapped.length * LH)
          wrapped.forEach((l: string) => {
            if (y > PAGE_HEIGHT - MARGIN_BOTTOM) { doc.addPage(); y = MARGIN_TOP }
            doc.setFontSize(9)
            doc.setFont("helvetica", "normal")
            doc.text(l, MARGIN_LEFT, y)
            y += LH
          })
        }
      })
      y += 2
    }

    bul("9. Assessment", p.assessmentMethods)

    cp(LH * 2)
    wl("10. Reflection", 10, true)
    wl(`   ${p.remarks || "\u2014"}`, 9)
    y += 2

    if (includeNotesInExport && teacherPrivateNotes.trim()) {
      cp(LH * 3)
      wl("Teacher Notes (Private)", 10, true)
      const noteLines = doc.splitTextToSize(`   ${teacherPrivateNotes}`, mw)
      cp(noteLines.length * LH)
      noteLines.forEach((l: string) => {
        if (y > PAGE_HEIGHT - MARGIN_BOTTOM) { doc.addPage(); y = MARGIN_TOP }
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        doc.text(l, MARGIN_LEFT, y)
        y += LH
      })
      y += 2
    }

    y += 4
  }

  const generate = async () => {
    if (!plan.grade && !weeklyMode) { toastError("Please complete the lesson before exporting to PDF."); return }
    if (weeklyMode) { if (!Object.values(weeklyPlans).some((p) => p.grade)) { toastError("Please complete at least one day before exporting to PDF."); return } }

    try {
      const { default: jsPDF } = await import("jspdf")
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

      if (weeklyMode) { DAY_LABELS.forEach((day, i) => { if (i > 0) doc.addPage(); writePlan(doc, weeklyPlans[day.toLowerCase() as DayKey], day) }) }
      else { writePlan(doc, plan) }

      doc.save(weeklyMode ? "cbc-weekly-lesson-plans.pdf" : "cbc-lesson-plan.pdf")
      trackDownload("cbc_lesson_planner", "download_pdf")
      toastSuccess("PDF downloaded")
    } catch { toastError("Failed to generate PDF") }
  }

  return generate()
}

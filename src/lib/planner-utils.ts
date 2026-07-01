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
    competencies: [], values: [], pcis: [],
    teacherActivities: [], learnerActivities: [],
    resources: [], assessmentMethods: [], remarks: "",
    customGrades: [], customLearningAreas: [], customStrands: [], customSubStrands: [],
  }
}

export function computeComplianceScore(plan: KICDPlan): number {
  return Math.min(100, [
    !!plan.grade ? 8 : 0,
    !!plan.learningArea ? 8 : 0,
    !!plan.strand ? 12 : 0,
    !!plan.subStrand ? 10 : 0,
    plan.outcomes.length >= 2 ? 15 : 0,
    plan.competencies.length >= 2 ? 10 : 0,
    plan.values.length >= 2 ? 8 : 0,
    plan.pcis.length >= 1 ? 8 : 0,
    plan.teacherActivities.length >= 2 ? 6 : 0,
    plan.learnerActivities.length >= 2 ? 6 : 0,
    plan.assessmentMethods.length >= 2 ? 5 : 0,
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
  const meta: string[] = []
  if (p.schoolName) meta.push(`School: ${p.schoolName}`)
  if (p.teacherName) meta.push(`Teacher: ${p.teacherName}`)
  if (p.lessonDate) meta.push(`Date: ${p.lessonDate}`)
  if (p.term || p.week) meta.push(`Term & Week: ${p.term || "\u2014"} / Week ${p.week || "\u2014"}`)
  if (p.topicTitle) meta.push(`Topic: ${p.topicTitle}`)

  const lines = [
    "KICD COMPETENCY-BASED LESSON PLAN",
    "=".repeat(50),
    ...meta,
    "",
    `Grade: ${p.grade}`,
    `Learning Area: ${p.learningArea}`,
    `Strand: ${p.strand}`,
    `Sub-Strand: ${p.subStrand || "\u2014"}`,
    `Lesson Number: ${p.lessonNumber}`,
    `Duration: ${p.duration} minutes`,
    "",
    "1. SPECIFIC LEARNING OUTCOMES",
    ...p.outcomes.map((o) => `   \u2022 ${o}`),
    "",
    "2. CORE COMPETENCIES",
    ...(p.competencies.length ? p.competencies.map((c) => `   \u2022 ${c}`) : ["   \u2014"]),
    "",
    "3. VALUES",
    ...(p.values.length ? p.values.map((v) => `   \u2022 ${v}`) : ["   \u2014"]),
    "",
    "4. PERTINENT & CONTEMPORARY ISSUES (PCIs)",
    ...(p.pcis.length ? p.pcis.map((pc) => `   \u2022 ${pc}`) : ["   \u2014"]),
    "",
    "5. LEARNING ACTIVITIES",
    "   Teacher Activities:",
    ...p.teacherActivities.map((a) => `      \u2022 ${a}`),
    "   Learner Activities:",
    ...p.learnerActivities.map((a) => `      \u2022 ${a}`),
    "",
    "6. RESOURCES",
    ...p.resources.map((r) => `   \u2022 ${r}`),
    "",
    "7. ASSESSMENT METHODS",
    ...p.assessmentMethods.map((a) => `   \u2022 ${a}`),
    "",
    "8. REMARKS",
    `   ${p.remarks || "\u2014"}`,
  ]

  if (biblicalVerseEnabled && biblicalVerse) {
    lines.push("", "9. BIBLICAL REFLECTION (Optional)")
    const verseRef = biblicalVerse.split(" — ")[0]
    const verseText = biblicalVerse.split(" — ").slice(1).join(" — ")
    lines.push(`   Reference: ${verseRef}`)
    lines.push(`   Verse: "${verseText}"`)
    if (curriculumConnection) lines.push(`   Curriculum Connection: ${curriculumConnection}`)
    if (verseExplanation) lines.push(`   Verse Explanation: ${verseExplanation}`)
    if (teacherReflectionNotes) lines.push(`   Teacher Reflection: ${teacherReflectionNotes}`)
  }

  if (includeNotesInExport && teacherPrivateNotes.trim()) {
    lines.push("", "TEACHER NOTES (PRIVATE)", `   ${teacherPrivateNotes}`)
  }

  return lines.join("\n")
}

export function formatPlanHTML(
  p: KICDPlan,
  biblicalVerseEnabled: boolean,
  biblicalVerse: string,
  teacherReflectionNotes: string,
  curriculumConnection: string,
  verseExplanation: string,
  includeNotesInExport: boolean,
  teacherPrivateNotes: string,
): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>KICD Lesson Plan</title>
<style>
  body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#222;line-height:1.6}
  h1{text-align:center;font-size:18px;margin-bottom:4px}
  hr{border:none;border-top:2px solid #333;margin:12px 0}
  .meta{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;font-size:13px;margin:12px 0}
  .meta b{display:inline-block;min-width:100px}
  h2{font-size:14px;margin:16px 0 6px;border-bottom:1px solid #ccc;padding-bottom:4px}
  ul{margin:4px 0;padding-left:20px}
  li{font-size:13px;margin:2px 0}
  .activities{margin:8px 0}
  .activities .group{font-weight:700;font-size:13px;margin:6px 0 2px}
  .tag{display:inline-block;padding:1px 10px;border-radius:12px;font-size:11px;margin:2px 4px 2px 0}
  .comp{background:#e0e7ff;color:#4338ca}
  .val{background:#dcfce7;color:#16a34a}
  .pci{background:#f3e8ff;color:#9333ea}
  .footer{margin-top:20px;text-align:center;font-size:11px;color:#888}
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
<h2>1. Specific Learning Outcomes</h2>
<ul>${p.outcomes.map((o) => `<li>${o}</li>`).join("")}</ul>
<h2>2. Core Competencies</h2>
${p.competencies.length ? p.competencies.map((c) => `<span class="tag comp">${c}</span>`).join("") : "\u2014"}
<h2>3. Values</h2>
${p.values.length ? p.values.map((v) => `<span class="tag val">${v}</span>`).join("") : "\u2014"}
<h2>4. PCIs</h2>
${p.pcis.length ? p.pcis.map((pc) => `<span class="tag pci">${pc}</span>`).join("") : "\u2014"}
<h2>5. Learning Activities</h2>
<div class="activities">
  <div class="group">Teacher Activities:</div>
  <ul>${p.teacherActivities.map((a) => `<li>${a}</li>`).join("")}</ul>
  <div class="group">Learner Activities:</div>
  <ul>${p.learnerActivities.map((a) => `<li>${a}</li>`).join("")}</ul>
</div>
<h2>6. Resources</h2>
<ul>${p.resources.map((r) => `<li>${r}</li>`).join("")}</ul>
<h2>7. Assessment Methods</h2>
<ul>${p.assessmentMethods.map((a) => `<li>${a}</li>`).join("")}</ul>
<h2>8. Remarks</h2>
<p>${p.remarks || "\u2014"}</p>
${biblicalVerseEnabled && biblicalVerse ? `
<h2 style="color:#b45309">9. Biblical Reflection (Optional)</h2>
<p style="font-weight:bold;font-size:13px;color:#92400e">${biblicalVerse.split(" — ")[0]}</p>
<p style="font-style:italic;color:#b45309">"${biblicalVerse.split(" — ").slice(1).join(" — ")}"</p>
${curriculumConnection ? `<p style="font-size:11px;color:#92400e;background:#fef3c7;padding:6px;border-radius:4px;margin:6px 0"><strong>Curriculum Connection:</strong> ${curriculumConnection}</p>` : ""}
${verseExplanation ? `<p style="font-style:italic;font-size:11px;color:#92400e">${verseExplanation}</p>` : ""}
${teacherReflectionNotes ? `<p style="font-style:italic;font-size:12px;color:#92400e;margin-top:4px">— ${teacherReflectionNotes}</p>` : ""}
` : ""}
${includeNotesInExport && teacherPrivateNotes.trim() ? `
<h2 style="color:#888">Teacher Notes (Private)</h2>
<p style="font-size:12px;color:#888;white-space:pre-wrap">${teacherPrivateNotes}</p>
` : ""}
<div class="footer">Generated by ToolForge CBC Lesson Planner</div>
</body></html>`
}

export function generatePDF(
  plan: KICDPlan,
  weeklyMode: boolean,
  weeklyPlans: WeeklyPlan,
  biblicalVerseEnabled: boolean,
  biblicalVerse: string,
  teacherReflectionNotes: string,
  curriculumConnection: string,
  verseExplanation: string,
  includeNotesInExport: boolean,
  teacherPrivateNotes: string,
  trackDownload: (category: string, action: string) => void,
  toastSuccess: (msg: string) => void,
  toastError: (msg: string) => void,
) {
  const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const

  const PAGE_HEIGHT = 297
  const MARGIN_TOP = 25
  const MARGIN_BOTTOM = 25
  const MARGIN_LEFT = 22
  const MARGIN_RIGHT = 22
  const LINE_HEIGHT = 6.5

  function writePlan(doc: any, p: KICDPlan, dayTitle?: string) {
    let y = MARGIN_TOP
    const pageWidth = doc.internal.pageSize.getWidth()
    const maxWidth = pageWidth - MARGIN_LEFT - MARGIN_RIGHT

    function checkPage(needed: number) {
      if (y + needed > PAGE_HEIGHT - MARGIN_BOTTOM) {
        doc.addPage()
        y = MARGIN_TOP
      }
    }

    function writeLine(text: string, size = 10, bold = false, indent = 0) {
      const lines = doc.splitTextToSize(text, maxWidth - indent)
      checkPage(lines.length * LINE_HEIGHT)
      lines.forEach((l: string) => {
        if (y > PAGE_HEIGHT - MARGIN_BOTTOM) { doc.addPage(); y = MARGIN_TOP }
        doc.setFontSize(size)
        doc.setFont("helvetica", bold ? "bold" : "normal")
        doc.text(l, MARGIN_LEFT + indent, y)
        y += LINE_HEIGHT
      })
    }

    function writeBulletSection(title: string, items: string[], bulletPrefix = "\u2022") {
      if (items.length === 0) return
      checkPage(LINE_HEIGHT * 2)
      writeLine(title, 10, true)
      items.forEach((item) => {
        const wrapped = doc.splitTextToSize(`   ${bulletPrefix} ${item}`, maxWidth)
        checkPage(wrapped.length * LINE_HEIGHT)
        wrapped.forEach((l: string) => {
          if (y > PAGE_HEIGHT - MARGIN_BOTTOM) { doc.addPage(); y = MARGIN_TOP }
          doc.setFontSize(9.5)
          doc.setFont("helvetica", "normal")
          doc.text(l, MARGIN_LEFT, y)
          y += LINE_HEIGHT
        })
      })
      y += 2
    }

    // ── Day title (weekly mode) ──
    if (dayTitle) {
      writeLine(dayTitle.toUpperCase(), 13, true)
      y += 1
    }

    // ── Main title ──
    writeLine("REPUBLIC OF KENYA", 10, true)
    writeLine("KICD COMPETENCY-BASED LESSON PLAN", 12, true)
    y += 3

    // ── Lesson info fields ──
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
      ["Lesson Number", p.lessonNumber],
      ["Duration", `${p.duration} minutes`],
    ]
    fields.forEach(([label, value]) => {
      writeLine(`${label}: ${value || "\u2014"}`, 9.5, false)
    })
    y += 3

    // ── Section 1: Learning Outcomes ──
    writeBulletSection("1. Specific Learning Outcomes", p.outcomes)

    // ── Section 2: Core Competencies ──
    writeBulletSection("2. Core Competencies", p.competencies)

    // ── Section 3: Values ──
    writeBulletSection("3. Values", p.values)

    // ── Section 4: PCIs ──
    writeBulletSection("4. Pertinent & Contemporary Issues (PCIs)", p.pcis)

    // ── Section 5: Learning Activities ──
    checkPage(LINE_HEIGHT * 4)
    writeLine("5. Learning Activities", 10, true)
    writeLine("   Teacher Activities:", 9.5, true)
    if (p.teacherActivities.length > 0) {
      p.teacherActivities.forEach((a) => {
        const wrapped = doc.splitTextToSize(`      \u2022 ${a}`, maxWidth)
        checkPage(wrapped.length * LINE_HEIGHT)
        wrapped.forEach((l: string) => {
          if (y > PAGE_HEIGHT - MARGIN_BOTTOM) { doc.addPage(); y = MARGIN_TOP }
          doc.setFontSize(9.5)
          doc.setFont("helvetica", "normal")
          doc.text(l, MARGIN_LEFT, y)
          y += LINE_HEIGHT
        })
      })
    } else {
      writeLine("      \u2014", 9.5)
    }
    writeLine("   Learner Activities:", 9.5, true)
    if (p.learnerActivities.length > 0) {
      p.learnerActivities.forEach((a) => {
        const wrapped = doc.splitTextToSize(`      \u2022 ${a}`, maxWidth)
        checkPage(wrapped.length * LINE_HEIGHT)
        wrapped.forEach((l: string) => {
          if (y > PAGE_HEIGHT - MARGIN_BOTTOM) { doc.addPage(); y = MARGIN_TOP }
          doc.setFontSize(9.5)
          doc.setFont("helvetica", "normal")
          doc.text(l, MARGIN_LEFT, y)
          y += LINE_HEIGHT
        })
      })
    } else {
      writeLine("      \u2014", 9.5)
    }
    y += 2

    // ── Section 6: Resources ──
    writeBulletSection("6. Resources", p.resources)

    // ── Section 7: Assessment Methods ──
    writeBulletSection("7. Assessment Methods", p.assessmentMethods)

    // ── Section 8: Remarks ──
    checkPage(LINE_HEIGHT * 2)
    writeLine("8. Remarks", 10, true)
    writeLine(`   ${p.remarks || "\u2014"}`, 9.5)
    y += 2

    // ── Section 9: Biblical Reflection ──
    if (biblicalVerseEnabled && biblicalVerse) {
      checkPage(LINE_HEIGHT * 6)
      writeLine("9. Biblical Reflection (Optional)", 10, true)
      const verseRef = biblicalVerse.split(" \u2014 ")[0]
      const verseText = biblicalVerse.split(" \u2014 ").slice(1).join(" \u2014 ")
      writeLine(`   ${verseRef}`, 9.5, true)
      if (verseText) {
        const verseLines = doc.splitTextToSize(`   "${verseText}"`, maxWidth)
        checkPage(verseLines.length * LINE_HEIGHT)
        verseLines.forEach((l: string) => {
          if (y > PAGE_HEIGHT - MARGIN_BOTTOM) { doc.addPage(); y = MARGIN_TOP }
          doc.setFontSize(9.5)
          doc.setFont("helvetica", "italic")
          doc.text(l, MARGIN_LEFT, y)
          y += LINE_HEIGHT
        })
      }
      if (curriculumConnection) {
        const connLines = doc.splitTextToSize(`   Curriculum Connection: ${curriculumConnection}`, maxWidth)
        checkPage(connLines.length * LINE_HEIGHT)
        connLines.forEach((l: string) => {
          if (y > PAGE_HEIGHT - MARGIN_BOTTOM) { doc.addPage(); y = MARGIN_TOP }
          doc.setFontSize(9)
          doc.setFont("helvetica", "normal")
          doc.text(l, MARGIN_LEFT, y)
          y += LINE_HEIGHT
        })
      }
      if (verseExplanation) {
        const explLines = doc.splitTextToSize(`   ${verseExplanation}`, maxWidth)
        checkPage(explLines.length * LINE_HEIGHT)
        explLines.forEach((l: string) => {
          if (y > PAGE_HEIGHT - MARGIN_BOTTOM) { doc.addPage(); y = MARGIN_TOP }
          doc.setFontSize(9)
          doc.setFont("helvetica", "italic")
          doc.text(l, MARGIN_LEFT, y)
          y += LINE_HEIGHT
        })
      }
      if (teacherReflectionNotes) {
        const noteLines = doc.splitTextToSize(`   \u2014 ${teacherReflectionNotes}`, maxWidth)
        checkPage(noteLines.length * LINE_HEIGHT)
        noteLines.forEach((l: string) => {
          if (y > PAGE_HEIGHT - MARGIN_BOTTOM) { doc.addPage(); y = MARGIN_TOP }
          doc.setFontSize(9)
          doc.setFont("helvetica", "italic")
          doc.text(l, MARGIN_LEFT, y)
          y += LINE_HEIGHT
        })
      }
      y += 2
    }

    // ── Teacher Notes ──
    if (includeNotesInExport && teacherPrivateNotes.trim()) {
      checkPage(LINE_HEIGHT * 3)
      writeLine("Teacher Notes (Private)", 10, true)
      const noteLines = doc.splitTextToSize(`   ${teacherPrivateNotes}`, maxWidth)
      checkPage(noteLines.length * LINE_HEIGHT)
      noteLines.forEach((l: string) => {
        if (y > PAGE_HEIGHT - MARGIN_BOTTOM) { doc.addPage(); y = MARGIN_TOP }
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        doc.text(l, MARGIN_LEFT, y)
        y += LINE_HEIGHT
      })
      y += 2
    }

    y += 4
  }

  const generate = async () => {
    // ── Defensive check: require minimum data ──
    if (!plan.grade && !weeklyMode) {
      toastError("Please complete the lesson before exporting to PDF.")
      return
    }
    if (weeklyMode) {
      const hasData = Object.values(weeklyPlans).some((p) => p.grade)
      if (!hasData) {
        toastError("Please complete at least one day before exporting to PDF.")
        return
      }
    }

    try {
      const { default: jsPDF } = await import("jspdf")
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

      if (weeklyMode) {
        DAY_LABELS.forEach((day, i) => {
          if (i > 0) doc.addPage()
          writePlan(doc, weeklyPlans[day.toLowerCase() as DayKey], day)
        })
      } else {
        writePlan(doc, plan)
      }

      doc.save(weeklyMode ? "cbc-weekly-lesson-plans.pdf" : "cbc-lesson-plan.pdf")
      trackDownload("cbc_lesson_planner", "download_pdf")
      toastSuccess("PDF downloaded")
    } catch {
      toastError("Failed to generate PDF")
    }
  }

  return generate()
}

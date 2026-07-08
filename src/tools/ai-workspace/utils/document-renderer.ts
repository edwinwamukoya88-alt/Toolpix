import { getFeature } from "../data"

export interface DocumentContext {
  grade?: string
  learningArea?: string
  strand?: string
  subStrand?: string
  duration?: string
}

export interface RenderOptions {
  markdown: string
  settings: Record<string, string>
  featureName: string
  featureId: string
  generatedAt: Date
}

function getDocumentTypeLabel(featureId: string): string {
  const map: Record<string, string> = {
    "lesson-planner": "LESSON PLAN",
    "scheme-of-work": "SCHEME OF WORK",
    "assessment": "COMPETENCY-BASED ASSESSMENT",
    "comment-generator": "TEACHER COMMENT",
    "revision-planner": "REVISION PLAN",
    "generate-bulk-comments": "BULK COMMENTS",
    "education-followup": "FOLLOW-UP DOCUMENT",
  }
  const feat = getFeature(featureId)
  return map[featureId] || feat?.name?.toUpperCase() || "CBC DOCUMENT"
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function getDocumentTitle(featureId: string): string {
  const map: Record<string, string> = {
    "lesson-planner": "CBC Lesson Plan",
    "scheme-of-work": "CBC Scheme of Work",
    "assessment": "CBC Assessment",
    "comment-generator": "CBC Teacher Comment",
    "revision-planner": "CBC Revision Plan",
    "generate-bulk-comments": "CBC Bulk Comments",
    "education-followup": "CBC Document",
  }
  return map[featureId] || "CBC Document"
}

function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

function renderHeaderFields(ctx: DocumentContext): string {
  const fields = [
    { label: "School", value: "_____________________________" },
    { label: "Teacher", value: "_____________________________" },
    { label: "Term", value: "_____________________________" },
    { label: "Week", value: "_____________________________" },
    { label: "Date", value: "_____________________________" },
    { label: "Learning Area", value: ctx.learningArea || "_____________________________" },
    { label: "Grade", value: ctx.grade || "_____________________________" },
    { label: "Strand", value: ctx.strand || "_____________________________" },
    { label: "Sub-Strand", value: ctx.subStrand || "_____________________________" },
    { label: "Lesson Duration", value: ctx.duration ? `${ctx.duration} Minutes` : "_____________________________" },
  ]

  return fields
    .map(
      (f) =>
        `<tr><td style="width:180px;padding:5px 10px;font-weight:600;font-size:11px;color:#1e3a5f;border:none;vertical-align:top;">${escapeHtml(f.label)}:</td><td style="padding:5px 10px;font-size:11px;border-bottom:1px solid #d0d0d0;color:#333;">${escapeHtml(f.value)}</td></tr>`,
    )
    .join("")
}

function markdownToContentHtml(md: string): string {
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  const blocks: string[] = []
  const lines = html.split("\n")
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed === "") {
      i++
      continue
    }

    if (/^#{1,4}\s/.test(trimmed)) {
      const level = trimmed.match(/^#+/)![0].length
      const text = trimmed.replace(/^#+\s*/, "")
      const sizes: Record<number, string> = {
        1: "22px",
        2: "18px",
        3: "16px",
        4: "14px",
      }
      const colors: Record<number, string> = {
        1: "#1a365d",
        2: "#1e3a5f",
        3: "#2563eb",
        4: "#2563eb",
      }
      blocks.push(
        `<h${level} style="font-size:${sizes[level] || "14px"};font-weight:700;color:${colors[level] || "#1a1a1a"};margin:20px 0 10px;${level <= 2 ? "border-bottom:2px solid #2563eb;padding-bottom:6px;" : ""}">${processInline(text)}</h${level}>`,
      )
      i++
      continue
    }

    const tableMatch = trimmed.match(/^\|(.+)\|$/)
    if (tableMatch) {
      const rows: string[][] = []
      const isHeader = i + 1 < lines.length && /^\|[\s\-:]+\|$/.test(lines[i + 1].trim())

      rows.push(tableMatch[1].split("|").map((c) => c.trim()))
      i++

      if (isHeader) {
        i++
      }

      while (i < lines.length) {
        const nextTrimmed = lines[i].trim()
        if (!nextTrimmed.startsWith("|")) break
        const cells = nextTrimmed.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim())
        if (cells.length > 0 && !/^[\s\-:]+$/.test(cells[0])) {
          rows.push(cells)
        }
        i++
      }

      if (rows.length > 0) {
        blocks.push(buildTableHtml(rows))
      }
      continue
    }

    if (/^[-*]\s/.test(trimmed) || /^\d+[.)]\s/.test(trimmed)) {
      const items: string[] = []
      const isOrdered = /^\d+[.)]\s/.test(trimmed)

      while (i < lines.length) {
        const lt = lines[i].trim()
        if (/^[-*]\s/.test(lt) || /^\d+[.)]\s/.test(lt)) {
          const text = lt.replace(/^[-*]\s+/, "").replace(/^\d+[.)]\s+/, "")
          items.push(`<li style="margin-bottom:3px;">${processInline(text)}</li>`)
          i++
        } else if (lt === "") {
          i++
          break
        } else {
          break
        }
      }

      const tag = isOrdered ? "ol" : "ul"
      blocks.push(
        `<${tag} style="padding-left:24px;margin:8px 0;line-height:1.6;">${items.join("")}</${tag}>`,
      )
      continue
    }

    if (/^>\s/.test(trimmed)) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ""))
        i++
      }
      blocks.push(
        `<blockquote style="border-left:4px solid #2563eb;padding:8px 16px;margin:12px 0;background:#f0f5ff;color:#444;font-style:italic;">${processInline(quoteLines.join("<br>"))}</blockquote>`,
      )
      continue
    }

    if (/^---/.test(trimmed)) {
      blocks.push(`<hr style="border:none;border-top:1px solid #d0d0d0;margin:20px 0;">`)
      i++
      continue
    }

    if (/^```/.test(trimmed)) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      i++
      blocks.push(
        `<pre style="background:#f5f5f5;padding:12px 16px;border-radius:6px;font-size:11px;font-family:monospace;overflow-x:auto;margin:12px 0;border:1px solid #e0e0e0;line-height:1.5;">${escapeHtml(codeLines.join("\n"))}</pre>`,
      )
      continue
    }

    blocks.push(`<p style="margin:0 0 8px;line-height:1.6;">${processInline(trimmed)}</p>`)
    i++
  }

  return blocks.join("\n")
}

function processInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:1px 5px;border-radius:3px;font-size:11px;font-family:monospace;">$1</code>')
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#2563eb;text-decoration:underline;">$1</a>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<em style="color:#888;">[Image: $1]</em>')
}

function buildTableHtml(rows: string[][]): string {
  const isFirstRowHeader = rows.length >= 2
  let html = '<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:11px;">'

  if (isFirstRowHeader) {
    html += "<thead><tr>"
    rows[0].forEach((cell) => {
      html += `<th style="background:#1e3a5f;color:#fff;font-weight:600;padding:8px 10px;text-align:left;border:1px solid #1a365d;">${processInline(cell)}</th>`
    })
    html += "</tr></thead><tbody>"
    for (let r = 1; r < rows.length; r++) {
      const bg = r % 2 === 0 ? "#f8fafc" : "#ffffff"
      html += `<tr style="background:${bg};">`
      rows[r].forEach((cell) => {
        html += `<td style="padding:7px 10px;border:1px solid #d0d0d0;color:#333;">${processInline(cell)}</td>`
      })
      html += "</tr>"
    }
    html += "</tbody>"
  } else {
    html += "<tbody>"
    rows.forEach((row, ri) => {
      const bg = ri % 2 === 0 ? "#ffffff" : "#f8fafc"
      html += `<tr style="background:${bg};">`
      row.forEach((cell) => {
        html += `<td style="padding:7px 10px;border:1px solid #d0d0d0;color:#333;">${processInline(cell)}</td>`
      })
      html += "</tr>"
    })
    html += "</tbody>"
  }

  html += "</table>"
  return html
}

export function renderKicdDocument(opts: RenderOptions): string {
  const ctx: DocumentContext = {
    grade: opts.settings["grade"],
    learningArea: opts.settings["learningArea"],
    strand: opts.settings["strand"],
    subStrand: opts.settings["subStrand"],
    duration: opts.settings["duration"],
  }

  const docType = getDocumentTypeLabel(opts.featureId)
  const docTitle = getDocumentTitle(opts.featureId)
  const contentHtml = markdownToContentHtml(opts.markdown)
  const headerFields = renderHeaderFields(ctx)
  const now = formatDate(opts.generatedAt)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(docTitle)}</title>
<style>
  @page {
    size: A4;
    margin: 20mm 15mm 25mm;
  }
  * { box-sizing: border-box; }
  body {
    font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #1a1a1a;
    max-width: 210mm;
    margin: 0 auto;
    padding: 0;
  }
  @media print {
    body { margin: 0; padding: 0; }
    @page { margin: 20mm 15mm 25mm; }
    .no-print { display: none; }
  }

  .kicd-header {
    text-align: center;
    border-bottom: 3px solid #1e3a5f;
    padding-bottom: 14px;
    margin-bottom: 20px;
  }
  .kicd-header .crest-line {
    font-size: 18px;
    font-weight: 700;
    color: #1e3a5f;
    letter-spacing: 2px;
    margin: 0 0 2px;
  }
  .kicd-header .sub-line {
    font-size: 11px;
    color: #4a5568;
    font-weight: 600;
    margin: 0 0 6px;
    letter-spacing: 1px;
  }
  .kicd-header .doc-type {
    font-size: 16px;
    font-weight: 700;
    color: #2563eb;
    margin: 6px 0 0;
    letter-spacing: 1px;
  }

  .fields-table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0 20px;
    background: #f8fafc;
    border-radius: 6px;
    overflow: hidden;
  }

  h1 { font-size: 22px; font-weight: 700; color: #1a365d; margin: 24px 0 10px; }
  h2 { font-size: 18px; font-weight: 700; color: #1e3a5f; margin: 20px 0 10px; border-bottom: 2px solid #2563eb; padding-bottom: 6px; }
  h3 { font-size: 16px; font-weight: 600; color: #2563eb; margin: 18px 0 8px; }
  h4 { font-size: 14px; font-weight: 600; color: #2d3748; margin: 14px 0 6px; }
  p { margin: 0 0 8px; line-height: 1.6; }
  table { page-break-inside: auto; }
  tr { page-break-inside: avoid; page-break-after: auto; }
  thead { display: table-header-group; }
  h1, h2, h3, h4 { page-break-after: avoid; }
  ul, ol { page-break-inside: avoid; }

  .page-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 8px;
    color: #999;
    border-top: 1px solid #ddd;
    padding-top: 6px;
  }
  .page-footer .pagenum:before { content: counter(page); }
  .page-footer .pagenum:after { content: ""; }

  .page-header-text {
    position: running(pageHeader);
    font-size: 8px;
    color: #888;
    text-align: center;
    border-bottom: 1px solid #ddd;
    padding-bottom: 4px;
    margin-bottom: 8px;
  }
  @page {
    @top-center {
      content: element(pageHeader);
    }
  }
</style>
</head>
<body>

<div class="kicd-header">
  <p class="crest-line">KENYA INSTITUTE OF CURRICULUM DEVELOPMENT</p>
  <p class="sub-line">COMPETENCY-BASED CURRICULUM (CBC)</p>
  <p class="doc-type">${escapeHtml(docType)}</p>
</div>

<table class="fields-table">
  ${headerFields}
</table>

${contentHtml}

<div style="text-align:center;font-size:9px;color:#999;border-top:1px solid #ddd;padding-top:8px;margin-top:30px;">
  Generated by ToolForge AI Assistant &bull; ${escapeHtml(docTitle)} &bull; ${now}
</div>

</body>
</html>`
}

export function renderKicdPrintHtml(opts: RenderOptions): string {
  const html = renderKicdDocument(opts)
  return html.replace(
    "</body>",
    `<div class="page-footer">Generated by ToolForge AI Assistant | ${getDocumentTitle(opts.featureId)} | ${formatDate(opts.generatedAt)} | Page <span class="pagenum"></span></div>\n</body>`,
  )
}

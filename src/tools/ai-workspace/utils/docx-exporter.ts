import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  PageNumber,
  Footer,
  Header,
  convertInchesToTwip,
  ShadingType,
} from "docx"
import type { DocumentContext } from "./document-renderer"

function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

function getDocTitle(featureId: string): string {
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

function getDocType(featureId: string): string {
  const map: Record<string, string> = {
    "lesson-planner": "LESSON PLAN",
    "scheme-of-work": "SCHEME OF WORK",
    "assessment": "COMPETENCY-BASED ASSESSMENT",
    "comment-generator": "TEACHER COMMENT",
    "revision-planner": "REVISION PLAN",
    "generate-bulk-comments": "BULK COMMENTS",
    "education-followup": "FOLLOW-UP DOCUMENT",
  }
  return map[featureId] || "CBC DOCUMENT"
}

function parseBlocks(md: string, ctx: DocumentContext, docTitle: string, docType: string, featureId: string, now: string): (Table | Paragraph)[] {
  const blocks: (Table | Paragraph)[] = []

  const headerParagraphs = [
    new Paragraph({ spacing: { after: 0 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "KENYA INSTITUTE OF CURRICULUM DEVELOPMENT", bold: true, size: 28, color: "1E3A5F" })] }),
    new Paragraph({ spacing: { before: 0, after: 0 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "COMPETENCY-BASED CURRICULUM (CBC)", bold: true, size: 20, color: "4A5568" })] }),
    new Paragraph({ spacing: { before: 0, after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: docType, bold: true, size: 26, color: "2563EB" })] }),
    new Paragraph({ spacing: { before: 0, after: 0 }, alignment: AlignmentType.CENTER, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "1E3A5F" } }, children: [] }),
  ]
  blocks.push(...headerParagraphs)

  const fieldData: [string, string][] = [
    ["School", "_____________________________"],
    ["Teacher", "_____________________________"],
    ["Term", "_____________________________"],
    ["Week", "_____________________________"],
    ["Date", "_____________________________"],
    ["Learning Area", ctx.learningArea || "_____________________________"],
    ["Grade", ctx.grade || "_____________________________"],
    ["Strand", ctx.strand || "_____________________________"],
    ["Sub-Strand", ctx.subStrand || "_____________________________"],
    ["Lesson Duration", ctx.duration ? `${ctx.duration} Minutes` : "_____________________________"],
  ]

  const fieldRows = fieldData.map(([label, value]) => {
    return new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 4500, type: WidthType.DXA },
          children: [new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text: `${label}:`, bold: true, size: 20, color: "1E3A5F" })] })],
          shading: { type: ShadingType.SOLID, color: "F0F4F8" },
          verticalAlign: "center",
        }),
        new TableCell({
          width: { size: 8500, type: WidthType.DXA },
          children: [new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text: value, size: 20, color: "333333" })] })],
          verticalAlign: "center",
        }),
      ],
    })
  })

  blocks.push(
    new Table({
      rows: fieldRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),
  )

  blocks.push(new Paragraph({ spacing: { before: 200, after: 200 }, children: [] }))

  const lines = md.split("\n")
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
      const headingSizes: Record<number, number> = { 1: 32, 2: 28, 3: 24, 4: 22 }
      const headingColors: Record<number, string> = { 1: "1A365D", 2: "1E3A5F", 3: "2563EB", 4: "2D3748" }

      const hl = level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : level === 3 ? HeadingLevel.HEADING_3 : HeadingLevel.HEADING_4

      blocks.push(
        new Paragraph({
          heading: hl,
          spacing: { before: level <= 2 ? 300 : 200, after: 100 },
          border: level <= 2 ? { bottom: { style: BorderStyle.SINGLE, size: 4, color: "2563EB" } } : undefined,
          children: [new TextRun({ text, bold: true, size: headingSizes[level] || 22, color: headingColors[level] || "1A1A1A" })],
        }),
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

      if (isHeader) i++

      while (i < lines.length) {
        const nt = lines[i].trim()
        if (!nt.startsWith("|")) break
        const cells = nt.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim())
        if (cells.length > 0 && !/^[\s\-:]+$/.test(cells[0])) {
          rows.push(cells)
        }
        i++
      }

      if (rows.length > 0) {
        const tableRows: TableRow[] = rows.map((row, ri) => {
          const isHeaderRow = ri === 0 && isHeader
          return new TableRow({
            tableHeader: isHeaderRow,
            children: row.map((cell) => {
              return new TableCell({
                width: { size: 13000 / row.length, type: WidthType.DXA },
                shading: isHeaderRow ? { type: ShadingType.SOLID, color: "1E3A5F" } : ri % 2 === 0 ? { type: ShadingType.SOLID, color: "F8FAFC" } : { type: ShadingType.SOLID, color: "FFFFFF" },
                children: [new Paragraph({ spacing: { before: 30, after: 30 }, children: [new TextRun({ text: processInlineText(cell), bold: isHeaderRow, color: isHeaderRow ? "FFFFFF" : "333333", size: 20 })] })],
              })
            }),
          })
        })

        blocks.push(
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        )
      }
      continue
    }

    if (/^[-*]\s/.test(trimmed) || /^\d+[.)]\s/.test(trimmed)) {
      const items: string[] = []
      const isOrdered = /^\d+[.)]\s/.test(trimmed)

      while (i < lines.length) {
        const lt = lines[i].trim()
        if (/^[-*]\s/.test(lt) || /^\d+[.)]\s/.test(lt)) {
          items.push(lt.replace(/^[-*]\s+/, "").replace(/^\d+[.)]\s+/, ""))
          i++
        } else if (lt === "") {
          i++
          break
        } else {
          break
        }
      }

      items.forEach((item, idx) => {
        const prefix = isOrdered ? `${idx + 1}. ` : "• "
        blocks.push(
          new Paragraph({
            spacing: { before: 30, after: 30 },
            indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
            children: [new TextRun({ text: `${prefix}${processInlineText(item)}`, size: 20 })],
          }),
        )
      })
      continue
    }

    if (/^>\s/.test(trimmed)) {
      const quoteText = trimmed.replace(/^>\s*/, "")
      blocks.push(
        new Paragraph({
          spacing: { before: 80, after: 80 },
          indent: { left: convertInchesToTwip(0.3) },
          shading: { type: ShadingType.SOLID, color: "F0F5FF" },
          border: { left: { style: BorderStyle.SINGLE, size: 6, color: "2563EB" } },
          children: [new TextRun({ text: processInlineText(quoteText), italics: true, size: 20, color: "444444" })],
        }),
      )
      i++
      continue
    }

    if (/^---/.test(trimmed)) {
      blocks.push(
        new Paragraph({
          spacing: { before: 200, after: 200 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "D0D0D0" } },
          children: [],
        }),
      )
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
        new Paragraph({
          spacing: { before: 80, after: 80 },
          shading: { type: ShadingType.SOLID, color: "F5F5F5" },
          children: [new TextRun({ text: codeLines.join("\n"), font: "Courier New", size: 18, color: "333333" })],
        }),
      )
      continue
    }

    blocks.push(
      new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: processInlineText(trimmed), size: 20 })],
      }),
    )
    i++
  }

  return blocks
}

function processInlineText(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1")
}

export async function exportDocx(
  markdown: string,
  settings: Record<string, string>,
  featureName: string,
  featureId: string,
): Promise<void> {
  const ctx: DocumentContext = {
    grade: settings["grade"],
    learningArea: settings["learningArea"],
    strand: settings["strand"],
    subStrand: settings["subStrand"],
    duration: settings["duration"],
  }

  const docTitle = getDocTitle(featureId)
  const docType = getDocType(featureId)
  const now = formatDate(new Date())

  const allBlocks = parseBlocks(markdown, ctx, docTitle, docType, featureId, now)

  const doc = new Document({
    title: docTitle,
    description: `${docTitle} - KICD CBC Document`,
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22, color: "1A1A1A" },
          paragraph: { spacing: { line: 276 }, indent: { left: 0 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.8),
              right: convertInchesToTwip(0.8),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" } },
                children: [new TextRun({ text: docTitle, font: "Calibri", size: 16, color: "888888" })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                border: { top: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" } },
                spacing: { before: 60 },
                children: [
                  new TextRun({ text: `Generated by ToolForge AI Assistant  |  ${now}  |  `, font: "Calibri", size: 16, color: "999999" }),
                  new TextRun({ text: "Page ", font: "Calibri", size: 16, color: "999999" }),
                  new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 16, color: "999999" }),
                  new TextRun({ text: " of ", font: "Calibri", size: 16, color: "999999" }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Calibri", size: 16, color: "999999" }),
                ],
              }),
            ],
          }),
        },
        children: allBlocks,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${featureName || docTitle}.docx`
  a.click()
  URL.revokeObjectURL(url)
}

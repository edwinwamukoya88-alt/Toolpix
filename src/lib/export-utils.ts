/* ─── Export Utilities ─────────────────────────────
 * PDF, CSV, and Excel export for analytics reports.
 * Uses jsPDF for PDF, raw CSV generation, and 
 * minimal Excel-compatible XML.
 * ───────────────────────────────────────────────── */

import { jsPDF } from "jspdf"

export type ExportFormat = "csv" | "pdf" | "excel"

export interface ExportableTable {
  title: string
  headers: string[]
  rows: (string | number)[][]
}

export interface ExportableChart {
  title: string
  chartType: "line" | "bar" | "pie"
  data: { label: string; value: number }[]
}

export interface ExportReport {
  title: string
  dateRange: string
  generatedAt: string
  summary: { label: string; value: string }[]
  tables: ExportableTable[]
  charts?: ExportableChart[]
}

/* ─── CSV Export ────────────────────────────────── */

export function exportCSV(data: ExportableTable[], filename?: string): void {
  let csv = ""
  for (const table of data) {
    csv += `"${table.title}"\n`
    csv += table.headers.map(h => `"${h}"`).join(",") + "\n"
    for (const row of table.rows) {
      csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",") + "\n"
    }
    csv += "\n"
  }

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename || `analytics-export-${new Date().toISOString().split("T")[0]}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

/* ─── PDF Export ────────────────────────────────── */

export function exportPDF(report: ExportReport, filename?: string): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 20

  doc.setFontSize(18)
  doc.text(report.title, pageWidth / 2, y, { align: "center" })
  y += 10

  doc.setFontSize(9)
  doc.text(`Date Range: ${report.dateRange}`, 14, y)
  doc.text(`Generated: ${report.generatedAt}`, 14, y + 4)
  y += 12

  doc.setFontSize(12)
  doc.text("Summary", 14, y)
  y += 7
  doc.setFontSize(9)

  for (const item of report.summary) {
    doc.text(`${item.label}: ${item.value}`, 20, y)
    y += 5
    if (y > 270) {
      doc.addPage()
      y = 20
    }
  }
  y += 5

  for (const table of report.tables) {
    if (y > 230) {
      doc.addPage()
      y = 20
    }

    doc.setFontSize(12)
    doc.text(table.title, 14, y)
    y += 7

    const cellWidth = Math.min(40, (pageWidth - 28) / Math.max(table.headers.length, 1))

    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    let x = 14
    for (const header of table.headers) {
      doc.text(header, x, y)
      x += cellWidth
    }
    y += 4

    doc.setFont("helvetica", "normal")
    for (const row of table.rows) {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      x = 14
      for (const cell of row) {
        doc.text(String(cell).slice(0, 20), x, y)
        x += cellWidth
      }
      y += 4
    }
    y += 5
  }

  if (report.charts && report.charts.length > 0) {
    doc.addPage()
    y = 20
    doc.setFontSize(14)
    doc.text("Charts", pageWidth / 2, y, { align: "center" })
    y += 10

    for (const chart of report.charts) {
      if (y > 250) {
        doc.addPage()
        y = 20
      }
      doc.setFontSize(10)
      doc.text(chart.title, 14, y)
      y += 5

      const maxVal = Math.max(...chart.data.map(d => d.value), 1)
      const barWidth = (pageWidth - 40) / chart.data.length

      for (const d of chart.data) {
        const h = (d.value / maxVal) * 60
        doc.setFillColor(59, 130, 246)
        doc.rect(14 + chart.data.indexOf(d) * barWidth, y + 60 - h, barWidth - 2, h, "F")
        doc.setFontSize(5)
        doc.text(d.label.slice(0, 8), 14 + chart.data.indexOf(d) * barWidth, y + 63)
      }
      y += 70
    }
  }

  doc.save(filename || `analytics-report-${new Date().toISOString().split("T")[0]}.pdf`)
}

/* ─── Excel (CSV-based) Export ─────────────────── */

export function exportExcel(data: ExportableTable[], filename?: string): void {
  const rows: string[][] = []
  for (const table of data) {
    rows.push([table.title])
    rows.push(table.headers)
    for (const row of table.rows) {
      rows.push(row.map(cell => String(cell)))
    }
    rows.push([])
  }

  const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "application/vnd.ms-excel;charset=utf-8" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename || `analytics-export-${new Date().toISOString().split("T")[0]}.xls`
  link.click()
  URL.revokeObjectURL(link.href)
}

/* ─── Generic Export ────────────────────────────── */

export function exportData(format: ExportFormat, data: ExportableTable[], report?: ExportReport): void {
  switch (format) {
    case "csv":
      exportCSV(data)
      break
    case "pdf":
      if (report) exportPDF(report)
      break
    case "excel":
      exportExcel(data)
      break
  }
}

/* ─── Helpers ───────────────────────────────────── */

export function buildExportTables(
  kpiData: { label: string; value: string; change: number; direction: string }[],
  toolData: { toolName: string; launches: number; completionRate: number; uniqueUsers: number }[],
  blogData: { article: string; views: number; engagementScore: number }[]
): ExportableTable[] {
  const tables: ExportableTable[] = [
    {
      title: "Key Metrics",
      headers: ["Metric", "Value", "Change", "Direction"],
      rows: kpiData.map(k => [k.label, k.value, `${k.change}%`, k.direction]),
    },
  ]

  if (toolData.length > 0) {
    tables.push({
      title: "Tool Performance",
      headers: ["Tool", "Launches", "Completion Rate", "Unique Users"],
      rows: toolData.map(t => [t.toolName, t.launches, `${t.completionRate}%`, t.uniqueUsers]),
    })
  }

  if (blogData.length > 0) {
    tables.push({
      title: "Blog Performance",
      headers: ["Article", "Views", "Engagement Score"],
      rows: blogData.map(b => [b.article, b.views, `${b.engagementScore}%`]),
    })
  }

  return tables
}

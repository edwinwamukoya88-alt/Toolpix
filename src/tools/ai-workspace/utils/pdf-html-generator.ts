"use client"

import html2canvas from "html2canvas"
import jsPDF from "jspdf"

function buildPrintHtml(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  @page { margin: 2cm; size: A4; }
  * { box-sizing: border-box; }

  html, *, *::before, *::after {
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }

  html {
    background: #fff !important;
    color: #000 !important;
  }

  *, *::before, *::after {
    transition: none !important;
    animation: none !important;
    animation-duration: 0s !important;
    transition-duration: 0s !important;
    opacity: 1 !important;
    filter: none !important;
    -webkit-filter: none !important;
    mix-blend-mode: normal !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

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

  span, div, strong, em, code, a, b, i, u, s {
    color: #000 !important;
  }
  a { text-decoration: underline; }

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

  [class*="/"],
  [style*="opacity"] {
    opacity: 1 !important;
  }

  [class*="from-"],
  [class*="via-"],
  [class*="to-"] {
    background: transparent !important;
  }

  .curriculum-grid { display: flex; flex-wrap: wrap; gap: 6pt; margin: 8pt 0; }
  .curriculum-item { border: 1px solid #ddd; padding: 4pt 8pt; border-radius: 4pt; flex: 1 0 45%; }
  .chip-list { display: flex; flex-wrap: wrap; gap: 4pt; }
  .chip { border: 1px solid #ddd; padding: 2pt 8pt; border-radius: 4pt; font-size: 10pt; background: #fafafa; }
</style>
</head>
<body>
  ${content}
</body>
</html>`
}

export async function generatePdfFromHtml(
  content: string,
  title: string,
  filename: string,
): Promise<void> {
  const html = buildPrintHtml(content, title)
  const blob = new Blob([html], { type: "text/html" })
  const url = URL.createObjectURL(blob)

  const iframe = document.createElement("iframe")
  iframe.style.cssText = "position:fixed;left:-9999px;top:0;width:850px;height:100%;border:none;z-index:-1;"
  document.body.appendChild(iframe)

  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      URL.revokeObjectURL(url)
      if (iframe.parentNode) document.body.removeChild(iframe)
    }

    iframe.onload = async () => {
      try {
        if (!iframe.contentDocument?.body) {
          throw new Error("iframe content not available")
        }

        await document.fonts.ready
        await new Promise((r) => setTimeout(r, 800))

        const canvas = await html2canvas(iframe.contentDocument.body, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          allowTaint: false,
          width: 850,
          windowWidth: 850,
          onclone: () => {},
        })

        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF("p", "mm", "a4")
        const pdfW = pdf.internal.pageSize.getWidth()
        const pdfH = pdf.internal.pageSize.getHeight()

        const imgW = pdfW
        const imgH = (canvas.height * pdfW) / canvas.width

        let heightLeft = imgH
        let position = 0

        pdf.addImage(imgData, "PNG", 0, position, imgW, imgH)
        heightLeft -= pdfH

        while (heightLeft > 0) {
          position -= pdfH
          pdf.addPage()
          pdf.addImage(imgData, "PNG", 0, position, imgW, imgH)
          heightLeft -= pdfH
        }

        pdf.save(`${filename}.pdf`)
        cleanup()
        resolve()
      } catch (err) {
        cleanup()
        reject(err)
      }
    }

    iframe.onerror = () => {
      cleanup()
      reject(new Error("iframe load failed"))
    }

    iframe.src = url
  })
}

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "All Tools",
  description: "Browse 39+ free online tools across 8 categories: productivity, education, security, QR, file conversion, developer tools, design, and finance. All privacy-first.",
  openGraph: {
    title: "Free Online Tools - ToolForge",
    description: "Browse 39+ free online tools across 8 categories. All privacy-first, no login required.",
    url: "https://toolforge.app/tools",
  },
  alternates: {
    canonical: "https://toolforge.app/tools",
  },
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children
}

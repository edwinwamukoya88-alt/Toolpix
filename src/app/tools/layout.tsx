import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "All Tools",
  description: "Browse 49+ free online tools across 9 categories: productivity, education, security, QR, file conversion, developer tools, design, finance, and multimedia. All privacy-first.",
  openGraph: {
    title: "Free Online Tools - ToolForge",
    description: "Browse 49+ free online tools across 9 categories. All privacy-first, no login required.",
    url: "https://smart-tools-kit.vercel.app/tools",
  },
  alternates: {
    canonical: "https://smart-tools-kit.vercel.app/tools",
  },
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children
}

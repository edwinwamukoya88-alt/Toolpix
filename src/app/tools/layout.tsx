import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "All Tools",
  description: "Browse 50+ free online tools across 11 categories: AI workspace, productivity, education & CBC, security, QR, file conversion, developer tools, design, calculators, network monitoring, and multimedia. All privacy-first.",
  openGraph: {
    title: "Free Online Tools - ToolForge",
    description: "Browse 50+ free online tools across 11 categories. All privacy-first, no login required.",
    url: "https://smart-tools-kit.vercel.app/tools",
  },
  alternates: {
    canonical: "https://smart-tools-kit.vercel.app/tools",
  },
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children
}

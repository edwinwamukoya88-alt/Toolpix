import type { Metadata } from "next"

const toolsUrl = process.env.NEXT_PUBLIC_APP_URL || "https://smart-tools-kit.vercel.app"

export const metadata: Metadata = {
  title: "All Tools",
  description: "Browse 50+ free online tools across 11 categories: AI workspace, productivity, education & CBC, security, QR, file conversion, developer tools, design, calculators, network monitoring, and multimedia. All privacy-first.",
  openGraph: {
    title: "Free Online Tools - ToolForge",
    description: "Browse 50+ free online tools across 11 categories. All privacy-first, no login required.",
    url: `${toolsUrl}/tools`,
    images: [{ url: `${toolsUrl}/api/og?title=Free+Online+Tools&category=Productivity&type=site`, width: 1200, height: 630, alt: "All Tools - ToolForge" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Tools - ToolForge",
    description: "Browse 50+ free online tools across 11 categories. All privacy-first, no login required.",
  },
  alternates: {
    canonical: `${toolsUrl}/tools`,
  },
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children
}

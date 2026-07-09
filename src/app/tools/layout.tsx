import type { Metadata } from "next"

import { SITE_URL as siteUrl } from "@/lib/constants"

export const metadata: Metadata = {
  title: "All Tools",
  description: "Browse 50+ free online tools across 11 categories: AI workspace, productivity, education & CBC, security, QR, file conversion, developer tools, design, calculators, network monitoring, and multimedia. All privacy-first.",
  openGraph: {
    title: "Free Online Tools - Zilita",
    description: "Browse 50+ free online tools across 11 categories. All privacy-first, no login required.",
    url: `${siteUrl}/tools`,
    images: [{ url: `${siteUrl}/api/og?title=Free+Online+Tools&category=Productivity&type=site`, width: 1200, height: 630, alt: "All Tools - Zilita" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Tools - Zilita",
    description: "Browse 50+ free online tools across 11 categories. All privacy-first, no login required.",
  },
  alternates: {
    canonical: `${siteUrl}/tools`,
  },
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children
}

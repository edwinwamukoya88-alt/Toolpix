import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://smart-tools-kit.vercel.app"

export const metadata: Metadata = {
  title: "Help Center",
  description: "Find answers about using ToolForge tools. FAQs covering general usage, tool-specific guides, and privacy information.",
  openGraph: {
    title: "Help Center - ToolForge",
    description: "Find answers about using ToolForge's 39+ privacy-first online tools.",
    url: `${siteUrl}/help`,
    images: [{ url: `${siteUrl}/api/og?title=Help+Center&category=Productivity&type=site`, width: 1200, height: 630, alt: "Help Center - ToolForge" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Help Center - ToolForge",
    description: "Find answers about using ToolForge's 39+ privacy-first online tools.",
  },
  alternates: {
    canonical: `${siteUrl}/help`,
  },
}

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children
}

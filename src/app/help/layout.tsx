import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Help Center",
  description: "Find answers about using ToolForge tools. FAQs covering general usage, tool-specific guides, and privacy information.",
  openGraph: {
    title: "Help Center - ToolForge",
    description: "Find answers about using ToolForge's 39+ privacy-first online tools.",
    url: "https://toolforge.app/help",
  },
  alternates: {
    canonical: "https://toolforge.app/help",
  },
}

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children
}

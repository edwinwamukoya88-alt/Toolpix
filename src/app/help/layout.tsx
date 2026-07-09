import type { Metadata } from "next"

import { SITE_URL as siteUrl } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Help Center",
  description: "Find answers about using Zilita tools. FAQs covering general usage, tool-specific guides, and privacy information.",
  openGraph: {
    title: "Help Center - Zilita",
    description: "Find answers about using Zilita's 39+ privacy-first online tools.",
    url: `${siteUrl}/help`,
    images: [{ url: `${siteUrl}/api/og?title=Help+Center&category=Productivity&type=site`, width: 1200, height: 630, alt: "Help Center - Zilita" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Help Center - Zilita",
    description: "Find answers about using Zilita's 39+ privacy-first online tools.",
  },
  alternates: {
    canonical: `${siteUrl}/help`,
  },
}

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children
}

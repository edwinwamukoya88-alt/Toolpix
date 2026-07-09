import type { Metadata } from "next"

import { SITE_URL as siteUrl } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Advertise With Zilita — Reach Productivity-Focused Users",
  description:
    "Advertise to teachers, students, developers, and creators using privacy-first browser tools. Premium sponsorships, featured placements, and sponsored content.",
  openGraph: {
    title: "Advertise With Zilita",
    description:
      "Reach thousands of users using privacy-first productivity tools. Premium brand placements that respect user privacy.",
    url: `${siteUrl}/advertise`,
    images: [{ url: `${siteUrl}/api/og?title=Advertise+With+Zilita&category=Business&type=site`, width: 1200, height: 630, alt: "Advertise With Zilita" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Advertise With Zilita",
    description:
      "Reach thousands of users using privacy-first productivity tools. Premium brand placements that respect user privacy.",
  },
  alternates: {
    canonical: `${siteUrl}/advertise`,
  },
}

export default function AdvertiseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

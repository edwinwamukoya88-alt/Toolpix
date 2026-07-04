import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Advertise With ToolForge — Reach Productivity-Focused Users",
  description:
    "Advertise to teachers, students, developers, and creators using privacy-first browser tools. Premium sponsorships, featured placements, and sponsored content.",
  openGraph: {
    title: "Advertise With ToolForge",
    description:
      "Reach thousands of users using privacy-first productivity tools. Premium brand placements that respect user privacy.",
    url: "https://smart-tools-kit.vercel.app/advertise",
  },
  alternates: {
    canonical: "https://smart-tools-kit.vercel.app/advertise",
  },
}

export default function AdvertiseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

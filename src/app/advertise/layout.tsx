import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Advertise",
  description: "Reach thousands of users on ToolForge. Choose from Budget, Standard, or Premium ad placements with full performance tracking.",
  openGraph: {
    title: "Advertise With ToolForge",
    description: "Reach thousands of users using privacy-first productivity tools. Transparent pricing with full performance tracking.",
    url: "https://smart-tools-kit.vercel.app/advertise",
  },
  alternates: {
    canonical: "https://smart-tools-kit.vercel.app/advertise",
  },
}

export default function AdvertiseLayout({ children }: { children: React.ReactNode }) {
  return children
}

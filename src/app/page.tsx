import type { Metadata } from "next"
import HeroSection from "@/components/home/hero"
import TrustStatsSection from "@/components/home/trust-stats"
import FeatureGrid from "@/components/home/feature-grid"
import AiWorkspaceSection from "@/components/home/ai-workspace"
import BentoProductivity from "@/components/home/bento-productivity"
import CbcEducationSection from "@/components/home/cbc-education"
import BusinessToolsSection from "@/components/home/business-tools"
import DevToolsSection from "@/components/home/dev-tools"
import TestimonialsSection from "@/components/home/testimonials"
import BlogSection from "@/components/home/blog-section"
import { getLatestPosts } from "@/lib/blog"
import CtaSection from "@/components/home/cta-section"
import AdSlot from "@/components/ads/AdSlot"
import AdvertiseCTA from "@/components/home/advertise-cta"
import { SITE_URL as siteUrl } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Zilita — The Privacy-First AI Browser Workspace",
  description: "The Privacy-First AI Browser Workspace. Productivity, education, business, creativity, and developer tools — all in one place. No login. No tracking.",
  openGraph: {
    title: "Zilita — The Privacy-First AI Browser Workspace",
    description: "Productivity, education, business, creativity, and developer tools — all in one privacy-first platform. Everything runs in your browser.",
    url: siteUrl,
    siteName: "Zilita",
    images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: "Zilita" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zilita — The Privacy-First AI Browser Workspace",
    description: "Productivity, education, business, creativity, and developer tools — all in one privacy-first platform. Everything runs in your browser.",
    images: [`${siteUrl}/og-image.png`],
  },
  alternates: {
    canonical: siteUrl,
  },
}

export default function HomePage() {
  return (
    <>
      {/* ─── Hero Section ─── */}
      <HeroSection />

      {/* ─── Trust Stats ─── */}
      <TrustStatsSection />

      {/* Ad slot */}
      <div className="container flex justify-center py-6 sm:py-8" role="region" aria-label="Sponsored content">
        <AdSlot type="sponsored" slot="hero" />
      </div>

      {/* ─── Feature Grid ─── */}
      <FeatureGrid />

      {/* Ad slot */}
      <div className="container flex justify-center py-6 sm:py-8" role="region" aria-label="Advertisement">
        <AdSlot type="adsense" slot="2345678901" />
      </div>

      {/* ─── AI Workspace ─── */}
      <AiWorkspaceSection />

      {/* ─── Bento Productivity ─── */}
      <BentoProductivity />

      {/* ─── CBC Education ─── */}
      <CbcEducationSection />

      {/* ─── Business Tools ─── */}
      <BusinessToolsSection />

      {/* ─── Developer Tools ─── */}
      <DevToolsSection />

      {/* ─── Testimonials ─── */}
      <TestimonialsSection />

      {/* ─── Blog ─── */}
      <BlogSection posts={getLatestPosts(3)} />

      {/* Ad slot */}
      <div className="container flex justify-center py-6 sm:py-8" role="region" aria-label="Advertisement">
        <AdSlot type="adsense" slot="3456789012" />
      </div>

      {/* ─── CTA ─── */}
      <CtaSection />

      {/* ─── Advertise CTA ─── */}
      <AdvertiseCTA />
    </>
  )
}

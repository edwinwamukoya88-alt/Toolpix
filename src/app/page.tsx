import type { Metadata } from "next"
import dynamic from "next/dynamic"
import HeroSection from "@/components/home/hero"
import { getLatestPosts } from "@/lib/blog"
import { SITE_URL as siteUrl } from "@/lib/constants"

const TrustStatsSection = dynamic(() => import("@/components/home/trust-stats"), { loading: () => <div className="h-64" /> })
const FeatureGrid = dynamic(() => import("@/components/home/feature-grid"), { loading: () => <div className="h-96" /> })
const AiWorkspaceSection = dynamic(() => import("@/components/home/ai-workspace"), { loading: () => <div className="h-96" /> })
const BentoProductivity = dynamic(() => import("@/components/home/bento-productivity"), { loading: () => <div className="h-96" /> })
const CbcEducationSection = dynamic(() => import("@/components/home/cbc-education"), { loading: () => <div className="h-96" /> })
const BusinessToolsSection = dynamic(() => import("@/components/home/business-tools"), { loading: () => <div className="h-96" /> })
const DevToolsSection = dynamic(() => import("@/components/home/dev-tools"), { loading: () => <div className="h-96" /> })
const TestimonialsSection = dynamic(() => import("@/components/home/testimonials"), { loading: () => <div className="h-64" /> })
const BlogSection = dynamic(() => import("@/components/home/blog-section"), { loading: () => <div className="h-64" /> })
const CtaSection = dynamic(() => import("@/components/home/cta-section"), { loading: () => <div className="h-64" /> })
const AdSlot = dynamic(() => import("@/components/ads/AdSlot"), { loading: () => <div className="h-24" /> })
const AdvertiseCTA = dynamic(() => import("@/components/home/advertise-cta"), { loading: () => <div className="h-48" /> })

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

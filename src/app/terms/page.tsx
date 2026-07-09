import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

import { SITE_URL as siteUrl } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for using Zilita. By accessing or using Zilita, you agree to be bound by these terms.",
  openGraph: {
    title: "Terms of Service - Zilita",
    description: "Terms of service for using the Zilita privacy-first online tools suite.",
    url: `${siteUrl}/terms`,
    images: [{ url: `${siteUrl}/api/og?title=Terms+of+Service&category=Productivity&type=site`, width: 1200, height: 630, alt: "Terms of Service - Zilita" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service - Zilita",
    description: "Terms of service for using the Zilita privacy-first online tools suite.",
  },
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <section className="border-b bg-gradient-to-b from-muted/30 to-background">
        <div className="container py-16 md:py-20 text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            By using Zilita, you agree to these terms.
          </p>
        </div>
      </section>

      <section className="container py-12">
        <div className="max-w-3xl mx-auto prose prose-invert prose-sm md:prose-base">
          <h2>Acceptance of Terms</h2>
          <p>By accessing or using Zilita, you agree to be bound by these terms. If you do not agree, do not use the service.</p>

          <h2>Use of Service</h2>
          <p>Zilita provides free, browser-based utility tools for personal and commercial use. You agree not to misuse the tools or attempt to disrupt the service.</p>

          <h2>No Data Collection</h2>
          <p>All tools run client-side. Zilita does not collect, store, or transmit your data. Your use of the tools is private and self-contained within your browser.</p>

          <h2>Intellectual Property</h2>
          <p>The Zilita name, logo, and code are owned by Zilita. The tools are provided for use, but you may not copy, redistribute, or reverse engineer the service without permission.</p>

          <h2>Limitation of Liability</h2>
          <p>Zilita is provided &ldquo;as is&rdquo; without any warranty. We are not liable for any damages arising from the use or inability to use the service.</p>

          <h2>Changes to Terms</h2>
          <p>We reserve the right to update these terms. Continued use after changes constitutes acceptance of the new terms.</p>

          <h2>Contact</h2>
          <p>For questions about these terms, contact <strong>support@zilita.com</strong>.</p>
        </div>
      </section>

      <section className="container pb-16 text-center">
        <Link href="/">
          <Button variant="outline" size="sm">
            Back to Home <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
      </section>
    </div>
  )
}

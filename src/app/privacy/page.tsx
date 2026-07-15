import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

import { SITE_URL as siteUrl } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Zilita does not collect, store, or transmit any personal data. All tools run entirely in your browser. Privacy-first by design.",
  openGraph: {
    title: "Privacy Policy - Zilita",
    description: "Your privacy matters. Zilita does not collect, store, or transmit any personal data.",
    url: `${siteUrl}/privacy`,
    images: [{ url: `${siteUrl}/api/og?title=Privacy+Policy&category=Security&type=site`, width: 1200, height: 630, alt: "Privacy Policy - Zilita" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy - Zilita",
    description: "Your privacy matters. Zilita does not collect, store, or transmit any personal data.",
  },
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <section className="border-b bg-gradient-to-b from-muted/30 to-background">
        <div className="container py-16 md:py-20 text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your privacy matters. Here is how Zilita handles your data.
          </p>
          <p className="text-xs text-muted-foreground">Last updated: July 10, 2026</p>
        </div>
      </section>

      <section className="container py-12">
        <div className="max-w-3xl mx-auto prose prose-invert prose-sm md:prose-base">
          <p className="text-xs text-muted-foreground">Effective date: January 1, 2026. Last updated: January 1, 2026.</p>

          <h2>Data Collection</h2>
          <p>All tools on Zilita run entirely in your browser using client-side JavaScript. No files, text, or data you input into tools is ever sent to any server.</p>
          <p>However, when you visit Zilita, Google AdSense and Google Analytics (if you consent to cookies) may collect certain information such as your IP address, browser type, device information, and browsing behavior. This data is collected and processed by Google and is governed by <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a>.</p>

          <h2>Local Storage</h2>
          <p>Some tools (such as Notes, Task Planner, and Habit Tracker) use your browser&apos;s localStorage to save data locally on your device. This data never leaves your computer. You can clear it at any time via your browser settings.</p>

          <h2>Cookies</h2>
          <p>Zilita uses cookies for the following purposes:</p>
          <ul>
            <li><strong>Essential cookies</strong> — Used for basic site functionality, such as remembering your theme preference.</li>
            <li><strong>Advertising cookies</strong> — Google AdSense uses cookies to serve ads and limit the number of times you see an ad. These cookies are set by Google and are subject to Google&apos;s own <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer">Cookie Policy</a>.</li>
            <li><strong>Analytics cookies</strong> — If you consent, Google Analytics may be used to understand how visitors use the site.</li>
          </ul>
          <p>You can manage your cookie preferences at any time through the cookie consent banner displayed on the site.</p>

          <h2>Third-Party Services</h2>
          <p>Zilita uses the following third-party services that may collect data through cookies:</p>
          <ul>
            <li><strong>Google AdSense</strong> — Serves advertisements on the site. Google uses cookies to personalize ads based on your visits to this and other websites. You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>.</li>
            <li><strong>Google Analytics</strong> — Analyzes site traffic. This data is aggregated and anonymized.</li>
          </ul>
          <p>These services may collect information such as your IP address, browser type, and browsing behavior. All data processing by these third parties is governed by their respective privacy policies.</p>

          <h2>Your Rights and Choices</h2>
          <p>You have the following rights regarding your data on Zilita:</p>
          <ul>
            <li><strong>Opt out of personalized ads</strong> — Use the cookie consent banner to decline non-essential cookies, or visit <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>.</li>
            <li><strong>Clear local data</strong> — Any data saved by Zilita tools in your browser can be cleared via your browser settings.</li>
            <li><strong>Use ad blockers</strong> — You may use browser extensions to block advertisements.</li>
          </ul>

          <h2>Data Security</h2>
          <p>Since all processing happens locally in your browser, there are no data transmission risks. The site is served over HTTPS to ensure the code you receive has not been tampered with.</p>

          <h2>Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. Any changes will be posted on this page with an updated effective date.</p>

          <h2>Contact</h2>
          <p>If you have questions about this policy, contact us at <strong>support@zilita.com</strong>.</p>
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

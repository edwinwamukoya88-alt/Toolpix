import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://smart-tools-kit.vercel.app"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "ToolForge does not collect, store, or transmit any personal data. All tools run entirely in your browser. Privacy-first by design.",
  openGraph: {
    title: "Privacy Policy - ToolForge",
    description: "Your privacy matters. ToolForge does not collect, store, or transmit any personal data.",
    url: `${siteUrl}/privacy`,
    images: [{ url: `${siteUrl}/api/og?title=Privacy+Policy&category=Security&type=site`, width: 1200, height: 630, alt: "Privacy Policy - ToolForge" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy - ToolForge",
    description: "Your privacy matters. ToolForge does not collect, store, or transmit any personal data.",
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
            Your privacy matters. Here is how ToolForge handles your data.
          </p>
        </div>
      </section>

      <section className="container py-12">
        <div className="max-w-3xl mx-auto prose prose-invert prose-sm md:prose-base">
          <h2>Data Collection</h2>
          <p>ToolForge does not collect, store, or transmit any personal data. All tools run entirely in your browser using client-side JavaScript. No files, text, or data you input is ever sent to any server.</p>

          <h2>Local Storage</h2>
          <p>Some tools (such as Notes, Task Planner, and Habit Tracker) use your browser&apos;s localStorage to save data locally on your device. This data never leaves your computer. You can clear it at any time via your browser settings.</p>

          <h2>Cookies</h2>
          <p>ToolForge does not use tracking cookies. We may use essential cookies for functionality (such as remembering your theme preference). No third-party analytics or tracking services are used.</p>

          <h2>Third-Party Services</h2>
          <p>ToolForge does not integrate with any third-party analytics, tracking, or advertising networks that collect personal data. Ad placements are rendered client-side and do not share your data with external services.</p>

          <h2>Data Security</h2>
          <p>Since all processing happens locally in your browser, there are no data transmission risks. The site is served over HTTPS to ensure the code you receive has not been tampered with.</p>

          <h2>Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. Any changes will be posted on this page with an updated effective date.</p>

          <h2>Contact</h2>
          <p>If you have questions about this policy, contact us at <strong>support@toolforge.app</strong>.</p>
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

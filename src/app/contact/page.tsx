import type { Metadata } from "next"
import { Mail, MessageSquare, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

import { SITE_URL as siteUrl } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Zilita team. Email us at support@zilita.com for support or ads@zilita.com for advertising inquiries.",
  openGraph: {
    title: "Contact Zilita",
    description: "Reach the Zilita team for support or advertising inquiries.",
    url: `${siteUrl}/contact`,
    images: [{ url: `${siteUrl}/api/og?title=Contact+Zilita&category=Productivity&type=site`, width: 1200, height: 630, alt: "Contact Zilita" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Zilita",
    description: "Reach the Zilita team for support or advertising inquiries.",
  },
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <section className="border-b bg-gradient-to-b from-muted/30 to-background">
        <div className="container py-16 md:py-20 text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Contact Us</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Get in touch with the Zilita team. We are happy to help.
          </p>
        </div>
      </section>

      <section className="container py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-background/40 p-6 text-center space-y-3">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <h2 className="font-semibold">Email</h2>
              <p className="text-sm text-muted-foreground">support@zilita.com</p>
            </div>
            <div className="rounded-xl border bg-background/40 p-6 text-center space-y-3">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h2 className="font-semibold">Ad Inquiries</h2>
              <p className="text-sm text-muted-foreground">ads@zilita.com</p>
            </div>
          </div>

          <div className="rounded-xl border bg-muted/30 p-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              For advertising inquiries, visit our{" "}
              <Link href="/advertise" className="text-primary underline underline-offset-4">
                advertise page
              </Link>.
            </p>
            <p className="text-sm text-muted-foreground">
              For help using tools, check the{" "}
              <Link href="/help" className="text-primary underline underline-offset-4">
                help center
              </Link>.
            </p>
          </div>

          <div className="text-center">
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Home <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

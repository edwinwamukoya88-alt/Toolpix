import type { Metadata } from "next"
import { Mail, MessageSquare, ArrowRight, Clock, HelpCircle, Bug, Megaphone } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

import { SITE_URL as siteUrl } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Zilita team. Email us at support@zilita.com for support or ads@zilita.com for advertising inquiries. We respond within 24-48 hours.",
  openGraph: {
    title: "Contact Zilita",
    description: "Reach the Zilita team for support, bug reports, or advertising inquiries.",
    url: `${siteUrl}/contact`,
    images: [{ url: `${siteUrl}/api/og?title=Contact+Zilita&category=Productivity&type=site`, width: 1200, height: 630, alt: "Contact Zilita" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Zilita",
    description: "Reach the Zilita team for support, bug reports, or advertising inquiries.",
  },
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
}

const contactReasons = [
  {
    icon: HelpCircle,
    title: "General Support",
    email: "support@zilita.com",
    desc: "Questions about using Zilita tools, account-free workflows, or feature requests. We respond to all support inquiries within 24-48 hours on business days.",
  },
  {
    icon: Bug,
    title: "Bug Reports",
    email: "support@zilita.com",
    desc: "Found a tool that is not working correctly? Include your browser name, operating system, and steps to reproduce the issue. Bug reports are prioritized and typically addressed within 48 hours.",
  },
  {
    icon: Megaphone,
    title: "Advertising & Partnerships",
    email: "ads@zilita.com",
    desc: "Zilita offers non-intrusive, privacy-respecting ad placements. We do not use third-party ad networks that track users. Reach out for sponsorship, display ads, or partnership opportunities.",
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <section className="border-b bg-gradient-to-b from-muted/30 to-background">
        <div className="container py-16 md:py-20 text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Contact Us</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Have a question, found a bug, or want to advertise? We are happy to help. Choose the right channel below for the fastest response.
          </p>
        </div>
      </section>

      {/* Contact Channels */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="grid grid-cols-1 gap-4">
            {contactReasons.map((c) => {
              const Icon = c.icon
              return (
                <div
                  key={c.title}
                  className="rounded-xl border bg-background/40 p-6 flex flex-col sm:flex-row gap-4 sm:items-center transition-all duration-300 hover:shadow-md hover:border-primary/20"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h2 className="font-semibold">{c.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                  </div>
                  <div className="shrink-0">
                    <a
                      href={`mailto:${c.email}`}
                      className="inline-flex items-center gap-2 rounded-lg border bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {c.email}
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Response Time */}
      <section className="container pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl border bg-muted/30 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Response Times</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="space-y-1">
                <p className="font-medium text-foreground">General Inquiries</p>
                <p>24-48 hours on business days (Mon-Fri). Weekend inquiries are answered on the following Monday.</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">Bug Reports</p>
                <p>48 hours for acknowledgment. Critical bugs affecting tool functionality are prioritized and addressed faster.</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">Advertising</p>
                <p>3-5 business days for initial response. Partnership discussions may take longer depending on scope.</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">Feature Requests</p>
                <p>We review all feature requests. Popular requests are added to the development roadmap. We may follow up for clarification.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Self-Help Links */}
      <section className="container pb-16">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-center">Before You Email</h2>
          <p className="text-sm text-muted-foreground text-center">
            Many questions are answered instantly in our self-help resources:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/help"
              className="group rounded-xl border bg-background/40 p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:border-primary/20"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Help Center</p>
                <p className="text-xs text-muted-foreground">Searchable FAQ covering tools, privacy, and usage</p>
              </div>
            </Link>
            <Link
              href="/tools"
              className="group rounded-xl border bg-background/40 p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:border-primary/20"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Tools Directory</p>
                <p className="text-xs text-muted-foreground">Browse all 70+ tools with descriptions and usage guides</p>
              </div>
            </Link>
          </div>
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

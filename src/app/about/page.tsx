import type { Metadata } from "next"
import { CheckCircle, Cpu, Lock, Sparkles, Shield, Zap, Asterisk, Globe, Heart, Users, BookOpen, Code, Briefcase, GraduationCap, Palette } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

import { SITE_URL as siteUrl } from "@/lib/constants"

export const metadata: Metadata = {
  title: "About",
  description: "Zilita is a privacy-first suite of 70+ browser-based tools for productivity, education, business, design, and development. No login required. No data collected.",
  openGraph: {
    title: "About Zilita",
    description: "Privacy-first browser tools for productivity, education, business, design, and development. No login required.",
    url: `${siteUrl}/about`,
    images: [{ url: `${siteUrl}/api/og?title=About+Zilita&category=Productivity&type=site`, width: 1200, height: 630, alt: "About Zilita" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Zilita",
    description: "Privacy-first browser tools for productivity, education, business, design, and development. No login required.",
  },
  alternates: {
    canonical: `${siteUrl}/about`,
  },
}

const features = [
  { icon: Asterisk, label: "70+ Tools", desc: "Productivity, education, business, design, development, file conversion, and more" },
  { icon: Lock, label: "No Login Required", desc: "Every tool works instantly with zero account creation or email collection" },
  { icon: Cpu, label: "100% Client-Side", desc: "All processing happens in your browser using JavaScript — nothing is uploaded" },
  { icon: Shield, label: "Privacy-First", desc: "Zero data leaves your device. No analytics, no tracking, no third-party cookies" },
]

const reasons = [
  { icon: Zap, label: "Fast", desc: "No server round-trips. Results appear instantly because processing happens locally in your browser" },
  { icon: Asterisk, label: "Lightweight", desc: "Small footprint, loads quickly on any connection. No bloatware, no unnecessary frameworks" },
  { icon: Shield, label: "Secure", desc: "Everything stays on your machine. HTTPS ensures the code you receive has not been tampered with" },
  { icon: CheckCircle, label: "Free to Use", desc: "No hidden charges, premium tiers, or usage limits. Every tool is available to everyone" },
]

const audiences = [
  { icon: GraduationCap, title: "Teachers & Schools", desc: "Competency-Based Curriculum (CBC) lesson planning, assessment generation, report cards, and schemes of work aligned to KICD standards for Kenyan educators." },
  { icon: Users, title: "Students", desc: "Revision planners, Pomodoro timers, study tools, and calculators designed to help learners stay organized and focused throughout the academic term." },
  { icon: Briefcase, title: "Entrepreneurs & Freelancers", desc: "Invoice generators, business planners, proposal writers, and marketing tools that replace expensive SaaS subscriptions with free, private alternatives." },
  { icon: Code, title: "Developers", desc: "JSON formatters, regex testers, Base64 encoders, DNS lookup, speed tests, and other utilities developers use daily — all accessible without sign-up." },
  { icon: Palette, title: "Designers & Creators", desc: "Color pickers, favicon generators, design card studios, and creative tools for rapid prototyping and content creation." },
  { icon: Globe, title: "Privacy-Conscious Users", desc: "Anyone who wants functional web tools without creating accounts, sharing data, or being tracked across the internet." },
]

const values = [
  {
    title: "Privacy by Design",
    desc: "Every tool on Zilita is built with a client-side-only architecture. This means your files, text, and data are processed entirely within your browser. We have no servers that receive your input, no databases storing your information, and no analytics services monitoring your activity. This is not a policy we follow — it is a technical constraint built into the architecture of every tool.",
  },
  {
    title: "Free Without Conditions",
    desc: "Zilita has no premium tiers, no paywalls, no usage limits, and no hidden charges. Every tool is available to every user with the same functionality. We believe utility tools should be accessible to everyone regardless of budget, location, or technical expertise.",
  },
  {
    title: "Education-First Approach",
    desc: "Our CBC Education Toolkit was built specifically for Kenyan teachers navigating the Competency-Based Curriculum. Every lesson planner, assessment tool, and report card generator is aligned to KICD standards and designed to save educators hours of administrative work each week.",
  },
  {
    title: "Instant Accessibility",
    desc: "No account creation, no email collection, no onboarding flows. Every tool loads and works immediately. This reduces barriers to productivity and ensures that people who need a quick utility can access it without friction.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">

      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-muted/30 to-background">
        <div className="container py-16 md:py-20 text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">About Zilita</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A privacy-first suite of 70+ browser-based tools for productivity, education, business, design, and development. No login. No tracking. Everything runs in your browser.
          </p>
        </div>
      </section>

      {/* What is Zilita */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-center">What is Zilita?</h2>
          <div className="text-muted-foreground space-y-4 leading-relaxed">
            <p>
              Zilita is a browser-based utility platform that provides over 70 free tools across categories including productivity, education, business, design, file conversion, networking, and multimedia. Every tool runs entirely in your browser using client-side JavaScript, which means no data is ever sent to external servers.
            </p>
            <p>
              The platform was created to solve a specific problem: most online tools require account creation, upload personal data to remote servers, or are behind paywalls that limit access. Zilita eliminates all three barriers. Every tool is immediately functional, completely free, and processes everything locally on your device.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="container pb-16">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-center">Our Mission</h2>
          <div className="text-muted-foreground space-y-4 leading-relaxed">
            <p>
              Our mission is to make powerful, useful utilities accessible to everyone without compromising privacy. We believe that using a tool to format JSON, convert a PDF, or plan a lesson should not require handing over your email address or personal data.
            </p>
            <p>
              Zilita is particularly focused on serving communities that are often overlooked by mainstream productivity software. Our CBC Education Toolkit, for example, is purpose-built for Kenyan teachers working with the Competency-Based Curriculum — a niche that no major productivity platform addresses.
            </p>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="container pb-16">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-center">What We Offer</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.label}
                  className="group rounded-xl border bg-background/40 p-5 text-center space-y-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20"
                >
                  <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{f.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{f.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="container pb-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-2xl font-bold tracking-tight text-center">Who We Serve</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {audiences.map((a) => {
              const Icon = a.icon
              return (
                <div
                  key={a.title}
                  className="group rounded-xl border bg-background/40 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold">{a.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Zilita */}
      <section className="container pb-16">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-center">Why Zilita</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {reasons.map((r) => {
              const Icon = r.icon
              return (
                <div
                  key={r.label}
                  className="group rounded-xl border bg-background/40 p-5 text-center space-y-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20"
                >
                  <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{r.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{r.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="container pb-16">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-2xl font-bold tracking-tight text-center">Our Values</h2>
          <div className="space-y-6">
            {values.map((v) => (
              <div key={v.title} className="rounded-xl border bg-background/40 p-6 space-y-3">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  {v.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tool Categories Overview */}
      <section className="container pb-16">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-center">Tool Categories</h2>
          <div className="text-muted-foreground space-y-4 leading-relaxed text-sm">
            <p>
              Zilita organizes its 70+ tools into eleven categories, each designed for a specific use case:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none pl-0">
              <li className="flex items-start gap-2"><span className="text-primary mt-1">&#x2022;</span> <strong>AI Assistant</strong> — Writing, grammar, translation, resume building, and content creation powered by browser-based AI</li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">&#x2022;</span> <strong>Productivity</strong> — Pomodoro timer, Kanban board, notes, habit tracker, day planner, and task management</li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">&#x2022;</span> <strong>Education & CBC</strong> — Lesson planners, assessments, report cards, scheme of work, and grade calculators for Kenyan teachers</li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">&#x2022;</span> <strong>File Conversion</strong> — PDF merger, splitter, compressor, protector, converter, and document converters</li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">&#x2022;</span> <strong>Developer Tools</strong> — JSON formatter, regex tester, Base64, markdown preview, and code utilities</li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">&#x2022;</span> <strong>Design & Creative</strong> — Color picker, favicon generator, design cards, and image placeholders</li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">&#x2022;</span> <strong>Security & Text</strong> — Password generator, text cleaner, URL encoder, and random generators</li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">&#x2022;</span> <strong>QR & Connectivity</strong> — QR code generator, scanner, extractor, and URL shortener</li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">&#x2022;</span> <strong>Calculators</strong> — Loan, mortgage, investment, BMI, currency, tax, and retirement calculators</li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">&#x2022;</span> <strong>Network Monitoring</strong> — Speed test, DNS lookup, IP lookup, ping, and What&apos;s My IP</li>
              <li className="flex items-start gap-2"><span className="text-primary mt-1">&#x2022;</span> <strong>Multimedia</strong> — Video compressor, converter, trimmer, screen recorder, and GIF maker</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-16">
        <div className="max-w-2xl mx-auto rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10 border p-8 md:p-10 text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative space-y-3">
            <h2 className="text-xl md:text-2xl font-bold">Ready to get started?</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">No signup, no tracking, no data leaving your computer. Explore all 70+ tools.</p>
            <Link href="/tools">
              <Button size="lg">
                Browse All Tools
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

import type { Metadata } from "next"
import { CheckCircle, Cpu, Lock, Sparkles, Shield, Zap, Asterisk, Globe } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "About",
  description: "ToolForge is a privacy-first suite of 39+ browser-based tools for productivity, finance, design, education, and development. No login required.",
  openGraph: {
    title: "About ToolForge",
    description: "Privacy-first browser tools for productivity, finance, design, and education. No login required.",
    url: "https://smart-tools-kit.vercel.app/about",
  },
  alternates: {
    canonical: "https://smart-tools-kit.vercel.app/about",
  },
}

const features = [
  { icon: Asterisk, label: "38+ Tools", desc: "From QR codes to finance calculators" },
  { icon: Lock, label: "No Login Required", desc: "Every tool works instantly, no account needed" },
  { icon: Cpu, label: "100% Client-Side", desc: "All processing happens in your browser" },
  { icon: Shield, label: "Privacy-First", desc: "Zero data leaves your device" },
]

const reasons = [
  { icon: Zap, label: "Fast", desc: "No server round-trips — results appear instantly" },
  { icon: Asterisk, label: "Lightweight", desc: "Small footprint, loads quickly, no bloat" },
  { icon: Shield, label: "Secure", desc: "Everything stays on your machine, encrypted in transit" },
  { icon: CheckCircle, label: "Free to Use", desc: "No hidden charges, premium tiers, or paywalls" },
]

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">

      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-muted/30 to-background">
        <div className="container py-16 md:py-20 text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">About ToolForge</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A privacy-first suite of browser-based tools for productivity, finance, and design.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="container py-16">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            ToolForge is built to give users fast, free, and private utilities that run entirely in the browser.
            No servers, no uploads, no accounts — just tools that work the moment you open them.
          </p>
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

      {/* Why ToolForge */}
      <section className="container pb-16">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-center">Why ToolForge</h2>
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

      {/* CTA */}
      <section className="container pb-16">
        <div className="max-w-2xl mx-auto rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10 border p-8 md:p-10 text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative space-y-3">
            <h2 className="text-xl md:text-2xl font-bold">Ready to get started?</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">No signup, no tracking, no data leaving your computer.</p>
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

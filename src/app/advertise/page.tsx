"use client"

import { useState } from "react"
import {
  TrendingUp, Eye, MousePointerClick, LayoutGrid,
  Sparkles, ArrowRight, CheckCircle, Send, ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const stats = [
  { icon: TrendingUp, value: "50,000+", label: "Monthly Users" },
  { icon: Eye, value: "200K+", label: "Monthly Ad Impressions" },
  { icon: MousePointerClick, value: "2.4%", label: "Avg. CTR" },
  { icon: LayoutGrid, value: "38+", label: "Active Tools" },
]

const tiers = [
  {
    name: "Budget Placement",
    slot: "footer",
    price: "$20–$40",
    period: "/week",
    badge: null,
    desc: "Bottom page visibility — affordable entry point",
    features: [
      "Footer placement on all pages",
      "Rotated with other ads",
      "~500–1K weekly impressions",
      "Basic click tracking",
    ],
    highlighted: false,
  },
  {
    name: "Standard Placement",
    slot: "mid",
    price: "$40–$70",
    period: "/week",
    badge: "Popular",
    desc: "Between tool sections — prime mid-page exposure",
    features: [
      "Mid-page placement on homepage",
      "Rotated with other ads",
      "~1K–3K weekly impressions",
      "Impression + click tracking",
      "Basic analytics report",
    ],
    highlighted: true,
  },
  {
    name: "Premium Placement",
    slot: "hero",
    price: "$50–$100",
    period: "/week",
    badge: "Most Visible",
    desc: "Top homepage visibility — maximum exposure",
    features: [
      "Hero section on homepage",
      "Priority rotation",
      "~3K–5K+ weekly impressions",
      "Full impression + click tracking",
      "Monthly analytics report",
      "Priority support",
    ],
    highlighted: false,
  },
]

const steps = [
  { number: "01", title: "Choose Your Slot", desc: "Select the placement that fits your campaign goals and budget." },
  { number: "02", title: "Submit Your Ad", desc: "Fill in your details, upload creative, and we'll review within 24 hours." },
  { number: "03", title: "Go Live", desc: "Once approved, your ad starts running immediately with full tracking." },
]

export default function AdvertisePage() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    adTitle: "",
    linkUrl: "",
    description: "",
    slot: "hero",
    imageUrl: "",
  })
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { ...form, submittedAt: new Date().toISOString() }
    console.log("Ad submission:", payload)
    try {
      const existing = JSON.parse(localStorage.getItem("toolforge_ad_requests") || "[]")
      existing.push(payload)
      localStorage.setItem("toolforge_ad_requests", JSON.stringify(existing))
    } catch {
      // localStorage unavailable
    }
    setSubmitted(true)
    setForm({ name: "", company: "", email: "", adTitle: "", linkUrl: "", description: "", slot: "hero", imageUrl: "" })
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-muted/30 to-background">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="container py-16 md:py-20 text-center space-y-6 relative">
          <div className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-medium text-muted-foreground bg-background/50 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Sponsored ad marketplace
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Advertise With <span className="text-primary">ToolForge</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Reach thousands of users using privacy-first productivity tools, planners, converters, and finance calculators.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <a href="#pricing">
              <Button size="lg">
                View Pricing
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </a>
            <a href="#contact">
              <Button variant="outline" size="lg">
                Contact Us
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.label}
                className="group rounded-xl border bg-background/40 p-4 text-center space-y-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20"
              >
                <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xl font-bold tabular-nums">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="container pb-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Choose Your Placement</h2>
            <p className="text-muted-foreground">Transparent pricing with full performance tracking</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-xl border p-6 space-y-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  tier.highlighted
                    ? "border-primary/30 bg-gradient-to-b from-primary/[0.04] to-background shadow-md shadow-primary/5"
                    : "bg-background/40"
                }`}
              >
                {tier.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    {tier.badge}
                  </span>
                )}
                <div className="text-center pt-2">
                  <h3 className="font-semibold text-lg">{tier.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{tier.desc}</p>
                  <div className="mt-3">
                    <span className="text-2xl font-bold">{tier.price}</span>
                    <span className="text-sm text-muted-foreground">{tier.period}</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#form"
                  className={`block w-full rounded-lg py-2 text-center text-sm font-medium transition-colors ${
                    tier.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border bg-background hover:bg-muted"
                  }`}
                >
                  Book This Slot
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="border-t bg-muted/30 pb-16">
        <div className="container pt-16 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">How It Works</h2>
            <p className="text-muted-foreground">From selection to launch in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {steps.map((step) => (
              <div key={step.number} className="rounded-xl border bg-background p-6 space-y-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                  {step.number}
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Submission Form ─── */}
      <section id="form" className="container py-16">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Submit Your Ad</h2>
            <p className="text-muted-foreground">Fill in the details and we&apos;ll review your submission within 24 hours</p>
          </div>

          {submitted ? (
            <div className="rounded-xl border bg-background p-8 text-center space-y-3">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold">Submission Received!</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                We&apos;ll review your ad and get back to you within 24 hours. You can track your submission status soon.
              </p>
              <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                Submit Another
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-xl border bg-background p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Company</label>
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Company name"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Email *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@company.com"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Ad Title *</label>
                <input
                  name="adTitle"
                  value={form.adTitle}
                  onChange={handleChange}
                  required
                  placeholder="Streamline Your Business Workflow"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Link URL *</label>
                  <input
                    name="linkUrl"
                    type="url"
                    value={form.linkUrl}
                    onChange={handleChange}
                    required
                    placeholder="https://example.com"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Placement Slot *</label>
                  <select
                    name="slot"
                    value={form.slot}
                    onChange={handleChange}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  >
                    <option value="hero">Hero (Premium)</option>
                    <option value="mid">Mid (Standard)</option>
                    <option value="footer">Footer (Budget)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Brief description of your ad (max 2 lines shown)"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Image URL (optional)</label>
                <input
                  name="imageUrl"
                  type="url"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                Submit Ad Request
              </button>
              <p className="text-xs text-muted-foreground">
                By submitting, you agree to our{" "}
                <Link href="/terms" className="underline underline-offset-2">terms</Link>.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ─── Contact ─── */}
      <section id="contact" className="container pb-16">
        <div className="max-w-2xl mx-auto rounded-xl border bg-gradient-to-br from-primary/[0.04] to-background p-8 text-center space-y-3">
          <h2 className="text-xl font-bold">Want Custom Placements?</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            We offer custom sponsorship packages, direct integrations, and bulk deals.
          </p>
          <p className="text-sm font-medium">
            Contact us at:{" "}
            <a href="mailto:ads@toolforge.app" className="text-primary underline underline-offset-4">
              ads@toolforge.app
            </a>
          </p>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="container pb-16">
        <div className="max-w-2xl mx-auto rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10 border p-8 md:p-10 text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative space-y-3">
            <h2 className="text-xl md:text-2xl font-bold">Ready to reach ToolForge users?</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">Book your slot today and start reaching thousands of privacy-conscious users.</p>
            <a href="#pricing">
              <Button size="lg">
                View Pricing <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

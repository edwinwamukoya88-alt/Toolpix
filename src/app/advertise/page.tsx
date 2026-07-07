import Link from "next/link"
import {
  ShieldCheck,
  Target,
  Sparkles,
  Zap,
  LayoutGrid,
  Star,
  BookOpen,
  Layers,
  Mail,
  Send,
  Rocket,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const benefits = [
  {
    icon: ShieldCheck,
    title: "Privacy-First Audience",
    desc: "Reach users who value privacy — teachers, students, developers, and creators who choose ToolForge for its zero-tracking approach.",
  },
  {
    icon: Target,
    title: "High-Intent Visitors",
    desc: "Engage people actively solving problems with productivity, education, and development tools.",
  },
  {
    icon: Sparkles,
    title: "Premium Brand Placement",
    desc: "Non-intrusive sponsorships that integrate naturally into the browsing experience.",
  },
  {
    icon: Zap,
    title: "Fast & Modern Platform",
    desc: "Lightning-fast tools built with modern technology — your brand appears on a high-performance site.",
  },
]

const options = [
  {
    icon: LayoutGrid,
    title: "Homepage Sponsor",
    desc: "Premium above-the-fold placement on the homepage for maximum brand visibility.",
  },
  {
    icon: Star,
    title: "Featured Tool",
    desc: "Highlighted placement inside the Popular Tools section where users browse daily.",
  },
  {
    icon: BookOpen,
    title: "Sponsored Blog",
    desc: "SEO-optimized sponsored content that reaches engaged readers and builds authority.",
  },
  {
    icon: Layers,
    title: "Category Sponsor",
    desc: "Own an entire tool category with sustained branding across related pages.",
  },
]

const steps = [
  { icon: Mail, title: "Contact Us", desc: "Reach out and tell us about your brand and campaign goals." },
  { icon: LayoutGrid, title: "Choose Placement", desc: "Select the sponsorship option that best fits your objectives." },
  { icon: Rocket, title: "Launch Campaign", desc: "We activate your campaign and share performance data." },
]

export default function AdvertisePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden py-20 md:py-28 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-purple-500/[0.07]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Advertise on{" "}
              <span className="text-primary">ToolForge</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Reach teachers, students, developers, creators, and businesses
              through privacy-first browser tools designed for productivity and
              learning.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="gap-2 h-12 px-7 text-base rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97] transition-all duration-300"
                >
                  Advertise With Us
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 h-12 px-7 text-base rounded-xl border-white/10 hover:bg-white/[0.04] hover:border-primary/30 active:scale-[0.97] transition-all duration-300"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHY TOOLFORGE ─── */}
      <section className="container py-16 md:py-20">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Why <span className="text-primary">ToolForge</span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              A premium environment for your brand
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-sm p-6 space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30"
                >
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-sm text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── SPONSORSHIP OPPORTUNITIES ─── */}
      <section className="container pb-16 md:pb-20">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Sponsorship{" "}
              <span className="text-primary">Opportunities</span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Choose the placement that fits your goals
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {options.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-sm p-6 space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 flex flex-col"
                >
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-semibold text-sm text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── SIMPLE PROCESS ─── */}
      <section className="container pb-16 md:pb-20">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Simple{" "}
              <span className="text-primary">Process</span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              From contact to launch in three steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            <div
              className="hidden md:block absolute top-6 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 pointer-events-none"
              aria-hidden="true"
            />
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <div
                  key={step.title}
                  className="relative flex flex-col items-center text-center space-y-3"
                >
                  <div className="relative flex items-center justify-center h-12 w-12 rounded-full border border-white/5 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm z-10 shadow-lg shadow-primary/5">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs text-primary/50 font-mono font-medium">
                        0{i + 1}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {step.title}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
                      {step.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="container pb-16 md:pb-20">
        <div className="relative rounded-3xl border border-white/[0.06] bg-gradient-to-br from-primary/[0.04] via-card/60 to-purple-500/[0.04] backdrop-blur-xl p-10 md:p-16 text-center space-y-6 overflow-hidden shadow-[0_0_0_1px_hsl(var(--border)/0.2),0_8px_40px_hsl(var(--primary)/0.06)]">
          <div
            className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[150px] pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-32 -left-32 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative space-y-5">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mx-auto">
              <Send className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to Advertise on{" "}
              <span className="text-primary">ToolForge?</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed">
              We&apos;d love to learn about your business and recommend the
              best sponsorship opportunities for your goals.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="gap-2 h-12 px-7 text-base rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97] transition-all duration-300"
                >
                  Advertise With Us
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 h-12 px-7 text-base rounded-xl border-white/10 hover:bg-white/[0.04] hover:border-primary/30 active:scale-[0.97] transition-all duration-300"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

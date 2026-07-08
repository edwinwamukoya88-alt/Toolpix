import type { Metadata } from "next"
import Link from "next/link"
import {
  Download,
  Users,
  TrendingUp,
  LayoutGrid,
  BarChart3,
  Mail,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Media Kit | ToolForge Advertising",
  description:
    "Download the ToolForge media kit with audience insights, traffic data, sponsorship opportunities, and pricing information.",
  robots: { index: true, follow: true },
}

const sections = [
  {
    icon: Users,
    title: "Audience Overview",
    items: [
      "Teachers and education professionals",
      "Students (K-12 and higher education)",
      "Software developers and engineers",
      "Small business owners and entrepreneurs",
      "Content creators and designers",
      "Productivity enthusiasts",
    ],
  },
  {
    icon: BarChart3,
    title: "Platform Metrics",
    items: [
      "43+ free browser-based tools and growing",
      "Privacy-first, no-login platform",
      "Client-side processing — zero tracking",
      "Growing daily active user base",
      "Global audience across multiple countries",
      "Detailed analytics available upon request",
    ],
  },
  {
    icon: LayoutGrid,
    title: "Sponsorship Options",
    items: [
      "Homepage sponsorship — premium above-the-fold placement",
      "Featured tool placement — inside popular tools grid",
      "Sponsored blog articles — SEO-optimized content",
      "Category sponsorship — own an entire tool category",
      "Newsletter sponsorship — coming soon",
      "Custom integration packages available",
    ],
  },
  {
    icon: TrendingUp,
    title: "Why Advertise Here",
    items: [
      "Highly engaged productivity-focused audience",
      "Privacy-conscious users who trust the platform",
      "Non-intrusive, premium ad placements",
      "Clean browsing experience with no popups",
      "Transparent reporting and analytics",
      "Flexible campaign durations and budgets",
    ],
  },
]

export default function MediaKitPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-muted/30 to-background">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="container py-16 md:py-20 text-center space-y-6 relative">
          <div className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-medium text-muted-foreground bg-background/50 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Advertising resources
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            ToolForge <span className="text-primary">Media Kit</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Everything you need to know about advertising on ToolForge —
            audience insights, sponsorship options, and platform metrics.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button size="lg" className="gap-2">
              <Download className="h-4 w-4" />
              Download Media Kit (PDF)
            </Button>
            <Link href="/advertise">
              <Button variant="outline" size="lg">
                View Pricing
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Sections ─── */}
      <section className="container py-16 md:py-20">
        <div className="max-w-4xl mx-auto space-y-12">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <div key={section.title} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="md:hidden">
                    <h2 className="font-bold text-lg">{section.title}</h2>
                  </div>
                </div>
                <div className="hidden md:block">
                  <h2 className="font-bold text-lg">{section.title}</h2>
                </div>
                <div className="md:col-span-2">
                  <ul className="space-y-3">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-sm text-muted-foreground"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── Contact ─── */}
      <section className="container pb-16 md:pb-20">
        <div className="max-w-2xl mx-auto rounded-2xl border bg-gradient-to-br from-primary/[0.04] to-background p-8 md:p-10 text-center space-y-4">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mx-auto">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Get In Touch</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Ready to start advertising? Reach out to our team for customized
            sponsorship packages and media kit inquiries.
          </p>
          <div className="pt-2">
            <a
              href="mailto:ads@toolforge.app"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
            >
              ads@toolforge.app
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

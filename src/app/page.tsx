import Link from "next/link"
import {
  ArrowRight, Palette, QrCode, Zap, Shield, Code, FileUp, DollarSign,
  Sparkles, Lock, Zap as ZapIcon, Activity, Globe, Eye, Users,
  LayoutGrid, Brain, GraduationCap, Shield as ShieldIcon, Wifi, FileSymlink, Terminal, PenTool, TrendingUp, CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import ToolCard from "@/components/tool-card"
import { tools, categories } from "@/lib/tools-data"
import { getLatestPosts } from "@/lib/blog"
import BlogCard from "@/components/blog/blog-card"
import AdSlot from "@/components/ads/AdSlot"
import type { LucideIcon } from "lucide-react"

const catIconMap: Record<string, LucideIcon> = {
  Productivity: Brain,
  "Education & CBC Tools": GraduationCap,
  "Security & Text": ShieldIcon,
  "QR & Connectivity": Wifi,
  "File Conversion": FileSymlink,
  "Developer Tools": Terminal,
  "Design & Creative": PenTool,
  "Finance Tools": TrendingUp,
}

const catDescriptions: Record<string, string> = {
  Productivity: "Organize tasks, notes, and time with daily planners and trackers",
  "Education & CBC Tools": "Tools for teachers, students, and CBC curriculum planning",
  "Security & Text": "Encrypt, encode, and clean text securely",
  "QR & Connectivity": "Create, scan, and decode QR codes",
  "File Conversion": "Transform files between formats",
  "Developer Tools": "Format, validate, and convert code",
  "Design & Creative": "Generate colors, favicons, and images",
  "Finance Tools": "Calculate, convert, and track finances",
}

export default function HomePage() {
  return (
    <div>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-purple-500/[0.07]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="container relative">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-medium text-muted-foreground bg-background/50 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Privacy-first. No login required.
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Smart Utility Tools for <span className="text-primary">Every Task</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Todo lists, notes, grade calculators, lesson plans, and more — all processing stays in your browser.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/tools">
                <Button size="lg" className="gap-2">
                  Explore Tools
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/tools?category=Productivity">
                <Button variant="outline" size="lg">
                  View Popular
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-16">
            {[
              { value: "39+", label: "Daily Tools", icon: LayoutGrid },
              { value: "100%", label: "Private", icon: Lock },
              { value: "Instant", label: "Browser-Based", icon: Globe },
              { value: "0", label: "No Login Required", icon: Users as LucideIcon },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="group rounded-xl border bg-background/40 backdrop-blur-sm p-4 text-center space-y-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20"
                >
                  <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xl font-bold tabular-nums">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Ad: Below hero */}
      <div className="container flex justify-center">
        <AdSlot type="sponsored" slot="hero" />
      </div>

      {/* ─── Categories ─── */}
      <section className="container py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold">Browse by Category</h2>
          <p className="text-sm text-muted-foreground mt-1">Find exactly what you need, fast</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {categories.map((cat) => {
            const Icon = catIconMap[cat] || Palette
            return (
              <Link
                key={cat}
                href={`/tools?category=${encodeURIComponent(cat)}`}
                className="group flex flex-col gap-3 rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30"
              >
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{cat}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{catDescriptions[cat]}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Ad: Between categories and featured */}
      <div className="container flex justify-center">
        <AdSlot type="adsense" slot="2345678901" />
      </div>

      {/* ─── Popular Tools ─── */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Popular Tools</h2>
            <p className="text-sm text-muted-foreground mt-1">Quick access to the most used utilities</p>
          </div>
          <Link href="/tools">
            <Button variant="outline" size="sm">
              View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tools.slice(0, 12).map((tool) => (
            <ToolCard key={tool.slug} {...tool} />
          ))}
        </div>
      </section>

      {/* ─── Latest From The Blog ─── */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Latest From The Blog</h2>
            <p className="text-sm text-muted-foreground mt-1">Guides, tutorials, and insights from the ToolForge team</p>
          </div>
          <Link href="/blog">
            <Button variant="outline" size="sm">
              View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {getLatestPosts(3).map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      {/* Ad: Near footer */}
      <div className="container flex justify-center">
        <AdSlot type="adsense" slot="3456789012" />
      </div>

      {/* ─── CTA ─── */}
      <section className="container py-16">
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10 border p-8 md:p-12 text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold">Start Using Tools Instantly</h2>
            <p className="text-muted-foreground max-w-md mx-auto">No signup, no tracking, no data leaving your computer. Just pure utility.</p>
            <div className="pt-4">
              <Link href="/tools">
                <Button size="lg">
                  Browse All 39+ Tools <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trusted By ─── */}
      <section className="container py-16">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
            Built for creators, developers, businesses, and students worldwide
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "39+ Free Tools", icon: LayoutGrid },
              { value: "100% Privacy-First", icon: Shield },
              { value: "No Login Required", icon: Lock },
              { value: "Client-Side Processing", icon: Globe },
            ].map((badge) => {
              const Icon = badge.icon
              return (
                <div
                  key={badge.value}
                  className="group rounded-xl border bg-background/40 p-4 text-center space-y-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20"
                >
                  <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-semibold leading-snug">{badge.value}</div>
                </div>
              )
            })}
          </div>

          <div className="relative overflow-hidden rounded-xl border bg-background/40 py-4">
            <style>{`
              .marquee-track {
                display: flex;
                gap: 2rem;
                animation: marquee 30s linear infinite;
                width: max-content;
              }
              .marquee-track:hover {
                animation-play-state: paused;
              }
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>
            <div className="marquee-track">
              {Array.from({ length: 2 }).map((_, dup) => (
                <div key={dup} className="flex gap-2 shrink-0">
                  {[
                    { emoji: "🎨", label: "Designers" },
                    { emoji: "💻", label: "Developers" },
                    { emoji: "📊", label: "Businesses" },
                    { emoji: "🎓", label: "Students" },
                    { emoji: "🚀", label: "Creators" },
                    { emoji: "🔒", label: "Privacy-First Users" },
                    { emoji: "⚡", label: "Productivity Enthusiasts" },
                    { emoji: "📁", label: "File Managers" },
                    { emoji: "🌍", label: "Global Users" },
                    { emoji: "📱", label: "Mobile Users" },
                  ].map((item) => (
                    <span
                      key={`${dup}-${item.label}`}
                      className="inline-flex items-center gap-1.5 rounded-full border bg-background px-4 py-1.5 text-sm whitespace-nowrap"
                    >
                      <span>{item.emoji}</span>
                      <span className="font-medium">{item.label}</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

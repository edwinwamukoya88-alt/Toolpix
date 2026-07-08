import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight, Sparkles, Calculator, Timer, BookOpen, Zap,
  Brain, GraduationCap, Shield, Wifi, FileSymlink, Terminal, PenTool, Activity,
  Palette, Lock, Globe, Target, Star, Gauge, Menu, Heart, Layers, Rocket,
  LayoutGrid, Users, Clock, Folder, Smartphone, Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import ToolCard from "@/components/tool-card"
import { tools, categories } from "@/lib/tools-data"
import { getLatestPosts } from "@/lib/blog"
import BlogCard from "@/components/blog/blog-card"
import AdSlot from "@/components/ads/AdSlot"
import type { LucideIcon } from "lucide-react"
import AdvertiseCTA from "@/components/home/advertise-cta"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://smart-tools-kit.vercel.app"

export const metadata: Metadata = {
  title: "ToolForge — 44+ Free Privacy-First Online Tools",
  description: "44+ free browser-based tools for teachers, students, developers, creators, and businesses. Privacy-first, no login required, 100% client-side processing.",
  openGraph: {
    title: "ToolForge — Free Privacy-First Online Tools",
    description: "Plan lessons, manage tasks, create content, and boost productivity — all in your browser. No data ever leaves your device.",
    url: siteUrl,
    images: [{ url: `${siteUrl}/api/og?title=ToolForge&category=Productivity&type=site`, width: 1200, height: 630, alt: "ToolForge" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ToolForge — Free Privacy-First Online Tools",
    description: "Plan lessons, manage tasks, create content, and boost productivity — all in your browser. No data ever leaves your device.",
  },
  alternates: {
    canonical: siteUrl,
  },
}

const catIconMap: Record<string, LucideIcon> = {
  "AI Assistant": Sparkles,
  Productivity: Brain,
  "Education & CBC Tools": GraduationCap,
  "Security & Text": Shield,
  "QR & Connectivity": Wifi,
  "File Conversion": FileSymlink,
  "Developer Tools": Terminal,
  "Design & Creative": PenTool,
  "Network Monitoring": Activity,
  "Essential Calculators": Calculator,
  Multimedia: Layers,
}

const catDescriptions: Record<string, string> = {
  "AI Assistant": "All-in-one AI writing, education (CBC), and design assistant",
  Productivity: "Organize tasks, notes, and time with daily planners and trackers",
  "Education & CBC Tools": "Tools for teachers, students, and CBC curriculum planning",
  "Security & Text": "Encrypt, encode, and clean text securely",
  "QR & Connectivity": "Create, scan, and decode QR codes",
  "File Conversion": "Transform files between formats",
  "Developer Tools": "Format, validate, and convert code",
  "Design & Creative": "Generate colors, favicons, and images",
  "Network Monitoring": "Test speed, lookup IPs, ping hosts, and analyze DNS records",
  "Essential Calculators": "Calculate loans, interest, budgets, and more",
  Multimedia: "Edit, convert, and compress video and audio files",
}

const categoryGradients: Record<string, string> = {
  "AI Assistant": "from-primary/20 via-purple-500/10 to-transparent",
  Productivity: "from-blue-500/10 via-cyan-500/5 to-transparent",
  "Education & CBC Tools": "from-emerald-500/10 via-teal-500/5 to-transparent",
  "Security & Text": "from-purple-500/10 via-pink-500/5 to-transparent",
  "QR & Connectivity": "from-orange-500/10 via-amber-500/5 to-transparent",
  "File Conversion": "from-indigo-500/10 via-blue-500/5 to-transparent",
  "Developer Tools": "from-sky-500/10 via-indigo-500/5 to-transparent",
  "Design & Creative": "from-rose-500/10 via-pink-500/5 to-transparent",
  "Network Monitoring": "from-cyan-500/10 via-blue-500/5 to-transparent",
  "Essential Calculators": "from-green-500/10 via-emerald-500/5 to-transparent",
  Multimedia: "from-violet-500/10 via-purple-500/5 to-transparent",
}

const categoryIconColors: Record<string, string> = {
  "AI Assistant": "text-primary",
  Productivity: "text-blue-400",
  "Education & CBC Tools": "text-emerald-400",
  "Security & Text": "text-purple-400",
  "QR & Connectivity": "text-orange-400",
  "File Conversion": "text-indigo-400",
  "Developer Tools": "text-sky-400",
  "Design & Creative": "text-rose-400",
  "Network Monitoring": "text-cyan-400",
  "Essential Calculators": "text-green-400",
  Multimedia: "text-violet-400",
}

const featureTools = [
  { slug: "grade-calculator", name: "CBC Grade Calculator", icon: Calculator, desc: "Compute scores and competency levels per KICD" },
  { slug: "lesson-plan-generator", name: "CBC Lesson Planner", icon: BookOpen, desc: "Generate KICD-compliant lesson plans" },
  { slug: "pomodoro", name: "Pomodoro Timer", icon: Timer, desc: "Stay focused with timed intervals" },
  { slug: "notes", name: "Notes App", icon: Menu, desc: "Write and organize notes locally" },
  { slug: "habit-tracker", name: "Habit Tracker", icon: Target, desc: "Build streaks and track daily habits" },
  { slug: "day-planner", name: "Day Planner", icon: Calendar, desc: "Plan your day hour by hour" },
  { slug: "kanban", name: "Kanban Board", icon: LayoutGrid, desc: "Organize with drag-and-drop boards" },
  { slug: "revision-planner", name: "CBC Learning & Revision Planner", icon: GraduationCap, desc: "Plan skill-based practice and revision with curriculum-aligned tools" },
  { slug: "speed-test", name: "Internet Speed Test", icon: Gauge, desc: "Test download, upload, ping, and jitter" },
  { slug: "whats-my-ip", name: "What's My IP", icon: Globe, desc: "View your public IP and network info" },
  { slug: "dns-lookup", name: "DNS Lookup", icon: Activity, desc: "Look up A, MX, TXT, and other DNS records" },
  { slug: "ping-test", name: "Ping Test", icon: Zap, desc: "Measure latency and packet loss" },
]

const heroQuickLinks = [
  { href: "/tools/grade-calculator", label: "CBC Grade Calculator", icon: Calculator },
  { href: "/tools/pomodoro", label: "Pomodoro Timer", icon: Timer },
  { href: "/tools/lesson-plan-generator", label: "Lesson Planner", icon: BookOpen },
  { href: "/tools/speed-test", label: "Speed Test", icon: Gauge },
]

const audienceItems = [
  { icon: GraduationCap, label: "Teachers" },
  { icon: Users, label: "Students" },
  { icon: Sparkles, label: "Creators" },
  { icon: Terminal, label: "Developers" },
  { icon: LayoutGrid, label: "Businesses" },
]

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "ToolForge",
            url: siteUrl,
            logo: `${siteUrl}/favicon.svg`,
            description: "44+ free browser-based tools for teachers, students, developers, creators, and businesses. Privacy-first, no login required, 100% client-side processing.",
            sameAs: [],
          }),
        }}
      />
      <div>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden py-20 md:py-28 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-purple-500/[0.07]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-purple-500/[0.04] to-transparent pointer-events-none" />

        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-medium text-muted-foreground bg-background/50 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Privacy-first &middot; No login required &middot; 44+ tools
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              44+ Free Browser Tools for{" "}
              <span className="text-primary">Teachers, Students, Developers &amp; Businesses</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Everything runs locally in your browser.
              <br />
              No login. No tracking. Privacy-first.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/tools">
                <Button size="lg" className="gap-2 h-12 px-7 text-base rounded-xl">
                  Start Using Tools
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/tools">
                <Button variant="outline" size="lg" className="h-12 px-7 text-base rounded-xl">
                  Browse Categories
                </Button>
              </Link>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-xs text-muted-foreground tracking-wide uppercase font-medium">Try instantly:</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {heroQuickLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 backdrop-blur-sm px-3.5 py-1.5 text-sm font-medium hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {link.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Glass stat badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <div className="inline-flex items-center gap-2 rounded-2xl border bg-background/40 backdrop-blur-sm px-5 py-2.5">
                <Star className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">44+ Free Tools</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border bg-background/40 backdrop-blur-sm px-5 py-2.5">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold">100% Privacy-First</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border bg-background/40 backdrop-blur-sm px-5 py-2.5">
                <Lock className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-semibold">No Login Required</span>
              </div>
            </div>

            {/* Audience chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {audienceItems.map((item) => {
                const Icon = item.icon
                return (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 backdrop-blur-sm px-3.5 py-1.5 text-sm font-medium hover:bg-background/80 transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{item.label}</span>
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Ad: Below hero */}
      <div className="container flex justify-center">
        <AdSlot type="sponsored" slot="hero" />
      </div>

      {/* ─── Problem → Solution ─── */}
      <section className="container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6 md:p-8 space-y-4">
            <h3 className="text-lg font-semibold text-red-500 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10 text-red-500 text-xs font-bold">!</span>
              The Old Way
            </h3>
            <ul className="space-y-3">
              {[
                { icon: Terminal, label: "Scattered tools everywhere" },
                { icon: BookOpen, label: "Manual planning" },
                { icon: Clock, label: "Slow workflows" },
                { icon: LayoutGrid, label: "No structure" },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.label} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Icon className="h-4 w-4 text-red-400 shrink-0" />
                    <span>{item.label}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.03] p-6 md:p-8 space-y-4">
            <h3 className="text-lg font-semibold text-green-500 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/10 text-green-500">✓</span>
              The ToolForge Way
            </h3>
            <ul className="space-y-3">
              {[
                { icon: Globe, label: "Everything in browser" },
                { icon: Zap, label: "Structured productivity system" },
                { icon: Rocket, label: "Instant tools access" },
                { icon: Heart, label: "Organized workflow for teachers, students, and businesses" },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.label} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Icon className="h-4 w-4 text-green-400 shrink-0" />
                    <span>{item.label}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section className="container py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Browse by Category</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">Find exactly what you need, fast</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const isAi = cat === "AI Assistant"
            const Icon = catIconMap[cat] || Palette
            const gradient = categoryGradients[cat]
            const iconColor = categoryIconColors[cat]
            return (
              <Link
                key={cat}
                href={isAi ? "/tools/ai-workspace" : `/tools?category=${encodeURIComponent(cat)}`}
                className={cn(
                  "group relative flex flex-col gap-4 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden",
                  isAi
                    ? "border-2 border-primary/30 bg-gradient-to-br from-primary/[0.08] via-primary/[0.04] to-purple-500/[0.06] hover:shadow-primary/10"
                    : "border bg-card/40 hover:shadow-primary/5 hover:border-primary/30"
                )}
              >
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                  gradient
                )} />
                {isAi && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-40 pointer-events-none" />
                )}
                <div className="relative">
                  <div className={cn(
                    "inline-flex items-center justify-center h-12 w-12 rounded-xl group-hover:scale-110 transition-transform duration-300",
                    isAi
                      ? "bg-gradient-to-br from-primary/30 to-primary/10"
                      : "bg-gradient-to-br from-primary/20 to-primary/5"
                  )}>
                    <Icon className={cn("h-6 w-6 transition-colors", iconColor)} />
                  </div>
                </div>
                <div className="relative space-y-1">
                  <h3 className={cn("font-semibold group-hover:text-primary transition-colors", isAi && "text-primary")}>{cat}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{catDescriptions[cat]}</p>
                </div>
                {isAi && (
                  <div className="relative">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary text-xs font-medium px-2.5 py-0.5">
                      <Sparkles className="h-3 w-3" />
                      New
                    </span>
                  </div>
                )}
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
      <section className="container py-16 md:py-20">
        <div className="flex items-end justify-between mb-10">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Popular Tools</h2>
            <p className="text-muted-foreground">Quick access to the most used utilities</p>
          </div>
          <Link href="/tools" className="hidden sm:block">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tools.slice(0, 12).map((tool) => (
            <ToolCard key={tool.slug} {...tool} />
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link href="/tools">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
              View All Tools <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── Featured Tools ─── */}
      <section className="container py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Your Most-Used Tools</h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">Start with our most popular utilities — all free, all private</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featureTools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group rounded-2xl border bg-card/40 p-5 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30"
              >
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{tool.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tool.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ─── Teacher CTA ─── */}
      <section className="container py-12 md:py-16">
        <Link
          href="/tools/lesson-plan-generator"
          className="group block rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/[0.08] to-purple-500/[0.08] p-8 md:p-12 text-center space-y-4 relative overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative space-y-3">
            <GraduationCap className="h-8 w-8 mx-auto text-primary" />
            <p className="text-xl md:text-2xl font-semibold tracking-tight">
              Are you a teacher? Try CBC Lesson Planner
            </p>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Generate KICD-compliant lesson plans with competencies, PCIs, and assessments in minutes.
            </p>
            <div className="pt-2">
              <Button size="lg" className="gap-2 rounded-xl">
                Open Lesson Planner
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </div>
        </Link>
      </section>

      {/* ─── Latest From The Blog ─── */}
      <section className="container py-16 md:py-20">
        <div className="flex items-end justify-between mb-10">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Latest From The Blog</h2>
            <p className="text-muted-foreground">Guides, tutorials, and insights from the ToolForge team</p>
          </div>
          <Link href="/blog" className="hidden sm:block">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {getLatestPosts(3).map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link href="/blog">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
              View All Posts <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Ad: Near footer */}
      <div className="container flex justify-center">
        <AdSlot type="adsense" slot="3456789012" />
      </div>

      {/* ─── CTA ─── */}
      <section className="container py-20 md:py-24">
        <div className="relative rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-purple-500/10 border p-10 md:p-16 text-center space-y-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          <div className="relative space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Start Using Tools Instantly</h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed">
              No signup, no tracking, no data leaving your computer. Just pure utility.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/tools">
                <Button size="lg" className="gap-2 h-12 px-7 text-base rounded-xl">
                  Browse All Tools <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/blog">
                <Button variant="outline" size="lg" className="h-12 px-7 text-base rounded-xl">
                  Read the Blog
                </Button>
              </Link>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-background/40 backdrop-blur-sm px-4 py-1.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              Your data never leaves your device
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trusted By ─── */}
      <section className="container py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
            Built for creators, developers, businesses, and students worldwide
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "44+ Free Tools", icon: LayoutGrid },
              { value: "100% Privacy-First", icon: Shield },
              { value: "No Login Required", icon: Lock },
              { value: "Client-Side Processing", icon: Globe },
            ].map((badge) => {
              const Icon = badge.icon
              return (
                <div
                  key={badge.value}
                  className="group rounded-2xl border bg-card/40 p-5 text-center space-y-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/20"
                >
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-sm font-semibold leading-snug">{badge.value}</div>
                </div>
              )
            })}
          </div>

          <div className="relative overflow-hidden rounded-2xl border bg-card/40 py-5">
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
                    { icon: Palette, label: "Designers" },
                    { icon: Terminal, label: "Developers" },
                    { icon: LayoutGrid, label: "Businesses" },
                    { icon: Users, label: "Students" },
                    { icon: Sparkles, label: "Creators" },
                    { icon: Shield, label: "Privacy-First Users" },
                    { icon: Zap, label: "Productivity Enthusiasts" },
                    { icon: Folder, label: "File Managers" },
                    { icon: Globe, label: "Global Users" },
                    { icon: Smartphone, label: "Mobile Users" },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <span
                        key={`${dup}-${item.label}`}
                        className="inline-flex items-center gap-1.5 rounded-full border bg-background px-4 py-1.5 text-sm whitespace-nowrap"
                      >
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{item.label}</span>
                      </span>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AdvertiseCTA />
    </div>
    </>
  )
}

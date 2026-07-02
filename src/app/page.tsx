import type { Metadata } from "next"
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

export const metadata: Metadata = {
  title: "ToolForge — 39+ Free Privacy-First Online Tools",
  description: "39+ free browser-based tools for teachers, students, developers, creators, and businesses. Privacy-first, no login required, 100% client-side processing.",
  openGraph: {
    title: "ToolForge — Free Privacy-First Online Tools",
    description: "Plan lessons, manage tasks, create content, and boost productivity — all in your browser. No data ever leaves your device.",
    url: "https://smart-tools-kit.vercel.app",
  },
  twitter: {
    title: "ToolForge — Free Privacy-First Online Tools",
    description: "Plan lessons, manage tasks, create content, and boost productivity — all in your browser. No data ever leaves your device.",
  },
  alternates: {
    canonical: "https://smart-tools-kit.vercel.app",
  },
}

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
      <section className="relative overflow-hidden py-20 md:py-28 lg:py-32">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-purple-500/[0.07]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl pointer-events-none floating-glow" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-purple-500/[0.04] to-transparent pointer-events-none" />
        {/* Floating orbs */}
        <div className="absolute top-1/6 right-1/6 w-64 h-64 rounded-full bg-purple-500/[0.06] blur-3xl pointer-events-none floating-orb floating-orb-1" />
        <div className="absolute bottom-1/4 left-1/6 w-48 h-48 rounded-full bg-blue-500/[0.05] blur-3xl pointer-events-none floating-orb floating-orb-2" />
        <div className="absolute top-1/3 left-1/3 w-56 h-56 rounded-full bg-orange-500/[0.04] blur-3xl pointer-events-none floating-orb floating-orb-3" />
        <style>{`
          @keyframes float1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(20px,-30px) scale(1.1); } }
          @keyframes float2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-25px,20px) scale(0.9); } }
          @keyframes float3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(15px,25px) scale(1.05); } }
          @keyframes pulse-glow { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
          .floating-orb { animation-duration: 12s; animation-iteration-count: infinite; animation-timing-function: ease-in-out; }
          .floating-orb-1 { animation-name: float1; }
          .floating-orb-2 { animation-name: float2; animation-duration: 15s; }
          .floating-orb-3 { animation-name: float3; animation-duration: 18s; }
          .floating-glow { animation: pulse-glow 6s ease-in-out infinite; }
        `}</style>

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* Top badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-medium text-muted-foreground bg-background/50 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Privacy-first &middot; No login required &middot; 39+ tools
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              Smart Tools for{" "}
              <span className="text-primary">Teachers, Students, Creators, Developers &amp; Businesses</span>
            </h1>

            {/* Subheading */}
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Everything you need to plan lessons, manage tasks, create content, and boost productivity &mdash; all running in your browser. No data ever leaves your device.
            </p>

            {/* CTAs */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/tools">
                <Button size="lg" className="gap-2 h-11 px-6 text-base">
                  Explore Tools
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/blog">
                <Button variant="outline" size="lg" className="h-11 px-6 text-base">
                  Read Guides
                </Button>
              </Link>
            </div>

            {/* Instant Tool Entry */}
            <div className="space-y-2 pt-2">
              <p className="text-xs text-muted-foreground tracking-wide uppercase font-medium">Try instantly:</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Link
                  href="/tools/grade-calculator"
                  className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 backdrop-blur-sm px-3.5 py-1.5 text-sm font-medium hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                >
                  🧮 CBC Grade Calculator
                </Link>
                <Link
                  href="/tools/pomodoro"
                  className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 backdrop-blur-sm px-3.5 py-1.5 text-sm font-medium hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                >
                  ⏱ Pomodoro Timer
                </Link>
                <Link
                  href="/tools/lesson-plan-generator"
                  className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 backdrop-blur-sm px-3.5 py-1.5 text-sm font-medium hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                >
                  📝 Lesson Planner
                </Link>
              </div>
            </div>

            {/* Trust stats */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 pt-4">
              {[
                { value: "39+", label: "Free Tools" },
                { value: "100%", label: "Privacy-First" },
                { value: "0", label: "Login Required" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <span className="text-lg font-bold tabular-nums">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Audience chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {[
                { emoji: "👩‍🏫", label: "Teachers" },
                { emoji: "🎓", label: "Students" },
                { emoji: "🚀", label: "Creators" },
                { emoji: "💻", label: "Developers" },
                { emoji: "📊", label: "Businesses" },
              ].map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 backdrop-blur-sm px-3.5 py-1.5 text-sm font-medium hover:bg-background/80 transition-colors"
                >
                  <span>{item.emoji}</span>
                  <span>{item.label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ad: Below hero */}
      <div className="container flex justify-center">
        <AdSlot type="sponsored" slot="hero" />
      </div>

      {/* ─── Problem → Solution ─── */}
      <section className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Problem */}
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-6 md:p-8 space-y-4">
            <h3 className="text-lg font-semibold text-red-500 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10 text-red-500 text-xs font-bold">!</span>
              The Old Way
            </h3>
            <ul className="space-y-3">
              {[
                { icon: "🔀", label: "Scattered tools everywhere" },
                { icon: "📝", label: "Manual planning" },
                { icon: "🐌", label: "Slow workflows" },
                { icon: "📋", label: "No structure" },
              ].map((item) => (
                <li key={item.label} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solution */}
          <div className="rounded-xl border border-green-500/20 bg-green-500/[0.03] p-6 md:p-8 space-y-4">
            <h3 className="text-lg font-semibold text-green-500 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/10 text-green-500">✓</span>
              The ToolForge Way
            </h3>
            <ul className="space-y-3">
              {[
                { icon: "🌐", label: "Everything in browser" },
                { icon: "⚡", label: "Structured productivity system" },
                { icon: "🚀", label: "Instant tools access" },
                { icon: "🏗️", label: "Organized workflow for teachers, students, and businesses" },
              ].map((item) => (
                <li key={item.label} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

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

      {/* ─── Featured Tools ─── */}
      <section className="container py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold">Your Most-Used Tools</h2>
          <p className="text-sm text-muted-foreground mt-1">Start with our most popular utilities — all free, all private</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { slug: "grade-calculator", name: "CBC Grade Calculator", emoji: "🧮", desc: "Compute scores and competency levels per KICD" },
            { slug: "lesson-plan-generator", name: "CBC Lesson Planner", emoji: "📝", desc: "Generate KICD-compliant lesson plans" },
            { slug: "pomodoro", name: "Pomodoro Timer", emoji: "⏱", desc: "Stay focused with timed intervals" },
            { slug: "notes", name: "Notes App", emoji: "📄", desc: "Write and organize notes locally" },
            { slug: "habit-tracker", name: "Habit Tracker", emoji: "🎯", desc: "Build streaks and track daily habits" },
            { slug: "day-planner", name: "Day Planner", emoji: "📅", desc: "Plan your day hour by hour" },
            { slug: "kanban", name: "Kanban Board", emoji: "📋", desc: "Organize with drag-and-drop boards" },
            { slug: "revision-planner", name: "CBC Learning & Revision Planner", emoji: "📚", desc: "Plan skill-based practice and revision with curriculum-aligned tools" },
          ].map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group rounded-xl border bg-background/40 p-5 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30"
            >
              <div className="text-2xl">{tool.emoji}</div>
              <div>
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{tool.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{tool.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Teacher CTA ─── */}
      <section className="container py-6">
        <Link
          href="/tools/lesson-plan-generator"
          className="group block rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/[0.08] to-purple-500/[0.08] p-6 md:p-8 text-center space-y-3 relative overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative space-y-2">
            <p className="text-lg md:text-xl font-semibold">
              👩‍🏫 Are you a teacher? Try CBC Lesson Planner →
            </p>
            <p className="text-sm text-muted-foreground">
              Generate KICD-compliant lesson plans with competencies, PCIs, and assessments in minutes.
            </p>
            <div className="pt-2">
              <Button size="lg" className="gap-2">
                Open Lesson Planner
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </div>
        </Link>
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

"use client"

import Link from "next/link"
import { useMemo, useState, useEffect } from "react"
import type { TrendItem } from "@/lib/universal-trends"
import { TrendingUp, BarChart3, FileText, Wrench, AlertTriangle, RefreshCw, Search, ArrowUp, ArrowDown } from "lucide-react"
import { generateUniversalTrends } from "@/lib/universal-trends"
import { getTrackerSummary, type PagePerformance } from "@/lib/universal-seo-tracker"
import { tools, categories } from "@/lib/tools-data"
import { calculateAIVisibilityScore } from "@/lib/ai-score"
import { aiImprovementTips } from "@/lib/ai-score"
import { getAIBadge } from "@/lib/ai-badge"
import SEOInspector from "@/components/admin/SEOInspector"

type Tab = "overview" | "trends" | "seo" | "optimization"

const isAdmin = true

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview")

  const tabs: { key: Tab; label: string; icon: typeof TrendingUp }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "trends", label: "Trending Topics", icon: TrendingUp },
    { key: "seo", label: "SEO Tracker", icon: Search },
    { key: "optimization", label: "Optimization", icon: AlertTriangle },
  ]

  return (
    <div className="min-h-screen">
      <div className="container py-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Growth & Traffic Dashboard</h1>
            <p className="text-sm text-muted-foreground">Universal automation engine across all categories</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.key
                  ? "bg-primary/10 text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && <OverviewPanel />}
        {activeTab === "trends" && <TrendsPanel />}
        {activeTab === "seo" && <SEOPanel />}
        {activeTab === "optimization" && <OptimizationPanel />}
      </div>
    </div>
  )
}

function OverviewPanel() {
  const [summary, setSummary] = useState<ReturnType<typeof getTrackerSummary> | null>(null)

  useEffect(() => {
    setSummary(getTrackerSummary())
  }, [])

  const toolCount = tools.length
  const categoryCount = categories.length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wrench} label="Total Tools" value={toolCount.toString()} />
        <StatCard icon={FileText} label="Total Blogs" value="—" />
        <StatCard icon={BarChart3} label="Categories" value={categoryCount.toString()} />
        <StatCard icon={Search} label="Tracked Pages" value={summary ? summary.totalPages.toString() : "—"} />
      </div>

      {summary && summary.topTools.length > 0 && (
        <section className="rounded-xl border bg-background/40 p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Top Performing Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {summary.topTools.slice(0, 6).map((p) => (
              <PageCard key={p.path} perf={p} />
            ))}
          </div>
        </section>
      )}

      {summary && summary.lowPerforming.length > 0 && (
        <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            Needs Attention ({summary.lowPerforming.length} pages)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {summary.lowPerforming.slice(0, 6).map((p) => (
              <PageCard key={p.path} perf={p} lowPerf />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function TrendsPanel() {
  const [trends, setTrends] = useState<TrendItem[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>("All")

  useEffect(() => {
    setTrends(generateUniversalTrends())
  }, [])

  const filtered = categoryFilter === "All" ? trends : trends.filter((t) => t.category === categoryFilter)
  const uniqueCategories = [...new Set(trends.map((t) => t.category))]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCategoryFilter("All")}
          className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${categoryFilter === "All" ? "bg-primary/10 text-primary border-primary/30" : "bg-background text-muted-foreground hover:text-foreground"}`}
        >
          All
        </button>
        {uniqueCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${categoryFilter === cat ? "bg-primary/10 text-primary border-primary/30" : "bg-background text-muted-foreground hover:text-foreground"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((trend, i) => (
          <Link
            key={i}
            href={trend.href || "/tools"}
            className="rounded-xl border bg-background/40 p-5 space-y-3 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                {trend.type === "blog" ? "📝 Blog" : "🔧 Tool Guide"}
              </span>
              <span className="text-[10px] text-muted-foreground shrink-0">{trend.category}</span>
            </div>
            <h3 className="font-semibold text-sm leading-snug hover:text-primary transition-colors">{trend.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">{trend.description}</p>
            {trend.relatedTools.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {trend.relatedTools.map((t) => (
                  <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-md text-muted-foreground">
                    /tools/{t}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

function SEOPanel() {
  const [summary, setSummary] = useState<ReturnType<typeof getTrackerSummary> | null>(null)

  useEffect(() => {
    setSummary(getTrackerSummary())
  }, [])

  if (!summary) {
    return (
      <div className="rounded-xl border bg-background/40 p-8 text-center space-y-3">
        <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground">SEO tracker data is only available in the browser (client-side session storage).</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Search} label="Pages Tracked" value={summary.totalPages.toString()} />
        <StatCard icon={ArrowUp} label="Total Views" value={summary.totalViews.toString()} />
        <StatCard icon={ArrowDown} label="Total Clicks" value={summary.totalClicks.toString()} />
      </div>

      {summary.topTools.length > 0 && (
        <section className="rounded-xl border bg-background/40 p-6 space-y-4">
          <h2 className="text-lg font-semibold">Tool Pages by Popularity</h2>
          <div className="space-y-2">
            {summary.topTools.map((p, i) => (
              <Link key={p.path} href={p.path} className="flex items-center justify-between gap-4 text-sm rounded-lg px-2 py-1.5 -mx-2 transition-all hover:bg-muted/50 hover:text-primary">
                <span className="text-muted-foreground w-6 shrink-0">#{i + 1}</span>
                <span className="flex-1 font-medium truncate">{p.path}</span>
                <span className="text-xs text-muted-foreground w-16 text-right">{p.pageViews} views</span>
                <span className="text-xs w-20 text-right">
                  <ScoreBadge score={p.popularityScore} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {summary.topBlogs.length > 0 && (
        <section className="rounded-xl border bg-background/40 p-6 space-y-4">
          <h2 className="text-lg font-semibold">Blog Posts by Popularity</h2>
          <div className="space-y-2">
            {summary.topBlogs.map((p, i) => (
              <Link key={p.path} href={p.path} className="flex items-center justify-between gap-4 text-sm rounded-lg px-2 py-1.5 -mx-2 transition-all hover:bg-muted/50 hover:text-primary">
                <span className="text-muted-foreground w-6 shrink-0">#{i + 1}</span>
                <span className="flex-1 font-medium truncate">{p.path}</span>
                <span className="text-xs text-muted-foreground w-16 text-right">{p.pageViews} views</span>
                <span className="text-xs w-20 text-right">
                  <ScoreBadge score={p.popularityScore} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {summary.lowPerforming.length > 0 && (
        <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Low Performing Pages
          </h2>
          <div className="space-y-2">
            {summary.lowPerforming.map((p) => (
              <Link key={p.path} href={p.path} className="flex items-center justify-between gap-4 text-sm rounded-lg px-2 py-1.5 -mx-2 transition-all hover:bg-muted/50 hover:text-primary">
                <span className="flex-1 font-medium truncate">{p.path}</span>
                <span className="text-xs text-muted-foreground">
                  Eng: {p.engagementScore}% · Pop: {p.popularityScore}%
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function OptimizationPanel() {
  const toolEntries = useMemo(() => {
    return tools.map((t) => ({
      name: t.name,
      path: `/tools/${t.slug}`,
      description: t.description,
      score: 0,
      tips: ["Tool pages use server-rendered content — manual review recommended"] as string[],
    }))
  }, [])

  const [blogs, setBlogs] = useState<{ title: string; slug: string; aiScore: number; internalLinks: number; aiStatus: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/blogs")
      .then((r) => r.json())
      .then((data) => { setBlogs(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      {isAdmin && (
        <section className="rounded-xl border bg-background/40 p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Blog SEO Inspector ({loading ? "..." : blogs.length} posts)
          </h2>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading blog data...</p>
          ) : blogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No blog posts found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {blogs.map((b) => (
                <SEOInspector key={b.slug} post={b} />
              ))}
            </div>
          )}
        </section>
      )}

      <section className="rounded-xl border bg-background/40 p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Wrench className="h-4 w-4 text-primary" />
          All Tool Pages ({toolEntries.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {toolEntries.map((t) => (
            <Link
              key={t.path}
              href={t.path}
              className="rounded-lg border bg-background/40 p-3 space-y-1 block transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30"
            >
              <span className="text-sm font-medium truncate block hover:text-primary transition-colors">{t.name}</span>
              <span className="text-[10px] text-muted-foreground">{t.path}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, variant }: { icon: typeof BarChart3; label: string; value: string; variant?: "success" | "danger" }) {
  const borderClass = variant === "danger" ? "border-red-500/20 bg-red-500/5" : variant === "success" ? "border-green-500/20 bg-green-500/5" : ""
  return (
    <div className={`rounded-xl border bg-background/40 p-5 space-y-2 ${borderClass}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function PageCard({ perf, lowPerf }: { perf: PagePerformance; lowPerf?: boolean }) {
  return (
    <Link
      href={perf.path}
      className={`rounded-lg border p-3 space-y-1 block transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 ${lowPerf ? "border-red-500/20" : ""}`}
    >
      <div className="text-sm font-medium truncate hover:text-primary transition-colors">{perf.path}</div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>{perf.pageViews} views</span>
        <span>·</span>
        <span>Eng: {perf.engagementScore}%</span>
        <span>·</span>
        <span>Pop: {perf.popularityScore}%</span>
      </div>
    </Link>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const badge = getAIBadge(score)
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${badge.className}`}>
      {badge.emoji} {score}/100
    </span>
  )
}

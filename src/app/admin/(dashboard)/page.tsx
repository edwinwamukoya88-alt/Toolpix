import { auth } from "@/auth"
import Link from "next/link"
import { getAllPosts } from "@/lib/blog"
import { tools } from "@/lib/tools-data"
import {
  FileText, Wrench, Users, Activity, Eye, ArrowRight,
  BarChart3, Sparkles, Settings, HeartPulse,
  PenSquare, FileEdit, MousePointerClick, Hash,
} from "lucide-react"
import { prisma } from "@/lib/db"
import { getOverviewMetrics, getRealtimeData, getPopularPages, getPopularTools } from "@/lib/analytics-db"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const user = await auth().then(s => s?.user ?? null)
  const blogCount = getAllPosts().length
  const toolCount = tools.length

  let overview = null
  let realtime = null
  let popularPages: Array<{ path: string; views: number }> = []
  let popularTools: Array<{ rank: number; name: string; opens: number; completions: number; completionRate: number }> = []

  try {
    const [o, r, pp, pt] = await Promise.all([
      getOverviewMetrics("last7"),
      getRealtimeData(),
      getPopularPages(5, "last7"),
      getPopularTools(5, "last7"),
    ])
    overview = o
    realtime = r
    popularPages = pp
    popularTools = pt
  } catch {}

  let draftCount = 0
  let userCount = 1
  try {
    draftCount = await prisma.blogDraft.count()
    userCount = await prisma.adminUser.count()
  } catch {}

  const quickActions = [
    { href: "/admin/blog/new", label: "New Blog Post", icon: PenSquare, color: "text-blue-400" },
    { href: "/admin/blog", label: "Manage Blog", icon: FileEdit, color: "text-emerald-400" },
    { href: "/admin/tools", label: "Manage Tools", icon: Wrench, color: "text-amber-400" },
    { href: "/admin/users", label: "Users", icon: Users, color: "text-purple-400" },
    { href: "/admin/ai", label: "AI Studio", icon: Sparkles, color: "text-rose-400" },
    { href: "/admin/settings", label: "Settings", icon: Settings, color: "text-cyan-400" },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3, color: "text-indigo-400" },
    { href: "/admin/system", label: "System", icon: HeartPulse, color: "text-orange-400" },
  ]

  const formatNum = (n: number | null | undefined) => {
    if (n == null) return "—"
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k"
    return n.toLocaleString()
  }

  return (
    <div className="container py-6 md:py-8 space-y-8">
      {/* Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-background to-background p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center gap-5">
          {user?.image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.image}
                  alt={user?.name ?? ""}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/30"
                />
              </>
          ) : (
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/30">
              <Users className="h-8 w-8 text-primary" />
            </div>
          )}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground">
              {user?.email ?? ""} &middot; <span className="text-primary">Admin</span>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard icon={FileText} label="Blog Posts" value={blogCount} />
          <StatCard icon={Wrench} label="Published Tools" value={toolCount} />
          <StatCard icon={Users} label="Total Users (7d)" value={formatNum(overview?.totalUsers.value)} />
          <StatCard icon={Activity} label="Sessions (7d)" value={formatNum(overview?.sessions.value)} />
          <StatCard icon={Eye} label="Page Views (7d)" value={formatNum(overview?.pageViews.value)} />
        </div>
      </div>

      {/* Tool & AI Stats */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Engagement</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={Wrench} label="Tool Usage (7d)" value={formatNum(overview?.toolUsage.value)} />
          <StatCard icon={Sparkles} label="AI Requests (7d)" value={formatNum(overview?.aiRequests.value)} />
          <StatCard icon={FileText} label="Blog Views (7d)" value={formatNum(overview?.blogViews.value)} />
          <StatCard icon={Eye} label="Active Now" value={realtime?.activeUsers ?? 0} />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <div className={`h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            )
          })}
        </div>
      </div>

      {/* Popular Pages + Popular Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PopularPagesCard pages={popularPages} />
        <PopularToolsCard toolList={popularTools} />
      </div>

      {/* Bottom Grid: Recent Activity + System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivityCard />
        <SystemHealthCard blogCount={blogCount} toolCount={toolCount} />
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
    </div>
  )
}

function PopularPagesCard({ pages }: { pages: Array<{ path: string; views: number }> }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Eye className="h-4 w-4 text-primary" />
        Popular Pages (7d)
      </h3>
      {pages.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">No page view data yet. Data will appear as visitors browse the site.</p>
      ) : (
        <div className="space-y-2">
          {pages.map((p, i) => (
            <div key={p.path} className="flex items-center gap-3 text-sm">
              <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
              <span className="flex-1 truncate font-mono text-xs">{p.path}</span>
              <span className="text-xs text-muted-foreground">{p.views.toLocaleString()} views</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PopularToolsCard({ toolList }: { toolList: Array<{ rank: number; name: string; opens: number; completionRate: number }> }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Wrench className="h-4 w-4 text-primary" />
        Popular Tools (7d)
      </h3>
      {toolList.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">No tool usage data yet. Data will appear as users interact with tools.</p>
      ) : (
        <div className="space-y-2">
          {toolList.map((t) => (
            <div key={t.name} className="flex items-center gap-3 text-sm">
              <span className="text-xs text-muted-foreground w-4">{t.rank}</span>
              <span className="flex-1 truncate text-xs font-medium">{t.name}</span>
              <span className="text-xs text-muted-foreground">{t.opens} opens</span>
              <span className="text-xs text-emerald-500">{t.completionRate}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

async function RecentActivityCard() {
  const posts = getAllPosts().slice(0, 5)

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        Recent Activity
      </h3>
      {posts.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.slug} className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-primary/40 mt-1.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <Link href={`/blog/${post.slug}`} className="text-sm font-medium hover:text-primary transition-colors line-clamp-1">
                  {post.title}
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {post.category} &middot; {new Date(post.date).toLocaleDateString()} &middot; {post.readingTime} min read
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
      >
        View all articles <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}

async function SystemHealthCard({ blogCount, toolCount }: { blogCount: number; toolCount: number }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <HeartPulse className="h-4 w-4 text-primary" />
        System Health
      </h3>
      <div className="space-y-3">
        <HealthRow label="Blog Posts" value={`${blogCount} published`} healthy />
        <HealthRow label="Published Tools" value={`${toolCount} available`} healthy />
        <HealthRow label="Database" value="SQLite via Prisma" healthy />
        <HealthRow label="Authentication" value="Auth.js v5 · Google OAuth" healthy />
        <HealthRow label="Sessions" value="JWT · Secure" healthy />
        <HealthRow label="Analytics Pipeline" value="Server-side events" healthy />
        <HealthRow label="Deployment" value="Vercel" healthy />
      </div>
      <Link
        href="/admin/system"
        className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
      >
        View system details <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}

function HealthRow({ label, value, healthy }: { label: string; value: string; healthy: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-foreground">{value}</span>
        <span className={`h-1.5 w-1.5 rounded-full ${healthy ? "bg-emerald-400" : "bg-amber-400"}`} />
      </div>
    </div>
  )
}

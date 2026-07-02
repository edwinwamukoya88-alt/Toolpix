"use client"

import { AnalyticsProvider, useAnalytics } from "@/contexts/analytics-context"
import { DashboardOverviewCards } from "@/components/admin/DashboardOverviewCards"
import { exportData, buildExportTables, type ExportFormat } from "@/lib/export-utils"
import DashboardNavigation from "@/components/admin/DashboardNavigation"
import AnalyticsHeader from "@/components/admin/AnalyticsHeader"
import KpiCard, { KpiCardSkeleton } from "@/components/admin/KpiCard"
import TrafficChart from "@/components/admin/TrafficChart"
import AcquisitionDonut from "@/components/admin/AcquisitionDonut"
import ToolPerformanceTable from "@/components/admin/ToolPerformanceTable"
import CategoryBarChart from "@/components/admin/CategoryBarChart"
import ConversionFunnel from "@/components/admin/ConversionFunnel"
import LiveActivity from "@/components/admin/LiveActivity"
import SEODashboard from "@/components/admin/SEODashboard"
import BlogPerformanceTable from "@/components/admin/BlogPerformanceTable"
import TrendingContent from "@/components/admin/TrendingContent"
import SearchConsoleInsights from "@/components/admin/SearchConsoleInsights"
import UserBehaviourHeatmap from "@/components/admin/UserBehaviourHeatmap"
import RecentActivityFeed from "@/components/admin/RecentActivityFeed"
import AIInsightsPanel from "@/components/admin/AIInsightsPanel"
import DataSourceIndicator from "@/components/admin/DataSourceIndicator"
import { Bell, BellOff, Database, Search, BarChart3, Users, Activity, FileText, MousePointerClick, Heart, Globe, Clock, TrendingUp, ArrowUp, ArrowDown, Hash, Target, Eye, List, Layers, UserCircle } from "lucide-react"
import { useState, useCallback } from "react"
import type { TabId } from "@/components/admin/DashboardNavigation"
import type { SourceInfo } from "@/lib/analytics-service"

type ActiveSource = "ga4" | "searchConsole" | "firstParty" | "realtime"

export default function AdminAnalyticsPage() {
  return (
    <AnalyticsProvider>
      <AnalyticsDashboard />
    </AnalyticsProvider>
  )
}

function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("overview")
  const [activeSource, setActiveSource] = useState<ActiveSource>("ga4")
  const [showAlerts, setShowAlerts] = useState(false)
  const {
    loading, error, refresh, kpiData, trafficData, acquisitionData, toolPerfData,
    categoryPerfData, funnelData, liveActivity, seoMetrics, seoTrend, seoLandingPages,
    seoQueries, blogPerfData, trendingData, searchConsoleData, heatmapData,
    activityData, insightsData, alerts, activeAlertCount, dismissAlert, dismissAllAlerts,
    sources, state,
  } = useAnalytics()

  const handleExport = useCallback((format: ExportFormat) => {
    const tables = buildExportTables(
      kpiData ?? [],
      (toolPerfData ?? []).map(t => ({ toolName: t.toolName, launches: t.launches, completionRate: t.completionRate, uniqueUsers: t.uniqueUsers })),
      (blogPerfData ?? []).map(b => ({ article: b.article, views: b.views, engagementScore: b.engagementScore }))
    )
    exportData(format, tables)
  }, [kpiData, toolPerfData, blogPerfData])

  const ga4Available = sources.ga4.status === "available"

  return (
    <div className="min-h-screen">
      <div className="container py-6 md:py-8">
        <DashboardOverviewCards
          data={{
            totalUsers: 0,
            activeUsers: 0,
            blogPosts: 13,
            publishedTools: 39,
            totalPageViews: 0,
            sessions: 0,
            searchClicks: 0,
            searchImpressions: 0,
            avgPosition: 0,
            ctr: 0,
          }}
          loading={false}
        />

        <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <AnalyticsHeader
              onRefresh={refresh}
              loading={loading}
              onExport={handleExport}
            />
          </div>
          <div className="relative shrink-0 mt-1">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="relative inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-xs font-medium hover:bg-muted transition-colors"
              aria-label={`Alerts${activeAlertCount > 0 ? `: ${activeAlertCount} active` : ""}`}
            >
              {activeAlertCount > 0 ? (
                <Bell className="h-4 w-4 text-amber-400" />
              ) : (
                <BellOff className="h-4 w-4 text-muted-foreground" />
              )}
              {activeAlertCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">
                  {activeAlertCount}
                </span>
              )}
            </button>
            {showAlerts && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowAlerts(false)} />
                <div className="absolute right-0 top-full mt-2 z-20 w-80 rounded-2xl border bg-card shadow-2xl max-h-[400px] overflow-y-auto">
                  <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-card">
                    <h3 className="text-sm font-semibold">Alerts</h3>
                    <button
                      onClick={dismissAllAlerts}
                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Dismiss all
                    </button>
                  </div>
                  {alerts.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">No active alerts</div>
                  ) : (
                    <div className="divide-y">
                      {alerts.map((alert) => (
                        <div key={alert.id} className="p-4 space-y-1 hover:bg-muted/20 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className={`h-2 w-2 rounded-full shrink-0 ${
                                alert.severity === "critical" ? "bg-red-500" :
                                alert.severity === "warning" ? "bg-amber-500" : "bg-blue-500"
                              }`} />
                              <span className="text-xs font-medium">{alert.title}</span>
                            </div>
                            <button
                              onClick={() => { dismissAlert(alert.id); setShowAlerts(false) }}
                              className="text-[10px] text-muted-foreground hover:text-foreground shrink-0"
                            >
                              ✕
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground pl-3.5">{alert.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <DashboardNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {state.error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-4 text-sm text-red-400">
            {state.error}
          </div>
        )}

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground/60">
          <DataSourceBadge
            label="GA4"
            status={sources.ga4.status}
            active={activeSource === "ga4"}
            onClick={() => setActiveSource("ga4")}
          />
          <DataSourceBadge
            label="Search Console"
            status={sources.searchConsole.status}
            active={activeSource === "searchConsole"}
            onClick={() => setActiveSource("searchConsole")}
          />
          <DataSourceBadge
            label="First-Party"
            status={sources.firstParty.status}
            active={activeSource === "firstParty"}
            onClick={() => setActiveSource("firstParty")}
          />
          <DataSourceBadge
            label="Realtime"
            status={sources.realtime.status}
            active={activeSource === "realtime"}
            onClick={() => setActiveSource("realtime")}
          />
          {state.lastUpdated && (
            <span className="ml-auto">
              Last updated: {new Date(state.lastUpdated).toISOString().replace("T", " ").slice(0, 19)} UTC
            </span>
          )}
        </div>

        <SourcePanel
          activeSource={activeSource}
          kpiData={kpiData}
          trafficData={trafficData}
          acquisitionData={acquisitionData}
          seoMetrics={seoMetrics}
          seoTrend={seoTrend}
          seoLandingPages={seoLandingPages}
          seoQueries={seoQueries}
          searchConsoleData={searchConsoleData}
          toolPerfData={toolPerfData}
          blogPerfData={blogPerfData}
          heatmapData={heatmapData}
          activityData={activityData}
          liveActivity={liveActivity}
          loading={loading}
          funnelData={funnelData}
          sources={sources}
        />

        {activeTab === "overview" && (
          <OverviewTab
            kpiData={kpiData}
            trafficData={trafficData}
            acquisitionData={acquisitionData}
            trendingData={trendingData}
            funnelData={funnelData}
            loading={loading}
            source={sources.ga4}
          />
        )}
        {activeTab === "traffic" && (
          <TrafficTab
            trafficData={trafficData}
            acquisitionData={acquisitionData}
            categoryPerfData={categoryPerfData}
            loading={loading}
            source={sources.ga4}
          />
        )}
        {activeTab === "tools" && (
          <ToolsTab
            toolPerfData={toolPerfData}
            funnelData={funnelData}
            loading={loading}
            source={sources.firstParty}
          />
        )}
        {activeTab === "content" && (
          <ContentTab
            blogPerfData={blogPerfData}
            trendingData={trendingData}
            loading={loading}
            source={sources.firstParty}
          />
        )}
        {activeTab === "seo" && (
          <SEOTab
            seoMetrics={seoMetrics}
            seoTrend={seoTrend}
            seoLandingPages={seoLandingPages}
            seoQueries={seoQueries}
            searchConsoleData={searchConsoleData}
            source={sources.searchConsole}
            loading={loading}
          />
        )}
        {activeTab === "users" && (
          <UsersTab
            heatmapData={heatmapData}
            activityData={activityData}
            loading={loading}
          />
        )}
        {activeTab === "live" && <LiveTab liveData={liveActivity} source={sources.realtime} />}
        {activeTab === "insights" && (
          <InsightsTab insightsData={insightsData} loading={loading} />
        )}
      </div>
      </div>
    </div>
  )
}

function DataSourceBadge({ label, status, active, onClick }: { label: string; status: string; active: boolean; onClick: () => void }) {
  const colors: Record<string, string> = {
    available: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    unavailable: "bg-red-500/10 text-red-400 border-red-500/20",
    not_configured: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
    loading: "bg-muted/30 text-muted-foreground border-muted",
  }
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium transition-all cursor-pointer
        ${active ? "ring-1 ring-primary/40 shadow-sm" : "opacity-70 hover:opacity-100"}
        ${colors[status] ?? colors.loading}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${
        status === "available" ? "bg-emerald-400" :
        status === "loading" ? "bg-muted-foreground animate-pulse" :
        "bg-red-400"
      }`} />
      {label}
    </button>
  )
}

function SourcePanel({ activeSource, kpiData, trafficData, acquisitionData, seoMetrics, seoTrend, seoLandingPages, seoQueries, searchConsoleData, toolPerfData, blogPerfData, heatmapData, activityData, liveActivity, loading, funnelData, sources }: {
  activeSource: ActiveSource;
  kpiData: any; trafficData: any; acquisitionData: any;
  seoMetrics: any; seoTrend: any; seoLandingPages: any; seoQueries: any; searchConsoleData: any;
  toolPerfData: any; blogPerfData: any; heatmapData: any; activityData: any;
  liveActivity: any; loading: boolean; funnelData: any; sources: any;
}) {
  return (
    <div className="space-y-4">
      {activeSource === "ga4" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <MetricCard icon={Users} label="Users" value={kpiData?.[0]?.value?.toLocaleString() ?? "—"} status={sources.ga4.status} />
          <MetricCard icon={Activity} label="Sessions" value={kpiData?.[1]?.value?.toLocaleString() ?? "—"} status={sources.ga4.status} />
          <MetricCard icon={Eye} label="Pageviews" value={kpiData?.[2]?.value?.toLocaleString() ?? "—"} status={sources.ga4.status} />
          <MetricCard icon={Globe} label="Acquisition" value={acquisitionData?.length ? `${acquisitionData.length} sources` : "—"} status={sources.ga4.status} />
          <MetricCard icon={TrendingUp} label="Engagement" value={kpiData?.[3]?.value ? `${kpiData[3].value}%` : "—"} status={sources.ga4.status} />
        </div>
      )}
      {activeSource === "searchConsole" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <MetricCard icon={MousePointerClick} label="Clicks" value={searchConsoleData?.reduce?.((s: number, r: any) => s + (r.clicks ?? 0), 0)?.toLocaleString() ?? "—"} status={sources.searchConsole.status} />
            <MetricCard icon={Eye} label="Impressions" value={searchConsoleData?.reduce?.((s: number, r: any) => s + (r.impressions ?? 0), 0)?.toLocaleString() ?? "—"} status={sources.searchConsole.status} />
            <MetricCard icon={ArrowUp} label="CTR" value={searchConsoleData?.[0]?.ctr ? `${(searchConsoleData[0].ctr * 100).toFixed(1)}%` : "—"} status={sources.searchConsole.status} />
            <MetricCard icon={Hash} label="Avg Position" value={searchConsoleData?.[0]?.position?.toFixed(1) ?? "—"} status={sources.searchConsole.status} />
            <MetricCard icon={BarChart3} label="Top Queries" value={seoQueries?.length ? `${seoQueries.length}` : "—"} status={sources.searchConsole.status} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {seoQueries && seoQueries.length > 0 && (
              <div className="rounded-xl border bg-card p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><List className="h-3.5 w-3.5" />Top Queries</div>
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {seoQueries.slice(0, 10).map((q: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1">
                      <span className="truncate">{q.query ?? q.keys?.[0] ?? `#${i + 1}`}</span>
                      <span className="text-muted-foreground ml-2 shrink-0">{q.clicks ?? 0} clicks</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {seoLandingPages && seoLandingPages.length > 0 && (
              <div className="rounded-xl border bg-card p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><Layers className="h-3.5 w-3.5" />Top Pages</div>
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {seoLandingPages.slice(0, 10).map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1">
                      <span className="truncate">{p.path ?? p.keys?.[0] ?? `#${i + 1}`}</span>
                      <span className="text-muted-foreground ml-2 shrink-0">{p.impressions ?? 0} imp.</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {activeSource === "firstParty" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard icon={MousePointerClick} label="Tool Launches" value={toolPerfData?.reduce?.((s: number, t: any) => s + (t.launches ?? t.totalClicks ?? 0), 0)?.toLocaleString() ?? "—"} status={sources.firstParty.status} />
          <MetricCard icon={Heart} label="Favorites" value={toolPerfData?.filter?.((t: any) => (t.favorites ?? 0) > 0)?.length ?? "—"} status={sources.firstParty.status} />
          <MetricCard icon={Database} label="Local Analytics" value={blogPerfData?.length ? `${blogPerfData.length} posts` : "—"} status={sources.firstParty.status} />
          <MetricCard icon={Globe} label="Browser Metrics" value={activityData?.length ? `${activityData.length} events` : "—"} status={sources.firstParty.status} />
        </div>
      )}
      {activeSource === "realtime" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetricCard icon={UserCircle} label="Active Users" value={liveActivity?.activeUsers?.toLocaleString() ?? "—"} status={sources.realtime.status} />
          <MetricCard icon={Eye} label="Live Page Views" value={liveActivity?.pages?.length ? `${liveActivity.pages.length} pages` : "—"} status={sources.realtime.status} />
          <MetricCard icon={Clock} label="Current Sessions" value={liveActivity?.activeUsers != null ? `${liveActivity.activeUsers}` : "—"} status={sources.realtime.status} />
        </div>
      )}
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, status }: { icon: any; label: string; value: string; status: string }) {
  if (status !== "available" && status !== "loading") {
    const statusLabels: Record<string, string> = { unavailable: "Unavailable", not_configured: "Not configured", error: "Error" }
    return (
      <div className="rounded-xl border bg-card p-4 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/60">
          <Icon className="h-3 w-3" />
          {label}
        </div>
        <div className="text-lg font-bold text-muted-foreground/40">{statusLabels[status] ?? "—"}</div>
      </div>
    )
  }
  return (
    <div className="rounded-xl border bg-card p-4 space-y-1.5">
      <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/60">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  )
}

function EmptySection({ icon: Icon, title, message, source }: { icon: any; title: string; message: string; source?: SourceInfo }) {
  return (
    <div className="rounded-2xl border bg-card p-12 text-center">
      <div className="flex justify-center mb-4">
        <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center">
          <Icon className="h-6 w-6 text-muted-foreground/50" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto">{message}</p>
      {source && <DataSourceIndicator source={source.status === "not_configured" ? "Search Console" : source.status === "available" ? "GA4" : "Data"} status={source.status} lastUpdated={source.lastUpdated} error={source.error} />}
    </div>
  )
}

function SearchConsoleSetupCard() {
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-card p-8 max-w-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Search className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold">Search Console Not Configured</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Connect Google Search Console to view organic traffic, keywords, impressions, and SEO performance.</p>
        </div>
      </div>
      <ul className="space-y-2 text-xs text-muted-foreground mb-6">
        <li className="flex items-start gap-2">• Verify your website in <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Google Search Console</a></li>
        <li className="flex items-start gap-2">• Add your service account email as a user with &quot;Read&quot; permission</li>
        <li className="flex items-start gap-2">• Set <code className="rounded bg-muted px-1 py-0.5 text-[10px]">GA_SEARCH_CONSOLE_PROPERTY</code> in your environment variables</li>
      </ul>
      <a
        href="https://search.google.com/search-console"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        Configure Search Console
      </a>
    </div>
  )
}

function NoDataMessage() {
  return null // handled by EmptySection
}

/* ─── Tab Panels ─────────────────────────────────── */

function OverviewTab({
  kpiData, trafficData, acquisitionData, trendingData, funnelData, loading, source,
}: {
  kpiData: any; trafficData: any; acquisitionData: any; trendingData: any; funnelData: any; loading: boolean; source: SourceInfo
}) {
  if (loading) return <LoadingSkeletons overview />

  const hasKpi = kpiData && kpiData.length > 0
  const hasTraffic = trafficData && trafficData.length > 0
  const hasAcq = acquisitionData && acquisitionData.length > 0

  if (!hasKpi && !hasTraffic && !hasAcq) {
    return <EmptySection icon={BarChart3} title="No Analytics Data" message="Google Analytics 4 data is unavailable. Check credentials or come back later." source={source} />
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {hasKpi
          ? kpiData.map((kpi: any, i: number) => <KpiCard key={kpi.label} data={kpi} index={i} />)
          : Array.from({ length: 6 }).map((_, i) => <KpiCardSkeleton key={i} />)
        }
      </div>
      <div className="relative">
        {hasTraffic ? <TrafficChart data={trafficData} /> : <EmptySection icon={Activity} title="No Traffic Data" message="Traffic data from GA4 is not available." />}
        <DataSourceIndicator source="GA4" status={source.status} lastUpdated={source.lastUpdated} error={source.error} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {hasAcq ? <AcquisitionDonut data={acquisitionData} /> : <EmptySection icon={Users} title="No Acquisition Data" message="Acquisition source data from GA4 is not available." />}
        {funnelData && funnelData.length > 0 ? <ConversionFunnel data={funnelData} /> : <EmptySection icon={BarChart3} title="No Funnel Data" message="Conversion funnel data is not available." />}
      </div>
      {trendingData && trendingData.length > 0 ? <TrendingContent data={trendingData} /> : null}
    </div>
  )
}

function TrafficTab({
  trafficData, acquisitionData, categoryPerfData, loading, source,
}: {
  trafficData: any; acquisitionData: any; categoryPerfData: any; loading: boolean; source: SourceInfo
}) {
  if (loading) return <LoadingSkeletons />

  const hasTraffic = trafficData && trafficData.length > 0
  const hasAcq = acquisitionData && acquisitionData.length > 0

  if (!hasTraffic && !hasAcq) {
    return <EmptySection icon={Activity} title="No Traffic Data" message="Traffic and acquisition data from GA4 is not available." source={source} />
  }

  return (
    <div className="space-y-6">
      {hasTraffic ? <TrafficChart data={trafficData} /> : <EmptySection icon={Activity} title="No Traffic Data" message="Traffic data from GA4 is not available." />}
      <DataSourceIndicator source="GA4" status={source.status} lastUpdated={source.lastUpdated} error={source.error} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {hasAcq ? <AcquisitionDonut data={acquisitionData} /> : <EmptySection icon={Users} title="No Acquisition Data" message="Acquisition source data from GA4 is not available." />}
        {categoryPerfData && categoryPerfData.length > 0 ? <CategoryBarChart data={categoryPerfData} /> : <EmptySection icon={BarChart3} title="No Category Data" message="Category performance data is not available." />}
      </div>
    </div>
  )
}

function ToolsTab({ toolPerfData, funnelData, loading, source }: {
  toolPerfData: any; funnelData: any; loading: boolean; source: SourceInfo
}) {
  if (loading) return <LoadingSkeletons />

  const hasTools = toolPerfData && toolPerfData.length > 0
  if (!hasTools && !funnelData) {
    return <EmptySection icon={Database} title="No Tool Data" message="First-party tool usage data is not available. Use tools on the site to generate data." source={source} />
  }

  return (
    <div className="space-y-6">
      {hasTools ? <ToolPerformanceTable data={toolPerfData} /> : <EmptySection icon={Database} title="No Tool Performance Data" message="No tool usage recorded yet. Try using some tools first." />}
      <DataSourceIndicator source="First-Party" status={source.status} lastUpdated={source.lastUpdated} error={source.error} />
      {funnelData && funnelData.length > 0 ? <ConversionFunnel data={funnelData} /> : null}
    </div>
  )
}

function ContentTab({ blogPerfData, trendingData, loading, source }: {
  blogPerfData: any; trendingData: any; loading: boolean; source: SourceInfo
}) {
  if (loading) return <LoadingSkeletons />

  const hasBlog = blogPerfData && blogPerfData.length > 0
  if (!hasBlog) {
    return <EmptySection icon={FileText} title="No Blog Data" message="First-party blog data is not available. Visit some blog posts to generate analytics." source={source} />
  }

  return (
    <div className="space-y-6">
      <BlogPerformanceTable data={blogPerfData} />
      <DataSourceIndicator source="First-Party" status={source.status} lastUpdated={source.lastUpdated} error={source.error} />
      {trendingData && trendingData.length > 0 ? <TrendingContent data={trendingData} /> : null}
    </div>
  )
}

function SEOTab({
  seoMetrics, seoTrend, seoLandingPages, seoQueries, searchConsoleData, source, loading,
}: any) {
  const isNotConfigured = source?.status === "not_configured"

  if (isNotConfigured) {
    return (
      <div className="space-y-6">
        <SearchConsoleSetupCard />
      </div>
    )
  }

  const hasData = seoMetrics || (searchConsoleData && searchConsoleData.length > 0)
  if (!hasData) {
    return <EmptySection icon={Search} title="No SEO Data" message="Search Console data is unavailable. Configure Search Console to see SEO metrics." source={source} />
  }

  return (
    <div className="space-y-6">
      <SEODashboard
        metrics={seoMetrics}
        trend={seoTrend}
        landingPages={seoLandingPages}
        queries={seoQueries}
        loading={loading}
      />
      <DataSourceIndicator source="Search Console" status={source.status} lastUpdated={source.lastUpdated} error={source.error} />
      {searchConsoleData && searchConsoleData.length > 0 && (
        <SearchConsoleInsights data={searchConsoleData} loading={loading} />
      )}
    </div>
  )
}

function UsersTab({ heatmapData, activityData, loading }: { heatmapData: any; activityData: any; loading: boolean }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {heatmapData && heatmapData.length > 0
          ? <UserBehaviourHeatmap data={heatmapData} loading={loading} />
          : <EmptySection icon={Users} title="No Heatmap Data" message="User behaviour heatmap data is not available yet." />
        }
        {activityData && activityData.length > 0
          ? <RecentActivityFeed events={activityData} loading={loading} />
          : <EmptySection icon={Activity} title="No Recent Activity" message="No recent user activity recorded." />
        }
      </div>
    </div>
  )
}

function LiveTab({ liveData, source }: { liveData: any; source: SourceInfo }) {
  const data = liveData?.activeUsers != null
    ? {
        activeUsers: liveData.activeUsers,
        pages: liveData.pages ?? [],
        activeTools: liveData.activeTools ?? [],
        locations: liveData.locations ?? [],
        recentEvents: liveData.recentEvents ?? [],
      }
    : undefined
  return (
    <div className="space-y-2">
      <LiveActivity data={data} />
      <DataSourceIndicator source="Realtime" status={source.status} lastUpdated={source.lastUpdated} error={source.error} />
    </div>
  )
}

function InsightsTab({ insightsData, loading }: { insightsData: any; loading: boolean }) {
  return <AIInsightsPanel insights={insightsData} loading={loading} />
}

function LoadingSkeletons({ overview }: { overview?: boolean }) {
  return (
    <div className="space-y-6">
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <KpiCardSkeleton key={i} />)}
        </div>
      )}
      <div className="h-[350px] rounded-2xl bg-muted/30 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-[350px] rounded-2xl bg-muted/30 animate-pulse" />
        <div className="h-[350px] rounded-2xl bg-muted/30 animate-pulse" />
      </div>
    </div>
  )
}

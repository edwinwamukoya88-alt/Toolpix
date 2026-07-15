"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from "react"
import {
  getKpiData,
  getTrafficData,
  getAcquisitionData,
  getToolPerformance,
  getCategoryPerformance,
  getFunnelData,
  getLiveActivity,
  getSEOData,
  getBlogPerformance,
  getTrendingContent,
  getSearchConsoleKpis,
  getSearchConsoleTrafficData,
  getSearchConsoleData,
  getHeatmapData,
  getRecentActivity,
  getAIInsights,
  initAnalytics,
  type DateRange,
  type AnalyticsState,
  type SourceInfo,
  type DataSources,
} from "@/lib/analytics-service"
import { evaluateAlerts, getAlerts, dismissAlert, dismissAll, getActiveAlertCount, type Alert } from "@/lib/alerts"
import type {
  KpiData,
  TrafficPoint,
  AcquisitionSource,
  ToolPerformanceRow,
  CategoryPerformance,
  FunnelStage,
  LiveActivityData,
  SEOMetrics,
  SEOTrendPoint,
  SEOLandingPage,
  SEOQuery,
  BlogPerformanceRow,
  TrendingItem,
  SearchConsoleRow,
  HeatmapData,
  ActivityEvent,
  AIInsight,
} from "@/lib/analytics-utils"

/* ─── Types ──────────────────────────────────────── */

export interface AnalyticsContextValue {
  loading: boolean
  error: string | null
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  refresh: () => Promise<void>
  comparePrevious: boolean
  setComparePrevious: (v: boolean) => void

  kpiData: KpiData[] | null
  trafficData: TrafficPoint[] | null
  acquisitionData: AcquisitionSource[] | null
  toolPerfData: ToolPerformanceRow[] | null
  categoryPerfData: CategoryPerformance[] | null
  funnelData: FunnelStage[] | null
  liveActivity: LiveActivityData | null
  seoMetrics: SEOMetrics | null
  seoTrend: SEOTrendPoint[]
  seoLandingPages: SEOLandingPage[]
  seoQueries: SEOQuery[]
  blogPerfData: BlogPerformanceRow[] | null
  publishedBlogCount: number | null
  publishedToolCount: number | null
  trendingData: TrendingItem[] | null
  searchConsoleData: SearchConsoleRow[] | null
  scKpiData: KpiData[] | null
  scTrafficData: TrafficPoint[] | null
  heatmapData: HeatmapData[] | null
  activityData: ActivityEvent[] | null
  insightsData: AIInsight[] | null

  sources: DataSources

  alerts: Alert[]
  activeAlertCount: number
  dismissAlert: (id: string) => void
  dismissAllAlerts: () => void

  state: AnalyticsState
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)

export function useAnalytics(): AnalyticsContextValue {
  const ctx = useContext(AnalyticsContext)
  if (!ctx) throw new Error("useAnalytics must be used within AnalyticsProvider")
  return ctx
}

function emptySources(): DataSources {
  return {
    ga4: { status: "loading", lastUpdated: null, error: null },
    searchConsole: { status: "loading", lastUpdated: null, error: null },
    firstParty: { status: "loading", lastUpdated: null, error: null },
    realtime: { status: "loading", lastUpdated: null, error: null },
  }
}

function initialSources(): DataSources {
  return {
    ga4: { status: "unavailable", lastUpdated: null, error: null },
    searchConsole: { status: "unavailable", lastUpdated: null, error: null },
    firstParty: { status: "unavailable", lastUpdated: null, error: null },
    realtime: { status: "unavailable", lastUpdated: null, error: null },
  }
}

/* ─── Provider ───────────────────────────────────── */

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange>("last7")
  const [comparePrevious, setComparePrevious] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<AnalyticsState>({
    loading: true, error: null, lastUpdated: null, sources: initialSources(),
  })

  const [kpiData, setKpiData] = useState<KpiData[] | null>(null)
  const [trafficData, setTrafficData] = useState<TrafficPoint[] | null>(null)
  const [scKpiData, setScKpiData] = useState<KpiData[] | null>(null)
  const [scTrafficData, setScTrafficData] = useState<TrafficPoint[] | null>(null)
  const [acquisitionData, setAcquisitionData] = useState<AcquisitionSource[] | null>(null)
  const [toolPerfData, setToolPerfData] = useState<ToolPerformanceRow[] | null>(null)
  const [categoryPerfData, setCategoryPerfData] = useState<CategoryPerformance[] | null>(null)
  const [funnelData, setFunnelData] = useState<FunnelStage[] | null>(null)
  const [liveActivity, setLiveActivity] = useState<LiveActivityData | null>(null)
  const [seoMetrics, setSeoMetrics] = useState<SEOMetrics | null>(null)
  const [seoTrend, setSeoTrend] = useState<SEOTrendPoint[]>([])
  const [seoLandingPages, setSeoLandingPages] = useState<SEOLandingPage[]>([])
  const [seoQueries, setSeoQueries] = useState<SEOQuery[]>([])
  const [blogPerfData, setBlogPerfData] = useState<BlogPerformanceRow[] | null>(null)
  const [publishedBlogCount, setPublishedBlogCount] = useState<number | null>(null)
  const [publishedToolCount, setPublishedToolCount] = useState<number | null>(null)
  const [trendingData, setTrendingData] = useState<TrendingItem[] | null>(null)
  const [searchConsoleData, setSearchConsoleData] = useState<SearchConsoleRow[] | null>(null)
  const [heatmapData, setHeatmapData] = useState<HeatmapData[] | null>(null)
  const [activityData, setActivityData] = useState<ActivityEvent[] | null>(null)
  const [insightsData, setInsightsData] = useState<AIInsight[] | null>(null)

  const [sources, setSources] = useState<DataSources>(initialSources())

  const [alerts, setAlerts] = useState<Alert[]>([])
  const [activeAlertCount, setActiveAlertCount] = useState(0)

  const loadRef = useRef(false)

  const loadAll = useCallback(async (range: DateRange) => {
    setLoading(true)
    setError(null)
    setState(s => ({ ...s, loading: true, error: null }))
    setSources(emptySources())

    try {
      const [
        kpi,
        traffic,
        acq,
        tools,
        cats,
        funnel,
        seo,
        blog,
        trending,
        sc,
        scKpis,
        scTraffic,
        heatmap,
        activity,
        insights,
      ] = await Promise.all([
        getKpiData(range),
        getTrafficData(range),
        getAcquisitionData(range),
        getToolPerformance(range),
        getCategoryPerformance(range),
        getFunnelData(range),
        getSEOData(range),
        getBlogPerformance(range),
        getTrendingContent(),
        getSearchConsoleData(range),
        getSearchConsoleKpis(range),
        getSearchConsoleTrafficData(range),
        getHeatmapData(),
        getRecentActivity(),
        getAIInsights(range),
      ])

      setKpiData(kpi.data)
      setTrafficData(traffic.data ?? scTraffic.data)
      setScKpiData(scKpis.data)
      setScTrafficData(scTraffic.data)
      setAcquisitionData(acq.data)
      setToolPerfData(tools.data)
      setPublishedToolCount(tools.publishedCount)
      setCategoryPerfData(cats.data)
      setFunnelData(funnel.data)
      setSeoMetrics(seo.metrics)
      setSeoTrend(seo.trend)
      setSeoLandingPages(seo.landingPages)
      setSeoQueries(seo.queries)
      setBlogPerfData(blog.data)
      setPublishedBlogCount(blog.publishedCount)
      setTrendingData(trending.data)
      setSearchConsoleData(sc.data)
      setHeatmapData(heatmap.data)
      setActivityData(activity.data)
      setInsightsData(insights.data)

      setSources({
        ga4: kpi.source,   // representative — GA4 used for KPI, traffic, acquisition
        searchConsole: seo.source,
        firstParty: tools.source,
        realtime: { status: "unavailable", lastUpdated: null, error: null }, // loaded separately
      })

      setAlerts(getAlerts())
      setActiveAlertCount(getActiveAlertCount())

      const allUnavailable = [
        kpi, traffic, acq, tools, blog, insights,
      ].every(r => r.data === null || (Array.isArray(r.data) && r.data.length === 0)) &&
        seo.metrics === null

      setState({
        loading: false,
        error: allUnavailable ? "All analytics sources are unavailable. No data to display." : null,
        lastUpdated: Date.now(),
        sources: {
          ga4: kpi.source,
          searchConsole: seo.source,
          firstParty: tools.source,
          realtime: { status: "unavailable", lastUpdated: null, error: null },
        },
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load analytics"
      setError(msg)
      setState(s => ({ ...s, loading: false, error: msg }))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!loadRef.current) {
      loadRef.current = true
      initAnalytics().then(async () => {
        await loadAll(dateRange)
        try {
          const live = await getLiveActivity()
          setLiveActivity(live.data)
          setSources(prev => ({ ...prev, realtime: live.source }))
        } catch {}
      })
    }
  }, [dateRange, loadAll])

  const refresh = useCallback(async () => {
    await loadAll(dateRange)
    try {
      const live = await getLiveActivity()
      setLiveActivity(live.data)
      setSources(prev => ({
        ...prev,
        realtime: live.source,
      }))
    } catch {}
  }, [dateRange, loadAll])

  /* Live updates */
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const live = await getLiveActivity()
        setLiveActivity(live.data)
        setSources(prev => ({
          ...prev,
          realtime: live.source,
        }))
      } catch {}
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  /* Alerts evaluation */
  useEffect(() => {
    if (kpiData && kpiData.length > 0) {
      const parseMetricValue = (v: string): number => {
        if (!v) return 0
        if (v.endsWith("k")) return parseFloat(v) * 1000
        return parseInt(v.replace(/,/g, "")) || 0
      }
      evaluateAlerts(
        kpiData.map(k => ({
          label: k.label,
          current: parseMetricValue(k.value),
          previous: Math.round(parseMetricValue(k.value) / (1 + k.change / 100)) || 0,
          change: k.direction === "up" ? k.change : -k.change,
          threshold: 15,
        }))
      )
      queueMicrotask(() => { setAlerts(getAlerts()); setActiveAlertCount(getActiveAlertCount()) })
    }
  }, [kpiData])

  const dismissAllAlerts = useCallback(() => {
    dismissAll(); setAlerts([]); setActiveAlertCount(0)
  }, [])

  const value: AnalyticsContextValue = useMemo(() => ({
    loading, error, dateRange, setDateRange, refresh, comparePrevious, setComparePrevious,
    kpiData, trafficData, acquisitionData, toolPerfData, categoryPerfData, funnelData,
    liveActivity, seoMetrics, seoTrend, seoLandingPages, seoQueries,
    blogPerfData, publishedBlogCount, publishedToolCount, trendingData, searchConsoleData, scKpiData, scTrafficData, heatmapData, activityData, insightsData,
    sources,
    alerts, activeAlertCount, dismissAlert, dismissAllAlerts,
    state,
  }), [
    loading, error, dateRange, refresh, comparePrevious,
    kpiData, trafficData, acquisitionData, toolPerfData, categoryPerfData, funnelData,
    liveActivity, seoMetrics, seoTrend, seoLandingPages, seoQueries,
    blogPerfData, publishedBlogCount, publishedToolCount, trendingData, searchConsoleData, scKpiData, scTrafficData, heatmapData, activityData, insightsData,
    sources, alerts, activeAlertCount, state,
    dismissAllAlerts,
  ])

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  )
}

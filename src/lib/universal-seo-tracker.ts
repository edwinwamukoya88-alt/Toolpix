export interface PagePerformance {
  path: string
  pageViews: number
  engagementScore: number
  popularityScore: number
  toolUsageScore: number
}

const STORAGE_KEY = "tf_page_tracker"

interface TrackerEntry {
  path: string
  views: number
  clicks: number
  timeSpent: number
  depth: number
}

function getTracker(): TrackerEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTracker(entries: TrackerEntry[]): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {}
}

export function trackPageView(path: string): void {
  const entries = getTracker()
  const existing = entries.find((e) => e.path === path)
  if (existing) {
    existing.views += 1
  } else {
    entries.push({ path, views: 1, clicks: 0, timeSpent: 0, depth: 1 })
  }
  saveTracker(entries)
}

export function trackToolClick(path: string): void {
  const entries = getTracker()
  const existing = entries.find((e) => e.path === path)
  if (existing) {
    existing.clicks += 1
  } else {
    entries.push({ path, views: 0, clicks: 1, timeSpent: 0, depth: 1 })
  }
  saveTracker(entries)
}

export function trackTimeSpent(path: string, seconds: number): void {
  const entries = getTracker()
  const existing = entries.find((e) => e.path === path)
  if (existing) {
    existing.timeSpent += seconds
  } else {
    entries.push({ path, views: 0, clicks: 0, timeSpent: seconds, depth: 1 })
  }
  saveTracker(entries)
}

export function getPagePerformance(path: string): PagePerformance {
  const entries = getTracker()
  const entry = entries.find((e) => e.path === path)
  if (!entry) {
    return { path, pageViews: 0, engagementScore: 0, popularityScore: 0, toolUsageScore: 0 }
  }

  const maxViews = Math.max(1, ...entries.map((e) => e.views))
  const maxClicks = Math.max(1, ...entries.map((e) => e.clicks))
  const maxTime = Math.max(1, ...entries.map((e) => e.timeSpent))
  const maxDepth = Math.max(1, ...entries.map((e) => e.depth))

  const viewRatio = entry.views / maxViews
  const clickRatio = entry.clicks / maxClicks
  const timeRatio = Math.min(entry.timeSpent / maxTime, 1)
  const depthRatio = entry.depth / maxDepth

  const engagementScore = Math.round((timeRatio * 0.5 + depthRatio * 0.3 + viewRatio * 0.2) * 100)
  const popularityScore = Math.round((viewRatio * 0.6 + clickRatio * 0.4) * 100)
  const toolUsageScore = Math.round((clickRatio * 0.7 + viewRatio * 0.3) * 100)

  return {
    path,
    pageViews: entry.views,
    engagementScore: Math.min(engagementScore, 100),
    popularityScore: Math.min(popularityScore, 100),
    toolUsageScore: Math.min(toolUsageScore, 100),
  }
}

export function getTopTools(): PagePerformance[] {
  const entries = getTracker()
  const toolEntries = entries.filter((e) => e.path.startsWith("/tools/"))
  return toolEntries.map((e) => getPagePerformance(e.path)).sort((a, b) => b.popularityScore - a.popularityScore)
}

export function getTopBlogs(): PagePerformance[] {
  const entries = getTracker()
  const blogEntries = entries.filter((e) => e.path.startsWith("/blog/"))
  return blogEntries.map((e) => getPagePerformance(e.path)).sort((a, b) => b.popularityScore - a.popularityScore)
}

export function getLowPerformingPages(): PagePerformance[] {
  const entries = getTracker()
  return entries
    .map((e) => getPagePerformance(e.path))
    .filter((p) => p.engagementScore < 30 || p.popularityScore < 20)
    .sort((a, b) => a.engagementScore - b.engagementScore)
}

export function getTrackerSummary() {
  const entries = getTracker()
  return {
    totalPages: entries.length,
    totalViews: entries.reduce((s, e) => s + e.views, 0),
    totalClicks: entries.reduce((s, e) => s + e.clicks, 0),
    topTools: getTopTools(),
    topBlogs: getTopBlogs(),
    lowPerforming: getLowPerformingPages(),
  }
}

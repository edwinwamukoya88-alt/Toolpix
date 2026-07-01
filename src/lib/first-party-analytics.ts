/* ─── First-Party Analytics Tracking ───────────────────────────────
 * Tracks tool usage, blog engagement, and user behavior locally
 * using IndexedDB. Provides aggregated data for the admin dashboard.
 * All data stays on-device — no third-party services required.
 * ────────────────────────────────────────────────────────────── */

const DB_NAME = "tf_analytics"
const DB_VERSION = 2
const STORES = ["tool_events", "blog_events", "page_views", "sessions"] as const

const STORE_INDEXES: Record<string, Array<[string, string, IDBIndexParameters]>> = {
  tool_events: [
    ["toolSlug", "toolSlug", { unique: false }],
    ["event", "event", { unique: false }],
    ["timestamp", "timestamp", { unique: false }],
  ],
  blog_events: [
    ["slug", "slug", { unique: false }],
    ["event", "event", { unique: false }],
    ["timestamp", "timestamp", { unique: false }],
  ],
  page_views: [
    ["path", "path", { unique: false }],
    ["timestamp", "timestamp", { unique: false }],
    ["sessionId", "sessionId", { unique: false }],
  ],
  sessions: [
    ["sessionId", "sessionId", { unique: true }],
    ["startTime", "startTime", { unique: false }],
  ],
}

type StoreName = (typeof STORES)[number]

export interface ToolEvent {
  id?: number
  toolSlug: string
  toolName: string
  category: string
  event: "open" | "start" | "complete" | "exit" | "error"
  timestamp: number
  sessionId: string
  timeSpent?: number
  metadata?: Record<string, string>
}

export interface BlogEvent {
  id?: number
  slug: string
  title: string
  event: "view" | "scroll" | "cta_click" | "internal_link_click"
  timestamp: number
  sessionId: string
  scrollDepth?: number
  readTime?: number
  metadata?: Record<string, string>
}

export interface PageView {
  id?: number
  path: string
  title: string
  timestamp: number
  sessionId: string
  referrer?: string
  deviceType?: string
  country?: string
  duration?: number
}

export interface Session {
  id?: number
  sessionId: string
  startTime: number
  endTime?: number
  pageViews: number
  toolInteractions: number
  deviceType?: string
  referrer?: string
}

/* ─── IndexedDB Setup ─────────────────────────── */

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (event) => {
      const db = req.result
      const tx = req.transaction!
      const oldVersion = (event as IDBVersionChangeEvent).oldVersion

      // Create any missing stores (for fresh installs)
      for (const storeName of STORES) {
        if (!db.objectStoreNames.contains(storeName)) {
          const objectStore = db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true })
          const indexes = STORE_INDEXES[storeName] ?? []
          for (const [name, keyPath, options] of indexes) {
            objectStore.createIndex(name, keyPath, options)
          }
        }
      }

      // Migration: add missing indexes to existing stores (upgrading from v1→v2)
      if (oldVersion < 2) {
        for (const storeName of STORES) {
          if (db.objectStoreNames.contains(storeName)) {
            const objectStore = tx.objectStore(storeName)
            const indexes = STORE_INDEXES[storeName] ?? []
            for (const [name, keyPath, options] of indexes) {
              if (!objectStore.indexNames.contains(name)) {
                objectStore.createIndex(name, keyPath, options)
              }
            }
          }
        }
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function addRecord<T>(store: StoreName, record: Omit<T, "id">): Promise<number> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite")
    const req = tx.objectStore(store).add(record)
    req.onsuccess = () => resolve(req.result as number)
    req.onerror = () => reject(req.error)
  })
}

async function queryByIndex<T>(store: StoreName, indexName: string, value: IDBValidKey | IDBKeyRange): Promise<T[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly")
    const objectStore = tx.objectStore(store)

    let index: IDBIndex | null = null
    try {
      index = objectStore.index(indexName)
    } catch {
      // index missing — fall back to full scan
    }

    if (index) {
      const req = index.getAll(value)
      req.onsuccess = () => resolve(req.result as T[])
      req.onerror = () => reject(req.error)
    } else {
      const results: T[] = []
      const req = objectStore.openCursor()
      req.onsuccess = () => {
        const cursor = req.result
        if (cursor) {
          const cursorValue = cursor.value as any
          const matches = typeof value === "object" && value !== null
            ? Object.prototype.hasOwnProperty.call(value, "lower") // IDBKeyRange
              ? cursorValue[indexName] >= (value as IDBKeyRange).lower &&
                cursorValue[indexName] <= (value as IDBKeyRange).upper
              : cursorValue[indexName] === (value as any).valueOf()
            : cursorValue[indexName] === value
          if (matches) {
            results.push(cursorValue as T)
          }
          cursor.continue()
        } else {
          resolve(results)
        }
      }
      req.onerror = () => reject(req.error)
    }
  })
}

async function queryRange<T>(store: StoreName, field: "timestamp" | "startTime", start: number, end: number): Promise<T[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly")
    const objectStore = tx.objectStore(store)

    let index: IDBIndex | null = null
    try {
      index = objectStore.index(field)
    } catch {
      // index missing — fall back to full scan
    }

    if (index) {
      const range = IDBKeyRange.bound(start, end)
      const req = index.getAll(range)
      req.onsuccess = () => resolve(req.result as T[])
      req.onerror = () => reject(req.error)
    } else {
      const results: T[] = []
      const req = objectStore.openCursor()
      req.onsuccess = () => {
        const cursor = req.result
        if (cursor) {
          const value = cursor.value as any
          const ts = value[field] as number
          if (ts >= start && ts <= end) {
            results.push(value as T)
          }
          cursor.continue()
        } else {
          resolve(results)
        }
      }
      req.onerror = () => reject(req.error)
    }
  })
}

async function countRange(store: StoreName, field: "timestamp" | "startTime", start: number, end: number): Promise<number> {
  const data = await queryRange<any>(store, field, start, end)
  return data.length
}

/* ─── Session Management ──────────────────────── */

function getSessionId(): string {
  if (typeof window === "undefined") return ""
  let sid = sessionStorage.getItem("tf_session_id")
  if (!sid) {
    sid = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    sessionStorage.setItem("tf_session_id", sid)
  }
  return sid
}

function getDeviceType(): string {
  if (typeof window === "undefined") return "desktop"
  const ua = navigator.userAgent
  if (/mobile/i.test(ua)) return "mobile"
  if (/tablet/i.test(ua)) return "tablet"
  return "desktop"
}

export async function trackSessionStart(): Promise<void> {
  const sessionId = getSessionId()
  if (!sessionId) return
  const existing = await queryByIndex<Session>("sessions", "sessionId", sessionId)
  if (existing.length > 0) return
  await addRecord<Session>("sessions", {
    sessionId,
    startTime: Date.now(),
    pageViews: 0,
    toolInteractions: 0,
    deviceType: getDeviceType(),
    referrer: document.referrer || "direct",
  })
}

export async function trackPageView(path: string, title: string): Promise<void> {
  const sessionId = getSessionId()
  if (!sessionId) return
  await addRecord<PageView>("page_views", {
    path,
    title,
    timestamp: Date.now(),
    sessionId,
    referrer: document.referrer || "direct",
    deviceType: getDeviceType(),
  })
  const sessions = await queryByIndex<Session>("sessions", "sessionId", sessionId)
  if (sessions.length > 0) {
    const db = await openDB()
    const tx = db.transaction("sessions", "readwrite")
    const store = tx.objectStore("sessions")
    const session = sessions[0]
    if (session.id !== undefined) {
      store.put({ ...session, pageViews: session.pageViews + 1 })
    }
  }
}

export async function trackToolInteraction(
  toolSlug: string,
  toolName: string,
  category: string,
  event: ToolEvent["event"],
  timeSpent?: number
): Promise<void> {
  const sessionId = getSessionId()
  if (!sessionId) return
  await addRecord<ToolEvent>("tool_events", {
    toolSlug,
    toolName,
    category,
    event,
    timestamp: Date.now(),
    sessionId,
    timeSpent,
  })
  if (event === "start" || event === "complete") {
    const sessions = await queryByIndex<Session>("sessions", "sessionId", sessionId)
    if (sessions.length > 0) {
      const db = await openDB()
      const tx = db.transaction("sessions", "readwrite")
      const store = tx.objectStore("sessions")
      const session = sessions[0]
      if (session.id !== undefined) {
        store.put({ ...session, toolInteractions: session.toolInteractions + 1 })
      }
    }
  }
}

export async function trackBlogEvent(
  slug: string,
  title: string,
  event: BlogEvent["event"],
  extra?: { scrollDepth?: number; readTime?: number }
): Promise<void> {
  const sessionId = getSessionId()
  if (!sessionId) return
  await addRecord<BlogEvent>("blog_events", {
    slug,
    title,
    event,
    timestamp: Date.now(),
    sessionId,
    ...extra,
  })
}

/* ─── Aggregated Queries for Dashboard ─────────── */

export interface ToolAnalyticsSummary {
  toolSlug: string
  toolName: string
  category: string
  opens: number
  starts: number
  completions: number
  exits: number
  errors: number
  totalTimeSpent: number
  avgSessionTime: number
  completionRate: number
  repeatUsers: number
  uniqueSessions: Set<string>
}

export async function getToolAnalytics(startTime: number, endTime: number): Promise<Map<string, ToolAnalyticsSummary>> {
  const events = await queryRange<ToolEvent>("tool_events", "timestamp", startTime, endTime)
  const toolMap = new Map<string, ToolAnalyticsSummary>()

  for (const evt of events) {
    let summary = toolMap.get(evt.toolSlug)
    if (!summary) {
      summary = {
        toolSlug: evt.toolSlug,
        toolName: evt.toolName,
        category: evt.category,
        opens: 0, starts: 0, completions: 0, exits: 0, errors: 0,
        totalTimeSpent: 0, avgSessionTime: 0, completionRate: 0,
        repeatUsers: 0, uniqueSessions: new Set(),
      }
      toolMap.set(evt.toolSlug, summary)
    }
    summary.uniqueSessions.add(evt.sessionId)
    switch (evt.event) {
      case "open": summary.opens++; break
      case "start": summary.starts++; break
      case "complete": summary.completions++; break
      case "exit": summary.exits++; break
      case "error": summary.errors++; break
    }
    if (evt.timeSpent) summary.totalTimeSpent += evt.timeSpent
  }

  for (const summary of toolMap.values()) {
    const totalAttempts = summary.starts + summary.completions + summary.exits
    summary.completionRate = totalAttempts > 0 ? Math.round((summary.completions / totalAttempts) * 100) : 0
    summary.avgSessionTime = summary.opens > 0 ? Math.round(summary.totalTimeSpent / summary.opens) : 0
    summary.repeatUsers = summary.uniqueSessions.size
  }

  return toolMap
}

export interface BlogAnalyticsSummary {
  slug: string
  title: string
  views: number
  scrollEvents: number
  ctaClicks: number
  internalLinkClicks: number
  totalReadTime: number
  avgScrollDepth: number
  uniqueReaders: number
}

export async function getBlogAnalytics(startTime: number, endTime: number): Promise<Map<string, BlogAnalyticsSummary>> {
  const events = await queryRange<BlogEvent>("blog_events", "timestamp", startTime, endTime)
  const blogMap = new Map<string, BlogAnalyticsSummary>()

  for (const evt of events) {
    let summary = blogMap.get(evt.slug)
    if (!summary) {
      summary = {
        slug: evt.slug,
        title: evt.title,
        views: 0, scrollEvents: 0, ctaClicks: 0, internalLinkClicks: 0,
        totalReadTime: 0, avgScrollDepth: 0, uniqueReaders: 0,
      }
      blogMap.set(evt.slug, summary)
    }
    switch (evt.event) {
      case "view": summary.views++; break
      case "scroll":
        summary.scrollEvents++
        if (evt.scrollDepth) summary.avgScrollDepth = Math.max(summary.avgScrollDepth, evt.scrollDepth)
        break
      case "cta_click": summary.ctaClicks++; break
      case "internal_link_click": summary.internalLinkClicks++; break
    }
    if (evt.readTime) summary.totalReadTime += evt.readTime
  }

  return blogMap
}

export interface PageViewSummary {
  path: string
  views: number
  uniqueVisitors: number
  totalDuration: number
}

export async function getPageAnalytics(startTime: number, endTime: number): Promise<PageViewSummary[]> {
  const views = await queryRange<PageView>("page_views", "timestamp", startTime, endTime)
  const pageMap = new Map<string, { count: number; sessions: Set<string>; duration: number }>()

  for (const v of views) {
    let entry = pageMap.get(v.path)
    if (!entry) {
      entry = { count: 0, sessions: new Set(), duration: 0 }
      pageMap.set(v.path, entry)
    }
    entry.count++
    entry.sessions.add(v.sessionId)
    if (v.duration) entry.duration += v.duration
  }

  return Array.from(pageMap.entries()).map(([path, data]) => ({
    path,
    views: data.count,
    uniqueVisitors: data.sessions.size,
    totalDuration: data.duration,
  })).sort((a, b) => b.views - a.views)
}

export async function getActiveUsers(sinceMinutes = 5): Promise<number> {
  const since = Date.now() - sinceMinutes * 60 * 1000
  const sessions = await queryRange<Session>("sessions", "startTime", since, Date.now())
  return sessions.length
}

export async function getToolRankings(startTime: number, endTime: number) {
  const toolMap = await getToolAnalytics(startTime, endTime)
  const tools = Array.from(toolMap.values())

  return {
    mostUsed: [...tools].sort((a, b) => b.opens - a.opens),
    fastestGrowing: [...tools].sort((a, b) => b.starts - a.starts),
    highestRetention: [...tools].sort((a, b) => b.repeatUsers - a.repeatUsers),
    highestCompletion: [...tools].sort((a, b) => b.completionRate - a.completionRate),
    leastUsed: [...tools].sort((a, b) => a.opens - b.opens),
  }
}

export async function getRecentEvents(limit = 20): Promise<any[]> {
  const db = await openDB()
  const events: any[] = []

  for (const store of ["tool_events", "blog_events"] as const) {
    const tx = db.transaction(store, "readonly")
    const req = tx.objectStore(store).openCursor(null, "prev")
    await new Promise<void>((resolve) => {
      let count = 0
      req.onsuccess = () => {
        const cursor = req.result
        if (cursor && count < limit) {
          events.push({ ...cursor.value, _store: store })
          count++
          cursor.continue()
        } else {
          resolve()
        }
      }
      req.onerror = () => resolve()
    })
  }

  return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
}

/* ─── Cleanup ─────────────────────────────────── */

export async function cleanupOldData(retentionDays = 90): Promise<void> {
  const cutoff = Date.now() - retentionDays * 86400000
  const db = await openDB()
  for (const store of STORES) {
    const tx = db.transaction(store, "readwrite")
    const objectStore = tx.objectStore(store)
    const req = objectStore.openCursor()
    await new Promise<void>((resolve) => {
      req.onsuccess = () => {
        const cursor = req.result
        if (cursor) {
          const value = cursor.value as any
          const ts = value.timestamp ?? value.startTime
          if (ts && ts < cutoff) {
            cursor.delete()
          }
          cursor.continue()
        } else {
          resolve()
        }
      }
      req.onerror = () => resolve()
    })
  }
}

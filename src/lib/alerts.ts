/* ─── Analytics Alerts Engine ──────────────────────
 * Generates alerts by comparing current analytics data
 * against thresholds and historical baselines.
 * ───────────────────────────────────────────────── */

export interface Alert {
  id: string
  type: "spike" | "drop" | "anomaly" | "opportunity" | "info"
  severity: "critical" | "warning" | "info"
  title: string
  message: string
  timestamp: number
  dismissed: boolean
  metric?: string
  change?: number
}

export interface MetricComparison {
  label: string
  current: number
  previous: number
  change: number
  threshold: number
}

const STORAGE_KEY = "tf_analytics_alerts"

function loadAlerts(): Alert[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveAlerts(alerts: Alert[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
  } catch {}
}

export function getAlerts(): Alert[] {
  return loadAlerts()
}

export function dismissAlert(id: string): void {
  const alerts = loadAlerts()
  const idx = alerts.findIndex(a => a.id === id)
  if (idx >= 0) {
    alerts[idx].dismissed = true
    saveAlerts(alerts)
  }
}

export function dismissAll(): void {
  saveAlerts([])
}

function generateId(): string {
  return `alt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

export function evaluateAlerts(comparisons: MetricComparison[]): Alert[] {
  const existing = loadAlerts()
  const newAlerts: Alert[] = []
  const now = Date.now()

  for (const comp of comparisons) {
    if (comp.previous === 0) continue

    const absChange = Math.abs(comp.change)

    if (comp.change > 0 && absChange > comp.threshold) {
      newAlerts.push({
        id: generateId(),
        type: "spike",
        severity: absChange > comp.threshold * 2 ? "critical" : "warning",
        title: `${comp.label} Spike`,
        message: `${comp.label} ${comp.change > 0 ? "increased" : "decreased"} by ${absChange}% compared to the previous period.`,
        timestamp: now,
        dismissed: false,
        metric: comp.label,
        change: comp.change,
      })
    }

    if (comp.change < 0 && absChange > comp.threshold) {
      newAlerts.push({
        id: generateId(),
        type: "drop",
        severity: absChange > comp.threshold * 2 ? "critical" : "warning",
        title: `${comp.label} Drop`,
        message: `${comp.label} dropped by ${absChange}% compared to the previous period.`,
        timestamp: now,
        dismissed: false,
        metric: comp.label,
        change: comp.change,
      })
    }
  }

  if (newAlerts.length > 0) {
    const merged = [...newAlerts, ...existing.filter(a => !a.dismissed)].slice(0, 50)
    saveAlerts(merged)
  }

  return newAlerts
}

export function getActiveAlertCount(): number {
  return loadAlerts().filter(a => !a.dismissed).length
}

export function generateToolAlerts(
  toolName: string,
  currentOpens: number,
  previousOpens: number,
  completionRate: number,
  errorCount: number,
  thresholds?: { drop?: number; anomaly?: number }
): Alert[] {
  const alerts: Alert[] = []
  const now = Date.now()

  if (previousOpens > 0) {
    const change = ((currentOpens - previousOpens) / previousOpens) * 100
    const dropThreshold = thresholds?.drop ?? 30
    if (change < -dropThreshold) {
      alerts.push({
        id: generateId(),
        type: "drop",
        severity: "warning",
        title: `${toolName} Usage Dropped`,
        message: `${toolName} usage dropped by ${Math.round(Math.abs(change))}%. Review if the tool needs updates or promotion.`,
        timestamp: now,
        dismissed: false,
        metric: `${toolName} Opens`,
        change: Math.round(change),
      })
    }
  }

  if (completionRate < 30 && currentOpens > 20) {
    alerts.push({
      id: generateId(),
      type: "anomaly",
      severity: "warning",
      title: `${toolName} Low Completion`,
      message: `${toolName} has a ${completionRate}% completion rate with ${currentOpens} users. Consider UX improvements.`,
      timestamp: now,
      dismissed: false,
      metric: `${toolName} Completion`,
      change: -Math.round(100 - completionRate),
    })
  }

  if (errorCount > 5) {
    alerts.push({
      id: generateId(),
      type: "anomaly",
      severity: "critical",
      title: `${toolName} Error Spike`,
      message: `${toolName} reported ${errorCount} errors. Check tool functionality immediately.`,
      timestamp: now,
      dismissed: false,
      metric: `${toolName} Errors`,
    })
  }

  if (alerts.length > 0) {
    const existing = loadAlerts()
    const merged = [...alerts, ...existing.filter(a => !a.dismissed)].slice(0, 50)
    saveAlerts(merged)
  }

  return alerts
}

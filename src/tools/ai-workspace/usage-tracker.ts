const STORAGE_KEY = "ai-workspace-usage"
const DAILY_LIMIT = 5

interface UsageData {
  count: number
  date: string
}

export function getUsageData(): UsageData {
  if (typeof window === "undefined") return { count: 0, date: "" }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw) as UsageData
      const today = new Date().toISOString().split("T")[0]
      if (data.date === today) return data
    }
  } catch {}
  return { count: 0, date: new Date().toISOString().split("T")[0] }
}

export function getRemaining(): number {
  const data = getUsageData()
  return Math.max(0, DAILY_LIMIT - data.count)
}

export function incrementUsage(): boolean {
  const data = getUsageData()
  if (data.count >= DAILY_LIMIT) return false
  data.count++
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  return true
}

export function canUseAI(): boolean {
  return getRemaining() > 0
}

type QueueStatus = "idle" | "queued" | "processing" | "cancelRequested" | "completed" | "failed" | "cancelled"

export interface QueueItem {
  id: string
  feature: string
  input: string
  settings: Record<string, unknown>
  status: QueueStatus
  hash: string
  costTier: number
  enqueuedAt: number
  result?: { output: string; html?: string }
  error?: string
}

export interface QueueState {
  items: QueueItem[]
  processing: boolean
  queuedCount: number
  activeItem: QueueItem | null
}

type Listener = (state: QueueState) => void

interface DedupEntry {
  result: { output: string; html?: string }
  timestamp: number
}

interface CoreState {
  items: QueueItem[]
  isProcessing: boolean
  dailyCost: number
  dedupCache: Map<string, DedupEntry>
  listeners: Set<Listener>
  nextId: number
  cleanupTimer: ReturnType<typeof setInterval> | undefined
}

const GLOBAL_KEY = "__toolforgeAiqm"

const COST_TIERS: Record<string, number> = {
  humanize: 1, detector: 1, grammar: 1, rewrite: 1, summarize: 1,
  translate: 1, "change-tone": 1, "email-writer": 1, "essay-improver": 1, "resume-rewriter": 1,
  "lesson-planner": 2, "scheme-of-work": 2, assessment: 2, "comment-generator": 2, "revision-planner": 2,
  "design-cards": 3, "social-media": 3, flyer: 3, poster: 3, certificate: 3, "business-card": 3,
}

const DAILY_COST_LIMIT = 10
const RETRY_DELAYS = [1000, 2000, 4000]
const DEDUP_MAX = 200
const DEDUP_TTL = 15 * 60 * 1000
const CLEANUP_INTERVAL = 60_000
const ITEM_RETENTION_MS = 120_000

function core(): CoreState {
  const existing = (globalThis as Record<string, unknown>)[GLOBAL_KEY] as CoreState | undefined
  if (existing) return existing
  const state: CoreState = {
    items: [],
    isProcessing: false,
    dailyCost: 0,
    dedupCache: new Map(),
    listeners: new Set(),
    nextId: 1,
    cleanupTimer: undefined,
  }
  ;(globalThis as Record<string, unknown>)[GLOBAL_KEY] = state
  startCleanup(state)
  return state
}

function getStateView(state: CoreState): QueueState {
  return {
    items: [...state.items],
    processing: state.isProcessing,
    queuedCount: state.items.filter((i) => i.status === "queued").length,
    activeItem: state.items.find((i) => i.status === "processing") || null,
  }
}

function notify(): void {
  const s = core()
  const view = getStateView(s)
  s.listeners.forEach((fn) => fn(view))
}

function dedupGet(key: string): DedupEntry | undefined {
  const s = core()
  const entry = s.dedupCache.get(key)
  if (!entry) return undefined
  if (Date.now() - entry.timestamp > DEDUP_TTL) {
    s.dedupCache.delete(key)
    return undefined
  }
  s.dedupCache.delete(key)
  s.dedupCache.set(key, entry)
  return entry
}

function dedupSet(key: string, entry: DedupEntry): void {
  const s = core()
  if (s.dedupCache.size >= DEDUP_MAX) {
    const oldest = s.dedupCache.keys().next().value
    if (oldest !== undefined) s.dedupCache.delete(oldest)
  }
  s.dedupCache.set(key, entry)
}

function startCleanup(state: CoreState): void {
  if (state.cleanupTimer) return
  state.cleanupTimer = setInterval(() => {
    const now = Date.now()
    const s = core()
    s.items = s.items.filter((i) => {
      if (i.status === "queued" || i.status === "processing" || i.status === "cancelRequested") return true
      if (i.status === "cancelled") return false
      return now - i.enqueuedAt < ITEM_RETENTION_MS
    })
    notify()
  }, CLEANUP_INTERVAL)
}

export function subscribe(fn: Listener): () => void {
  const s = core()
  if (s.listeners.has(fn)) return () => {}
  s.listeners.add(fn)
  fn(getStateView(s))
  return () => {
    s.listeners.delete(fn)
  }
}

function computeHash(feature: string, input: string, settings: Record<string, unknown>): string {
  let hash = 5381
  const str = `${feature}|${input}|${JSON.stringify(settings)}`
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

function findDuplicate(hash: string): QueueItem | undefined {
  return core().items.find((i) => i.hash === hash && (i.status === "queued" || i.status === "processing"))
}

function createDeferredPromise(): { promise: Promise<{ output: string; html?: string }>; resolve: (v: { output: string; html?: string }) => void; reject: (e: Error) => void } {
  let resolve: (v: { output: string; html?: string }) => void = () => {}
  let reject: (e: Error) => void = () => {}
  const promise = new Promise<{ output: string; html?: string }>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

export function enqueue(
  feature: string,
  input: string,
  settings: Record<string, unknown>,
): Promise<{ output: string; html?: string }> {
  const s = core()
  const hash = computeHash(feature, input, settings)

  const cached = dedupGet(hash)
  if (cached) {
    return Promise.resolve({ ...cached.result })
  }

  const existing = findDuplicate(hash)
  if (existing) {
    const { promise, resolve, reject } = createDeferredPromise()
    const poll = setInterval(() => {
      if (existing.status === "completed" && existing.result) {
        clearInterval(poll)
        dedupSet(hash, { result: { ...existing.result }, timestamp: Date.now() })
        resolve({ ...existing.result })
      } else if (existing.status === "failed") {
        clearInterval(poll)
        reject(new Error(existing.error || "Request failed"))
      } else if (existing.status === "cancelled" || existing.status === "cancelRequested") {
        clearInterval(poll)
        reject(new Error("CANCELLED"))
      }
    }, 200)
    return promise
  }

  const costTier = COST_TIERS[feature] || 1
  if (s.dailyCost + costTier > DAILY_COST_LIMIT) {
    return Promise.reject(new Error("DAILY_COST_LIMIT_REACHED"))
  }

  const id = `req_${s.nextId++}`
  const item: QueueItem = {
    id, feature, input, settings: { ...settings },
    status: "queued", hash, costTier, enqueuedAt: Date.now(),
  }
  s.items.push(item)
  notify()

  const { promise, resolve, reject } = createDeferredPromise()
  const checkResult = setInterval(() => {
    if (item.status === "completed" && item.result) {
      clearInterval(checkResult)
      dedupSet(hash, { result: { ...item.result }, timestamp: Date.now() })
      resolve({ ...item.result })
    } else if (item.status === "failed") {
      clearInterval(checkResult)
      reject(new Error(item.error || "Request failed"))
    } else if (item.status === "cancelled" || item.status === "cancelRequested") {
      clearInterval(checkResult)
      reject(new Error("CANCELLED"))
    }
  }, 200)

  processQueue()
  return promise
}

export function cancelRequest(id: string): void {
  const s = core()
  const item = s.items.find((i) => i.id === id)
  if (!item) return
  if (item.status === "queued") {
    item.status = "cancelled"
    notify()
  } else if (item.status === "processing") {
    item.status = "cancelRequested"
    notify()
  }
}

export function clearCompleted(): void {
  const s = core()
  s.items = s.items.filter(
    (i) => i.status === "queued" || i.status === "processing" || i.status === "cancelRequested",
  )
  notify()
}

interface FetchResult {
  output: string
  html?: string
  remaining?: number
}

async function acquireToken(): Promise<string> {
  const res = await fetch("/api/ai/token")
  if (!res.ok) throw new Error("TOKEN_FETCH_FAILED")
  const data = await res.json()
  return data.token
}

async function postRequest(token: string, feature: string, input: string, settings: Record<string, unknown>): Promise<FetchResult> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-ai-token": token },
    body: JSON.stringify({ feature, input, settings }),
  })
  if (res.status === 401) {
    const newToken = await acquireToken()
    const retryRes = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-ai-token": newToken },
      body: JSON.stringify({ feature, input, settings }),
    })
    if (!retryRes.ok) {
      const err = await retryRes.json().catch(() => ({}))
      throw new Error(err.error || `AI request failed (${retryRes.status})`)
    }
    return retryRes.json()
  }
  if (res.status === 429) {
    throw new Error("RATE_LIMITED")
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `AI request failed (${res.status})`)
  }
  return res.json()
}

async function fetchWithRetry(
  feature: string,
  input: string,
  settings: Record<string, unknown>,
  attempt: number,
): Promise<FetchResult> {
  const token = await acquireToken()
  try {
    return await postRequest(token, feature, input, settings)
  } catch (err) {
    const msg = err instanceof Error ? err.message : ""
    if (msg === "RATE_LIMITED" && attempt < RETRY_DELAYS.length) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]))
      return fetchWithRetry(feature, input, settings, attempt + 1)
    }
    if (msg.startsWith("AI request failed") && attempt < RETRY_DELAYS.length) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]))
      return fetchWithRetry(feature, input, settings, attempt + 1)
    }
    throw err
  }
}

async function processQueue(): Promise<void> {
  const s = core()
  if (s.isProcessing) return
  s.isProcessing = true
  notify()

  while (true) {
    const next = s.items.find((i) => i.status === "queued")
    if (!next) break

    next.status = "processing"
    notify()

    try {
      const result = await fetchWithRetry(next.feature, next.input, next.settings, 0)
      if (next.status === ("cancelRequested" as string)) {
        next.status = "cancelled"
      } else {
        next.status = "completed"
        next.result = { output: result.output, html: result.html }
        s.dailyCost += next.costTier
      }
      notify()
    } catch (err) {
      if (next.status === ("cancelRequested" as string)) {
        next.status = "cancelled"
      } else {
        next.status = "failed"
        next.error = err instanceof Error ? err.message : "Unknown error"
      }
      notify()
    }
  }

  s.isProcessing = false
  notify()
}

export function getQueueState(): QueueState {
  return getStateView(core())
}

import crypto from "crypto"
const { createHmac, timingSafeEqual, randomUUID } = crypto

const TOKEN_TTL_MS = 300_000
const DAILY_LIMIT = 5

interface UsageRecord {
  count: number
  date: string
}

const usageStore = new Map<string, UsageRecord>()

function getSecret(): string {
  const secret = process.env.AI_GATEWAY_SECRET
  if (!secret) {
    const env = process.env.NODE_ENV || "unknown"
    const diag = JSON.stringify({
      route: "auth",
      variable: "AI_GATEWAY_SECRET",
      present: false,
      runtime: "nodejs",
      NODE_ENV: env,
    })
    console.error(`[Auth] Missing environment variable: ${diag}`)
    throw new Error("AI_GATEWAY_SECRET is not configured")
  }
  return secret
}

export function generateToken(): { token: string; expiresAt: number } {
  const timestamp = Date.now()
  const nonce = randomUUID()
  const payload = `ai-workspace:${timestamp}:${nonce}`
  const signature = createHmac("sha256", getSecret()).update(payload).digest("base64url")
  const encoded = Buffer.from(payload).toString("base64url")
  return { token: `${encoded}.${signature}`, expiresAt: timestamp + TOKEN_TTL_MS }
}

export function validateToken(token: string): { valid: boolean; reason?: string } {
  try {
    const parts = token.split(".")
    if (parts.length !== 2) return { valid: false, reason: "INVALID_TOKEN_FORMAT" }

    const [encoded, signature] = parts
    const decoded = Buffer.from(encoded, "base64url").toString("utf-8")
    const segments = decoded.split(":")
    if (segments.length < 3 || segments[0] !== "ai-workspace") {
      return { valid: false, reason: "INVALID_TOKEN_PAYLOAD" }
    }

    const timestamp = parseInt(segments[1], 10)
    if (isNaN(timestamp)) return { valid: false, reason: "INVALID_TIMESTAMP" }

    const now = Date.now()
    if (now - timestamp > TOKEN_TTL_MS) return { valid: false, reason: "TOKEN_EXPIRED" }
    if (timestamp > now + 60_000) return { valid: false, reason: "TOKEN_FROM_FUTURE" }

    const expectedSig = createHmac("sha256", getSecret()).update(decoded).digest("base64url")
    if (!timingSafeEqual(Buffer.from(expectedSig), Buffer.from(signature))) {
      return { valid: false, reason: "INVALID_SIGNATURE" }
    }

    return { valid: true }
  } catch {
    return { valid: false, reason: "TOKEN_VALIDATION_ERROR" }
  }
}

function getSessionId(token: string): string {
  try {
    const parts = token.split(".")
    return Buffer.from(parts[0], "base64url").toString("utf-8")
  } catch {
    return "unknown"
  }
}

function getToday(): string {
  return new Date().toISOString().split("T")[0]
}

export function checkDailyLimit(token: string): { allowed: boolean; remaining: number } {
  const sessionId = getSessionId(token)
  const today = getToday()
  const key = `${sessionId}:${today}`
  const record = usageStore.get(key)
  const count = record?.date === today ? record.count : 0
  return { allowed: count < DAILY_LIMIT, remaining: Math.max(0, DAILY_LIMIT - count) }
}

export function incrementDailyUsage(token: string): void {
  const sessionId = getSessionId(token)
  const today = getToday()
  const key = `${sessionId}:${today}`
  const record = usageStore.get(key)
  if (record?.date === today) {
    record.count++
  } else {
    usageStore.set(key, { count: 1, date: today })
  }
}

const CLEANUP_INIT_KEY = "__zilitaAiUsageCleanup"
if (typeof global !== "undefined" && !(globalThis as unknown as Record<string, boolean | undefined>)[CLEANUP_INIT_KEY]) {
  ;(globalThis as unknown as Record<string, boolean | undefined>)[CLEANUP_INIT_KEY] = true
  setInterval(() => {
    const today = getToday()
    for (const [key, record] of usageStore) {
      if (record.date !== today) usageStore.delete(key)
    }
  }, 3_600_000)
}

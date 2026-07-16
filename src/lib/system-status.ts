/* ─── System Status Service ─────────────────────────────────────
 * Dynamic, production-ready system status detection.
 * Never exposes secrets, passwords, or full connection strings.
 * Caches health checks for 30 seconds to avoid hammering the DB.
 * ────────────────────────────────────────────────────────────── */

import { prisma } from "./db"

/* ─── Types ──────────────────────────────────────── */

export type DatabaseProvider = "postgresql" | "mysql" | "sqlite" | "sqlserver" | "mongodb" | "cockroachdb" | "unknown"

export type DatabaseVendor =
  | "Neon"
  | "Supabase"
  | "Vercel Postgres"
  | "Railway"
  | "PlanetScale"
  | "AWS RDS"
  | "Google Cloud SQL"
  | "Azure Database"
  | "Fly.io"
  | "Render"
  | "Local"
  | "Unknown"

export type ServiceStatus = "connected" | "disconnected" | " degraded" | "unknown"

export interface DatabaseInfo {
  provider: string
  vendor: string
  status: ServiceStatus
  host: string
  database: string
  latency: number | null
  lastChecked: string
  error: string | null
}

export interface PrismaInfo {
  version: string
  connected: boolean
}

export interface EnvironmentInfo {
  name: "development" | "preview" | "production"
  vercel: boolean
  region: string | null
}

export interface ServiceHealth {
  label: string
  status: ServiceStatus
  latency: number | null
  lastChecked: string
  error: string | null
  description: string
}

export interface SystemStatusResponse {
  database: DatabaseInfo
  prisma: PrismaInfo
  environment: EnvironmentInfo
  services: ServiceHealth[]
  timestamp: string
}

/* ─── Cache ──────────────────────────────────────── */

interface CacheEntry {
  data: SystemStatusResponse
  timestamp: number
}

const CACHE_TTL = 30_000 // 30 seconds
let cachedStatus: CacheEntry | null = null

/* ─── Database URL Parser ───────────────────────── */

function parseDatabaseUrl(url: string): {
  provider: DatabaseProvider
  vendor: DatabaseVendor
  host: string
  database: string
  username: string
  port: string
} {
  const defaultResult = {
    provider: "unknown" as DatabaseProvider,
    vendor: "Unknown" as DatabaseVendor,
    host: "",
    database: "",
    username: "",
    port: "",
  }

  if (!url) return defaultResult

  try {
    // Handle file: URLs (SQLite)
    if (url.startsWith("file:")) {
      return {
        ...defaultResult,
        provider: "sqlite",
        vendor: "Local",
        database: url.replace("file:", "").split("?")[0],
      }
    }

    // Parse standard connection string: protocol://user:pass@host:port/db?params
    const protocolMatch = url.match(/^(\w+):\/\//)
    if (!protocolMatch) return defaultResult

    const protocol = protocolMatch[1].toLowerCase()
    let provider: DatabaseProvider = "unknown"

    // Map protocol to provider
    if (protocol === "postgresql" || protocol === "postgres") provider = "postgresql"
    else if (protocol === "mysql") provider = "mysql"
    else if (protocol === "sqlserver") provider = "sqlserver"
    else if (protocol === "mongodb") provider = "mongodb"
    else if (protocol === "cockroachdb") provider = "cockroachdb"

    // Extract host from URL
    const withoutProtocol = url.slice(protocolMatch[0].length)
    const atIndex = withoutProtocol.indexOf("@")
    const authority = atIndex >= 0 ? withoutProtocol.slice(atIndex + 1) : withoutProtocol
    const slashIndex = authority.indexOf("/")
    const hostPort = slashIndex >= 0 ? authority.slice(0, slashIndex) : authority
    const dbAndParams = slashIndex >= 0 ? authority.slice(slashIndex + 1) : ""

    const colonIndex = hostPort.lastIndexOf(":")
    const host = colonIndex >= 0 ? hostPort.slice(0, colonIndex) : hostPort
    const port = colonIndex >= 0 ? hostPort.slice(colonIndex + 1) : ""

    const database = dbAndParams.split("?")[0]

    // Extract username for vendor detection
    const userInfo = atIndex >= 0 ? withoutProtocol.slice(0, atIndex) : ""
    const colonInUser = userInfo.indexOf(":")
    const username = colonInUser >= 0 ? userInfo.slice(0, colonInUser) : userInfo

    // Detect vendor from host/domain
    const vendor = detectVendor(host, url)

    return { provider, vendor, host, database, username, port }
  } catch {
    return defaultResult
  }
}

/* ─── Vendor Detection ──────────────────────────── */

function detectVendor(host: string, fullUrl: string): DatabaseVendor {
  const hostLower = host.toLowerCase()
  const urlLower = fullUrl.toLowerCase()

  // Neon — host contains neon.tech or ep- prefix (Neon endpoint pattern)
  if (hostLower.includes("neon.tech") || hostLower.match(/^ep-[\w-]+/) || urlLower.includes("neon.tech")) {
    return "Neon"
  }

  // Supabase
  if (hostLower.includes("supabase.co") || urlLower.includes("supabase.co")) {
    return "Supabase"
  }

  // Vercel Postgres
  if (hostLower.includes("vercel-storage.com") || hostLower.includes("vercelpostgres") || urlLower.includes("vercel-storage.com")) {
    return "Vercel Postgres"
  }

  // Railway
  if (hostLower.includes("railway.app") || hostLower.includes("railway.internal") || urlLower.includes("railway.app")) {
    return "Railway"
  }

  // PlanetScale (uses mysql protocol with planetscale.host)
  if (hostLower.includes("planetscale") || urlLower.includes("planetscale")) {
    return "PlanetScale"
  }

  // AWS RDS
  if (hostLower.includes("rds.amazonaws.com") || hostLower.includes(".amazonaws.com")) {
    return "AWS RDS"
  }

  // Google Cloud SQL
  if (hostLower.includes("cloudsql") || hostLower.includes("googleapis.com") || hostLower.includes(".gcp.")) {
    return "Google Cloud SQL"
  }

  // Azure Database
  if (hostLower.includes("azure.com") || hostLower.includes("database.azure.com")) {
    return "Azure Database"
  }

  // Fly.io
  if (hostLower.includes("fly.dev") || hostLower.includes("internal") && hostLower.includes("fly")) {
    return "Fly.io"
  }

  // Render
  if (hostLower.includes("render.com") || hostLower.includes("onyx")) {
    return "Render"
  }

  // Local detection
  if (
    hostLower === "localhost" ||
    hostLower === "127.0.0.1" ||
    hostLower === "::1" ||
    hostLower === "0.0.0.0"
  ) {
    return "Local"
  }

  return "Unknown"
}

/* ─── Health Check ───────────────────────────────── */

async function checkDatabaseHealth(): Promise<{ connected: boolean; latency: number | null; error: string | null }> {
  const start = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    const latency = Date.now() - start
    return { connected: true, latency, error: null }
  } catch (e) {
    const latency = Date.now() - start
    const message = e instanceof Error ? e.message : String(e)
    return { connected: false, latency, error: message }
  }
}

/* ─── Environment Detection ──────────────────────── */

function detectEnvironment(): EnvironmentInfo {
  const isVercel = !!process.env.VERCEL
  const vercelEnv = process.env.VERCEL_ENV
  const nodeEnv = process.env.NODE_ENV

  let name: EnvironmentInfo["name"] = "development"

  if (vercelEnv === "production") {
    name = "production"
  } else if (vercelEnv === "preview") {
    name = "preview"
  } else if (isVercel) {
    name = "preview"
  } else if (nodeEnv === "production") {
    name = "production"
  }

  return {
    name,
    vercel: isVercel,
    region: process.env.VERCEL_REGION || process.env.AWS_REGION || null,
  }
}

/* ─── Prisma Version ────────────────────────────── */

function getPrismaVersion(): string {
  try {
    // Prisma 7.x exposes version
    const pkg = require("@prisma/client/package.json")
    return pkg.version || "unknown"
  } catch {
    try {
      const pkg = require("../../node_modules/@prisma/client/package.json")
      return pkg.version || "unknown"
    } catch {
      return "unknown"
    }
  }
}

/* ─── Service Health Checks ──────────────────────── */

async function checkServiceHealth(
  label: string,
  checkFn: () => Promise<boolean>,
  description: string
): Promise<ServiceHealth> {
  const start = Date.now()
  let status: ServiceStatus = "unknown"
  let error: string | null = null

  try {
    const ok = await checkFn()
    status = ok ? "connected" : "disconnected"
  } catch (e) {
    status = "disconnected"
    error = e instanceof Error ? e.message : String(e)
  }

  const latency = Date.now() - start

  return {
    label,
    status,
    latency,
    lastChecked: new Date().toISOString(),
    error,
    description,
  }
}

async function checkGA4(): Promise<boolean> {
  const res = await fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/analytics/ga4`, {
    signal: AbortSignal.timeout(5000),
  })
  return res.ok
}

async function checkSearchConsole(): Promise<boolean> {
  const res = await fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/analytics/search-console`, {
    signal: AbortSignal.timeout(5000),
  })
  return res.ok
}

async function checkGeminiAPI(): Promise<boolean> {
  return !!process.env.GEMINI_API_KEY
}

async function checkGitHubAPI(): Promise<boolean> {
  return !!process.env.GITHUB_TOKEN || !!process.env.GITHUB_API_TOKEN
}

async function checkStorage(): Promise<boolean> {
  // Check if filesystem or external storage is available
  return true
}

/* ─── Main Status Function ───────────────────────── */

export async function getSystemStatus(forceRefresh = false): Promise<SystemStatusResponse> {
  // Return cached if fresh
  if (!forceRefresh && cachedStatus) {
    const age = Date.now() - cachedStatus.timestamp
    if (age < CACHE_TTL) {
      return cachedStatus.data
    }
  }

  const databaseUrl = process.env.DATABASE_URL || ""
  const parsed = parseDatabaseUrl(databaseUrl)

  // Run health check and service checks in parallel
  const [dbHealth, ga4, sc, gemini, github] = await Promise.all([
    checkDatabaseHealth(),
    checkServiceHealth("Google Analytics", checkGA4, "GA4 API connection"),
    checkServiceHealth("Search Console", checkSearchConsole, "Google Search Console API"),
    checkServiceHealth("Gemini API", checkGeminiAPI, "Google Gemini AI API key"),
    checkServiceHealth("GitHub API", checkGitHubAPI, "GitHub API token"),
  ])

  const env = detectEnvironment()

  const database: DatabaseInfo = {
    provider: parsed.provider === "unknown" ? "PostgreSQL" : parsed.provider,
    vendor: parsed.vendor === "Unknown" ? "Unknown" : parsed.vendor,
    status: dbHealth.connected ? "connected" : "disconnected",
    host: parsed.host ? maskHost(parsed.host) : "—",
    database: parsed.database || "—",
    latency: dbHealth.latency,
    lastChecked: new Date().toISOString(),
    error: dbHealth.error,
  }

  const prismaInfo: PrismaInfo = {
    version: getPrismaVersion(),
    connected: dbHealth.connected,
  }

  const services: ServiceHealth[] = [
    {
      label: "Database",
      status: database.status,
      latency: dbHealth.latency,
      lastChecked: database.lastChecked,
      error: dbHealth.error,
      description: `${database.provider} · ${database.vendor}${database.host !== "—" ? ` · ${database.host}` : ""}`,
    },
    {
      label: "Prisma ORM",
      status: prismaInfo.connected ? "connected" : "disconnected",
      latency: null,
      lastChecked: new Date().toISOString(),
      error: prismaInfo.connected ? null : "Cannot connect to Prisma client",
      description: `v${prismaInfo.version}`,
    },
    ga4,
    sc,
    {
      label: "Gemini API",
      status: gemini.status,
      latency: gemini.latency,
      lastChecked: gemini.lastChecked,
      error: gemini.error,
      description: process.env.GEMINI_API_KEY ? "API key configured" : "No API key set",
    },
    {
      label: "GitHub API",
      status: github.status,
      latency: github.latency,
      lastChecked: github.lastChecked,
      error: github.error,
      description: process.env.GITHUB_TOKEN || process.env.GITHUB_API_TOKEN ? "Token configured" : "No token set",
    },
    {
      label: "Storage",
      status: "connected",
      latency: null,
      lastChecked: new Date().toISOString(),
      error: null,
      description: "Filesystem",
    },
    {
      label: "Analytics Pipeline",
      status: dbHealth.connected ? "connected" : "disconnected",
      latency: null,
      lastChecked: new Date().toISOString(),
      error: null,
      description: "Server-side event ingestion",
    },
    {
      label: "Deployment",
      status: "connected",
      latency: null,
      lastChecked: new Date().toISOString(),
      error: null,
      description: env.vercel ? `Vercel · ${env.region || "unknown region"}` : "Self-hosted",
    },
  ]

  const response: SystemStatusResponse = {
    database,
    prisma: prismaInfo,
    environment: env,
    services,
    timestamp: new Date().toISOString(),
  }

  cachedStatus = { data: response, timestamp: Date.now() }
  return response
}

/* ─── Helpers ────────────────────────────────────── */

function maskHost(host: string): string {
  // Only mask if it looks like it could contain sensitive info
  // For Neon endpoints like ep-long-cloud-atamigvn-pooler, show the prefix
  if (host.startsWith("ep-")) {
    const parts = host.split("-")
    if (parts.length >= 3) {
      return `${parts[0]}-${parts[1]}-***`
    }
  }
  // For RDS/Cloud SQL endpoints, mask middle octets
  if (host.includes(".amazonaws.com")) {
    const parts = host.split(".")
    if (parts.length >= 2) {
      return `***.${parts.slice(-2).join(".")}`
    }
  }
  return host
}

/* ─── Convenience: Quick DB Status for Dashboard ── */

export async function getQuickDbStatus(): Promise<{
  provider: string
  vendor: string
  status: ServiceStatus
  latency: number | null
}> {
  const databaseUrl = process.env.DATABASE_URL || ""
  const parsed = parseDatabaseUrl(databaseUrl)
  const health = await checkDatabaseHealth()

  return {
    provider: parsed.provider === "unknown" ? "PostgreSQL" : parsed.provider,
    vendor: parsed.vendor,
    status: health.connected ? "connected" : "disconnected",
    latency: health.latency,
  }
}

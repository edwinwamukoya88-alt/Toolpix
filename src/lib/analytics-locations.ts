/* ─── Top Locations Analytics Service ─────────────────────────────
 * Provides geographic breakdown queries (countries, regions, cities)
 * from the first-party analytics database.
 * Completely independent of existing analytics queries.
 * ────────────────────────────────────────────────────────────────── */

import { prisma } from "./db"
import { toDateRange, type AnalyticsDateRange } from "./analytics-db"

/* ─── Types ──────────────────────────────────────── */

export interface LocationEntry {
  name: string
  count: number
  percentage: number
}

export interface TopLocationsData {
  countries: LocationEntry[]
  regions: LocationEntry[]
  cities: LocationEntry[]
}

/* ─── Query Functions ────────────────────────────── */

export async function getTopLocations(range: AnalyticsDateRange = "last7"): Promise<TopLocationsData> {
  const { startDate, endDate } = toDateRange(range)
  const start = new Date(startDate + "T00:00:00.000Z")
  const end = new Date(endDate + "T23:59:59.999Z")

  const [countryRows, regionRows, cityRows] = await Promise.all([
    prisma.analyticsEvent.groupBy({
      by: ["country"],
      where: {
        createdAt: { gte: start, lte: end },
        country: { not: "" },
        NOT: [{ country: "unknown" }],
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["region"],
      where: {
        createdAt: { gte: start, lte: end },
        region: { not: "" },
        NOT: [{ region: "unknown" }],
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["city"],
      where: {
        createdAt: { gte: start, lte: end },
        city: { not: "" },
        NOT: [{ city: "unknown" }],
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
  ])

  const countryTotal = countryRows.reduce((s, r) => s + r._count.id, 0)
  const regionTotal = regionRows.reduce((s, r) => s + r._count.id, 0)
  const cityTotal = cityRows.reduce((s, r) => s + r._count.id, 0)

  const countries: LocationEntry[] = countryRows.map(r => ({
    name: r.country,
    count: r._count.id,
    percentage: countryTotal > 0 ? Math.round((r._count.id / countryTotal) * 1000) / 10 : 0,
  }))

  const regions: LocationEntry[] = regionRows.map(r => ({
    name: r.region,
    count: r._count.id,
    percentage: regionTotal > 0 ? Math.round((r._count.id / regionTotal) * 1000) / 10 : 0,
  }))

  const cities: LocationEntry[] = cityRows.map(r => ({
    name: r.city,
    count: r._count.id,
    percentage: cityTotal > 0 ? Math.round((r._count.id / cityTotal) * 1000) / 10 : 0,
  }))

  return { countries, regions, cities }
}

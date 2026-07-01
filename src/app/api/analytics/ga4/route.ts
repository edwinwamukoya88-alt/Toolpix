import { NextRequest, NextResponse } from "next/server"
import { BetaAnalyticsDataClient } from "@google-analytics/data"

export const runtime = "nodejs"

function getClient() {
  const clientEmail = process.env.GA_CLIENT_EMAIL
  const rawPrivateKey = process.env.GA_PRIVATE_KEY
  const propertyId = process.env.GA_PROPERTY_ID

  if (!clientEmail || !rawPrivateKey || !propertyId) {
    throw new Error("Missing GA4 environment variables")
  }

  const privateKey = rawPrivateKey.replace(/\\n/g, "\n")
  const client = new BetaAnalyticsDataClient({
    credentials: { client_email: clientEmail, private_key: privateKey },
  })

  return { client, propertyId }
}

function parseDateParams(searchParams: URLSearchParams) {
  const range = searchParams.get("range") || "last7"
  const startParam = searchParams.get("start")
  const endParam = searchParams.get("end")
  const today = new Date()
  const formatDate = (d: Date) => d.toISOString().split("T")[0]

  let startDate: string
  let endDate: string = formatDate(today)

  if (startParam && endParam) {
    startDate = startParam
    endDate = endParam
  } else {
    switch (range) {
      case "today":
        startDate = formatDate(today)
        break
      case "yesterday": {
        const y = new Date(today)
        y.setDate(y.getDate() - 1)
        startDate = formatDate(y)
        endDate = formatDate(y)
        break
      }
      case "last30": {
        const d = new Date(today)
        d.setDate(d.getDate() - 30)
        startDate = formatDate(d)
        break
      }
      case "last90": {
        const d = new Date(today)
        d.setDate(d.getDate() - 90)
        startDate = formatDate(d)
        break
      }
      default: {
        const d = new Date(today)
        d.setDate(d.getDate() - 7)
        startDate = formatDate(d)
      }
    }
  }

  return { startDate, endDate }
}

export async function GET(request: NextRequest) {
  try {
    const { client, propertyId } = getClient()
    const searchParams = request.nextUrl.searchParams
    const { startDate, endDate } = parseDateParams(searchParams)
    const metricNames = (searchParams.get("metrics") || "screenPageViews").split(",")
    const dimensionNames = (searchParams.get("dimensions") || "pagePath").split(",")

    const metrics = metricNames.map((m) => ({ name: m.trim() }))
    const dimensions = dimensionNames.map((d) => ({ name: d.trim() }))

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions,
      metrics,
    })

    const rows = response.rows?.map((row) => ({
      dimensions: row.dimensionValues?.map((d) => d.value ?? "") ?? [],
      metrics: row.metricValues?.map((m) => Number(m.value ?? 0)) ?? [],
    })) ?? []

    return NextResponse.json({
      success: true,
      source: "ga4",
      lastUpdated: new Date().toISOString(),
      data: {
        rows,
        rowCount: response.rowCount ?? rows.length,
        dateRange: { startDate, endDate },
        metricNames,
        dimensionNames,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[GA4 API]", message)
    return NextResponse.json(
      { success: false, source: "ga4", error: message },
      { status: 500 }
    )
  }
}

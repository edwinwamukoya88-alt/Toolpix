import { NextResponse } from "next/server"
import { BetaAnalyticsDataClient } from "@google-analytics/data"

export const runtime = "nodejs"

export async function GET() {
  console.log("=== GA4 ANALYTICS DEBUG ===")
  console.log("GA_CLIENT_EMAIL:", !!process.env.GA_CLIENT_EMAIL)
  console.log("GA_PRIVATE_KEY:", !!process.env.GA_PRIVATE_KEY)
  const rawId = process.env.GA_PROPERTY_ID
  console.log("GA_PROPERTY_ID (raw):", rawId)
  console.log("GA_PROPERTY_ID is numeric:", /^\d+$/.test(rawId ?? ""))

  const clientEmail = process.env.GA_CLIENT_EMAIL
  const rawPrivateKey = process.env.GA_PRIVATE_KEY
  const propertyId = process.env.GA_PROPERTY_ID

  if (!clientEmail || !rawPrivateKey || !propertyId) {
    console.error("FAIL: one or more env vars are undefined")
    return NextResponse.json(
      { error: "Missing required environment variables: GA_CLIENT_EMAIL, GA_PRIVATE_KEY, GA_PROPERTY_ID" },
      { status: 500 },
    )
  }

  if (!/^\d+$/.test(propertyId)) {
    console.error("FAIL: GA_PROPERTY_ID is not a numeric ID:", propertyId)
    return NextResponse.json(
      {
        error: "Invalid GA_PROPERTY_ID format",
        detail: `Expected a numeric GA4 property ID (e.g. "123456789"), got: "${propertyId}". Update your .env.local with the numeric ID from GA4 admin → Property Settings.`,
      },
      { status: 500 },
    )
  }

  const privateKey = rawPrivateKey.replace(/\\n/g, "\n")
  console.log("Private key starts with:", privateKey.substring(0, 30) + "...")
  console.log("Private key ends with:", "..." + privateKey.substring(privateKey.length - 20))

  console.log("Step 1: Creating BetaAnalyticsDataClient...")
  let analyticsDataClient: BetaAnalyticsDataClient
  try {
    analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    })
    console.log("Step 1 OK: Client instantiated")
  } catch (err) {
    console.error("FAIL at client construction:", err)
    return NextResponse.json(
      {
        error: "Failed to create GA4 client",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    )
  }

  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const formatDate = (d: Date) => d.toISOString().split("T")[0]

  const requestPayload = {
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: formatDate(sevenDaysAgo), endDate: formatDate(today) }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }],
  }

  console.log("Step 2: Calling runReport with payload:")
  console.log(JSON.stringify(requestPayload, null, 2))

  try {
    const [response] = await analyticsDataClient.runReport(requestPayload)
    console.log("Step 2 OK: runReport returned")
    console.log("response.rowCount:", response.rowCount)
    console.log("response.rows length:", response.rows?.length ?? 0)

    const rows =
      response.rows?.map((row) => ({
        pagePath: row.dimensionValues?.[0]?.value ?? "",
        screenPageViews: Number(row.metricValues?.[0]?.value ?? 0),
      })) ?? []

    return NextResponse.json({
      rows,
      rowCount: response.rowCount ?? rows.length,
    })
  } catch (error: unknown) {
    console.error("FAIL at runReport:")
    console.error("Error constructor:", (error as Error)?.constructor?.name ?? typeof error)
    console.error("Error message:", (error as Error)?.message ?? String(error))
    console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)))
    if (error instanceof Error) {
      console.error("Stack:", error.stack)
    }

    const message = error instanceof Error ? error.message : String(error)
    const isDev = process.env.NODE_ENV !== "production"
    return NextResponse.json(
      {
        error: message,
        ...(isDev
          ? {
              detail: error instanceof Error ? error.stack : String(error),
              type: error instanceof Error ? error.constructor.name : typeof error,
            }
          : {}),
      },
      { status: 500 },
    )
  }
}

import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    console.log("[Search Console API] Env check:", {
      GA_CLIENT_EMAIL: !!process.env.GA_CLIENT_EMAIL,
      GA_PRIVATE_KEY: !!process.env.GA_PRIVATE_KEY,
      GA_SEARCH_CONSOLE_PROPERTY: !!process.env.GA_SEARCH_CONSOLE_PROPERTY,
    })

    const clientEmail = process.env.GA_CLIENT_EMAIL
    const rawPrivateKey = process.env.GA_PRIVATE_KEY
    const configuredSite = process.env.GA_SEARCH_CONSOLE_PROPERTY

    if (!clientEmail || !rawPrivateKey) {
      return NextResponse.json({
        success: false, source: "search-console",
        error: "Missing GA4 credentials (required for Search Console auth)",
        debug: { version: "v2-debug", property: process.env.GA_SEARCH_CONSOLE_PROPERTY },
      }, { status: 500 })
    }

    if (!configuredSite) {
      console.error("[Search Console API] GA_SEARCH_CONSOLE_PROPERTY is undefined at runtime. Check Vercel env vars or .env.local.")
      return NextResponse.json({
        success: false,
        source: "search-console",
        error: "Search Console property not configured. "
          + "GA_SEARCH_CONSOLE_PROPERTY is undefined at runtime. "
          + "This variable must be set in Vercel project Environment Variables (it is not deployed from .env.local).",
        debug: { version: "v2-debug", property: process.env.GA_SEARCH_CONSOLE_PROPERTY },
      })
    }

    const siteUrl = configuredSite
    const startDate = request.nextUrl.searchParams.get("start") || getDate(-7)
    const endDate = request.nextUrl.searchParams.get("end") || getDate(0)
    const dimensions = (request.nextUrl.searchParams.get("dimensions") || "query").split(",")
    const rowLimit = parseInt(request.nextUrl.searchParams.get("limit") || "20", 10)

    const privateKey = rawPrivateKey.replace(/\\n/g, "\n")

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: createJwtAssertion(clientEmail, privateKey),
      }),
    })

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text()
      console.error("[Search Console API] Auth failed:", errText)
      return NextResponse.json({
        success: false, source: "search-console", error: `Auth failed: ${errText}`,
        debug: { version: "v2-debug", property: process.env.GA_SEARCH_CONSOLE_PROPERTY },
      }, { status: 500 })
    }

    const { access_token } = await tokenResponse.json()

    const requestUrl =
      "https://www.googleapis.com/webmasters/v3/sites/" + encodeURIComponent(siteUrl) + "/searchAnalytics/query"

    const requestBody = {
      startDate,
      endDate,
      dimensions: dimensions.map((d) => d.trim()),
      rowLimit,
      dataState: "all",
    }

    console.log("[Search Console API] Request URL:", requestUrl)
    console.log("[Search Console API] Request body:", JSON.stringify(requestBody))

    const scRes = await fetch(requestUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!scRes.ok) {
      const errText = await scRes.text()
      console.error("[Search Console API] HTTP status:", scRes.status)
      console.error("[Search Console API] Response body:", errText)

      let googleError: object | null = null
      try {
        googleError = JSON.parse(errText)
      } catch {}

      return NextResponse.json({
        success: false,
        source: "search-console",
        propertyIdentifier: siteUrl,
        requestUrl,
        httpStatus: scRes.status,
        googleError,
        googleRawResponse: errText,
        error:
          googleError && typeof googleError === "object" && "error" in googleError
            ? (googleError as any).error.message || errText
            : errText,
        debug: { version: "v2-debug", property: process.env.GA_SEARCH_CONSOLE_PROPERTY },
      }, { status: scRes.status })
    }

    const data = await scRes.json()

    console.log("[Search Console API] Full response:", JSON.stringify(data))
    console.log("[Search Console API] Row count:", data.rows?.length ?? 0)
    console.log("[Search Console API] responseAggregationType:", data.responseAggregationType)

    if (!data.rows || data.rows.length === 0) {
      console.log("[Search Console API] No rows returned. Returning empty array.")
      return NextResponse.json({
        success: true,
        source: "search-console",
        lastUpdated: new Date().toISOString(),
        data: {
          rows: [],
          dateRange: { startDate, endDate },
        },
      })
    }

    return NextResponse.json({
      success: true,
      source: "search-console",
      lastUpdated: new Date().toISOString(),
      data: {
        rows: data.rows.map((row: any) => ({
          keys: row.keys ?? [],
          clicks: row.clicks ?? 0,
          impressions: row.impressions ?? 0,
          ctr: row.ctr ?? 0,
          position: row.position ?? 0,
        })),
        responseAggregationType: data.responseAggregationType,
        dateRange: { startDate, endDate },
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[Search Console API]", message)
    return NextResponse.json({
      success: false, source: "search-console", error: message,
      debug: { version: "v2-debug", property: process.env.GA_SEARCH_CONSOLE_PROPERTY },
    }, { status: 500 })
  }
}

function createJwtAssertion(clientEmail: string, privateKey: string): string {
  const header = { alg: "RS256", typ: "JWT" }
  const now = Math.floor(Date.now() / 1000)
  const claims = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  }

  const b64 = (obj: any) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")

  const signatureInput = `${b64(header)}.${b64(claims)}`
  const crypto = require("crypto")
  const signature = crypto.sign("sha256", Buffer.from(signatureInput), privateKey)
  const signatureB64 = signature
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")

  return `${signatureInput}.${signatureB64}`
}

function getDate(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysAgo)
  return d.toISOString().split("T")[0]
}

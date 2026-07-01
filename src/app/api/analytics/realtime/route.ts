import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  try {
    const clientEmail = process.env.GA_CLIENT_EMAIL
    const rawPrivateKey = process.env.GA_PRIVATE_KEY
    const propertyId = process.env.GA_PROPERTY_ID

    if (!clientEmail || !rawPrivateKey || !propertyId) {
      return NextResponse.json(
        { success: false, source: "realtime", error: "Missing GA4 environment variables" },
        { status: 500 }
      )
    }

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
      console.error("[Realtime API] Auth failed:", errText)
      return NextResponse.json(
        { success: false, source: "realtime", error: `Auth failed: ${errText}` },
        { status: 500 }
      )
    }

    const { access_token } = await tokenResponse.json()

    const realtimeResponse = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dimensions: [{ name: "unifiedScreenName" }, { name: "country" }],
          metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
          limit: 10,
        }),
      }
    )

    if (!realtimeResponse.ok) {
      const errText = await realtimeResponse.text()
      console.error("[Realtime API] Request failed:", errText)
      return NextResponse.json(
        { success: false, source: "realtime", error: `Realtime API failed: ${errText}` },
        { status: 500 }
      )
    }

    const data = await realtimeResponse.json()

    const rows = data.rows?.map((row: any) => ({
      screenName: row.dimensionValues?.[0]?.value ?? "",
      country: row.dimensionValues?.[1]?.value ?? "",
      activeUsers: Number(row.metricValues?.[0]?.value ?? 0),
      screenPageViews: Number(row.metricValues?.[1]?.value ?? 0),
    })) ?? []

    const totalActiveUsers = rows.reduce((sum: number, r: any) => sum + r.activeUsers, 0)

    return NextResponse.json({
      success: true,
      source: "realtime",
      lastUpdated: new Date().toISOString(),
      data: {
        activeUsers: totalActiveUsers,
        rows,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[Realtime API]", message)
    return NextResponse.json(
      { success: false, source: "realtime", error: message },
      { status: 500 }
    )
  }
}

function createJwtAssertion(clientEmail: string, privateKey: string): string {
  const header = { alg: "RS256", typ: "JWT" }
  const now = Math.floor(Date.now() / 1000)
  const claims = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
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

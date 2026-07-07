export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const [ipRes, locRes] = await Promise.all([
      fetch("https://api.ipify.org?format=json", { signal: AbortSignal.timeout(8000) }),
      fetch("https://ip-api.com/json/", { signal: AbortSignal.timeout(8000) }),
    ])

    const [ipData, locData] = await Promise.all([ipRes.json(), locRes.json()])

    const result: Record<string, unknown> = {
      ip: ipData.ip,
      isp: locData.isp || null,
      asn: locData.as ? `AS${locData.as}` : null,
      country: locData.country || null,
      countryCode: locData.countryCode || null,
      region: locData.regionName || locData.region || null,
      city: locData.city || null,
      timezone: locData.timezone || null,
      org: locData.org || null,
      lat: locData.lat || null,
      lon: locData.lon || null,
    }

    return Response.json(result, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch {
    return Response.json(
      { error: "Failed to retrieve IP information. Please try again." },
      { status: 502 }
    )
  }
}

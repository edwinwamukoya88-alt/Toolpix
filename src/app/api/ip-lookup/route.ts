export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ip = searchParams.get("ip") || ""

  if (!ip) {
    return Response.json({ error: "IP address is required" }, { status: 400 })
  }

  try {
    const res = await fetch(`https://ip-api.com/json/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()

    if (data.status === "fail") {
      return Response.json(
        { error: data.message || "Invalid IP address or domain" },
        { status: 400 }
      )
    }

    return Response.json(data, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
    })
  } catch {
    return Response.json(
      { error: "Lookup failed. Please try again." },
      { status: 502 }
    )
  }
}

export const dynamic = "force-dynamic"

const TYPE_IDS: Record<string, number> = {
  A: 1, AAAA: 28, MX: 15, TXT: 16, NS: 2, CNAME: 5, SOA: 6, PTR: 12,
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get("name")
  const typesRaw = searchParams.get("types")

  if (!name) {
    return Response.json({ error: "Domain name is required" }, { status: 400 })
  }

  const types = typesRaw ? typesRaw.split(",").filter((t) => TYPE_IDS[t]) : ["A", "AAAA", "MX"]

  try {
    const results = await Promise.all(
      types.map(async (type) => {
        const res = await fetch(
          `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${TYPE_IDS[type]}`,
          { signal: AbortSignal.timeout(8000) }
        )
        return res.json()
      })
    )

    return Response.json(results, {
      headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" },
    })
  } catch {
    return Response.json(
      { error: "DNS lookup failed. Please try again." },
      { status: 502 }
    )
  }
}

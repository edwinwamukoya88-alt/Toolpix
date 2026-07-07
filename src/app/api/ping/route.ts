export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const target = searchParams.get("target")

  if (!target) {
    return Response.json({ serverTime: 0 }, {
      headers: { "Cache-Control": "no-store, private" },
    })
  }

  let serverTime = 0
  let reachable = false

  try {
    const start = performance.now()
    const protocol = target.includes("://") ? "" : "https://"
    const res = await fetch(`${protocol}${target}`, {
      method: "HEAD",
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    })
    serverTime = Math.round(performance.now() - start)
    reachable = res.ok || res.status < 500
  } catch {
    serverTime = -1
  }

  return Response.json({ serverTime, reachable }, {
    headers: { "Cache-Control": "no-store, private" },
  })
}

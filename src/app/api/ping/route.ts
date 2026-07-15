export const dynamic = "force-dynamic"

const ALLOWED_HOSTS = new Set([
  "zilita.com", "www.zilita.com",
])

function isPrivateIP(hostname: string): boolean {
  const lower = hostname.toLowerCase()
  if (lower === "localhost" || lower === "127.0.0.1" || lower === "::1" || lower === "::ffff:127.0.0.1") return true
  if (lower.startsWith("10.") || lower.startsWith("192.168.") || lower.startsWith("172.")) return true
  if (lower === "169.254.169.254" || lower.startsWith("169.254.")) return true
  if (lower === "0.0.0.0") return true
  return false
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const target = searchParams.get("target")

  if (!target) {
    return Response.json({ serverTime: 0 }, {
      headers: { "Cache-Control": "no-store, private" },
    })
  }

  let parsedUrl: URL
  try {
    const withProto = target.includes("://") ? target : `https://${target}`
    parsedUrl = new URL(withProto)
  } catch {
    return Response.json({ error: "Invalid URL" }, { status: 400 })
  }

  if (!ALLOWED_HOSTS.has(parsedUrl.hostname)) {
    return Response.json({ error: "Target not allowed" }, { status: 403 })
  }

  if (isPrivateIP(parsedUrl.hostname)) {
    return Response.json({ error: "Private targets not allowed" }, { status: 403 })
  }

  let serverTime = 0
  let reachable = false

  try {
    const start = performance.now()
    const res = await fetch(parsedUrl.href, {
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

export const dynamic = "force-dynamic"

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, private",
      "Content-Length": "0",
    },
  })
}

export async function GET() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, private",
    },
  })
}

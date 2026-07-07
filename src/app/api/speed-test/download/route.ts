const KB = 1024
const DOWNLOAD_SIZE = 500 * KB

export const dynamic = "force-dynamic"
export const preferredRegion = "auto"

export async function GET() {
  const buf = new Uint8Array(DOWNLOAD_SIZE)
  for (let i = 0; i < buf.length; i += 65536) {
    const view = buf.subarray(i, i + Math.min(65536, buf.length - i))
    crypto.getRandomValues(view)
  }
  return new Response(buf, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(DOWNLOAD_SIZE),
      "Cache-Control": "no-store, private",
      "Access-Control-Allow-Origin": "*",
    },
  })
}

export function getAppUrl(path = ""): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://smart-tools-kit.vercel.app"
  if (!path) return base
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${base}${normalized}`
}

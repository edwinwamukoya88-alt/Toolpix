export function getAppUrl(path = ""): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://zilita.com"
  if (!path) return base
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${base}${normalized}`
}

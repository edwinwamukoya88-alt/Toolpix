import { SITE_URL } from "@/lib/constants"

export function getAppUrl(path = ""): string {
  if (!path) return SITE_URL
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${SITE_URL}${normalized}`
}

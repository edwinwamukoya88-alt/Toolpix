import { NextRequest } from "next/server"

export interface LocationData {
  country: string
  region: string
  city: string
}

export function extractLocationFromRequest(request: NextRequest): LocationData {
  const country = request.headers.get("x-vercel-ip-country") || ""
  const region = request.headers.get("x-vercel-ip-region") || ""
  const city = request.headers.get("x-vercel-ip-city") || ""

  return {
    country: country || "Unknown",
    region: region || "Unknown",
    city: decodeURIComponent(city) || "Unknown",
  }
}

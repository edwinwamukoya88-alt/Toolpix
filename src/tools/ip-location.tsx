"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Search, MapPin, Globe, Building2, Network, Clock, RotateCcw, History, AlertCircle, Flag } from "lucide-react"
import { toast } from "sonner"

interface IPLocation {
  query: string
  country: string
  countryCode: string
  city: string
  region: string
  regionName: string
  zip: string
  lat: number
  lon: number
  timezone: string
  isp: string
  org: string
  as: string
  status: string
  message?: string
}

const HISTORY_KEY = "ip-location-history"

function loadHistory(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(queries: string[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(queries))
  } catch {}
}

export default function IPLocation() {
  const [query, setQuery] = useState("")
  const [data, setData] = useState<IPLocation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [recent, setRecent] = useState<string[]>(() => loadHistory())
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [])

  const initMap = useCallback((lat: number, lon: number) => {
    if (typeof window === "undefined") return
    if (mapInstance.current) {
      mapInstance.current.remove()
      mapInstance.current = null
    }
    import("leaflet").then((L) => {
      if (!mapRef.current) return
      const map = L.map(mapRef.current, { zoomControl: false }).setView([lat, lon], 13)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map)
      L.marker([lat, lon]).addTo(map)
      setTimeout(() => map.invalidateSize(), 200)
      mapInstance.current = map
    }).catch(() => {})
  }, [])

  const lookup = useCallback(async (ip?: string) => {
    const target = (ip || query).trim()
    if (!target) return
    setLoading(true)
    setError("")
    setData(null)
    try {
      const res = await fetch(`/api/ip-lookup?ip=${encodeURIComponent(target)}`, {
        signal: AbortSignal.timeout(10000),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Invalid IP address or domain")
        setLoading(false)
        return
      }
      setData(json)
      initMap(json.lat, json.lon)
      const next = [target, ...recent.filter((r) => r !== target)].slice(0, 10)
      setRecent(next)
      saveHistory(next)
    } catch (e) {
      setError((e as Error).message || "Lookup failed. Check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }, [query, recent, initMap])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    lookup()
  }, [lookup])

  const copyResult = useCallback(() => {
    if (!data) return
    const text = `IP Location: ${data.query}
Country: ${data.country}
City: ${data.city}
Region: ${data.regionName}
Postal Code: ${data.zip}
Latitude: ${data.lat}, Longitude: ${data.lon}
Time Zone: ${data.timezone}
ISP: ${data.isp}
Organization: ${data.org}
ASN: ${data.as}`
    navigator.clipboard.writeText(text).then(() => toast.success("Results copied"))
  }, [data])

  const reset = useCallback(() => {
    setQuery("")
    setData(null)
    setError("")
    setLoading(false)
    if (mapInstance.current) {
      mapInstance.current.remove()
      mapInstance.current = null
    }
  }, [])

  const lookupSelf = useCallback(() => {
    setQuery("")
    lookup("")
  }, [lookup])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">IP Location Lookup</h2>
        <p className="text-sm text-muted-foreground">Find the geographic location of any IP address</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter IP address or domain..."
                className="pl-9 h-11"
              />
            </div>
            <Button type="submit" disabled={loading || !query.trim()} className="h-11 px-5">
              {loading ? (
                <div className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="ml-2">Lookup</span>
            </Button>
          </form>

          <Button variant="outline" size="sm" onClick={lookupSelf} disabled={loading} className="w-full gap-2">
            <Globe className="h-3.5 w-3.5" /> Look Up My IP
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="p-5 space-y-3 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-4 w-36 bg-muted rounded" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {error && !loading && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {data && !loading && (
        <>
          <Card>
            <CardContent className="p-5 space-y-0 divide-y divide-muted/50">
              <div className="flex items-center justify-between py-3 first:pt-0">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">IP Address</span>
                </div>
                <span className="text-sm font-medium">{data.query}</span>
              </div>
              {data.country && (
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <Flag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">Country</span>
                  </div>
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    {data.countryCode && (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://flagcdn.com/16x12/${data.countryCode.toLowerCase()}.png`}
                          alt={data.countryCode}
                          className="inline-block w-4 h-3 rounded"
                        />
                      </>
                    )}
                    {data.country}
                  </span>
                </div>
              )}
              {data.city && (
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">City</span>
                  </div>
                  <span className="text-sm font-medium">{data.city}</span>
                </div>
              )}
              {data.regionName && (
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">Region</span>
                  </div>
                  <span className="text-sm font-medium">{data.regionName}</span>
                </div>
              )}
              {data.zip && (
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">Postal Code</span>
                  </div>
                  <span className="text-sm font-medium">{data.zip}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">Latitude</span>
                </div>
                <span className="text-sm font-medium tabular-nums">{data.lat}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">Longitude</span>
                </div>
                <span className="text-sm font-medium tabular-nums">{data.lon}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">Time Zone</span>
                </div>
                <span className="text-sm font-medium">{data.timezone}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">ISP</span>
                </div>
                <span className="text-sm font-medium">{data.isp}</span>
              </div>
              {data.org && (
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">Organization</span>
                  </div>
                  <span className="text-sm font-medium">{data.org}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-3 last:pb-0">
                <div className="flex items-center gap-2">
                  <Network className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">ASN</span>
                </div>
                <span className="text-sm font-medium">{data.as}</span>
              </div>
            </CardContent>
          </Card>

          <div ref={mapRef} className="w-full h-64 rounded-xl border overflow-hidden bg-muted/20" />

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" size="sm" onClick={copyResult} className="gap-1.5">
              <Copy className="h-3.5 w-3.5" /> Copy Results
            </Button>
            <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-muted-foreground">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>
        </>
      )}

      {recent.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <History className="h-4 w-4" />
              <span>Recent Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recent.map((ip) => (
                <button
                  key={ip}
                  onClick={() => { setQuery(ip); lookup(ip) }}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                >
                  <Search className="h-3 w-3" />
                  {ip}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Data provided by ip-api.com via server proxy.
      </p>
    </div>
  )
}

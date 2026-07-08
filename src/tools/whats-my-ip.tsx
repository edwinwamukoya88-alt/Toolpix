"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, RefreshCw, Globe, MapPin, Building2, Smartphone, Monitor, Network, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface IPInfo {
  ip: string
  isp?: string
  asn?: string
  country?: string
  countryCode?: string
  region?: string
  city?: string
  timezone?: string
  org?: string
}

interface BrowserInfo {
  browser: string
  os: string
  platform: string
  language: string
  cores: number
  ram?: string
  connection?: string
}

function getBrowserInfo(): BrowserInfo {
  const ua = navigator.userAgent
  const getBrowser = () => {
    if (ua.includes("Edg/")) return "Microsoft Edge"
    if (ua.includes("Chrome/")) return "Google Chrome"
    if (ua.includes("Firefox/")) return "Mozilla Firefox"
    if (ua.includes("Safari/")) return "Apple Safari"
    if (ua.includes("OPR/") || ua.includes("Opera/")) return "Opera"
    return "Unknown"
  }
  const getOS = () => {
    if (ua.includes("Windows")) return "Windows"
    if (ua.includes("Mac OS")) return "macOS"
    if (ua.includes("Linux")) return "Linux"
    if (ua.includes("Android")) return "Android"
    if (ua.includes("iOS") || ua.includes("iPhone")) return "iOS"
    return "Unknown"
  }
  const getRAM = () => {
    if ((navigator as any).deviceMemory) {
      return `${(navigator as any).deviceMemory} GB`
    }
    return undefined
  }
  const getConnection = () => {
    const conn = (navigator as any).connection
    if (conn?.effectiveType) {
      return conn.effectiveType.toUpperCase()
    }
    return undefined
  }

  return {
    browser: getBrowser(),
    os: getOS(),
    platform: navigator.platform || "Unknown",
    language: navigator.language,
    cores: navigator.hardwareConcurrency || 0,
    ram: getRAM(),
    connection: getConnection(),
  }
}

export default function WhatsMyIP() {
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null)
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const fetchIPInfo = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/whats-my-ip", { signal: AbortSignal.timeout(10000) })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Failed to fetch IP information")
      }
      const data = await res.json()
      setIpInfo({
        ip: data.ip,
        isp: data.isp,
        asn: data.asn,
        country: data.country,
        countryCode: data.countryCode,
        region: data.region,
        city: data.city,
        timezone: data.timezone,
        org: data.org,
      })
    } catch (e) {
      setError((e as Error).message || "Failed to fetch IP information")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchIPInfo()
    setBrowserInfo(getBrowserInfo())
  }, [fetchIPInfo])

  const copyIP = useCallback(() => {
    if (!ipInfo?.ip) return
    navigator.clipboard.writeText(ipInfo.ip).then(() => {
      setCopied(true)
      toast.success("IP address copied")
      setTimeout(() => setCopied(false), 2000)
    })
  }, [ipInfo])

  const refresh = useCallback(() => {
    setRetryCount((c) => c + 1)
    fetchIPInfo()
    setBrowserInfo(getBrowserInfo())
  }, [fetchIPInfo])

  if (loading && !ipInfo) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">What&apos;s My IP</h2>
          <p className="text-sm text-muted-foreground">Discover your public IP and network information</p>
        </div>
        <Card>
          <CardContent className="p-5 space-y-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-4 w-40 bg-muted rounded" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !ipInfo) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">What&apos;s My IP</h2>
          <p className="text-sm text-muted-foreground">Discover your public IP and network information</p>
        </div>
        <Card>
          <CardContent className="p-5 text-center space-y-4">
            <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={refresh} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const items = [
    { icon: Globe, label: "Public IPv4", value: ipInfo?.ip },
    { icon: Network, label: "ISP", value: ipInfo?.isp },
    { icon: Building2, label: "Organization", value: ipInfo?.org },
    { icon: Network, label: "ASN", value: ipInfo?.asn },
    { icon: MapPin, label: "Country", value: ipInfo?.country },
    { icon: MapPin, label: "Region", value: ipInfo?.region },
    { icon: MapPin, label: "City", value: ipInfo?.city },
    { icon: Clock, label: "Time Zone", value: ipInfo?.timezone },
    { icon: Monitor, label: "Browser", value: browserInfo?.browser },
    { icon: Smartphone, label: "Operating System", value: browserInfo?.os },
    { icon: Monitor, label: "Platform", value: browserInfo?.platform },
    { icon: Globe, label: "Language", value: browserInfo?.language },
    { icon: Network, label: "CPU Cores", value: browserInfo?.cores ? String(browserInfo.cores) : undefined },
    { icon: Network, label: "Connection", value: browserInfo?.connection },
    { icon: Monitor, label: "RAM", value: browserInfo?.ram },
  ].filter((item) => item.value)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">What&apos;s My IP</h2>
          <p className="text-sm text-muted-foreground">Discover your public IP and network information</p>
        </div>

        <Card>
        <CardContent className="p-5 space-y-0 divide-y divide-muted/50">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-2">
                <item.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
              <span className="text-sm font-medium text-right max-w-[55%] truncate">{item.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {error && ipInfo && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Some information may be incomplete: {error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={copyIP} variant="default" className="gap-2">
          {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy IP"}
        </Button>
        <Button onClick={refresh} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Your IP and location are approximate. We do not store any data.
      </p>
    </div>
  )
}

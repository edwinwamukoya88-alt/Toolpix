"use client"

import { useEffect, useRef, useState, useId, startTransition } from "react"

const AD_CLIENT = "ca-pub-2606064008386995"
const IS_DEV = process.env.NODE_ENV === "development"

function getConsent(): boolean | null {
  try {
    const val = localStorage.getItem("toolpix_ad_consent")
    if (val === null) return null
    return val === "true"
  } catch {
    return null
  }
}

interface AdBannerProps {
  slot: string
  format?: "horizontal" | "vertical" | "rectangle" | "responsive"
  className?: string
  style?: React.CSSProperties
}

const formatConfig: Record<string, { width: number; height: number; className: string }> = {
  horizontal: { width: 728, height: 90, className: "w-full max-w-[728px] h-[90px]" },
  vertical: { width: 160, height: 600, className: "w-[160px] h-[600px]" },
  rectangle: { width: 336, height: 280, className: "w-full max-w-[336px] h-[280px]" },
  responsive: { width: 0, height: 0, className: "w-full min-h-[90px] sm:min-h-[90px] md:min-h-[90px]" },
}

export default function AdBanner({ slot, format = "responsive", className = "", style }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [consent, setConsent] = useState<boolean | null>(null)
  const id = useId()
  const cfg = formatConfig[format]

  useEffect(() => {
    const handler = () => setConsent(getConsent())
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  useEffect(() => {
    if (IS_DEV) return

    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || loaded || error || consent === null) return

    try {
      const timeout = setTimeout(() => {
        if (typeof (window as any).adsbygoogle !== "undefined") {
          try {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({
              google_ad_client: AD_CLIENT,
              enable_page_level_ads: true,
              non_personalized_ads: !consent,
            })
          } catch {
            setError(true)
          }
        }
        setLoaded(true)
      }, 100)

      return () => clearTimeout(timeout)
    } catch {
      queueMicrotask(() => { startTransition(() => { setError(true); setLoaded(true) }) })
    }
  }, [visible, loaded, error, consent])

  if (IS_DEV) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl border bg-muted/10 text-muted-foreground ${cfg.className} ${className}`}
        style={style}
      >
        <span className="absolute top-1.5 left-2 text-[10px] font-medium text-muted-foreground/40 uppercase tracking-wider">Sponsored</span>
        <div className="text-center text-xs px-4 py-6">
          <div className="h-6 w-24 mx-auto rounded-md bg-muted/20" />
        </div>
      </div>
    )
  }

  if (consent === null) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className={`ad-container ${cfg.className} ${className}`}
      style={{ minHeight: cfg.height || 90, ...style }}
    >
      {!loaded && !error && (
        <div className="flex items-center justify-center h-full rounded-lg bg-muted/20 animate-pulse">
          <span className="text-xs text-muted-foreground">Loading ad...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-full rounded-lg border border-dashed bg-muted/10">
          <span className="text-xs text-muted-foreground">Ad unavailable</span>
        </div>
      )}

      {visible && !error && (
        <div className="ad-content" id={`ad-${id.replace(/:/g, "")}`}>
          <ins
            className="adsbygoogle"
            style={{ display: "block", ...(format === "responsive" ? {} : { width: cfg.width, height: cfg.height }) }}
            data-ad-client={AD_CLIENT}
            data-ad-slot={slot}
            data-ad-format={format === "responsive" ? "auto" : format}
            data-full-width-responsive={format === "responsive" ? "true" : "false"}
          />
        </div>
      )}
    </div>
  )
}

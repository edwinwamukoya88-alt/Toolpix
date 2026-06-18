"use client"

import { useEffect, useRef, useState } from "react"

const AD_CLIENT = "ca-pub-2606064008386995"
const IS_DEV = process.env.NODE_ENV === "development"
const STORAGE_KEY = "toolforge_sponsored_ads"

interface SponsoredAd {
  id: string
  title: string
  description: string
  image?: string
  link: string
  slot: "hero" | "mid" | "footer"
  active: boolean
  clicks: number
  impressions: number
  createdAt: number
}

function getAds(): SponsoredAd[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAds(ads: SponsoredAd[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ads))
  } catch {
    // storage full or unavailable
  }
}

function pickRandom(ads: SponsoredAd[]): SponsoredAd | null {
  if (ads.length === 0) return null
  return ads[Math.floor(Math.random() * ads.length)]
}

interface AdSlotProps {
  type: "adsense" | "sponsored"
  slot?: string
  image?: string
  title?: string
  description?: string
  link?: string
  className?: string
}

export default function AdSlot({ type, slot, image, title, description, link, className = "" }: AdSlotProps) {
  const initialized = useRef(false)
  const [sponsoredAd, setSponsoredAd] = useState<SponsoredAd | null>(null)
  const impressionTracked = useRef(false)

  useEffect(() => {
    if (type !== "sponsored" || !slot) return
    const all = getAds()
    const candidates = all.filter((a) => a.slot === slot && a.active)
    const picked = pickRandom(candidates)
    if (picked) {
      setSponsoredAd(picked)
      if (!impressionTracked.current) {
        impressionTracked.current = true
        const updated = getAds().map((a) =>
          a.id === picked.id ? { ...a, impressions: a.impressions + 1 } : a,
        )
        saveAds(updated)
      }
    }
  }, [type, slot])

  useEffect(() => {
    if (type !== "adsense" || IS_DEV || initialized.current) return
    try {
      const adsbygoogle = (window as any).adsbygoogle || []
      adsbygoogle.push({})
      initialized.current = true
    } catch {
      // silent fail
    }
  }, [type])

  function handleClick() {
    if (!sponsoredAd) return
    const updated = getAds().map((a) =>
      a.id === sponsoredAd.id ? { ...a, clicks: a.clicks + 1 } : a,
    )
    saveAds(updated)
  }

  if (type === "sponsored") {
    const ad = sponsoredAd

    if (IS_DEV && !ad) {
      return (
        <div className={`flex justify-center my-6 ${className}`}>
          <div className="relative w-full max-w-[728px] rounded-xl border bg-muted/10 p-5">
            <span className="absolute top-2 left-3 text-[10px] font-medium text-muted-foreground/40 uppercase tracking-wider">Sponsored</span>
            <div className="flex items-center gap-4 pt-4">
              <div className="h-12 w-12 shrink-0 rounded-lg bg-muted/20" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-3/5 rounded bg-muted/20" />
                <div className="h-3 w-4/5 rounded bg-muted/10" />
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (!ad) {
      return (
        <div className={`flex justify-center my-6 ${className}`}>
          <div className="relative w-full max-w-[728px] rounded-xl border border-dashed bg-muted/5 p-5">
            <span className="absolute top-2 left-3 text-[10px] font-medium text-muted-foreground/40 uppercase tracking-wider">Sponsored</span>
            <div className="flex items-center gap-4 pt-4">
              <div className="h-12 w-12 shrink-0 rounded-lg bg-muted/10" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-2/5 rounded bg-muted/10" />
                <div className="h-3 w-3/5 rounded bg-muted/5" />
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className={`flex justify-center my-6 ${className}`}>
        <a
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="group relative w-full max-w-[728px] rounded-xl border bg-background/40 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20 block"
        >
          <span className="absolute top-2 left-3 text-[10px] font-medium text-muted-foreground/40 uppercase tracking-wider">Sponsored</span>
          <div className="flex items-center gap-4 pt-4">
            {ad.image && (
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                <img src={ad.image} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold group-hover:text-primary transition-colors truncate">{ad.title}</p>
              {ad.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{ad.description}</p>
              )}
            </div>
          </div>
        </a>
      </div>
    )
  }

  if (IS_DEV) {
    return (
      <div className={`flex justify-center my-6 ${className}`}>
        <div className="relative flex items-center justify-center rounded-xl border bg-muted/10 text-muted-foreground w-full max-w-[728px] h-[90px]">
          <span className="absolute top-1.5 left-2 text-[10px] font-medium text-muted-foreground/40 uppercase tracking-wider">Sponsored</span>
          <div className="h-6 w-24 rounded-md bg-muted/20" />
        </div>
      </div>
    )
  }

  return (
    <div className={`flex justify-center my-6 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}

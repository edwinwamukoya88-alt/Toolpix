"use client"

import { usePathname, useSearchParams } from "next/navigation"
import Script from "next/script"
import { useEffect, useRef } from "react"

const GA_ID = "G-W75ZWVJVFB"

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const loaded = useRef(false)
  const pendingUrl = useRef<string | null>(null)

  useEffect(() => {
    const url =
      pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")

    if (!loaded.current) {
      pendingUrl.current = url
      return
    }

    if (typeof window.gtag !== "function" || !window.dataLayer) return
    window.gtag("config", GA_ID, { page_path: url })
  }, [pathname, searchParams])

  const handleLoad = () => {
    loaded.current = true

    if (typeof window.gtag !== "function" || !window.dataLayer) return
    window.gtag("js", new Date())
    window.gtag("config", GA_ID, { send_page_view: false })

    if (pendingUrl.current) {
      window.gtag("config", GA_ID, { page_path: pendingUrl.current })
      pendingUrl.current = null
    }
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
        onLoad={handleLoad}
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}', { send_page_view: false });`}
      </Script>
    </>
  )
}

"use client"

import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef, Suspense } from "react"
import { GA_MEASUREMENT_ID, pageview, trackEngagement } from "@/lib/ga"

function RouteTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const startTime = useRef<number | null>(null)
  const prevPath = useRef("")

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")

    if (prevPath.current && startTime.current !== null) {
      const elapsed = Date.now() - startTime.current
      trackEngagement(elapsed)
    }

    pageview(url)
    startTime.current = Date.now()
    prevPath.current = url
  }, [pathname, searchParams])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        if (startTime.current !== null) {
          const elapsed = Date.now() - startTime.current
          trackEngagement(elapsed)
        }
      } else {
        startTime.current = Date.now()
      }
    }

    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [])

  return null
}

export default function GoogleAnalytics() {
  return (
    <>
      <NextGoogleAnalytics gaId={GA_MEASUREMENT_ID} />
      <Suspense fallback={null}>
        <RouteTracker />
      </Suspense>
    </>
  )
}

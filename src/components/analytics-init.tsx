"use client"

import { useEffect } from "react"
import { initAnalytics } from "@/lib/analytics-client"

export default function AnalyticsInit() {
  useEffect(() => {
    initAnalytics()
  }, [])
  return null
}

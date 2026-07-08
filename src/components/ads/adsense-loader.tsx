"use client"

import { useEffect } from "react"
import { AD_CLIENT } from "@/lib/constants"

export default function AdSenseLoader() {
  useEffect(() => {
    const script = document.createElement("script")
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`
    script.async = true
    script.crossOrigin = "anonymous"
    document.head.appendChild(script)
  }, [])

  return null
}

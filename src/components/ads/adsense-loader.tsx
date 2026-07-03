"use client"

import { useEffect } from "react"

const AD_CLIENT = "ca-pub-2606064008386995"

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

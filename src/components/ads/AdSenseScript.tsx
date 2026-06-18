"use client"

import Script from "next/script"

const AD_CLIENT = "ca-pub-2606064008386995"

export default function AdSenseScript() {
  return (
    <Script
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  )
}

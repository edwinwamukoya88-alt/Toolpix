"use client"

import { useState, useEffect } from "react"
import { Cookie, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const CONSENT_KEY = "zilita_ad_consent"

export default function CookieConsent() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    try {
      if (localStorage.getItem(CONSENT_KEY) !== null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShow(false)
      }
    } catch {}
  }, [])

  function accept(consent: boolean) {
    try {
      localStorage.setItem(CONSENT_KEY, consent ? "true" : "false")
    } catch {}
    setShow(false)
  }

  if (!show) return null

  return (
    <div role="region" aria-label="Cookie consent" className="fixed bottom-0 left-0 right-0 z-[100] border-t bg-background/95 backdrop-blur-sm p-4 shadow-lg">
      <div className="container max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Cookie className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium mb-0.5">We value your privacy</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Zilita uses cookies from Google to deliver and enhance the quality of its services and to analyze traffic.
              You can choose to accept or decline. No personal data is stored on our servers.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            onClick={() => accept(false)}
          >
            Decline
          </button>
          <button
            type="button"
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            onClick={() => accept(true)}
          >
            Accept All
          </button>
          <button
            type="button"
            onClick={() => setShow(false)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

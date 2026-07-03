"use client"

import { useEffect, useState } from "react"
import { Cookie, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (localStorage.getItem("toolpix_ad_consent") === null) {
      setShow(true)
    }
  }, [])

  function accept(consent: boolean) {
    localStorage.setItem("toolpix_ad_consent", consent ? "true" : "false")
    window.location.reload()
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] border-t bg-background/95 backdrop-blur-sm p-4 shadow-lg">
      <div className="container max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Cookie className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium mb-0.5">We value your privacy</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              ToolForge uses cookies from Google to deliver and enhance the quality of its services and to analyze traffic.
              You can choose to accept or decline. No personal data is stored on our servers.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={() => accept(false)}>
            Decline
          </Button>
          <Button size="sm" onClick={() => accept(true)}>
            Accept All
          </Button>
          <button
            onClick={() => setShow(false)}
            className="p-1 rounded-md hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

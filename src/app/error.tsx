"use client"

import { useEffect } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md mx-auto">
        <div className="text-7xl sm:text-8xl font-bold text-destructive/30 select-none" aria-hidden="true">
          Oops
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Something Went Wrong</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={reset} className="w-full sm:w-auto min-h-[44px]">
            <RefreshCw className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Try Again
          </Button>
          <Link href="/" className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto min-h-[44px]" })}>
            <Home className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="text-7xl font-bold text-destructive/30">Oops</div>
        <h1 className="text-2xl font-bold tracking-tight">Something Went Wrong</h1>
        <p className="text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline">
              <Home className="h-4 w-4 mr-1.5" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

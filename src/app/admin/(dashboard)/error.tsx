"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="text-6xl font-bold text-destructive/30">!</div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Error</h1>
        <p className="text-muted-foreground">
          An unexpected error occurred in the admin panel.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Try Again
          </Button>
          <Link href="/admin">
            <Button variant="outline">
              <Home className="h-4 w-4 mr-1.5" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

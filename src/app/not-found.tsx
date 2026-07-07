import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist or has been moved.",
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="text-7xl font-bold text-primary/30">404</div>
        <h1 className="text-2xl font-bold tracking-tight">Page Not Found</h1>
        <p className="text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/">
            <Button>
              <Home className="h-4 w-4 mr-1.5" />
              Back to Home
            </Button>
          </Link>
          <Link href="/tools">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Browse Tools
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

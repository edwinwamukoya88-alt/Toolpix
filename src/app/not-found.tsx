import type { Metadata } from "next"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist or has been moved.",
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md mx-auto">
        <div className="text-7xl sm:text-8xl font-bold text-primary/30 select-none" aria-hidden="true">
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Page Not Found</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className={buttonVariants({ className: "w-full sm:w-auto min-h-[44px]" })}>
            <Home className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Back to Home
          </Link>
          <Link href="/tools" className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto min-h-[44px]" })}>
            <ArrowLeft className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Browse Tools
          </Link>
        </div>
      </div>
    </div>
  )
}

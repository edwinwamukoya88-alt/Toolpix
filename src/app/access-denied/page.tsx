import type { Metadata } from "next"
import { auth, signIn } from "@/auth"
import Link from "next/link"
import { ShieldAlert } from "lucide-react"

export const metadata: Metadata = {
  title: "Access Denied",
  description: "You do not have permission to access this admin area.",
  robots: { index: false, follow: false },
}

export default async function AccessDeniedPage() {
  const session = await auth()
  const email = session?.user?.email ?? null

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-muted-foreground text-base">
            You don&apos;t have permission to access this admin area.
          </p>
        </div>

        {email && (
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
            {email}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Return Home
          </Link>
          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/admin" })
            }}
          >
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Sign in with another account
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

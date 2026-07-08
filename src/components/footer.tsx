import Link from "next/link"

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-border/30 bg-background/80 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary/[0.015] before:to-transparent before:pointer-events-none">
      <div className="container relative py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-semibold text-2xl mb-5"
            >
              <span className="text-primary/80">◆</span>
              <span>Tool</span><span className="text-primary">Forge</span>
            </Link>
            <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-xs">
              Free browser tools for productivity, education, and development
              &mdash; built with privacy at the core. No login. No tracking.
            </p>
          </div>
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Company
            </h2>
            <ul className="space-y-2.5 text-sm" aria-label="Company links">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground/60 hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring rounded-sm"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground/60 hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring rounded-sm"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/advertise"
                  className="text-muted-foreground/60 hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring rounded-sm"
                >
                  Advertise
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Resources
            </h2>
            <ul className="space-y-2.5 text-sm" aria-label="Resource links">
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground/60 hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring rounded-sm"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-muted-foreground/60 hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring rounded-sm"
                >
                  FAQ / Help Center
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Legal
            </h2>
            <ul className="space-y-2.5 text-sm" aria-label="Legal links">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground/60 hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring rounded-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground/60 hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring rounded-sm"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 text-xs text-muted-foreground/50">
          <p>
            &copy; {new Date().getFullYear()} ToolForge. All tools run entirely
            in your browser.
          </p>
        </div>
      </div>
    </footer>
  )
}

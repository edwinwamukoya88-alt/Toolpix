import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-lg mb-3">
              <span className="text-primary">◆</span>
              ToolForge
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Privacy-first browser utility suite. No data leaves your device.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-3" id="footer-company">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground" aria-labelledby="footer-company">
              <li><Link href="/about" className="hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring rounded-sm">About</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring rounded-sm">Contact</Link></li>
              <li><Link href="/advertise" className="hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring rounded-sm">Advertise</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-3" id="footer-resources">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground" aria-labelledby="footer-resources">
              <li><Link href="/blog" className="hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring rounded-sm">Blog</Link></li>
              <li><Link href="/help" className="hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring rounded-sm">FAQ</Link></li>
              <li><Link href="/help" className="hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring rounded-sm">Help Center</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-3" id="footer-legal">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground" aria-labelledby="footer-legal">
              <li><Link href="/privacy" className="hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring rounded-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring rounded-sm">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ToolForge. All tools run entirely in your browser.</p>
        </div>
      </div>
    </footer>
  )
}

import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

const footerLinks = {
  company: [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
    { href: "/advertise", label: "Advertise" },
  ],
  resources: [
    { href: "/tools", label: "All Tools" },
    { href: "/tools/ai-workspace", label: "AI Workspace" },
    { href: "/tools?category=Education+%26+CBC+Tools", label: "CBC Tools" },
    { href: "/help", label: "FAQ / Help Center" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
  products: [
    { href: "/tools/lesson-plan-generator", label: "Lesson Planner" },
    { href: "/tools/pomodoro", label: "Pomodoro Timer" },
    { href: "/tools/grade-calculator", label: "Grade Calculator" },
    { href: "/tools/ai-workspace", label: "AI Assistant" },
  ],
}

const socialLinks = [
  { label: "X (Twitter)", href: "https://twitter.com/zilita", icon: "X" },
  { label: "GitHub", href: "https://github.com/edwinwamukoya88-alt", icon: "GitHub" },
  { label: "LinkedIn", href: "https://linkedin.com", icon: "LinkedIn" },
]

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-white/[0.06] bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />
      <div className="container relative py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center mb-5">
              <Image src="/logo-dark.svg" alt="Zilita" width={120} height={40} className="h-8 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-xs mb-6">
              The Privacy-First AI Browser Workspace. Productivity, education, business, creativity, and developer tools — all in one place.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-muted-foreground hover:text-foreground hover:border-white/[0.12] hover:bg-white/[0.02] transition-all duration-200"
                  aria-label={social.label}
                >
                  {social.icon === "X" && (
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  )}
                  {social.icon === "GitHub" && (
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  )}
                  {social.icon === "LinkedIn" && (
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {[
            { title: "Company", links: footerLinks.company },
            { title: "Resources", links: footerLinks.resources },
            { title: "Legal", links: footerLinks.legal },
            { title: "Products", links: footerLinks.products },
          ].map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                {col.title}
              </h3>
              <ul className="space-y-2.5" aria-label={`${col.title} links`}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground/60 hover:text-foreground transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-ring rounded-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 mt-8 border-t border-white/[0.04] text-xs text-muted-foreground/50">
          <p>&copy; {new Date().getFullYear()} Zilita. All tools run entirely in your browser.</p>
          <p>Built with privacy at the core. No tracking. No login. No data collection.</p>
        </div>
      </div>
    </footer>
  )
}

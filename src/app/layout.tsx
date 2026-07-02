import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import GoogleAnalytics from "@/components/GoogleAnalytics"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ToastProvider from "@/components/toast-provider"
import CookieConsent from "@/components/ads/cookie-consent"
import { BiblicalThemeProvider } from "@/contexts/biblical-theme-context"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
})
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

const AD_CLIENT = "ca-pub-2606064008386995"
const SITE_URL = "https://toolforge.app"

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ToolForge — 39+ Free Privacy-First Online Tools",
    template: "%s | ToolForge",
  },
  description: "39+ free browser-based tools for teachers, students, developers, creators, and businesses. Privacy-first, no login required, 100% client-side processing.",
  keywords: [
    "free online tools", "privacy-first tools", "CBC grade calculator", "lesson plan generator",
    "pomodoro timer", "QR code generator", "JSON formatter", "unit converter", "color picker",
    "password generator", "base64 encoder", "productivity tools", "teacher tools", "developer utilities",
    "KICD lesson planner", "CBC assessment", "student tools", "file converter", "image converter",
  ],
  authors: [{ name: "ToolForge Team" }],
  creator: "ToolForge",
  publisher: "ToolForge",
  robots: { index: true, follow: true },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "ToolForge",
    title: "ToolForge — 39+ Free Privacy-First Online Tools",
    description: "39+ free browser-based tools for teachers, students, developers, creators, and businesses. Privacy-first, no login required.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ToolForge — 39+ Free Privacy-First Online Tools",
    description: "39+ free browser-based tools for teachers, students, developers, creators, and businesses. Privacy-first, no login required.",
  },
  verification: {
    google: "Yf_ARcBmjbT5feBZyLpphBnqruYoo4mEscLeFeteMrM",
    other: { "google-adsense-account": AD_CLIENT },
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ToolForge",
  url: SITE_URL,
  description: "39+ free browser-based tools for teachers, students, developers, creators, and businesses. Privacy-first, no login required.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/tools?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        <BiblicalThemeProvider>
          <Header />
          <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <CookieConsent />
          <ToastProvider />
        </BiblicalThemeProvider>
        <GoogleAnalytics />
      </body>
    </html>
  )
}

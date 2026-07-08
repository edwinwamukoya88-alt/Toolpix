import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import GoogleAnalytics from "@/components/GoogleAnalytics"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ToastProvider from "@/components/toast-provider"
import CookieConsent from "@/components/ads/cookie-consent"
import AdSenseLoader from "@/components/ads/adsense-loader"
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

import { APP_URL, AD_CLIENT } from "@/lib/constants"
const SITE_URL = APP_URL

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Zilita — 39+ Free Privacy-First Online Tools",
    template: "%s | Zilita",
  },
  description: "39+ free browser-based tools for teachers, students, developers, creators, and businesses. Privacy-first, no login required, 100% client-side processing.",
  keywords: [
    "free online tools", "privacy-first tools", "CBC grade calculator", "lesson plan generator",
    "pomodoro timer", "QR code generator", "JSON formatter", "unit converter", "color picker",
    "password generator", "base64 encoder", "productivity tools", "teacher tools", "developer utilities",
    "KICD lesson planner", "CBC assessment", "student tools", "file converter", "image converter",
  ],
  authors: [{ name: "Zilita Team" }],
  creator: "Zilita",
  publisher: "Zilita",
  robots: { index: true, follow: true },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Zilita",
    title: "Zilita — 39+ Free Privacy-First Online Tools",
    description: "39+ free browser-based tools for teachers, students, developers, creators, and businesses. Privacy-first, no login required.",
    locale: "en_US",
    images: [{ url: `${SITE_URL}/api/og?title=Zilita&category=Productivity&type=site`, width: 1200, height: 630, alt: "Zilita" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zilita — 39+ Free Privacy-First Online Tools",
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
  name: "Zilita",
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
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Zilita",
              url: SITE_URL,
              logo: `${SITE_URL}/favicon.svg`,
              description: "39+ free browser-based tools for teachers, students, developers, creators, and businesses. Privacy-first, no login required, 100% client-side processing.",
              sameAs: [],
            }),
          }}
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
        <AdSenseLoader />
        <GoogleAnalytics />
      </body>
    </html>
  )
}

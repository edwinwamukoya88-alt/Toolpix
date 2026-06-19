import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ToastProvider from "@/components/toast-provider"
import CookieConsent from "@/components/ads/cookie-consent"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

const AD_CLIENT = "ca-pub-2606064008386995"

export const metadata: Metadata = {
  title: "ToolForge - Smart Utility Tools for Every Task",
  description: "Privacy-first browser-based tools for productivity, finance, and design",
  keywords: "tools, utilities, QR code, color picker, notes, todo, password generator, JSON formatter, unit converter",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="google-adsense-account" content={AD_CLIENT} />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsent />
        <ToastProvider />
      </body>
    </html>
  )
}

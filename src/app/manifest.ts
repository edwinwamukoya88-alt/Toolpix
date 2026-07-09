import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zilita — The Privacy-First AI Browser Workspace",
    short_name: "Zilita",
    description: "The Privacy-First AI Browser Workspace. Productivity • Education • Business • Creativity • Developers",
    start_url: "/",
    display: "standalone",
    background_color: "#111827",
    theme_color: "#111827",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}

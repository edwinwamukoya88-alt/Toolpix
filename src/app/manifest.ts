import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zilita — 39+ Free Privacy-First Online Tools",
    short_name: "Zilita",
    description: "39+ free browser-based tools for teachers, students, developers, and businesses. Privacy-first, no login required.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/favicon.svg", sizes: "48x48", type: "image/svg+xml" },
    ],
  }
}

import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/access-denied/"],
      },
    ],
    sitemap: "https://toolforge.app/sitemap.xml",
  }
}

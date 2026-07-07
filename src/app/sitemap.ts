import type { MetadataRoute } from "next"
import { getAllPosts } from "@/lib/blog"
import { tools } from "@/lib/tools-data"

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `https://smart-tools-kit.vercel.app/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  const toolEntries: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `https://smart-tools-kit.vercel.app/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [
    {
      url: "https://smart-tools-kit.vercel.app",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://smart-tools-kit.vercel.app/tools",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://smart-tools-kit.vercel.app/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogEntries,
    ...toolEntries,
    {
      url: "https://smart-tools-kit.vercel.app/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://smart-tools-kit.vercel.app/contact",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: "https://smart-tools-kit.vercel.app/privacy",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "https://smart-tools-kit.vercel.app/terms",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "https://smart-tools-kit.vercel.app/help",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://smart-tools-kit.vercel.app/advertise",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]
}

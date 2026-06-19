import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly NOT output: "export" — we need server-side API routes
  // App Router is default in Next.js 16
  reactStrictMode: true,

  // Ensure server-side routes work on Vercel
  outputFileTracingIncludes: {
    "/api/*": ["./src/lib/**/*"],
  },
};

export default nextConfig;

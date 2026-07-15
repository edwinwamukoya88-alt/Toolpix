const isDev = process.env.NODE_ENV !== "production";

const CSP_DIRECTIVES = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' blob: https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://www.googletagmanager.com https://*.google-analytics.com https://googleads.g.doubleclick.net https://www.googleadservices.com https://adservice.google.com https://unpkg.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.google-analytics.com https://*.googlesyndication.com https://*.g.doubleclick.net https://*.google.com https://*.gstatic.com https://*.googleusercontent.com https://ep1.adtrafficquality.google https://flagcdn.com https://*.tile.openstreetmap.org",
  "font-src 'self' data:",
  "connect-src 'self' blob: https://*.google-analytics.com https://analytics.google.com https://*.googlesyndication.com https://*.g.doubleclick.net https://www.googleadservices.com https://ep1.adtrafficquality.google https://unpkg.com",
  "frame-src 'self' https://*.googlesyndication.com https://*.google.com https://googleads.g.doubleclick.net https://securepubads.g.doubleclick.net",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "media-src 'self' blob:",
  "manifest-src 'self'",
];

const ContentSecurityPolicy = CSP_DIRECTIVES.join("; ") + ";";

const nextConfig = {
  reactStrictMode: true,

  images: {
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(), interest-cohort=()" },
          { key: "Content-Security-Policy", value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim() },
        ],
      },

      {
        source: "/favicon.svg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/(.*)\\.(ico|png|jpg|jpeg|gif|svg|webp|avif|woff|woff2|ttf|eot)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ]
  },
};

module.exports = nextConfig;
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://pagead2.googlesyndication.com https://www.googletagmanager.com https://*.google-analytics.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.google-analytics.com https://*.googlesyndication.com https://*.g.doubleclick.net https://*.google.com https://*.googleapis.com https://*.gstatic.com https://*.googleusercontent.com;
  font-src 'self' data:;
  connect-src 'self' blob: https://*.google-analytics.com https://*.googlesyndication.com https://analytics.google.com https://*.g.doubleclick.net;
  frame-src 'self' https://*.googlesyndication.com https://*.google.com;
  worker-src 'self' blob:;
  media-src 'self' blob:;
`;

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
    ]
  },
};

module.exports = nextConfig;
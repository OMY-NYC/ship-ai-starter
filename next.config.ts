import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // The "Load sample fridge" button reads this file on the server, so ship it with the route.
  outputFileTracingIncludes: { "/api/leftovers": ["./data/leftover_remix.csv"] },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ]
  },
}

export default nextConfig

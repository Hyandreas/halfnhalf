import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://partner.googleadservices.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https://*.tiktokcdn.com https://*.cdninstagram.com https://*.fbcdn.net https://*.ytimg.com",
            "media-src 'self' blob: https://*.tiktokcdn.com https://*.cdninstagram.com https://*.fbcdn.net https://*.googlevideo.com",
            "connect-src 'self' https://*.supabase.co https://api.stripe.com https://unpkg.com",
            "frame-src https://js.stripe.com https://hooks.stripe.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
            "font-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join("; "),
        },
      ],
    },
    {
      // COOP/COEP required for SharedArrayBuffer used by @ffmpeg/ffmpeg
      // credentialless COEP allows Google AdSense iframes on Chrome/Edge
      source: "/studio",
      headers: [
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
      ],
    },
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.tiktokcdn.com" },
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "**.ytimg.com" },
    ],
  },
};

export default nextConfig;

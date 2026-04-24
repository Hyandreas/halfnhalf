import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
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

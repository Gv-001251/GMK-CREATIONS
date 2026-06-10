import type { NextConfig } from "next";

let supabaseHostname = "*.supabase.co";
let supabaseProtocol = "https";

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    supabaseHostname = url.hostname;
    supabaseProtocol = url.protocol.replace(":", "");
  } catch {
    // Fallback
  }
}

const nextConfig: NextConfig & { allowedDevOrigins?: string[] } = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: supabaseProtocol === "http" ? "http" : "https",
        hostname: supabaseHostname,
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  allowedDevOrigins: ["10.99.245.254", "10.99.245.254:3000", "10.34.96.254", "10.34.96.254:3000"],
};

export default nextConfig;

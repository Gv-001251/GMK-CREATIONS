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
  experimental: {
    proxyClientMaxBodySize: "2gb",
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
          {
            // Content-Security-Policy:
            // - default-src 'self'              → only own origin by default
            // - script-src  checkout.razorpay   → Razorpay payment SDK
            // - connect-src *.supabase.co       → Supabase DB + Auth
            // - connect-src *.backblazeb2.com   → B2 presigned uploads
            // - img-src     lh3.googleusercontent → Google OAuth avatars
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://lh3.googleusercontent.com https://*.supabase.co",
              `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.backblazeb2.com https://api.razorpay.com`,
              "frame-src https://api.razorpay.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  allowedDevOrigins: ["10.99.245.254", "10.99.245.254:3000", "10.34.96.254", "10.34.96.254:3000"],
};

export default nextConfig;

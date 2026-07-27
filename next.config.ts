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
        protocol: "https",
        hostname: "images.unsplash.com",
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
          // Legacy XSS filter for old browsers (IE, old Safari/Edge). Modern
          // browsers ignore this and rely on the Content-Security-Policy below;
          // it's included to satisfy scanners and cover pre-CSP browsers.
          { key: "X-XSS-Protection", value: "1; mode=block" },
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
          // Isolate our browsing context from windows we open or that open us,
          // mitigating cross-origin opener/tabnabbing attacks. "allow-popups"
          // keeps popups WE open (e.g. OAuth / payment) functional.
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          // Stops OTHER sites from embedding our own resources (helps against
          // Spectre-style cross-origin leaks). This only restricts how other
          // sites load our assets; it never affects this site loading its own
          // resources, nor loading third-party resources (Razorpay, fonts,
          // images) — those are governed by the remote origin's headers.
          // "same-site" (not "same-origin") so the apex and www hosts, which are
          // the same site, can still share resources if no canonical redirect
          // is in place; third-party origins are still blocked.
          // NOTE: Cross-Origin-Embedder-Policy is deliberately NOT set. Setting
          // it to "require-corp" would require every third-party resource
          // (Razorpay iframe, Google/Supabase/Unsplash images, Google Fonts) to
          // send its own CORP opt-in header, which they don't — that would break
          // the checkout modal, images and fonts. It's only needed for
          // SharedArrayBuffer, which this app doesn't use.
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-site",
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://lh3.googleusercontent.com https://*.supabase.co https://images.unsplash.com",
              `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.backblazeb2.com https://api.razorpay.com`,
              "frame-src https://api.razorpay.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
      // ─── Cache-Control for sensitive responses ──────────────────────────────
      // API responses can carry personal data (orders, profile, uploads, admin),
      // so they must never be stored by the browser or any shared/CDN cache.
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0, must-revalidate",
          },
        ],
      },
      // Authenticated / user-specific pages. These sit behind sign-in, so we
      // stop any browser or shared cache from storing the response — even though
      // Next renders some as static shells, a cached copy on a shared machine or
      // CDN is undesirable. Public pages (/, /products, /portfolio, /contact,
      // /privacy, ...) intentionally keep their cacheable defaults for speed.
      {
        source: "/(admin|orders|cart|checkout|upload|login|signup|auth)(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
  allowedDevOrigins: ["10.99.245.254", "10.99.245.254:3000", "10.34.96.254", "10.34.96.254:3000"],
};

export default nextConfig;

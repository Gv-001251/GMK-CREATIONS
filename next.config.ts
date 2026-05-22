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
  allowedDevOrigins: ["10.34.96.254", "10.34.96.254:3000"],
};

export default nextConfig;

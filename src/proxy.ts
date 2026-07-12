import { NextRequest, NextResponse } from "next/server";

// ─── Simple in-process sliding-window rate limiter ───────────────────────────
// Works per server instance. For multi-instance deployments, replace the Map
// with an Upstash Redis store using @upstash/ratelimit.
// ─────────────────────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/upload":          { max: 10,  windowMs: 60_000 },   // 10 uploads / min
  "/api/orders":          { max: 15,  windowMs: 60_000 },   // 15 order creates / min
  "/api/auth":            { max: 20,  windowMs: 60_000 },   // 20 auth calls / min
  "/api/admin":           { max: 60,  windowMs: 60_000 },   // 60 admin calls / min
};

function getLimit(pathname: string) {
  for (const [prefix, config] of Object.entries(LIMITS)) {
    if (pathname.startsWith(prefix)) return config;
  }
  return null;
}

function checkRateLimit(ip: string, pathname: string): boolean {
  const limit = getLimit(pathname);
  if (!limit) return true; // No limit defined → allow

  const key = `${ip}:${pathname}`;
  const now = Date.now();

  // Lazy cleanup of store if it gets too large
  if (store.size > 1000) {
    store.forEach((entry, k) => {
      const path = k.split(":")[1];
      const entryLimit = getLimit(path);
      if (entryLimit && now - entry.windowStart > entryLimit.windowMs) {
        store.delete(k);
      }
    });
  }

  const entry = store.get(key);

  if (!entry || now - entry.windowStart > limit.windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= limit.max) return false;

  entry.count++;
  return true;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only rate-limit API routes
  if (pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    if (!checkRateLimit(ip, pathname)) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down and try again." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": String(getLimit(pathname)?.max ?? 0),
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};

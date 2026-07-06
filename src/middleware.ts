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

// Clean up stale entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    const limit = Object.entries(LIMITS).find(([prefix]) => key.includes(prefix));
    if (limit && now - entry.windowStart > limit[1].windowMs) {
      store.delete(key);
    }
  });
}, 5 * 60_000);

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
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > limit.windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= limit.max) return false;

  entry.count++;
  return true;
}

export function middleware(request: NextRequest) {
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

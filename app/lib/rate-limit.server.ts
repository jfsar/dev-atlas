export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  now?: () => number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Minimal fixed-window in-memory rate limiter. Good enough to throttle admin
 * login attempts on a single Node instance without extra infrastructure.
 */
export function createRateLimiter({
  limit,
  windowMs,
  now = Date.now,
}: RateLimiterOptions) {
  const buckets = new Map<string, Bucket>();

  return function consume(key: string): RateLimitResult {
    const current = now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= current) {
      buckets.set(key, { count: 1, resetAt: current + windowMs });
      return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
    }

    if (bucket.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: Math.max(0, bucket.resetAt - current),
      };
    }

    bucket.count += 1;
    return {
      allowed: true,
      remaining: limit - bucket.count,
      retryAfterMs: 0,
    };
  };
}

/** Best-effort client IP extraction from common proxy headers. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Shared limiter for the admin login route. */
export const loginRateLimiter = createRateLimiter({
  limit: 10,
  windowMs: 5 * 60 * 1000,
});

/** Shared limiter for the public search route. */
export const searchRateLimiter = createRateLimiter({
  limit: 60,
  windowMs: 60 * 1000,
});

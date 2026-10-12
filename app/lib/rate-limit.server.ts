export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  now?: () => number;
  /** Hard cap on tracked keys; oldest entries are evicted past this limit. */
  maxKeys?: number;
}

export interface RateLimiter {
  (key: string): RateLimitResult;
  /** Number of keys currently tracked (exposed for tests/observability). */
  readonly size: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Minimal fixed-window in-memory rate limiter. Good enough to throttle admin
 * login attempts on a single Node instance without extra infrastructure.
 *
 * Expired buckets are swept periodically and the map is capped by `maxKeys`, so
 * the limiter cannot grow without bound under high-cardinality public traffic.
 */
export function createRateLimiter({
  limit,
  windowMs,
  now = Date.now,
  maxKeys = 10_000,
}: RateLimiterOptions): RateLimiter {
  const buckets = new Map<string, Bucket>();
  let lastSweep = now();

  function sweep(current: number): void {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= current) buckets.delete(key);
    }
    lastSweep = current;
  }

  function evictOldest(): void {
    const overflow = buckets.size - maxKeys + 1;
    let removed = 0;
    for (const key of buckets.keys()) {
      buckets.delete(key);
      if (++removed >= overflow) break;
    }
  }

  const consume = (key: string): RateLimitResult => {
    const current = now();
    if (current - lastSweep >= windowMs) sweep(current);

    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= current) {
      if (buckets.size >= maxKeys) {
        sweep(current);
        if (buckets.size >= maxKeys) evictOldest();
      }
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

  Object.defineProperty(consume, "size", { get: () => buckets.size });
  return consume as RateLimiter;
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

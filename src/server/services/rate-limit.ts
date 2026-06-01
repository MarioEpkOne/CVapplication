export interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export const DEFAULT_RATE_LIMIT: RateLimitConfig = { windowMs: 10 * 60_000, max: 5 };

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs?: number;
}

export interface RateLimiter {
  check(ip: string, now?: number): RateLimitResult;
}

/**
 * Creates an in-memory per-IP sliding-window rate limiter.
 *
 * Note: In-memory state resets on machine restart. This is acceptable for this
 * scale — the app runs on a single Fly machine (D24). If horizontal scaling is
 * added later, this should be replaced with a distributed store (Redis etc.).
 */
export function createRateLimiter(config: RateLimitConfig = DEFAULT_RATE_LIMIT): RateLimiter {
  const store = new Map<string, number[]>();

  return {
    check(ip: string, now: number = Date.now()): RateLimitResult {
      const windowStart = now - config.windowMs;

      // Get existing timestamps for this IP, pruning expired ones
      const existing = (store.get(ip) ?? []).filter((ts) => ts > windowStart);

      if (existing.length < config.max) {
        // Allow: record this timestamp
        existing.push(now);
        store.set(ip, existing);
        return { allowed: true };
      }

      // Reject: calculate when the earliest request expires
      const earliest = existing[0]!;
      const retryAfterMs = earliest + config.windowMs - now;
      return { allowed: false, retryAfterMs };
    },
  };
}

/**
 * Config + module-level singleton for the analytics endpoint.
 *
 * Generous limit (30 pageviews/min/IP): the client already dedupes per-path per
 * session, so real navigation is never throttled, while abuse is capped at
 * ~43k rows/day/IP instead of unbounded (disk-fill DoS protection). Separate
 * instance so its state never shares the strict contact bucket.
 */
export const ANALYTICS_RATE_LIMIT: RateLimitConfig = { windowMs: 60_000, max: 30 };
export const analyticsRateLimiter = createRateLimiter(ANALYTICS_RATE_LIMIT);

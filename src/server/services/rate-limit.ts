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
 * Module-level singleton for the contact endpoint.
 * Resets on server restart (known limitation — documented above).
 */
export const contactRateLimiter = createRateLimiter();

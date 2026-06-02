// Standalone in-handler per-IP rate limiter for the Ask-the-Agent Lambda.
// Intentionally NOT shared with src/server/services/rate-limit.ts: the infra
// workspace is decoupled from the Next.js app (separate tsconfig/vitest/package).
//
// Best-effort only: the in-memory window resets on Lambda cold start, and each
// warm container has its own Map (no cross-instance coordination). This caps a
// single hot container's abuse rather than guaranteeing a global ceiling (D1/E8).

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const store = new Map<string, number[]>();

/**
 * Returns true if `ip` is under the limit (and records the hit); false if the
 * IP has already made MAX_REQUESTS within the last WINDOW_MS.
 * `now` is injectable for deterministic tests.
 */
export function checkRateLimit(ip: string, now: number = Date.now()): boolean {
  const windowStart = now - WINDOW_MS;
  const hits = (store.get(ip) ?? []).filter((t) => t > windowStart);
  if (hits.length >= MAX_REQUESTS) {
    store.set(ip, hits);
    return false;
  }
  hits.push(now);
  store.set(ip, hits);
  return true;
}

import { describe, it, expect } from "vitest";
import {
  createRateLimiter,
  ANALYTICS_RATE_LIMIT,
  analyticsRateLimiter,
} from "@/server/services/rate-limit";

describe("createRateLimiter", () => {
  it("allows up to max requests within the window", () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 3 });
    const now = 1_000_000; // fixed timestamp for determinism

    for (let i = 0; i < 3; i++) {
      const result = limiter.check("1.2.3.4", now);
      expect(result.allowed).toBe(true);
    }
  });

  it("rejects the N+1 request within the window", () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 3 });
    const now = 1_000_000;

    // Exhaust the limit
    for (let i = 0; i < 3; i++) {
      limiter.check("1.2.3.4", now);
    }

    // N+1 should be rejected
    const result = limiter.check("1.2.3.4", now);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("re-allows after the window resets", () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 3 });
    const now = 1_000_000;

    // Exhaust the limit
    for (let i = 0; i < 3; i++) {
      limiter.check("1.2.3.4", now);
    }

    // Advance time past the windowMs (1000ms)
    const later = now + 1001;
    const result = limiter.check("1.2.3.4", later);
    expect(result.allowed).toBe(true);
  });
});

describe("analyticsRateLimiter", () => {
  it("has the documented config (30/min)", () => {
    expect(ANALYTICS_RATE_LIMIT.windowMs).toBe(60_000);
    expect(ANALYTICS_RATE_LIMIT.max).toBe(30);
  });

  it("allows 30 requests then blocks the 31st within the window", () => {
    const ip = "analytics-test-1";
    const now = 2_000_000;
    for (let i = 0; i < 30; i++) {
      expect(analyticsRateLimiter.check(ip, now).allowed).toBe(true);
    }
    expect(analyticsRateLimiter.check(ip, now).allowed).toBe(false);
  });

  it("re-allows after the window slides", () => {
    const ip = "analytics-test-2";
    const now = 3_000_000;
    for (let i = 0; i < 30; i++) {
      analyticsRateLimiter.check(ip, now);
    }
    expect(analyticsRateLimiter.check(ip, now).allowed).toBe(false);
    // Advance past windowMs (60_000ms)
    expect(analyticsRateLimiter.check(ip, now + 60_001).allowed).toBe(true);
  });
});

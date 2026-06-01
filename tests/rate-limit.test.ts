import { describe, it, expect } from "vitest";
import { createRateLimiter } from "@/server/services/rate-limit";

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

import { describe, it, expect } from "vitest";
import { checkRateLimit } from "../src/rate-limit";

describe("checkRateLimit", () => {
  it("allows the first 10 requests for an IP, then rejects the 11th", () => {
    const ip = "1.1.1.1";
    const now = 1_000_000;
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(ip, now)).toBe(true);
    }
    expect(checkRateLimit(ip, now)).toBe(false);
  });

  it("tracks different IPs independently", () => {
    const now = 2_000_000;
    const a = "2.2.2.2";
    const b = "3.3.3.3";
    for (let i = 0; i < 10; i++) expect(checkRateLimit(a, now)).toBe(true);
    expect(checkRateLimit(a, now)).toBe(false);
    // b has its own bucket and is unaffected by a being saturated.
    expect(checkRateLimit(b, now)).toBe(true);
  });

  it("prunes hits older than the 60s window", () => {
    const ip = "4.4.4.4";
    const t0 = 3_000_000;
    for (let i = 0; i < 10; i++) expect(checkRateLimit(ip, t0)).toBe(true);
    expect(checkRateLimit(ip, t0)).toBe(false);
    // 60_001ms later all earlier hits are outside the window → allowed again.
    expect(checkRateLimit(ip, t0 + 60_001)).toBe(true);
  });

  it("shares one bucket for the 'unknown' fallback IP", () => {
    const now = 4_000_000;
    for (let i = 0; i < 10; i++) expect(checkRateLimit("unknown", now)).toBe(true);
    expect(checkRateLimit("unknown", now)).toBe(false);
  });
});

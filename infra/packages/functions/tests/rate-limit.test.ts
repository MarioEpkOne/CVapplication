import { describe, it, expect, vi } from "vitest";
import { checkRateLimit } from "../src/rate-limit";
import { DynamoRateLimitStore, type DocClientLike } from "../src/rate-limit-store";

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

describe("DynamoRateLimitStore", () => {
  // Fake doc client that simulates an atomic ADD counter keyed by sessionId.
  function makeCountingClient() {
    const counts = new Map<string, number>();
    const sends: Array<{ input: Record<string, unknown> }> = [];
    const client: DocClientLike = {
      send: vi.fn(async (cmd: unknown) => {
        const input = (cmd as { input: Record<string, unknown> }).input;
        sends.push({ input });
        const key = (input.Key as { sessionId: string }).sessionId;
        const next = (counts.get(key) ?? 0) + 1;
        counts.set(key, next);
        return { Attributes: { count: next } };
      }),
    };
    return { client, sends };
  }

  it("allows the first 10 hits in a window and rejects the 11th", async () => {
    const { client } = makeCountingClient();
    const store = new DynamoRateLimitStore(client, "T");
    const now = 1_000_000;
    for (let i = 0; i < 10; i++) {
      expect(await store.check("hashA", now)).toBe(true);
    }
    expect(await store.check("hashA", now)).toBe(false);
  });

  it("tracks different ipHash values in independent buckets", async () => {
    const { client } = makeCountingClient();
    const store = new DynamoRateLimitStore(client, "T");
    const now = 2_000_000;
    for (let i = 0; i < 10; i++) expect(await store.check("hashA", now)).toBe(true);
    expect(await store.check("hashA", now)).toBe(false);
    // A different ipHash is its own key and unaffected.
    expect(await store.check("hashB", now)).toBe(true);
  });

  it("resets to allowed in a new 60s window (new key)", async () => {
    const { client } = makeCountingClient();
    const store = new DynamoRateLimitStore(client, "T");
    const t0 = 3_000_000;
    for (let i = 0; i < 10; i++) expect(await store.check("hashA", t0)).toBe(true);
    expect(await store.check("hashA", t0)).toBe(false);
    // 60_001ms later → new windowId → new key → count restarts at 1.
    expect(await store.check("hashA", t0 + 60_001)).toBe(true);
  });

  it("uses an atomic ADD update with an expiresAt TTL and rl#-prefixed key", async () => {
    const { client, sends } = makeCountingClient();
    const store = new DynamoRateLimitStore(client, "T");
    const now = 4_000_000;
    await store.check("hashA", now);
    const input = sends[0].input;
    const key = (input.Key as { sessionId: string }).sessionId;
    expect(key.startsWith("rl#hashA#")).toBe(true);
    expect(input.UpdateExpression).toContain("ADD");
    expect((input.ExpressionAttributeValues as { ":exp": number })[":exp"]).toBe(
      Math.floor(now / 1000) + 120,
    );
    expect((input.ExpressionAttributeValues as { ":exp": number })[":exp"]).toBeGreaterThan(
      Math.floor(now / 1000),
    );
  });
});

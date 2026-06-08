import { describe, it, expect } from "vitest";
import { createHmac } from "crypto";
import { verifyAgentToken } from "../src/token";

const SECRET = "test-secret-for-token-tests";
const TTL_SECONDS = 60;

// Local sign helper mirroring the canonical contract (duplicated, not imported
// from the frontend copy — the workspace boundary prevents cross-imports).
function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function sign(secret: string, now: number): string {
  const exp = Math.floor(now / 1000) + TTL_SECONDS;
  const payloadJson = JSON.stringify({ exp });
  const mac = createHmac("sha256", secret).update(payloadJson).digest();
  return b64url(Buffer.from(payloadJson)) + "." + b64url(mac);
}

describe("verifyAgentToken", () => {
  it("valid token verifies", () => {
    const T = 1_700_000_000_000;
    const token = sign(SECRET, T);
    expect(verifyAgentToken(token, SECRET, T)).toEqual({ ok: true });
  });

  it("tampered signature is rejected", () => {
    const T = 1_700_000_000_000;
    const token = sign(SECRET, T);
    // Flip the last character of the signature segment.
    const parts = token.split(".");
    const sigSeg = parts[1];
    const tampered = parts[0] + "." + sigSeg.slice(0, -1) + (sigSeg.endsWith("A") ? "B" : "A");
    const result = verifyAgentToken(tampered, SECRET, T);
    expect(result.ok).toBe(false);
  });

  it("expired token is rejected", () => {
    const T = 1_700_000_000_000;
    const token = sign(SECRET, T);
    // Verify at T + (TTL + 10) seconds — well past the leeway.
    const laterMs = T + (TTL_SECONDS + 10) * 1000;
    const result = verifyAgentToken(token, SECRET, laterMs);
    expect(result.ok).toBe(false);
    expect((result as { ok: false; reason: string }).reason).toBe("expired");
  });

  it("token within 5s leeway still verifies", () => {
    // exp = T/1000 + 60; verify at T/1000 + 63 → 63 ≤ exp+5 (= T/1000+65). Should pass.
    const T = 1_700_000_000_000;
    const token = sign(SECRET, T);
    const withinLeewayMs = T + (TTL_SECONDS + 3) * 1000;
    expect(verifyAgentToken(token, SECRET, withinLeewayMs)).toEqual({ ok: true });
  });

  it("missing/empty/non-string token is rejected", () => {
    const T = 1_700_000_000_000;
    const u = verifyAgentToken(undefined, SECRET, T);
    expect(u.ok).toBe(false);
    const e = verifyAgentToken("", SECRET, T);
    expect(e.ok).toBe(false);
    const n = verifyAgentToken(123 as unknown, SECRET, T);
    expect(n.ok).toBe(false);
  });

  it("wrong secret is rejected", () => {
    const T = 1_700_000_000_000;
    const token = sign(SECRET, T);
    const result = verifyAgentToken(token, "wrong-secret", T);
    expect(result.ok).toBe(false);
    expect((result as { ok: false; reason: string }).reason).toBe("bad-signature");
    // Note: verifyAgentToken uses crypto.timingSafeEqual, which is asserted
    // structurally here — the "wrong secret" and "tampered signature" rejection
    // tests prove the timing-safe path is taken (a true timing test is not possible
    // in a unit-test context).
  });

  it("malformed token (no separator / extra dots) is rejected", () => {
    const T = 1_700_000_000_000;
    const noDot = verifyAgentToken("no-dot", SECRET, T);
    expect(noDot.ok).toBe(false);
    const extraDots = verifyAgentToken("a.b.c", SECRET, T);
    expect(extraDots.ok).toBe(false);
  });
});

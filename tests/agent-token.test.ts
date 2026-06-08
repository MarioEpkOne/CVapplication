import { describe, it, expect } from "vitest";
import { createHmac } from "crypto";
import { signAgentToken, verifyAgentToken } from "@/lib/agent-token";

const SECRET = "drift-guard-secret";
const NOW = 1_700_000_000_000;

describe("agent-token cross-boundary drift guard", () => {
  it("signAgentToken round-trips through verifyAgentToken", () => {
    const token = signAgentToken(SECRET, NOW);
    expect(verifyAgentToken(token, SECRET, NOW)).toEqual({ ok: true });
  });

  it("a one-char mutation fails verification", () => {
    const token = signAgentToken(SECRET, NOW);
    // Flip the last character of the token.
    const mutated = token.slice(0, -1) + (token.endsWith("A") ? "B" : "A");
    const result = verifyAgentToken(mutated, SECRET, NOW);
    expect(result.ok).toBe(false);
  });

  it("token verifies against an independent Node-crypto recomputation", () => {
    const token = signAgentToken(SECRET, NOW);
    const dotIdx = token.indexOf(".");
    const payloadSeg = token.slice(0, dotIdx);
    const sigSeg = token.slice(dotIdx + 1);

    // Decode the payload segment to get the original JSON string.
    const b64urlToBase64 = (s: string) => {
      const b = s.replace(/-/g, "+").replace(/_/g, "/");
      return b + "=".repeat((4 - (b.length % 4)) % 4);
    };
    const payloadJson = Buffer.from(b64urlToBase64(payloadSeg), "base64").toString("utf-8");

    // Independently recompute the HMAC and base64url-encode it.
    const macBuf = createHmac("sha256", SECRET).update(payloadJson).digest();
    const expectedSig = macBuf
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // If these are equal, an independent verifier (the Lambda) will accept the token.
    expect(sigSeg).toBe(expectedSig);
  });

  it("token format is payload '.' signature, both non-empty base64url", () => {
    const token = signAgentToken(SECRET, NOW);
    const parts = token.split(".");
    expect(parts).toHaveLength(2);
    const [payloadSeg, sigSeg] = parts;
    expect(payloadSeg.length).toBeGreaterThan(0);
    expect(sigSeg.length).toBeGreaterThan(0);
    // Base64url: only A-Z, a-z, 0-9, -, _ (no padding =, no +, no /).
    expect(payloadSeg).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(sigSeg).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

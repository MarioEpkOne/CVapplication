import { createHmac, timingSafeEqual } from "crypto";

// TTL_SECONDS is the issuer's TTL; the verifier only checks the exp claim.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TTL_SECONDS = 60;
const LEEWAY_SECONDS = 5;

// Decodes a base64url string back to a Buffer.
function b64urlDecode(s: string): Buffer {
  const base64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return Buffer.from(padded, "base64");
}

/**
 * Verifies an agent request token (Lambda-side copy; mirrors src/lib/agent-token.ts).
 * Returns { ok: true } on success or { ok: false, reason } on failure.
 * Reason strings: "not-a-string" | "malformed" | "bad-signature" | "bad-payload" | "expired"
 */
export function verifyAgentToken(
  token: unknown,
  secret: string,
  now: number = Date.now(),
): { ok: true } | { ok: false; reason: string } {
  if (typeof token !== "string" || token.length === 0) {
    return { ok: false, reason: "not-a-string" };
  }

  const dotIdx = token.indexOf(".");
  const lastDot = token.lastIndexOf(".");
  if (dotIdx === -1 || dotIdx !== lastDot) {
    // Must have exactly one "." separator.
    return { ok: false, reason: "malformed" };
  }

  const payloadSeg = token.slice(0, dotIdx);
  const sigSeg = token.slice(dotIdx + 1);
  if (!payloadSeg || !sigSeg) {
    return { ok: false, reason: "malformed" };
  }

  // Decode the payload to get the original JSON string.
  let payloadJson: string;
  try {
    payloadJson = b64urlDecode(payloadSeg).toString("utf-8");
  } catch {
    return { ok: false, reason: "bad-payload" };
  }

  // Recompute the HMAC over the payload JSON.
  const mac = createHmac("sha256", secret).update(payloadJson).digest();

  // Decode the provided signature.
  let sigBuf: Buffer;
  try {
    sigBuf = b64urlDecode(sigSeg);
  } catch {
    return { ok: false, reason: "bad-signature" };
  }

  // Guard against unequal buffer lengths before calling timingSafeEqual (it throws on mismatch).
  if (sigBuf.byteLength !== mac.byteLength) {
    return { ok: false, reason: "bad-signature" };
  }

  if (!timingSafeEqual(sigBuf, mac)) {
    return { ok: false, reason: "bad-signature" };
  }

  // Parse the payload JSON.
  let payload: unknown;
  try {
    payload = JSON.parse(payloadJson);
  } catch {
    return { ok: false, reason: "bad-payload" };
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("exp" in payload) ||
    !Number.isInteger((payload as { exp: unknown }).exp)
  ) {
    return { ok: false, reason: "bad-payload" };
  }

  const exp = (payload as { exp: number }).exp;
  if (now / 1000 > exp + LEEWAY_SECONDS) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true };
}

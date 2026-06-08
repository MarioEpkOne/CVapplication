import { createHash } from "node:crypto";

// D4: stable, non-reversible key/label for an IP. No salt needed — we are not
// protecting against offline brute force of a 32-bit space here; this only
// avoids storing raw IPs at rest. (If stronger unlinkability is wanted later,
// add a server-side secret salt from env.)
export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

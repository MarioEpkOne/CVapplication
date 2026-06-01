export interface Context {
  ip: string;
  userAgent: string;
}

/**
 * Resolve the client IP from request headers.
 *
 * `Fly-Client-IP` is set by Fly's edge proxy and is NOT client-spoofable, so it
 * is preferred. We fall back to the leftmost `x-forwarded-for` hop (dev/local
 * only — in production the Fly header is always present, so the spoofable XFF
 * path is never reached), then to a `"unknown"` sentinel.
 */
export function resolveClientIp(headers: Headers): string {
  const fly = headers.get("fly-client-ip")?.trim();
  if (fly) return fly;

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return "unknown";
}

export function createContext({ req }: { req: Request }): Context {
  return {
    ip: resolveClientIp(req.headers),
    userAgent: req.headers.get("user-agent") ?? "",
  };
}

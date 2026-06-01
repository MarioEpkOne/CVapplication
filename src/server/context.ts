export interface Context {
  ip: string;
  userAgent: string;
}

export function createContext({ req }: { req: Request }): Context {
  // Extract client IP: prefer x-forwarded-for (first hop on Fly), fall back to sentinel
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0]!.trim() : "unknown";

  const userAgent = req.headers.get("user-agent") ?? "";

  return { ip, userAgent };
}

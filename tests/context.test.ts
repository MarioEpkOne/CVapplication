import { describe, it, expect } from "vitest";
import { resolveClientIp } from "@/server/context";

describe("resolveClientIp", () => {
  it("returns Fly-Client-IP when present", () => {
    const h = new Headers({ "fly-client-ip": "9.9.9.9" });
    expect(resolveClientIp(h)).toBe("9.9.9.9");
  });

  it("prefers Fly-Client-IP over a spoofed X-Forwarded-For", () => {
    const h = new Headers({
      "fly-client-ip": "9.9.9.9",
      "x-forwarded-for": "1.2.3.4, 9.9.9.9",
    });
    expect(resolveClientIp(h)).toBe("9.9.9.9");
  });

  it("falls back to XFF leftmost when Fly header is whitespace", () => {
    const h = new Headers({
      "fly-client-ip": "   ",
      "x-forwarded-for": "1.2.3.4, 5.6.7.8",
    });
    expect(resolveClientIp(h)).toBe("1.2.3.4");
  });

  it("uses trimmed XFF leftmost when Fly header is absent", () => {
    const h = new Headers({ "x-forwarded-for": "  1.2.3.4 , 5.6.7.8" });
    expect(resolveClientIp(h)).toBe("1.2.3.4");
  });

  it("returns 'unknown' when XFF leftmost token is empty", () => {
    const h = new Headers({ "x-forwarded-for": ", 1.2.3.4" });
    expect(resolveClientIp(h)).toBe("unknown");
  });

  it("returns 'unknown' when neither header is present", () => {
    const h = new Headers();
    expect(resolveClientIp(h)).toBe("unknown");
  });
});

import { describe, it, expect } from "vitest";
import { buildCsp } from "../src/lib/csp";

describe("buildCsp", () => {
  it("omits 'unsafe-eval' in production (isDev=false) — security invariant E1", () => {
    const csp = buildCsp(false);
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
  });

  it("includes 'unsafe-eval' in development (isDev=true) for Fast Refresh", () => {
    const csp = buildCsp(true);
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
  });

  it("keeps the other directives identical regardless of isDev", () => {
    for (const dev of [true, false]) {
      const csp = buildCsp(dev);
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("style-src 'self' 'unsafe-inline'");
      expect(csp).toContain("connect-src 'self' https://*.lambda-url.eu-central-1.on.aws");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("object-src 'none'");
    }
  });
});

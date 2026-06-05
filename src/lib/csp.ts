/**
 * Builds the Content-Security-Policy header value.
 *
 * In development (`isDev === true`) `'unsafe-eval'` is added to `script-src`
 * because React Fast Refresh evaluates code via `eval()`. Production
 * (`next build` / Fly, where NODE_ENV === "production") gets the strict policy
 * with NO `'unsafe-eval'` — a security invariant (spec E1).
 */
export function buildCsp(isDev: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.lambda-url.eu-central-1.on.aws",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

import { NAME_MAX, MESSAGE_MAX, COMPANY_MAX } from "../validation/contact";

/**
 * Sanitizes a text string for safe storage and display.
 *
 * Order of operations (documented here to clarify the length cap semantics):
 * 1. Trim surrounding whitespace.
 * 2. Hard-truncate to `maxLen` on the TRIMMED string (cap is measured pre-escape,
 *    so the length bound is meaningful in terms of user-visible characters).
 * 3. Strip control characters (U+0000–U+001F except \n and \t, plus DEL U+007F).
 * 4. Escape HTML-significant characters so stored/emailed content is safe to render
 *    — output contains no raw < or >.
 */
export function sanitizeText(input: string, maxLen: number): string {
  // 1. Trim
  let s = input.trim();

  // 2. Hard-truncate to maxLen (pre-escape, so cap is in user chars)
  s = s.slice(0, maxLen);

  // 3. Strip control characters except \n (\x0A) and \t (\x09), and DEL (\x7F)
  // eslint-disable-next-line no-control-regex
  s = s.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "");

  // 4. Escape HTML-significant characters
  s = s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

  return s;
}

/** Convenience wrapper for name fields. */
export function sanitizeName(input: string): string {
  return sanitizeText(input, NAME_MAX);
}

/** Convenience wrapper for message fields. */
export function sanitizeMessage(input: string): string {
  return sanitizeText(input, MESSAGE_MAX);
}

/** Convenience wrapper for company fields. */
export function sanitizeCompany(input: string): string {
  return sanitizeText(input, COMPANY_MAX);
}

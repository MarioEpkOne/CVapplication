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

/**
 * Like sanitizeText but does NOT HTML-escape — for plaintext email rendering.
 *
 * 1. Trim surrounding whitespace.
 * 2. Hard-truncate to `maxLen` on the trimmed string (cap measured pre-strip,
 *    matching sanitizeText semantics).
 * 3. Strip control characters. By default keeps `\n` (\x0A) and `\t` (\x09);
 *    with `singleLine: true`, strips ALL C0 controls incl. `\n`/`\t` (use for
 *    subject lines — a newline in a name would otherwise mangle the subject).
 *
 * Output is NOT HTML-escaped and must therefore never be rendered into HTML.
 * It is only used for plaintext email bodies/subjects.
 */
export function toPlainText(
  input: string,
  maxLen: number,
  opts: { singleLine?: boolean } = {},
): string {
  let s = input.trim().slice(0, maxLen);
  /* eslint-disable no-control-regex */
  const controlRe = opts.singleLine
    ? /[\x00-\x1F\x7F]/g // strip ALL C0 controls incl. \n \t
    : /[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g; // keep \n \t
  /* eslint-enable no-control-regex */
  s = s.replace(controlRe, "");
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

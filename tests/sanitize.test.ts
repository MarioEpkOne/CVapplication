import { describe, it, expect } from "vitest";
import {
  sanitizeText,
  sanitizeName,
  sanitizeMessage,
  toPlainText,
} from "@/server/services/sanitize";

describe("sanitizeText", () => {
  it("strips control characters", () => {
    // Include a null byte, a BEL (0x07), and a vertical tab (0x0B)
    const input = "hello\x00world\x07\x0Btest";
    const result = sanitizeText(input, 1000);
    // Control chars should be stripped; \n and \t are allowed
    expect(result).not.toContain("\x00");
    expect(result).not.toContain("\x07");
    expect(result).not.toContain("\x0B");
    expect(result).toContain("hello");
    expect(result).toContain("world");
    expect(result).toContain("test");
  });

  it("escapes HTML-significant characters", () => {
    const input = '<script>alert("xss")</script>';
    const result = sanitizeText(input, 1000);
    // Output must contain no raw < or >
    expect(result).not.toContain("<");
    expect(result).not.toContain(">");
    expect(result).toContain("&lt;");
    expect(result).toContain("&gt;");
    expect(result).toContain("&quot;");
  });

  it("trims surrounding whitespace", () => {
    const input = "   hello world   ";
    const result = sanitizeText(input, 1000);
    expect(result).toBe("hello world");
  });

  it("hard-truncates to the length cap", () => {
    // Testing the function directly with over-long input (no zod pre-trim)
    const result = sanitizeText("a".repeat(10), 5);
    // Length cap enforced — result must be <= 5 chars (measured pre-escape on plain 'a')
    expect(result.length).toBeLessThanOrEqual(5);
  });
});

describe("sanitizeName / sanitizeMessage convenience wrappers", () => {
  it("sanitizeName calls sanitizeText with NAME_MAX", () => {
    const result = sanitizeName("  Alice  ");
    expect(result).toBe("Alice");
  });

  it("sanitizeMessage calls sanitizeText with MESSAGE_MAX", () => {
    const result = sanitizeMessage("  Hello world  ");
    expect(result).toBe("Hello world");
  });
});

describe("toPlainText", () => {
  it("does NOT HTML-escape special characters", () => {
    const input = `Mario's <b>"AT&T"</b> & co > x`;
    const result = toPlainText(input, 1000);
    expect(result).toContain("'");
    expect(result).toContain("&");
    expect(result).toContain("<");
    expect(result).toContain(">");
    expect(result).toContain('"');
    expect(result).not.toContain("&#x27;");
    expect(result).not.toContain("&amp;");
    expect(result).not.toContain("&lt;");
  });

  it("strips C0 control chars but preserves \\n and \\t by default", () => {
    const input = "line1\nline2\tend\x00\x07";
    const result = toPlainText(input, 1000);
    expect(result).toContain("\n");
    expect(result).toContain("\t");
    expect(result).not.toContain("\x00");
    expect(result).not.toContain("\x07");
  });

  it("strips \\n and \\t when singleLine is true", () => {
    const input = "name\nwith\ttabs";
    const result = toPlainText(input, 1000, { singleLine: true });
    expect(result).not.toContain("\n");
    expect(result).not.toContain("\t");
    expect(result).toBe("namewithtabs");
  });

  it("trims and truncates to maxLen", () => {
    const result = toPlainText("   " + "a".repeat(10) + "   ", 5);
    expect(result).toBe("aaaaa");
    expect(result.length).toBeLessThanOrEqual(5);
  });
});

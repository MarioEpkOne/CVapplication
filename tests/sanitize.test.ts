import { describe, it, expect } from "vitest";
import { sanitizeText, sanitizeName, sanitizeMessage } from "@/server/services/sanitize";

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

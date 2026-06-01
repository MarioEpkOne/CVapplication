import { describe, it, expect } from "vitest";
import { contactInputSchema, NAME_MAX, MESSAGE_MAX } from "@/server/validation/contact";

describe("contactInputSchema", () => {
  it("accepts a valid payload", () => {
    const result = contactInputSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      message: "Hello! I'd like to chat about opportunities.",
      company: "Acme Corp",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = contactInputSchema.safeParse({
      name: "Jane Doe",
      email: "not-an-email",
      message: "Some message",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailError = result.error.issues.find((i) => i.path.includes("email"));
      expect(emailError).toBeDefined();
    }
  });

  it("rejects empty name", () => {
    const result = contactInputSchema.safeParse({
      name: "   ", // whitespace trims to empty
      email: "jane@example.com",
      message: "Some message",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path.includes("name"));
      expect(nameError).toBeDefined();
    }
  });

  it("rejects empty message", () => {
    const result = contactInputSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      message: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msgError = result.error.issues.find((i) => i.path.includes("message"));
      expect(msgError).toBeDefined();
    }
  });

  it("rejects an over-long name (> NAME_MAX)", () => {
    // Assert against the spec's literal cap imported from the module
    expect(NAME_MAX).toBe(120);
    const result = contactInputSchema.safeParse({
      name: "a".repeat(NAME_MAX + 1),
      email: "jane@example.com",
      message: "Some message",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path.includes("name"));
      expect(nameError).toBeDefined();
    }
  });

  it("rejects an over-long message (> MESSAGE_MAX)", () => {
    // Assert against the spec's literal cap imported from the module
    expect(MESSAGE_MAX).toBe(5000);
    const result = contactInputSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      message: "a".repeat(MESSAGE_MAX + 1),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msgError = result.error.issues.find((i) => i.path.includes("message"));
      expect(msgError).toBeDefined();
    }
  });
});

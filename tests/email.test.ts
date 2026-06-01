import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { sendContactNotification } from "@/server/services/email";

describe("sendContactNotification", () => {
  const original = process.env.RESEND_API_KEY;

  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
  });

  afterEach(() => {
    if (original === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = original;
    }
  });

  it("returns { sent: false, reason: 'no-api-key' } and does not throw when key is unset", async () => {
    await expect(
      sendContactNotification({
        name: "Mario's & Co <test>",
        email: "mario@example.com",
        message: "Hello\nworld",
        company: "AT&T",
      }),
    ).resolves.toEqual({ sent: false, reason: "no-api-key" });
  });
});

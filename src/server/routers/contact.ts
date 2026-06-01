import { router, publicProcedure } from "../trpc";
import { contactInputSchema } from "../validation/contact";
import { sanitizeName, sanitizeMessage, sanitizeText } from "../services/sanitize";
import { contactRateLimiter } from "../services/rate-limit";
import { sendContactNotification } from "../services/email";
import { db, schema } from "../db";
import { TRPCError } from "@trpc/server";

export const contactRouter = router({
  submit: publicProcedure
    .input(contactInputSchema)
    .mutation(async ({ input, ctx }) => {
      // 1. Honeypot: if filled, SILENTLY succeed — no store, no email, no hint.
      if (input.honeypot && input.honeypot.length > 0) {
        return { ok: true as const };
      }

      // 2. Rate limit per IP — reject BEFORE any DB/email work.
      const rl = contactRateLimiter.check(ctx.ip);
      if (!rl.allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Please try again shortly.",
        });
      }

      // 3. Sanitize.
      const name = sanitizeName(input.name);
      const message = sanitizeMessage(input.message);
      const company = input.company ? sanitizeText(input.company, 200) : undefined;
      const email = input.email; // zod-validated; stored as-is (no HTML context)

      // 4. DB insert FIRST (must persist even if email later fails).
      try {
        await db.insert(schema.contactMessages).values({
          name,
          email,
          message,
          company,
          ip: ctx.ip,
          userAgent: ctx.userAgent,
          createdAt: new Date(),
        });
      } catch (e) {
        console.error("[contact] DB insert failed", e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Couldn't send right now.",
        });
      }

      // 5. Email (failure-tolerant; never throws).
      const res = await sendContactNotification({ name, email, message, company });
      if (!res.sent) console.warn("[contact] email not sent:", res.reason);

      return { ok: true as const };
    }),
});

import { z } from "zod";

export const NAME_MAX = 120;
export const MESSAGE_MAX = 5000;
export const COMPANY_MAX = 200;

export const contactInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(NAME_MAX, "Name is too long"),
  email: z.string().trim().email("Enter a valid email").max(254),
  message: z.string().trim().min(1, "Message is required").max(MESSAGE_MAX, "Message is too long"),
  company: z.string().trim().max(COMPANY_MAX).optional(),
  // honeypot: must be EMPTY for a human. Bots fill it.
  // The schema is LENIENT — a filled honeypot is NOT a zod failure.
  // Bot detection happens in the router which silently returns { ok: true }.
  // Never make a filled honeypot a schema error — that would reveal the trap.
  honeypot: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactInputSchema>;

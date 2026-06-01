import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { db, schema } from "../db";
import { analyticsRateLimiter } from "../services/rate-limit";
import { sanitizeText } from "../services/sanitize";

export const analyticsRouter = router({
  track: publicProcedure
    .input(
      z.object({
        path: z.string().max(2048),
        referrer: z.string().max(2048).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Throttle per IP — silently drop over-limit so analytics NEVER surfaces
      // an error to the visitor or signals a bot that it was throttled.
      if (!analyticsRateLimiter.check(ctx.ip).allowed) {
        return { ok: true as const };
      }
      try {
        await db.insert(schema.pageviews).values({
          path: sanitizeText(input.path, 2048),
          referrer: input.referrer ? sanitizeText(input.referrer, 2048) : undefined,
          createdAt: new Date(),
        });
      } catch (e) {
        // Edge Case: analytics failure must NEVER surface to the visitor or block render
        console.error("[analytics] track failed (ignored)", e);
      }
      return { ok: true as const };
    }),
});

import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { db, schema } from "../db";

export const analyticsRouter = router({
  track: publicProcedure
    .input(
      z.object({
        path: z.string().max(2048),
        referrer: z.string().max(2048).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await db.insert(schema.pageviews).values({
          path: input.path,
          referrer: input.referrer,
          createdAt: new Date(),
        });
      } catch (e) {
        // Edge Case: analytics failure must NEVER surface to the visitor or block render
        console.error("[analytics] track failed (ignored)", e);
      }
      return { ok: true as const };
    }),
});

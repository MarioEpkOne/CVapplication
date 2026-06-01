import { router } from "./trpc";
import { contactRouter } from "./routers/contact";
import { analyticsRouter } from "./routers/analytics";

export const appRouter = router({
  contact: contactRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;

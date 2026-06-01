import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const pageviews = sqliteTable("pageviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  path: text("path").notNull(),
  referrer: text("referrer"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

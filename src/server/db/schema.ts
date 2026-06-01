import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const contactMessages = sqliteTable("contact_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  company: text("company"),
  ip: text("ip"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const pageviews = sqliteTable("pageviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  path: text("path").notNull(),
  referrer: text("referrer"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

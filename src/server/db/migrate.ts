import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const dbPath = process.env.DATABASE_PATH ?? "./data/app.db";
mkdirSync(dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
const db = drizzle(sqlite);

try {
  migrate(db, { migrationsFolder: "./drizzle" });
  console.log("[migrate] Migrations applied successfully.");
  sqlite.close();
} catch (err) {
  console.error("[migrate] Migration failed:", err);
  sqlite.close();
  process.exit(1);
}

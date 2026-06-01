// scripts/migrate.mjs — Standalone migration runner (no tsx dependency required).
// Called by scripts/start.sh before `node server.js` starts.
// Uses drizzle-orm/better-sqlite3/migrator directly; no compilation step needed.

import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH ?? "./data/app.db";

console.log(`[migrate] Applying migrations to: ${dbPath}`);

mkdirSync(dirname(resolve(dbPath)), { recursive: true });

let sqlite;
try {
  sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  const db = drizzle(sqlite);

  // Migrations folder is relative to the project root — in standalone output,
  // the drizzle/ folder is copied alongside server.js
  const migrationsFolder = resolve(__dirname, "..", "drizzle");
  migrate(db, { migrationsFolder });

  console.log("[migrate] Migrations applied successfully.");
  sqlite.close();
} catch (err) {
  console.error("[migrate] Migration failed — server will not start:", err);
  if (sqlite) sqlite.close();
  process.exit(1);
}

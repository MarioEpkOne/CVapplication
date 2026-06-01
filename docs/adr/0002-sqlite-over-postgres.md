# ADR 0002 — SQLite over Postgres

**Status**: Accepted  
**Date**: 2026-06-01

---

## Context

The app needs persistent storage for two purposes:
1. Contact form submissions (`contact_messages`)
2. Pageview analytics (`pageviews`)

The natural default for a production web app would be Postgres — it's what Purple uses, it's what most teams reach for, and Fly.io supports managed Postgres.

---

## Decision

Use **SQLite on a Fly volume** (at `/data/app.db`), not Postgres.

---

## Rationale

### The dataset is tiny and write-mostly-singleton

Contact messages from a handful of hiring managers, and pageviews from a personal portfolio site. This is a dataset that will never exceed a few thousand rows. SQLite handles millions of rows with trivial performance for this access pattern.

### Single-machine deployment removes the main SQLite objection

SQLite's primary limitation is that it doesn't support multiple concurrent writers across machines. Since the app runs on a single Fly machine (the deployment strategy chosen to minimize cost and complexity — see ADR 0001), this is not a concern. The Fly volume is attached to exactly one machine.

### Operational simplicity

Postgres requires a separate managed service (Fly Postgres cluster, or Neon, or Supabase). That means connection strings, additional costs, network round-trips, and one more system to configure. SQLite is just a file — zero operational surface area for this scale.

### Drizzle makes the future migration trivial

Drizzle ORM supports both SQLite and Postgres with near-identical schema syntax. If the future game spec (Agent Orchestrator) needs multi-machine horizontal scaling, migrating from SQLite to Postgres is a matter of:
1. Changing the Drizzle adapter (`drizzle-orm/better-sqlite3` → `drizzle-orm/node-postgres`)
2. Updating the connection string
3. Running `drizzle-kit generate` for the new dialect

This is documented here so a future implementer knows the migration path.

### The "I shipped stateful infra" story is still true

Using SQLite doesn't diminish the architecture story — the DB is still on a persistent volume, migrations run on deploy, and the schema is version-controlled. The decision is documented honestly (this ADR).

---

## Consequences

- **Positive**: zero additional infra to configure, zero cost, no network latency for queries.
- **Positive**: `npm run db:generate` → `drizzle/0000_*.sql` → applied on container start. Simple, reliable, auditable.
- **Positive**: backup = `flyctl ssh sftp get /data/app.db`. Dead simple.
- **Negative**: not horizontally scalable. Acceptable for this workload; documented here.
- **Negative**: SQLite's WAL mode is used (`PRAGMA journal_mode = WAL`) for concurrent reads — the app sets this on every connection open.
- **Future**: If the leaderboard / game spec needs multi-machine writes, migrate to Postgres then.

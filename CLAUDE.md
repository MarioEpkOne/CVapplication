# CLAUDE.md — Agent context for the interactive-resume-cover app

This file is a **first-class deliverable** — rich context for Claude Code (and any capable agent) to understand the codebase quickly, make correct changes, and avoid known pitfalls.

---

## What this app is

An interactive resume + cover letter built as a work sample for a Purple LAB job application. Three URL-routed tabs: **Resume** (`/`), **Cover Letter** (`/cover-letter`), **Play** (`/play` — placeholder for a future Agent Orchestrator mini-game).

The medium is the message: a deliberately over-engineered Next.js app on Fly.io, with tRPC, Drizzle/SQLite, Framer Motion, and agent-context artifacts as first-class deliverables — mirroring Purple's stack on purpose.

---

## Commands

```bash
npm run dev          # Start dev server (Next.js / Turbopack)
npm run build        # Production build → .next/standalone
npm run lint         # ESLint (src/ only; no next lint — removed in Next 16)
npm run typecheck    # tsc --noEmit
npm run test         # vitest run
npm run db:generate  # drizzle-kit generate → drizzle/ SQL migration
npm run db:migrate   # Apply migrations to local ./data/app.db (dev only)
```

Deploy: push to `main` → GitHub Actions → `flyctl deploy --remote-only` (needs `FLY_API_TOKEN` secret).

### Quality Gate Hooks (Claude Code)

Claude Code hooks enforce code quality automatically via `.claude/settings.json`:

- **PostToolUse** (`format-file.sh`): Auto-formats `.ts`/`.tsx` files with ESLint --fix + Prettier after every Write/Edit/MultiEdit. Best-effort (never blocks edits).
- **Stop** (`verify.sh`): Blocks task completion until typecheck + lint + circular-dep checks all pass. Stops on first failure.

Additional command:
```bash
npm run deps:check   # madge circular dependency check over src/
```

---

## Architecture

```
Next.js (App Router, TS) on Fly.io (single machine, region fra)
├── App routes (RSC + client components)
│   ├── /              → Resume (default tab)
│   ├── /cover-letter  → Cover Letter (scrollytelling)
│   └── /play          → "Coming soon" placeholder
├── tRPC router (at /api/trpc/[trpc])
│   └── analytics.track (mutation) → pageview insert (fire-and-forget)
├── Drizzle ORM → SQLite at DATABASE_PATH (default: /data/app.db on Fly volume)
└── Print CSS for PDF, OG image via next/og, dark-mode via next-themes
```

### Key files

| File | Purpose |
|------|---------|
| `src/data/resume.ts` | **Single source of truth** for all resume content. Exports `resumeCs`, `resumeEn`, and `resumes` map. |
| `src/data/cover-letter.ts` | **Single source of truth** for all cover letter sections. Exports `letterSectionsCz`, `letterSectionsEn`, and `letterSections` map. |
| `src/lib/locale.tsx` | React context for CZ/EN locale switching with localStorage persistence. |
| `src/lib/labels.ts` | All UI chrome strings (section headings, tab labels, etc.) mapped by locale. |
| `src/components/LocaleToggle.tsx` | CZ/EN toggle button, placed next to ThemeToggle. Has `.no-print`. |
| `src/server/services/rate-limit.ts` | In-memory per-IP rate limiter; singleton exported as `analyticsRateLimiter`. |
| `src/server/services/sanitize.ts` | Pure sanitization functions — strip control chars + escape HTML. |
| `src/server/db/schema.ts` | One table: `pageviews`. No leaderboard. |
| `src/app/globals.css` | Tailwind v4 CSS-first config — all brand tokens live here in `@theme`. |
| `scripts/migrate.mjs` | Standalone ESM migration runner (no tsx needed at runtime). |

---

## Conventions

### Data-file-is-source-of-truth rule (hard constraint)
- Resume content renders **only** from `src/data/resume.ts`. Zero hard-coded strings in JSX.
- Cover letter content renders **only** from `src/data/cover-letter.ts`. Zero hard-coded content in components.
- UI labels (section headings, tab labels) are sourced from `src/lib/labels.ts`.
- Violating this makes print/PDF and data-integrity tests unreliable.

### Tailwind v4 (CSS-first — no tailwind.config.js)
- DO NOT run `npx tailwindcss init` or create `tailwind.config.js`.
- All theme tokens are in `src/app/globals.css` inside `@theme { ... }`.
- Dark mode is `@custom-variant dark (&:where(.dark, .dark *));` — required for `next-themes attribute="class"`.
- PostCSS plugin: `@tailwindcss/postcss` in `postcss.config.mjs`.

### tRPC v11 (transformer on the link, not root config)
```ts
// CORRECT — v11
httpBatchLink({ url: "/api/trpc", transformer: superjson })
// WRONG — v10 style
trpc.createClient({ transformer: superjson }) // ← don't do this
```

### Print CSS
`.no-print` class hides: TabBar, ThemeToggle, LocaleToggle, PrintButton, AnalyticsPing, footer. Print CSS forces light colors regardless of dark mode. Do not remove `.no-print` from these components.

---

## How migrations run

1. **Dev time**: `npm run db:generate` creates `drizzle/NNNN_*.sql`. Commit this folder.
2. **Container start**: `scripts/start.sh` calls `node scripts/migrate.mjs` which applies all pending migrations from `drizzle/` to `$DATABASE_PATH`.
3. **Fresh volume**: migrations create the tables before the first request. If migration fails, the container exits non-zero (surface as crash, not white-screen).

DO NOT commit `./data/` (gitignored). Never call `db:migrate` in production — `start.sh` handles it.

---

## How secrets/env work

| Variable | Where set | Purpose |
|----------|-----------|---------|
| `DATABASE_PATH` | `fly.toml [env]` | SQLite file path on Fly volume |
| `NEXT_PUBLIC_SITE_URL` | `flyctl secrets set` | Canonical URL for OG metadata |
| `FLY_API_TOKEN` | GitHub Actions secret | Deploy authorization |

Reference `.env.example` for the full list. **Never commit real values.**

---

## Known limitations / gotchas

- **In-memory rate limiter** (`analyticsRateLimiter`) resets on machine restart. Acceptable for single-machine Fly deployment (D24). If horizontal scaling is added, replace with Redis or a DB-backed store.
- **In-memory locale context** resets to `"cs"` default on SSR; localStorage restores the user's choice on mount (handled in `LocaleProvider`'s `useEffect`).
- **`next lint` was removed in Next 16.** The lint script runs ESLint directly: `eslint src/ --max-warnings=0`.
- **`lucide-react@1.x` does not export `Github` or `Linkedin` icons** — use `GitBranch` and `Link2` instead.
- **`tsconfig.json` `jsx` is set to `react-jsx` by Next.js build** — this is correct; don't revert to `preserve`.
- **Docker build requires build tools** (python3, make, g++) for better-sqlite3 native compilation. The Dockerfile `deps` stage installs these.
- **`scripts/migrate.mjs` path resolution**: the `drizzle/` folder must be copied into the Docker image alongside `server.js`. The Dockerfile does this explicitly.
- **OG image uses Node runtime** (not edge) — compatible with `output: "standalone"` on Fly.
- **`PrintButton` is a separate client component** (`src/components/resume/PrintButton.tsx`) — cannot be an inline function with `"use client"` inside an RSC.

---

## ADRs

- `docs/adr/0001-fly-over-aws.md` — Why Fly.io, not AWS (and why the wink)
- `docs/adr/0002-sqlite-over-postgres.md` — Why SQLite on a Fly volume
- `docs/adr/0003-print-css-pdf.md` — Why print CSS + window.print() over react-pdf
- `docs/adr/0004-trpc-for-tiny-app.md` — Why tRPC (mirrors Purple's stack on purpose)

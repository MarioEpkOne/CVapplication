# AGENTS.md — Tool-agnostic agent context

> This file provides context for any AI coding agent working on this repo (Claude Code, Cursor, Copilot, etc.). For Claude Code-specific details, see `CLAUDE.md`.
>
> No `.cursor/rules` exists — Mario uses Claude Code, not Cursor. Faking Cursor config would be inauthentic; `AGENTS.md` gives the cross-tool "context as infrastructure" signal honestly.

---

## What this is

An interactive resume + cover letter built as a work sample for a job application. A Next.js (App Router) app with tRPC, Drizzle/SQLite, Tailwind v4, and Framer Motion. Deployed on Fly.io.

Read `CLAUDE.md` for the full architecture, commands, conventions, and gotchas.

---

## For any agent making changes

### Hard constraints
1. **No hard-coded content in JSX** — resume renders only from `src/data/resume.ts`; cover letter only from `src/data/cover-letter.ts`.
2. **No leaderboard table, no game logic** in this codebase — the Play tab is a live "Ask the Agent" feature backed by an AWS Lambda (see `infra/`), not a game. Do not add `leaderboard` to `schema.ts` or create game routes; new `/play` work must integrate with the existing agent framework.
3. **No `.cursor/rules`** — do not create this. Mario uses Claude Code.
4. **Secrets never committed** — use `.env.example` for documentation; real values via Fly secrets and GitHub Actions secrets.

### Before any code change
1. Run `npm run typecheck` — TypeScript is the safety net.
2. Run `npm test` — tests cover sanitize, rate-limit, and data integrity.
3. Run `npm run lint` — ESLint (src/ only; `next lint` was removed in Next 16).

### Known environment facts
- `lucide-react@1.x` — no `Github` or `Linkedin` icons; use `GitBranch` / `Link2`.
- Tailwind v4 — no `tailwind.config.js`; tokens in `globals.css @theme {}`.
- tRPC v11 — transformer on the `httpBatchLink`, not root client config.
- Next.js 16 — no `next lint` command; `jsx` in tsconfig is `react-jsx` (set by build).

### ADR index
See `docs/adr/` for the four architecture decisions that explain non-obvious choices (Fly vs AWS, SQLite, print CSS, tRPC).
